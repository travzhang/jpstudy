#!/usr/bin/env node

/**
 * 生成 PWA 图标脚本
 * 使用 Sharp 和 SVG 生成 PNG 图标
 */

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

function createSVG(size) {
  const scale = size / 512;
  const radius = 80 * scale;
  const centerX = size / 2;
  const centerY = size / 2 - 20 * scale;
  const circleRadius = 180 * scale;
  const fontSize = 200 * scale;
  const bottomFontSize = 60 * scale;

  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF2442;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B8A;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景圆角矩形 -->
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#grad)"/>
  
  <!-- 白色圆形背景 -->
  <circle cx="${centerX}" cy="${centerY}" r="${circleRadius}" fill="#FFFFFF"/>
  
  <!-- 日文字符"日" -->
  <text 
    x="${centerX}" 
    y="${centerY + fontSize * 0.35}" 
    font-family="Hiragino Sans, Noto Sans CJK SC, Microsoft YaHei, Arial, sans-serif" 
    font-size="${fontSize}" 
    font-weight="bold" 
    fill="#FF2442" 
    text-anchor="middle" 
    dominant-baseline="middle">日</text>
  
  <!-- 底部文字"学" -->
  <text 
    x="${size / 2}" 
    y="${size - 80 * scale}" 
    font-family="Hiragino Sans, Noto Sans CJK SC, Microsoft YaHei, Arial, sans-serif" 
    font-size="${bottomFontSize}" 
    font-weight="bold" 
    fill="#FFFFFF" 
    text-anchor="middle" 
    dominant-baseline="middle">学</text>
</svg>`;
}

// 生成图标
async function generateIcons() {
  try {
    console.log('🎨 开始生成 PWA 图标...');

    // 生成 192x192
    const svg192 = createSVG(192);
    const png192 = await sharp(Buffer.from(svg192))
      .png()
      .toBuffer();
    writeFileSync(join(publicDir, 'icon-192.png'), png192);
    console.log('✅ 已生成 icon-192.png');

    // 生成 512x512
    const svg512 = createSVG(512);
    const png512 = await sharp(Buffer.from(svg512))
      .png()
      .toBuffer();
    writeFileSync(join(publicDir, 'icon-512.png'), png512);
    console.log('✅ 已生成 icon-512.png');

    console.log('🎉 图标生成完成！');
  } catch (error) {
    if (error.message.includes('Cannot find module')) {
      console.error('❌ 错误：需要安装 sharp 包');
      console.log('请运行: pnpm add -D sharp');
    } else {
      console.error('❌ 生成失败:', error.message);
    }
    process.exit(1);
  }
}

generateIcons();
