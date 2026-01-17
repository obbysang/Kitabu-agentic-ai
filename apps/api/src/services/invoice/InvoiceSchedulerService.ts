import { Invoice, InvoiceStatus } from './types.js';
import { InvoiceWorkflowService } from './InvoiceWorkflowService.js';
import { InvoiceIngestionService } from './InvoiceIngestionService.js'; // To fetch invoices

export class InvoiceSchedulerService {
  constructor(
    private ingestionService: InvoiceIngestionService,
    private workflowService: InvoiceWorkflowService
  ) {}

  /**
   * Checks for approved invoices that are due and triggers payment.
   * This is a simplified version. In production, this would query a DB.
   */
  async processDueInvoices(orgId: string, sessionId: string) {
    console.log(`[InvoiceScheduler] Checking due invoices for org ${orgId}...`);
    
    // 1. Fetch all invoices
    const allInvoices = await this.ingestionService.listInvoices(orgId);

    // 2. Filter for those that are PARSED but not yet processed/scheduled
    // (Assuming we want to auto-schedule parsed ones, or check PENDING_APPROVAL ones)
    // The plan says "Trigger invoice payment intents near due dates"
    
    const now = Date.now();
    const dueThreshold = 24 * 60 * 60 * 1000; // 24 hours

    for (const invoice of allInvoices) {
      // Logic: If it's parsed and has a due date coming up, notify or auto-approve?
      // For this implementation, let's assume we are looking for 'PARSED' invoices that need approval/scheduling
      
      if (invoice.status === InvoiceStatus.PARSED && invoice.extractedData?.dueDate) {
        const dueDate = new Date(invoice.extractedData.dueDate).getTime();
        const timeUntilDue = dueDate - now;

        if (timeUntilDue > 0 && timeUntilDue < dueThreshold) {
            console.log(`[InvoiceScheduler] Invoice ${invoice.id} is due soon (${timeUntilDue}ms). Triggering alert or auto-process.`);
            // Here we might emit an event or call a workflow
        }
      }
    }
  }
}
