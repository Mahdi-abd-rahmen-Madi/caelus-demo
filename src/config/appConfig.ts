export interface AppConfig {
  webVitals: {
    enabled: boolean;
    deferred: boolean;
    timeout: number;
  };
  performance: {
    codeSplitting: boolean;
    lazyLoading: boolean;
  };
  i18n: {
    defaultLanguage: 'fr' | 'en';
    supportedLanguages: ('fr' | 'en')[];
    persistLanguage: boolean;
  };
}

export const APP_CONFIG: AppConfig = {
  webVitals: {
    enabled: false, // Set to false to hide even in development
    deferred: true, // Use requestIdleCallback to avoid blocking
    timeout: 2000 // Timeout for deferred initialization
  },
  performance: {
    codeSplitting: true, // Enable code splitting for better performance
    lazyLoading: false, // Enable lazy loading of heavy components
  },
  i18n: {
    defaultLanguage: 'fr', // French as default language
    supportedLanguages: ['fr', 'en'], // Supported languages
    persistLanguage: true // Persist language preference in localStorage
  }
};
