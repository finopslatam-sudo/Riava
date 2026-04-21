"use client"

import { useScroll, useTransform, motion } from "framer-motion"
import { RefObject, useRef } from "react"

interface ZoomParallaxProps {
  images: string[]
  scrollContainer?: RefObject<HTMLDivElement | null>
}

const TILE_STYLES: React.CSSProperties[] = [
  { height: "25vh", width: "25vw" },
  { position: "absolute", top: "-30vh", left: "5vw", height: "30vh", width: "35vw" },
  { position: "absolute", top: "-10vh", left: "-25vw", height: "45vh", width: "20vw" },
  { position: "absolute", left: "27.5vw", height: "25vh", width: "25vw" },
  { position: "absolute", top: "27.5vh", left: "5vw", height: "25vh", width: "20vw" },
  { position: "absolute", top: "27.5vh", left: "-22.5vw", height: "25vh", width: "30vw" },
  { position: "absolute", top: "22.5vh", left: "25vw", height: "15vh", width: "15vw" },
]

export function ZoomParallax({ images, scrollContainer }: ZoomParallaxProps) {
  const target = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target,
    container: scrollContainer,
    offset: ["start start", "end end"],
  })

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4])
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5])
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6])
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8])
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9])
  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9]

  return (
    <div ref={target} style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {images.map((src, i) => (
          <motion.div
            key={i}
            style={{ scale: scales[i % scales.length] }}
            className="absolute top-0 flex h-full w-full items-center justify-center"
          >
            <div style={TILE_STYLES[i % TILE_STYLES.length]} className="overflow-hidden">
              <img
                src={src}
                alt={`Zoom ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
