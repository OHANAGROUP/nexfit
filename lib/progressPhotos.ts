/**
 * lib/progressPhotos.ts
 * Resilient progress photo store.
 * — Primary: Supabase Storage (when connected)
 * — Fallback: localStorage (always available, no backend needed)
 *
 * Auto-upgrades: when Supabase becomes available the hook will
 * prefer it transparently.
 */

export interface ProgressPhoto {
    id: string
    athleteId: string
    date: string         // ISO date string
    dataUrl: string      // base64 for localStorage; public URL for Supabase
    label?: string       // e.g. "Frente", "Lateral", "Espalda"
    weight?: number
    note?: string
}

const STORAGE_KEY = (id: string) => `nexfit_photos_${id}`

// ─── localStorage helpers ───────────────────────────────────
export function getLocalPhotos(athleteId: string): ProgressPhoto[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(STORAGE_KEY(athleteId))
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

export function saveLocalPhoto(photo: ProgressPhoto): void {
    if (typeof window === 'undefined') return
    const existing = getLocalPhotos(photo.athleteId)
    // Keep latest 30 photos per athlete to avoid localStorage overflow
    const updated = [photo, ...existing].slice(0, 30)
    localStorage.setItem(STORAGE_KEY(photo.athleteId), JSON.stringify(updated))
}

export function deleteLocalPhoto(athleteId: string, photoId: string): void {
    if (typeof window === 'undefined') return
    const existing = getLocalPhotos(athleteId)
    const updated = existing.filter(p => p.id !== photoId)
    localStorage.setItem(STORAGE_KEY(athleteId), JSON.stringify(updated))
}

// ─── File → base64 helper ────────────────────────────────────
export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

// ─── Unique ID ───────────────────────────────────────────────
export function generatePhotoId(): string {
    return `photo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ─── Supabase Storage (future, when prod is connected) ───────
export async function tryUploadToSupabase(
    file: File,
    photo: ProgressPhoto
): Promise<string | null> {
    try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const path = `progress/${photo.athleteId}/${photo.id}`

        // 1. Upload to Storage
        const { error: uploadError } = await (supabase as any).storage
            .from('progress-photos')
            .upload(path, file, { upsert: true })
        if (uploadError) return null

        // 2. Get Public URL
        const { data: urlData } = (supabase as any).storage
            .from('progress-photos')
            .getPublicUrl(path)
        const publicUrl = urlData?.publicUrl ?? null
        if (!publicUrl) return null

        // 3. Save Metadata to DB
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', photo.athleteId).single()

        const { error: dbError } = await (supabase as any)
            .from('progress_photos')
            .insert({
                athlete_id: photo.athleteId,
                tenant_id: profile?.tenant_id,
                date: photo.date,
                photo_url: publicUrl,
                label: photo.label,
                weight: photo.weight,
                note: photo.note
            })

        if (dbError) console.warn('Supabase DB metadata error:', dbError)
        return publicUrl
    } catch {
        return null
    }
}

// ─── Supabase Storage list (future) ─────────────────────────
export async function tryListFromSupabase(athleteId: string): Promise<ProgressPhoto[]> {
    try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data, error } = await (supabase as any)
            .from('progress_photos')
            .select('*')
            .eq('athlete_id', athleteId)
            .order('date', { ascending: false })

        if (error || !data) return []

        return data.map((item: any) => ({
            id: item.id,
            athleteId: item.athlete_id,
            date: item.date,
            dataUrl: item.photo_url,
            label: item.label,
            weight: item.weight,
            note: item.note
        }))
    } catch {
        return []
    }
}
