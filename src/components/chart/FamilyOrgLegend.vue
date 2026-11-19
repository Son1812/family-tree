<template>
  <div class="rounded-xl border border-kyn-divider-dividers-1 bg-kyn-bg-primary/95 backdrop-blur-sm shadow-md text-xs select-none">
    <button
      type="button"
      class="flex items-center gap-2 px-3 py-2 w-full text-left text-kyn-text-secondary hover:text-kyn-text-title transition-colors cursor-pointer"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="w-2 h-2 rounded-full bg-kyn-primary animate-pulse"></span>
      <span class="font-bold text-kyn-text-title">Chú thích Phả hệ</span>
      <span class="ml-auto text-kyn-text-subtitle font-mono">{{ open ? '▾' : '▸' }}</span>
    </button>

    <div v-if="open" class="px-3 pb-3 flex flex-col gap-2 border-t border-kyn-divider-dividers-1 pt-2 min-w-[200px]">
      <!-- Thế hệ -->
      <div class="text-[11px] font-semibold text-kyn-text-subtitle uppercase tracking-wider">Thế hệ / Đời</div>
      <div v-for="gen in generations" :key="gen.generation" class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full flex-none shadow-xs" :style="{ background: gen.color }"></span>
        <span class="font-medium text-kyn-text-title">{{ gen.roman }}:</span>
        <span class="text-kyn-text-subtitle text-[11px]">{{ gen.title }}</span>
      </div>

      <div class="h-px bg-kyn-divider-dividers-1 my-1"></div>

      <!-- Ký hiệu trạng thái -->
      <div class="text-[11px] font-semibold text-kyn-text-subtitle uppercase tracking-wider">Trạng thái</div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-kyn-success-primary flex-none"></span>
        <span class="text-kyn-text-secondary">Thành viên còn sống</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-kyn-warning-primary flex-none"></span>
        <span class="text-kyn-text-secondary">Đã quy tiên (có ngày giỗ)</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-0.5 bg-kyn-primary flex-none"></span>
        <span class="text-kyn-text-secondary">Đường huyết mạch (chọn)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GENERATION_STYLES } from '../../data/generationStyles'

withDefaults(
  defineProps<{
    defaultOpen?: boolean
  }>(),
  { defaultOpen: false }
)

const open = ref(false)
const generations = Object.values(GENERATION_STYLES)
</script>
