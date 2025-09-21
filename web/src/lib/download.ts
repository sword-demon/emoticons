// Download and packaging utilities for emoticon sets

import JSZip from 'jszip';
import { ProcessedEmoticon, createBanner, dataURLToBlob } from './image-processing';

export interface EmoticonPackage {
  watermarked: Blob;
  premium: Blob;
}

/**
 * Create ZIP package with watermarked emoticons (free version)
 */
export async function createWatermarkedPackage(
  emoticons: ProcessedEmoticon[],
  packageTitle: string = 'AI表情包'
): Promise<Blob> {
  const zip = new JSZip();

  // Create folders
  const mainFolder = zip.folder('main');
  const thumbFolder = zip.folder('thumb');
  const iconFolder = zip.folder('icon');
  const bannerFolder = zip.folder('banner');

  // Add main images (240x240)
  for (let i = 0; i < emoticons.length; i++) {
    const emoticon = emoticons[i];
    const blob = dataURLToBlob(emoticon.mainImage);
    mainFolder!.file(`${String(i + 1).padStart(2, '0')}.png`, blob);
  }

  // Add thumbnails (120x120)
  for (let i = 0; i < emoticons.length; i++) {
    const emoticon = emoticons[i];
    const blob = dataURLToBlob(emoticon.thumbnail);
    thumbFolder!.file(`${String(i + 1).padStart(2, '0')}-thumb.png`, blob);
  }

  // Add icons (50x50)
  for (let i = 0; i < emoticons.length; i++) {
    const emoticon = emoticons[i];
    const blob = dataURLToBlob(emoticon.icon);
    iconFolder!.file(`${String(i + 1).padStart(2, '0')}-icon.png`, blob);
  }

  // Create and add banner
  const bannerDataUrl = await createBanner(emoticons, packageTitle);
  const bannerBlob = dataURLToBlob(bannerDataUrl);
  bannerFolder!.file('banner.png', bannerBlob);

  // Add README file
  const readmeContent = `# ${packageTitle}

这是一个由AI生成的表情包集合，包含16个表情。

## 文件结构

- main/ - 主图 (240x240px)
- thumb/ - 缩略图 (120x120px)
- icon/ - 图标 (50x50px)
- banner/ - 横幅图 (750x400px)

## 使用说明

1. 本包为水印预览版本
2. 如需无水印高清版本，请购买高级版本
3. 文件格式均为PNG，支持透明背景
4. 适用于微信表情包平台上传

## 关键词列表

${emoticons.map((e, i) => `${i + 1}. ${e.keyword}`).join('\n')}

---
由AI表情包生成器创建
`;

  zip.file('README.txt', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Create ZIP package with premium emoticons (no watermark)
 */
export async function createPremiumPackage(
  originalImages: string[], // Array of original image URLs without watermarks
  keywords: string[],
  packageTitle: string = 'AI表情包'
): Promise<Blob> {
  const zip = new JSZip();

  // Create folders
  const mainFolder = zip.folder('main');
  const thumbFolder = zip.folder('thumb');
  const iconFolder = zip.folder('icon');
  const bannerFolder = zip.folder('banner');

  // Note: In a real implementation, you would process the original images
  // without watermarks. For now, this is a placeholder structure.

  // Add placeholder files for premium package
  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];

    // Create placeholder images (in production, these would be the actual processed images)
    const placeholderCanvas = document.createElement('canvas');
    const ctx = placeholderCanvas.getContext('2d')!;

    // Main image (240x240)
    placeholderCanvas.width = 240;
    placeholderCanvas.height = 240;
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, 240, 240);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(keyword, 120, 120);
    ctx.fillText('无水印版', 120, 150);

    const mainBlob = dataURLToBlob(placeholderCanvas.toDataURL('image/png'));
    mainFolder!.file(`${String(i + 1).padStart(2, '0')}.png`, mainBlob);

    // Thumbnail (120x120)
    placeholderCanvas.width = 120;
    placeholderCanvas.height = 120;
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, 120, 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(keyword, 60, 60);

    const thumbBlob = dataURLToBlob(placeholderCanvas.toDataURL('image/png'));
    thumbFolder!.file(`${String(i + 1).padStart(2, '0')}-thumb.png`, thumbBlob);

    // Icon (50x50)
    placeholderCanvas.width = 50;
    placeholderCanvas.height = 50;
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, 50, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(keyword.substring(0, 2), 25, 25);

    const iconBlob = dataURLToBlob(placeholderCanvas.toDataURL('image/png'));
    iconFolder!.file(`${String(i + 1).padStart(2, '0')}-icon.png`, iconBlob);
  }

  // Create banner (simplified version)
  const bannerCanvas = document.createElement('canvas');
  const bannerCtx = bannerCanvas.getContext('2d')!;
  bannerCanvas.width = 750;
  bannerCanvas.height = 400;

  const gradient = bannerCtx.createLinearGradient(0, 0, 750, 400);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  bannerCtx.fillStyle = gradient;
  bannerCtx.fillRect(0, 0, 750, 400);

  bannerCtx.fillStyle = '#ffffff';
  bannerCtx.font = 'bold 32px Arial';
  bannerCtx.textAlign = 'center';
  bannerCtx.fillText(packageTitle, 375, 200);
  bannerCtx.font = 'bold 20px Arial';
  bannerCtx.fillText('高级无水印版', 375, 250);

  const bannerBlob = dataURLToBlob(bannerCanvas.toDataURL('image/png'));
  bannerFolder!.file('banner.png', bannerBlob);

  // Add premium README file
  const readmeContent = `# ${packageTitle} - 高级版

这是一个由AI生成的高清无水印表情包集合，包含16个表情。

## 文件结构

- main/ - 主图 (240x240px) - 高清无水印
- thumb/ - 缩略图 (120x120px) - 高清无水印
- icon/ - 图标 (50x50px) - 高清无水印
- banner/ - 横幅图 (750x400px) - 专业版横幅

## 高级版特性

✅ 高清无水印图片
✅ 专业级图片质量
✅ 完整微信表情包格式
✅ 商用授权许可

## 使用说明

1. 所有图片均为高清无水印版本
2. 文件格式为PNG，支持透明背景
3. 完全符合微信表情包平台上传要求
4. 可用于商业用途

## 关键词列表

${keywords.map((k, i) => `${i + 1}. ${k}`).join('\n')}

---
由AI表情包生成器专业版创建
感谢您的支持！
`;

  zip.file('README.txt', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Trigger download of a blob with specified filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download watermarked emoticon package
 */
export async function downloadWatermarkedPackage(
  emoticons: ProcessedEmoticon[],
  packageTitle: string = 'AI表情包'
): Promise<void> {
  try {
    const blob = await createWatermarkedPackage(emoticons, packageTitle);
    const filename = `${packageTitle}_预览版_${new Date().getTime()}.zip`;
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Error creating watermarked package:', error);
    throw new Error('打包下载失败，请重试');
  }
}

/**
 * Create ZIP package with premium (no watermark) emoticons
 */
export async function createPremiumPackageFromProcessed(
  emoticons: ProcessedEmoticon[],
  packageTitle: string = 'AI表情包'
): Promise<Blob> {
  const zip = new JSZip();

  // Create folders
  const mainFolder = zip.folder('main');
  const thumbFolder = zip.folder('thumb');
  const iconFolder = zip.folder('icon');
  const bannerFolder = zip.folder('banner');

  // Add main images (240x240) - these are already processed without watermarks
  for (let i = 0; i < emoticons.length; i++) {
    const emoticon = emoticons[i];
    const blob = dataURLToBlob(emoticon.mainImage);
    mainFolder!.file(`${String(i + 1).padStart(2, '0')}.png`, blob);
  }

  // Add thumbnails (120x120)
  for (let i = 0; i < emoticons.length; i++) {
    const emoticon = emoticons[i];
    const blob = dataURLToBlob(emoticon.thumbnail);
    thumbFolder!.file(`${String(i + 1).padStart(2, '0')}-thumb.png`, blob);
  }

  // Add icons (50x50)
  for (let i = 0; i < emoticons.length; i++) {
    const emoticon = emoticons[i];
    const blob = dataURLToBlob(emoticon.icon);
    iconFolder!.file(`${String(i + 1).padStart(2, '0')}-icon.png`, blob);
  }

  // Create and add banner using the premium emoticons
  const bannerDataUrl = await createBanner(emoticons, packageTitle);
  const bannerBlob = dataURLToBlob(bannerDataUrl);
  bannerFolder!.file('banner.png', bannerBlob);

  // Add premium README file
  const readmeContent = `# ${packageTitle} - 高级版

这是一个由AI生成的高清无水印表情包集合，包含16个表情。

## 文件结构

- main/ - 主图 (240x240px) - 高清无水印
- thumb/ - 缩略图 (120x120px) - 高清无水印
- icon/ - 图标 (50x50px) - 高清无水印
- banner/ - 横幅图 (750x400px) - 专业版横幅

## 高级版特性

✅ 高清无水印图片
✅ 专业级图片质量
✅ 完整微信表情包格式
✅ 商用授权许可

## 使用说明

1. 所有图片均为高清无水印版本
2. 文件格式为PNG，支持透明背景
3. 完全符合微信表情包平台上传要求
4. 可用于商业用途

## 关键词列表

${emoticons.map((e, i) => `${i + 1}. ${e.keyword}`).join('\n')}

---
由AI表情包生成器专业版创建
感谢您的支持！
`;

  zip.file('README.txt', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Download premium emoticon package using processed emoticons (after payment)
 */
export async function downloadPremiumPackageProcessed(
  processedEmoticons: ProcessedEmoticon[],
  packageTitle: string = 'AI表情包'
): Promise<void> {
  try {
    const blob = await createPremiumPackageFromProcessed(processedEmoticons, packageTitle);
    const filename = `${packageTitle}_高级版_${new Date().getTime()}.zip`;
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Error creating premium package:', error);
    throw new Error('打包下载失败，请重试');
  }
}

/**
 * Download premium emoticon package (after payment)
 */
export async function downloadPremiumPackage(
  originalImages: string[],
  keywords: string[],
  packageTitle: string = 'AI表情包'
): Promise<void> {
  try {
    const blob = await createPremiumPackage(originalImages, keywords, packageTitle);
    const filename = `${packageTitle}_高级版_${new Date().getTime()}.zip`;
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Error creating premium package:', error);
    throw new Error('打包下载失败，请重试');
  }
}