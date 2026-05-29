import ComingSoon from '@/components/ComingSoon'

export default function RankingPage() {
  return (
    <ComingSoon
      icon="📊"
      title="Ranking ELO Nacional"
      description="Un ranking transparente que refleja tu nivel real contra toda la comunidad."
      features={[
        'Ranking nacional y por ciudad (Córdoba, Buenos Aires, etc.)',
        'ELO calculado con algoritmo estándar (como en ajedrez)',
        'Historial de partidas y evolución de tu ELO en el tiempo',
        'Leaderboard por división — ¿quién es el #1 de tu div?',
        'Badges y logros por hitos (100 partidas, primera victoria, etc.)',
      ]}
    />
  )
}
