import { FC, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  Grid
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { format } from 'date-fns';
import { Invoice } from './types';

interface InvoicePreviewProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

const InvoicePreview: FC<InvoicePreviewProps> = ({ open, onClose, invoice }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${invoice?.number}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  padding: 20px;
                  color: #333;
                }
                .invoice-header {
                  margin-bottom: 30px;
                }
                .invoice-title {
                  font-size: 32px;
                  font-weight: bold;
                  margin-bottom: 10px;
                }
                .invoice-number {
                  font-size: 18px;
                  color: #666;
                }
                .section {
                  margin-bottom: 20px;
                }
                .section-title {
                  font-size: 14px;
                  font-weight: bold;
                  color: #666;
                  margin-bottom: 5px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                }
                th {
                  background-color: #f5f5f5;
                  padding: 12px;
                  text-align: left;
                  font-weight: bold;
                  border-bottom: 2px solid #ddd;
                }
                td {
                  padding: 10px 12px;
                  border-bottom: 1px solid #eee;
                }
                .text-right {
                  text-align: right;
                }
                .summary {
                  margin-top: 20px;
                  float: right;
                  width: 300px;
                }
                .summary-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                }
                .summary-total {
                  font-size: 18px;
                  font-weight: bold;
                  border-top: 2px solid #333;
                  padding-top: 10px;
                }
                .status-badge {
                  display: inline-block;
                  padding: 4px 12px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: bold;
                  text-transform: uppercase;
                }
                .status-paid { background-color: #4caf50; color: white; }
                .status-sent { background-color: #2196f3; color: white; }
                .status-draft { background-color: #9e9e9e; color: white; }
                .status-cancelled { background-color: #f44336; color: white; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Invoice Preview</DialogTitle>
      <DialogContent>
        <Box ref={printRef} sx={{ p: 2 }}>
          <Box className="invoice-header" sx={{ mb: 4 }}>
            <Typography variant="h3" className="invoice-title">
              INVOICE
            </Typography>
            <Typography variant="h6" className="invoice-number" color="text.secondary">
              #{invoice.number}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <span className={`status-badge status-${invoice.status}`}>
                {invoice.status.toUpperCase()}
              </span>
            </Box>
          </Box>

          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Box className="section">
                <Typography variant="subtitle2" className="section-title" color="text.secondary">
                  BILL TO
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {invoice.recipient}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box className="section">
                <Typography variant="subtitle2" className="section-title" color="text.secondary">
                  DATE
                </Typography>
                <Typography variant="body2">
                  Issue: {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                </Typography>
                {invoice.dueDate && (
                  <Typography variant="body2">
                    Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Item</strong></TableCell>
                <TableCell align="right"><strong>Price</strong></TableCell>
                <TableCell align="right"><strong>Qty</strong></TableCell>
                <TableCell align="right"><strong>Total</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.productName || 'N/A'}
                    </Typography>
                    {item.productDesc && (
                      <Typography variant="caption" color="text.secondary">
                        {item.productDesc}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    Rp {(item.price || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell align="right">{item.qty}</TableCell>
                  <TableCell align="right">
                    Rp {(item.total || 0).toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ width: 300 }}>
              <Box className="summary-row" sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>Rp {(invoice.subtotal || 0).toLocaleString('id-ID')}</Typography>
              </Box>
              {invoice.tax !== undefined && invoice.tax > 0 && (
                <Box className="summary-row" sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography>Tax:</Typography>
                  <Typography>Rp {invoice.tax.toLocaleString('id-ID')}</Typography>
                </Box>
              )}
              {invoice.discount !== undefined && invoice.discount > 0 && (
                <Box className="summary-row" sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography>Discount:</Typography>
                  <Typography>- Rp {invoice.discount.toLocaleString('id-ID')}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box className="summary-row summary-total" sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">Rp {(invoice.total || 0).toLocaleString('id-ID')}</Typography>
              </Box>
            </Box>
          </Box>

          {invoice.notes && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                NOTES
              </Typography>
              <Typography variant="body2">{invoice.notes}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePreview;
