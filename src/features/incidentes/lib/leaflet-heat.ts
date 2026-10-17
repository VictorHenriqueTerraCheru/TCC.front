// A ordem importa: o global precisa existir antes de o plugin ser avaliado.
import './leaflet-global'
import 'leaflet.heat'

export { default as L } from 'leaflet'
