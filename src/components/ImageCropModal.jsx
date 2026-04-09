/* eslint-disable react/prop-types */
import { useState } from 'react'
import { cropImageDataUrlCenter43 } from '../lib/imageCrop'

export default function ImageCropModal({ imageData, onClose, onApply }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleCrop = async () => {
    if (!imageData) return
    setError('')
    setBusy(true)
    try {
      const cropped = await cropImageDataUrlCenter43(imageData)
      onApply(cropped)
      onClose()
    } catch (e) {
      setError(e?.message || 'Crop failed.')
    } finally {
      setBusy(false)
    }
  }

  if (!imageData) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Crop image"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="font-display text-lg font-semibold text-ink">Crop image (4:3)</h2>
        <p className="mt-2 text-sm text-ink-muted">Applies a centered crop to match news card proportions.</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
          <img src={imageData} alt="Preview" className="max-h-64 w-full object-contain" />
        </div>
        {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={handleCrop}
            className="inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-amber-600 disabled:opacity-60"
          >
            {busy ? 'Working…' : 'Apply crop'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-neutral-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
