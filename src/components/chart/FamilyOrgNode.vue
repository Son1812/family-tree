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
      :style="{ '--node-accent': genStyle.color }"
      @click="ctx.onSelect(node)"
    >
      <!-- Top accent stripe for Generation -->
      <div
        class="absolute top-0 left-0 right-0 h-1.5 rounded-t-[10px]"
        :style="{ background: genStyle.color }"
      ></div>

      <!-- Header row: Generation badge & Branch tag -->
      <div class="flex items-center justify-between gap-1 w-full text-[11px] font-medium pt-0.5">
        <span
          class="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
          :style="{ background: genStyle.bgColor, color: genStyle.color }"
        >
          {{ genStyle.roman }}
        </span>
        <span class="text-slate-500 font-sans text-[11px] truncate" :title="node.branch">
          {{ node.branch }}
        </span>
      </div>

      <!-- Primary Member Info -->
      <div class="flex items-start gap-2.5 w-full mt-1.5">
        <!-- Avatar / Gender badge -->
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-none shadow-sm relative border"
          :class="[
            node.gender === 'male'
              ? 'bg-sky-50 text-sky-800 border-sky-200'
              : 'bg-rose-50 text-rose-800 border-rose-200',
          ]"
        >
          <img
            v-if="node.avatar"
            :src="node.avatar"
            :alt="node.fullName"
            class="w-full h-full object-cover rounded-full"
          />
          <span v-else>{{ node.gender === 'male' ? 'Ông' : 'Bà' }}</span>

          <!-- Small alive/deceased status indicator dot -->
          <span
            class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
            :class="node.isAlive ? 'bg-emerald-500' : 'bg-amber-600'"
            :title="node.isAlive ? 'Còn sống' : 'Đã tạ thế'"
          ></span>
        </div>

        <!-- Name & Details -->
        <div class="flex-1 min-w-0 text-left">
          <div class="flex items-baseline gap-1">
            <h4
              class="font-bold text-[13.5px] leading-tight text-slate-800 truncate group-hover:text-amber-900 transition-colors"
              :title="node.fullName"
            >
              {{ node.fullName }}
            </h4>
          </div>

          <div v-if="node.orderTitle" class="text-[11px] font-medium text-amber-800 mt-0.5">
            {{ node.orderTitle }}
          </div>

          <!-- Lifespan years & Lunar death date -->
          <div class="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1">
            <span v-if="node.birthDate || node.deathDate">
              {{ node.birthDate || '?' }} – {{ node.isAlive ? 'nay' : (node.deathDate || '?') }}
            </span>
            <span
              v-if="!node.isAlive && node.deathDateLunar"
              class="text-amber-700 bg-amber-50 px-1 rounded text-[10px] font-medium"
              :title="'Ngày giỗ: ' + node.deathDateLunar + ' Âm lịch'"
            >
              Giỗ {{ node.deathDateLunar }}
            </span>
          </div>
        </div>

        <!-- Action menu button -->
        <div class="relative flex-none" @click.stop>
          <button
            type="button"
            class="w-6 h-6 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors text-xs"
            title="Thao tác"
            @click="showMenu = !showMenu"
          >
            ⋯
          </button>

          <!-- Dropdown menu -->
          <div
            v-if="showMenu"
            class="absolute right-0 top-7 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs text-slate-700"
          >
            <button
              class="w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
              @click="handleMenuAction('view')"
            >
              <span>👁</span> Xem chi tiết
            </button>
            <button
              class="w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
              @click="handleMenuAction('addChild')"
            >
              <span>➕</span> Thêm con
            </button>
            <button
              class="w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
              @click="handleMenuAction('addSpouse')"
            >
              <span>💍</span> Thêm phối ngẫu
            </button>
            <button
              class="w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
              @click="handleMenuAction('edit')"
            >
              <span>✏️</span> Sửa thông tin
            </button>
            <hr class="my-1 border-slate-100" />
            <button
              class="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
              @click="handleMenuAction('delete')"
            >
              <span>🗑️</span> Xóa thành viên
            </button>
          </div>
        </div>
      </div>

      <!-- Spouses Row (Phối ngẫu / Vợ hoặc Chồng) -->
      <div
        v-if="node.spouses && node.spouses.length > 0"
        class="w-full mt-2 pt-1.5 border-t border-slate-100 text-left"
      >
        <div
          v-for="sp in node.spouses"
          :key="sp.id"
          class="flex items-center gap-1.5 text-[11px] text-slate-600 py-0.5"
        >
          <span class="text-slate-400">💍</span>
          <span class="font-medium text-slate-700 truncate" :title="sp.fullName">
            {{ sp.title ? sp.title + ':' : 'Vợ:' }} {{ sp.fullName }}
          </span>
          <span v-if="sp.birthYear || sp.deathYear" class="text-slate-400 text-[10px]">
            ({{ sp.birthYear || '?' }}-{{ sp.isAlive ? 'nay' : (sp.deathYear || '?') }})
          </span>
          <span
            v-if="!sp.isAlive && sp.deathDateLunar"
            class="text-amber-700 text-[9px] bg-amber-50 px-1 rounded ml-auto"
            :title="'Ngày giỗ: ' + sp.deathDateLunar"
          >
            {{ sp.deathDateLunar }}
          </span>
        </div>
      </div>

      <!-- Collapse / Expand toggle button -->
      <button
        v-if="hasChildren"
        class="oc-toggle"
        type="button"
        :title="collapsed ? 'Mở nhánh con' : 'Thu gọn nhánh con'"
        @click.stop="ctx.onToggleCollapse(node.id)"
      >
        <span class="text-[10px]">{{ collapsed ? '▸' : '▾' }}</span>
        <span class="text-[9px] font-medium ml-0.5 font-sans">{{ children.length }}</span>
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
import type { FamilyMember } from '../../types/family'
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

