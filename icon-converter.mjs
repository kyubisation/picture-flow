import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

async function convert() {
  const assetsDir = join(dirname(fileURLToPath(import.meta.url)), 'src/assets');
  const svgIcon = readFileSync(join(assetsDir, 'material-camera.svg'));
  const dimensions = [72, 96, 128, 144, 152, 192, 384, 512];

  mkdirSync(join(assetsDir, 'icons'), { recursive: true });
  for (const dimension of dimensions) {
    const fileName = `icon-${dimension}x${dimension}.png`;
    console.log(`Converting ${fileName}`);
    await sharp(svgIcon)
      .resize(dimension, dimension)
      .png()
      .toBuffer()
      .then((data) => {
        const filePath = join(assetsDir, 'icons', fileName);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
        writeFileSync(filePath, data);
      })
      .catch(console.error);
  }
}

convert();
