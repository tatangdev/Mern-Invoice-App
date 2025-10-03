// Application route paths
// Use these constants instead of hardcoding URLs like '/login'
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/management/products',
  INVOICES: '/management/invoices',
  TRANSACTIONS: '/management/transactions',
  PROFILE: '/management/profile'
};

// Keys used to store data in browser's localStorage
// Use these to save/retrieve user data and authentication token
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
};

// API endpoint paths (not used directly - see services/api.ts)
// Kept here for reference and consistency
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me'
  },
  PRODUCTS: '/api/products',
  INVOICES: '/api/invoices',
  TRANSACTIONS: '/api/transactions'
};
