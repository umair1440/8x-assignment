import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ProductCard from '../components/product/ProductCard'
import { toStorefrontProduct } from '../features/products/productCatalog'

import heroImage1 from '../assets/images/hero-image-2.png'
import heroImage2 from '../assets/images/hero-image-1.png'

const slides = [
    {
        eyebrow: 'Today Best Deal',
        title: ['NEW ARRIVALS', 'WINTER SALE'],
        description: 'Premium sound, deep bass, and 30% off your perfect vibe starts here.',
        accent: '30%',
        image: heroImage1,
    },
    {
        eyebrow: 'Fresh Drop',
        title: ['SOUND THAT', 'MOVES YOU'],
        description: 'Meet your new everyday audio essential with 25% off, designed for life on the move.',
        accent: '25%',
        image: heroImage2,
    },
]

const categories = [
    { name: 'Sneakers', icon: '👟', tint: 'from-[#d5f0ff] to-[#dfefff]' },
    { name: 'T-Shirts', icon: '👕', tint: 'from-[#f9d8d8] to-[#fde8d8]' },
    { name: 'Accessories', icon: '⌚', tint: 'from-[#f9f3d0] to-[#f4efd9]' },
    { name: 'Audio', icon: '🎧', tint: 'from-[#d7ecff] to-[#e1f0ff]' },
    { name: 'Hoodies', icon: '🧥', tint: 'from-[#fce3f3] to-[#f8dff6]' },
]

const forYou = [
    { name: 'JBL Charge 5', price: '$180.00', badge: 'Hot', tint: 'from-[#0f172a] via-[#1d4ed8] to-[#38bdf8]' },
    { name: 'Black Headset', price: '$220.00', badge: 'New', tint: 'from-[#111827] via-[#374151] to-[#d1d5db]' },
    { name: 'Gaming Speaker', price: '$135.00', badge: 'Top', tint: 'from-[#172554] via-[#1d4ed8] to-[#60a5fa]' },
    { name: 'Retro Audio', price: '$169.00', badge: 'Sale', tint: 'from-[#0f766e] via-[#14b8a6] to-[#99f6e4]' },
    { name: 'Pro Watch', price: '$280.00', badge: 'Best', tint: 'from-[#111827] via-[#4b5563] to-[#d1d5db]' },
]

const trendingFilters = ['All', 'Home', 'Audio', 'Accessories', 'Gaming', 'Fashion']

const trendingProducts = [
    { name: 'Audio Max', price: '$120', accent: 'from-[#f6d365] to-[#fda085]' },
    { name: 'Urban Watch', price: '$145', accent: 'from-[#84fab0] to-[#8fd3f4]' },
    { name: 'Audio Pro', price: '$121', accent: 'from-[#f093fb] to-[#f5576c]' },
    { name: 'Travel Speaker', price: '$185', accent: 'from-[#a1c4fd] to-[#c2e9fb]' },
    { name: 'Studio Boom', price: '$194', accent: 'from-[#f6d365] to-[#fda085]' },
    { name: 'Adventure Gear', price: '$128', accent: 'from-[#84fab0] to-[#8fd3f4]' },
]



const popularProducts = [
    { name: 'JBL Mini', price: '$124', accent: 'from-[#1e3a8a] to-[#60a5fa]' },
    { name: 'Air Buds', price: '$98', accent: 'from-[#111827] to-[#9ca3af]' },
    { name: 'Desk Lamp', price: '$60', accent: 'from-[#f59e0b] to-[#fef3c7]' },
    { name: 'Hot Speaker', price: '$190', accent: 'from-[#fca5a5] to-[#ef4444]' },
    { name: 'Game Console', price: '$300', accent: 'from-[#4ade80] to-[#15803d]' },
    { name: 'Studio Cables', price: '$70', accent: 'from-[#c084fc] to-[#a78bfa]' },
]

