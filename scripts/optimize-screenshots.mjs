#!/usr/bin/env node
/**
 * 扫描 public/screenshots/*.png，对超过阈值的：
 *  1) 压缩并替换原 PNG（最大 1600px 宽，压缩到合理大小）
 *  2) 同时生成对应的 .webp（更小，文档里 <img> 标签可以选用）
 *
 * 用法：
 *   node scripts/optimize-screenshots.mjs
 *
 * 也可以在 pre-commit 里跑。
 */

import { readdirSync, statSync, copyFileSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import sharp from 'sharp'

const DIR = new URL('../public/screenshots/', import.meta.url).pathname
const MAX_WIDTH = 1600
const MAX_BYTES_TO_SKIP = 4 * 1024 // 1x1 占位 PNG 等小文件跳过
const TARGET_QUALITY = 82

const files = readdirSync(DIR).filter((f) => /\.(png|jpg|jpeg)$/i.test(f))
if (files.length === 0) {
  console.log('[optimize-screenshots] 没有发现需要处理的图片')
  process.exit(0)
}

let touched = 0
for (const file of files) {
  const fullPath = join(DIR, file)
  const stats = statSync(fullPath)
  if (stats.size <= MAX_BYTES_TO_SKIP) {
    console.log(`[skip] ${file} (${stats.size} B，太小，可能是占位图)`)
    continue
  }

  const sizeKB = (stats.size / 1024).toFixed(1)
  console.log(`[process] ${file} (${sizeKB} KB)`)

  const ext = extname(file).toLowerCase()
  const slug = basename(file, ext)

  try {
    // 1) 原 PNG/JPG 压缩并限制最大宽度
    const buffer = await sharp(fullPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .toBuffer()
    if (ext === '.png') {
      await sharp(buffer)
        .png({ quality: TARGET_QUALITY, compressionLevel: 9, palette: true })
        .toFile(fullPath + '.tmp')
    } else {
      await sharp(buffer).jpeg({ quality: TARGET_QUALITY, mozjpeg: true }).toFile(fullPath + '.tmp')
    }
    copyFileSync(fullPath + '.tmp', fullPath)
    const { size: newSize } = statSync(fullPath)
    console.log(`  → 压缩后 ${(newSize / 1024).toFixed(1)} KB`)

    // 2) 同时生成 webp
    const webpPath = join(DIR, slug + '.webp')
    await sharp(buffer).webp({ quality: TARGET_QUALITY }).toFile(webpPath)
    const { size: webpSize } = statSync(webpPath)
    console.log(`  → 同时生成 ${slug}.webp (${(webpSize / 1024).toFixed(1)} KB)`)

    touched++
  } catch (err) {
    console.error(`[error] ${file}:`, err.message)
  }
}

console.log(`\n[done] 处理 ${touched} 张图片`)
