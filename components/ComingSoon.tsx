import type { ReactNode } from 'react'
import { CheckCircle } from 'lucide-react'

interface Props {
  icon: ReactNode
  title: string
  description: string
  features: string[]
}

export default function ComingSoon({ icon, title, description, features }: Props) {
  return (
    <div className="bg-grid min-h-screen max-w-lg mx-auto px-4 pt-12 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6"
        style={{
          background: 'radial-gradient(circle, rgba(233,69,96,0.15) 0%, rgba(233,69,96,0.05) 100%)',
          border: '1px solid rgba(233,69,96,0.2)',
          boxShadow: '0 0 40px rgba(233,69,96,0.1)',
        }}>
        {icon}
      </div>

      <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{title}</h1>
      <p className="text-brand-muted text-sm mb-8 max-w-xs mx-auto leading-relaxed">{description}</p>

      <div className="card-elevated bg-brand-card border border-white/8 rounded-2xl p-5 text-left mb-6">
        <p className="text-brand-red text-xs uppercase tracking-widest font-bold mb-4">Lo que viene</p>
        <ul className="space-y-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/80">
              <CheckCircle size={16} className="text-brand-red shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-white/20 text-xs">Seguimos construyendo.</p>
    </div>
  )
}
