'use client'

import dynamic from 'next/dynamic'

const Scene3D = dynamic(() => import('./HeroShader'), {
  ssr: false,
  loading: () => null,
})

export default function Scene3DLazy() {
  return <Scene3D />
}