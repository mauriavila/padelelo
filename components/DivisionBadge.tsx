import { getDivisionName, getDivisionColor } from '@/lib/divisions'

interface Props {
  division: number
  showName?: boolean
  size?: 'sm' | 'md'
}

export default function DivisionBadge({ division, showName = true, size = 'md' }: Props) {
  const name = getDivisionName(division)
  const color = getDivisionColor(division)
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${sizeClass}`}
      style={{ color, borderColor: color, backgroundColor: `${color}1a` }}
    >
      <span>DIV {division}</span>
      {showName && <span>· {name}</span>}
    </span>
  )
}
