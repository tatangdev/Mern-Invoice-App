const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  throw new Error('REACT_APP_API_URL environment variable is not defined');
}

async function fetchApi(endpoint, options) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

async function uploadFile(endpoint, file, fieldName) {
  const token = localStorage.getItem('token');

  const formData = new FormData();
  formData.append(fieldName, file);

  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers,
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Upload failed');
  }

  return data;
}

export const authApi = {
  login(email, password) {
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register(email, password, fullName) {
    return fetchApi('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName })
    });
  },

  getCurrentUser() {
    return fetchApi('/api/auth/me', {});
  },

  updateProfileImage(file) {
    return uploadFile('/api/auth/profile-image', file, 'profileImage');
  },

  updateCoverImage(file) {
    return uploadFile('/api/auth/cover-image', file, 'coverImage');
  }
};

export const productsApi = {
  getAll() {
    return fetchApi('/api/products', {});
  },

  getById(id) {
    return fetchApi(`/api/products/${id}`, {});
  },

  create(product) {
    return fetchApi('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },

  update(id, product) {
    return fetchApi(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
  },

  updateImage(id, file) {
    return uploadFile(`/api/products/${id}/image`, file, 'image');
  },

  delete(id) {
    return fetchApi(`/api/products/${id}`, {
      method: 'DELETE'
    });
  }
};

export const invoicesApi = {
  getAll() {
    return fetchApi('/api/invoices', {});
  },

  getById(id) {
    return fetchApi(`/api/invoices/${id}`, {});
  },

  create(invoice) {
    return fetchApi('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice)
    });
  },

  update(id, invoice) {
    return fetchApi(`/api/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice)
    });
  },

  delete(id) {
    return fetchApi(`/api/invoices/${id}`, {
      method: 'DELETE'
    });
  }
};

export const transactionsApi = {
  getAll() {
    return fetchApi('/api/transactions', {});
  }
};
