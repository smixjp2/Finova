'use client'

import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
import { StatCard } from '@/components/ui'
Chart.register(...registerables)

const FMT = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' MAD'

interface Props {
  chartData: { name: string; inc: number; exp: number }[]
  catData:   { name: string; value: number; fill: string }[]
  totalInc: number; totalExp: number; savings: number; rate: number
}

export default function ReportsClient({ chartData, catData, totalInc, totalExp, savings, rate }: Props) {
  const barRef   = useRef<HTMLCanvasElement>(null)
  const donutRef = useRef<HTMLCanvasElement>(null)
  const barInst   = useRef<Chart | null>(null)
  const donutInst = useRef<Chart | null>(null)
  const totalCats = catData.reduce((s, c) => s + c.value, 0) || 1

  useEffect(() => {
    if (!barRef.current) return
    barInst.current?.destroy()
    barInst.current = new Chart(barRef.current, {
      type: 'bar',
      data: { labels: chartData.map(d => d.name), datasets: [
        { label: 'Revenus',  data: chartData.map(d => d.inc), backgroundColor: '#00d4aa44', borderColor: '#00d4aa', borderWidth: 1.5, borderRadius: 5 },
        { label: 'Dépenses', data: chartData.map(d => d.exp), backgroundColor: '#f43f5e33', borderColor: '#f43f5e', borderWidth: 1.5, borderRadius: 5 },
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#4a6080', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#4a6080', font: { size: 11 }, callback: v => Math.round(+v).toLocaleString('fr-FR') }, grid: { color: 'rgba(255,255,255,0.04)' } } } },
    })
    return () => barInst.current?.destroy()
  }, [chartData])

  useEffect(() => {
    if (!donutRef.current || !catData.length) return
    donutInst.current?.destroy()
    donutInst.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: { labels: catData.map(d => d.name), datasets: [{ data: catData.map(d => d.value), backgroundColor: catData.map(d => d.fill), borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } },
    })
    return () => donutInst.current?.destroy()
  }, [catData])

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: '0 0 20px' }}>Rapports</h1>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <StatCard label="Total revenus"  value={FMT(totalInc)}  color="var(--acc)" />
        <StatCard label="Total dépenses" value={FMT(totalExp)}  color="var(--danger)" />
        <StatCard label="Épargne totale" value={FMT(savings)}   color={savings >= 0 ? 'var(--acc)' : 'var(--danger)'} />
        <StatCard label="Taux d'épargne" value={`${rate}%`}     color={rate >= 20 ? 'var(--acc)' : rate >= 10 ? '#f59e0b' : 'var(--danger)'} />
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginRight: 'auto' }}>Revenus vs Dépenses (6 mois)</div>
          {[['Revenus', '#00d4aa'], ['Dépenses', '#f43f5e']].map(([l, c]) => (
            <span key={l} style={{ fontSize: 11, color: c, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, background: c, borderRadius: 2, display: 'inline-block' }} />{l}
            </span>
          ))}
        </div>
        <div style={{ position: 'relative', height: 220 }}><canvas ref={barRef} /></div>
      </div>

      {catData.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Répartition des dépenses ce mois</div>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'center' }}>
            <div style={{ position: 'relative', height: 180 }}><canvas ref={donutRef} /></div>
            <div>
              {catData.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < catData.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text)' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: c.fill, display: 'inline-block' }} />{c.name}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{FMT(c.value)} ({Math.round(c.value / totalCats * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
