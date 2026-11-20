<template>
  <li class="oc-li">
    <div
      class="oc-box group"
      :class="{
        'oc-box--selected': isSelected,
        'oc-box--path': onPath && !isSelected,
        'oc-box--deceased': !node.isAlive,
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
      <div class="flex items-center justify-between gap-1 w-full text-[11px] font-medium px-2.5 py-1 bg-kyn-bg-secondary-2/80 border-b border-kyn-divider-dividers-2 rounded-t-[5px] select-none">
        <div class="flex items-center gap-1.5 min-w-0">
          <span
            class="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wide flex-none"
            :style="{ background: genStyle.bgColor, color: genStyle.color }"
          >
            {{ genStyle.roman }}
          </span>
          <span v-if="node.orderTitle" class="text-amber-600 dark:text-amber-400 text-[10.5px] font-medium truncate">
            {{ node.orderTitle }}
          </span>
        </div>

        <div class="flex items-center gap-1.5 flex-none" @click.stop>
          <!-- Small alive/deceased status indicator dot -->
          <span
            class="w-2 h-2 rounded-full inline-block"
            :class="node.isAlive ? 'bg-kyn-success-primary' : 'bg-kyn-warning-primary'"
            :title="node.isAlive ? 'Còn sống' : 'Đã tạ thế'"
          ></span>

          <!-- Action menu button -->
          <div class="relative">
            <button
              type="button"
              class="w-5 h-5 rounded hover:text-kyn-text-title hover:bg-kyn-bg-secondary-1 flex items-center justify-center transition-colors text-xs cursor-pointer text-kyn-text-subtitle"
              title="Thao tác"
              @click="showMenu = !showMenu"
            >
              ⋯
            </button>

            <!-- Dropdown menu -->
            <div
              v-if="showMenu"
              class="absolute right-0 top-6 w-40 bg-kyn-bg-primary rounded-lg shadow-xl border border-kyn-divider-dividers-2 py-1.5 z-50 text-xs text-kyn-text-primary text-left"
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
      <div class="w-full px-3 py-2 bg-kyn-bg-primary text-center select-text" :class="{ 'rounded-b-[5px]': !node.spouses?.length }">
        <div class="font-bold text-[13.5px] sm:text-[14.5px] tracking-wide text-kyn-text-title uppercase leading-snug">
          {{ node.fullName }}<span v-if="memberMeta" class="font-normal italic text-[12px] sm:text-[12.5px] text-kyn-text-subtitle ml-1">({{ memberMeta }})</span>
        </div>
        <!-- Hiển thị mẹ đẻ nếu thành viên này sinh ra từ một bà vợ cụ thể của đời trước -->
        <div v-if="node.motherName" class="text-[10px] text-kyn-text-subtitle mt-0.5 italic">
          Mẹ: {{ node.motherName }}
        </div>
      </div>

      <!-- CAD TABLE: Tầng 2 (Hàng Các Bà Vợ / Phối Ngẫu) -->
      <div
        v-if="node.spouses && node.spouses.length > 0"
        class="w-full grid divide-x divide-kyn-divider-dividers-2 border-t border-kyn-divider-dividers-2 bg-kyn-bg-secondary-1/80 rounded-b-[5px]"
        :style="{ gridTemplateColumns: `repeat(${node.spouses.length}, minmax(0, 1fr))` }"
      >
        <div
          v-for="sp in node.spouses"
          :key="sp.id"
          class="px-2 py-1.5 text-center flex flex-col items-center justify-center min-w-0"
        >
          <!-- Badge danh hiệu thê thiếp (Chính thất, Kế thất, Trắc thất) -->
          <span
            v-if="sp.title"
            class="text-[9px] font-bold px-1.5 py-0.2 rounded mb-0.5 tracking-wider uppercase flex-none"
            :class="getSpouseBadgeClass(sp.title)"
          >
            {{ sp.title }}
          </span>

          <!-- Tên người vợ in hoa đậm -->
          <div class="font-bold text-[12px] sm:text-[13px] tracking-wide uppercase text-kyn-text-title truncate w-full" :title="sp.fullName">
            {{ sp.fullName }}
          </div>

          <!-- Ngày mất / An táng trong ngoặc đơn in nghiêng -->
          <div
            v-if="formatSpouseMeta(sp)"
            class="italic font-medium text-[10.5px] sm:text-[11.5px] text-kyn-text-subtitle mt-0.5 truncate w-full"
            :title="formatSpouseMeta(sp)"
          >
            ({{ formatSpouseMeta(sp) }})
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
        <KynIcon :name="collapsed ? 'chevron-right' : 'chevron-down'" :size="11" />
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
import { computed, inject, ref } from 'vue'
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

// Chiều rộng thẻ node tự động co giãn theo số lượng vợ chuẩn đồ họa CAD
const boxWidth = computed(() => {
  const count = props.node.spouses?.length || 0
  if (count <= 1) return 260
  if (count === 2) return 360
  if (count === 3) return 480
  return Math.max(480, count * 155)
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
    } else if (sp.origin) {
      const orig = sp.origin.split(',')[0].trim()
      parts.push(orig)
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

/* Thẻ thành viên Gia Phả chuẩn CAD */
.family-orgchart .oc-box {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 72px;
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
  bottom: -11px;
  transform: translateX(-50%);
  height: 20px;
  padding: 0 7px;
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
