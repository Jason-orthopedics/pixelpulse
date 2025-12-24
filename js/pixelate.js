/**
 * PixelPulse - 像素化引擎
 * 将图片转换为像素艺术风格
 */

class PixelateEngine {
    constructor() {
        this.originalImage = null;
        this.originalImageData = null;
        this.pixelSize = 8;
        this.outputWidth = 0;
        this.outputHeight = 0;
        
        // 临时画布用于处理
        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');
    }

    /**
     * 加载图片
     * @param {File|Blob|HTMLImageElement} source - 图片源
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.originalImage = img;
                this.captureOriginalData();
                resolve(img);
            };
            
            img.onerror = () => {
                reject(new Error('图片加载失败'));
            };
            
            if (source instanceof File || source instanceof Blob) {
                img.src = URL.createObjectURL(source);
            } else if (source instanceof HTMLImageElement) {
                img.src = source.src;
            } else if (typeof source === 'string') {
                img.src = source;
            }
        });
    }

    /**
     * 捕获原始图片数据
     */
    captureOriginalData() {
        if (!this.originalImage) return;
        
        const img = this.originalImage;
        this.tempCanvas.width = img.width;
        this.tempCanvas.height = img.height;
        this.tempCtx.drawImage(img, 0, 0);
        this.originalImageData = this.tempCtx.getImageData(0, 0, img.width, img.height);
    }

    /**
     * 设置像素块大小
     * @param {number} size - 像素块大小（4-64）
     */
    setPixelSize(size) {
        this.pixelSize = Math.max(4, Math.min(64, size));
    }

    /**
     * 获取像素化后的图像数据
     * @param {number} maxWidth - 最大输出宽度
     * @param {number} maxHeight - 最大输出高度
     * @returns {ImageData|null}
     */
    getPixelatedData(maxWidth = 400, maxHeight = 400) {
        if (!this.originalImage) return null;
        
        const img = this.originalImage;
        const pixelSize = this.pixelSize;
        
        // 计算缩放比例以适应输出尺寸
        let scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        
        // 计算像素化后的尺寸
        const scaledWidth = Math.floor(img.width * scale);
        const scaledHeight = Math.floor(img.height * scale);
        
        // 计算像素网格尺寸
        const gridWidth = Math.ceil(scaledWidth / pixelSize);
        const gridHeight = Math.ceil(scaledHeight / pixelSize);
        
        // 最终输出尺寸
        this.outputWidth = gridWidth * pixelSize;
        this.outputHeight = gridHeight * pixelSize;
        
        // 设置临时画布
        this.tempCanvas.width = this.outputWidth;
        this.tempCanvas.height = this.outputHeight;
        
        // 关闭图像平滑
        this.tempCtx.imageSmoothingEnabled = false;
        
        // 先缩小到网格尺寸
        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = gridWidth;
        smallCanvas.height = gridHeight;
        const smallCtx = smallCanvas.getContext('2d');
        smallCtx.imageSmoothingEnabled = true;
        smallCtx.imageSmoothingQuality = 'medium';
        
        // 缩小绘制
        smallCtx.drawImage(img, 0, 0, gridWidth, gridHeight);
        
        // 放大回原尺寸（像素化效果）
        this.tempCtx.drawImage(smallCanvas, 0, 0, gridWidth, gridHeight, 
                               0, 0, this.outputWidth, this.outputHeight);
        
        return this.tempCtx.getImageData(0, 0, this.outputWidth, this.outputHeight);
    }

    /**
     * 渲染像素化图像到画布
     * @param {HTMLCanvasElement} targetCanvas - 目标画布
     * @param {number} maxWidth - 最大宽度
     * @param {number} maxHeight - 最大高度
     */
    renderToCanvas(targetCanvas, maxWidth = 400, maxHeight = 400) {
        if (!this.originalImage) return;
        
        const imageData = this.getPixelatedData(maxWidth, maxHeight);
        if (!imageData) return;
        
        targetCanvas.width = this.outputWidth;
        targetCanvas.height = this.outputHeight;
        
        const ctx = targetCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * 渲染原始图像到画布
     * @param {HTMLCanvasElement} targetCanvas - 目标画布
     * @param {number} maxWidth - 最大宽度
     * @param {number} maxHeight - 最大高度
     */
    renderOriginalToCanvas(targetCanvas, maxWidth = 300, maxHeight = 300) {
        if (!this.originalImage) return;
        
        const img = this.originalImage;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        
        targetCanvas.width = Math.floor(img.width * scale);
        targetCanvas.height = Math.floor(img.height * scale);
        
        const ctx = targetCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, targetCanvas.width, targetCanvas.height);
    }

    /**
     * 获取像素网格数据（用于动画）
     * @returns {Array<Array<{r,g,b,a}>>} 二维像素网格
     */
    getPixelGrid() {
        if (!this.originalImage) return null;
        
        const img = this.originalImage;
        const pixelSize = this.pixelSize;
        
        // 计算网格尺寸
        const gridWidth = Math.ceil(this.outputWidth / pixelSize);
        const gridHeight = Math.ceil(this.outputHeight / pixelSize);
        
        // 先获取缩小的图像数据
        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = gridWidth;
        smallCanvas.height = gridHeight;
        const smallCtx = smallCanvas.getContext('2d');
        smallCtx.imageSmoothingEnabled = true;
        smallCtx.drawImage(img, 0, 0, gridWidth, gridHeight);
        
        const imageData = smallCtx.getImageData(0, 0, gridWidth, gridHeight);
        const data = imageData.data;
        
        // 构建像素网格
        const grid = [];
        for (let y = 0; y < gridHeight; y++) {
            const row = [];
            for (let x = 0; x < gridWidth; x++) {
                const i = (y * gridWidth + x) * 4;
                row.push({
                    r: data[i],
                    g: data[i + 1],
                    b: data[i + 2],
                    a: data[i + 3]
                });
            }
            grid.push(row);
        }
        
        return grid;
    }

    /**
     * 获取输出尺寸
     * @returns {{width: number, height: number}}
     */
    getOutputSize() {
        return {
            width: this.outputWidth,
            height: this.outputHeight
        };
    }

    /**
     * 获取网格尺寸
     * @returns {{width: number, height: number}}
     */
    getGridSize() {
        return {
            width: Math.ceil(this.outputWidth / this.pixelSize),
            height: Math.ceil(this.outputHeight / this.pixelSize)
        };
    }

    /**
     * 清理资源
     */
    dispose() {
        if (this.originalImage && this.originalImage.src.startsWith('blob:')) {
            URL.revokeObjectURL(this.originalImage.src);
        }
        this.originalImage = null;
        this.originalImageData = null;
    }
}

// 导出到全局
window.PixelateEngine = PixelateEngine;

