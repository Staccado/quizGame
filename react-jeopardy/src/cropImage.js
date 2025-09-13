export const getCroppedImg = async (imageSrc, crop, displayDimensions, scale = 1, rotate = 0) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise(resolve => { image.onload = resolve; });

  // Use the display dimensions from the cropper instead of the new image's dimensions
  const displayWidth = displayDimensions.width;
  const displayHeight = displayDimensions.height;
  const naturalWidth = displayDimensions.naturalWidth;
  const naturalHeight = displayDimensions.naturalHeight;


  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Calculate the scale factors using the cropper's display dimensions
  const scaleX = naturalWidth / displayWidth;
  const scaleY = naturalHeight / displayHeight;
  
  // Device pixel ratio for retina displays
  const pixelRatio = window.devicePixelRatio || 1;

  // Set canvas dimensions to match the crop area
  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  // Scale the context to match device pixel ratio
  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  // Calculate crop coordinates in natural image space
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  // Convert rotation to radians
  const TO_RADIANS = Math.PI / 180;
  const rotateRads = rotate * TO_RADIANS;
  const centerX = naturalWidth / 2;
  const centerY = naturalHeight / 2;

  ctx.save();

  // Transform the context for rotation and scaling
  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.rotate(rotateRads);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);

  // Fill background with white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, naturalWidth, naturalHeight);

  // Draw the full image
  ctx.drawImage(
    image,
    0,
    0,
    naturalWidth,
    naturalHeight,
    0,
    0,
    naturalWidth,
    naturalHeight
  );

  ctx.restore();

  // Now create a new canvas for the final podium-sized image
  const finalCanvas = document.createElement('canvas');
  const finalCtx = finalCanvas.getContext('2d');
  
  if (!finalCtx) {
    throw new Error('Failed to get final canvas context');
  }

  // Set final canvas to podium dimensions
  finalCanvas.width = 256; // 16rem * 16px/rem
  finalCanvas.height = 192; // 12rem * 16px/rem

  // Fill background with white
  finalCtx.fillStyle = '#ffffff';
  finalCtx.fillRect(0, 0, 256, 192);

  // Draw the cropped image scaled to podium dimensions
  finalCtx.drawImage(
    canvas,
    0,
    0,
    canvas.width / pixelRatio,
    canvas.height / pixelRatio,
    0,
    0,
    256,
    192
  );

  return new Promise((resolve, reject) => {
    finalCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      blob.name = 'cropped.jpeg';
      const fileUrl = window.URL.createObjectURL(blob);
      resolve(fileUrl);
    }, 'image/jpeg', 0.95);
  });
};