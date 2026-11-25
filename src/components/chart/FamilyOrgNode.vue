<template>
  <li class="oc-li" :class="{ 'oc-li--menu-open': showMenu }">
    <div
      class="oc-box group"
      :class="{
        'oc-box--selected': isSelected,
        'oc-box--path': onPath && !isSelected,
        'oc-box--deceased': !node.isAlive,
        'oc-box--menu-open': showMenu,
        'oc-box--with-spouse': !!node.spouses?.length,
        'oc-box--single': !node.spouses?.length,
      }"
      :data-node-id="node.id"
      :style="{
        '--node-accent': genStyle.color,
        'width': boxWidth + 'px',
      }"
      @click="ctx.onSelect(node)"
    >
      <!-- Mũi tên CAD chỉ từ nhánh trên xuống đỉnh giữa hộp (cho các đời từ Đời II trở đi) -->
      <div v-if="node.generation > 1" class="oc-box-arrow" aria-hidden="true"></div>

      <!-- Top accent stripe for Generation -->
      <div
        class="absolute top-0 left-0 right-0 h-1 rounded-t-[5px]"
        :style="{ background: genStyle.color }"
      ></div>

      <!-- Header row: Generation badge & Order title & Alive dot & Action menu -->
      <div class="flex items-center justify-between gap-1 w-full text-[10.5px] font-medium px-2 py-0.5 bg-kyn-bg-secondary-2/80 border-b border-kyn-divider-dividers-2 rounded-t-[5px] select-none flex-none h-[22px]">
        <div class="flex items-center gap-1 min-w-0">
          <span
            class="px-1.5 py-0.2 rounded text-[9.5px] font-bold tracking-wide flex-none"
            :style="{ background: genStyle.bgColor, color: genStyle.color }"
          >
            {{ genStyle.roman }}
          </span>
          <span v-if="node.orderTitle" class="text-amber-600 dark:text-amber-400 text-[10px] font-medium truncate">
            {{ node.orderTitle }}
          </span>
        </div>

        <div class="flex items-center gap-1 flex-none" @click.stop>
          <!-- Small alive/deceased status indicator dot -->
          <span
            class="w-1.5 h-1.5 rounded-full inline-block"
            :class="node.isAlive ? 'bg-kyn-success-primary' : 'bg-kyn-warning-primary'"
            :title="node.isAlive ? 'Còn sống' : 'Đã tạ thế'"
          ></span>

          <!-- Action menu button -->
          <div ref="menuRef" class="relative">
            <button
              type="button"
              class="w-4 h-4 rounded hover:text-kyn-text-title hover:bg-kyn-bg-secondary-1 flex items-center justify-center transition-colors text-[10px] cursor-pointer text-kyn-text-subtitle"
              :class="{ 'bg-kyn-bg-secondary-2 text-kyn-text-title font-bold': showMenu }"
              title="Thao tác"
              @click.stop="toggleMenu"
            >
              ⋯
            </button>

            <!-- Dropdown menu -->
            <div
              v-if="showMenu"
              class="absolute right-0 top-5 w-44 bg-kyn-bg-primary rounded-lg shadow-2xl border border-kyn-divider-dividers-2 py-1.5 z-[120] text-xs text-kyn-text-primary text-left"
              @click.stop
            >
              <button
                class="w-full text-left px-3 py-1.5 hover:bg-kyn-bg-secondary-2 hover:text-kyn-text-title flex items-center gap-2 cursor-pointer transition-colors"
                @click="handleMenuAction('view')"
              >
                <KynIcon name="eye" :size="14" />
                <span>Xem chi tiết</span>
              </button>
              <button
                class="w-full text-left px-3 py-1.5 hover:bg-kyn-bg-secondary-2 hover:text-kyn-text-title flex items-center gap-2 cursor-pointer transition-colors"
                @click="handleMenuAction('addChild')"
              >
                <KynIcon name="plus" :size="14" />
                <span>Thêm con</span>
              </button>
              <button
                class="w-full text-left px-3 py-1.5 hover:bg-kyn-bg-secondary-2 hover:text-kyn-text-title flex items-center gap-2 cursor-pointer transition-colors"
                @click="handleMenuAction('addSpouse')"
              >
                <KynIcon name="users" :size="14" />
                <span>Thêm phối ngẫu</span>
              </button>
              <button
                class="w-full text-left px-3 py-1.5 hover:bg-kyn-bg-secondary-2 hover:text-kyn-text-title flex items-center gap-2 cursor-pointer transition-colors"
                @click="handleMenuAction('edit')"
              >
                <KynIcon name="pencil" :size="14" />
                <span>Sửa thông tin</span>
              </button>
              <hr class="my-1 border-kyn-divider-dividers-1" />
              <button
                class="w-full text-left px-3 py-1.5 hover:bg-kyn-error-tag-bg text-kyn-error-primary flex items-center gap-2 cursor-pointer transition-colors"
                @click="handleMenuAction('delete')"
              >
                <KynIcon name="trash-2" :size="14" />
                <span>Xóa thành viên</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CAD TABLE: Tầng 1 (Hàng Chồng / Thành viên chính) -->
      <div
        class="w-full flex flex-col justify-center items-center px-2 py-0.5 bg-kyn-bg-primary text-center select-text overflow-hidden"
        :class="[
          !node.spouses?.length ? 'rounded-b-[5px] flex-1' : 'h-[26px] flex-none border-b border-kyn-divider-dividers-2'
        ]"
      >
        <div class="font-bold text-[11.5px] sm:text-[12px] tracking-wide text-kyn-text-title uppercase leading-tight truncate w-full">
          {{ node.fullName }}<span v-if="memberMeta" class="font-normal italic text-[9.5px] text-kyn-text-subtitle ml-1">({{ memberMeta }})</span>
        </div>
        <!-- Hiển thị mẹ đẻ nếu thành viên này sinh ra từ một bà vợ cụ thể của đời trước -->
        <div v-if="node.motherName && !node.spouses?.length" class="text-[9.5px] text-kyn-text-subtitle mt-0.5 italic truncate max-w-full">
          Mẹ: {{ node.motherName }}
        </div>
      </div>

      <!-- CAD TABLE: Tầng 2 (Hàng Phối Ngẫu - Các bà vợ hiển thị gộp theo card của chồng) -->
      <div
        v-if="node.spouses && node.spouses.length > 0"
        class="w-full flex-1 min-h-0 bg-kyn-bg-secondary-1/80 rounded-b-[5px] overflow-hidden flex flex-col justify-center"
      >
        <!-- TH 1 Vợ: Hiển thị gọn gàng trên 2 dòng, đầy đủ danh hiệu, họ tên, ngày giỗ âm, nơi an táng -->
        <div
          v-if="node.spouses.length === 1"
          class="px-2 py-1 text-center flex flex-col items-center justify-center min-w-0 h-full overflow-hidden w-full cursor-pointer hover:bg-kyn-bg-secondary-2/50 transition-colors"
          :title="getSpouseTooltip(node.spouses[0])"
        >
          <div class="flex items-center justify-center gap-1.5 w-full min-w-0 leading-tight">
            <span
              class="w-1.5 h-1.5 rounded-full inline-block flex-none"
              :class="node.spouses[0].isAlive ? 'bg-kyn-success-primary' : 'bg-kyn-warning-primary'"
              :title="node.spouses[0].isAlive ? 'Còn sống' : 'Đã tạ thế'"
            ></span>
            <span
              v-if="node.spouses[0].title && node.spouses[0].title !== 'Vợ'"
              class="text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase flex-none tracking-wider"
              :class="getSpouseBadgeClass(node.spouses[0].title)"
            >
              {{ node.spouses[0].title }}
            </span>
            <span
              v-else
              class="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase flex-none"
            >
              Vợ:
            </span>
            <span class="font-bold text-[11px] sm:text-[11.5px] tracking-wide uppercase text-kyn-text-title truncate">
              {{ node.spouses[0].fullName }}
            </span>
          </div>

          <div
            v-if="formatSpouseMeta(node.spouses[0])"
            class="italic font-medium text-[9px] sm:text-[9.5px] text-kyn-text-subtitle truncate w-full mt-0.5 leading-tight"
          >
            ({{ formatSpouseMeta(node.spouses[0]) }})
          </div>
        </div>

        <!-- TH Nhiều Vợ (> 1): Chia cột song song cho từng bà vợ, mỗi cột đầy đủ 3 dòng -->
        <div
          v-else
          class="w-full h-full grid divide-x divide-kyn-divider-dividers-2"
          :style="{ gridTemplateColumns: `repeat(${node.spouses.length}, minmax(0, 1fr))` }"
        >
          <div
            v-for="sp in node.spouses"
            :key="sp.id"
            class="px-1.5 py-1 text-center flex flex-col items-center justify-center min-w-0 h-full overflow-hidden hover:bg-kyn-bg-secondary-2/50 transition-colors"
            :title="getSpouseTooltip(sp)"
          >
            <!-- Hàng 1: Alive dot + Badge danh hiệu -->
            <div class="flex items-center justify-center gap-1 mb-0.5 flex-none leading-none">
              <span
                class="w-1.5 h-1.5 rounded-full inline-block flex-none"
                :class="sp.isAlive ? 'bg-kyn-success-primary' : 'bg-kyn-warning-primary'"
                :title="sp.isAlive ? 'Còn sống' : 'Đã tạ thế'"
              ></span>
              <span
                v-if="sp.title"
                class="text-[8px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider flex-none"
                :class="getSpouseBadgeClass(sp.title)"
              >
                {{ sp.title }}
              </span>
            </div>

            <!-- Hàng 2: Tên người vợ in hoa đậm -->
            <div class="font-bold text-[10.5px] sm:text-[11px] tracking-wide uppercase text-kyn-text-title truncate w-full leading-tight">
              {{ sp.fullName }}
            </div>

            <!-- Hàng 3: Ngày mất / An táng trong ngoặc đơn in nghiêng -->
            <div
              v-if="formatSpouseMeta(sp)"
              class="italic font-medium text-[8.5px] sm:text-[9px] text-kyn-text-subtitle truncate w-full mt-0.5 leading-tight"
            >
              ({{ formatSpouseMeta(sp) }})
            </div>
          </div>
        </div>
      </div>

      <!-- Collapse / Expand toggle button -->
      <button
        v-if="hasChildren"
        class="oc-toggle"
        :class="{ 'oc-toggle--collapsed': collapsed }"
        type="button"
        :title="collapsed ? 'Mở nhánh con' : 'Thu gọn nhánh con'"
        @click.stop="handleToggleCollapse"
      >
        <KynIcon :name="collapsed ? 'chevron-right' : 'chevron-down'" :size="10" />
        <span class="text-[9px] font-semibold ml-0.5 tabular-nums">{{ children.length }}</span>
      </button>
    </div>

    <!-- Recursive children branch -->
    <ul v-if="hasChildren && !collapsed" class="oc-ul">
      <FamilyOrgNode v-for="child in children" :key="child.id" :node="child" />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, onBeforeUnmount } from 'vue'
