export const getCroppedImg = async (imageSrc, crop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise(resolve => { image.onload = resolve; });

  const canvas = document.createElement('canvas');
  const podiumWidth = 256; // 16rem * 16px/rem
  const podiumHeight = 192; // 12rem * 16px/rem
  canvas.width = podiumWidth;
  canvas.height = podiumHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    podiumWidth,
    podiumHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      blob.name = 'cropped.jpeg';
      const fileUrl = window.URL.createObjectURL(blob);
      resolve(fileUrl);
    }, 'image/jpeg');
  });
};