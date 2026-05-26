import type { InstallerTemplate } from './shoplineAdmin'

const modules = import.meta.glob<{ default: InstallerTemplate }>(
  '../../../apps/metafield-installers/*.json',
  { import: 'default' }
)

const indexById: Record<string, () => Promise<InstallerTemplate>> = {}

for (const [path, loader] of Object.entries(modules)) {
  const m = path.match(/\/([^/]+)\.json$/)
  if (!m) continue
  if (m[1].startsWith('_')) continue
  indexById[m[1]] = loader as () => Promise<InstallerTemplate>
}

export function listInstallerIds(): string[] {
  return Object.keys(indexById).sort()
}

export async function loadInstallerTemplate(id: string): Promise<InstallerTemplate | null> {
  const loader = indexById[id]
  if (!loader) return null
  const tpl = await loader()
  return { ...tpl, id }
}
