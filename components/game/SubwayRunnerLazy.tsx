'use client'

import dynamic from 'next/dynamic'

const SubwayRunner = dynamic(() => import('./SubwayRunner'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] md:aspect-[16/9] border border-line bg-black flex items-center justify-center">
      <span className="font-mono text-[10px] tracking-widest2 text-accent animate-pulse">
        loading engine…
      </span>
    </div>
  ),
})

export default function SubwayRunnerLazy() {
  return <SubwayRunner />
}
