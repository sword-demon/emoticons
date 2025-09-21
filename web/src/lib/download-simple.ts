// 简单下载功能，用于非16张表情包的下载
import JSZip from 'jszip';
import { ProcessedEmoticon } from './image-processing';

/**
 * 下载普通表情包（非微信规范）
 * 只包含主图，不包含缩略图、图标等
 */
export async function downloadSimplePackage(
  emoticons: ProcessedEmoticon[],
  packageName: string = 'AI表情包'
): Promise<void> {
  const zip = new JSZip();

  console.log(`开始打包 ${emoticons.length} 张表情包...`);

  // 添加主图
  for (let i = 0; i < emoticons.length; i++) {
    const emoticon = emoticons[i];

    // 使用关键词作为文件名，确保文件名安全
    const safeKeyword = emoticon.keyword.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    const fileName = `${String(i + 1).padStart(2, '0')}_${safeKeyword}.png`;

    try {
      if (emoticon.mainImage) {
        // 移除data:image/png;base64,前缀
        const base64Data = emoticon.mainImage.replace(/^data:image\/[a-z]+;base64,/, '');
        zip.file(fileName, base64Data, { base64: true });
        console.log(`已添加: ${fileName}`);
      }
    } catch (error) {
      console.error(`添加图片失败: ${fileName}`, error);
    }
  }

  // 添加说明文件
  const readmeContent = `
AI表情包 - 简单版本
===================

包含内容：
- ${emoticons.length} 张表情包主图 (PNG格式)

文件命名规则：
- 01_关键词.png, 02_关键词.png, ...

使用说明：
- 直接使用图片文件
- 适用于各种聊天软件和社交平台

生成时间：${new Date().toLocaleString('zh-CN')}
关键词：${emoticons.map(e => e.keyword).join('、')}
`;

  zip.file('README.txt', readmeContent);

  try {
    console.log('正在生成ZIP文件...');
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    // 创建下载链接
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${packageName}_${emoticons.length}张.zip`;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理URL对象
    URL.revokeObjectURL(url);

    console.log(`下载完成: ${packageName}_${emoticons.length}张.zip`);
  } catch (error) {
    console.error('生成ZIP文件失败:', error);
    throw new Error('下载失败，请重试');
  }
}

/**
 * 下载单张表情包
 */
export async function downloadSingleEmoticon(
  emoticon: ProcessedEmoticon
): Promise<void> {
  try {
    if (!emoticon.mainImage) {
      throw new Error('图片数据不存在');
    }

    // 创建下载链接
    const link = document.createElement('a');
    link.href = emoticon.mainImage;

    // 使用关键词作为文件名
    const safeKeyword = emoticon.keyword.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    link.download = `${safeKeyword}.png`;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`单张下载完成: ${safeKeyword}.png`);
  } catch (error) {
    console.error('单张下载失败:', error);
    throw new Error('下载失败，请重试');
  }
}