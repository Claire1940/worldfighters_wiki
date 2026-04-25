'use client'

import { useEffect, useState, Suspense, lazy } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Copy,
  ExternalLink,
  MessageCircle,
  Package,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useMessages } from 'next-intl'
import { VideoFeature } from '@/components/home/VideoFeature'
import { LatestGuidesAccordion } from '@/components/home/LatestGuidesAccordion'
import { NativeBannerAd, AdBanner } from '@/components/ads'
import { SidebarAd } from '@/components/ads/SidebarAd'
import { scrollToSection } from '@/lib/scrollToSection'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import type { ContentItemWithType } from '@/lib/getLatestArticles'

const HeroStats = lazy(() => import('@/components/home/HeroStats'))
const FAQSection = lazy(() => import('@/components/home/FAQSection'))
const CTASection = lazy(() => import('@/components/home/CTASection'))

const LoadingPlaceholder = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`} />
)

interface HomePageClientProps {
  latestArticles: ContentItemWithType[]
  locale: string
}

function priorityLabel(priority: string) {
  if (priority === 'newest') return 'Newest'
  if (priority === 'high') return 'High Priority'
  return 'Working'
}

function priorityClassName(priority: string) {
  if (priority === 'newest') {
    return 'bg-[hsl(var(--nav-theme-light)/0.14)] border-[hsl(var(--nav-theme-light)/0.4)] text-[hsl(var(--nav-theme-light))]'
  }

  if (priority === 'high') {
    return 'bg-[hsl(var(--nav-theme)/0.14)] border-[hsl(var(--nav-theme)/0.4)] text-[hsl(var(--nav-theme-light))]'
  }

  return 'bg-white/5 border-border text-muted-foreground'
}

export default function HomePageClient({ latestArticles, locale }: HomePageClientProps) {
  const t = useMessages() as any
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://worldfighters.wiki'
  const robloxGameUrl = 'https://www.roblox.com/games/95630541662383/World-Fighters'
  const robloxGroupUrl = 'https://www.roblox.com/communities/33910482/StarX-Inc'
  const discordUrl = 'https://discord.gg/worldfighters'
  const xUrl = 'https://x.com/tanlugi'
  const heroImageUrl = new URL('/images/hero.webp', siteUrl).toString()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const structuredData = {
    "@context": 'https://schema.org',
    "@graph": [
      {
        "@type": 'WebSite',
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": 'World Fighters Wiki',
        "description": 'World Fighters Wiki helps Roblox players track codes, fighters, worlds, bosses, passives, raids, updates, and beginner progression tips.',
        "image": {
          "@type": 'ImageObject',
          "url": heroImageUrl,
          "width": 1920,
          "height": 1080,
          "caption": 'World Fighters Wiki - Roblox Fighting Simulator',
        },
        "potentialAction": {
          "@type": 'SearchAction',
          "target": `${siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        "@type": 'Organization',
        "@id": `${siteUrl}/#organization`,
        "name": 'World Fighters Wiki',
        "alternateName": 'World Fighters',
        "url": siteUrl,
        "description": 'Community resource hub for World Fighters codes, units, bosses, worlds, raids, passives, and Roblox progression guides.',
        "logo": {
          "@type": 'ImageObject',
          "url": `${siteUrl}/android-chrome-512x512.png`,
          "width": 512,
          "height": 512,
        },
        "image": {
          "@type": 'ImageObject',
          "url": heroImageUrl,
          "width": 1920,
          "height": 1080,
          "caption": 'World Fighters Wiki - Roblox Fighting Simulator',
        },
        "sameAs": [
          robloxGameUrl,
          robloxGroupUrl,
          discordUrl,
          xUrl,
        ],
      },
      {
        "@type": 'VideoGame',
        "name": 'World Fighters',
        "alternateName": 'World Fighters Simulator',
        "gamePlatform": ['Roblox'],
        "applicationCategory": 'Game',
        "genre": ['Anime', 'Fighting', 'Simulator', 'Adventure', 'Roblox'],
        "publisher": {
          "@type": 'Organization',
          "name": 'StarX Inc',
          "url": robloxGroupUrl,
        },
        "offers": {
          "@type": 'Offer',
          "price": '0',
          "priceCurrency": 'USD',
          "availability": 'https://schema.org/InStock',
          "url": robloxGameUrl,
        },
      },
    ],
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-reveal-visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    window.setTimeout(() => setCopiedCode(null), 1800)
  }

  const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault()
    scrollToSection(sectionId)
  }

  const navCards = t.tools.cards
  const codesModule = t.modules.worldFightersCodes
  const beginnerModule = t.modules.worldFightersBeginnerGuide
  const linksModule = t.modules.worldFightersOfficialLinks
  const tierModule = t.modules.worldFightersTierList

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ left: 'calc((100vw - 896px) / 2 - 180px)' }}
      >
        <SidebarAd type="sidebar-160x300" adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X300} />
      </aside>

      <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ right: 'calc((100vw - 896px) / 2 - 180px)' }}
      >
        <SidebarAd type="sidebar-160x600" adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X600} />
      </aside>

      {/* 广告位 1: 移动端横幅 Sticky */}
      {/* <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div> */}

      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] mb-6">
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-sm font-medium">{t.hero.badge}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t.hero.title}
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              {t.hero.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)] text-primary-foreground rounded-lg font-semibold text-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </a>
              <a
                href={robloxGameUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border hover:bg-white/10 rounded-lg font-semibold text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA || t.hero.playOnSteamCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ''} />

      <section className="px-4 py-12">
        <div className="scroll-reveal container mx-auto max-w-4xl">
          <div className="relative rounded-2xl overflow-hidden">
            <VideoFeature
              videoId="HwyPE53zmyM"
              title="Noob to Master in World Fighters!"
              posterImage="/images/hero.webp"
            />
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={30} />

      {/* Tools Grid - 16 Navigation Cards */}
      <section className="px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.tools.title}{' '}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="#world-fighters-codes"
              onClick={(event) => handleAnchorClick(event, 'world-fighters-codes')}
              className="scroll-reveal group p-6 rounded-xl border border-border bg-card hover:border-[hsl(var(--nav-theme)/0.5)] transition-all duration-300 text-left hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
            >
              <div className="w-12 h-12 rounded-lg mb-4 bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center group-hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors">
                <DynamicIcon name={navCards[0].icon} className="w-6 h-6 text-[hsl(var(--nav-theme-light))]" />
              </div>
              <h3 className="font-semibold mb-2">{navCards[0].title}</h3>
              <p className="text-sm text-muted-foreground">{navCards[0].description}</p>
            </a>

            <a
              href="#world-fighters-beginner-guide"
              onClick={(event) => handleAnchorClick(event, 'world-fighters-beginner-guide')}
              className="scroll-reveal group p-6 rounded-xl border border-border bg-card hover:border-[hsl(var(--nav-theme)/0.5)] transition-all duration-300 text-left hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
            >
              <div className="w-12 h-12 rounded-lg mb-4 bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center group-hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors">
                <DynamicIcon name={navCards[1].icon} className="w-6 h-6 text-[hsl(var(--nav-theme-light))]" />
              </div>
              <h3 className="font-semibold mb-2">{navCards[1].title}</h3>
              <p className="text-sm text-muted-foreground">{navCards[1].description}</p>
            </a>

            <a
              href="#world-fighters-discord-and-official-links"
              onClick={(event) => handleAnchorClick(event, 'world-fighters-discord-and-official-links')}
              className="scroll-reveal group p-6 rounded-xl border border-border bg-card hover:border-[hsl(var(--nav-theme)/0.5)] transition-all duration-300 text-left hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
            >
              <div className="w-12 h-12 rounded-lg mb-4 bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center group-hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors">
                <DynamicIcon name={navCards[2].icon} className="w-6 h-6 text-[hsl(var(--nav-theme-light))]" />
              </div>
              <h3 className="font-semibold mb-2">{navCards[2].title}</h3>
              <p className="text-sm text-muted-foreground">{navCards[2].description}</p>
            </a>

            <a
              href="#world-fighters-tier-list"
              onClick={(event) => handleAnchorClick(event, 'world-fighters-tier-list')}
              className="scroll-reveal group p-6 rounded-xl border border-border bg-card hover:border-[hsl(var(--nav-theme)/0.5)] transition-all duration-300 text-left hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
            >
              <div className="w-12 h-12 rounded-lg mb-4 bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center group-hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors">
                <DynamicIcon name={navCards[3].icon} className="w-6 h-6 text-[hsl(var(--nav-theme-light))]" />
              </div>
              <h3 className="font-semibold mb-2">{navCards[3].title}</h3>
              <p className="text-sm text-muted-foreground">{navCards[3].description}</p>
            </a>
          </div>
        </div>
      </section>

      {/* 广告位 3: 标准横幅 728×90 */}
      <AdBanner type="banner-728x90" adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90} />

      {/* 广告位 4: 方形广告 300×250 */}
      <AdBanner type="banner-300x250" adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250} />

      {/* Module 1: World Fighters Codes */}
      <section id="world-fighters-codes" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] mb-4">
              <ClipboardCheck className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-sm font-medium">{codesModule.eyebrow}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{codesModule.title}</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-4">
              {codesModule.subtitle}
            </p>
            <p className="text-muted-foreground max-w-4xl mx-auto">
              {codesModule.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-6 items-start">
            <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
              {codesModule.codes.map((item: any) => (
                <article
                  key={item.code}
                  className="p-5 rounded-xl border border-border bg-white/5 hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${priorityClassName(item.priority)}`}>
                        {priorityLabel(item.priority)}
                      </span>
                      <p className="mt-3 font-mono text-lg font-bold tracking-normal break-all">
                        {item.code}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCode(item.code)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.08)] text-[hsl(var(--nav-theme-light))] hover:bg-[hsl(var(--nav-theme)/0.16)] transition-colors"
                      aria-label={`Copy ${item.code}`}
                    >
                      {copiedCode === item.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.08)] border border-[hsl(var(--nav-theme)/0.25)]">
                      <Package className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />
                      {item.tag}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.reward}</p>
                  </div>
                </article>
              ))}
            </div>

            <aside className="scroll-reveal lg:sticky lg:top-24 space-y-4">
              <div className="p-6 rounded-xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.06)]">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                  <h3 className="font-bold">{codesModule.redeemGuide.label}</h3>
                </div>
                <ol className="space-y-3">
                  {codesModule.redeemGuide.steps.map((step: string, index: number) => (
                    <li key={index} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.16)] text-[hsl(var(--nav-theme-light))] font-bold">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-6 rounded-xl border border-border bg-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                  <h3 className="font-bold">World Fighters Code Priorities</h3>
                </div>
                <ul className="space-y-2">
                  {codesModule.summary.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 广告位 5: 中型横幅 468×60 */}
      <AdBanner type="banner-468x60" adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60} />

      {/* Module 2: World Fighters Beginner Guide */}
      <section id="world-fighters-beginner-guide" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] mb-4">
              <BookOpen className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-sm font-medium">{beginnerModule.eyebrow}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{beginnerModule.title}</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-4">
              {beginnerModule.subtitle}
            </p>
            <p className="text-muted-foreground max-w-4xl mx-auto">
              {beginnerModule.intro}
            </p>
          </div>

          <div className="scroll-reveal relative space-y-5">
            {beginnerModule.steps.map((step: any, index: number) => (
              <article
                key={step.step}
                className="relative grid grid-cols-1 md:grid-cols-[4rem_1fr] gap-4 p-6 rounded-xl border border-border bg-card hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex md:block">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.16)] border border-[hsl(var(--nav-theme)/0.4)] text-[hsl(var(--nav-theme-light))] text-lg font-bold">
                    {index + 1}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-normal text-[hsl(var(--nav-theme-light))] font-semibold mb-2">
                    {step.goal}
                  </p>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground mb-4">{step.details}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.keyResources.map((resource: string) => (
                      <span
                        key={resource}
                        className="px-3 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.08)] border border-[hsl(var(--nav-theme)/0.25)] text-xs text-muted-foreground"
                      >
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="scroll-reveal mt-8 p-6 rounded-xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold">{beginnerModule.checklistTitle}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {beginnerModule.checklist.map((item: string) => (
                <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-[hsl(var(--nav-theme-light))]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Module 3: World Fighters Discord and Official Links */}
      <section id="world-fighters-discord-and-official-links" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] mb-4">
              <ExternalLink className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-sm font-medium">{linksModule.eyebrow}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{linksModule.title}</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-4">
              {linksModule.subtitle}
            </p>
            <p className="text-muted-foreground max-w-4xl mx-auto">
              {linksModule.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {linksModule.links.map((item: any) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 rounded-xl border border-border bg-white/5 hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs ${item.status === 'official' ? 'bg-[hsl(var(--nav-theme)/0.14)] border-[hsl(var(--nav-theme)/0.35)] text-[hsl(var(--nav-theme-light))]' : 'bg-white/5 border-border text-muted-foreground'}`}>
                      {item.status === 'official' ? <Shield className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                      {item.status === 'official' ? 'Official' : 'Player Resource'}
                    </span>
                    <h3 className="text-lg font-bold mt-3 group-hover:text-[hsl(var(--nav-theme-light))] transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  <ExternalLink className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-[hsl(var(--nav-theme-light))] transition-colors" />
                </div>
                <p className="text-sm text-[hsl(var(--nav-theme-light))] mb-2">{item.type}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.useCase}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50 */}
      <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />

      {/* Module 4: World Fighters Tier List */}
      <section id="world-fighters-tier-list" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] mb-4">
              <Star className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-sm font-medium">{tierModule.eyebrow}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{tierModule.title}</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-4">
              {tierModule.subtitle}
            </p>
            <p className="text-muted-foreground max-w-4xl mx-auto">
              {tierModule.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-5">
            {tierModule.tiers.map((tier: any) => (
              <article
                key={tier.tier}
                className="grid grid-cols-1 lg:grid-cols-[8rem_1fr] gap-4 p-5 rounded-xl border border-border bg-card"
              >
                <div className="flex lg:flex-col items-center lg:items-start gap-3 lg:gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--nav-theme)/0.16)] border border-[hsl(var(--nav-theme)/0.4)] text-[hsl(var(--nav-theme-light))] text-2xl font-bold">
                    {tier.tier}
                  </div>
                  <div>
                    <h3 className="font-bold">{tier.label}</h3>
                    <p className="text-xs text-muted-foreground">World Fighters Tier</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tier.entries.map((entry: any) => (
                    <div
                      key={entry.name}
                      className="p-4 rounded-lg border border-border bg-white/5 hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="font-bold">{entry.name}</h4>
                          <p className="text-xs text-[hsl(var(--nav-theme-light))]">{entry.role}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.08)] border border-[hsl(var(--nav-theme)/0.25)] text-xs">
                          {entry.price}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{entry.whyItMatters}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="scroll-reveal mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {tierModule.buyingNotes.map((note: string, index: number) => (
              <div key={note} className="p-5 rounded-xl border border-[hsl(var(--nav-theme)/0.25)] bg-[hsl(var(--nav-theme)/0.06)]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.16)] text-[hsl(var(--nav-theme-light))] font-bold">
                    {index + 1}
                  </span>
                  <h3 className="font-bold">World Fighters Buying Note</h3>
                </div>
                <p className="text-sm text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner type="banner-728x90" adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90} />

      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">{t.footer.description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href={xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href={robloxGroupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href={robloxGameUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">{t.footer.copyright}</p>
              <p className="text-xs text-muted-foreground">{t.footer.disclaimer}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
