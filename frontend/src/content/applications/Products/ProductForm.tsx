import { FC, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
  styled
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const Input = styled('input')({
  display: 'none'
});

interface Product {
  id?: string;
  name: string;
  desc: string;
  price: number;
  image?: string;
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Product, imageFile?: File) => void;
  product?: Product | null;
}

const ProductForm: FC<ProductFormProps> = ({
  open,
  onClose,
  onSubmit,
  product
}) => {
  const [formData, setFormData] = useState<Product>({
    name: '',
    desc: '',
    price: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImagePreview(product.image || '');
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        desc: '',
        price: 0
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [product, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, imageFile || undefined);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <Avatar
                src={imagePreview}
                alt="Product"
                variant="rounded"
                sx={{ width: 100, height: 100 }}
              >
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'P'}
              </Avatar>
              <Box>
                <Input
                  accept="image/*"
                  id="product-image-input"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="product-image-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                  >
                    Upload Image
                  </Button>
                </label>
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Product Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.desc}
              onChange={(e) =>
                setFormData({ ...formData, desc: e.target.value })
              }
              required
              multiline
              rows={4}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) })
              }
              required
              margin="normal"
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {product ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;
