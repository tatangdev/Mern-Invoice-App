export interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
}

export interface InvoiceItem {
  productId?: string;
  product?: string;
  productName?: string;
  productDesc?: string;
  price?: number;
  qty: number;
  total?: number;
}

export interface Invoice {
  id?: string;
  recipient: string;
  number: string;
  items: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  status: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
