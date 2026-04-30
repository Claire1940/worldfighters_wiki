import { BookOpen, Crown, Gem, ScrollText, Shield, Ticket, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
	{
		key: 'codes',
		path: '/codes',
		icon: Ticket,
		isContentType: true,
	},
	{
		key: 'guide',
		path: '/guide',
		icon: BookOpen,
		isContentType: true,
	},
	{
		key: 'resources',
		path: '/resources',
		icon: Gem,
		isContentType: true,
	},
	{
		key: 'units',
		path: '/units',
		icon: Users,
		isContentType: true,
	},
	{
		key: 'bosses',
		path: '/bosses',
		icon: Crown,
		isContentType: true,
	},
	{
		key: 'quests',
		path: '/quests',
		icon: ScrollText,
		isContentType: true,
	},
	{
		key: 'raids',
		path: '/raids',
		icon: Shield,
		isContentType: true,
	},
	{
		key: 'community',
		path: '/community',
		icon: Users,
		isContentType: true,
	},
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['codes', 'guide', 'resources', 'units', 'bosses', 'quests', 'raids']

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
