// scripts/optimize-images.js
import fs      from 'fs/promises';
import path    from 'path';
import sharp   from 'sharp';

const SRC = path.join('assets','images');
const OUT = path.join('assets','images_opt');

async function processDir(dir){
  for (let entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDir(fullPath);
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      const rel   = path.relative(SRC, fullPath);
      const outFn = path.join(OUT, rel);
      await fs.mkdir(path.dirname(outFn), { recursive: true });

      // 1. JPEG/PNG recompressé (~85% qualité)
      await sharp(fullPath)
        .jpeg({ quality: 85 })
        .toFile(outFn);

      // 2. WebP (~80% qualité)
      await sharp(fullPath)
        .webp({ quality: 80 })
        .toFile(outFn.replace(/\.\w+$/, '.webp'));

      // 3. AVIF (~50% qualité)
      await sharp(fullPath)
        .avif({ quality: 50 })
        .toFile(outFn.replace(/\.\w+$/, '.avif'));

      console.log(`✅ ${rel}`);
    }
  }
}

processDir(SRC)
  .then(()=> console.log('🎉 Toutes les images sont optimisées !'))
  .catch(err=> console.error(err));
