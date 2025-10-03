import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Container, Grid, Button, Box, Typography, Alert } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

import InvoicesTable from './InvoicesTable';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';
import { useAuth } from 'src/contexts/AuthContext';
import { Product, Invoice } from './types';

function Invoices() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/invoices`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchProducts();
  }, []);

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setFormOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormOpen(true);
  };

  const handlePreviewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPreviewOpen(true);
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/invoices/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      fetchInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  };

  const handleSubmitInvoice = async (invoice: any) => {
    try {
      const url = invoice.id
        ? `${process.env.REACT_APP_API_URL}/api/invoices/${invoice.id}`
        : `${process.env.REACT_APP_API_URL}/api/invoices`;

      const method = invoice.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(invoice)
      });

      if (!response.ok) {
        throw new Error('Failed to save invoice');
      }

      setFormOpen(false);
      fetchInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    }
  };

  return (
    <>
      <Helmet>
        <title>Invoices</title>
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
                  Invoices
                </Typography>
                <Typography variant="subtitle2">
                  Manage your invoices
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddTwoToneIcon />}
                onClick={handleAddInvoice}
              >
                Create Invoice
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
              <InvoicesTable
                invoices={invoices}
                onEdit={handleEditInvoice}
                onDelete={handleDeleteInvoice}
                onPreview={handlePreviewInvoice}
              />
            )}
          </Grid>
        </Grid>
      </Container>

      <InvoiceForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitInvoice}
        invoice={selectedInvoice}
        products={products}
      />

      <InvoicePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoice={selectedInvoice}
      />
    </>
  );
}

export default Invoices;
