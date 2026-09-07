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

/** 磁吸交互:指针进入元素矩形包围盒的外扩范围即触发、离开后弹回(适配任意长宽组件)。 */
export function magneticHover(
  el: HTMLElement,
  opts: {
    strength?: number
    /** 包围盒四周外扩的边距(默认 40px);控制吸附范围的大小 */
    radius?: number
    inner?: HTMLElement | null
    xStrength?: number
    yStrength?: number
  } = {}
): () => void {
  const xs = opts.xStrength ?? opts.strength ?? 0.4
  const ys = opts.yStrength ?? opts.strength ?? 0.4
  const margin = opts.radius ?? 40
  const inner = opts.inner

  // 统一用 gsap.to + overwrite:'auto':同一时刻只有一个过渡在控制元素的 x/y,
  // 进入/离开/再次进入都从「当前值」平滑过渡——避免 quickTo 复用导致的再进入瞬跳
  let inRange = false

  const onMove = (e: MouseEvent) => {
    const r = el.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    // 按「元素矩形包围盒 + margin」判定(不再是圆形),适配任意长宽:
    // 左右可覆盖元素全长,上下仅多出 margin——避免圆形导致左右吸不到、上下范围过大
    const near =
      x >= r.left - margin && x <= r.right + margin && y >= r.top - margin && y <= r.bottom + margin
    if (near) {
      if (!inRange) inRange = true
      const dx = x - (r.left + r.width / 2)
      const dy = y - (r.top + r.height / 2)
      gsap.to(el, { x: dx * xs, y: dy * ys, duration: 0.18, ease: 'power2.out', overwrite: 'auto' })
      if (inner)
        gsap.to(inner, { x: dx * xs * 0.5, y: dy * ys * 0.5, duration: 0.22, ease: 'power2.out', overwrite: 'auto' })
    } else if (inRange) {
      inRange = false
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' })
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
    }
  }

  window.addEventListener('mousemove', onMove)

  return () => {
    window.removeEventListener('mousemove', onMove)
  }
}

export { gsap, ScrollTrigger }
