import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Change these paths if your folders are different
const inputDir = path.join(process.cwd(), 'public/emojis/apple/64');
const outputDir = path.join(process.cwd(), 'public/emojis/apple/webp');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function convertAll() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));
  console.log(`Found ${files.length} PNGs. Converting to WebP... Hold on to your butts.`);

  let count = 0;
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace('.png', '.webp'));

    try {
      // Convert to WebP with 80% quality (virtually lossless for tiny icons)
      await sharp(inputPath)
        .webp({ quality: 80, effort: 6 }) 
        .toFile(outputPath);
      
      count++;
      
      // Optional: Delete the original PNG to immediately free up space
      // fs.unlinkSync(inputPath); 
      
      if (count % 500 === 0) console.log(`Converted ${count}/${files.length}...`);
    } catch (err) {
      console.error(`Failed to convert ${file}:`, err);
    }
  }
  console.log('✅ Boom. All done. Check your webp folder.');
}

convertAll();