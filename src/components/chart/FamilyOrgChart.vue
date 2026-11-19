<template>
  <div class="flex flex-col h-full select-none">
    <!-- Toolbar trên sơ đồ -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Chế độ xem: Phả đồ Trực quan
        </span>
        <span class="text-xs text-slate-400">·</span>
        <button
          type="button"
          class="text-xs text-amber-700 hover:text-amber-800 font-medium hover:underline"
          @click="expandAll"
        >
          Mở rộng tất cả
        </button>
        <span class="text-xs text-slate-300">|</span>
        <button
          type="button"
          class="text-xs text-slate-600 hover:text-slate-800 hover:underline"
          @click="collapseAll"
        >
          Thu gọn nhánh
        </button>
      </div>

      <!-- Zoom / Pan controls -->
      <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          type="button"
          class="w-7 h-7 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shadow-sm transition-colors"
          title="Thu nhỏ"
          @click="zoomOut"
        >
          −
        </button>
        <span class="text-xs text-slate-600 w-12 text-center tabular-nums font-mono font-medium">
          {{ zoomPercent }}%
        </span>
        <button
          type="button"
          class="w-7 h-7 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shadow-sm transition-colors"
          title="Phóng to"
          @click="zoomIn"
        >
          +
        </button>
        <button
          type="button"
          class="px-2.5 h-7 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium shadow-sm transition-colors"
          title="Tự động thu phóng vừa khung hình"
          @click="fit"
        >
          Vừa màn hình
        </button>
        <button
          type="button"
          class="px-2 h-7 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium shadow-sm transition-colors"
          title="Về cỡ 100%"
          @click="resetZoom"
        >
          100%
        </button>
      </div>
    </div>

    <!-- Khung Viewport chính -->
    <div class="relative flex-1 min-h-[480px]">
      <!-- Chú thích Legend nổi góc trên-trái -->
      <FamilyOrgLegend class="absolute top-3 left-3 z-20" />

      <!-- Viewport cuộn + kéo rê chuột -->
      <div
        ref="viewportRef"
        class="relative w-full h-[640px] rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/70 to-slate-100/50 overflow-auto cursor-grab active:cursor-grabbing shadow-inner"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
      >
        <!-- Canvas bọc kích thước scale -->
        <div
          class="relative mx-auto p-12 transition-all duration-75"
          :style="{
            width: Math.max(scaledSize.w + 120, 800) + 'px',
            height: Math.max(scaledSize.h + 120, 600) + 'px',
          }"
        >
          <div
            ref="chartRef"
            class="absolute top-12 left-12"
            :style="{ transform: `scale(${scale})`, transformOrigin: 'top left' }"
          >
            <!-- Cây HTML <ul> + <li> đệ quy -->
            <ul class="family-orgchart">
              <FamilyOrgNode v-for="rootNode in tree" :key="rootNode.id" :node="rootNode" />
            </ul>

            <!-- SVG Overlay in đậm đường huyết mạch (Hệ toạ độ tự nhiên) -->
            <svg
              class="pointer-events-none absolute inset-0 w-full h-full"
              style="overflow: visible; z-index: 0"
            >
              <polyline
                v-for="(seg, i) in hlSegments"
                :key="i"
                :points="seg"
                fill="none"
                stroke="#b45309"
                stroke-width="3.5"
                stroke-linejoin="round"
                stroke-linecap="round"
                class="transition-all duration-300"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Huyết thống (Khi có thành viên được chọn) -->
    <div
      v-if="bloodlineChain.length > 0"
      class="mt-3 py-2 px-3 bg-amber-50/80 border border-amber-200/70 rounded-xl flex items-center gap-1.5 text-xs flex-wrap"
    >
      <span class="font-bold text-amber-900 flex items-center gap-1">
        <span>🩸</span> Dòng huyết mạch:
      </span>
      <template v-for="(id, i) in bloodlineChain" :key="id">
        <button
          type="button"
          class="hover:underline transition-colors"
          :class="
            id === selectedMemberId
              ? 'text-amber-900 font-bold bg-amber-200/60 px-1.5 py-0.5 rounded'
              : 'text-amber-800'
          "
          @click="selectMember(id)"
        >
          {{ memberName(id) }}
        </button>
        <span v-if="i < bloodlineChain.length - 1" class="text-amber-400">›</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import type { FamilyMember } from '../../types/family'
import FamilyOrgNode from './FamilyOrgNode.vue'
import FamilyOrgLegend from './FamilyOrgLegend.vue'
import { FAMILY_CHART_CTX } from './chartCtx'
import { clamp, computeFitScale, computeHighlightSegments } from './geometry'
import { useFamilyTree } from '../../composables/useFamilyTree'

const emit = defineEmits<{
  viewDetail: [member: FamilyMember]
  addChild: [parent: FamilyMember]
  addSpouse: [member: FamilyMember]
  edit: [member: FamilyMember]
  delete: [member: FamilyMember]
}>()

