import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}
