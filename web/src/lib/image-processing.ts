// Image processing utilities for emoticon generation
import { ImageProcessor } from './image-processor-enhanced';

export interface EmoticonData {
  keyword: string;
  imageData: string; // base64 or blob URL
}

export interface ProcessedEmoticon {
  keyword: string;
  mainImage: string; // 240x240
  thumbnail: string; // 120x120
  icon: string; // 50x50
}

/**
 * Add watermark to an image
 */
export async function addWatermark(
  imageUrl: string,
  watermarkText: string = '无解',
  options: {
    opacity?: number;
    fontSize?: number;
    color?: string;
    rotation?: number;
  } = {}
): Promise<string> {
  const {
    opacity = 0.8,
    fontSize = 32,
    color = '#ffffff',
    rotation = -45
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // 检查是否在浏览器环境
      if (typeof document === 'undefined') {
        console.warn('Canvas API not available in server environment, returning original image');
        resolve(imageUrl);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('Cannot get 2D context from canvas');
        resolve(imageUrl);
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Add watermark
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.fillStyle = color;
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Move to center and rotate
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);

          // Add text shadow for better visibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          ctx.fillText(watermarkText, 0, 0);
          ctx.restore();

          resolve(canvas.toDataURL('image/png'));
        } catch (canvasError) {
          console.warn('Canvas processing fallback triggered');
          resolve(imageUrl); // 回退到原图
        }
      };

      img.onerror = () => {
        console.warn('Image loading failed in watermark, using fallback');
        resolve(imageUrl); // 回退到原图
      };

      img.crossOrigin = 'anonymous';

      // 检查图片URL是否有效
      if (!imageUrl || imageUrl.trim() === '') {
        console.error('Invalid image URL provided');
        reject(new Error('Invalid image URL'));
        return;
      }

      img.src = imageUrl;
    } catch (error) {
      console.error('Watermark function error:', error);
      resolve(imageUrl); // 回退到原图
    }
  });
}

/**
 * Add text overlay to an image (for keywords)
 */
export async function addTextOverlay(
  imageUrl: string,
  text: string,
  options: {
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    position?: 'top' | 'bottom' | 'center';
  } = {}
): Promise<string> {
  const {
    fontSize = 16,
    color = '#ffffff',
    backgroundColor = 'rgba(0, 0, 0, 0.7)',
    position = 'bottom'
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // 检查是否在浏览器环境
      if (typeof document === 'undefined') {
        console.warn('Canvas API not available in server environment, returning original image');
        resolve(imageUrl);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('Cannot get 2D context from canvas');
        resolve(imageUrl);
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Calculate text position
          ctx.font = `bold ${fontSize}px Arial`;
          const textMetrics = ctx.measureText(text);
          const textWidth = textMetrics.width;
          const textHeight = fontSize;

          let x = (canvas.width - textWidth) / 2;
          let y: number;

          switch (position) {
            case 'top':
              y = textHeight + 10;
              break;
            case 'center':
              y = canvas.height / 2;
              break;
            case 'bottom':
            default:
              y = canvas.height - 15;
              break;
          }

          // Draw background rectangle
          const padding = 8;
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(
            x - padding,
            y - textHeight,
            textWidth + padding * 2,
            textHeight + padding
          );

          // Draw text
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, canvas.width / 2, y - textHeight / 2);

          resolve(canvas.toDataURL('image/png'));
        } catch (canvasError) {
          console.warn('Canvas text overlay fallback triggered');
          resolve(imageUrl); // 回退到原图
        }
      };

      img.onerror = () => {
        console.warn('Image loading failed in text overlay, using fallback');
        resolve(imageUrl); // 回退到原图
      };

      img.crossOrigin = 'anonymous';

      // 检查图片URL是否有效
      if (!imageUrl || imageUrl.trim() === '') {
        console.error('Invalid image URL provided for text overlay');
        reject(new Error('Invalid image URL'));
        return;
      }

      img.src = imageUrl;
    } catch (error) {
      console.error('Text overlay function error:', error);
      resolve(imageUrl); // 回退到原图
    }
  });
}

/**
 * Resize image to specific dimensions
 */
