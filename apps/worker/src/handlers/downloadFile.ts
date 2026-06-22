import { ExecutionContext, StepHandler } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';

export const downloadFileHandler: StepHandler = async (step, context) => {
  const selector = step.selector;
  const fieldName = step.field_name;
  const allowedExtensions = step.allowed_extensions ? step.allowed_extensions.split(',').map((e: string) => e.trim().toLowerCase()) : [];
  const timeoutMs = step.timeout_ms || 30000;
  const isRequired = step.required !== false; // Default to true

  try {
    // Wait for the download event and click simultaneously
    const [download] = await Promise.all([
      context.page.waitForEvent('download', { timeout: timeoutMs }),
      context.page.click(selector)
    ]);

    const originalFilename = download.suggestedFilename();
    const ext = path.extname(originalFilename).toLowerCase();
    
    // Check extensions
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext.replace('.', ''))) {
      throw new Error(`Downloaded file extension ${ext} is not in allowed extensions: ${allowedExtensions.join(', ')}`);
    }

    // Prepare local storage path
    const now = new Date();
    const yyyy = now.getFullYear().toString();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const safeFilename = `${uuidv4()}${ext}`;
    
    // /app/storage is mapped to the local physical volume
    const storageDir = path.join('/app/storage', 'downloads', yyyy, mm, dd);
    const localPath = path.join(storageDir, safeFilename);

    await fs.promises.mkdir(storageDir, { recursive: true });
    await download.saveAs(localPath);
    
    // Mime type guessing
    let mimeType = 'application/octet-stream';
    if (ext === '.pdf') mimeType = 'application/pdf';
    else if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (ext === '.xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';

    const sizeBytes = fs.statSync(localPath).size;

    let extractedText = null;
    let status = 'ready'; // "ready", "pending", "failed"

    // PDF parsing
    if (ext === '.pdf') {
      try {
        const dataBuffer = await fs.promises.readFile(localPath);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      } catch (parseErr: any) {
        console.error(`[Worker] PDF Parse failed: ${parseErr.message}`);
        status = 'failed';
      }
    }

    // Save Document record
    const documentRecord = await context.prisma.document.create({
      data: {
        projectId: context.projectId,
        sourceUrl: context.currentUrl,
        originalUrl: download.url(),
        filename: safeFilename,
        originalFilename: originalFilename,
        mimeType: mimeType,
        sizeBytes: sizeBytes,
        localPath: localPath,
        extractedText: extractedText,
        status: status as 'ready' | 'pending' | 'failed'
      }
    });

    // Store document ID in extracted data so saveRecord can link it later
    context.extractedData[fieldName] = documentRecord.id;

    // We don't have a specific file downloaded stat, but we can log it.
    // context.stats.filesDownloaded is available if we add it to execution context stats
    if ((context.stats as any).filesDownloaded !== undefined) {
      (context.stats as any).filesDownloaded += 1;
    }

  } catch (err: any) {
    if (isRequired) {
      throw err; // Fail the step
    } else {
      console.warn(`[Worker] DOWNLOAD_FILE (optional) failed: ${err.message}`);
    }
  }
};
