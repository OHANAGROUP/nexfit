'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    Camera, Upload, Trash2, ArrowLeft, ChevronLeft, ChevronRight,
    Scale, StickyNote, Check, X, ZoomIn, Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    getLocalPhotos, saveLocalPhoto, deleteLocalPhoto,
    fileToDataUrl, generatePhotoId, tryListFromSupabase, tryUploadToSupabase,
    type ProgressPhoto
} from '@/lib/progressPhotos'

const MOCK_ATHLETES: Record<string, string> = {
    '1': 'PABLO PALOMINOS', '2': 'MARIA GARCIA',
    '3': 'JUAN PEREZ', '4': 'ANA SOTO',
}

const LABELS = ['Frente', 'Lateral', 'Espalda', 'General']

function PhotoCard({ photo, onDelete, onClick }: {
    photo: ProgressPhoto
    onDelete: () => void
    onClick: () => void
}) {
    return (
        <div className="relative group rounded-2xl overflow-hidden border border-white/10 hover:border-nex-purple/40 transition-all cursor-pointer"
            onClick={onClick}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.dataUrl} alt={photo.label || 'Foto'} className="w-full h-44 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center justify-between">
                    <div>
                        {photo.label && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-nex-purple/80 text-white mr-1">
                                {photo.label}
                            </span>
                        )}
                        <div className="text-[9px] text-white/60 font-bold mt-0.5">
                            {new Date(photo.date).toLocaleDateString('es-CL')}
                        </div>
                    </div>
                    {photo.weight && (
                        <div className="text-xs font-black text-nex-neon">{photo.weight}kg</div>
                    )}
                </div>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                    onClick={e => { e.stopPropagation(); onClick() }}>
                    <ZoomIn className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white"
                    onClick={e => { e.stopPropagation(); onDelete() }}>
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

function LightboxModal({ photo, photos, onClose, onNavigate }: {
    photo: ProgressPhoto
    photos: ProgressPhoto[]
    onClose: () => void
    onNavigate: (dir: 1 | -1) => void
}) {
    const idx = photos.findIndex(p => p.id === photo.id)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') onNavigate(-1)
            if (e.key === 'ArrowRight') onNavigate(1)
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose, onNavigate])

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
            <button className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white" onClick={onClose}>
                <X className="w-5 h-5" />
            </button>
            {idx > 0 && (
                <button className="absolute left-4 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                    onClick={e => { e.stopPropagation(); onNavigate(-1) }}>
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}
            {idx < photos.length - 1 && (
                <button className="absolute right-4 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                    onClick={e => { e.stopPropagation(); onNavigate(1) }}>
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.dataUrl} alt={photo.label || 'Foto'} className="max-h-[85vh] max-w-full rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-4 text-sm">
                    {photo.label && <span className="text-nex-purple font-black">{photo.label}</span>}
                    <span className="text-nex-muted">{new Date(photo.date).toLocaleDateString('es-CL')}</span>
                    {photo.weight && <span className="text-nex-neon font-black">{photo.weight}kg</span>}
                    {photo.note && <span className="text-white/60 italic">"{photo.note}"</span>}
                    <span className="text-nex-muted text-xs">{idx + 1} / {photos.length}</span>
                </div>
            </div>
        </div>
    )
}

