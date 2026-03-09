import { notFound } from 'next/navigation'
import { getMenuById } from '@/lib/actions/menu-actions'
import { getStyles } from '@/lib/actions/style-actions'
import { GenerateFlow } from './generate-flow'

export default async function GeneratePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let menu, items
  try {
    const result = await getMenuById(id)
    menu = result.menu
    items = result.items
  } catch {
    notFound()
  }

  const styles = await getStyles()

  return <GenerateFlow menu={menu} items={items} styles={styles} />
}
