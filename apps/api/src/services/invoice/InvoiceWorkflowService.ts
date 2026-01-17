import { v4 as uuidv4 } from 'uuid';
import { Invoice, InvoiceStatus, ExtractedInvoiceData } from './types.js';
import { X402Intent, X402IntentStatus } from '../x402/types.js';

export class InvoiceWorkflowService {
  
  /**
   * Approves an invoice and generates an x402 payment intent.
   */
  async approveInvoice(
    invoice: Invoice, 
    approverId: string, 
    sessionId: string
  ): Promise<{ invoice: Invoice; intent: X402Intent }> {
    
    if (invoice.status !== InvoiceStatus.PARSED) {
      throw new Error(`Cannot approve invoice in status ${invoice.status}`);
    }

    if (!invoice.extractedData) {
      throw new Error('Invoice is missing extracted data');
    }

    // 1. Create x402 Intent
    const intent: X402Intent = this.createPaymentIntent(invoice, sessionId);

    // 2. Update Invoice State
    const updatedInvoice: Invoice = {
      ...invoice,
      status: InvoiceStatus.PENDING_APPROVAL, // Or SCHEDULED depending on flow, let's say pending x402 execution
      paymentIntentId: intent.id,
      approvedBy: approverId,
      approvalDate: Date.now(),
      updatedAt: Date.now(),
    };

    console.log(`[InvoiceWorkflow] Approved invoice ${invoice.id}, created intent ${intent.id}`);

    return { invoice: updatedInvoice, intent };
  }

  /**
   * Maps extracted invoice data to an x402-compatible payment intent.
   */
  private createPaymentIntent(invoice: Invoice, sessionId: string): X402Intent {
    const data = invoice.extractedData!;

    // Construct the payload for the x402 facilitator
    // This structure depends on the specific facilitator agent's expected input
    const payload = {
      action: 'payment',
      recipient: data.destinationAddress,
      token: data.tokenSymbol,
      amount: data.amount,
      metadata: {
        invoiceId: data.invoiceId,
        vendor: data.vendorName,
        source: 'kitabu-invoice-processing',
      },
    };

    return {
      id: uuidv4(),
      sessionId: sessionId,
      type: 'payment',
      payload: payload,
      status: X402IntentStatus.CREATED,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Updates invoice status based on x402 intent status changes.
   * This would be called by a webhook or polling service.
   */
  async syncInvoiceStatus(invoice: Invoice, intentStatus: X402IntentStatus): Promise<Invoice> {
    let newInvoiceStatus = invoice.status;

    switch (intentStatus) {
      case X402IntentStatus.SETTLED:
        newInvoiceStatus = InvoiceStatus.PAID;
        break;
      case X402IntentStatus.FAILED:
        newInvoiceStatus = InvoiceStatus.FAILED;
        break;
      case X402IntentStatus.PROCESSING:
      case X402IntentStatus.PENDING:
        newInvoiceStatus = InvoiceStatus.SCHEDULED; // or Processing
        break;
    }

    if (newInvoiceStatus !== invoice.status) {
      const updatedInvoice = {
        ...invoice,
        status: newInvoiceStatus,
        updatedAt: Date.now(),
      };
      console.log(`[InvoiceWorkflow] Synced invoice ${invoice.id} status to ${newInvoiceStatus}`);
      return updatedInvoice;
    }

    return invoice;
  }
}
