// Get API URL from environment variable (.env file)
const API_URL = process.env.REACT_APP_API_URL;

// Check if API URL is configured
if (!API_URL) {
  throw new Error('REACT_APP_API_URL environment variable is not defined');
}

// Helper function to make API requests
async function fetchApi(endpoint, options) {
  // Get authentication token from browser storage
  const token = localStorage.getItem('token');

  // Set up request headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {})
  };

  // Add Authorization header if user is logged in
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Make the HTTP request to the API
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Convert response to JSON
  const data = await response.json();

  // Check if request was successful
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// Authentication API functions
export const authApi = {
  // Login user
  login(email, password) {
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Register new user
  register(email, password, fullName) {
    return fetchApi('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName })
    });
  },

  // Get current logged in user
  getCurrentUser() {
    return fetchApi('/api/auth/me', {});
  }
};

// Products API functions
export const productsApi = {
  // Get all products
  getAll() {
    return fetchApi('/api/products', {});
  },

  // Get single product by ID
  getById(id) {
    return fetchApi(`/api/products/${id}`, {});
  },

  // Create new product
  create(product) {
    return fetchApi('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },

  // Update existing product
  update(id, product) {
    return fetchApi(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
  },

  // Delete product
  delete(id) {
    return fetchApi(`/api/products/${id}`, {
      method: 'DELETE'
    });
  }
};

// Invoices API functions
export const invoicesApi = {
  // Get all invoices
  getAll() {
    return fetchApi('/api/invoices', {});
  },

  // Get single invoice by ID
  getById(id) {
    return fetchApi(`/api/invoices/${id}`, {});
  },

  // Create new invoice
  create(invoice) {
    return fetchApi('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice)
    });
  },

  // Update existing invoice
  update(id, invoice) {
    return fetchApi(`/api/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice)
    });
  },

  // Delete invoice
  delete(id) {
    return fetchApi(`/api/invoices/${id}`, {
      method: 'DELETE'
    });
  }
};

// Transactions API functions
export const transactionsApi = {
  // Get all transactions
  getAll() {
    return fetchApi('/api/transactions', {});
  }
};
