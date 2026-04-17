"use client"

export function TronGridBackground() {
  return (
    <div className="tron-scene" aria-hidden="true">
      <div className="tron-sky-glow" />
      <div className="tron-perspective-wrap">
        <div className="tron-grid-floor" />
      </div>
      <div className="tron-horizon-line" />
      <div className="tron-scanlines" />
      <div className="tron-vignette" />
    </div>
  )
}
