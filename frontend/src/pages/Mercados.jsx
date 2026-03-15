import Header from '../components/Header'
import StoreGrid from '../components/StoreGrid'
import MobileNavBar from '../components/MobileNavBar'

export default function Mercados() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-320 mx-auto px-6 py-8">
        <h1 className="font-['Sora'] text-[1.8rem] font-extrabold text-text-primary mb-6">🛒 Mercados</h1>
        <StoreGrid tipo="mercado" />
      </main>
      <MobileNavBar />
    </div>
  )
}
