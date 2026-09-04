<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon'
import {
  mdiEarth,
  mdiFlower,
  mdiFlowerTulip,
  mdiGamepad,
  mdiGhost,
  mdiHeart,
  mdiHome,
  mdiKey,
  mdiLaptop,
  mdiPickaxe,
  mdiPuzzleOutline,
  mdiRocketLaunch,
  mdiSprout,
  mdiToolbox,
  mdiWrench,
  mdiDoor,
  mdiMessageText,
  mdiMinecraft,
  mdiFlowerTulipOutline,
  mdiGift
} from '@mdi/js'

// 只收录页面用到的图标的 mdi 名称 → @mdi/js 路径
const icons: Record<string, string> = {
  rocket: mdiRocketLaunch,
  toolbox: mdiToolbox,
  earth: mdiEarth,
  wrench: mdiWrench,
  home: mdiHome,
  heart: mdiHeart,
  pickaxe: mdiPickaxe,
  flowerTulip: mdiFlowerTulip,
  flowerTulipOutline: mdiFlowerTulipOutline,
  flower: mdiFlower,
  laptop: mdiLaptop,
  gamepad: mdiGamepad,
  ghost: mdiGhost,
  door: mdiDoor,
  key: mdiKey,
  puzzleOutline: mdiPuzzleOutline,
  messageText: mdiMessageText,
  sprout: mdiSprout,
  minecraft: mdiMinecraft,
  gift: mdiGift
}

const props = withDefaults(defineProps<{ name: string; size?: number | string }>(), {
  size: '1em',
})

const path = icons[props.name] ?? icons.home
</script>

<template>
  <SvgIcon type="mdi" :path="path" :size="size" />
</template>
