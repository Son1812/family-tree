<template>
  <div class="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-md text-xs select-none">
    <button
      type="button"
      class="flex items-center gap-2 px-3 py-2 w-full text-left text-slate-700 hover:text-amber-900 transition-colors"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
      <span class="font-bold text-slate-800">Chú thích Phả hệ</span>
      <span class="ml-auto text-slate-400 font-mono">{{ open ? '▾' : '▸' }}</span>
    </button>

    <div v-if="open" class="px-3 pb-3 flex flex-col gap-2 border-t border-slate-100 pt-2 min-w-[190px]">
      <!-- Thế hệ -->
      <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Thế hệ / Đời</div>
      <div v-for="gen in generations" :key="gen.generation" class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full flex-none shadow-sm" :style="{ background: gen.color }"></span>
        <span class="font-medium text-slate-700">{{ gen.roman }}:</span>
        <span class="text-slate-500 text-[11px]">{{ gen.title }}</span>
      </div>

      <div class="h-px bg-slate-100 my-1"></div>

      <!-- Ký hiệu trạng thái -->
      <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-none"></span>
        <span class="text-slate-600">Thành viên còn sống</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-600 flex-none"></span>
        <span class="text-slate-600">Đã quy tiên (có ngày giỗ)</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-0.5 bg-amber-500 flex-none"></span>
        <span class="text-slate-600">Đường huyết mạch (chọn)</span>
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
