import { cn } from "@/lib/utils"

type RiavaLogoProps = {
  variant?: "full" | "mark"
  className?: string
  alt?: string
}

export function RiavaLogo({
  variant = "full",
  className,
  alt,
}: RiavaLogoProps) {
  const src = variant === "full" ? "/riava-logo.svg" : "/riava-mark.svg"
  const fallbackAlt = variant === "full" ? "RIAVA System SPA" : "RIAVA"

  return (
    <img
      src={src}
      alt={alt ?? fallbackAlt}
      className={cn("block h-auto w-auto", className)}
    />
  )
}
