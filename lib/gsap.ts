'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useIsomorphicLayoutEffect } from './iso'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger, useIsomorphicLayoutEffect }