function handleMenuAction(action: 'view' | 'addChild' | 'addSpouse' | 'edit' | 'delete') {
  showMenu.value = false
  if (action === 'view') ctx.onViewDetail(props.node)
  else if (action === 'addChild') ctx.onAddChild(props.node)
  else if (action === 'addSpouse') ctx.onAddSpouse(props.node)
  else if (action === 'edit') ctx.onEdit(props.node)
  else if (action === 'delete') ctx.onDelete(props.node)
}
</script>

<style>
/* Cây phả hệ CSS kế thừa và nâng tầm từ KynOrgChart */
.family-orgchart {
  --kyn-org-connector: #94a3b8;
  --kyn-org-border: #e2e8f0;
  --kyn-org-accent: #b45309;
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

/* Thẻ thành viên Gia Phả */
.family-orgchart .oc-box {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  width: 220px;
  min-height: 98px;
  padding: 10px 12px 14px;
  border-radius: 12px;
  border: 1.5px solid var(--kyn-org-border);
  background: #ffffff;
  box-shadow: 0 2px 6px -1px rgba(0, 0, 0, 0.06), 0 1px 3px -1px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.family-orgchart .oc-box:hover {
  border-color: var(--node-accent, #b45309);
  box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.family-orgchart .oc-box--path {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
}

.family-orgchart .oc-box--selected {
  border-color: #b45309 !important;
  border-width: 2px;
  background: #fffbeb;
  box-shadow: 0 0 0 3px rgba(180, 83, 9, 0.3), 0 10px 20px -3px rgba(180, 83, 9, 0.15) !important;
  transform: translateY(-2px);
}

.family-orgchart .oc-box--deceased {
  background: #fdfdfd;
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
  color: #64748b;
  background: #ffffff;
  border: 1.5px solid var(--kyn-org-connector);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease;
}

.family-orgchart .oc-toggle:hover {
  border-color: #b45309;
  color: #b45309;
  background: #fffbeb;
}
</style>