const {
  tree,
  selectedMemberId,
  bloodlineChain,
  bloodlinePathIds,
  collapsedIds,
  memberById,
  selectMember,
  toggleCollapse,
  expandAll,
  collapseAll,
} = useFamilyTree()

function memberName(id: string): string {
  const m = memberById.value.get(id)
  return m ? m.fullName : id
}

// Cung cấp Context cho toàn bộ cây
provide(FAMILY_CHART_CTX, {
  selectedMemberId,
  bloodlinePathIds,
  collapsedIds,
  onSelect: (node) => selectMember(node.id),
  onToggleCollapse: toggleCollapse,
  onAddChild: (parent) => emit('addChild', parent),
  onEdit: (member) => emit('edit', member),
  onViewDetail: (member) => emit('viewDetail', member),
  onAddSpouse: (member) => emit('addSpouse', member),
  onDelete: (member) => emit('delete', member),
})

// ── Zoom / Pan / Auto-fit ──────────────────────────────────────────
const viewportRef = ref<HTMLElement | null>(null)
const chartRef = ref<HTMLElement | null>(null)
const naturalSize = ref({ w: 0, h: 0 })
const scale = ref(1)
const autoFit = ref(true)
const ZOOM_STEP = 0.1

const scaledSize = computed(() => ({
  w: naturalSize.value.w * scale.value,
  h: naturalSize.value.h * scale.value,
}))
const zoomPercent = computed(() => Math.round(scale.value * 100))

function measureNatural(): void {
  const el = chartRef.value
  if (!el) return
  naturalSize.value = { w: el.scrollWidth, h: el.scrollHeight }
}

function doFit(): void {
  const vp = viewportRef.value
  if (!vp) return
  scale.value = computeFitScale(
    naturalSize.value,
    { w: vp.clientWidth - 40, h: vp.clientHeight - 40 },
    0.35,
    1.2,
    scale.value,
    'contain',
  )
}

function fit(): void {
  autoFit.value = true
  measureNatural()
  doFit()
}

function resetZoom(): void {
  autoFit.value = false
  scale.value = 1
}

function zoomBy(delta: number): void {
  autoFit.value = false
  scale.value = clamp(scale.value + delta, 0.25, 2.0)
}

const zoomIn = () => zoomBy(ZOOM_STEP)
const zoomOut = () => zoomBy(-ZOOM_STEP)

// Kéo rê canvas (Mouse Pan Drag)
let isDragging = false
let startX = 0
let startY = 0
let scrollLeft = 0
let scrollTop = 0

function onMouseDown(e: MouseEvent) {
  // Chỉ kéo khi click vào nền viewport (không phải click vào button hay thẻ)
  const target = e.target as HTMLElement
  if (target.closest('.oc-box') || target.closest('button')) return

  isDragging = true
  const vp = viewportRef.value
  if (!vp) return
  startX = e.pageX - vp.offsetLeft
  startY = e.pageY - vp.offsetTop
  scrollLeft = vp.scrollLeft
  scrollTop = vp.scrollTop
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging) return
  e.preventDefault()
  const vp = viewportRef.value
  if (!vp) return
  const x = e.pageX - vp.offsetLeft
  const y = e.pageY - vp.offsetTop
  const walkX = (x - startX) * 1.2
  const walkY = (y - startY) * 1.2
  vp.scrollLeft = scrollLeft - walkX
  vp.scrollTop = scrollTop - walkY
}

function onMouseUp() {
  isDragging = false
}

// ── Overlay Highlight Đường Huyết Mạch ──────────────────────────────
const hlSegments = ref<string[]>([])

function computeHighlight(): void {
  const chart = chartRef.value
  if (!chart) {
    hlSegments.value = []
    return
  }
  const cr = chart.getBoundingClientRect()
  hlSegments.value = computeHighlightSegments(
    bloodlineChain.value,
    (id) => chart.querySelector<HTMLElement>(`[data-node-id="${id}"]`)?.getBoundingClientRect() ?? null,
    { left: cr.left, top: cr.top },
    scale.value,
  )
}

function scheduleHighlight(): void {
  nextTick(() => requestAnimationFrame(computeHighlight))
}

watch([bloodlineChain, collapsedIds, scale], scheduleHighlight)

let resizeObserver: ResizeObserver | null = null
function setupResizeObserver(): void {
  resizeObserver?.disconnect()
  resizeObserver = null
  if (!chartRef.value || !viewportRef.value || typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(() => {
    measureNatural()
    if (autoFit.value) doFit()
    scheduleHighlight()
  })
  resizeObserver.observe(chartRef.value)
  resizeObserver.observe(viewportRef.value)
}

watch(chartRef, () => nextTick(setupResizeObserver))

onMounted(() => {
  window.addEventListener('resize', scheduleHighlight)
  nextTick(() => {
    measureNatural()
    doFit()
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', scheduleHighlight)
})
</script>
