import { FC, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  MenuItem,
  IconButton,
  Typography,
  Divider,
  Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Product, Invoice } from './types';

interface InvoiceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (invoice: Invoice) => void;
  invoice?: Invoice | null;
  products: Product[];
}

const InvoiceForm: FC<InvoiceFormProps> = ({
  open,
  onClose,
  onSubmit,
  invoice,
  products
}) => {
  const [formData, setFormData] = useState<Invoice>({
    recipient: '',
    number: '',
    items: [{ productId: '', qty: 1 }],
    tax: 0,
    discount: 0,
    status: 'draft',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    if (invoice) {
      const transformedItems = invoice.items.map((item: any) => ({
        productId: item.product || item.productId || '',
        qty: item.qty
      }));

      setFormData({
        ...invoice,
        items: transformedItems,
        issueDate: invoice.issueDate
          ? new Date(invoice.issueDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate
          ? new Date(invoice.dueDate).toISOString().split('T')[0]
          : ''
      });
    } else {
      setFormData({
        recipient: '',
        number: '',
        items: [{ productId: '', qty: 1 }],
        tax: 0,
        discount: 0,
        status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: ''
      });
    }
  }, [invoice, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', qty: 1 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);

    const tax = formData.tax || 0;
    const discount = formData.discount || 0;
    return subtotal + tax - discount;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{invoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Invoice Number"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Recipient"
                  value={formData.recipient}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Issue Date"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Items
                </Typography>
              </Grid>

              {formData.items.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={products}
                        getOptionLabel={(option: Product) => option.name}
                        value={
                          products.find((p) => p.id === item.productId) || null
                        }
                        onChange={(_, newValue: Product | null) => {
                          handleItemChange(
                            index,
                            'productId',
                            newValue?.id || ''
                          );
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Product" required />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'qty',
                            parseInt(e.target.value)
                          )
                        }
                        inputProps={{ min: 1 }}
                        required
                      />
                    </Grid>
                    <Grid item xs={4} md={2}>
                      <Typography variant="body2">
                        Rp{' '}
                        {(
                          (products.find((p) => p.id === item.productId)
                            ?.price || 0) * item.qty
                        ).toLocaleString('id-ID')}
                      </Typography>
                    </Grid>
                    <Grid item xs={2} md={1}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  variant="outlined"
                >
                  Add Item
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax"
                  type="number"
                  value={formData.tax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tax: parseFloat(e.target.value)
                    })
                  }
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount: parseFloat(e.target.value)
                    })
                  }
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ textAlign: 'right', mt: 2 }}>
                  <Typography variant="h5">
                    Total: Rp {calculateTotal().toLocaleString('id-ID')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {invoice ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InvoiceForm;
