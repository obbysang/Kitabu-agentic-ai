export enum InvoiceStatus {
  UPLOADED = 'uploaded',
  PARSED = 'parsed',
  PENDING_APPROVAL = 'pending_approval',
  SCHEDULED = 'scheduled',
  PAID = 'paid',
  FAILED = 'failed',
}

export interface InvoiceMetadata {
  originalFileName: string;
  uploadedBy: string; // userId
  orgId: string;
  mimeType: string;
  fileSize: number;
}

export interface ExtractedInvoiceData {
  destinationAddress: string;
  tokenSymbol: string;
  amount: string;
  dueDate?: string; // ISO date string
  invoiceId?: string; // Vendor's invoice number
  vendorName?: string;
  vendorMetadata?: Record<string, any>;
  confidenceScore: number; // 0-1
}

export interface Invoice {
  id: string;
  status: InvoiceStatus;
  metadata: InvoiceMetadata;
  extractedData?: ExtractedInvoiceData;
  storagePath: string; // Path to the stored PDF
  paymentIntentId?: string; // Linked x402 intent ID
  createdAt: number;
  updatedAt: number;
  approvedBy?: string; // userId of approver
  approvalDate?: number;
}
