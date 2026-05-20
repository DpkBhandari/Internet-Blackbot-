const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function detectType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = { '.pdf': 'pdf', '.docx': 'docx', '.txt': 'txt', '.csv': 'csv' };
  return map[ext] || null;
}

async function extractText(filePath, fileType) {
  switch (fileType) {
    case 'pdf':  return extractPDF(filePath);
    case 'docx': return extractDOCX(filePath);
    case 'txt':  return fs.promises.readFile(filePath, 'utf8');
    case 'csv':  return extractCSV(filePath);
    default: throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractPDF(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const buffer = await fs.promises.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    logger.warn(`PDF extraction error: ${err.message}`);
    return '';
  }
}

async function extractDOCX(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (err) {
    logger.warn(`DOCX extraction error: ${err.message}`);
    return '';
  }
}

async function extractCSV(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    // Convert CSV to readable text
    const lines = content.split('\n').filter(l => l.trim());
    return lines.join('\n');
  } catch (err) {
    logger.warn(`CSV extraction error: ${err.message}`);
    return '';
  }
}

module.exports = { detectType, extractText };
