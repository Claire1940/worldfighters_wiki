import { MetadataRoute } from 'next'
import { getAllContent, CONTENT_TYPES, type ContentType } from '@/lib/content'
import { routing, type Locale } from '@/i18n/routing'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://worldfighters.wiki'

function localizedUrl(path: string, locale: Locale): string {
	const normalizedPath = path === '/' ? '' : path.replace(/\/$/, '')
	return locale === 'en'
		? `${BASE_URL}${normalizedPath}`
		: `${BASE_URL}/${locale}${normalizedPath}`
}

function languageAlternates(path: string) {
	const languages: Record<string, string> = {}

	for (const locale of routing.locales) {
		languages[locale] = localizedUrl(path, locale)
	}

	languages['x-default'] = localizedUrl(path, 'en')
	return { languages }
}

// 静态页面配置
const staticPagesConfig: Record<string, { priority: number; changeFrequency: 'monthly' | 'yearly' }> = {
	'about': { priority: 0.6, changeFrequency: 'monthly' },
	'privacy-policy': { priority: 0.3, changeFrequency: 'yearly' },
	'terms-of-service': { priority: 0.3, changeFrequency: 'yearly' },
	'copyright': { priority: 0.3, changeFrequency: 'yearly' },
}

// 内容类型优先级配置
const contentTypePriority: Record<string, number> = {
	'codes': 0.95,
	'guide': 0.9,
	'resources': 0.85,
	'units': 0.85,
	'bosses': 0.8,
	'quests': 0.8,
	'raids': 0.8,
}

// 内容更新频率配置
const contentTypeChangeFrequency: Record<string, 'daily' | 'weekly' | 'monthly'> = {
	'codes': 'daily',
	'guide': 'weekly',
	'resources': 'weekly',
	'units': 'weekly',
	'bosses': 'weekly',
	'quests': 'weekly',
	'raids': 'weekly',
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const sitemap: MetadataRoute.Sitemap = []
	const lastModified = new Date()

	// 1. 首页（所有语言版本）
	for (const locale of routing.locales) {
		sitemap.push({
			url: localizedUrl('/', locale),
			lastModified,
			changeFrequency: 'daily',
			priority: 1.0,
			alternates: languageAlternates('/'),
		})
	}

	// 2. 静态页面（所有语言版本）
	const staticPages = ['about', 'privacy-policy', 'terms-of-service', 'copyright']
	for (const locale of routing.locales) {
		for (const page of staticPages) {
			const config = staticPagesConfig[page] || { priority: 0.5, changeFrequency: 'monthly' as const }
			const pagePath = `/${page}`
			sitemap.push({
				url: localizedUrl(pagePath, locale),
				lastModified,
				changeFrequency: config.changeFrequency,
				priority: config.priority,
				alternates: languageAlternates(pagePath),
			})
		}
	}

	// 3. 内容分类页（所有语言版本）
	for (const locale of routing.locales) {
		for (const contentType of CONTENT_TYPES) {
			const contentPath = `/${contentType}`
			sitemap.push({
				url: localizedUrl(contentPath, locale),
				lastModified,
				changeFrequency: contentTypeChangeFrequency[contentType] || 'weekly',
				priority: contentTypePriority[contentType] || 0.7,
				alternates: languageAlternates(contentPath),
			})
		}
	}

	// 4. 所有 MDX 文章（所有语言版本和内容类型）
	for (const locale of routing.locales) {
		for (const contentType of CONTENT_TYPES) {
			try {
				// 获取该语言和内容类型的所有文章
				const articles = await getAllContent(contentType as ContentType, locale as Locale)

				for (const article of articles) {
					// 构建完整的文章 URL
					const articlePath = `/${contentType}/${article.slug}`

					// 获取该内容类型的优先级和更新频率
					const priority = contentTypePriority[contentType] || 0.7
					const changeFrequency = contentTypeChangeFrequency[contentType] || 'weekly'

					sitemap.push({
						url: localizedUrl(articlePath, locale),
						lastModified: article.frontmatter.date
							? new Date(article.frontmatter.date)
							: lastModified,
						changeFrequency: changeFrequency,
						priority: priority,
						alternates: languageAlternates(articlePath),
					})
				}
			} catch (error) {
				// 忽略无法加载的内容类型
				console.warn(`Failed to load content for ${locale}/${contentType}:`, error)
			}
		}
	}

	return sitemap
}
