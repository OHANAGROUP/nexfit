/**
 * lib/supabase/periodization.ts
 * Periodization Engine for Mesocycles and Training Phases.
 */

import { useState, useEffect } from 'react'

export type TrainingGoal = 'strength' | 'hypertrophy' | 'performance' | 'health' | 'deload'

export interface Mesocycle {
    id: string
    athleteId: string
    name: string
    goal: TrainingGoal
    startDate: string
    endDate: string
    isActive: boolean
    description?: string
}

export interface TrainingPhase {
    id: string
    mesocycleId: string
    weekNumber: number
    name: string
    intensityTarget: string // e.g. "70-80% 1RM" or "RPE 7-8"
    volumeTarget: string    // e.g. "12-15 sets per muscle"
    description?: string
}

export interface SetPerformance {
    id: string
    routineId: string
    athleteId: string
    date: string
    exerciseName: string
    sets: number
    reps: number
    weightKg: number
    rpe?: number // 1-10 Effort
    muscleGroup: string
}

// ─── Supabase Integration ────────────────────────────────────
import { createClient } from '@/lib/supabase/client'

export function usePeriodization(athleteId?: string) {
    const [mesocycles, setMesocycles] = useState<Mesocycle[]>([])
    const [phases, setPhases] = useState<TrainingPhase[]>([])
    const [performance, setPerformance] = useState<SetPerformance[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPeriodization = async () => {
        try {
            const supabase = createClient()

            // 1. Fetch Mesocycles
            let mesoQuery = (supabase as any).from('mesocycles')
                .select('*')
                .order('start_date', { ascending: false })

            if (athleteId) mesoQuery = mesoQuery.eq('athlete_id', athleteId)
            const { data: mesoData } = await mesoQuery

            if (mesoData) {
                const mappedMeso = mesoData.map((m: any) => ({
                    id: m.id,
                    athleteId: m.athlete_id,
                    name: m.name,
                    goal: m.goal,
                    startDate: m.start_date,
                    endDate: m.end_date,
                    isActive: m.is_active,
                    description: m.description
                }))
                setMesocycles(mappedMeso)

                // 2. Fetch Phases for Active Meso (if available)
                const active = mappedMeso.find((m: Mesocycle) => m.isActive)
                if (active) {
                    const { data: phasesData } = await (supabase as any)
                        .from('training_phases')
                        .select('*')
                        .eq('mesocycle_id', active.id)
                        .order('week_number', { ascending: true })

                    if (phasesData) {
                        setPhases(phasesData.map((p: any) => ({
                            id: p.id,
                            mesocycleId: p.mesocycle_id,
                            weekNumber: p.week_number,
                            name: p.name,
                            intensityTarget: p.intensity_target,
                            volumeTarget: p.volume_target,
                            description: p.description
                        })))
                    }
                }
            }

            // 3. Fetch Performance
            let perfQuery = (supabase as any).from('set_performance')
                .select('*')
                .order('date', { ascending: false })

            if (athleteId) perfQuery = perfQuery.eq('athlete_id', athleteId)
            const { data: perfData } = await perfQuery

            if (perfData) {
                setPerformance(perfData.map((p: any) => ({
                    id: p.id,
                    routineId: p.routine_id,
                    athleteId: p.athlete_id,
                    date: p.date,
                    exerciseName: p.exercise_name,
                    sets: p.sets,
                    reps: p.reps,
                    weightKg: p.weight_kg,
                    rpe: p.rpe,
                    muscleGroup: p.muscle_group
                })))
            }

        } catch (err) {
            console.error('Periodization sync error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPeriodization()
    }, [athleteId])

    const savePerformance = async (perf: Omit<SetPerformance, 'id'>) => {
        try {
            const supabase = createClient()
            // Fetch athlete's tenant_id for isolation
            const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', perf.athleteId).single()

            await (supabase as any).from('set_performance').insert({
                athlete_id: perf.athleteId,
                routine_id: perf.routineId,
                tenant_id: profile?.tenant_id,
                date: perf.date,
                exercise_name: perf.exerciseName,
                sets: perf.sets,
                reps: perf.reps,
                weight_kg: perf.weightKg,
                rpe: perf.rpe,
                muscle_group: perf.muscleGroup
            })
            await fetchPeriodization()
        } catch (err) {
            console.error('Save performance error:', err)
        }
    }

    const getVolumeByMuscle = () => {
        const stats: Record<string, number> = {}
        performance.forEach((p: SetPerformance) => {
            const tonnage = p.sets * p.reps * p.weightKg
            stats[p.muscleGroup] = (stats[p.muscleGroup] || 0) + tonnage
        })
        return Object.entries(stats).map(([name, value]) => ({ name, value }))
    }

    return {
        mesocycles,
        phases,
        performance,
        loading,
        getVolumeByMuscle,
        savePerformance,
        activeMesocycle: mesocycles.find((m: Mesocycle) => m.isActive)
    }
}
