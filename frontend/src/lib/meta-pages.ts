export type MetaPage = { id: string; name: string; access_token: string }

const GRAPH_BASE = 'https://graph.facebook.com/v19.0'

/**
 * Lists Facebook pages the user token can act on, needed to read leadgen forms.
 * `/me/accounts` returns empty when pages are managed through a Business Manager
 * instead of directly by the personal account, so we fall back to walking the
 * user's business portfolios.
 */
export async function getAccessiblePages(userToken: string): Promise<MetaPage[]> {
  const directRes = await fetch(
    `${GRAPH_BASE}/me/accounts?fields=id,name,access_token&access_token=${userToken}`
  )
  if (directRes.ok) {
    const { data } = await directRes.json() as { data?: MetaPage[] }
    if (data && data.length > 0) return data
  }

  const bizRes = await fetch(
    `${GRAPH_BASE}/me/businesses?fields=id,name&access_token=${userToken}`
  )
  if (!bizRes.ok) return []
  const { data: businesses } = await bizRes.json() as { data?: { id: string; name: string }[] }

  const pages = new Map<string, MetaPage>()
  for (const biz of (businesses ?? [])) {
    for (const edge of ['owned_pages', 'client_pages']) {
      const pagesRes = await fetch(
        `${GRAPH_BASE}/${biz.id}/${edge}?fields=id,name,access_token&access_token=${userToken}`
      )
      if (!pagesRes.ok) continue
      const { data } = await pagesRes.json() as { data?: MetaPage[] }
      for (const p of (data ?? [])) pages.set(p.id, p)
    }
  }
  return [...pages.values()]
}
