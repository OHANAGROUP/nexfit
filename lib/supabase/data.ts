/**
 * NEXFIT Mock Database Utility
 * Provides fallback data and a safe client interface for Resilient Mode.
 */

export const MOCK_ATHLETES = [
    { id: '1', full_name: 'PABLO PALOMINOS', role: 'member', tenant_id: 't1' },
    { id: '2', full_name: 'MARIA GARCIA', role: 'member', tenant_id: 't1' },
    { id: '3', full_name: 'JUAN PEREZ', role: 'member', tenant_id: 't1' },
    { id: '4', full_name: 'ANA SOTO', role: 'member', tenant_id: 't1' },
]

export const MOCK_ROUTINES = [
    {
        id: 'r1',
        user_id: '1',
        exercise_id: 'e1',
        sets: 4,
        reps: 12,
        weight_kg: 80,
        exercises: { name: 'Sentadilla Profunda', muscle_group: 'Piernas' }
    },
    {
        id: 'r2',
        user_id: '1',
        exercise_id: 'e2',
        sets: 3,
        reps: 10,
        weight_kg: 60,
        exercises: { name: 'Press Militar', muscle_group: 'Hombros' }
    }
]

export const MOCK_MEALS = [
    { id: 'm1', user_id: '1', time_of_day: 'Desayuno', name: 'Omelette de Claras con Espinaca', kcal: 350, macros: '30P / 10C / 12G' },
    { id: 'm2', user_id: '1', time_of_day: 'Almuerzo', name: 'Pollo Grillé con Arroz Integral', kcal: 550, macros: '45P / 60C / 8G' },
    { id: 'm3', user_id: '1', time_of_day: 'Merienda', name: 'Batido de Proteína y Avena', kcal: 400, macros: '35P / 40C / 5G' },
]

export const MOCK_MARKET = [
    { id: 'mi1', user_id: '1', item_name: 'Pechuga de Pollo (2kg)', category: 'Proteína', is_checked: false },
    { id: 'mi2', user_id: '1', item_name: 'Huevos de campo (30u)', category: 'Proteína', is_checked: true },
    { id: 'mi3', user_id: '1', item_name: 'Arroz Basmati', category: 'Carbo', is_checked: false },
    { id: 'mi4', user_id: '1', item_name: 'Espinaca Orgánica', category: 'Verdura', is_checked: false },
]

export const MOCK_BIOMETRICS = [
    { id: 'b1', user_id: '1', metric_type: 'weight', value: 82.5, logged_date: '2026-02-16' },
    { id: 'b2', user_id: '1', metric_type: 'weight', value: 82.3, logged_date: '2026-02-17' },
    { id: 'b3', user_id: '1', metric_type: 'weight', value: 82.1, logged_date: '2026-02-18' },
    { id: 'b4', user_id: '1', metric_type: 'weight', value: 81.9, logged_date: '2026-02-19' },
    { id: 'b5', user_id: '1', metric_type: 'weight', value: 82.0, logged_date: '2026-02-20' },
    { id: 'b6', user_id: '1', metric_type: 'weight', value: 81.8, logged_date: '2026-02-21' },
    { id: 'b7', user_id: '1', metric_type: 'weight', value: 81.7, logged_date: '2026-02-22' },
]

export const MOCK_TEMPLATES = [
    {
        id: 'tpl1', trainer_id: 'trainer1', tenant_id: 't1',
        name: 'PROTOCOLO HIPERTROFIA A', description: 'Tren superior enfocado en volumen',
        target_level: 'intermediate', goal_type: 'hypertrophy', days_per_week: 4,
        exercises: [
            { exercise_id: 'e1', name: 'Press Banca', sets: 4, reps: 10, weight_kg: 80 },
            { exercise_id: 'e2', name: 'Press Militar', sets: 3, reps: 12, weight_kg: 50 },
            { exercise_id: 'e3', name: 'Remo con Barra', sets: 4, reps: 10, weight_kg: 70 },
        ]
    },
    {
        id: 'tpl2', trainer_id: 'trainer1', tenant_id: 't1',
        name: 'PROTOCOLO FUERZA BASE', description: 'Movimientos compuestos pesados',
        target_level: 'advanced', goal_type: 'performance', days_per_week: 3,
        exercises: [
            { exercise_id: 'e4', name: 'Sentadilla Profunda', sets: 5, reps: 5, weight_kg: 120 },
            { exercise_id: 'e5', name: 'Peso Muerto', sets: 4, reps: 4, weight_kg: 150 },
        ]
    },
    {
        id: 'tpl3', trainer_id: 'trainer1', tenant_id: 't1',
        name: 'ACTIVACIÓN PRINCIPIANTE', description: 'Introducción a movimientos básicos',
        target_level: 'beginner', goal_type: 'health', days_per_week: 3,
        exercises: [
            { exercise_id: 'e6', name: 'Sentadilla Goblet', sets: 3, reps: 15, weight_kg: 16 },
            { exercise_id: 'e7', name: 'Flexiones', sets: 3, reps: 10, weight_kg: 0 },
        ]
    }
]

