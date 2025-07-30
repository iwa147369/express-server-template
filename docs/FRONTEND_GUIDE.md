# 🎨 Frontend Integration Guide

This guide provides everything you need to build a frontend application that interacts with the Retail Management API.

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🔧 API Client Setup](#-api-client-setup)
- [⚛️ React Integration](#️-react-integration)
- [🖖 Vue.js Integration](#-vuejs-integration)
- [📊 State Management](#-state-management)
- [✅ Form Validation](#-form-validation)
- [🎯 UI Components](#-ui-components)
- [⚡ Performance Optimization](#-performance-optimization)
- [🔒 Error Handling](#-error-handling)
- [📱 Mobile Considerations](#-mobile-considerations)

## 🚀 Quick Start

### 1. Install Dependencies

For React:
```bash
npm install axios react-query @tanstack/react-query formik yup
```

For Vue.js:
```bash
npm install axios @tanstack/vue-query vee-validate yup
```

### 2. Basic API Client

```javascript
// api/RetailAPI.js
class RetailAPI {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Products API
    getProducts = (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.request(`/products?${query}`);
    }

    getProductById = (productId) => {
        return this.request(`/products/id/${productId}`);
    }

    createProduct = (productData) => {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    updateProduct = (productId, updateData) => {
        return this.request(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    deleteProduct = (productId) => {
        return this.request(`/products/${productId}`, {
            method: 'DELETE'
        });
    }

    // Orders API
    getOrders = (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.request(`/orders?${query}`);
    }

    getOrderById = (orderId) => {
        return this.request(`/orders/id/${orderId}`);
    }

    createOrder = (orderData) => {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    updateOrder = (orderId, updateData) => {
        return this.request(`/orders/OrderID/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    deleteOrder = (orderId) => {
        return this.request(`/orders/OrderID/${orderId}`, {
            method: 'DELETE'
        });
    }

    // Transactions API
    getTransactions = (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.request(`/transactions?${query}`);
    }

    createTransaction = (transactionData) => {
        return this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    }

    getTransactionSummary = () => {
        return this.request('/transactions/summary');
    }

    // Batches API
    getBatches = (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.request(`/batches?${query}`);
    }

    getBatchesByProduct = (productId) => {
        return this.request(`/batches/product/${productId}`);
    }

    getBatchInventorySummary = () => {
        return this.request('/batches/inventory-summary');
    }

    // Order Details API
    getOrderDetails = (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return this.request(`/order-details?${query}`);
    }

    getOrderDetailsByOrderId = (orderId) => {
        return this.request(`/order-details/order/${orderId}`);
    }

    // System API
    getHealth = () => {
        return this.request('/health');
    }

    getApiInfo = () => {
        return this.request('/info');
    }
}

export default RetailAPI;
```

## 🔧 API Client Setup

### Environment Configuration

```javascript
// config/api.js
const API_CONFIG = {
    development: {
        baseURL: 'http://localhost:3000/api',
        timeout: 10000
    },
    production: {
        baseURL: 'https://your-api-domain.com/api',
        timeout: 15000
    }
};

export const getApiConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    return API_CONFIG[env];
};
```

### Enhanced API Client with Interceptors

```javascript
// api/EnhancedRetailAPI.js
import axios from 'axios';
import { getApiConfig } from '../config/api';

class EnhancedRetailAPI {
    constructor() {
        const config = getApiConfig();
        
        this.client = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                
                // Add request timestamp for debugging
                config.metadata = { startTime: new Date() };
                console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
                
                return config;
            },
            (error) => {
                console.error('Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => {
                const endTime = new Date();
                const duration = endTime - response.config.metadata.startTime;
                console.log(`✅ API Response: ${response.config.url} (${duration}ms)`);
                
                return response.data;
            },
            (error) => {
                const endTime = new Date();
                const duration = endTime - error.config?.metadata?.startTime;
                console.error(`❌ API Error: ${error.config?.url} (${duration}ms)`, error.response?.data);
                
                // Handle specific error cases
                if (error.response?.status === 401) {
                    // Redirect to login
                    localStorage.removeItem('auth_token');
                    window.location.href = '/login';
                }
                
                return Promise.reject(error.response?.data || error);
            }
        );
    }

    // Products
    products = {
        getAll: (params) => this.client.get('/products', { params }),
        getById: (id) => this.client.get(`/products/id/${id}`),
        getLowStock: () => this.client.get('/products/low-stock'),
        filter: (filters) => this.client.get('/products/filter', { params: filters }),
        create: (data) => this.client.post('/products', data),
        update: (id, data) => this.client.put(`/products/${id}`, data),
        updateStock: (id, stockData) => this.client.patch(`/products/${id}/stock`, stockData),
        delete: (id) => this.client.delete(`/products/${id}`)
    };

    // Orders
    orders = {
        getAll: (params) => this.client.get('/orders', { params }),
        getById: (id) => this.client.get(`/orders/id/${id}`),
        filter: (filters) => this.client.get('/orders/filter', { params: filters }),
        create: (data) => this.client.post('/orders', data),
        update: (id, data) => this.client.put(`/orders/OrderID/${id}`, data),
        delete: (id) => this.client.delete(`/orders/OrderID/${id}`)
    };

    // Transactions
    transactions = {
        getAll: (params) => this.client.get('/transactions', { params }),
        getById: (id) => this.client.get(`/transactions/id/${id}`),
        getSummary: () => this.client.get('/transactions/summary'),
        filter: (filters) => this.client.get('/transactions/filter', { params: filters }),
        create: (data) => this.client.post('/transactions', data),
        update: (id, data) => this.client.put(`/transactions/${id}`, data),
        confirm: (id, confirmed) => this.client.patch(`/transactions/${id}/confirm`, { confirmed }),
        delete: (id) => this.client.delete(`/transactions/${id}`)
    };

    // Batches
    batches = {
        getAll: (params) => this.client.get('/batches', { params }),
        getById: (id) => this.client.get(`/batches/id/${id}`),
        getByProduct: (productId) => this.client.get(`/batches/product/${productId}`),
        getInventorySummary: () => this.client.get('/batches/inventory-summary'),
        filter: (filters) => this.client.get('/batches/filter', { params: filters }),
        create: (data) => this.client.post('/batches', data),
        update: (id, data) => this.client.put(`/batches/${id}`, data),
        updateQuantity: (id, quantityData) => this.client.patch(`/batches/${id}/quantity`, quantityData),
        delete: (id) => this.client.delete(`/batches/${id}`)
    };

    // Order Details
    orderDetails = {
        getAll: (params) => this.client.get('/order-details', { params }),
        getByOrderId: (orderId) => this.client.get(`/order-details/order/${orderId}`),
        filter: (filters) => this.client.get('/order-details/filter', { params: filters }),
        create: (data) => this.client.post('/order-details', data),
        update: (orderId, data) => this.client.put(`/order-details/Order ID/${orderId}`, data),
        delete: (orderId) => this.client.delete(`/order-details/Order ID/${orderId}`)
    };

    // System
    system = {
        getHealth: () => this.client.get('/health'),
        getInfo: () => this.client.get('/info')
    };
}

export default EnhancedRetailAPI;
```

## ⚛️ React Integration

### Custom Hooks

```javascript
// hooks/useRetailAPI.js
import { useState, useEffect, useCallback } from 'react';
import EnhancedRetailAPI from '../api/EnhancedRetailAPI';

const api = new EnhancedRetailAPI();

export const useRetailAPI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const makeRequest = useCallback(async (apiCall) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiCall();
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.error || err.message);
            setLoading(false);
            throw err;
        }
    }, []);

    return { api, loading, error, makeRequest };
};

// Specific hooks for different entities
export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const { api, loading, error, makeRequest } = useRetailAPI();

    const fetchProducts = useCallback(async (params = {}) => {
        const result = await makeRequest(() => api.products.getAll(params));
        setProducts(result.data);
        return result;
    }, [makeRequest]);

    const createProduct = useCallback(async (productData) => {
        const result = await makeRequest(() => api.products.create(productData));
        setProducts(prev => [...prev, result.data]);
        return result;
    }, [makeRequest]);

    const updateProduct = useCallback(async (productId, updateData) => {
        const result = await makeRequest(() => api.products.update(productId, updateData));
        setProducts(prev => prev.map(p => 
            p['Product ID'] === productId ? result.data : p
        ));
        return result;
    }, [makeRequest]);

    const deleteProduct = useCallback(async (productId) => {
        await makeRequest(() => api.products.delete(productId));
        setProducts(prev => prev.filter(p => p['Product ID'] !== productId));
    }, [makeRequest]);

    return {
        products,
        setProducts,
        loading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct
    };
};

export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const { api, loading, error, makeRequest } = useRetailAPI();

    const fetchOrders = useCallback(async (params = {}) => {
        const result = await makeRequest(() => api.orders.getAll(params));
        setOrders(result.data);
        return result;
    }, [makeRequest]);

    const createOrder = useCallback(async (orderData) => {
        const result = await makeRequest(() => api.orders.create(orderData));
        setOrders(prev => [...prev, result.data]);
        return result;
    }, [makeRequest]);

    return {
        orders,
        loading,
        error,
        fetchOrders,
        createOrder
    };
};
```

### React Query Integration

```javascript
// hooks/useRetailQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EnhancedRetailAPI from '../api/EnhancedRetailAPI';

