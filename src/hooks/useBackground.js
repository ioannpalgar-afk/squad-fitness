import { useState, useEffect } from 'react'

export const BACKGROUND_OPTIONS = [
  { id: 'topographic-neon', name: 'Topográfico', file: 'topographic-neon.png' },
  { id: 'circuit-board', name: 'Circuitos', file: 'circuit-board.png' },
  { id: 'hex-grid', name: 'Hexagonal', file: 'hex-grid.png' },
  { id: 'neural-network', name: 'Neural', file: 'neural-network.png' },
  { id: 'carbon-fiber', name: 'Carbono', file: 'carbon-fiber.png' },
  { id: 'star-field', name: 'Estrellas', file: 'star-field.png' },
  { id: 'pulse-grid', name: 'Pulso', file: 'pulse-grid.png' },
  { id: 'geometric-shards', name: 'Geométrico', file: 'geometric-shards.png' },
  { id: 'data-rain', name: 'Data Rain', file: 'data-rain.png' },
  { id: 'wire-mesh', name: 'Malla', file: 'wire-mesh.png' },
  { id: 'muscle-fiber', name: 'Fibra', file: 'muscle-fiber.png' },
  { id: 'fingerprint-circuit', name: 'Huella', file: 'fingerprint-circuit.png' },
  { id: 'topographic', name: 'Topo clásico', file: 'topographic.png' },
  { id: 'none', name: 'Sin fondo', file: null },
]

const STORAGE_KEY = 'squad-background'
const DEFAULT_BG = 'topographic-neon'

function applyBackground(bgId) {
  const option = BACKGROUND_OPTIONS.find(b => b.id === bgId)
  if (option?.file) {
    document.body.style.backgroundImage = `url('/assets/backgrounds/patterns/${option.file}')`
    document.body.style.backgroundSize = '512px'
    document.body.style.backgroundRepeat = 'repeat'
  } else {
    document.body.style.backgroundImage = 'none'
  }
}

export function useBackground() {
  const [background, setBackground] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_BG
  })

  useEffect(() => {
    applyBackground(background)
  }, [background])

  function changeBackground(bgId) {
    localStorage.setItem(STORAGE_KEY, bgId)
    setBackground(bgId)
  }

  return { background, changeBackground }
}

// Apply on initial load (before React mounts)
const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_BG
applyBackground(saved)
