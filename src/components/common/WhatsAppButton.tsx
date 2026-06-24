import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function WhatsAppButton() {
  const { data: settings } = useSiteSettings()
  const number = settings?.whatsapp_number ?? '919876543210'
  const message = encodeURIComponent('Hi! I saw your jewellery on Meena Rajwada and I\'m interested.')
  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[76px] right-4 lg:bottom-8 lg:right-8 z-40 flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-lg bg-[#25D366] hover:bg-[#1ebe57] transition-all duration-300"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.562 4.13 1.543 5.862L.057 23.704a.75.75 0 0 0 .921.921l5.842-1.486A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.675-.524-5.195-1.435l-.372-.221-3.87.985.999-3.782-.242-.389A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    </a>
  )
}
