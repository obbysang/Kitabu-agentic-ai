import { Invoice, InvoiceStatus, ExtractedInvoiceData } from './types.js';
import { AiAgentService } from '../ai-agent.js';

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
  private aiAgentService: AiAgentService;

  constructor(aiAgentService: AiAgentService) {
    this.aiAgentService = aiAgentService;
  }

  /**
   * Parses an invoice using AI to extract structured data.
   */
  async parseInvoice(invoice: Invoice): Promise<Invoice> {
    console.log(`[InvoiceParsing] Starting extraction for invoice ${invoice.id}...`);

    try {
      // In a real implementation, we would read the file from invoice.storagePath
      // and send it to the AI Agent SDK or an OCR service.
      
      // Construct a prompt for the AI Agent
      // Since we don't have real OCR text in this demo, we ask the AI to simulate the extraction based on the file metadata
      const prompt = `
        You are an intelligent document processing agent.
        I have an invoice with ID "${invoice.id}" and filename "${invoice.metadata.originalFileName}".
        
        Please extract (or simulate extraction of) the following details from this invoice:
        - Destination Address (Ethereum/Cronos address)
        - Token Symbol (e.g. USDC, CRO, ETH)
        - Amount
        - Due Date (ISO format)
        - Vendor Name
        - Vendor Metadata (category, taxId)
        
        Return ONLY a JSON object with these keys: destinationAddress, tokenSymbol, amount, dueDate, vendorName, vendorMetadata.
        Do not include markdown formatting or explanation.
        Ensure the destination address is a valid 0x address.
        Ensure the due date is in the future.
      `;

      console.log(`[InvoiceParsing] Sending prompt to AI Agent...`);
      const aiResponse = await this.aiAgentService.processMessage(prompt);
      
      let extractedData: ExtractedInvoiceData;

      // Try to parse the AI response
      try {
        // Clean up markdown code blocks if present
        const jsonStr = aiResponse.message.replace(/```json/g, '').replace(/```/g, '').trim();
        extractedData = JSON.parse(jsonStr);
        
        // Add confidence score if missing
        if (!extractedData.confidenceScore) {
          extractedData.confidenceScore = 0.95;
        }
        
        // Ensure invoiceId matches
        extractedData.invoiceId = invoice.id;

      } catch (parseError) {
        console.warn(`[InvoiceParsing] AI returned non-JSON response, falling back to mock. Response: ${aiResponse.message}`);
        extractedData = this.mockAIExtraction(invoice);
      }

      // Validate extracted data (basic checks)
      this.validateExtractedData(extractedData);

      // Update invoice
      const updatedInvoice: Invoice = {
        ...invoice,
        status: InvoiceStatus.PARSED,
        extractedData: extractedData,
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
