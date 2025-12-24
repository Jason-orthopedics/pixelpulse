# PixelPulse 像素脉动

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.1-brightgreen" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/Pure-Frontend-orange" alt="Pure Frontend">
</p>

**PixelPulse** 是一个纯前端的像素艺术动画生成器，可以将任意图片转换为复古像素风格，并添加多种动态效果，支持导出为 GIF 动图或 PNG 静态图片。

## ✨ 功能特性

- 🖼️ **图片像素化** - 支持 4px ~ 32px 像素块大小调节
- 🎬 **6种动画效果**：
  - ◻ 无动画 - 纯静态像素风格
  - ⚡ 抖动 (Glitch) - RGB分离 + 随机行偏移故障效果
  - ☁ 浮动 (Float) - 呼吸式上下漂浮 + 阴影
  - ✦ 闪烁 (Sparkle) - 随机像素点高亮闪烁
  - ≋ 波浪 (Wave) - 正弦波驱动的像素扭曲
  - 🌈 彩虹 (Rainbow) - 色相循环流动
- 📤 **多格式导出** - 支持 GIF 动图和 PNG 静态图片
- 🎨 **像素风格UI** - 8-bit复古游戏界面风格
- 📱 **响应式设计** - 支持桌面和移动设备
- 🚀 **纯前端实现** - 无需后端服务器，所有处理在浏览器完成

## 🖥️ 技术栈

- HTML5 / CSS3 / JavaScript (ES6+)
- Canvas API - 图片处理和动画渲染
- [gif.js](https://jnordberg.github.io/gif.js/) - 纯前端 GIF 编码
- Google Fonts (Press Start 2P) - 像素字体

## 📁 项目结构

```
pixelpulse/
├── index.html          # 主页面
├── css/
│   └── style.css       # 像素风格样式表
├── js/
│   ├── app.js          # 主应用逻辑
│   ├── pixelate.js     # 像素化处理引擎
│   ├── animations.js   # 动画效果引擎
│   └── gif-export.js   # GIF导出模块
├── assets/             # 静态资源
└── lib/                # 第三方库
```

## 🚀 本地运行

由于项目是纯静态网页，你可以用任何方式运行：

### 方法1：直接打开
双击 `index.html` 文件即可在浏览器中打开（部分功能可能受限于浏览器安全策略）

### 方法2：使用 Python 内置服务器
```bash
cd pixelpulse
python3 -m http.server 8080
```
然后访问 http://localhost:8080

### 方法3：使用 Node.js
```bash
npx serve pixelpulse
```

### 方法4：使用 VS Code Live Server
安装 Live Server 扩展，右键 `index.html` 选择 "Open with Live Server"

## 🌐 服务器部署

### Nginx 部署

1. 将项目文件上传到服务器（例如 `/var/www/pixelpulse`）

2. 配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名
    
    root /var/www/pixelpulse;
    index index.html;
    
    # 静态文件缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 开启 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

3. 重新加载 Nginx：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Apache 部署

1. 将项目文件上传到服务器（例如 `/var/www/html/pixelpulse`）

2. 创建 `.htaccess` 文件（项目根目录）：

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# 静态文件缓存
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
</IfModule>

# Gzip 压缩
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

3. 确保 Apache 启用了必要模块：
```bash
sudo a2enmod rewrite expires deflate
sudo systemctl restart apache2
```

### Docker 部署

1. 创建 `Dockerfile`：

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. 构建并运行：
```bash
docker build -t pixelpulse .
docker run -d -p 80:80 pixelpulse
```

### Vercel / Netlify 部署（推荐）

最简单的部署方式：

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 或 [Netlify](https://netlify.com) 导入仓库
3. 自动部署完成！

### GitHub Pages 部署

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 选择 `main` 分支作为源
3. 访问 `https://your-username.github.io/pixelpulse`

## 📝 使用说明

1. 打开网站，点击上传区域或拖拽图片上传
2. 调整「像素块大小」滑块设置像素化程度
3. 选择喜欢的动画效果
4. 调整「动画强度」和「动画速度」
5. 点击「导出图片」保存 PNG 或「导出GIF」保存动画

## 🎨 界面预览

网站采用 8-bit 复古游戏风格设计：
- 深紫黑底色 + 霓虹发光配色
- CRT 扫描线效果
- 像素化边框和按钮
- 动态星空背景
- Press Start 2P 像素字体

## 📄 许可证

MIT License - 自由使用，欢迎贡献！

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

<p align="center">
  <b>PRESS START TO PIXEL</b><br>
  用像素点亮创意 ✨
</p>


