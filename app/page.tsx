'use client'

import SmoothScroll from '@/components/SmoothScroll'
import Hero from '@/sections/Hero'
import TheDev from '@/sections/TheDev'
import TechStack from '@/sections/TechStack'
import Journal from '@/sections/Journal'
import Showcase from '@/sections/Showcase'
import Playground from '@/sections/Playground'
import Footer from '@/sections/Footer'

export default function Home() {
  return (
    <SmoothScroll>
      <main className="relative w-full">
        <Hero />
        <TheDev />
        <TechStack />
        <Journal />
        <Showcase />
        <Playground />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
