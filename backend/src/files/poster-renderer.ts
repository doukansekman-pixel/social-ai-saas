import sharp from 'sharp';

export async function renderBettingPoster(filePath: string, post: any) {
  return sharp(filePath)
    .resize(1080, 1350, {
      fit: 'contain',
      background: '#000000',
    })
    .png()
    .toBuffer();
}
