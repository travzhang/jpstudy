#!/usr/bin/env node

/**
 * 生成 PWA 图标脚本
 * 使用 Canvas API 生成 PNG 图标
 */

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const scale = size / 512;

  // 绘制背景（圆角矩形）
  ctx.fillStyle = '#FF2442';
  ctx.beginPath();
  const radius = 80 * scale;
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.fill();

  // 绘制日历主体
  const calendarX = size / 2;
  const calendarY = size / 2 - 20 * scale;
  const calendarWidth = 240 * scale;
  const calendarHeight = 200 * scale;

  // 日历主体（白色）
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  roundRect(
    ctx,
    calendarX - calendarWidth / 2,
    calendarY - calendarHeight / 2,
    calendarWidth,
    calendarHeight,
    12 * scale
  );
  ctx.fill();

  // 日历顶部（红色装订部分）
  ctx.fillStyle = '#FF2442';
  ctx.beginPath();
  roundRect(
    ctx,
    calendarX - calendarWidth / 2,
    calendarY - calendarHeight / 2,
    calendarWidth,
    40 * scale,
    12 * scale
  );
  ctx.fill();

  // 日历环
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(calendarX - 60 * scale, calendarY - 120 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(calendarX + 60 * scale, calendarY - 120 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 日期数字 "16"
  ctx.fillStyle = '#FF2442';
  ctx.font = `bold ${120 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('16', calendarX, calendarY + 20 * scale);

  // 装饰线条
  ctx.strokeStyle = '#FF2442';
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(calendarX - 100 * scale, calendarY + 40 * scale);
  ctx.lineTo(calendarX + 100 * scale, calendarY + 40 * scale);
  ctx.stroke();

  // 文字 "晴空"
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${48 * scale}px Arial`;
  ctx.fillText('晴空', size / 2, size - 60 * scale);

  return canvas;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// 生成图标
try {
  console.log('🎨 开始生成 PWA 图标...');

  // 生成 192x192
  const canvas192 = drawIcon(192);
  const buffer192 = canvas192.toBuffer('image/png');
  writeFileSync(join(publicDir, 'icon-192.png'), buffer192);
  console.log('✅ 已生成 icon-192.png');

  // 生成 512x512
  const canvas512 = drawIcon(512);
  const buffer512 = canvas512.toBuffer('image/png');
  writeFileSync(join(publicDir, 'icon-512.png'), buffer512);
  console.log('✅ 已生成 icon-512.png');

  console.log('🎉 图标生成完成！');
} catch (error) {
  if (error.message.includes('Cannot find module')) {
    console.error('❌ 错误：需要安装 canvas 包');
    console.log('请运行: pnpm add -D canvas');
  } else {
    console.error('❌ 生成失败:', error.message);
  }
  process.exit(1);
}
