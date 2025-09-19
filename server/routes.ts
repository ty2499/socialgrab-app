import type { Express, Request, Response } from "express";
import express from "express";
import cors from "cors";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { VideoDownloaderService } from "./services/video-downloader-fixed";
import { 
  videoUrlSchema, 
  insertDownloadSchema, 
  purchaseFormSchema, 
  otpVerificationSchema,
  insertPremiumUserSchema,
  insertOtpVerificationSchema 
} from "@shared/schema";
import { promises as fs } from "fs";
import { createReadStream } from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { premiumUserService } from "./services/premiumUserService";
import { emailService } from "./services/emailService";
import { supabaseEmailService } from "./services/supabaseEmailService";
import emailRoutes from "./routes/emailRoutes";
import Stripe from "stripe";

// Extend Express Session to include custom properties
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
    isAdmin?: boolean;
  }
}

const videoDownloader = new VideoDownloaderService();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20" as any,
});

// Login schema for validation
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// Admin credentials from environment variables
function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD_HASH;
  
  if (!username || !password) {
    throw new Error('Missing admin credentials: ADMIN_USERNAME and ADMIN_PASSWORD_HASH must be set');
  }
  
  return {
    username,
    password,
    id: 'env-admin-001',
    isAdmin: true
  };
}

// Admin authentication - database first, environment fallback
async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  // First try database authentication
  try {
    const user = await storage.getUserByUsername(username);
    if (user && user.isAdmin) {
      return await bcrypt.compare(password, user.password);
    }
  } catch (error) {
    console.warn('Database authentication failed, trying environment credentials:', error);
  }
  
  // Fallback to environment credentials if database fails
  try {
    const adminCreds = getAdminCredentials();
    if (username === adminCreds.username) {
      return await bcrypt.compare(password, adminCreds.password);
    }
  } catch (error) {
    console.error('Environment admin authentication failed:', error);
  }
  
  return false;
}

