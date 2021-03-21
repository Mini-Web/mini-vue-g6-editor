import toBase64 from 'image-to-base64/browser';
import Canvg from 'canvg';

const images = new Map();
const isSvg = (src = '') => src.split('.').reverse()[0] === 'svg';

export const imageToBase64 = async src => {
  if (!images.has(src)) {
    console.log('init src', src);
    if (!isSvg(src)) {
      images.set(
        src,
        toBase64(src).then(imgInfo => `data:image/png;base64,${imgInfo}`)
      );
    } else {
      await createCanvasImage(src, images);
    }
  }

  return images.get(src);
};

async function createCanvasImage(src, images) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let v = await Canvg.from(ctx, src);
  v.render();
  images.set(src, canvas);
}