function UploadModal({ onSave, onClose }: {
    onSave: (p: Omit<ProgressPhoto, 'id' | 'athleteId'>) => void
    onClose: () => void
}) {
    const [preview, setPreview] = useState<string | null>(null)
    const [label, setLabel] = useState('Frente')
    const [weight, setWeight] = useState('')
    const [note, setNote] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFile = async (f: File) => {
        setFile(f)
        const url = await fileToDataUrl(f)
        setPreview(url)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f?.type.startsWith('image/')) handleFile(f)
    }

    const handleSave = () => {
        if (!preview || !file) return
        onSave({
            date: new Date().toISOString().split('T')[0],
            dataUrl: preview,
            label,
            weight: weight ? parseFloat(weight) : undefined,
            note: note || undefined,
            file // Pass the actual file for Supabase
        } as any)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md rounded-2xl p-6 space-y-5" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h3 className="font-black italic tracking-tighter text-lg">NUEVA FOTO</h3>
                    <button onClick={onClose} className="text-nex-muted hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                {/* Drop zone */}
                <div
                    className={cn("border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all",
                        preview ? "border-nex-neon/40 bg-nex-neon/5 p-2" : "border-white/10 hover:border-nex-purple/40 hover:bg-nex-purple/5"
                    )}
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => !preview && fileRef.current?.click()}
                >
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="preview" className="w-full rounded-lg object-contain max-h-48" />
                    ) : (
                        <>
                            <Camera className="w-8 h-8 text-nex-muted mb-2" />
                            <p className="text-sm text-nex-muted font-bold">Arrastrá una foto o hacé click</p>
                            <p className="text-[10px] text-nex-muted mt-1">JPG, PNG, WEBP</p>
                        </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                </div>

                {/* Fields */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-nex-muted mb-1 block">Tipo</label>
                        <div className="grid grid-cols-2 gap-1">
                            {LABELS.map(l => (
                                <button key={l} onClick={() => setLabel(l)}
                                    className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all",
                                        label === l ? "bg-nex-purple text-white" : "bg-white/5 text-nex-muted hover:bg-white/10")}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-nex-muted mb-1 block">Peso (kg)</label>
                        <input value={weight} onChange={e => setWeight(e.target.value)}
                            type="number" step="0.1" placeholder="82.5"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-nex-purple/50" />
                    </div>
                </div>
                <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-nex-muted mb-1 block">Nota</label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                        placeholder="Observaciones del entrenador..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-nex-purple/50" />
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-nex-muted hover:text-white transition-all text-sm font-bold">Cancelar</button>
                    <button onClick={handleSave} disabled={!preview}
                        className="flex-1 py-2.5 rounded-xl bg-nex-purple text-white font-black text-sm hover:bg-nex-purple/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Guardar Foto
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AthleteProgressPage() {
    const params = useParams()
    const router = useRouter()
    const athleteId = params?.athleteId as string
    const athleteName = MOCK_ATHLETES[athleteId] || `Atleta ${athleteId}`

    const [photos, setPhotos] = useState<ProgressPhoto[]>([])
    const [showUpload, setShowUpload] = useState(false)
    const [lightbox, setLightbox] = useState<ProgressPhoto | null>(null)
    const [filterLabel, setFilterLabel] = useState<string>('Todos')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Load local photos first
        const local = getLocalPhotos(athleteId)
        setPhotos(local)
        // Try Supabase in background
        tryListFromSupabase(athleteId).then(remote => {
            if (remote.length > 0) setPhotos(remote)
        })
    }, [athleteId])

    const handleSave = useCallback(async (data: any) => {
        const { file, ...photoData } = data
        const photo: ProgressPhoto = {
            ...photoData,
            id: generatePhotoId(),
            athleteId,
        }

        // 1. Save locally for instant UI feedback & resilience
        saveLocalPhoto(photo)
        setPhotos(prev => [photo, ...prev])
        setShowUpload(false)

        // 2. Try Supabase upload in background
        if (file) {
            const publicUrl = await tryUploadToSupabase(file, photo)
            if (publicUrl) {
                // Update local entry with real URL if needed, though dataUrl (base64) works fine locally
                console.log('Sync to Supabase successful:', publicUrl)
            }
        }
    }, [athleteId])

    const handleDelete = useCallback((id: string) => {
        deleteLocalPhoto(athleteId, id)
        setPhotos(prev => prev.filter(p => p.id !== id))
        if (lightbox?.id === id) setLightbox(null)
    }, [athleteId, lightbox])

    const handleNavigate = useCallback((dir: 1 | -1) => {
        if (!lightbox) return
        const idx = filtered.findIndex(p => p.id === lightbox.id)
        const next = filtered[idx + dir]
        if (next) setLightbox(next)
    }, [lightbox]) // eslint-disable-line react-hooks/exhaustive-deps

    const labels = ['Todos', ...LABELS]
    const filtered = filterLabel === 'Todos' ? photos : photos.filter(p => p.label === filterLabel)

    // Stats
    const weightEntries = photos.filter(p => p.weight).map(p => p.weight!)
    const latestWeight = weightEntries[0]
    const oldestWeight = weightEntries[weightEntries.length - 1]
    const weightDelta = latestWeight && oldestWeight ? latestWeight - oldestWeight : null

    if (!mounted) return null

    return (
        <>
            {/* Upload modal */}
            {showUpload && <UploadModal onSave={handleSave} onClose={() => setShowUpload(false)} />}

            {/* Lightbox */}
            {lightbox && (
                <LightboxModal photo={lightbox} photos={filtered}
                    onClose={() => setLightbox(null)}
                    onNavigate={handleNavigate} />
            )}

            <div className="space-y-8">
                {/* Header */}
                <header className="flex items-start justify-between">
                    <div>
                        <button onClick={() => router.back()}
                            className="flex items-center gap-1.5 text-nex-muted hover:text-white text-xs font-bold mb-3 transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Volver
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">Progreso Visual</span>
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter font-rajdhani">
                            {athleteName.split(' ')[0]}<span className="text-nex-neon">&apos;S</span> PROGRESS
                        </h1>
                        <p className="text-nex-muted text-sm mt-1">Timeline fotográfico — {photos.length} foto{photos.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nex-purple text-white font-black text-sm hover:bg-nex-purple/80 transition-all">
                        <Camera className="w-4 h-4" />
                        Nueva Foto
                    </button>
                </header>

                {/* Stats strip */}
                {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="glass-card p-4">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-nex-muted">Total Fotos</div>
                            <div className="text-2xl font-black italic text-nex-white mt-1">{photos.length}</div>
                        </div>
                        {latestWeight && (
                            <div className="glass-card p-4">
                                <div className="text-[8px] font-bold uppercase tracking-widest text-nex-muted">Peso Actual</div>
                                <div className="text-2xl font-black italic text-nex-neon mt-1">{latestWeight}kg</div>
                            </div>
                        )}
                        {weightDelta !== null && (
                            <div className="glass-card p-4">
                                <div className="text-[8px] font-bold uppercase tracking-widest text-nex-muted">Δ Peso Total</div>
                                <div className={`text-2xl font-black italic mt-1 ${weightDelta < 0 ? 'text-nex-neon' : 'text-orange-400'}`}>
                                    {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)}kg
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Filters */}
                {photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {labels.map(l => (
                            <button key={l} onClick={() => setFilterLabel(l)}
                                className={cn("px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide transition-all",
                                    filterLabel === l
                                        ? "bg-nex-purple text-white"
                                        : "bg-white/5 text-nex-muted hover:bg-white/10 hover:text-white"
                                )}>
                                {l} {l === 'Todos' ? `(${photos.length})` : `(${photos.filter(p => p.label === l).length})`}
                            </button>
                        ))}
                    </div>
                )}

                {/* Photo grid */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map(photo => (
                            <PhotoCard key={photo.id} photo={photo}
                                onDelete={() => handleDelete(photo.id)}
                                onClick={() => setLightbox(photo)} />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-16 flex flex-col items-center justify-center text-center rounded-2xl border-dashed">
                        <Camera className="w-12 h-12 text-nex-muted mb-4 opacity-30" />
                        <div className="font-black italic text-xl text-nex-white/30">SIN FOTOS</div>
                        <p className="text-nex-muted text-sm mt-2 mb-6">
                            {filterLabel === 'Todos'
                                ? 'Subí la primera foto de progreso de este atleta'
                                : `No hay fotos de tipo "${filterLabel}"`}
                        </p>
                        {filterLabel === 'Todos' && (
                            <button onClick={() => setShowUpload(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-nex-purple text-white font-black text-sm hover:bg-nex-purple/80 transition-all">
                                <Upload className="w-4 h-4" />
                                Subir Primera Foto
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
