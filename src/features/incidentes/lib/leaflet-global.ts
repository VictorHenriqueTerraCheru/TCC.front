import L from 'leaflet'

// leaflet.heat é um script antigo que procura `L` no escopo global.
declare global {
  interface Window {
    L: typeof L
  }
}
window.L = L
