import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { polyfill as enableMobileDragDrop } from 'mobile-drag-drop'
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour'
import 'mobile-drag-drop/default.css'
import './index.css'
import App from './App'

// Enable HTML5 drag-and-drop on touch devices that don't natively support it
// (e.g. Android Chrome). Pragmatic-drag-and-drop relies on native HTML5 events,
// so without this the cards can't be moved by touch and the long-press just
// triggers text selection. `holdToDrag` keeps short taps responsive (e.g. for
// scrolling and tapping buttons) by requiring a brief hold before a drag starts.
enableMobileDragDrop({
  holdToDrag: 300,
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
