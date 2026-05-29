import { getDivisionName, getDivisionColor } from '@/lib/divisions'

interface Props {
  division: number
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function DivisionBadge({ division, showName = true, size = 'md' }: Props) {
  const name = getDivisionName(division)
  const color = getDivisionColor(division)

  const sizeClass =
    size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' :
    size === 'lg' ? 'text-sm px-4 py-1.5 gap-1.5 font-bold' :
    'text-sm px-3 py-1 gap-1'

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${sizeClass}`}
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}15`,
      }}
    >
      <span className="font-bold">DIV {division}</span>
      {showName && <span className="opacity-80">· {name}</span>}
    </span>
  )
}
