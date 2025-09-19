# SocialGrab - Video Downloader Application

## Overview

This is a full-stack web application for downloading videos from social media platforms (Facebook, TikTok, Pinterest, and Instagram). The application provides a modern, user-friendly interface with a solid red-pink color scheme for pasting video URLs, previewing video information, selecting download quality, and managing download history. Built with React frontend and Node.js/Express backend, it features real-time download progress tracking, comprehensive UI component library, subscription system with Stripe integration, and actual video downloading using yt-dlp.

**DEPLOYMENT STATUS (August 16, 2025)**: Application has both Node.js and PHP backend implementations. Node.js version runs in Replit development environment. Complete PHP backend package created for Asura hosting deployment with zero-config setup - just requires Python 3 + yt-dlp installation from hosting provider.

## Recent Changes (August 27, 2025)

### Latest Session Updates (August 27, 2025 - Morning)
- ✓ Fixed critical cPanel deployment EADDRINUSE port conflicts
- ✓ Implemented smart environment detection for cPanel vs development
- ✓ Created automatic port discovery system (uses ports 9000-6667 range)
- ✓ Completely removed demo mode functionality from application
- ✓ Enhanced yt-dlp integration with cookie support and retry logic
- ✓ Fixed "Failed to fetch" errors with better error handling
- ✓ Created production-ready cPanel deployment package in cpanel-deployment/
- ✓ Tested deployment successfully - server starts on available ports
- ✓ Updated deployment instructions with working solution
- ✓ Resolved all port scanning issues for shared hosting environment

## Previous Changes (August 16, 2025)

### Latest Session Updates (August 16, 2025 - Evening)
- ✓ Implemented secure admin authentication system
- ✓ Created admin user with credentials (username: tyl24, password: Kundakinde001!)
- ✓ Added bcrypt password hashing for security
- ✓ Built admin login page (/admin) with form validation
- ✓ Protected all admin routes with authentication middleware
- ✓ Added session management with Express sessions
- ✓ Implemented authentication checks and redirects
- ✓ Created useAuth hook for client-side authentication
- ✓ Added logout functionality for admin users
- ✓ Secured admin dashboard behind authentication
- ✓ Enhanced PHP backend with complete API coverage
- ✓ Added comprehensive error handling and fallback responses
- ✓ Implemented all admin endpoints (stats, analytics, subscription plans)
- ✓ Created robust video info and download functionality
- ✓ Built production-ready .htaccess with URL rewriting
- ✓ Added security headers and performance optimizations
- ✓ Enhanced deployment instructions with troubleshooting
- ✓ Created dedicated ads table with proper schema
- ✓ Implemented public API endpoints for config and ads
- ✓ Added automatic database table creation on first run

### Earlier Session Updates (August 16, 2025)
- ✓ Removed animations from mobile app popup for cleaner presentation
- ✓ Configured Google Play Store link to be manageable through admin dashboard
- ✓ Added email gateway system for iOS app notifications
- ✓ Created mobile app configuration section in admin dashboard
- ✓ Implemented iOS notification subscription functionality with email validation
- ✓ Removed redundant mobile features section from footer
- ✓ Enhanced mobile app modal with configurable store URLs
- ✓ Added dynamic email notification system based on admin settings
- ✓ Updated admin dashboard with mobile app settings management
- ✓ Integrated configuration-driven mobile app functionality
- ✓ Added mobile app section toggle - footer hides mobile section when turned off in admin
- ✓ Created conditional footer layout that adapts based on mobile app settings
- ✓ Documented dual backend architecture (Node.js + PHP)

### Previous Changes (August 12, 2025)

- ✓ Implemented solid red-pink color scheme throughout the application
- ✓ Installed yt-dlp and FFmpeg for real video downloading functionality  
- ✓ Updated video downloader service to use real yt-dlp integration
- ✓ Enhanced error handling and progress tracking for downloads
- ✓ Configured asynchronous download processing
- ✓ Fixed all TypeScript compilation errors
- ✓ Successfully tested real video downloading from TikTok
- ✓ Added social media links to footer (Facebook, X/Twitter, Instagram)
- ✓ Created comprehensive content pages (Help Center, Contact Us, Privacy Policy, Terms of Service)
- ✓ Added routing and navigation for all content pages

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Comprehensive shadcn/ui component system with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Dual Backend System**: Both Node.js and PHP implementations available
- **Primary (Node.js)**: TypeScript with Express.js framework, running in development
- **Alternative (PHP)**: Complete PHP backend with models, routes, and services
- **API Design**: RESTful API endpoints with structured error handling
- **Video Processing**: yt-dlp integration for multi-platform video downloading
- **File Storage**: Local file system storage for downloaded videos
- **Deployment Options**: Node.js for Replit, PHP for traditional hosting (Asura)

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless driver
- **Schema**: Structured tables for users and downloads with proper relationships
- **Storage Strategy**: Dual storage approach - in-memory storage for development/testing and PostgreSQL for production

### Development Tools
- **Build System**: Vite with React plugin and development server integration
- **Type Safety**: Comprehensive TypeScript configuration with strict mode
- **Code Quality**: ESLint and Prettier integration (implied by project structure)
- **Development Experience**: Hot module replacement and error overlay for development

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection Management**: Environment-based database URL configuration

### Video Processing
- **yt-dlp**: Command-line video downloader for extracting video information and downloading from multiple platforms
- **Supported Platforms**: Facebook, TikTok, Pinterest, and Instagram video extraction

### UI Component Libraries
- **Radix UI**: Unstyled, accessible UI primitives for complex components including Dialog for mobile app modal
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon sets for platform-specific icons (Facebook, TikTok, Pinterest, Google Play, Apple)
- **Mobile App Modal**: Professional presentation component with app store styling and feature showcase

### Development Dependencies
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **ESBuild**: Fast JavaScript bundler for production builds

### Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Express Session**: Session middleware for user state management

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & class-variance-authority**: Dynamic CSS class generation
- **nanoid**: Unique ID generation for various entities