/**
 * PixelPulse - 主应用程序
 * 整合所有模块，处理用户交互
 */

(function() {
    'use strict';

    // 应用状态
    const app = {
        pixelateEngine: null,
        animationEngine: null,
        gifExporter: null,
        isImageLoaded: false
    };

    // DOM 元素引用
    const elements = {
        uploadArea: null,
        fileInput: null,
        workspace: null,
        originalCanvas: null,
        pixelCanvas: null,
        pixelSizeSlider: null,
        pixelSizeValue: null,
        effectButtons: null,
        intensitySlider: null,
        intensityValue: null,
        speedSlider: null,
        speedValue: null,
        resetBtn: null,
        exportBtn: null,
        exportImageBtn: null,
        exportModal: null,
        progressFill: null,
        progressText: null,
        starfield: null
    };

    /**
     * 初始化应用
     */
    function init() {
        // 获取DOM元素
        cacheElements();
        
        // 初始化引擎
        initEngines();
        
        // 绑定事件
        bindEvents();
        
        // 创建星空背景
        createStarfield();
        
        console.log('PixelPulse 初始化完成 ✨');
    }

    /**
     * 缓存DOM元素
     */
    function cacheElements() {
        elements.uploadArea = document.getElementById('uploadArea');
        elements.fileInput = document.getElementById('fileInput');
        elements.workspace = document.getElementById('workspace');
        elements.originalCanvas = document.getElementById('originalCanvas');
        elements.pixelCanvas = document.getElementById('pixelCanvas');
        elements.pixelSizeSlider = document.getElementById('pixelSize');
        elements.pixelSizeValue = document.getElementById('pixelSizeValue');
        elements.effectButtons = document.querySelectorAll('.effect-btn');
        elements.intensitySlider = document.getElementById('effectIntensity');
        elements.intensityValue = document.getElementById('intensityValue');
        elements.speedSlider = document.getElementById('animationSpeed');
        elements.speedValue = document.getElementById('speedValue');
        elements.resetBtn = document.getElementById('resetBtn');
        elements.exportBtn = document.getElementById('exportBtn');
        elements.exportImageBtn = document.getElementById('exportImageBtn');
        elements.exportModal = document.getElementById('exportModal');
        elements.progressFill = document.getElementById('progressFill');
        elements.progressText = document.getElementById('progressText');
        elements.starfield = document.getElementById('starfield');
    }

    /**
     * 初始化引擎
     */
    function initEngines() {
        app.pixelateEngine = new PixelateEngine();
        app.animationEngine = new AnimationEngine();
        app.gifExporter = new GifExporter();

        // 设置GIF导出回调
        app.gifExporter.setProgressCallback((progress, message) => {
            updateProgress(progress, message);
        });

        app.gifExporter.setCompleteCallback((blob) => {
            hideExportModal();
            GifExporter.download(blob, generateFilename());
        });

        app.gifExporter.setErrorCallback((error) => {
            hideExportModal();
            alert('导出失败: ' + error.message);
        });
    }

    /**
     * 绑定事件
     */
    function bindEvents() {
        // 上传区域点击
        elements.uploadArea.addEventListener('click', () => {
            elements.fileInput.click();
        });

        // 文件选择
        elements.fileInput.addEventListener('change', handleFileSelect);

        // 拖拽上传
        elements.uploadArea.addEventListener('dragover', handleDragOver);
        elements.uploadArea.addEventListener('dragleave', handleDragLeave);
        elements.uploadArea.addEventListener('drop', handleDrop);

        // 像素大小滑块
        elements.pixelSizeSlider.addEventListener('input', handlePixelSizeChange);

        // 效果按钮
        elements.effectButtons.forEach(btn => {
            btn.addEventListener('click', handleEffectChange);
        });

        // 强度滑块
        elements.intensitySlider.addEventListener('input', handleIntensityChange);

        // 速度滑块
        elements.speedSlider.addEventListener('input', handleSpeedChange);

        // 重置按钮
        elements.resetBtn.addEventListener('click', handleReset);

        // 导出GIF按钮
        elements.exportBtn.addEventListener('click', handleExport);

        // 导出图片按钮
        elements.exportImageBtn.addEventListener('click', handleExportImage);
    }

    /**
     * 创建星空背景
     */
    function createStarfield() {
        const starfield = elements.starfield;
        const numStars = 100;

        for (let i = 0; i < numStars; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 5;

            star.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                top: ${y}%;
                --duration: ${duration}s;
                --delay: ${delay}s;
            `;

            starfield.appendChild(star);
        }
    }

    /**
     * 处理文件选择
     */
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            loadImage(file);
        }
    }

    /**
     * 处理拖拽悬停
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.uploadArea.classList.add('dragover');
    }

    /**
     * 处理拖拽离开
     */
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.uploadArea.classList.remove('dragover');
    }

    /**
     * 处理文件拖放
     */
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            loadImage(files[0]);
        }
    }

    /**
     * 加载图片
     */
    async function loadImage(file) {
        try {
            // 显示加载状态
            elements.uploadArea.querySelector('.upload-text').textContent = '加载中...';

            // 加载图片
            await app.pixelateEngine.loadImage(file);
            
            // 设置初始像素大小
            app.pixelateEngine.setPixelSize(parseInt(elements.pixelSizeSlider.value));

            // 渲染原始图片
            app.pixelateEngine.renderOriginalToCanvas(elements.originalCanvas, 300, 300);

            // 初始化动画引擎
            app.animationEngine.init(elements.pixelCanvas, app.pixelateEngine);

            // 设置初始效果参数
            app.animationEngine.setEffect(getActiveEffect());
            app.animationEngine.setIntensity(parseInt(elements.intensitySlider.value));
            app.animationEngine.setSpeed(parseInt(elements.speedSlider.value));

            // 开始动画
            app.animationEngine.start();

            // 显示工作区
            elements.workspace.style.display = 'grid';
            elements.uploadArea.parentElement.style.display = 'none';

            app.isImageLoaded = true;

        } catch (error) {
            console.error('图片加载失败:', error);
            elements.uploadArea.querySelector('.upload-text').textContent = '加载失败，请重试';
            setTimeout(() => {
                elements.uploadArea.querySelector('.upload-text').textContent = '点击或拖拽上传图片';
            }, 2000);
        }
    }

    /**
     * 获取当前选中的效果
     */
    function getActiveEffect() {
        const activeBtn = document.querySelector('.effect-btn.active');
        return activeBtn ? activeBtn.dataset.effect : 'glitch';
    }

    /**
     * 处理像素大小变化
     */
    function handlePixelSizeChange(e) {
        const size = parseInt(e.target.value);
        elements.pixelSizeValue.textContent = size + 'px';
        
        if (app.isImageLoaded) {
            app.pixelateEngine.setPixelSize(size);
            app.animationEngine.prepare();
        }
    }

    /**
     * 处理效果变化
     */
    function handleEffectChange(e) {
        const btn = e.currentTarget;
        const effect = btn.dataset.effect;

        // 更新按钮状态
        elements.effectButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 更新动画效果
        if (app.isImageLoaded) {
            app.animationEngine.setEffect(effect);
        }
    }

    /**
     * 处理强度变化
     */
    function handleIntensityChange(e) {
        const intensity = parseInt(e.target.value);
        elements.intensityValue.textContent = intensity;
        
        if (app.isImageLoaded) {
            app.animationEngine.setIntensity(intensity);
        }
    }

    /**
     * 处理速度变化
     */
    function handleSpeedChange(e) {
        const speed = parseInt(e.target.value);
        elements.speedValue.textContent = speed;
        
        if (app.isImageLoaded) {
            app.animationEngine.setSpeed(speed);
        }
    }

    /**
     * 处理重置
     */
    function handleReset() {
        if (!app.isImageLoaded) return;

        // 停止动画
        app.animationEngine.stop();

        // 清理资源
        app.pixelateEngine.dispose();

        // 隐藏工作区，显示上传区
        elements.workspace.style.display = 'none';
        elements.uploadArea.parentElement.style.display = 'block';
        elements.uploadArea.querySelector('.upload-text').textContent = '点击或拖拽上传图片';

        // 重置文件输入
        elements.fileInput.value = '';

        // 重置控件到默认值
        elements.pixelSizeSlider.value = 8;
        elements.pixelSizeValue.textContent = '8px';
        elements.intensitySlider.value = 5;
        elements.intensityValue.textContent = '5';
        elements.speedSlider.value = 5;
        elements.speedValue.textContent = '5';

        // 重置效果按钮
        elements.effectButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.effect === 'glitch') {
                btn.classList.add('active');
            }
        });

        app.isImageLoaded = false;
    }

    /**
     * 处理导出
     */
    function handleExport() {
        if (!app.isImageLoaded) return;

        // 显示导出模态框
        showExportModal();

        // 计算帧数和延迟
        const speed = app.animationEngine.speed;
        const frameDelay = Math.floor(100 / speed); // 速度越快，延迟越短
        const totalFrames = 30; // 固定30帧

        // 开始导出
        app.gifExporter.startExport(app.animationEngine, {
            frames: totalFrames,
            delay: frameDelay,
            quality: 10,
            captureInterval: 2
        });
    }

    /**
     * 显示导出模态框
     */
    function showExportModal() {
        elements.exportModal.style.display = 'flex';
        updateProgress(0, '正在准备导出...');
    }

    /**
     * 隐藏导出模态框
     */
    function hideExportModal() {
        elements.exportModal.style.display = 'none';
    }

    /**
     * 更新进度
     */
    function updateProgress(percent, message) {
        elements.progressFill.style.width = percent + '%';
        elements.progressText.textContent = message + ' ' + percent + '%';
    }

    /**
     * 处理导出静态图片
     */
    function handleExportImage() {
        if (!app.isImageLoaded) return;

        const canvas = elements.pixelCanvas;
        const effect = getActiveEffect();
        const timestamp = Date.now().toString(36);
        const filename = `pixelpulse-${effect}-${timestamp}.png`;

        // 将当前画布内容转换为PNG并下载
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 延迟释放URL
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, 'image/png');
    }

    /**
     * 生成文件名
     */
    function generateFilename() {
        const effect = getActiveEffect();
        const timestamp = Date.now().toString(36);
        return `pixelpulse-${effect}-${timestamp}.gif`;
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

