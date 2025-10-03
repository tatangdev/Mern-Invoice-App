import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Button, Box, Typography, Alert } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

import ProductsTable from './ProductsTable';
import ProductForm from './ProductForm';
import { useAuth } from 'src/contexts/AuthContext';
import { productsApi } from 'src/services/api';

interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

function Products() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll();
      setProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleViewProduct = (id: string) => {
    navigate(`/management/products/${id}`);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsApi.delete(id);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const handleSubmitProduct = async (product: Product, imageFile?: File) => {
    try {
      let productResponse;
      if (product.id) {
        productResponse = await productsApi.update(product.id, product);
      } else {
        productResponse = await productsApi.create(product);
      }

      if (imageFile && productResponse.data.id) {
        await productsApi.updateImage(productResponse.data.id, imageFile);
      }

      setFormOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  return (
    <>
      <Helmet>
        <title>Products</title>
      </Helmet>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={3}
            >
              <Box>
                <Typography variant="h3" component="h3" gutterBottom>
                  Products
                </Typography>
                <Typography variant="subtitle2">
                  Manage your products inventory
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddTwoToneIcon />}
                onClick={handleAddProduct}
              >
                Add Product
              </Button>
            </Box>
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            {!loading && (
              <ProductsTable
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onView={handleViewProduct}
              />
            )}
          </Grid>
        </Grid>
      </Container>

      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitProduct}
        product={selectedProduct}
      />
    </>
  );
}

export default Products;