export async function resizeImage(
  imageUrl: string,
  width: number,
  height: number,
  maintainAspectRatio: boolean = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 检查是否在浏览器环境
      if (typeof document === 'undefined') {
        console.warn('Canvas API not available in server environment, returning original image');
        resolve(imageUrl);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('Cannot get 2D context from canvas');
        resolve(imageUrl);
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
          let targetWidth = width;
          let targetHeight = height;

          if (maintainAspectRatio) {
            const aspectRatio = img.width / img.height;
            if (width / height > aspectRatio) {
              targetWidth = height * aspectRatio;
            } else {
              targetHeight = width / aspectRatio;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Center the image if maintaining aspect ratio
          const offsetX = (width - targetWidth) / 2;
          const offsetY = (height - targetHeight) / 2;

          // Fill background with white for transparency
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, offsetX, offsetY, targetWidth, targetHeight);

          resolve(canvas.toDataURL('image/png'));
        } catch (canvasError) {
          console.warn('Canvas resize fallback triggered');
          resolve(imageUrl); // 回退到原图
        }
      };

      img.onerror = () => {
        console.warn('Image loading failed in resize, using fallback');
        resolve(imageUrl); // 回退到原图
      };

      img.crossOrigin = 'anonymous';

      // 检查图片URL是否有效
      if (!imageUrl || imageUrl.trim() === '') {
        console.error('Invalid image URL provided for resize');
        reject(new Error('Invalid image URL'));
        return;
      }

      img.src = imageUrl;
    } catch (error) {
      console.error('Resize function error:', error);
      resolve(imageUrl); // 回退到原图
    }
  });
}

/**
 * Process a single emoticon to all required sizes
 */
export async function processEmoticon(
  imageUrl: string,
  keyword: string,
  addWatermarkToPreview: boolean = true
): Promise<ProcessedEmoticon> {
  try {
    console.log(`开始处理表情包: ${keyword}, URL: ${imageUrl}`);

    // 验证输入参数
    if (!imageUrl || imageUrl.trim() === '') {
      console.error('Invalid image URL provided to processEmoticon');
      throw new Error(`无效的图片URL: ${imageUrl}`);
    }

    if (!keyword || keyword.trim() === '') {
      console.error('Invalid keyword provided to processEmoticon');
      throw new Error(`无效的关键词: ${keyword}`);
    }

    // 使用安全的图片加载器检查和预处理图片
    console.log(`检查图片可访问性: ${keyword}`);
    const safeImageUrl = await ImageProcessor.loadImageSafely(imageUrl);

    // Create main image (240x240) with text overlay
    console.log(`为 "${keyword}" 添加文字覆盖层...`);
    const mainImageWithText = await addTextOverlay(safeImageUrl, keyword, {
      fontSize: 18,
      position: 'bottom'
    });

    let mainImage = mainImageWithText;
    if (addWatermarkToPreview) {
      console.log(`为 "${keyword}" 添加水印...`);
      mainImage = await addWatermark(mainImageWithText);
    }

    // Create thumbnail (120x120)
    console.log(`为 "${keyword}" 创建缩略图...`);
    const thumbnail = await resizeImage(mainImage, 120, 120, true);

    // Create icon (50x50) - cropped to center
    console.log(`为 "${keyword}" 创建图标...`);
    const icon = await resizeImage(mainImage, 50, 50, false);

    console.log(`成功处理表情包: ${keyword}`);

    return {
      keyword,
      mainImage,
      thumbnail,
      icon
    };
  } catch (error) {
    console.warn(`处理表情包 "${keyword}" 时使用占位符`);

    // 使用Canvas生成的占位符，避免网络请求
    const safeKeyword = keyword || '错误';
    const placeholderMain = ImageProcessor.createPlaceholderImage(240, 240, safeKeyword, '#ff6b6b', '#ffffff');
    const placeholderThumb = ImageProcessor.createPlaceholderImage(120, 120, safeKeyword, '#ff6b6b', '#ffffff');
    const placeholderIcon = ImageProcessor.createPlaceholderImage(50, 50, safeKeyword.substring(0, 2), '#ff6b6b', '#ffffff');

    return {
      keyword: safeKeyword,
      mainImage: placeholderMain,
      thumbnail: placeholderThumb,
      icon: placeholderIcon
    };
  }
}

/**
 * Create banner image from first 3 emoticons
 */
export async function createBanner(
  emoticons: ProcessedEmoticon[],
  title: string = 'AI生成表情包'
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = 750;
  canvas.height = 400;

  // Fill background with gradient
  const gradient = ctx.createLinearGradient(0, 0, 750, 400);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 750, 400);

  // Add emoticons (first 3)
  const emoticonsToShow = emoticons.slice(0, 3);
  const emoticonWidth = 150;
  const emoticonHeight = 150;
  const startX = (750 - (emoticonsToShow.length * emoticonWidth + (emoticonsToShow.length - 1) * 20)) / 2;
  const emoticonY = 50;

  for (let i = 0; i < emoticonsToShow.length; i++) {
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => {
        const x = startX + i * (emoticonWidth + 20);
        ctx.drawImage(img, x, emoticonY, emoticonWidth, emoticonHeight);
        resolve();
      };
      img.crossOrigin = 'anonymous';
      img.src = emoticons[i].mainImage;
    });
  }

  // Add title text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText(title, 375, 300);

  return canvas.toDataURL('image/png');
}

/**
 * Convert data URL to Blob
 */
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}