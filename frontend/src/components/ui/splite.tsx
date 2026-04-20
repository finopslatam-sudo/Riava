"use client"

import { Suspense, lazy } from "react"
import type { Application } from "@splinetool/runtime"

const Spline = lazy(() => import("@splinetool/react-spline"))

interface SplineSceneProps {
  scene: string
  className?: string
  onLoad?: (app: Application) => void
}

export function SplineScene({ scene, className, onLoad }: SplineSceneProps) {
  return (
    <Suspense fallback={null}>
      <Spline scene={scene} className={className} onLoad={onLoad} />
    </Suspense>
  )
}
