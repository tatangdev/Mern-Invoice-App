import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductForm from './ProductForm';
import { PureLightTheme } from '../../../theme/schemes/PureLightTheme';

describe('ProductForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    product: null
  };

  const renderForm = (props = {}) => {
    return render(
      <ThemeProvider theme={PureLightTheme}>
        <ProductForm {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with all fields', () => {
    renderForm();
    expect(screen.getByText('Add Product')).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
  });

  it('should populate fields when editing', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      desc: 'Test Description',
      price: 100
    };

    renderForm({ product });

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Test Product');
    expect(screen.getByLabelText(/Description/i)).toHaveValue(
      'Test Description'
    );
    expect(screen.getByLabelText(/Price/i)).toHaveValue(100);
  });

  it('should submit form with data', () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'New Product' }
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Description' }
    });
    fireEvent.change(screen.getByLabelText(/Price/i), {
      target: { value: '150' }
    });

    fireEvent.click(screen.getByText('Create'));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      {
        name: 'New Product',
        desc: 'Description',
        price: 150
      },
      undefined
    );
  });

  it('should close dialog on cancel', () => {
    renderForm();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
