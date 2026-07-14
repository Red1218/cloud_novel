import * as pdfjsLib from 'pdfjs-dist';
// Explicitly import the worker URL to satisfy Vite's bundler and PDF.js requirements.
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface PdfMetadata {
  title: string;
  author?: string;
  pageCount: number;
  thumbnail?: string; // Base64 PNG
}

/**
 * Extracts metadata and a first-page thumbnail from a PDF ArrayBuffer.
 */
export async function extractPdfData(buffer: ArrayBuffer, fileName: string): Promise<PdfMetadata> {
  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  
  const pageCount = pdf.numPages;
  
  // Extract Metadata
  let title = fileName.replace(/\.pdf$/i, ''); // fallback title
  let author: string | undefined;

  try {
    const metaData = await pdf.getMetadata();
    // metaData.info contains the standard PDF info dictionary
    if (metaData.info) {
      const info = metaData.info as any;
      if (info.Title && info.Title.trim().length > 0) {
        title = info.Title.trim();
      }
      if (info.Author && info.Author.trim().length > 0) {
        author = info.Author.trim();
      }
    }
  } catch (error) {
    console.warn('Failed to extract PDF metadata, using fallback filename.', error);
  }

  // Generate Thumbnail (from Page 1)
  let thumbnail: string | undefined;
  try {
    const page = await pdf.getPage(1);
    
    // Use a fixed scale for the thumbnail to keep it small
    const viewport = page.getViewport({ scale: 1.0 });
    const targetWidth = 400; // Desired max width for thumbnail
    const scale = targetWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      } as any;
      
      await page.render(renderContext).promise;
      thumbnail = canvas.toDataURL('image/png');
    }
  } catch (error) {
    console.error('Failed to generate PDF thumbnail.', error);
  }

  return {
    title,
    author,
    pageCount,
    thumbnail,
  };
}
