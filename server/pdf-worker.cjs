// Standalone PDF parser worker - CommonJS to avoid module issues
const fs = require('fs');

// Set module.parent to prevent debug mode in pdf-parse
process.env.NODE_ENV = 'production';

const pdfParse = require('pdf-parse');

async function extractPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    return {
      text: data.text,
      pages: data.numpages,
      title: data.info?.Title,
      author: data.info?.Author,
      subject: data.info?.Subject,
      producer: data.info?.Producer,
      creator: data.info?.Creator,
    };
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

// Get file path from command line
const filePath = process.argv[2];
if (!filePath) {
  console.error('No file path provided');
  process.exit(1);
}

extractPDF(filePath)
  .then(result => {
    console.log(JSON.stringify(result));
    process.exit(0);
  })
  .catch(error => {
    console.error(error.message);
    process.exit(1);
  });