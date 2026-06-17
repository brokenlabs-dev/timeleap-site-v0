import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const secret = body?.secret

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const slug = body?.slug
  if (slug) {
    revalidatePath(`/portal/${slug}`)
  } else {
    revalidatePath('/portal', 'layout')
  }

  return NextResponse.json({ revalidated: true, slug: slug ?? 'all' })
}
