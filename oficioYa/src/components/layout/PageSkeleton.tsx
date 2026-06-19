export function PageSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 p-5 pt-14"
      style={{ minHeight: '100dvh', background: '#F5F0E8' }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl"
          style={{
            height: i === 0 ? 180 : 80,
            background: 'linear-gradient(90deg,#EDE8DE 25%,#F5F0E8 50%,#EDE8DE 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.4s ease-in-out ${i * 0.15}s infinite`,
            border: '1.5px solid #E8E0D4',
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
