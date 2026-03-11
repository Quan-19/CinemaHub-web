import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

function MainLayout() {
  return (
    <div className="mx-auto w-full max-w-[1920px] px-3 sm:px-6 lg:px-10 2xl:px-14">
      <Navbar />

      <main className="pb-6 sm:pb-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout
