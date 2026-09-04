import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother)

/**
 * 为所有 [data-reveal] 元素做「进入视口时上移淡入」。
 * data-reveal-from: up / left / right。
 */
export function initReveals(scope: HTMLElement | Document = document) {
  const els = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope)
  els.forEach((el) => {
    const dir = el.dataset.revealFrom || 'up'
    const x = dir === 'left' ? -40 : dir === 'right' ? 40 : 0
    const y = dir === 'up' ? 28 : 0
    gsap.fromTo(
      el,
      { autoAlpha: 0, x, y },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    )
  })
  ScrollTrigger.refresh()
}

/** 初始化和启用 ScrollSmoother 整页平滑滚动(content 自动包进 #smooth-wrapper)。 */
export function initSmoothScroll() {
  const smoother = ScrollSmoother.create({
    smooth: 1.2,
    effects: true,
    smoothTouch: 0.1,
  })
  return smoother
}

/** 背景郁金香随滚动做轻微视差(单独一个 scrub tween,不与浮动动画打架,不会回弹)。 */
export function animateTulips(scope: HTMLElement | Document = document) {
  const parts = gsap.utils.toArray<HTMLElement>('.tulip', scope)
  parts.forEach((el, i) => {
    gsap.to(el, {
      y: i % 2 === 0 ? -120 : 160,
      ease: 'none',
      scrollTrigger: {
        trigger: (scope === document ? document.body : scope) as Element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.4,
      },
    })
  })
}

/** 用 gsap ScrollToPlugin 做平滑页内滚动(offsetY 为固定顶栏让位)。 */
export function scrollToEl(target: string | number, offsetY = 84) {
  gsap.to(window, {
    scrollTo: { y: target, offsetY },
    duration: 0.8,
    ease: 'power2.inOut',
  })
}

/** 磁吸交互:元素在指针靠近时轻微吸向指针,移出后弹回(参考:磁吸交互)。 */
export function magneticHover(
  el: HTMLElement,
  opts: {
    strength?: number
    radius?: number
    inner?: HTMLElement | null
    xStrength?: number
    yStrength?: number
  } = {}
): () => void {
  const xs = opts.xStrength ?? opts.strength ?? 0.4
  const ys = opts.yStrength ?? opts.strength ?? 0.4
  const radius = opts.radius ?? 130
  const quickX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power2.out' })
  const quickY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power2.out' })

  const inner = opts.inner
  const quickIX = inner ? gsap.quickTo(inner, 'x', { duration: 0.5, ease: 'power2.out' }) : null
  const quickIY = inner ? gsap.quickTo(inner, 'y', { duration: 0.5, ease: 'power2.out' }) : null

  const onMove = (e: MouseEvent) => {
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left - r.width / 2
    const y = e.clientY - r.top - r.height / 2
    if (Math.hypot(x, y) < radius) {
      quickX(x * xs)
      quickY(y * ys)
      if (inner && quickIX) quickIX(x * xs * 0.5)
      if (inner && quickIY) quickIY(y * ys * 0.5)
    }
  }
  const onLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' })
  }

  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', onLeave)

  return () => {
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
  }
}

export { gsap, ScrollTrigger }
