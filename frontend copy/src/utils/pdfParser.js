import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import Tesseract from 'tesseract.js';

// Set up the worker using Vite's URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Render a PDF page to canvas and extract image data
 */
const renderPageToImage = async (page, scale = 2) => {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;
  
  return canvas;
};

/**
 * Perform OCR on a canvas element
 */
const performOCR = async (canvas) => {
  const result = await Tesseract.recognize(canvas, 'eng', {
    logger: () => {}, // Suppress logs
  });
  return result.data.text;
};

/**
 * Extract text content from a PDF file
 * Supports both text-based and scanned (image-based) PDFs
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPDF = async (file) => {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    let fullText = '';
    let usedOCR = false;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Try text extraction first
      let pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // If little or no text found, use OCR
      if (pageText.length < 50) {
        console.log(`Page ${i}: Low text content, using OCR...`);
        usedOCR = true;
        
        const canvas = await renderPageToImage(page, 2);
        pageText = await performOCR(canvas);
        pageText = pageText.replace(/\s+/g, ' ').trim();
      }
      
      if (pageText) {
        fullText += pageText + '\n\n';
      }
    }

    const result = fullText.trim();
    
    if (!result || result.length < 10) {
      throw new Error('Could not extract any text from this PDF.');
    }
    
    if (usedOCR) {
      console.log('OCR was used to extract text from scanned PDF');
    }
    
    return result;
  } catch (error) {
    console.error('PDF extraction error:', error);
    
    // Provide more helpful error messages
    if (error.message?.includes('password')) {
      throw new Error('This PDF is password protected. Please upload an unprotected version.');
    }
    if (error.message?.includes('Invalid PDF')) {
      throw new Error('The file appears to be corrupted or not a valid PDF. Please try another file.');
    }
    
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Unknown error'}. Please try a different file.`);
  }
};

/**
 * Extract text from DOCX file
 * @param {File} file - The DOCX file
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromDocx = async (file) => {
  try {
    // Read as text and try to extract readable content
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
    
    // Extract text between common XML text tags
    const matches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
    const extractedText = matches
      .map(m => m.replace(/<[^>]+>/g, ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (extractedText.length < 50) {
      // Fallback: try to get any readable text
      const fallbackText = text
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (fallbackText.length >= 50) {
        return fallbackText;
      }
      
      throw new Error('Could not extract meaningful text from DOCX');
    }
    
    return extractedText;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX. Please try PDF format for better results.');
  }
};

/**
 * Extract text from a file based on its type
 * @param {File} file - The file to extract text from
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromFile = async (file) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // PDF files
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  }
  
  // DOCX files
  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return extractTextFromDocx(file);
  }
  
  // Plain text files
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    const text = await file.text();
    if (text.length < 50) {
      throw new Error('The text file appears to be too short. Please upload a resume with more content.');
    }
    return text;
  }
  
  // Unknown file type - try as text if it's small enough
  if (file.size < 1024 * 1024) {
    try {
      const text = await file.text();
      if (text.length >= 100 && !text.includes('\0')) {
        return text;
      }
    } catch {
      // Ignore and throw unsupported error
    }
  }
  
  throw new Error(`Unsupported file type: ${fileType || 'unknown'}. Please upload PDF, DOCX, or TXT.`);
};
