'use client'

import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const FMT = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n)) + ' MAD'

interface ChartDataPoint { name: string; inc: number; exp: number }
interface CatDataPoint   { name: string; value: number; fill: string }
interface Tx { id: string; type: string; amount: number; category: string; description: string | null; date: string }

interface Props {
  chartData: ChartDataPoint[]
  catData:   CatDataPoint[]
  recentTxs: Tx[]
}

const CC: Record<string, string> = {
  Logement:'#7c3aed',Alimentation:'#f59e0b',Transport:'#3b82f6',Loisirs:'#ec4899',
  Shopping:'#a78bfa',Santé:'#10b981',Éducation:'#14b8a6',Abonnements:'#f97316',Autre:'#64748b',
}

export default function DashboardCharts({ chartData, catData, recentTxs }: Props) {
  const barRef   = useRef<HTMLCanvasElement>(null)
  const donutRef = useRef<HTMLCanvasElement>(null)
  const barInst   = useRef<Chart | null>(null)
  const donutInst = useRef<Chart | null>(null)

  useEffect(() => {
    if (!barRef.current) return
    barInst.current?.destroy()
    barInst.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: chartData.map(d => d.name),
        datasets: [
          { label: 'Revenus',   data: chartData.map(d => d.inc), backgroundColor: '#00d4aa44', borderColor: '#00d4aa', borderWidth: 1.5, borderRadius: 5 },
          { label: 'Dépenses',  data: chartData.map(d => d.exp), backgroundColor: '#f43f5e33', borderColor: '#f43f5e', borderWidth: 1.5, borderRadius: 5 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.dataset.label + ': ' + Math.round(c.parsed.y ?? 0).toLocaleString('fr-FR') + ' MAD' } } },
        scales: {
          x: { ticks: { color: '#4a6080', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#4a6080', font: { size: 11 }, callback: v => Math.round(+v).toLocaleString('fr-FR') }, grid: { color: 'rgba(255,255,255,0.04)' } },
        },
      },
    })
    return () => barInst.current?.destroy()
  }, [chartData])

  useEffect(() => {
    if (!donutRef.current || !catData.length) return
    donutInst.current?.destroy()
    donutInst.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: catData.map(d => d.name),
        datasets: [{ data: catData.map(d => d.value), backgroundColor: catData.map(d => d.fill), borderWidth: 0, hoverOffset: 6 }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } },
    })
    return () => donutInst.current?.destroy()
  }, [catData])

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Bar chart */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>6 derniers mois</div>
            <div style={{ display: 'flex', gap: 14 }}>
              {[['Revenus', '#00d4aa'], ['Dépenses', '#f43f5e']].map(([l, c]) => (
                <span key={l} style={{ fontSize: 11, color: c, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, background: c, borderRadius: 2, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', height: 200 }}><canvas ref={barRef} /></div>
        </div>

        {/* Donut */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Dépenses ce mois</div>
          {catData.length > 0 ? (
            <>
              <div style={{ position: 'relative', height: 170 }}><canvas ref={donutRef} /></div>
              <div style={{ marginTop: 8 }}>
                {catData.slice(0, 4).map(c => (
                  <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c.fill, display: 'inline-block' }} />{c.name}
                    </span>
                    <span style={{ color: 'var(--muted)' }}>{FMT(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Aucune dépense ce mois
            </div>
          )}
        </div>
      </div>

      {/* Transactions récentes */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Transactions récentes</div>
        {recentTxs.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Aucune transaction — ajoutez-en une depuis l'onglet Transactions !
          </div>
        ) : recentTxs.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: (CC[t.category] ?? '#64748b') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: CC[t.category] ?? '#64748b', flexShrink: 0 }}>
              {t.category.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description || t.category}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{t.category} · {t.date.split('-').reverse().join('/')}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: t.type === 'income' ? 'var(--acc)' : 'var(--danger)', whiteSpace: 'nowrap' }}>
              {t.type === 'income' ? '+ ' : '- '}{FMT(t.amount)}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
