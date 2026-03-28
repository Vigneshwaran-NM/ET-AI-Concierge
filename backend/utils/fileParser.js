const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

/**
 * Extracts raw text from an uploaded file.
 * Supports PDF, TXT, CSV.
 * @param {Express.Multer.File} file - The uploaded file from multer
 * @returns {Promise<string>} - Extracted text content
 */
const extractText = async (file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const buffer = fs.readFileSync(file.path);

    if (ext === '.pdf') {
        const data = await pdfParse(buffer);
        // Limit extracted text to first 3000 chars to fit LLM context
        return data.text.substring(0, 3000).trim();
    }

    if (ext === '.txt' || ext === '.csv') {
        return buffer.toString('utf-8').substring(0, 3000).trim();
    }

    throw new Error(`Unsupported file type: ${ext}. Please upload PDF, TXT, or CSV.`);
};

module.exports = { extractText };
