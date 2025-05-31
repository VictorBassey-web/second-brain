const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [16, 48, 128];
const inputFile = path.join(__dirname, '../icons/icon.svg');
const outputDir = path.join(__dirname, '../icons');

async function generateIcons() {
  try {
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate icons for each size
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `icon${size}.png`);
      await sharp(inputFile)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      console.log(`Generated ${outputFile}`);
    }
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 