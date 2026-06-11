/* Shimmer base */
function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(90deg, #EDE8DE 25%, #F5F0E8 50%, #EDE8DE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
        borderRadius: 8,
        ...style,
      }}
    />
  )
}

/* Skeleton de ProfessionalCard horizontal */
export function ProfessionalCardSkeleton() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden flex items-stretch"
      style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
    >
      {/* Barra lateral */}
      <div className="w-1 flex-shrink-0" style={{ background: '#EDE8DE' }} />

      {/* Foto */}
      <div className="m-3 flex-shrink-0">
        <Shimmer style={{ width: 72, height: 72, borderRadius: 12 }} />
      </div>

      {/* Info */}
      <div className="flex-1 py-3 pr-2 flex flex-col justify-center gap-2">
        <Shimmer style={{ width: '60%', height: 12 }} />
        <Shimmer style={{ width: '40%', height: 10 }} />
        <Shimmer style={{ width: '70%', height: 9 }} />
      </div>

      {/* Rating */}
      <div className="py-3 pr-3 flex flex-col items-end justify-between flex-shrink-0 gap-2">
        <Shimmer style={{ width: 48, height: 18, borderRadius: 20 }} />
        <Shimmer style={{ width: 32, height: 14 }} />
      </div>
    </div>
  )
}

/* Skeleton de sección "Más recomendados" */
export function FeaturedSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <ProfessionalCardSkeleton key={i} />
      ))}
    </div>
  )
}

/* Skeleton de Review card */
export function ReviewSkeleton() {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
      <div className="flex items-center gap-3 mb-3">
        <Shimmer style={{ width: 38, height: 38, borderRadius: '50%' }} />
        <div className="flex flex-col gap-1.5 flex-1">
          <Shimmer style={{ width: '45%', height: 11 }} />
          <Shimmer style={{ width: '30%', height: 9 }} />
        </div>
      </div>
      <Shimmer style={{ width: '90%', height: 10, marginBottom: 6 }} />
      <Shimmer style={{ width: '70%', height: 10 }} />
    </div>
  )
}
