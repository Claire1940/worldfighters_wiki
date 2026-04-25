import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { CONTENT_TYPES as CONFIG_CONTENT_TYPES } from '@/config/navigation'
import type { Locale } from '@/i18n/routing'

/**
 * 将文件名转换为 URL-safe slug
 * 所有非字母数字连字符下划线的字符（冒号、问号、井号、空格等）替换为 -
 * 合并连续的 -，去掉首尾 -
 */
function fileNameToSlug(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 根据 slug 在目录中反查真实文件名（不含 .mdx）
 * 例如 slug="lucid-blocks-guide" → 返回 "lucid:blocks-guide"
 */
export function findFileBySlug(dir: string, slug: string, basePath: string[] = []): string | null {
  if (!fs.existsSync(dir)) return null
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const result = findFileBySlug(fullPath, slug, [...basePath, entry.name])
      if (result) return result
    } else if (entry.name.endsWith('.mdx')) {
      const fileName = entry.name.replace('.mdx', '')
      const entrySlug = [...basePath, fileNameToSlug(fileName)].join('/')
      if (entrySlug === slug) {
        return [...basePath, fileName].join('/')
      }
    }
  }
  return null
}

// 通用 Frontmatter 接口
export interface ContentFrontmatter {
  title: string
  description: string
  category?: string
  image?: string
  date?: string
  lastModified?: string
  author?: string
  // 新增：可选的手动颜色配置
  themeColor?: string  // 十六进制颜色，如 "1e40af"
  backgroundText?: string  // 自定义背景文字
  // 扩展字段（用于不同内容类型）
  rarity?: string  // 用于 units
  type?: string    // 用于 traits
  code?: string    // 用于 codes
}

// 从统一配置导入内容类型
export const CONTENT_TYPES = CONFIG_CONTENT_TYPES
export type ContentType = typeof CONTENT_TYPES[number]

// 支持的语言（使用 routing.ts 中的 Locale 类型）
export type Language = Locale

// 内容项接口
export interface ContentItem {
  slug: string
  frontmatter: ContentFrontmatter
}

// 内容数据接口
export interface ContentData {
  content: string
  frontmatter: ContentFrontmatter
}

function readContentFrontmatter(filePath: string): ContentFrontmatter | null {
  if (!fs.existsSync(filePath)) return null

  const source = fs.readFileSync(filePath, 'utf8')
  const frontmatter = matter(source).data
  if (frontmatter.title && frontmatter.description) {
    return frontmatter as ContentFrontmatter
  }

  const metadataMatch = source.match(/export\s+const\s+metadata\s*=\s*({[\s\S]*?\n})/)
  if (!metadataMatch) return null

  try {
    return Function(`"use strict"; return (${metadataMatch[1]})`)() as ContentFrontmatter
  } catch {
    return null
  }
}

/**
 * 辅助函数：递归获取目录下所有 MDX 文件的 slug
 */
function getSlugsFromDirectory(dir: string, basePath: string[] = []): string[] {
  if (!fs.existsSync(dir)) return []

  const slugs: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      slugs.push(...getSlugsFromDirectory(fullPath, [...basePath, entry.name]))
    } else if (entry.name.endsWith('.mdx')) {
      const fileName = entry.name.replace('.mdx', '')
      slugs.push([...basePath, fileNameToSlug(fileName)].join('/'))
    }
  }
  return slugs
}

/**
 * 获取所有内容列表（支持递归读取嵌套目录）
 * 使用动态 import 获取 MDX 文件的 metadata
 */
export async function getAllContent(
  contentType: ContentType,
  language: Language
): Promise<ContentItem[]> {
  const items: ContentItem[] = []

  // 获取指定语言的所有 slugs
  const contentDir = path.join(process.cwd(), 'content', language, contentType)
  let slugs = getSlugsFromDirectory(contentDir)

  // 如果不是英文，也获取英文目录的 slugs（用于 fallback）
  if (language !== 'en') {
    const enContentDir = path.join(process.cwd(), 'content', 'en', contentType)
    const enSlugs = getSlugsFromDirectory(enContentDir)
    // 合并，去重
    slugs = [...new Set([...slugs, ...enSlugs])]
  }

  // 从文件系统读取每个文件的 metadata，避免空 content/ 目录触发打包期动态 import 警告。
  for (const slug of slugs) {
    try {
      // 先尝试当前语言（反查真实文件名以处理含特殊字符的文件名）
      const realSlug = findFileBySlug(contentDir, slug) || slug
      const frontmatter = readContentFrontmatter(path.join(contentDir, `${realSlug}.mdx`))
      if (frontmatter) {
        items.push({
          slug,
          frontmatter,
        })
      }
    } catch {
      // Fallback 到英文
      if (language !== 'en') {
        try {
          const enContentDir = path.join(process.cwd(), 'content', 'en', contentType)
          const enRealSlug = findFileBySlug(enContentDir, slug) || slug
          const frontmatter = readContentFrontmatter(path.join(enContentDir, `${enRealSlug}.mdx`))
          if (frontmatter) {
            items.push({
              slug,
              frontmatter,
            })
          }
        } catch {
          // 跳过无法加载的文件
        }
      }
    }
  }

  // 按更新时间排序(最新的在前)，优先 lastModified，缺失时回退 date。
  return items.sort((a, b) => {
    // 添加 frontmatter 存在性检查(防御性编程)
    if (!a.frontmatter || !b.frontmatter) {
      console.warn('Missing frontmatter in content item:', { a: a.slug, b: b.slug })
      return 0
    }
    const getTime = (item: ContentItem) => {
      const fm = item.frontmatter
      if (fm.lastModified) return new Date(fm.lastModified).getTime()
      if (fm.date) return new Date(fm.date).getTime()
      return 0
    }
    const timeDiff = getTime(b) - getTime(a)
    if (timeDiff !== 0) return timeDiff
    return a.slug.localeCompare(b.slug)
  })
}

/**
 * 获取所有内容路径（用于 generateStaticParams）
 * 返回格式: [['guide', 'beginner'], ['unit', 'jinwoo'], ...]
 */
export async function getAllContentPaths(): Promise<string[][]> {
  const paths: string[][] = []

  for (const contentType of CONTENT_TYPES) {
    const contentDir = path.join(process.cwd(), 'content', 'en', contentType)

    const scanDirectory = (dir: string, basePath: string[] = []) => {
      if (!fs.existsSync(dir)) return

      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          scanDirectory(fullPath, [...basePath, entry.name])
        } else if (entry.name.endsWith('.mdx')) {
          const fileName = entry.name.replace('.mdx', '')
          paths.push([contentType, ...basePath, fileNameToSlug(fileName)])
        }
      }
    }

    scanDirectory(contentDir)
  }

  return paths
}

/**
 * 获取所有内容的 slug（用于 generateStaticParams）
 */
export async function getAllContentSlugs(
  contentType: ContentType,
  language: Language
): Promise<string[]> {
  const items = await getAllContent(contentType, language)
  return items.map(item => item.slug)
}

/**
 * 验证内容类型是否有效
 */
export function isValidContentType(type: string): type is ContentType {
  return CONTENT_TYPES.includes(type as ContentType)
}

/**
 * 验证语言是否有效
 */
export function isValidLanguage(lang: string): lang is Language {
  const validLanguages: Language[] = ['en', 'pt', 'es', 'th']
  return validLanguages.includes(lang as Language)
}

/**
 * 获取默认语言
 */
export function getDefaultLanguage(): Language {
  return 'en'
}
