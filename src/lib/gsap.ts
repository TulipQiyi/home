import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother)

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
    if (prefersReducedMotion) {
      gsap.set(el, { autoAlpha: 1, x: 0, y: 0 })
      return
    }
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

/**
 * 整页平滑滚动。
 * - smooth 略微收敛(1.2 → 0.9):滚轮手感仍在,但少一帧的插值延迟。
 * - smoothTouch 关闭:触屏/触控板走浏览器原生滚动,跟手性最好(此前 0.1 在手机上明显发飘)。
 * - 用户开启「减弱动态效果」时直接不启用。
 */
export function initSmoothScroll() {
  if (prefersReducedMotion) return null
  const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
  return ScrollSmoother.create({
    smooth: coarse ? 0 : 0.9,
    effects: true,
    smoothTouch: false,
  })
}

/** 背景郁金香随滚动做轻微视差(单独一个 scrub tween,不与浮动动画打架,不会回弹)。 */
export function animateTulips(scope: HTMLElement | Document = document) {
  if (prefersReducedMotion) return
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

/* ============================================================
   磁吸交互 —— 全局单例
   以前每个元素各挂一个 window.mousemove,页面上有 40+ 个监听;
   每次鼠标移动会把它们全部同步跑一遍,每个都 getBoundingClientRect()
   强制布局,再新建一个 gsap tween —— 这是鼠标移动时最大的 JS 开销。
   现在:一个 mousemove + 一帧一次 rAF 批量处理,矩形缓存到滚动/缩放才失效。
   ============================================================ */

type MagnetTarget = {
  el: HTMLElement
  inner: HTMLElement | null
  xs: number
  ys: number
  margin: number
  inRange: boolean
  rect: DOMRect | null
}

const magnetTargets = new Set<MagnetTarget>()
let magnetRaf = 0
let pointerX = 0
let pointerY = 0
let pointerSeen = false
let magnetListening = false

function invalidateRects() {
  magnetTargets.forEach((t) => (t.rect = null))
}

let lastScrollY = -1

function flushMagnets() {
  magnetRaf = 0
  if (!pointerSeen) return
  // 平滑滚动由 transform 驱动,每帧位置都在变;用 scrollY 变化判定缓存失效,
  // 避免静态时每帧重复 getBoundingClientRect()
  if (window.scrollY !== lastScrollY) {
    lastScrollY = window.scrollY
    invalidateRects()
  }
  magnetTargets.forEach((t) => {
    const r = t.rect ?? (t.rect = t.el.getBoundingClientRect())
    const near =
      pointerX >= r.left - t.margin &&
      pointerX <= r.right + t.margin &&
      pointerY >= r.top - t.margin &&
      pointerY <= r.bottom + t.margin
    if (near) {
      t.inRange = true
      const dx = pointerX - (r.left + r.width / 2)
      const dy = pointerY - (r.top + r.height / 2)
      gsap.to(t.el, {
        x: dx * t.xs,
        y: dy * t.ys,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: 'auto',
      })
      if (t.inner)
        gsap.to(t.inner, {
          x: dx * t.xs * 0.5,
          y: dy * t.ys * 0.5,
          duration: 0.22,
          ease: 'power2.out',
          overwrite: 'auto',
        })
    } else if (t.inRange) {
      t.inRange = false
      gsap.to(t.el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' })
      if (t.inner) gsap.to(t.inner, { x: 0, y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
    }
  })
}

function scheduleMagnets() {
  if (!magnetRaf) magnetRaf = requestAnimationFrame(flushMagnets)
}

function onPointerMove(e: MouseEvent) {
  pointerX = e.clientX
  pointerY = e.clientY
  pointerSeen = true
  scheduleMagnets()
}

const onViewportChange = () => invalidateRects()

function attachGlobals() {
  if (magnetListening) return
  magnetListening = true
  window.addEventListener('mousemove', onPointerMove, { passive: true })
  window.addEventListener('scroll', onViewportChange, { passive: true })
  window.addEventListener('resize', onViewportChange, { passive: true })
}

function detachGlobals() {
  if (!magnetListening || magnetTargets.size) return
  magnetListening = false
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('scroll', onViewportChange)
  window.removeEventListener('resize', onViewportChange)
  if (magnetRaf) {
    cancelAnimationFrame(magnetRaf)
    magnetRaf = 0
  }
}

/** 磁吸:指针进入「元素矩形包围盒 + margin」即吸附,离开后弹回。返回取消函数。 */
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
  if (prefersReducedMotion) return () => {}

  const target: MagnetTarget = {
    el,
    inner: opts.inner ?? null,
    xs: opts.xStrength ?? opts.strength ?? 0.4,
    ys: opts.yStrength ?? opts.strength ?? 0.4,
    margin: opts.radius ?? 40,
    inRange: false,
    rect: null,
  }
  magnetTargets.add(target)
  attachGlobals()

  return () => {
    magnetTargets.delete(target)
    detachGlobals()
  }
}

export { gsap, ScrollTrigger }
