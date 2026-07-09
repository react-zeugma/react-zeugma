'use client'

import { useEffect, useRef } from 'react'
import { PanelChrome } from './DashboardLayout'
import { MapPin } from 'lucide-react'
import type L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export function MapPanel() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return

    let resizeObserver: ResizeObserver | null = null

    import('leaflet').then((leafletInstance) => {
      const LObj = leafletInstance.default

      // Fix default marker icon issues in Leaflet with webpack/next
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete LObj.Icon.Default.prototype._getIconUrl
      LObj.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (mapInstanceRef.current) {
        return
      }

      // Initialize map
      const map = LObj.map(mapContainerRef.current!).setView([51.505, -0.09], 13)
      mapInstanceRef.current = map

      // Add OpenStreetMap tile layer
      LObj.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add marker with a popup
      const marker = LObj.marker([51.505, -0.09]).addTo(map)
      marker.bindPopup('<b>Grafana Main Server</b><br>London Datacenter (LND-1).').openPopup()

      // Add a second marker with a hover tooltip
      const marker2 = LObj.marker([51.515, -0.1]).addTo(map)
      marker2.bindTooltip('Backup Node (LND-2)', { permanent: false, direction: 'top' })

      // Auto-invalidate map size when its container container size changes
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize()
      })
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current)
      }
    })

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <PanelChrome title="System Node Map" icon={<MapPin className="w-3.5 h-3.5 text-[#5794F2]" />}>
      <div className="relative h-full w-full bg-[#141619]">
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
      </div>
    </PanelChrome>
  )
}
