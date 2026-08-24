// TEMPORARY — verify 5-series chart + legend. Delete after checking.
import { MomentumChart } from '@/components/MomentumChart'
import type { MomentumSeries } from '@/lib/leaderboard'

const NAMES = [
  'Muhammad Ahmad',
  'Muhammad Burhan niaz',
  'Hassaan Safdar',
  'Ayesha Noor',
  'Zainab Iqbal',
]

const SERIES: MomentumSeries[] = NAMES.map((name, i) => ({
  studentId: String(i),
  fullName: name,
  points: [
    { date: '2026-08-01', points: 0, evaluations: 0, quality: 0, baseline: true },
    { date: '2026-08-10', points: (5 - i) * 6, evaluations: 2, quality: 90 - i * 4 },
    { date: '2026-08-24', points: (5 - i) * 12, evaluations: 4, quality: 88 - i * 3 },
  ],
}))

export default function TmpChart5() {
  return (
    <div className="container-page py-8">
      <MomentumChart series={SERIES} cycleName="Cohort 2026" />
    </div>
  )
}
