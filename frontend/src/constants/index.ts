export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/management/products',
  INVOICES: '/management/invoices',
  PROFILE: '/management/profile'
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me'
  },
  PRODUCTS: '/api/products',
  INVOICES: '/api/invoices'
};
