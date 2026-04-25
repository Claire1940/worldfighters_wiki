import type { ContentFrontmatter, ContentType } from '@/lib/content'

interface ArticleStructuredDataProps {
	frontmatter: ContentFrontmatter
	contentType: ContentType
	locale: string
	slug: string
}

export function ArticleStructuredData({
	frontmatter,
	contentType,
	locale,
	slug,
}: ArticleStructuredDataProps) {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://worldfighters.wiki'
	const localePrefix = locale === 'en' ? '' : `/${locale}`
	const articleUrl =
		locale === 'en'
			? `${siteUrl}/${contentType}/${slug}`
			: `${siteUrl}/${locale}/${contentType}/${slug}`
	const listUrl = `${siteUrl}${localePrefix}/${contentType}`
	const homeUrl = locale === 'en' ? siteUrl : `${siteUrl}/${locale}`

	const breadcrumbData = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: homeUrl,
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: contentType.charAt(0).toUpperCase() + contentType.slice(1),
				item: listUrl,
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: frontmatter.title,
				item: articleUrl,
			},
		],
	}

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: frontmatter.title,
		description: frontmatter.description,
		image: frontmatter.image || `${siteUrl}/images/hero.webp`,
		datePublished: frontmatter.date,
		dateModified: ('lastModified' in frontmatter && frontmatter.lastModified) || frontmatter.date,
		author: {
			'@type': 'Organization',
			name: 'World Fighters Wiki Team',
		},
		publisher: {
			'@type': 'Organization',
			name: 'World Fighters Wiki',
			logo: {
				'@type': 'ImageObject',
				url: `${siteUrl}/android-chrome-512x512.png`,
			},
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': articleUrl,
		},
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
			/>
		</>
	)
}
