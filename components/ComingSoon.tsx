interface Props {
  icon: string
  title: string
  description: string
  features: string[]
}

export default function ComingSoon({ icon, title, description, features }: Props) {
  return (
    <div className="max-w-lg mx-auto px-4 pt-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h1 className="text-2xl font-black text-white mb-2">{title}</h1>
      <p className="text-brand-muted text-sm mb-8">{description}</p>

      <div className="bg-brand-card border border-brand-navy rounded-2xl p-5 text-left">
        <p className="text-brand-red text-xs uppercase tracking-widest font-bold mb-4">Próximamente</p>
        <ul className="space-y-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white">
              <span className="text-brand-red mt-0.5">◆</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-brand-muted text-xs mt-6">Seguimos construyendo. Stay tuned.</p>
    </div>
  )
}
