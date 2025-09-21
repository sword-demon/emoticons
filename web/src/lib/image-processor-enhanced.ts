// 图片处理增强工具
export class ImageProcessor {
  /**
   * 创建一个Canvas占位符图片
   */
  static createPlaceholderImage(
    width: number,
    height: number,
    text: string,
    backgroundColor: string = '#667eea',
    textColor: string = '#ffffff'
  ): string {
    try {
      if (typeof document === 'undefined') {
        // 服务器环境返回基础占位符URL
        return `https://via.placeholder.com/${width}x${height}/${backgroundColor.replace('#', '')}/${textColor.replace('#', '')}?text=${encodeURIComponent(text)}`;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return `https://via.placeholder.com/${width}x${height}/${backgroundColor.replace('#', '')}/${textColor.replace('#', '')}?text=${encodeURIComponent(text)}`;
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制背景
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // 绘制文字
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.min(width, height) / 8}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 添加阴影效果
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillText(text, width / 2, height / 2);

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('创建占位符图片失败:', error);
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${backgroundColor}"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="${textColor}" font-family="Arial" font-size="${Math.min(width, height) / 8}">${text}</text>
        </svg>
      `)}`;
    }
  }

  /**
   * 检查图片URL是否可访问
   */
  static async isImageAccessible(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (typeof Image === 'undefined') {
          resolve(false);
          return;
        }

        const img = new Image();
        const timeoutId = setTimeout(() => {
          resolve(false);
        }, 5000); // 5秒超时

        img.onload = () => {
          clearTimeout(timeoutId);
          resolve(true);
        };

        img.onerror = () => {
          clearTimeout(timeoutId);
          resolve(false);
        };

        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
      } catch (error) {
        console.error('Error checking image accessibility:', error);
        resolve(false);
      }
    });
  }

  /**
   * 安全的图片加载器
   */
  static loadImageSafely(imageUrl: string): Promise<string> {
    return new Promise(async (resolve) => {
      try {
        // 首先检查URL是否可访问
        const isAccessible = await this.isImageAccessible(imageUrl);

        if (!isAccessible) {
          console.warn(`图片无法访问，使用占位符: ${imageUrl}`);
          const fallbackImage = this.createPlaceholderImage(512, 512, '加载失败', '#ff6b6b', '#ffffff');
          resolve(fallbackImage);
          return;
        }

        // 如果可访问，正常返回
        resolve(imageUrl);
      } catch (error) {
        console.error('图片加载检查失败:', error);
        const fallbackImage = this.createPlaceholderImage(512, 512, '错误', '#ff6b6b', '#ffffff');
        resolve(fallbackImage);
      }
    });
  }
}

// 更新的图片处理工具函数