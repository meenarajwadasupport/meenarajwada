const VIDEO_URL = [
  'https://www.youtube.com/embed/5K7fFBbkS10',
  '?autoplay=1&mute=1&loop=1&playlist=5K7fFBbkS10',
  '&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1',
].join('')

export default function VideoSection() {
  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ height: '56vw', maxHeight: '640px', minHeight: '300px' }}>
      {/* YouTube embed — autoplay, muted, looped, no controls */}
      <iframe
        className="absolute inset-0 w-full h-full pointer-events-none"
        src={VIDEO_URL}
        title="Meena Rajwada Handcrafted Jewellery"
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{ border: 'none' }}
      />

      {/* Subtle dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Overlay text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] uppercase text-white/70 mb-3">
          The Art of Making
        </p>
        <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg max-w-2xl">
          Every Piece Tells a Story
        </h2>
        <p className="mt-4 text-white/80 text-sm sm:text-base max-w-md leading-relaxed">
          Watch how our artisans pour their heart into each handcrafted jewel — from raw material to timeless heirloom.
        </p>
      </div>
    </section>
  )
}
