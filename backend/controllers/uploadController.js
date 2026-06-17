const ocrService = require('../services/ocrService');
const geminiService = require('../services/geminiService');
const fs = require('fs');

const uploadDocument = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded or file rejected by validator' });
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    // 1. Run OCR to extract text
    console.log(`Running OCR extraction on file: ${req.file.originalname} (${mimeType})`);
    const rawText = await ocrService.extractText(filePath, mimeType);
    
    if (!rawText || rawText.trim() === '') {
      // Clean up file
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(422).json({
        success: false,
        message: 'Could not extract any text from the document. Please check the document quality or upload a different one.'
      });
    }

    // 2. Parse extracted text with Gemini
    console.log('Parsing extracted raw text using Gemini API...');
    const extractedData = await geminiService.parseExtractedData(rawText);

    // Return the data and the file metadata (excluding local path for security)
    const fileMetadata = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    };

    res.status(200).json({
      success: true,
      message: 'Document uploaded and structured fields extracted successfully',
      data: {
        extractedData,
        tempFile: fileMetadata
      }
    });

  } catch (error) {
    console.error('Error during document processing:', error.message);
    next(error);
  } finally {
    // Delete the temporary file from the server disk to save space and enhance security
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted temp file: ${filePath}`);
      }
    } catch (cleanupError) {
      console.error('Failed to delete temporary upload file:', cleanupError.message);
    }
  }
};

module.exports = {
  uploadDocument
};
