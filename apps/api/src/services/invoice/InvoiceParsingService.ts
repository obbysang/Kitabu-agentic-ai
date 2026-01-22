import { Invoice, InvoiceStatus, ExtractedInvoiceData } from './types.js';

// Mock interface for the AI Agent SDK response
interface AIParseResult {
  destination_address: string;
  token: string;
  amount: string;
  due_date: string;
  invoice_id: string;
  vendor_name: string;
  confidence: number;
}

export class InvoiceParsingService {
  constructor() {
    // Initialize AI Agent SDK client here if available
  }

  /**
   * Parses an invoice using AI to extract structured data.
   */
  async parseInvoice(invoice: Invoice): Promise<Invoice> {
    console.log(`[InvoiceParsing] Starting extraction for invoice ${invoice.id}...`);

    try {
      // In a real implementation, we would read the file from invoice.storagePath
      // and send it to the AI Agent SDK or an OCR service.
      
      // MOCK: Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // MOCK: Return deterministic extracted data for demo purposes
      // We'll generate "valid" data based on the invoice ID to seem realistic
      const mockExtraction = this.mockAIExtraction(invoice);

      // Validate extracted data (basic checks)
      this.validateExtractedData(mockExtraction);

      // Update invoice
      const updatedInvoice: Invoice = {
        ...invoice,
        status: InvoiceStatus.PARSED,
        extractedData: mockExtraction,
        updatedAt: Date.now(),
      };

      console.log(`[InvoiceParsing] Successfully extracted data for ${invoice.id}`);
      return updatedInvoice;

    } catch (error) {
      console.error(`[InvoiceParsing] Failed to parse invoice ${invoice.id}:`, error);
      // Return invoice in failed state or just log error? 
      // We'll update status to FAILED for this flow
      return {
        ...invoice,
        status: InvoiceStatus.FAILED,
        updatedAt: Date.now(),
      };
    }
  }

  private mockAIExtraction(invoice: Invoice): ExtractedInvoiceData {
    return {
      destinationAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Example address
      tokenSymbol: 'USDC',
      amount: '1500.00',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      invoiceId: `INV-${invoice.id.substring(0, 8).toUpperCase()}`,
      vendorName: 'Acme Corp Web3 Services',
      vendorMetadata: {
        category: 'Software Services',
        taxId: 'US-999-999',
      },
      confidenceScore: 0.98,
    };
  }

  private validateExtractedData(data: ExtractedInvoiceData) {
    // Basic validation logic
    if (!data.destinationAddress.startsWith('0x')) {
      throw new Error('Invalid destination address extracted');
    }
    if (isNaN(parseFloat(data.amount))) {
      throw new Error('Invalid amount extracted');
    }
    // More checks can be added here
  }
}
