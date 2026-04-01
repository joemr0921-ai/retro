export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0F0F0F] flex flex-col">
      {/* Retro grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,107,71,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,71,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-coral-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  )
}
