interface OnboardingSlideProps {
  icon: string
  title: string
  description: string
  gradient?: boolean
}

export function OnboardingSlide({ icon, title, description, gradient = false }: OnboardingSlideProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8 gap-6 h-full"
      style={{
        background: gradient
          ? 'linear-gradient(160deg, #E8683A 0%, #c44d1f 100%)'
          : '#FFFFFF',
      }}
    >
      <div style={{ fontSize: 72, lineHeight: 1 }}>{icon}</div>
      <div className="flex flex-col gap-3">
        <h2
          className="font-black leading-tight"
          style={{
            fontSize: 28,
            letterSpacing: '-0.5px',
            color: gradient ? '#FFFFFF' : '#111111',
          }}
        >
          {title}
        </h2>
        <p
          className="text-base leading-relaxed font-medium"
          style={{ color: gradient ? 'rgba(255,255,255,0.85)' : '#555555' }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
