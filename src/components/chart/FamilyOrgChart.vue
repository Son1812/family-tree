<template>
  <div class="flex flex-col h-full select-none">
    <!-- Toolbar trên sơ đồ -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-kyn-divider-dividers-1 mb-3">
      <div class="flex items-center gap-2.5">
        <span class="text-xs font-semibold uppercase tracking-wider text-kyn-text-subtitle hidden sm:inline">
          Phả đồ:
        </span>
        <div class="inline-flex items-center p-0.5 rounded-lg bg-kyn-bg-secondary-2 border border-kyn-divider-dividers-2 text-xs font-medium">
          <button
            type="button"
            class="px-3 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
            :class="
              branchMode === 'expanded'
                ? 'bg-kyn-bg-primary text-kyn-text-title font-bold shadow-xs'
                : 'text-kyn-text-subtitle hover:text-kyn-text-primary'
            "
            @click="handleExpandAll"
          >
            <KynIcon name="maximize-2" :size="13" />
            <span>Mở rộng tất cả</span>
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
            :class="
              branchMode === 'collapsed'
                ? 'bg-kyn-bg-primary text-kyn-text-title font-bold shadow-xs'
                : 'text-kyn-text-subtitle hover:text-kyn-text-primary'
            "
            @click="handleCollapseAll"
          >
            <KynIcon name="minimize-2" :size="13" />
            <span>Thu gọn nhánh</span>
          </button>
        </div>
      </div>

      <!-- Ô tìm kiếm ngay trên toolbar phả đồ -->
      <div ref="chartSearchBoxRef" class="relative max-w-xs w-52 sm:w-64">
        <input
          v-model="chartSearchQuery"
          type="text"
          placeholder="Tìm người trên phả đồ..."
          class="w-full pl-8 pr-7 py-1 text-xs rounded-lg border border-kyn-divider-dividers-2 focus:border-kyn-primary focus:ring-1 focus:ring-kyn-primary bg-kyn-bg-secondary-2 text-kyn-text-title placeholder:text-kyn-text-subtitle outline-none transition-all"
          @focus="isChartSearchOpen = true"
          @keydown.esc="isChartSearchOpen = false"
        />
        <span class="absolute left-2.5 top-1.5 text-kyn-icon-tertiary pointer-events-none">
          <KynIcon name="search" :size="13" />
        </span>
        <button
          v-if="chartSearchQuery"
          type="button"
          class="absolute right-2 top-1 text-kyn-text-subtitle hover:text-kyn-text-title text-xs cursor-pointer"
          @click="chartSearchQuery = ''"
        >
          ✕
        </button>

        <!-- Dropdown kết quả gợi ý -->
        <div
          v-if="isChartSearchOpen && chartSearchQuery && chartSearchResults.length > 0"
          class="absolute left-0 right-0 top-8 bg-kyn-bg-primary rounded-lg shadow-xl border border-kyn-divider-dividers-2 py-1 z-[120] max-h-60 overflow-y-auto text-xs"
          @mousedown.stop
        >
          <button
            v-for="res in chartSearchResults"
            :key="res.id"
            type="button"
            class="w-full text-left px-3 py-1.5 hover:bg-kyn-bg-secondary-2 flex items-center justify-between group transition-colors cursor-pointer"
            @click="handleSelectChartSearch(res.id)"
          >
            <div class="min-w-0 pr-2">
              <div class="font-bold text-kyn-text-title group-hover:text-amber-600 truncate">
                {{ res.fullName }}
                <span v-if="res.courtesyName" class="font-normal italic text-amber-600 ml-1">
                  ({{ res.courtesyName }})
                </span>
              </div>
              <div class="text-[10.5px] text-kyn-text-subtitle truncate">
                Đời {{ res.generation }} {{ res.orderTitle ? '· ' + res.orderTitle : '' }} {{ res.branch ? '· ' + res.branch : '' }}
              </div>
            </div>
            <span class="text-[10px] text-amber-600 font-semibold group-hover:underline flex-none">
              Hiện giữa
            </span>
          </button>
        </div>
      </div>

      <!-- Zoom / Pan controls dùng AppButton KYN -->
      <div class="flex items-center gap-1.5 bg-kyn-bg-secondary-2 p-1 rounded-lg border border-kyn-divider-dividers-2">
        <AppButton variant="secondary" size="sm" title="Thu nhỏ" @click="zoomOut">−</AppButton>
        <span class="text-xs text-kyn-text-subtitle w-12 text-center tabular-nums font-mono font-medium">
          {{ zoomPercent }}%
        </span>
        <AppButton variant="secondary" size="sm" title="Phóng to" @click="zoomIn">+</AppButton>
        <AppButton variant="secondary" size="sm" title="Tự động thu phóng vừa khung hình" @click="fit">
          Vừa màn hình
        </AppButton>
        <AppButton variant="secondary" size="sm" title="Về cỡ 100%" @click="resetZoom">
          100%
        </AppButton>
      </div>
    </div>

    <!-- Khung Viewport chính -->
    <div class="relative flex-1 min-h-[480px]">
      <!-- Chú thích Legend nổi góc trên-trái -->
      <FamilyOrgLegend class="absolute top-3 left-3 z-20" />

      <!-- Viewport cuộn + kéo rê chuột -->
      <div
        ref="viewportRef"
        class="relative w-full h-[calc(100vh-230px)] min-h-[600px] rounded-2xl border border-kyn-divider-dividers-1 bg-kyn-bg-secondary-1 overflow-auto cursor-grab active:cursor-grabbing shadow-inner transition-colors"
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
                stroke="var(--color-kyn-primary, #f9c216)"
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
      class="mt-3 py-2 px-3 bg-kyn-primary-tag-bg border border-kyn-primary-border/40 rounded-xl flex items-center gap-1.5 text-xs flex-wrap text-kyn-text-title transition-colors"
    >
      <span class="font-bold text-kyn-text-title flex items-center gap-1.5">
        <KynIcon name="network" :size="13" class="text-amber-600 dark:text-amber-400" />
        <span>Dòng huyết mạch:</span>
      </span>
      <template v-for="(id, i) in bloodlineChain" :key="id">
        <button
          type="button"
          class="hover:underline transition-colors cursor-pointer"
          :class="
            id === selectedMemberId
              ? 'text-kyn-text-on-primary font-bold bg-kyn-primary px-2 py-0.5 rounded-md'
              : 'text-kyn-text-primary'
          "
          @click="handleSelectBloodline(id)"
        >
          {{ memberName(id) }}
        </button>
        <span v-if="i < bloodlineChain.length - 1" class="text-kyn-text-subtitle">›</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { AppButton, KynIcon } from '@kyn/vue-components'
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
  flatMembers,
  selectMember,
  focusMember,
  toggleCollapse,
  expandAll,
  collapseAll,
} = useFamilyTree()

