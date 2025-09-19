// Currency conversion rates and location-based pricing
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate from USD
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.00 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.55 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.50 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.25 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 5.98 },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', rate: 17.89 },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rate: 4.05 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 18.50 },
};

// Country to currency mapping
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD', CA: 'USD', // North America
  GB: 'GBP', IE: 'EUR', // UK & Ireland
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', // Europe
  AT: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR', CY: 'EUR',
  MT: 'EUR', SI: 'EUR', SK: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR',
  AU: 'AUD', NZ: 'AUD', // Oceania
  JP: 'JPY', // Japan
  IN: 'INR', // India
  BR: 'BRL', // Brazil
  MX: 'MXN', // Mexico
  PL: 'PLN', // Poland
  ZA: 'ZAR', // South Africa
};

export interface UserLocation {
  country: string;
  currency: string;
  timezone: string;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private userLocation: UserLocation | null = null;
  private detectionPromise: Promise<UserLocation> | null = null;

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  public async getUserLocation(): Promise<UserLocation> {
    if (this.userLocation) {
      return this.userLocation;
    }

    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    this.detectionPromise = this.detectUserLocation();
    this.userLocation = await this.detectionPromise;
    return this.userLocation;
  }

  private async detectUserLocation(): Promise<UserLocation> {
    // Get timezone from browser first
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    try {
      // Try to get location from a free IP geolocation service with better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 3000); // Reduced timeout to 3 seconds
      
      try {
        const response = await fetch('https://ipapi.co/json/', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.country_code) {
            const country = data.country_code;
            const currency = COUNTRY_TO_CURRENCY[country] || 'USD';
            
            return {
              country,
              currency,
              timezone: timezone || 'UTC'
            };
          }
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        // Silently handle all fetch errors including AbortError
        if (fetchError?.name !== 'AbortError') {
          console.warn('Location detection failed, using timezone fallback:', fetchError.message);
        }
      }
    } catch (error: any) {
      // Handle any other errors
      console.warn('Location detection failed, using timezone fallback');
    }

    // Fallback to timezone-based detection
    const country = this.getCountryFromTimezone(timezone);
    const currency = COUNTRY_TO_CURRENCY[country] || 'USD';

    return {
      country,
      currency,
      timezone: timezone || 'UTC'
    };
  }

  private getCountryFromTimezone(timezone: string): string {
    // Simple timezone to country mapping
    const timezoneToCountry: Record<string, string> = {
      'America/New_York': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Los_Angeles': 'US',
      'America/Toronto': 'CA',
      'Europe/London': 'GB',
      'Europe/Berlin': 'DE',
      'Europe/Paris': 'FR',
      'Europe/Madrid': 'ES',
      'Europe/Rome': 'IT',
      'Europe/Amsterdam': 'NL',
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
      'Asia/Tokyo': 'JP',
      'Asia/Kolkata': 'IN',
      'America/Sao_Paulo': 'BR',
      'America/Mexico_City': 'MX',
      'Europe/Warsaw': 'PL'
    };

    return timezoneToCountry[timezone] || 'US';
  }

  public convertPrice(priceInCents: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) {
      return priceInCents;
    }

    const fromRate = SUPPORTED_CURRENCIES[fromCurrency]?.rate || 1;
    const toRate = SUPPORTED_CURRENCIES[toCurrency]?.rate || 1;
    
    // Convert to USD first, then to target currency
    const usdPrice = priceInCents / fromRate;
    const convertedPrice = usdPrice * toRate;
    
    return Math.round(convertedPrice);
  }

  public formatPrice(priceInCents: number, currency: string): string {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    if (!currencyInfo) {
      return `$${(priceInCents / 100).toFixed(2)}`;
    }

    const price = priceInCents / 100;
    
    // Special formatting for JPY (no decimals)
    if (currency === 'JPY') {
      return `${currencyInfo.symbol}${Math.round(price).toLocaleString()}`;
    }
    
    return `${currencyInfo.symbol}${price.toFixed(2)}`;
  }

  public getSupportedCurrencies(): CurrencyInfo[] {
    return Object.values(SUPPORTED_CURRENCIES);
  }
}