// Middleware to check if user is authenticated admin
function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.session?.userId || !req.session?.isAdmin) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Configure CORS for production deployment
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'])
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  
  // Authentication routes (keeping existing admin auth)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const isAuthenticated = await authenticateAdmin(username, password);
      if (!isAuthenticated) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      let user = null;
      try {
        const dbUser = await storage.getUserByUsername(username);
        if (dbUser) {
          user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email || 'admin@socialgrab.app',
            isAdmin: dbUser.isAdmin || false,
            password: dbUser.password
          };
        }
      } catch (error) {
        console.warn('Database user lookup failed, using environment admin:', error);
      }
      
      if (!user) {
        try {
          const adminCreds = getAdminCredentials();
          user = {
            id: adminCreds.id,
            username: adminCreds.username,
            email: 'admin@socialgrab.app',
            isAdmin: true,
            password: adminCreds.password
          };
        } catch (error) {
          return res.status(500).json({ message: "Admin configuration error" });
        }
      }
      
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAdmin = user.isAdmin || false;
      
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session save failed" });
        }
        
        res.cookie('adminAuth', 'true', { 
          httpOnly: false, 
          maxAge: 1000 * 60 * 60 * 24,
          sameSite: 'lax'
        });
        
        res.json({ 
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            email: user.email || 'admin@socialgrab.app',
            isAdmin: user.isAdmin
          }
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err?: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      if (req.session.userId === 'env-admin-001') {
        return res.json({
          id: req.session.userId,
          username: req.session.username,
          email: 'admin@socialgrab.app',
          isAdmin: req.session.isAdmin
        });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      console.error('Auth check error:', error);
      if (req.session.username && req.session.userId) {
        return res.json({
          id: req.session.userId,
          username: req.session.username,
          email: 'admin@socialgrab.app',
          isAdmin: req.session.isAdmin || true
        });
      }
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  // Get recent downloads
  app.get("/api/downloads", async (req, res) => {
    try {
      const downloads = await storage.getRecentDownloads(10);
      res.json(downloads);
    } catch (error) {
      console.warn("Database not available for downloads:", (error as Error).message);
      res.json([]);
    }
  });

  // Get video info
  app.post("/api/video/info", async (req, res) => {
    try {
      const { url } = videoUrlSchema.parse(req.body);
      
      const platform = videoDownloader.detectPlatform(url);
      if (!platform) {
        return res.status(400).json({ 
          message: "Unsupported platform. Please use Facebook, TikTok, Pinterest, or Instagram URLs." 
        });
      }

      const videoInfo = await videoDownloader.getVideoInfo(url);
      
      res.json({
        ...videoInfo,
        platform,
        url
      });
    } catch (error) {
      console.error("Error getting video info:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to get video information" 
      });
    }
  });

  // Download video
  app.post("/api/video/download", async (req, res) => {
    try {
      const { url, quality } = videoUrlSchema.parse(req.body);
      
      const platform = videoDownloader.detectPlatform(url);
      if (!platform) {
        return res.status(400).json({ 
          message: "Unsupported platform. Please use Facebook, TikTok, Pinterest, or Instagram URLs." 
        });
      }

      // Check if quality requires subscription
      if ((quality === "2k" || quality === "4k") && !req.headers.authorization) {
        return res.status(402).json({ 
          message: "Premium subscription required for 2K and 4K video downloads.",
          upgradeRequired: true,
          requiredPlan: "premium"
        });
      }

      // Get video info first
      const videoInfo = await videoDownloader.getVideoInfo(url);
      
      if (!videoInfo) {
        return res.status(400).json({ message: "Failed to get video information" });
      }

      // Generate download ID 
      const downloadId = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store download record
      let dbId = downloadId;
      try {
        const created = await storage.createDownload({
          url,
          platform,
          quality,
          title: videoInfo.title,
          status: "pending",
          fileSize: videoInfo.formats.find(f => f.quality === quality)?.fileSize || 0
        });
        dbId = created.id;
      } catch (error) {
        console.warn("Failed to store download record:", error);
      }

      // Start download process
      res.json({ 
        downloadId: dbId,
        message: "Download started",
        videoInfo
      });

      // Process download in background
      try {
        const downloadResult = await videoDownloader.downloadVideoTemporarily(
          url, 
          quality,
          async (progress) => {
            try {
              await storage.updateDownload(dbId, { status: "downloading" });
            } catch (error) {
              console.warn("Failed to update download progress:", error);
            }
          }
        );

        // Update download status to completed with file path
        try {
          await storage.updateDownload(dbId, { 
            status: "completed", 
            filePath: downloadResult.filePath
          });
        } catch (error) {
          console.warn("Failed to update download status:", error);
        }

        // Clean up file after some time
        setTimeout(() => {
          downloadResult.cleanup().catch(console.error);
        }, 300000); // 5 minutes

      } catch (error) {
        console.error("Download failed:", error);
        try {
          await storage.updateDownload(dbId, { status: "failed" });
        } catch (updateError) {
          console.warn("Failed to update download status:", updateError);
        }
      }

    } catch (error) {
      console.error("Error starting download:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to start download" 
      });
    }
  });

  // Get download status
  app.get("/api/video/download/:downloadId", async (req, res) => {
    try {
      const { downloadId } = req.params;
      let download: any = null;
      
      try {
        download = await storage.getDownload(downloadId);
      } catch (dbError) {
        console.warn("Database not available for download status, checking file system:", dbError);
        
        // Fallback: Check if file exists in temp directory
        const tempDir = path.join(process.cwd(), "temp_downloads");
        try {
          const files = await fs.readdir(tempDir);
          const timestamp = downloadId.includes('_') ? downloadId.split('_')[1] : downloadId;
          const matchingFile = files.find(file => 
            file.includes(timestamp.substring(0, 8)) || 
            file.includes(downloadId.substring(0, 8))
          );
          
          if (matchingFile) {
            const filePath = path.join(tempDir, matchingFile);
            const stats = await fs.stat(filePath);
            
            // Return a synthetic download object when database is not available
            return res.json({
              id: downloadId,
              title: "Downloaded Video",
              status: "completed",
              downloadProgress: 100,
              fileSize: stats.size,
              quality: "high",
              platform: "unknown",
              url: "",
              createdAt: new Date().toISOString(),
              completedAt: new Date().toISOString()
            });
          }
        } catch (fsError) {
          console.warn("File system check failed:", fsError);
        }
        
        return res.status(404).json({ message: "Download not found" });
      }
      
      if (!download) {
        return res.status(404).json({ message: "Download not found" });
      }

      // Remove sensitive fields before sending response
      const { filePath, ...safeDownload } = download;
      res.json(safeDownload);
    } catch (error) {
      console.error("Error getting download status:", error);
      res.status(500).json({ message: "Failed to get download status" });
    }
  });

  // Serve downloaded file to user
  app.get("/api/downloads/:downloadId/file", async (req, res) => {
    try {
      const { downloadId } = req.params;
      
      // Get download record
      let download: any = null;
      try {
        download = await storage.getDownload(downloadId);
      } catch (error) {
        console.warn("Database not available for download lookup:", error);
      }
      
      // Fallback: Find file in temp directory
      const tempDir = path.join(process.cwd(), "temp_downloads");
      let filePath;
      let filename = `video_${Date.now()}.mp4`;
      
      if (download && download.status === "completed" && download.filePath) {
        // Use database info if available
        filePath = download.filePath;
        const safeTitle = download.title ? 
          download.title.replace(/[^a-zA-Z0-9\s\-_\.]/g, '').trim().substring(0, 100) : 
          `video_${Date.now()}`;
        filename = `${safeTitle}.mp4`;
      } else {
        // Fallback: Find file by looking for downloadId pattern in filenames
        try {
          const files = await fs.readdir(tempDir);
          const timestamp = downloadId.includes('_') ? downloadId.split('_')[1] : downloadId;
          const matchingFile = files.find(file => 
            file.includes(timestamp.substring(0, 8)) || 
            file.includes(downloadId.substring(0, 8))
          );
          
          if (!matchingFile) {
            return res.status(404).json({ message: "File not found or expired" });
          }
          
          filePath = path.join(tempDir, matchingFile);
        } catch (fsError) {
          return res.status(404).json({ message: "File not found" });
        }
      }
      
      // Verify file exists
      try {
        const stats = await fs.stat(filePath);
        
        // Set download headers
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Stream the file to user
        const readStream = createReadStream(filePath);
        
        // Handle streaming errors
        readStream.on('error', (error) => {
          console.error('Stream error:', error);
          if (!res.headersSent) {
            res.status(500).json({ message: "Error serving file" });
          }
        });
        
        // Handle client disconnect
        res.on('close', () => {
          readStream.destroy();
        });
        
        readStream.pipe(res);
        
        // Clean up file after streaming completes successfully
        readStream.on('end', async () => {
          try {
            await fs.unlink(filePath);
            // Mark download as served if we have download info
            if (download) {
              try {
                await storage.updateDownload(download.id, { status: "served" });
              } catch (error) {
                console.warn('Could not update download status to served:', error);
              }
            }
          } catch (error) {
            console.error('Failed to cleanup file after serving:', error);
          }
        });
        
      } catch (statError) {
        return res.status(404).json({ message: "File no longer exists" });
      }
      
    } catch (error) {
      console.error("Error serving download:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Get public configuration
  app.get("/api/public/config", async (req, res) => {
    try {
      const configs = await storage.getAppConfig();
      res.json(configs);
    } catch (error) {
      console.warn("Database not available for configs:", (error as Error).message);
      res.json([
        { id: "ga4_measurement_id", key: "ga4_measurement_id", value: process.env.GOOGLE_ANALYTICS_ID || "", description: "Google Analytics 4 Measurement ID", type: "string", category: "analytics" }
      ]);
    }
  });

  // Get public ads
  app.get("/api/public/ads", async (req, res) => {
    try {
      const ads = await storage.getAdConfigs();
      res.json(ads);
    } catch (error) {
      console.warn("Database not available for ads:", (error as Error).message);
      // Fallback: return comprehensive ad configuration for all placements
      res.json([
        {
          id: 'fallback-header',
          placement: 'header',
          adType: 'adsense',
          isEnabled: true,
          adSenseSlot: '1234567890',
          adCode: '',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'fallback-footer', 
          placement: 'footer',
          adType: 'adsense',
          isEnabled: true,
          adSenseSlot: '1234567891',
          adCode: '',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'fallback-sidebar',
          placement: 'sidebar', 
          adType: 'adsense',
          isEnabled: true,
          adSenseSlot: '1234567892',
          adCode: '',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'fallback-interstitial',
          placement: 'interstitial',
          adType: 'adsense',
          isEnabled: true,
          adSenseSlot: '1234567893',
          adCode: '',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'fallback-extra-interstitial',
          placement: 'extra-interstitial',
          adType: 'adsense',
          isEnabled: true,
          adSenseSlot: '1234567894',
          adCode: '',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'fallback-post-download',
          placement: 'post-download',
          adType: 'image',
          isEnabled: true,
          imageDesktopUrl: '/uploads/ad-1758280113139-234278307.webp',
          imageTabletUrl: '/uploads/ad-1758280115570-837739679.webp',
          imageMobileUrl: '/uploads/ad-1758280122545-737261452.webp',
          clickUrl: '',
          altText: 'Advertisement',
          updatedAt: new Date().toISOString()
        }
      ]);
    }
  });

  // Plan ID mapping for security and validation
  const PLAN_MAPPING = {
    "plan_basic_monthly": {
      stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || "price_basic_monthly_default",
      name: "Basic Monthly",
      description: "Essential features for regular video downloads",
      price: 399, // $3.99 in cents
      currency: "usd",
      interval: "month",
      features: [
        "Download videos up to 2K quality",
        "All supported platforms",
        "Ad-free browsing experience",
        "Standard download speeds"
      ],
      maxVideoQuality: "2k",
      removeAds: true,
      isActive: true
    },
    "plan_premium_monthly": {
      stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "price_premium_monthly_default",
      name: "Premium Monthly",
      description: "Full access to all premium features and highest quality",
      price: 999, // $9.99 in cents
      currency: "usd",
      interval: "month",
      features: [
        "Download videos up to 4K quality",
        "All supported platforms",
        "Ad-free browsing experience",
        "Priority download speeds",
        "Priority email support"
      ],
      maxVideoQuality: "4k",
      removeAds: true,
      isActive: true
    }
  };

  // Get subscription plans with real pricing from Stripe
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      // Try to fetch real prices from Stripe first
      let stripeBasicPrice = null;
      let stripePremiumPrice = null;

      try {
        // Fetch basic price from Stripe
        if (process.env.STRIPE_BASIC_PRICE_ID) {
          stripeBasicPrice = await stripe.prices.retrieve(process.env.STRIPE_BASIC_PRICE_ID, {
            expand: ['product']
          });
        }

        // Fetch premium price from Stripe
        if (process.env.STRIPE_PREMIUM_PRICE_ID) {
          stripePremiumPrice = await stripe.prices.retrieve(process.env.STRIPE_PREMIUM_PRICE_ID, {
            expand: ['product']
          });
        }
      } catch (stripeError) {
        console.warn("Could not fetch individual prices from Stripe:", stripeError);
      }

      // Build plans using real Stripe data if available, otherwise use defaults
      const plans = [
        {
          id: "plan_basic_monthly",
          name: PLAN_MAPPING.plan_basic_monthly.name,
          description: PLAN_MAPPING.plan_basic_monthly.description,
          price: stripeBasicPrice?.unit_amount || PLAN_MAPPING.plan_basic_monthly.price,
          currency: stripeBasicPrice?.currency || PLAN_MAPPING.plan_basic_monthly.currency,
          interval: PLAN_MAPPING.plan_basic_monthly.interval,
          features: PLAN_MAPPING.plan_basic_monthly.features,
          maxVideoQuality: PLAN_MAPPING.plan_basic_monthly.maxVideoQuality,
          removeAds: PLAN_MAPPING.plan_basic_monthly.removeAds,
          isActive: stripeBasicPrice?.active || PLAN_MAPPING.plan_basic_monthly.isActive
        },
        {
          id: "plan_premium_monthly",
          name: PLAN_MAPPING.plan_premium_monthly.name,
          description: PLAN_MAPPING.plan_premium_monthly.description,
          price: stripePremiumPrice?.unit_amount || PLAN_MAPPING.plan_premium_monthly.price,
          currency: stripePremiumPrice?.currency || PLAN_MAPPING.plan_premium_monthly.currency,
          interval: PLAN_MAPPING.plan_premium_monthly.interval,
          features: PLAN_MAPPING.plan_premium_monthly.features,
          maxVideoQuality: PLAN_MAPPING.plan_premium_monthly.maxVideoQuality,
          removeAds: PLAN_MAPPING.plan_premium_monthly.removeAds,
          isActive: stripePremiumPrice?.active || PLAN_MAPPING.plan_premium_monthly.isActive
        }
      ];

      if (!stripeBasicPrice || !stripePremiumPrice) {
        console.warn("Using fallback pricing for missing Stripe prices. Configure STRIPE_BASIC_PRICE_ID and STRIPE_PREMIUM_PRICE_ID environment variables.");
      }

      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans from Stripe:", error);
      
      // Return fallback plans if everything fails
      const fallbackPlans = Object.entries(PLAN_MAPPING).map(([id, plan]) => ({
        id,
        ...plan,
        isActive: false // Mark as inactive since these are fallbacks
      }));
      
      res.json(fallbackPlans);
    }
  });

  // Create subscription endpoint
  app.post("/api/create-subscription", async (req, res) => {
    try {
      // Ensure Stripe is initialized before processing subscriptions
      await initializeStripe();

      const { planId, email, name } = req.body;

      if (!planId || !email || !name) {
        return res.status(400).json({ message: "Missing required fields: planId, email, name" });
      }

      // Validate planId against our mapping for security
      const planMapping = PLAN_MAPPING[planId as keyof typeof PLAN_MAPPING];
      if (!planMapping) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      // Use the mapped Stripe Price ID
      const stripePriceId = planMapping.stripePriceId;

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        name,
      });

      // Create subscription using the validated Stripe Price ID
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: stripePriceId, // Use validated Stripe price ID
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      const latest_invoice = subscription.latest_invoice as any;
      const payment_intent = latest_invoice?.payment_intent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: payment_intent?.client_secret,
        customerId: customer.id,
        status: subscription.status
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Error creating subscription: " + error.message });
    }
  });

  // Create payment intent for one-time payments (lifetime plans)
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = "usd", planId, email, name } = req.body;

      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          planId: planId || 'unknown',
          email: email || 'unknown',
          name: name || 'unknown'
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Get or create Stripe products and prices (idempotent)
  const setupStripeProductsOnce = async () => {
    try {
      // Check if we already have price IDs set in environment
      if (process.env.STRIPE_BASIC_PRICE_ID && process.env.STRIPE_PREMIUM_PRICE_ID) {
        console.log("Using existing price IDs from environment variables");
        return;
      }

      console.log("Setting up Stripe products and prices...");
      
      let basicPrice = null;
      let premiumPrice = null;

      // Try to find existing products by metadata first (idempotent)
      const existingProducts = await stripe.products.list({
        limit: 100
      });

      const basicProduct = existingProducts.data.find(p => p.metadata.plan_id === 'plan_basic_monthly');
      const premiumProduct = existingProducts.data.find(p => p.metadata.plan_id === 'plan_premium_monthly');

      // Get or create basic plan
      if (basicProduct) {
        console.log("Found existing basic product:", basicProduct.id);
        const prices = await stripe.prices.list({ product: basicProduct.id, limit: 10 });
        basicPrice = prices.data.find(p => p.metadata.plan_id === 'plan_basic_monthly' && p.active);
        if (!basicPrice) {
          basicPrice = await stripe.prices.create({
            product: basicProduct.id,
            unit_amount: PLAN_MAPPING.plan_basic_monthly.price,
            currency: PLAN_MAPPING.plan_basic_monthly.currency,
            recurring: { interval: PLAN_MAPPING.plan_basic_monthly.interval as 'month' },
            metadata: { plan_id: 'plan_basic_monthly' }
          });
        }
      } else {
        console.log("Creating new basic product and price");
        const newBasicProduct = await stripe.products.create({
          name: PLAN_MAPPING.plan_basic_monthly.name,
          description: PLAN_MAPPING.plan_basic_monthly.description,
          metadata: {
            plan_id: 'plan_basic_monthly',
            features: JSON.stringify(PLAN_MAPPING.plan_basic_monthly.features)
          }
        });

        basicPrice = await stripe.prices.create({
          product: newBasicProduct.id,
          unit_amount: PLAN_MAPPING.plan_basic_monthly.price,
          currency: PLAN_MAPPING.plan_basic_monthly.currency,
          recurring: { interval: PLAN_MAPPING.plan_basic_monthly.interval as 'month' },
          metadata: { plan_id: 'plan_basic_monthly' }
        });
      }

      // Get or create premium plan
      if (premiumProduct) {
        console.log("Found existing premium product:", premiumProduct.id);
        const prices = await stripe.prices.list({ product: premiumProduct.id, limit: 10 });
        premiumPrice = prices.data.find(p => p.metadata.plan_id === 'plan_premium_monthly' && p.active);
        if (!premiumPrice) {
          premiumPrice = await stripe.prices.create({
            product: premiumProduct.id,
            unit_amount: PLAN_MAPPING.plan_premium_monthly.price,
            currency: PLAN_MAPPING.plan_premium_monthly.currency,
            recurring: { interval: PLAN_MAPPING.plan_premium_monthly.interval as 'month' },
            metadata: { plan_id: 'plan_premium_monthly' }
          });
        }
      } else {
        console.log("Creating new premium product and price");
        const newPremiumProduct = await stripe.products.create({
          name: PLAN_MAPPING.plan_premium_monthly.name,
          description: PLAN_MAPPING.plan_premium_monthly.description,
          metadata: {
            plan_id: 'plan_premium_monthly',
            features: JSON.stringify(PLAN_MAPPING.plan_premium_monthly.features)
          }
        });

        premiumPrice = await stripe.prices.create({
          product: newPremiumProduct.id,
          unit_amount: PLAN_MAPPING.plan_premium_monthly.price,
          currency: PLAN_MAPPING.plan_premium_monthly.currency,
          recurring: { interval: PLAN_MAPPING.plan_premium_monthly.interval as 'month' },
          metadata: { plan_id: 'plan_premium_monthly' }
        });
      }

      console.log("✅ Stripe products and prices ready!");
      console.log("📝 Basic Plan Price ID:", basicPrice.id);
      console.log("📝 Premium Plan Price ID:", premiumPrice.id);

      // Update the PLAN_MAPPING with real price IDs for this session
      (PLAN_MAPPING.plan_basic_monthly as any).stripePriceId = basicPrice.id;
      (PLAN_MAPPING.plan_premium_monthly as any).stripePriceId = premiumPrice.id;

    } catch (error: any) {
      console.warn("Could not setup Stripe products:", error.message);
      console.warn("Using fallback price IDs. Subscriptions may fail until proper Stripe setup is complete.");
    }
  };

  // Run setup on server start and await completion
  let stripeSetupPromise: Promise<void> | null = null;
  const initializeStripe = async () => {
    if (!stripeSetupPromise) {
      stripeSetupPromise = setupStripeProductsOnce();
    }
    return stripeSetupPromise;
  };

  // Initialize immediately
  initializeStripe();

  // Configure multer for image uploads
  const uploadDir = path.join(process.cwd(), 'client', 'public', 'uploads');
  
  // Ensure upload directory exists
  fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

  const storage_multer = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Generate unique filename with timestamp and random string
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, 'ad-' + uniqueSuffix + extension);
    }
  });

  const upload = multer({ 
    storage: storage_multer,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Only allow safe image formats (no SVG to prevent XSS)
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'image/gif'
      ];
      
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const fileExtension = path.extname(file.originalname).toLowerCase();
      
      if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPG, PNG, WebP, and GIF images are allowed'));
      }
    }
  });

  // Image upload endpoint
  app.post("/api/admin/upload-image", requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Return the public URL path for the uploaded image
      const imageUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        imageUrl,
        filename: req.file.filename,
        size: req.file.size
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ 
        message: "Image upload failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin stats endpoint
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const [totalDownloads, totalUsers, downloadsToday, platformBreakdown] = await Promise.all([
        storage.getTotalDownloads().catch(() => 0),
        storage.getTotalUsers().catch(() => 0), 
        storage.getDownloadsToday().catch(() => 0),
        storage.getPlatformBreakdown().catch(() => ({}))
      ]);

      res.json({
        totalDownloads,
        totalUsers,
        downloadsToday,
        platformBreakdown
      });
    } catch (error) {
      console.error("Error getting admin stats:", error);
      res.json({
        totalDownloads: 0,
        totalUsers: 0,
        downloadsToday: 0,
        platformBreakdown: {}
      });
    }
  });

  // Admin analytics endpoint
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const analytics = await storage.getRecentAnalytics(50);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting analytics:", error);
      res.json([]);
    }
  });

  // Admin configuration endpoints
  app.get("/api/admin/config", requireAdmin, async (req, res) => {
    try {
      const configs = await storage.getAppConfig();
      res.json(configs);
    } catch (error) {
      console.error("Error getting admin config:", error);
      res.json([]);
    }
  });

  app.post("/api/admin/config", requireAdmin, async (req, res) => {
    try {
      const { key, value, description } = req.body;
      if (!key || !value) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      
      await storage.setAppConfig(key, value, description);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting admin config:", error);
      res.status(500).json({ message: "Failed to set configuration" });
    }
  });

  // Admin ads configuration endpoints  
  app.get("/api/admin/ads", requireAdmin, async (req, res) => {
    try {
      const ads = await storage.getAdConfigs();
      res.json(ads);
    } catch (error) {
      console.error("Error getting ad configs:", error);
      res.json([]);
    }
  });

  app.post("/api/admin/ads", requireAdmin, async (req, res) => {
    try {
      const { placement, adCode, adType, isEnabled, imageDesktopUrl, imageTabletUrl, imageMobileUrl, clickUrl, altText } = req.body;
      
      if (!placement) {
        return res.status(400).json({ message: "Placement is required" });
      }

      try {
        await storage.setAdConfig({
          placement,
          adCode: adCode || '',
          adType: adType || 'adsense',
          isEnabled: isEnabled !== false,
          imageDesktopUrl,
          imageTabletUrl, 
          imageMobileUrl,
          clickUrl,
          altText
        });
      } catch (dbError) {
        console.warn("Database not available for ad config, using fallback:", dbError);
        // Fallback: just log the configuration for now
        console.log("Ad config would be saved:", {
          placement, adType, isEnabled, imageDesktopUrl, imageTabletUrl, imageMobileUrl, clickUrl, altText
        });
      }
      
      res.json({ success: true, message: "Ad configuration processed successfully" });
    } catch (error) {
      console.error("Error setting ad config:", error);
      res.status(500).json({ message: "Failed to set ad configuration" });
    }
  });

  // Admin subscription plans endpoints
  app.get("/api/admin/subscription-plans", requireAdmin, async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error getting subscription plans:", error);
      res.json([]);
    }
  });

  app.post("/api/admin/subscription-plans", requireAdmin, async (req, res) => {
    try {
      const planData = req.body;
      await storage.createSubscriptionPlan(planData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      res.status(500).json({ message: "Failed to create subscription plan" });
    }
  });

  app.delete("/api/admin/subscription-plans/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSubscriptionPlan(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      res.status(500).json({ message: "Failed to delete subscription plan" });
    }
  });

  // Admin endpoint to reinitialize Stripe products (secured)
  app.post("/api/setup-stripe-products", async (req, res) => {
    // Basic security check - require a secret header for admin operations
    const adminSecret = req.headers['x-admin-secret'];
    if (!adminSecret || adminSecret !== 'stripe-admin-2024') {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: Admin access required" 
      });
    }

    try {
      console.log("Admin requested Stripe products setup...");
      await initializeStripe();
      
      res.json({
        success: true,
        message: "Stripe products and prices setup completed!",
        priceIds: {
          STRIPE_BASIC_PRICE_ID: PLAN_MAPPING.plan_basic_monthly.stripePriceId,
          STRIPE_PREMIUM_PRICE_ID: PLAN_MAPPING.plan_premium_monthly.stripePriceId
        }
      });
    } catch (error: any) {
      console.error("Error setting up Stripe products:", error);
      res.status(500).json({ 
        success: false,
        message: "Error setting up Stripe products: " + error.message 
      });
    }
  });

  return createServer(app);
}