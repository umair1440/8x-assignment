import { Outlet } from 'react-router-dom'
import Header from './Header'
import SubNav from './SubNav'
import Footer from './Footer'

export default function Layout() {
    return (
        <>
            < Header />
            <SubNav />
            <main className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <Outlet />
            </main>
            <Footer />
        </>
    )
}
