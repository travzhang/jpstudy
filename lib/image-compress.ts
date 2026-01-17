/**
 * 图片压缩工具
 * 将图片压缩到指定大小（默认 50KB）
 */

interface CompressOptions {
  maxSizeKB?: number; // 最大文件大小（KB），默认 50KB
  maxWidth?: number; // 最大宽度，默认 1920px
  maxHeight?: number; // 最大高度，默认 1920px
  quality?: number; // 初始质量，默认 0.8
}

/**
 * 压缩图片
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的 base64 字符串
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxSizeKB = 50,
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 计算压缩后的尺寸
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // 创建 canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('无法创建 canvas context'));
          return;
        }

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 压缩函数
        const compress = (currentQuality: number): void => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('压缩失败'));
                return;
              }

              const sizeKB = blob.size / 1024;

              // 如果文件大小符合要求，转换为 base64
              if (sizeKB <= maxSizeKB || currentQuality <= 0.1) {
                const resultReader = new FileReader();
                resultReader.onload = () => {
                  resolve(resultReader.result as string);
                };
                resultReader.onerror = reject;
                resultReader.readAsDataURL(blob);
              } else {
                // 继续降低质量
                compress(Math.max(0.1, currentQuality - 0.1));
              }
            },
            'image/jpeg',
            currentQuality
          );
        };

        // 开始压缩
        compress(quality);
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = (e.target as FileReader).result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