const faqItems = [
    { question: 'How long does shipping take?', answer: 'Most orders arrive within 3 to 7 business days depending on your shipping destination.' },
    { question: 'What is your return policy?', answer: 'Unused items can be returned within 30 days of delivery. Demo orders do not create real shipments.' },
    { question: 'Can I track my order?', answer: 'Your demo order status and details are available from Your Account under Your Orders.' },
    { question: 'Do you offer international delivery?', answer: 'This storefront is currently a local demo, so international delivery is not configured.' },
]

function SectionTitle({ title, action = 'See All' }) {
    return (
        <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-[1.9rem] font-bold tracking-[-0.06em] text-[#1d2f2a]">{title}</h2>
            {action && <Link to="/search" className="text-sm font-semibold uppercase tracking-[0.08em] text-[#1d7d4d] hover:text-[#115d3b]">{action}</Link>}
        </div>
    )
}

export default function Home() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [openFaqIndex, setOpenFaqIndex] = useState(0)
    const [searchParams] = useSearchParams()
    const marketplaceProducts = useSelector((state) => state.adminData.products.filter((product) => product.source === 'admin').map(toStorefrontProduct))
    const activeCategory = searchParams.get('category') ?? 'All'

    useEffect(() => {
        const intervalId = setInterval(() => {
            setActiveIndex((current) => (current + 1) % slides.length)
        }, 4000)

        return () => clearInterval(intervalId)
    }, [])

    const activeSlide = slides[activeIndex]

    return (
        <div className="space-y-8 pb-10">
            <section className="relative flex min-h-[600px] flex-col justify-between overflow-hidden rounded-[28px] border border-[#c4dfc7] bg-[linear-gradient(115deg,#e8f4e8_0%,#d7ecd6_48%,#c6e4c4_100%)] px-6 py-7 shadow-[0_18px_38px_rgba(39,95,56,0.12)] sm:px-10 sm:py-8 lg:min-h-[570px] lg:px-14">
                <div className="relative z-10 grid flex-1 items-center gap-2 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
                    <div className="max-w-[540px] py-3 text-[#173c2b]">
                        <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-[#36734a]">
                            <span className="h-px w-8 bg-[#4c9661]" />
                            {activeSlide.eyebrow}
                        </div>

                        <h1 className="text-[3.15rem] font-black uppercase leading-[0.98] text-[#173c2b] sm:text-[4rem] lg:text-[4.5rem]">
                            {activeSlide.title.map((line) => (
                                <span key={line} className="block">{line}</span>
                            ))}
                        </h1>

                        <p className="mt-5 max-w-[440px] text-base leading-7 text-[#42624d] sm:text-lg">
                            <span>{activeSlide.description.split(activeSlide.accent)[0]}</span>
                            <span className="font-extrabold text-[#0b7547]">{activeSlide.accent}</span>
                            <span>{activeSlide.description.split(activeSlide.accent)[1]}</span>
                        </p>

                        <Link
                            to="/search"
                            className="mt-7 inline-flex h-12 items-center gap-3 rounded-full bg-[#0e6843] px-6 text-sm font-bold text-white shadow-[0_8px_18px_rgba(14,104,67,0.2)] transition hover:-translate-y-0.5 hover:bg-[#095b39]"
                        >
                            <span>Shop Now</span>
                            <span aria-hidden="true" className="text-lg leading-none">→</span>
                        </Link>
                    </div>

                    <div className="relative flex min-h-[255px] items-center justify-center sm:min-h-[300px] lg:min-h-[420px]">
                        <img
                            key={activeSlide.image}
                            src={activeSlide.image}
                            alt="Featured earbuds"
                            className="h-[275px] w-full object-contain drop-shadow-[0_20px_24px_rgba(25,61,37,0.18)] transition-opacity duration-500 sm:h-[330px] lg:h-[445px]"
                        />
                    </div>
                </div>

                <div className="relative z-10 mt-3 flex items-center justify-center gap-3 pb-0.5">
                    <button
                        type="button"
                        onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#98bd9f] text-[#235b39] transition hover:bg-white/60"
                        aria-label="Previous hero slide"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`h-2.5 rounded-full transition-all ${activeIndex === index ? 'w-8 bg-[#0e6843]' : 'w-2.5 bg-[#8eb99a]'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                    <button
                        type="button"
                        onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#98bd9f] text-[#235b39] transition hover:bg-white/60"
                        aria-label="Next hero slide"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </section>

            <section className="space-y-5">
                <SectionTitle title="Best Categories" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    {categories.map((category) => (
                        <div key={category.name} className="rounded-[22px] border border-[#dfeee1] bg-white p-4 shadow-sm">
                            <div className={`mb-4 flex h-22 items-center justify-center rounded-[18px] bg-gradient-to-br ${category.tint} text-[2.2rem]`}>
                                <span>{category.icon}</span>
                            </div>
                            <p className="text-center text-sm font-medium text-slate-700">{category.name}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-5">
                <SectionTitle title="For You" />
                <div className="grid grid-cols-2 gap-5 md:grid-cols-5">
                        {forYou.map((item) => (
                            <ProductCard key={item.name} product={{ ...item, accent: item.tint, category: 'Audio', discount: '-25%' }} />
                        ))}
                </div>
            </section>

            {marketplaceProducts.length > 0 && <section className="space-y-5">
                <SectionTitle title="New from our sellers" />
                <div className="grid grid-cols-2 gap-5 md:grid-cols-4 xl:grid-cols-5">
                    {marketplaceProducts.slice(0, 5).map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </section>}

            <section className="rounded-[30px] bg-[#0a4d2b] p-6 text-white shadow-[0_18px_35px_rgba(10,77,43,0.22)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-white/70">Exclusive</p>
                        <h3 className="mt-2 text-[2rem] font-black tracking-[-0.06em]">Up to 50% off on your favorite items</h3>
                    </div>
                    <Link to="/search" className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0a4d2b] transition hover:bg-[#eaf6ed]">
                        Shop Now
                    </Link>
                </div>
            </section>

            <section className="space-y-5">
                <SectionTitle title="Trending Products" />
                <div className="flex flex-wrap gap-3">
                    {trendingFilters.map((filter) => (
                        <Link
                            key={filter}
                            to={filter === 'All' ? '/search' : `/search?category=${encodeURIComponent(filter)}`}
                            aria-current={activeCategory === filter ? 'page' : undefined}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${activeCategory === filter
                                    ? 'border-[#1d7d4d] bg-[#1d7d4d] text-white'
                                    : 'border-[#dfeee1] bg-white text-slate-700 hover:border-[#a8ceb1]'
                                }`}
                        >
                            {filter}
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
                    {trendingProducts.map((product) => (
                        <ProductCard key={product.name} product={{ ...product, category: 'Audio', discount: '-25%' }} />
                    ))}
                </div>
            </section>


            <section className="space-y-5">
                <SectionTitle title="Most Popular" />
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
                    {popularProducts.map((product) => (
                        <ProductCard key={product.name} product={{ ...product, category: 'Electronics', discount: '-25%' }} />
                    ))}
                </div>
            </section>



            <section className="rounded-[30px] bg-[#113a2e] px-6 py-10 text-center text-white shadow-[0_18px_35px_rgba(8,30,26,0.18)]">
                <h3 className="text-[2.2rem] font-black tracking-[-0.06em]">Frequently Asked Questions</h3>
                <div className="mx-auto mt-8 max-w-3xl space-y-3">
                    {faqItems.map((item, index) => (
                        <div key={item.question} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm text-white/80">
                            <button type="button" onClick={() => setOpenFaqIndex((current) => current === index ? -1 : index)} aria-expanded={openFaqIndex === index} className="flex w-full items-center justify-between gap-3 text-left">
                                <span>{item.question}</span>
                                <span aria-hidden="true" className="text-lg">{openFaqIndex === index ? '−' : '+'}</span>
                            </button>
                            {openFaqIndex === index && <div className="mt-3 text-sm leading-6 text-white/70">{item.answer}</div>}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
