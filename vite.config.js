import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org",
  "connect-src 'self' https://overpass-api.de https://lz4.overpass-api.de https://overpass.kumi.systems https://z.overpass-api.de https://nominatim.openstreetmap.org",
].join('; ')

export default defineConfig({
  plugins: [react()],
  preview: {
    headers: { 'Content-Security-Policy': PROD_CSP },
  },
})
