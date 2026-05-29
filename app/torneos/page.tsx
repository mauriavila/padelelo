import { Trophy } from 'lucide-react'
import ComingSoon from '@/components/ComingSoon'

export default function TorneosPage() {
  return (
    <ComingSoon
      icon={<Trophy size={40} className="text-brand-red" />}
      title="Torneos por División"
      description="Competí contra jugadores de tu nivel en torneos organizados por PADELELO."
      features={[
        'Torneos mensuales por cada división (Div 1 a Div 7)',
        'Entrada con pago online — todos los premios van al pool',
        'Brackets automáticos por ELO dentro de cada división',
        'Los resultados impactan directamente en tu ranking',
        'Historial completo de torneos y posiciones',
      ]}
    />
  )
}
