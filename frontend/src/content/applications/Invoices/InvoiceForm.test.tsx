import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InvoiceForm from './InvoiceForm';
import { PureLightTheme } from '../../../theme/schemes/PureLightTheme';
import { Product, Invoice } from './types';

describe('InvoiceForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const mockProducts: Product[] = [
    { id: '1', name: 'Product 1', desc: 'Description 1', price: 100 },
    { id: '2', name: 'Product 2', desc: 'Description 2', price: 200 }
  ];

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    products: mockProducts,
    invoice: null
  };

  const renderForm = (props = {}) => {
    return render(
      <ThemeProvider theme={PureLightTheme}>
        <InvoiceForm {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with all fields', () => {
    renderForm();
    expect(screen.getByText('Create Invoice')).toBeInTheDocument();
    expect(screen.getByLabelText(/Invoice Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recipient/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
  });

  it('should populate fields when editing', () => {
    const invoice: Invoice = {
      id: '1',
      recipient: 'Test Recipient',
      number: 'INV-001',
      items: [{ productId: '1', qty: 2 }],
      status: 'draft'
    };

    renderForm({ invoice });

    expect(screen.getByText('Edit Invoice')).toBeInTheDocument();
    expect(screen.getByLabelText(/Invoice Number/i)).toHaveValue('INV-001');
    expect(screen.getByLabelText(/Recipient/i)).toHaveValue('Test Recipient');
  });

  it('should add new item', () => {
    renderForm();

    fireEvent.click(screen.getByText('Add Item'));

    const quantityInputs = screen.getAllByLabelText(/Quantity/i);
    expect(quantityInputs).toHaveLength(2);
  });

  it('should submit form', () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/Invoice Number/i), {
      target: { value: 'INV-001' }
    });
    fireEvent.change(screen.getByLabelText(/Recipient/i), {
      target: { value: 'Customer' }
    });

    const form = screen.getByText('Create').closest('form');
    fireEvent.submit(form!);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        number: 'INV-001',
        recipient: 'Customer',
        status: 'draft'
      })
    );
  });

  it('should close dialog on cancel', () => {
    renderForm();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
