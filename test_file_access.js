// Quick test script to verify file access
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test if Kerise's files exist and are readable
const files = [
  'IMG_7030.png',
  'IMG_7029.png', 
  'Paystub_06.20.2025.pdf'
];

files.forEach(fileName => {
  const filePath = path.join(__dirname, 'attached_assets', fileName);
  try {
    const stats = fs.statSync(filePath);
    console.log(`✓ ${fileName}: ${stats.size} bytes, readable: ${fs.constants.R_OK}`);
    
    // Test reading first 100 bytes to verify it's real content
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(100);
    const bytesRead = fs.readSync(fd, buffer, 0, 100, 0);
    fs.closeSync(fd);
    
    // Check if it's a real image (PNG signature) or PDF
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isPDF = buffer.toString('ascii', 0, 4) === '%PDF';
    
    console.log(`  File type: ${isPNG ? 'PNG' : isPDF ? 'PDF' : 'Unknown'}, First bytes: ${buffer.slice(0, 10).toString('hex')}`);
  } catch (error) {
    console.log(`✗ ${fileName}: Error - ${error.message}`);
  }
});