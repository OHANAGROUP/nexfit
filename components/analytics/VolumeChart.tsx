'use client'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts'
import { usePeriodization } from '@/lib/supabase/periodization'
import { Loader2, Activity } from 'lucide-react'

const COLORS = ['#7b2fff', '#00f5a0', '#a855f7', '#f59e0b', '#ef4444', '#3b82f6']

const TOOLTIP_STYLE = {
    backgroundColor: '#0a0a0f',
    border: '1px solid rgba(123,47,255,0.3)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 'bold'
}

export function VolumeChart({ athleteId }: { athleteId?: string }) {
    const { getVolumeByMuscle, loading } = usePeriodization(athleteId)

    if (loading) return (
        <div className="flex items-center justify-center h-48 bg-white/5 rounded-2xl">
            <Loader2 className="w-6 h-6 text-nex-purple animate-spin" />
        </div>
    )

    const data = getVolumeByMuscle().sort((a, b) => b.value - a.value)

    if (data.length === 0) return (
        <div className="flex flex-col items-center justify-center h-48 bg-white/5 rounded-2xl border border-dashed border-white/10 opacity-40">
            <Activity className="w-5 h-5 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sin datos de volumen</span>
        </div>
    )

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: -20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#888"
                        fontSize={10}
                        fontWeight="bold"
                        width={80}
                    />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value: any) => [`${value.toLocaleString()} kg`, 'Volumen Total']}
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