const api = new EnhancedRetailAPI();

// Products queries
export const useProductsQuery = (params = {}) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => api.products.getAll(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useProductQuery = (productId) => {
    return useQuery({
        queryKey: ['products', productId],
        queryFn: () => api.products.getById(productId),
        enabled: !!productId,
    });
};

export const useCreateProductMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: api.products.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useUpdateProductMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }) => api.products.update(productId, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
        },
    });
};

// Orders queries
export const useOrdersQuery = (params = {}) => {
    return useQuery({
        queryKey: ['orders', params],
        queryFn: () => api.orders.getAll(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const useOrderQuery = (orderId) => {
    return useQuery({
        queryKey: ['orders', orderId],
        queryFn: () => api.orders.getById(orderId),
        enabled: !!orderId,
    });
};

// Transaction queries
export const useTransactionSummaryQuery = () => {
    return useQuery({
        queryKey: ['transactions', 'summary'],
        queryFn: () => api.transactions.getSummary(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};
```

### React Components

```jsx
// components/ProductList.jsx
import React, { useEffect, useState } from 'react';
import { useProductsQuery, useCreateProductMutation } from '../hooks/useRetailQueries';

const ProductList = () => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({});
    
    const { data, isLoading, error } = useProductsQuery({ page, limit: 20, ...filters });
    const createProductMutation = useCreateProductMutation();

    const handleCreateProduct = async (productData) => {
        try {
            await createProductMutation.mutateAsync(productData);
            alert('Product created successfully!');
        } catch (error) {
            alert(`Error: ${error.error || error.message}`);
        }
    };

    if (isLoading) return <div className="loading">Loading products...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="product-list">
            <h2>Products ({data?.count || 0})</h2>
            
            {/* Filters */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search products..."
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <select
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                    <option value="">All Categories</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                </select>
            </div>

            {/* Product Grid */}
            <div className="product-grid">
                {data?.data?.map((product) => (
                    <ProductCard 
                        key={product['Product ID']} 
                        product={product}
                        onUpdate={handleCreateProduct}
                    />
                ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>
                <span>Page {page}</span>
                <button onClick={() => setPage(page + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
};

// components/ProductCard.jsx
const ProductCard = ({ product, onUpdate }) => {
    const updateProductMutation = useUpdateProductMutation();
    
    const handleStockUpdate = async (newStock) => {
        try {
            await updateProductMutation.mutateAsync({
                productId: product['Product ID'],
                data: { 'Current Stock': newStock }
            });
        } catch (error) {
            alert(`Error updating stock: ${error.error || error.message}`);
        }
    };

    const isLowStock = product['Current Stock'] <= product['Min Stock'];

    return (
        <div className={`product-card ${isLowStock ? 'low-stock' : ''}`}>
            <h3>{product['Product Name']}</h3>
            <p className="price">${product['Selling Price']}</p>
            <div className="stock-info">
                <span className={`stock ${isLowStock ? 'low' : ''}`}>
                    Stock: {product['Current Stock']}
                </span>
                {isLowStock && <span className="warning">⚠️ Low Stock</span>}
            </div>
            <div className="actions">
                <button onClick={() => handleStockUpdate(product['Current Stock'] + 10)}>
                    Add Stock
                </button>
                <button onClick={() => handleStockUpdate(Math.max(0, product['Current Stock'] - 1))}>
                    Remove Stock
                </button>
            </div>
        </div>
    );
};

export default ProductList;
```

### Dashboard Component

```jsx
// components/Dashboard.jsx
import React from 'react';
import { useProductsQuery, useOrdersQuery, useTransactionSummaryQuery } from '../hooks/useRetailQueries';

const Dashboard = () => {
    const { data: products } = useProductsQuery();
    const { data: orders } = useOrdersQuery();
    const { data: transactionSummary } = useTransactionSummaryQuery();

    const stats = {
        totalProducts: products?.count || 0,
        totalOrders: orders?.count || 0,
        lowStockProducts: products?.data?.filter(p => 
            p['Current Stock'] <= p['Min Stock']
        ).length || 0,
        totalRevenue: transactionSummary?.data?.total_revenue || 0
    };

    return (
        <div className="dashboard">
            <h1>Retail Management Dashboard</h1>
            
            <div className="stats-grid">
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon="📦"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon="🛒"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats.lowStockProducts}
                    icon="⚠️"
                    className={stats.lowStockProducts > 0 ? 'warning' : ''}
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon="💰"
                />
            </div>

            <div className="dashboard-sections">
                <LowStockAlert />
                <RecentOrders />
                <TransactionChart />
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, className = '' }) => (
    <div className={`stat-card ${className}`}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-content">
            <h3>{value}</h3>
            <p>{title}</p>
        </div>
    </div>
);

export default Dashboard;
```

## 🖖 Vue.js Integration

### Vue Composables

```javascript
// composables/useRetailAPI.js
import { ref, reactive, computed } from 'vue';
import EnhancedRetailAPI from '../api/EnhancedRetailAPI';

const api = new EnhancedRetailAPI();

export function useRetailAPI() {
    const loading = ref(false);
    const error = ref(null);

    const makeRequest = async (apiCall) => {
        loading.value = true;
        error.value = null;
        try {
            const result = await apiCall();
            loading.value = false;
            return result;
        } catch (err) {
            error.value = err.error || err.message;
            loading.value = false;
            throw err;
        }
    };

    return {
        api,
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        makeRequest
    };
}

export function useProducts() {
    const products = ref([]);
    const { api, loading, error, makeRequest } = useRetailAPI();

    const fetchProducts = async (params = {}) => {
        const result = await makeRequest(() => api.products.getAll(params));
        products.value = result.data;
        return result;
    };

    const createProduct = async (productData) => {
        const result = await makeRequest(() => api.products.create(productData));
        products.value.push(result.data);
        return result;
    };

    const updateProduct = async (productId, updateData) => {
        const result = await makeRequest(() => api.products.update(productId, updateData));
        const index = products.value.findIndex(p => p['Product ID'] === productId);
        if (index !== -1) {
            products.value[index] = result.data;
        }
        return result;
    };

    return {
        products: computed(() => products.value),
        loading,
        error,
        fetchProducts,
        createProduct,
        updateProduct
    };
}
```

### Vue Components

```vue
<!-- components/ProductList.vue -->
<template>
  <div class="product-list">
    <h2>Products ({{ products.length }})</h2>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      Loading products...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      Error: {{ error }}
    </div>

    <!-- Products Grid -->
    <div v-else class="product-grid">
      <ProductCard
        v-for="product in products"
        :key="product['Product ID']"
        :product="product"
        @update="handleProductUpdate"
      />
    </div>

    <!-- Create Product Form -->
    <ProductForm @submit="handleCreateProduct" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProducts } from '../composables/useRetailAPI';
import ProductCard from './ProductCard.vue';
import ProductForm from './ProductForm.vue';

const { products, loading, error, fetchProducts, createProduct, updateProduct } = useProducts();

onMounted(() => {
  fetchProducts();
});

const handleCreateProduct = async (productData) => {
  try {
    await createProduct(productData);
    alert('Product created successfully!');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

const handleProductUpdate = async (productId, updateData) => {
  try {
    await updateProduct(productId, updateData);
  } catch (error) {
    alert(`Error updating product: ${error.message}`);
  }
};
</script>
```

## 📊 State Management

### Redux Toolkit Setup

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import productsSlice from './slices/productsSlice';
import ordersSlice from './slices/ordersSlice';
import transactionsSlice from './slices/transactionsSlice';

export const store = configureStore({
    reducer: {
        products: productsSlice,
        orders: ordersSlice,
        transactions: transactionsSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```javascript
// store/slices/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import EnhancedRetailAPI from '../../api/EnhancedRetailAPI';

const api = new EnhancedRetailAPI();

// Async thunks
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.products.getAll(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.error || error.message);
        }
    }
);

export const createProduct = createAsyncThunk(
    'products/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const response = await api.products.create(productData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.error || error.message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'products/updateProduct',
    async ({ productId, data }, { rejectWithValue }) => {
        try {
            const response = await api.products.update(productId, data);
            return { productId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.error || error.message);
        }
    }
);

// Slice
const productsSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        loading: false,
        error: null,
        filters: {},
        pagination: {
            page: 1,
            limit: 20,
            total: 0
        }
    },
    reducers: {
        setFilters: (state, action) => {
            state.filters = action.payload;
        },
        setPage: (state, action) => {
            state.pagination.page = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination.total = action.payload.count;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Product
            .addCase(createProduct.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update Product
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.items.findIndex(
                    item => item['Product ID'] === action.payload.productId
                );
                if (index !== -1) {
                    state.items[index] = action.payload.data;
                }
            });
    }
});

export const { setFilters, setPage, clearError } = productsSlice.actions;
export default productsSlice.reducer;
```

### Zustand Store (Simpler Alternative)

```javascript
// store/useStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import EnhancedRetailAPI from '../api/EnhancedRetailAPI';

const api = new EnhancedRetailAPI();

export const useRetailStore = create(
    devtools((set, get) => ({
        // Products state
        products: [],
        productsLoading: false,
        productsError: null,

        // Orders state
        orders: [],
        ordersLoading: false,
        ordersError: null,

        // Actions
        fetchProducts: async (params = {}) => {
            set({ productsLoading: true, productsError: null });
            try {
                const response = await api.products.getAll(params);
                set({ products: response.data, productsLoading: false });
            } catch (error) {
                set({ 
                    productsError: error.error || error.message, 
                    productsLoading: false 
                });
            }
        },

        createProduct: async (productData) => {
            try {
                const response = await api.products.create(productData);
                set(state => ({ 
                    products: [...state.products, response.data] 
                }));
                return response;
            } catch (error) {
                throw error;
            }
        },

        updateProduct: async (productId, updateData) => {
            try {
                const response = await api.products.update(productId, updateData);
                set(state => ({
                    products: state.products.map(p => 
                        p['Product ID'] === productId ? response.data : p
                    )
                }));
                return response;
            } catch (error) {
                throw error;
            }
        },

        fetchOrders: async (params = {}) => {
            set({ ordersLoading: true, ordersError: null });
            try {
                const response = await api.orders.getAll(params);
                set({ orders: response.data, ordersLoading: false });
            } catch (error) {
                set({ 
                    ordersError: error.error || error.message, 
                    ordersLoading: false 
                });
            }
        },

        // Computed values
        lowStockProducts: () => {
            return get().products.filter(product => 
                product['Current Stock'] <= product['Min Stock']
            );
        }
    }))
);
```

## ✅ Form Validation

### Validation Schemas

```javascript
// validation/schemas.js
import * as Yup from 'yup';

export const productSchema = Yup.object({
    'Product ID': Yup.string()
        .required('Product ID is required')
        .matches(/^[A-Z0-9-]+$/, 'Product ID must contain only uppercase letters, numbers, and hyphens'),
    'Product Name': Yup.string()
        .required('Product Name is required')
        .min(2, 'Product Name must be at least 2 characters'),
    'Selling Price': Yup.number()
        .required('Selling Price is required')
        .positive('Selling Price must be positive')
        .max(999999, 'Selling Price too high'),
    'Current Stock': Yup.number()
        .required('Current Stock is required')
        .integer('Current Stock must be a whole number')
        .min(0, 'Current Stock cannot be negative'),
    'Min Stock': Yup.number()
        .required('Min Stock is required')
        .integer('Min Stock must be a whole number')
        .min(0, 'Min Stock cannot be negative')
});

export const orderSchema = Yup.object({
    'OrderID': Yup.string()
        .required('Order ID is required')
        .matches(/^[A-Z0-9-]+$/, 'Order ID format invalid'),
    'Order Date': Yup.date()
        .required('Order Date is required')
        .max(new Date(), 'Order Date cannot be in the future'),
    'Channel': Yup.string()
        .required('Channel is required')
        .oneOf(['Online', 'In-Store', 'Phone', 'Email'], 'Invalid channel'),
    'Platform': Yup.string()
        .required('Platform is required'),
    'Username': Yup.string()
        .required('Username is required'),
    'Recipient': Yup.string()
        .required('Recipient is required'),
    'Phone Number': Yup.string()
        .required('Phone Number is required')
        .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number'),
    'Address': Yup.string()
        .required('Address is required')
        .min(10, 'Address too short'),
    'Remark': Yup.string(),
    'Process': Yup.string()
        .oneOf(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], 'Invalid process status')
});

export const transactionSchema = Yup.object({
    'Transaction ID': Yup.string()
        .required('Transaction ID is required'),
    'Date': Yup.date()
        .required('Date is required')
        .max(new Date(), 'Date cannot be in the future'),
    'Category': Yup.string()
        .required('Category is required')
        .oneOf(['Purchase', 'Sale', 'Refund', 'Expense', 'Income'], 'Invalid category'),
    'Amount': Yup.number()
        .required('Amount is required')
        .test('not-zero', 'Amount cannot be zero', value => value !== 0),
    'From': Yup.string(),
    'To': Yup.string(),
    'Confirmed': Yup.boolean(),
    'Note': Yup.string()
});
```

### React Form Component

```jsx
// components/forms/ProductForm.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { productSchema } from '../../validation/schemas';

const ProductForm = ({ initialValues, onSubmit, submitText = 'Create Product' }) => {
    const defaultValues = {
        'Product ID': '',
        'Product Name': '',
        'Selling Price': '',
        'Current Stock': '',
        'Min Stock': '',
        ...initialValues
    };

    return (
        <div className="product-form">
            <Formik
                initialValues={defaultValues}
                validationSchema={productSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                    try {
                        await onSubmit(values);
                        resetForm();
                    } catch (error) {
                        console.error('Form submission error:', error);
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, errors, touched }) => (
                    <Form className="form">
                        <div className="form-group">
                            <label htmlFor="Product ID">Product ID *</label>
                            <Field
                                type="text"
                                name="Product ID"
                                className={errors['Product ID'] && touched['Product ID'] ? 'error' : ''}
                            />
                            <ErrorMessage name="Product ID" component="div" className="error-message" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="Product Name">Product Name *</label>
                            <Field
                                type="text"
                                name="Product Name"
                                className={errors['Product Name'] && touched['Product Name'] ? 'error' : ''}
                            />
                            <ErrorMessage name="Product Name" component="div" className="error-message" />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="Selling Price">Selling Price *</label>
                                <Field
                                    type="number"
                                    step="0.01"
                                    name="Selling Price"
                                    className={errors['Selling Price'] && touched['Selling Price'] ? 'error' : ''}
                                />
                                <ErrorMessage name="Selling Price" component="div" className="error-message" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="Current Stock">Current Stock *</label>
                                <Field
                                    type="number"
                                    name="Current Stock"
                                    className={errors['Current Stock'] && touched['Current Stock'] ? 'error' : ''}
                                />
                                <ErrorMessage name="Current Stock" component="div" className="error-message" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="Min Stock">Min Stock *</label>
                                <Field
                                    type="number"
                                    name="Min Stock"
                                    className={errors['Min Stock'] && touched['Min Stock'] ? 'error' : ''}
                                />
                                <ErrorMessage name="Min Stock" component="div" className="error-message" />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="submit-button"
                        >
                            {isSubmitting ? 'Submitting...' : submitText}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ProductForm;
```

## 🎯 UI Components

### Reusable Components

```jsx
// components/ui/DataTable.jsx
import React, { useState } from 'react';

const DataTable = ({ 
    data, 
    columns, 
    loading = false, 
    onSort, 
    onFilter, 
    onRowClick,
    actions = []
}) => {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [filters, setFilters] = useState({});

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);
        onSort?.(column, direction);
    };

    const handleFilter = (column, value) => {
        const newFilters = { ...filters, [column]: value };
        setFilters(newFilters);
        onFilter?.(newFilters);
    };

    if (loading) {
        return <div className="data-table-loading">Loading...</div>;
    }

    return (
        <div className="data-table">
            <table>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key}>
                                <div className="column-header">
                                    <span 
                                        className={`column-title ${column.sortable ? 'sortable' : ''}`}
                                        onClick={column.sortable ? () => handleSort(column.key) : undefined}
                                    >
                                        {column.title}
                                        {sortColumn === column.key && (
                                            <span className="sort-indicator">
                                                {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                                            </span>
                                        )}
                                    </span>
                                    {column.filterable && (
                                        <input
                                            type="text"
                                            placeholder="Filter..."
                                            className="column-filter"
                                            onChange={(e) => handleFilter(column.key, e.target.value)}
                                        />
                                    )}
                                </div>
                            </th>
                        ))}
                        {actions.length > 0 && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr 
                            key={index}
                            onClick={() => onRowClick?.(row)}
                            className={onRowClick ? 'clickable' : ''}
                        >
                            {columns.map((column) => (
                                <td key={column.key}>
                                    {column.render ? 
                                        column.render(row[column.key], row) : 
                                        row[column.key]
                                    }
                                </td>
                            ))}
                            {actions.length > 0 && (
                                <td className="actions">
                                    {actions.map((action, actionIndex) => (
                                        <button
                                            key={actionIndex}
                                            className={`action-button ${action.type || ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                action.onClick(row);
                                            }}
                                        >
                                            {action.icon && <span className="action-icon">{action.icon}</span>}
                                            {action.label}
                                        </button>
                                    ))}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
```

### Usage Example

```jsx
// components/ProductsTable.jsx
import React from 'react';
import DataTable from './ui/DataTable';
import { useProducts } from '../hooks/useRetailAPI';

const ProductsTable = () => {
    const { products, loading, updateProduct, deleteProduct } = useProducts();

    const columns = [
        {
            key: 'Product ID',
            title: 'Product ID',
            sortable: true,
            filterable: true
        },
        {
            key: 'Product Name',
            title: 'Product Name',
            sortable: true,
            filterable: true
        },
        {
            key: 'Selling Price',
            title: 'Price',
            sortable: true,
            render: (value) => `$${parseFloat(value).toFixed(2)}`
        },
        {
            key: 'Current Stock',
            title: 'Stock',
            sortable: true,
            render: (value, row) => (
                <span className={value <= row['Min Stock'] ? 'low-stock' : ''}>
                    {value}
                    {value <= row['Min Stock'] && ' ⚠️'}
                </span>
            )
        },
        {
            key: 'Min Stock',
            title: 'Min Stock',
            sortable: true
        }
    ];

    const actions = [
        {
            label: 'Edit',
            icon: '✏️',
            type: 'primary',
            onClick: (product) => {
                // Open edit modal
                console.log('Edit product:', product);
            }
        },
        {
            label: 'Delete',
            icon: '🗑️',
            type: 'danger',
            onClick: (product) => {
                if (confirm(`Delete ${product['Product Name']}?`)) {
                    deleteProduct(product['Product ID']);
                }
            }
        }
    ];

    return (
        <DataTable
            data={products}
            columns={columns}
            loading={loading}
            actions={actions}
            onRowClick={(product) => {
                console.log('Product clicked:', product);
            }}
        />
    );
};

export default ProductsTable;
```

## ⚡ Performance Optimization

### Memoization and Optimization

```jsx
// hooks/useOptimizedProducts.js
import { useMemo, useCallback } from 'react';
import { useProducts } from './useRetailAPI';

export const useOptimizedProducts = (filters = {}) => {
    const { products, loading, error, ...actions } = useProducts();

    // Memoized filtered and sorted products
    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (filters.search) {
            filtered = filtered.filter(product =>
                product['Product Name'].toLowerCase().includes(filters.search.toLowerCase()) ||
                product['Product ID'].toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.lowStock) {
            filtered = filtered.filter(product =>
                product['Current Stock'] <= product['Min Stock']
            );
        }

        if (filters.category) {
            filtered = filtered.filter(product =>
                product['Category'] === filters.category
            );
        }

        return filtered;
    }, [products, filters]);

    // Memoized statistics
    const statistics = useMemo(() => ({
        total: products.length,
        lowStock: products.filter(p => p['Current Stock'] <= p['Min Stock']).length,
        totalValue: products.reduce((sum, p) => 
            sum + (parseFloat(p['Selling Price']) * parseInt(p['Current Stock'])), 0
        ),
        averagePrice: products.length > 0 ? 
            products.reduce((sum, p) => sum + parseFloat(p['Selling Price']), 0) / products.length : 0
    }), [products]);

    // Optimized callbacks
    const optimizedUpdateProduct = useCallback(
        (productId, updateData) => {
            return actions.updateProduct(productId, updateData);
        },
        [actions.updateProduct]
    );

    return {
        products: filteredProducts,
        statistics,
        loading,
        error,
        ...actions,
        updateProduct: optimizedUpdateProduct
    };
};
```

### Virtual Scrolling for Large Lists

```jsx
// components/VirtualProductList.jsx
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

const VirtualProductList = ({ products, height = 400, itemHeight = 80 }) => {
    const ProductItem = ({ index, style }) => {
        const product = products[index];
        
        return (
            <div style={style} className="virtual-product-item">
                <div className="product-info">
                    <h4>{product['Product Name']}</h4>
                    <p>ID: {product['Product ID']}</p>
                    <p>Price: ${product['Selling Price']}</p>
                    <p>Stock: {product['Current Stock']}</p>
                </div>
            </div>
        );
    };

    return (
        <List
            height={height}
            itemCount={products.length}
            itemSize={itemHeight}
            itemData={products}
        >
            {ProductItem}
        </List>
    );
};

export default VirtualProductList;
```

### Debounced Search

```jsx
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// components/SearchableProductList.jsx
import React, { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useOptimizedProducts } from '../hooks/useOptimizedProducts';

const SearchableProductList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    const { products, loading } = useOptimizedProducts({
        search: debouncedSearchTerm
    });

    return (
        <div>
            <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {loading ? (
                <div>Searching...</div>
            ) : (
                <div>
                    {products.map(product => (
                        <div key={product['Product ID']}>
                            {product['Product Name']}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
```

## 🔒 Error Handling

### Global Error Boundary

```jsx
// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Log error to monitoring service
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h2>Something went wrong</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                    <button onClick={() => window.location.reload()}>
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
```

### Error Handling Hook

```javascript
// hooks/useErrorHandler.js
import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
    const [errors, setErrors] = useState({});

    const handleError = useCallback((error, context = 'general') => {
        const errorMessage = error?.error || error?.message || 'An unknown error occurred';
        
        setErrors(prev => ({
            ...prev,
            [context]: errorMessage
        }));

        // Log error for debugging
        console.error(`Error in ${context}:`, error);

        // Show user-friendly notification
        if (window.notify) {
            window.notify.error(errorMessage);
        }
    }, []);

    const clearError = useCallback((context) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[context];
            return newErrors;
        });
    }, []);

    const clearAllErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
        errors,
        handleError,
        clearError,
        clearAllErrors,
        hasError: (context) => Boolean(errors[context]),
        getError: (context) => errors[context]
    };
};
```

## 📱 Mobile Considerations

### Responsive Design

```css
/* styles/responsive.css */
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

@media (max-width: 768px) {
    .product-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
    
    .data-table {
        overflow-x: auto;
    }
    
    .form-row {
        flex-direction: column;
    }
    
    .dashboard-sections {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .product-card {
        padding: 0.5rem;
    }
    
    .action-button {
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
    }
}
```

### Touch-Friendly Components

```jsx
// components/mobile/TouchFriendlyButton.jsx
import React from 'react';

const TouchFriendlyButton = ({ 
    children, 
    onClick, 
    variant = 'primary',
    size = 'medium',
    disabled = false,
    ...props 
}) => {
    const handleClick = (e) => {
        e.preventDefault();
        if (!disabled && onClick) {
            onClick(e);
        }
    };

    return (
        <button
            className={`touch-button touch-button--${variant} touch-button--${size} ${disabled ? 'disabled' : ''}`}
            onClick={handleClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default TouchFriendlyButton;
```

This comprehensive frontend integration guide provides everything needed to build a modern, responsive frontend application that interacts seamlessly with your Retail Management API. The examples cover React, Vue.js, state management, form validation, UI components, performance optimization, error handling, and mobile considerations.