export const MOCK_SCHEDULE = [
    { id: 's1', user_id: '1', template_id: 'tpl1', scheduled_for: '2026-02-23', day_name: 'Lunes', status: 'planned' },
    { id: 's2', user_id: '1', template_id: 'tpl1', scheduled_for: '2026-02-24', day_name: 'Martes', status: 'done' },
    { id: 's3', user_id: '1', template_id: 'tpl1', scheduled_for: '2026-02-25', day_name: 'Miércoles', status: 'skipped' },
    { id: 's4', user_id: '1', template_id: 'tpl1', scheduled_for: '2026-02-26', day_name: 'Jueves', status: 'planned' },
    { id: 's5', user_id: '1', template_id: 'tpl1', scheduled_for: '2026-02-27', day_name: 'Viernes', status: 'planned' },
]

export const MOCK_NOTIFICATIONS = [
    { id: 'n1', user_id: '1', type: 'missed_session', title: '⚠️ Sesión Omitida', message: 'Pablo Palominos omitió la sesión del Miércoles 25.', severity: 'warning', is_read: false, created_at: '2026-02-25T20:00:00Z' },
    { id: 'n2', user_id: '1', type: 'streak_achieved', title: '🔥 Racha de 7 Días', message: 'María García completó 7 sesiones consecutivas. ¡Felicitar!', severity: 'success', is_read: false, created_at: '2026-02-23T09:00:00Z' },
    { id: 'n3', user_id: '1', type: 'weekly_report', title: '📊 Resumen Semanal', message: 'Adherencia media del equipo esta semana: 88%. Bajó un 6% vs semana anterior.', severity: 'info', is_read: false, created_at: '2026-02-22T18:00:00Z' },
    { id: 'n4', user_id: '1', type: 'goal_reached', title: '🏆 Meta Alcanzada', message: 'Juan Pérez alcanzó su meta de pérdida de 5kg. Tiempo: 8 semanas.', severity: 'success', is_read: true, created_at: '2026-02-21T12:00:00Z' },
    { id: 'n5', user_id: '1', type: 'missed_session', title: '⚠️ Sesión Omitida', message: 'Ana Soto lleva 2 sesiones omitidas esta semana. Considerá un ajuste.', severity: 'warning', is_read: true, created_at: '2026-02-20T20:00:00Z' },
]

export const MOCK_ANALYTICS = {
    adherence_trend: [
        { week: 'Sem 1', done: 12, planned: 15, rate: 80 },
        { week: 'Sem 2', done: 14, planned: 16, rate: 87 },
        { week: 'Sem 3', done: 15, planned: 16, rate: 93 },
        { week: 'Sem 4', done: 13, planned: 15, rate: 86 },
    ],
    athlete_leaderboard: [
        { name: 'MARÍA GARCIA', adherence_pct: 95, sessions_done: 19, streak: 7 },
        { name: 'PABLO PALOMINOS', adherence_pct: 88, sessions_done: 17, streak: 3 },
        { name: 'JUAN PÉREZ', adherence_pct: 82, sessions_done: 16, streak: 5 },
        { name: 'ANA SOTO', adherence_pct: 72, sessions_done: 14, streak: 0 },
    ],
    bmi_trend: [
        { date: '16 Feb', bmi: 27.1 },
        { date: '17 Feb', bmi: 27.0 },
        { date: '18 Feb', bmi: 26.8 },
        { date: '19 Feb', bmi: 26.7 },
        { date: '20 Feb', bmi: 26.6 },
        { date: '21 Feb', bmi: 26.5 },
        { date: '22 Feb', bmi: 26.4 },
    ],
    summary: { adherence_avg: 88, sessions_done: 66, streak_max: 7, alerts_pending: 3 }
}

export const createSafeProxy = (name: string) => {
    const mockQuery = {
        select: () => mockQuery,
        eq: () => mockQuery,
        single: () => Promise.resolve({ data: null, error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        order: () => mockQuery,
        limit: () => mockQuery,
        then: (onfulfilled: any) => onfulfilled({ data: [], error: null })
    }

    return {
        auth: {
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
            signOut: () => Promise.resolve({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
        },
        from: () => mockQuery,
        rpc: () => Promise.resolve({ data: null, error: null }),
    } as any
}
