import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Source file: inside public/images/logo/
const sourcePath = path.resolve(__dirname, '../public/images/logo/logo-512x512.png');

const icons = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },   // maskable version usually also 512x512
];

async function generate() {
  for (const { name, size } of icons) {
    await sharp(sourcePath)
      .resize(size, size)
      .png()
      .toFile(path.resolve(__dirname, '../public', name));
    console.log(`✓ ${name}`);
  }

  // Generate favicon.ico (multi-size – we use 32x32 PNG inside .ico extension, works everywhere)
  await sharp(sourcePath)
    .resize(32, 32)
    .png()
    .toFile(path.resolve(__dirname, '../public/favicon.ico'));
  console.log('✓ favicon.ico');
}

generate().catch(console.error);