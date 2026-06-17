const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

const extractText = async (filePath, mimeType) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    let extractedText = '';

    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (mimeType.startsWith('image/')) {
      const result = await Tesseract.recognize(filePath, 'eng');
      extractedText = result.data.text;
    } else {
      throw new Error('Unsupported mime type for OCR extraction.');
    }

    return extractedText;
  } catch (error) {
    console.error('OCR Extraction Service Error:', error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

module.exports = { extractText };