import { KynIcon } from '@kyn/vue-components'
import type { FamilyMember, SpouseInfo } from '../../types/family'
import { FAMILY_CHART_CTX, type FamilyChartCtx } from './chartCtx'
import { getGenerationStyle } from '../../data/generationStyles'

const props = defineProps<{
  node: FamilyMember
}>()

const ctx = inject(FAMILY_CHART_CTX) as FamilyChartCtx

const isSelected = computed(() => ctx.selectedMemberId.value === props.node.id)
const onPath = computed(() => ctx.bloodlinePathIds.value.has(props.node.id))
const collapsed = computed(() => ctx.collapsedIds.value.has(props.node.id))

const children = computed(() => props.node.children ?? [])
const hasChildren = computed(() => children.value.length > 0)
const genStyle = computed(() => getGenerationStyle(props.node.generation))

const showMenu = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function handleDocClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showMenu.value = false
  }
}

watch(showMenu, (isOpen) => {
  if (isOpen) {
    window.addEventListener('pointerdown', handleDocClick)
  } else {
    window.removeEventListener('pointerdown', handleDocClick)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', handleDocClick)
})

// Chiều rộng thẻ node tự động co giãn theo số lượng vợ chuẩn đồ họa CAD
const boxWidth = computed(() => {
  const count = props.node.spouses?.length || 0
  if (count === 0) return 195
  if (count === 1) return 240
  if (count === 2) return 360
  if (count === 3) return 510
  return Math.max(510, count * 170)
})

// Chuỗi thông tin của thành viên chính theo chuẩn CAD gia phả:
// Ví dụ: "02-04-73 Mảnh Nội" hoặc "1890-1973 Mảnh Nội" hoặc "sn 1985 Hà Nội"
const memberMeta = computed(() => {
  const n = props.node
  const parts: string[] = []

  if (!n.isAlive) {
    let dateStr = ''
    if (n.deathDateLunar) {
      // Đổi 02/04 thành 02-04
      const lunar = n.deathDateLunar.replace(/\s*Âm\s*lịch/i, '').trim().replace(/\//g, '-')
      dateStr = lunar
      if (n.deathDate) {
        const yr = String(n.deathDate).trim()
        const shortYr = yr.length === 4 ? yr.slice(-2) : yr
        dateStr += `-${shortYr}`
      }
    } else if (n.birthDate || n.deathDate) {
      dateStr = `${n.birthDate || '?'}-${n.deathDate || '?'}`
    }

    if (dateStr) parts.push(dateStr)

    if (n.burialPlace) {
      // Lấy tên khu mộ / địa điểm gọn gàng
      const place = n.burialPlace.split(',')[0].trim()
      parts.push(place)
    }
  } else {
    if (n.birthDate) parts.push(`sn ${n.birthDate}`)
    if (n.address) {
      const addr = n.address.split(',')[0].trim()
      parts.push(addr)
    }
  }

  return parts.join(' ')
})

// Chuỗi thông tin của người vợ theo chuẩn CAD gia phả:
// Ví dụ: "28-03 Đống Do", "16-11 Đống Do", "16-10 Đống Do"
function formatSpouseMeta(sp: SpouseInfo): string {
  const parts: string[] = []

  if (!sp.isAlive) {
    let dateStr = ''
    if (sp.deathDateLunar) {
      const lunar = sp.deathDateLunar.replace(/\s*Âm\s*lịch/i, '').trim().replace(/\//g, '-')
      dateStr = lunar
      if (sp.deathYear) {
        const yr = String(sp.deathYear).trim()
        const shortYr = yr.length === 4 ? yr.slice(-2) : yr
        dateStr += `-${shortYr}`
      }
    } else if (sp.birthYear || sp.deathYear) {
      dateStr = `${sp.birthYear || '?'}-${sp.deathYear || '?'}`
    }

    if (dateStr) parts.push(dateStr)

    if (sp.burialPlace) {
      const place = sp.burialPlace.split(',')[0].trim()
      parts.push(place)
    }
    if (sp.origin) {
      const orig = sp.origin.split(',')[0].trim()
      if (!parts.includes(orig) && !sp.burialPlace?.includes(orig)) {
        parts.push(orig)
      }
    }
  } else {
    if (sp.birthYear) parts.push(`sn ${sp.birthYear}`)
    if (sp.origin) {
      const orig = sp.origin.split(',')[0].trim()
      parts.push(orig)
    }
  }

  return parts.join(' ')
}

function getSpouseTooltip(sp: SpouseInfo): string {
  const lines: string[] = []
  const titleStr = sp.title ? `[${sp.title}] ` : 'Phối ngẫu: '
  lines.push(`${titleStr}${sp.fullName}`)
  lines.push(`Trạng thái: ${sp.isAlive ? 'Còn sống' : 'Đã tạ thế'}`)
  if (sp.birthYear) lines.push(`Năm sinh: ${sp.birthYear}`)
  if (sp.deathYear) lines.push(`Năm mất: ${sp.deathYear}`)
  if (sp.deathDateLunar) lines.push(`Ngày giỗ (Âm lịch): ${sp.deathDateLunar}`)
  if (sp.burialPlace) lines.push(`Nơi an táng: ${sp.burialPlace}`)
  if (sp.origin) lines.push(`Quê quán: ${sp.origin}`)
  if (sp.bio) lines.push(`Tiểu sử / Ghi chú: ${sp.bio}`)
  return lines.join('\n')
}

function handleMenuAction(action: 'view' | 'addChild' | 'addSpouse' | 'edit' | 'delete') {
  showMenu.value = false
  if (action === 'view') ctx.onViewDetail(props.node)
  else if (action === 'addChild') ctx.onAddChild(props.node)
  else if (action === 'addSpouse') ctx.onAddSpouse(props.node)
  else if (action === 'edit') ctx.onEdit(props.node)
  else if (action === 'delete') ctx.onDelete(props.node)
}

function handleToggleCollapse() {
  ctx.onToggleCollapse(props.node.id)
  ctx.onSelect(props.node)
}

function getSpouseBadgeClass(title?: string) {
  if (!title) return 'bg-kyn-bg-secondary-2 text-kyn-text-secondary border border-kyn-divider-dividers-2'
  const t = title.toLowerCase()
  if (t.includes('bà cả') || t.includes('chính thất') || t.includes('nguyên phối')) {
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold'
  }
  if (t.includes('bà hai') || t.includes('kế thất') || t.includes('bà kế')) {
    return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-bold'
  }
  if (t.includes('bà ba') || t.includes('trắc thất')) {
    return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold'
  }
  if (t.includes('bà tư') || t.includes('bà năm') || t.includes('thứ thất') || t.includes('vợ lẽ') || t.includes('á thất')) {
    return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold'
  }
  if (t === 'vợ' || t.includes('hiền thê')) {
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold'
  }
  return 'bg-kyn-bg-secondary-2 text-kyn-text-secondary border border-kyn-divider-dividers-2'
}
</script>

<style>
/* Cây phả hệ CSS kế thừa từ KynOrgChart với token động theo Theme */
.family-orgchart {
  --kyn-org-connector: var(--color-kyn-neutral-6, #8c8c8c);
  --kyn-org-border: var(--color-kyn-card-border, #e7e7e4);
  --kyn-org-accent: var(--color-kyn-primary, #f9c216);
}

.family-orgchart,
.family-orgchart .oc-ul {
  display: flex;
  padding-top: 26px;
  position: relative;
}

.family-orgchart {
  justify-content: flex-start;
  padding-top: 0;
}

.family-orgchart .oc-ul {
  justify-content: center;
}

.family-orgchart .oc-li {
  list-style: none;
  position: relative;
  padding: 26px 14px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Đường nối phụ hệ / nhánh cây */
.family-orgchart .oc-li::before,
.family-orgchart .oc-li::after {
  content: '';
  position: absolute;
  top: 0;
  right: 50%;
  width: 50%;
  height: 26px;
  border-top: 2px solid var(--kyn-org-connector);
}

.family-orgchart .oc-li::after {
  right: auto;
  left: 50%;
  border-left: 2px solid var(--kyn-org-connector);
}

.family-orgchart .oc-li:only-child::before,
.family-orgchart .oc-li:only-child::after {
  display: none;
}

.family-orgchart .oc-li:only-child {
  padding-top: 26px;
}

.family-orgchart .oc-ul > .oc-li:only-child::after {
  display: block;
  width: 0;
  border-top: 0 none;
  border-radius: 0;
  border-left: 2px solid var(--kyn-org-connector);
}

.family-orgchart .oc-li:first-child::before,
.family-orgchart .oc-li:last-child::after {
  border: 0 none;
}

.family-orgchart .oc-li:last-child::before {
  border-right: 2px solid var(--kyn-org-connector);
  border-radius: 0 8px 0 0;
}

.family-orgchart .oc-li:first-child::after {
  border-radius: 8px 0 0 0;
}

.family-orgchart .oc-ul::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 26px;
  border-left: 2px solid var(--kyn-org-connector);
}

/* Gốc Thủy tổ */
.family-orgchart > .oc-li::before,
.family-orgchart > .oc-li::after {
  display: none;
}

.family-orgchart > .oc-li {
  padding-top: 0;
}

/* Thẻ thành viên Gia Phả chuẩn CAD: Chiều cao hàng đồng nhất chuẩn 96px */
.family-orgchart .oc-box {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  height: 96px;
  min-height: 96px;
  max-height: 96px;
  padding: 0;
  border-radius: 6px;
  border: 1.5px solid var(--kyn-org-border);
  background: var(--color-kyn-bg-primary);
  color: var(--color-kyn-text-title);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.family-orgchart .oc-box--single,
.family-orgchart .oc-box--with-spouse {
  height: 96px;
  min-height: 96px;
  max-height: 96px;
}

/* Nâng toàn bộ nhánh và thẻ khi mở menu thao tác ⋯ để không bao giờ bị đè */
.family-orgchart .oc-li.oc-li--menu-open,
.family-orgchart .oc-li:has(> .oc-box--menu-open),
.family-orgchart .oc-li:has(.oc-li--menu-open) {
  z-index: 100;
}

.family-orgchart .oc-box.oc-box--menu-open {
  z-index: 100 !important;
}

.family-orgchart .oc-box:hover {
  border-color: var(--node-accent, var(--kyn-org-accent));
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.family-orgchart .oc-box--path {
  border-color: var(--kyn-org-accent);
  box-shadow: 0 0 0 2px rgba(249, 194, 22, 0.35);
}

.family-orgchart .oc-box--selected {
  border-color: var(--kyn-org-accent) !important;
  border-width: 2px;
  box-shadow: 0 0 0 3px rgba(249, 194, 22, 0.4), 0 8px 18px -2px rgba(0, 0, 0, 0.2) !important;
  transform: translateY(-2px);
}

@keyframes oc-pulse-focus {
  0% {
    box-shadow: 0 0 0 0 rgba(249, 194, 22, 0.9), 0 8px 24px rgba(249, 194, 22, 0.5);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(249, 194, 22, 0.45), 0 14px 32px rgba(249, 194, 22, 0.6);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(249, 194, 22, 0.4), 0 8px 18px -2px rgba(0, 0, 0, 0.2);
    transform: scale(1);
  }
}

.family-orgchart .oc-box.oc-box--pulse {
  animation: oc-pulse-focus 0.9s ease-in-out 3;
  z-index: 10 !important;
}

.family-orgchart .oc-box--deceased {
  opacity: 0.95;
}

/* Mũi tên CAD chỉ từ nhánh trên xuống đỉnh giữa hộp */
.family-orgchart .oc-box-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid var(--kyn-org-connector);
  z-index: 4;
  pointer-events: none;
}

/* Nút thu gọn / mở nhánh đè lên đầu đường nối */
.family-orgchart .oc-toggle {
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  height: 19px;
  padding: 0 6px;
  border-radius: 999px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-kyn-text-secondary);
  background: var(--color-kyn-bg-primary);
  border: 1.5px solid var(--kyn-org-connector);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
}

.family-orgchart .oc-toggle:hover {
  border-color: var(--kyn-org-accent);
  color: var(--kyn-org-accent);
  background: var(--color-kyn-primary-tag-bg);
}

.family-orgchart .oc-toggle--collapsed {
  border-color: var(--kyn-org-accent);
  background: var(--color-kyn-primary-tag-bg);
  color: var(--color-kyn-text-title);
  font-weight: 700;
  box-shadow: 0 0 0 2px rgba(249, 194, 22, 0.3);
}
</style>
