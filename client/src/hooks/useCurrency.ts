import { useState, useEffect } from 'react';
import { CurrencyService, type UserLocation, type CurrencyInfo } from '@/utils/currency';

export function useCurrency() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  const currencyService = CurrencyService.getInstance();

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const location = await currencyService.getUserLocation();
        setUserLocation(location);
        // Always use USD as default currency regardless of detected location
        setSelectedCurrency('USD');
      } catch (error) {
        console.error('Failed to detect user location:', error);
        // Fallback to USD
        setSelectedCurrency('USD');
      } finally {
        setIsLoading(false);
      }
    };

    detectLocation();
  }, []);

  const convertPrice = (priceInCents: number, fromCurrency = 'USD') => {
    return currencyService.convertPrice(priceInCents, fromCurrency, selectedCurrency);
  };

  const formatPrice = (priceInCents: number) => {
    return currencyService.formatPrice(priceInCents, selectedCurrency);
  };

  const getSupportedCurrencies = (): CurrencyInfo[] => {
    return currencyService.getSupportedCurrencies();
  };

  return {
    userLocation,
    selectedCurrency,
    setSelectedCurrency,
    isLoading,
    convertPrice,
    formatPrice,
    getSupportedCurrencies
  };
}