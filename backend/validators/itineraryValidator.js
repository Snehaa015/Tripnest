const validateItineraryGenerate = (req, res, next) => {
  const { extractedData, tempFile } = req.body;

  if (!extractedData) {
    return res.status(400).json({ success: false, message: 'Extracted data is required' });
  }

  const { destination } = extractedData;

  if (!destination || destination.trim() === '') {
    return res.status(400).json({ success: false, message: 'Destination is a required field' });
  }

  if (!tempFile || !tempFile.filename) {
    return res.status(400).json({ success: false, message: 'Uploaded file metadata is required' });
  }

  next();
};

module.exports = {
  validateItineraryGenerate
};
