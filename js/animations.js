/**
 * PixelPulse - 动画效果引擎
 * 提供多种像素动画效果
 */

class AnimationEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.pixelateEngine = null;
        this.animationId = null;
        this.isRunning = false;
        
        // 动画参数
        this.currentEffect = 'glitch';
        this.intensity = 5;
        this.speed = 5;
        this.time = 0;
        
        // 像素数据缓存
        this.pixelGrid = null;
        this.baseImageData = null;
        
        // 帧捕获回调
        this.onFrameCapture = null;
        this.frameCount = 0;
    }

    /**
     * 初始化动画引擎
     * @param {HTMLCanvasElement} canvas - 目标画布
     * @param {PixelateEngine} pixelateEngine - 像素化引擎实例
     */
    init(canvas, pixelateEngine) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pixelateEngine = pixelateEngine;
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * 设置动画效果
     * @param {string} effect - 效果名称
     */
    setEffect(effect) {
        this.currentEffect = effect;
    }

    /**
     * 设置动画强度
     * @param {number} intensity - 强度值 (1-10)
     */
    setIntensity(intensity) {
        this.intensity = Math.max(1, Math.min(10, intensity));
    }

    /**
     * 设置动画速度
     * @param {number} speed - 速度值 (1-10)
     */
    setSpeed(speed) {
        this.speed = Math.max(1, Math.min(10, speed));
    }

    /**
     * 准备动画数据
     */
    prepare() {
        if (!this.pixelateEngine) return;
        
        // 获取基础像素化图像数据
        this.baseImageData = this.pixelateEngine.getPixelatedData(
            this.canvas.width || 400,
            this.canvas.height || 400
        );
        
        // 更新画布尺寸
        const size = this.pixelateEngine.getOutputSize();
        this.canvas.width = size.width;
        this.canvas.height = size.height;
        
        // 获取像素网格数据
        this.pixelGrid = this.pixelateEngine.getPixelGrid();
    }

    /**
     * 开始动画
     */
    start() {
        if (this.isRunning) return;
        
        this.prepare();
        this.isRunning = true;
        this.time = 0;
        this.frameCount = 0;
        this.animate();
    }

    /**
     * 停止动画
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * 动画循环
     */
    animate() {
        if (!this.isRunning) return;
        
        this.render();
        this.time += 0.016 * (this.speed / 5); // 基于速度调整时间流逝
        this.frameCount++;
        
        // 帧捕获回调
        if (this.onFrameCapture) {
            this.onFrameCapture(this.canvas, this.frameCount);
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * 渲染当前帧
     */
    render() {
        if (!this.baseImageData || !this.pixelGrid) return;
        
        const ctx = this.ctx;
        const pixelSize = this.pixelateEngine.pixelSize;
        const gridSize = this.pixelateEngine.getGridSize();
        
        // 清空画布
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 根据效果类型渲染
        switch (this.currentEffect) {
            case 'glitch':
                this.renderGlitch(ctx, pixelSize, gridSize);
                break;
            case 'float':
                this.renderFloat(ctx, pixelSize, gridSize);
                break;
            case 'sparkle':
                this.renderSparkle(ctx, pixelSize, gridSize);
                break;
            case 'wave':
                this.renderWave(ctx, pixelSize, gridSize);
                break;
            case 'rainbow':
                this.renderRainbow(ctx, pixelSize, gridSize);
                break;
            default:
                this.renderStatic(ctx, pixelSize, gridSize);
        }
    }

    /**
     * 静态渲染（无动画）
     */
    renderStatic(ctx, pixelSize, gridSize) {
        for (let y = 0; y < gridSize.height; y++) {
            for (let x = 0; x < gridSize.width; x++) {
                const pixel = this.pixelGrid[y]?.[x];
                if (!pixel || pixel.a < 10) continue;
                
                ctx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a / 255})`;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    /**
     * 故障抖动效果
     */
    renderGlitch(ctx, pixelSize, gridSize) {
        const intensity = this.intensity;
        const time = this.time;
        
        // 随机行偏移
        const glitchLines = [];
        const numGlitchLines = Math.floor(intensity / 2) + 1;
        
        for (let i = 0; i < numGlitchLines; i++) {
            if (Math.random() < 0.1 * intensity) {
                glitchLines.push({
                    y: Math.floor(Math.random() * gridSize.height),
                    offset: (Math.random() - 0.5) * intensity * 2,
                    height: Math.floor(Math.random() * 3) + 1
                });
            }
        }
        
        for (let y = 0; y < gridSize.height; y++) {
            let xOffset = 0;
            
            // 检查是否在故障行
            for (const line of glitchLines) {
                if (y >= line.y && y < line.y + line.height) {
                    xOffset = line.offset * pixelSize;
                    break;
                }
            }
            
            // 全局微抖动
            if (Math.random() < 0.02 * intensity) {
                xOffset += (Math.random() - 0.5) * intensity * pixelSize * 0.5;
            }
            
            for (let x = 0; x < gridSize.width; x++) {
                const pixel = this.pixelGrid[y]?.[x];
                if (!pixel || pixel.a < 10) continue;
                
                // RGB分离效果
                const rgbSplit = Math.sin(time * 10) * intensity * 0.3;
                
                // 红色通道
                ctx.fillStyle = `rgba(${pixel.r}, 0, 0, ${pixel.a / 255 * 0.8})`;
                ctx.fillRect(x * pixelSize + xOffset - rgbSplit, y * pixelSize, pixelSize, pixelSize);
                
                // 青色通道 (G+B)
                ctx.fillStyle = `rgba(0, ${pixel.g}, ${pixel.b}, ${pixel.a / 255 * 0.8})`;
                ctx.fillRect(x * pixelSize + xOffset + rgbSplit, y * pixelSize, pixelSize, pixelSize);
                
                // 主色（混合）
                ctx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a / 255 * 0.4})`;
                ctx.fillRect(x * pixelSize + xOffset, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    /**
     * 呼吸浮动效果
     */
    renderFloat(ctx, pixelSize, gridSize) {
        const intensity = this.intensity;
        const time = this.time;
        
        // 整体浮动偏移
        const floatY = Math.sin(time * 2) * intensity * 2;
        const floatX = Math.cos(time * 1.5) * intensity * 0.5;
        
        // 添加阴影效果
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let y = 0; y < gridSize.height; y++) {
            for (let x = 0; x < gridSize.width; x++) {
                const pixel = this.pixelGrid[y]?.[x];
                if (!pixel || pixel.a < 10) continue;
                
                ctx.fillRect(
                    x * pixelSize + floatX + 4,
                    y * pixelSize + floatY + 4,
                    pixelSize, pixelSize
                );
            }
        }
        
        // 主体渲染
        for (let y = 0; y < gridSize.height; y++) {
            for (let x = 0; x < gridSize.width; x++) {
                const pixel = this.pixelGrid[y]?.[x];
                if (!pixel || pixel.a < 10) continue;
                
                // 呼吸亮度变化
                const breathe = 0.9 + Math.sin(time * 3) * 0.1 * (intensity / 10);
                const r = Math.min(255, Math.floor(pixel.r * breathe));
                const g = Math.min(255, Math.floor(pixel.g * breathe));
                const b = Math.min(255, Math.floor(pixel.b * breathe));
                
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pixel.a / 255})`;
                ctx.fillRect(
                    x * pixelSize + floatX,
                    y * pixelSize + floatY,
                    pixelSize, pixelSize
                );
            }
        }
    }

    /**
     * 闪烁发光效果
     */
    renderSparkle(ctx, pixelSize, gridSize) {
        const intensity = this.intensity;
        const time = this.time;
        
        // 先渲染基础图像
        for (let y = 0; y < gridSize.height; y++) {
            for (let x = 0; x < gridSize.width; x++) {
                const pixel = this.pixelGrid[y]?.[x];
                if (!pixel || pixel.a < 10) continue;
                
                ctx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a / 255})`;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
        
        // 添加闪烁点
        const numSparkles = intensity * 5;
        
        for (let i = 0; i < numSparkles; i++) {
            // 基于时间的伪随机位置
            const seed = i * 1000 + Math.floor(time * 3);
            const rx = this.seededRandom(seed) * gridSize.width;
            const ry = this.seededRandom(seed + 1) * gridSize.height;
            const x = Math.floor(rx);
            const y = Math.floor(ry);
            
            const pixel = this.pixelGrid[y]?.[x];
            if (!pixel || pixel.a < 10) continue;
            
            // 闪烁亮度
            const sparklePhase = (time * 5 + i * 0.5) % (Math.PI * 2);
            const brightness = Math.pow(Math.sin(sparklePhase), 2);
            
            if (brightness > 0.3) {
                // 发光核心
                const glowSize = pixelSize * (1 + brightness * 0.5);
                const glowX = x * pixelSize + (pixelSize - glowSize) / 2;
                const glowY = y * pixelSize + (pixelSize - glowSize) / 2;
                
                // 白色高光
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
                ctx.fillRect(glowX, glowY, glowSize, glowSize);
                
                // 外发光
                if (brightness > 0.6) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
                    ctx.fillRect(glowX - pixelSize, glowY - pixelSize, 
                                 glowSize + pixelSize * 2, glowSize + pixelSize * 2);
                }
            }
        }
    }

    /**
     * 波浪扭曲效果
     */
    renderWave(ctx, pixelSize, gridSize) {
        const intensity = this.intensity;
        const time = this.time;
        
        for (let y = 0; y < gridSize.height; y++) {
            // 水平波浪偏移
            const waveX = Math.sin(y * 0.3 + time * 3) * intensity * 0.8;
            // 垂直波浪偏移
            const waveY = Math.sin(y * 0.2 + time * 2) * intensity * 0.3;
            
            for (let x = 0; x < gridSize.width; x++) {
                const pixel = this.pixelGrid[y]?.[x];
                if (!pixel || pixel.a < 10) continue;
                
                // 额外的局部波动
                const localWave = Math.sin(x * 0.4 + time * 4) * intensity * 0.2;
                
                ctx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a / 255})`;
                ctx.fillRect(
                    x * pixelSize + waveX,
                    y * pixelSize + waveY + localWave,
                    pixelSize, pixelSize
                );
            }
        }
    }

    /**
     * 彩虹流动效果
     */
    renderRainbow(ctx, pixelSize, gridSize) {
        const intensity = this.intensity;
        const time = this.time;
        
        for (let y = 0; y < gridSize.height; y++) {
            for (let x = 0; x < gridSize.width; x++) {
                const pixel = this.pixelGrid[y]?.[x];
                if (!pixel || pixel.a < 10) continue;
                
                // 计算色相偏移
                const hueShift = (x + y + time * 50 * (intensity / 5)) % 360;
                
                // 将RGB转换为HSL，调整色相，再转回RGB
                const hsl = this.rgbToHsl(pixel.r, pixel.g, pixel.b);
                hsl.h = (hsl.h + hueShift * (intensity / 10)) % 360;
                
                // 增加饱和度
                hsl.s = Math.min(1, hsl.s + 0.2 * (intensity / 10));
                
                const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
                
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${pixel.a / 255})`;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    /**
     * 伪随机数生成器（基于种子）
     */
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    /**
     * RGB转HSL
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / d + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / d + 4) / 6;
                    break;
            }
        }
        
        return { h: h * 360, s, l };
    }

    /**
     * HSL转RGB
     */
    hslToRgb(h, s, l) {
        h /= 360;
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /**
     * 设置帧捕获回调
     * @param {Function} callback - 回调函数
     */
    setFrameCaptureCallback(callback) {
        this.onFrameCapture = callback;
    }

    /**
     * 清理帧捕获回调
     */
    clearFrameCaptureCallback() {
        this.onFrameCapture = null;
    }

    /**
     * 获取当前帧数
     */
    getFrameCount() {
        return this.frameCount;
    }

    /**
     * 重置动画
     */
    reset() {
        this.time = 0;
        this.frameCount = 0;
    }
}

// 导出到全局
window.AnimationEngine = AnimationEngine;