// ── Tìm kiếm nhanh trực tiếp trên thanh công cụ Phả đồ ──────────────
const chartSearchQuery = ref('')
const isChartSearchOpen = ref(false)
const chartSearchBoxRef = ref<HTMLElement | null>(null)

const chartSearchResults = computed(() => {
  const q = chartSearchQuery.value.trim().toLowerCase()
  if (!q) return []
  return flatMembers.value
    .filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.courtesyName?.toLowerCase().includes(q) ||
        m.birthDate?.includes(q) ||
        m.deathDateLunar?.includes(q),
    )
    .slice(0, 8)
})

function handleSelectChartSearch(id: string) {
  isChartSearchOpen.value = false
  chartSearchQuery.value = ''
  focusMember(id)
  nextTick(() => {
    centerMember(id)
  })
}

function handleSelectBloodline(id: string) {
  selectMember(id)
  nextTick(() => {
    centerMember(id)
  })
}

function handleChartSearchDocClick(e: MouseEvent) {
  if (chartSearchBoxRef.value && !chartSearchBoxRef.value.contains(e.target as Node)) {
    isChartSearchOpen.value = false
  }
}

watch(isChartSearchOpen, (open) => {
  if (open) {
    window.addEventListener('pointerdown', handleChartSearchDocClick)
  } else {
    window.removeEventListener('pointerdown', handleChartSearchDocClick)
  }
})

const branchMode = ref<'expanded' | 'collapsed'>('expanded')

function handleExpandAll() {
  branchMode.value = 'expanded'
  expandAll()
}

function handleCollapseAll() {
  branchMode.value = 'collapsed'
  collapseAll()
}

watch(collapsedIds, (set) => {
  if (set.size === 0) {
    branchMode.value = 'expanded'
  }
})

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
  window.removeEventListener('pointerdown', handleChartSearchDocClick)
})

/**
 * Cuộn khung nhìn mượt mà để đưa thành viên chỉ định vào chính giữa màn hình (giữa phả đồ).
 */
async function centerMember(id: string, opts: { zoomIfSmall?: boolean; pulse?: boolean } = {}) {
  const { zoomIfSmall = true, pulse = true } = opts
  const vp = viewportRef.value
  const chart = chartRef.value
  if (!vp || !chart) return

  // 1. Phóng to tỷ lệ đọc nếu đang ở mức quá nhỏ (< 75%)
  if (zoomIfSmall && scale.value < 0.75) {
    autoFit.value = false
    scale.value = 0.85
  }

  // 2. Chờ Vue cập nhật và layout tính toán lại kích thước
  await nextTick()
  measureNatural()
  await new Promise((resolve) => requestAnimationFrame(resolve))

  // 3. Tìm phần tử thẻ thành viên
  const el = chart.querySelector(`[data-node-id="${id}"]`) as HTMLElement | null
  if (!el) {
    console.warn(`[FamilyOrgChart] Không tìm thấy thẻ thành viên id="${id}"`)
    return
  }

  // 4. Tính toán tọa độ tâm phần tử so với viewport
  const elRect = el.getBoundingClientRect()
  const vpRect = vp.getBoundingClientRect()

  const elCenterX = elRect.left + elRect.width / 2
  const elCenterY = elRect.top + elRect.height / 2

  const vpCenterX = vpRect.left + vp.clientWidth / 2
  const vpCenterY = vpRect.top + vp.clientHeight / 2

  const deltaX = elCenterX - vpCenterX
  const deltaY = elCenterY - vpCenterY

  const targetLeft = Math.max(0, vp.scrollLeft + deltaX)
  const targetTop = Math.max(0, vp.scrollTop + deltaY)

  vp.scrollTo({
    left: targetLeft,
    top: targetTop,
    behavior: 'smooth',
  })

  // 5. Hiệu ứng sóng vàng (Pulse glow) tập trung sự chú ý
  if (pulse) {
    el.classList.remove('oc-box--pulse')
    void el.offsetWidth // Kích hoạt reflow
    el.classList.add('oc-box--pulse')
    setTimeout(() => {
      el.classList.remove('oc-box--pulse')
    }, 3600)
  }
}

defineExpose({
  centerMember,
})
</script>
