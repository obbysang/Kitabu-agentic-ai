import { v4 as uuidv4 } from 'uuid';
import { Invoice, InvoiceStatus } from './types.js';
import * as fs from 'fs';
import * as path from 'path';

export class InvoiceIngestionService {
  private storageDir: string;
  private invoices: Map<string, Invoice> = new Map(); // In-memory store for demo

  constructor(storageDir: string) {
    this.storageDir = storageDir;
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Ingests a raw invoice file.
   * In a real app, this would handle file streams from an HTTP upload.
   */
  async ingestInvoice(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
    orgId: string,
    mimeType: string
  ): Promise<Invoice> {
    const invoiceId = uuidv4();
    const fileExtension = path.extname(fileName);
    const storedFileName = `${invoiceId}${fileExtension}`;
    const storagePath = path.join(this.storageDir, storedFileName);

    // Securely write file to disk
    await fs.promises.writeFile(storagePath, fileBuffer);

    const invoice: Invoice = {
      id: invoiceId,
      status: InvoiceStatus.UPLOADED,
      metadata: {
        originalFileName: fileName,
        uploadedBy: userId,
        orgId: orgId,
        mimeType: mimeType,
        fileSize: fileBuffer.length,
      },
      storagePath: storagePath,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.invoices.set(invoiceId, invoice);
    
    // Log ingestion
    console.log(`[InvoiceIngestion] Ingested invoice ${invoiceId} for org ${orgId}`);

    return invoice;
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async listInvoices(orgId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (inv) => inv.metadata.orgId === orgId
    );
  }
}
