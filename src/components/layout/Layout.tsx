import { Outlet } from 'react-router-dom'
import AnnouncementBanner from './AnnouncementBanner'
import Header from './Header'
import Footer from './Footer'
import WhatsAppButton from '@/components/common/WhatsAppButton'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
