/** Center-crop image to 4:3 aspect ratio (matches news cards). */
export function cropImageDataUrlCenter43(dataUrl, mimeType = 'image/jpeg', quality = 0.9) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const targetRatio = 4 / 3
      let cw
      let ch
      let sx
      let sy
      if (w / h > targetRatio) {
        ch = h
        cw = h * targetRatio
        sx = (w - cw) / 2
        sy = 0
      } else {
        cw = w
        ch = w / targetRatio
        sx = 0
        sy = (h - ch) / 2
      }
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(cw)
      canvas.height = Math.round(ch)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }
      ctx.drawImage(img, sx, sy, cw, ch, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL(mimeType, quality))
    }
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = dataUrl
  })
}
