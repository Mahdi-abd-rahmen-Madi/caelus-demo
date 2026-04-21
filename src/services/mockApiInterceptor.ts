// Mock API Interceptor - Intercepts all API calls and returns mock data

// Setup axios interceptor to mock all API calls
export const setupMockApiInterceptor = () => {
  console.log('Setting up mock API interceptor for demo mode');
  
  // Mock axios interceptors (simplified for demo)
  // In a real implementation, this would intercept axios requests
  // For the demo, we rely on the mock API functions directly
  
  console.log('Mock API interceptor setup complete');
  console.log('All API calls will now use mock data');
};

// Export mock functions for direct use
export * from './demoApi';

// Mock utility functions
export const mockApiUtils = {
  // Simulate network delay
  delay: (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate mock coordinates around Avignon
  getAvignonCoordinates: () => ({
    lng: 4.8059 + (Math.random() - 0.5) * 0.1,
    lat: 43.9493 + (Math.random() - 0.5) * 0.1
  }),
  
  // Generate mock parcel ID
  generateParcelId: () => `84000_${Math.floor(Math.random() * 9999) + 1}`,
  
  // Log mock API calls for debugging
  logApiCall: (endpoint: string, params?: any) => {
    console.log(`Mock API Call: ${endpoint}`, params);
  }
};
