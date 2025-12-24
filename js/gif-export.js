/**
 * PixelPulse - GIF导出模块
 * 使用gif.js库实现纯前端GIF生成
 */

class GifExporter {
    constructor() {
        this.gif = null;
        this.isExporting = false;
        this.framesCaptured = 0;
        this.totalFrames = 30; // 默认帧数
        this.frameDelay = 50;  // 默认每帧延迟(ms)
        
        // 回调
        this.onProgress = null;
        this.onComplete = null;
        this.onError = null;
    }

    /**
     * 初始化GIF生成器
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {Object} options - 配置选项
     */
    init(width, height, options = {}) {
        // 检查gif.js是否可用
        if (typeof GIF === 'undefined') {
            console.error('gif.js 库未加载');
            if (this.onError) {
                this.onError(new Error('gif.js 库未加载，请检查网络连接'));
            }
            return false;
        }

        this.totalFrames = options.frames || 30;
        this.frameDelay = options.delay || 50;

        // 创建GIF实例
        this.gif = new GIF({
            workers: 2,
            quality: options.quality || 10,
            width: width,
            height: height,
            workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
        });

        // 绑定事件
        this.gif.on('progress', (progress) => {
            if (this.onProgress) {
                // 第二阶段：编码进度 (50-100%)
                const totalProgress = 50 + Math.floor(progress * 50);
                this.onProgress(totalProgress, '正在编码GIF...');
            }
        });

        this.gif.on('finished', (blob) => {
            this.isExporting = false;
            if (this.onComplete) {
                this.onComplete(blob);
            }
        });

        this.framesCaptured = 0;
        return true;
    }

    /**
     * 添加帧
     * @param {HTMLCanvasElement} canvas - 画布
     * @param {number} delay - 帧延迟(ms)
     */
    addFrame(canvas, delay) {
        if (!this.gif || !this.isExporting) return;

        // 复制画布内容
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = canvas.width;
        frameCanvas.height = canvas.height;
        const ctx = frameCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0);

        this.gif.addFrame(frameCanvas, { delay: delay || this.frameDelay, copy: true });
        this.framesCaptured++;

        // 第一阶段进度：捕获帧 (0-50%)
        if (this.onProgress) {
            const captureProgress = Math.floor((this.framesCaptured / this.totalFrames) * 50);
            this.onProgress(captureProgress, `正在捕获帧 ${this.framesCaptured}/${this.totalFrames}...`);
        }

        // 检查是否已捕获足够帧数
        if (this.framesCaptured >= this.totalFrames) {
            return true; // 通知可以开始渲染
        }
        return false;
    }

    /**
     * 开始导出
     * @param {AnimationEngine} animationEngine - 动画引擎
     * @param {Object} options - 导出选项
     */
    startExport(animationEngine, options = {}) {
        const canvas = animationEngine.canvas;
        
        if (!this.init(canvas.width, canvas.height, options)) {
            return;
        }

        this.isExporting = true;
        this.framesCaptured = 0;

        // 临时暂停原动画
        const wasRunning = animationEngine.isRunning;
        animationEngine.stop();
        animationEngine.reset();

        // 捕获帧的间隔
        const captureInterval = options.captureInterval || 2; // 每N帧捕获一次
        let frameCounter = 0;

        // 创建捕获循环
        const captureLoop = () => {
            if (!this.isExporting || this.framesCaptured >= this.totalFrames) {
                // 捕获完成，开始渲染
                if (this.isExporting) {
                    if (this.onProgress) {
                        this.onProgress(50, '正在编码GIF...');
                    }
                    this.gif.render();
                }
                
                // 恢复原动画状态
                if (wasRunning) {
                    animationEngine.start();
                }
                return;
            }

            // 渲染当前帧
            animationEngine.time += 0.016 * (animationEngine.speed / 5);
            animationEngine.render();
            
            frameCounter++;

            // 按间隔捕获
            if (frameCounter % captureInterval === 0) {
                this.addFrame(canvas, this.frameDelay);
            }

            requestAnimationFrame(captureLoop);
        };

        // 开始捕获
        captureLoop();
    }

    /**
     * 取消导出
     */
    cancel() {
        this.isExporting = false;
        if (this.gif) {
            this.gif.abort();
            this.gif = null;
        }
    }

    /**
     * 设置进度回调
     * @param {Function} callback - 进度回调 (progress: number, message: string)
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    /**
     * 设置完成回调
     * @param {Function} callback - 完成回调 (blob: Blob)
     */
    setCompleteCallback(callback) {
        this.onComplete = callback;
    }

    /**
     * 设置错误回调
     * @param {Function} callback - 错误回调 (error: Error)
     */
    setErrorCallback(callback) {
        this.onError = callback;
    }

    /**
     * 下载GIF
     * @param {Blob} blob - GIF blob
     * @param {string} filename - 文件名
     */
    static download(blob, filename = 'pixelpulse-animation.gif') {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 延迟释放URL
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

// 导出到全局
window.GifExporter = GifExporter;


