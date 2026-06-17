import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { buildPageTree, getPageBlocks } from '@/lib/notion/tree'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import Breadcrumb from '@/components/Breadcrumb'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { theme } from '@/theme/config'

export const revalidate = 3600

const ROOT_PAGE_ID = process.env.ROOT_PAGE_ID!

export async function generateStaticParams() {
  try {
    const tree = await buildPageTree(ROOT_PAGE_ID)
    const slugs: { slug: string }[] = []
    const collect = (node: typeof tree.root) => {
      slugs.push({ slug: node.slug })
      node.children.forEach(collect)
    }
    collect(tree.root)
    return slugs
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tree = await buildPageTree(ROOT_PAGE_ID)
  const node = tree.bySlug.get(slug)
  if (!node) return { title: theme.siteName }
  return {
    title: `${node.title} — ${theme.siteName}`,
    description: `${node.title} · ${theme.siteTagline}`,
  }
}

export default async function PortalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  const tree = await buildPageTree(ROOT_PAGE_ID)
  const node = tree.bySlug.get(slug)

  if (!node) notFound()

  // Log access (fire-and-forget; don't block render)
  if (session?.user?.id) {
    prisma.accessLog
      .create({ data: { userId: session.user.id, pageSlug: slug } })
      .catch(() => {})
  }

  const allBlocks = await getPageBlocks(node.id)

  return (
    <main className="flex-1 px-6 py-8 md:px-12 lg:px-16 max-w-4xl w-full mx-auto">
      <Breadcrumb tree={tree} />
      <h1 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
        {node.title}
      </h1>
      <BlockRenderer
        blockId={node.id}
        allBlocks={allBlocks}
        slugMap={tree.slugMap}
        depth={0}
      />
    </main>
  )
}
