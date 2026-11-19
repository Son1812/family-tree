<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
    <!-- Header & Bộ lọc -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-800 font-serif">Danh Sách Thành Viên Phả Ký</h2>
        <p class="text-xs text-slate-500">Tra cứu thông tin chi tiết, thế hệ, mộ phần và ngày giỗ</p>
      </div>

      <!-- Thanh công cụ tìm kiếm và lọc -->
      <div class="flex flex-wrap items-center gap-2.5">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm theo tên, năm sinh..."
            class="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-amber-600 outline-none w-52 bg-slate-50/50"
          />
          <span class="absolute left-2.5 top-1.5 text-slate-400 text-xs">🔍</span>
        </div>

        <!-- Lọc theo đời -->
        <select
          v-model="selectedGen"
          class="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 outline-none"
        >
          <option :value="null">Tất cả thế hệ (Đời)</option>
          <option v-for="g in maxGen" :key="g" :value="g">Đời thứ {{ g }}</option>
        </select>

        <!-- Lọc theo chi -->
        <select
          v-model="selectedBranch"
          class="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 outline-none"
        >
          <option :value="null">Tất cả chi phái</option>
          <option v-for="b in branches" :key="b" :value="b">{{ b }}</option>
        </select>

        <!-- Lọc tình trạng -->
        <select
          v-model="selectedStatus"
          class="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 outline-none"
        >
          <option value="all">Tất cả tình trạng</option>
          <option value="alive">Còn sống</option>
          <option value="deceased">Đã quy tiên</option>
        </select>
      </div>
    </div>

    <!-- Bảng danh sách -->
    <div class="overflow-x-auto rounded-xl border border-slate-200">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
          <tr>
            <th class="py-3 px-4">Thành viên</th>
            <th class="py-3 px-3">Thế hệ</th>
            <th class="py-3 px-3">Chi phái</th>
            <th class="py-3 px-3">Vai vế</th>
            <th class="py-3 px-3">Năm sinh – mất</th>
            <th class="py-3 px-3">Ngày giỗ (ÂL)</th>
            <th class="py-3 px-3">Phối ngẫu</th>
            <th class="py-3 px-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="m in filteredMembers"
            :key="m.id"
            class="hover:bg-amber-50/40 transition-colors"
          >
            <!-- Tên & Giới tính -->
            <td class="py-3 px-4">
              <div class="flex items-center gap-2.5">
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] flex-none border"
                  :class="
                    m.gender === 'male'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  "
                >
                  {{ m.gender === 'male' ? 'Nam' : 'Nữ' }}
                </span>
                <div>
                  <div class="font-bold text-slate-800 text-[13px] hover:text-amber-900 cursor-pointer" @click="$emit('viewDetail', m)">
                    {{ m.fullName }}
                  </div>
                  <div v-if="m.courtesyName" class="text-[11px] text-amber-800 italic">
                    {{ m.courtesyName }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Đời -->
            <td class="py-3 px-3">
              <span
                class="px-2 py-0.5 rounded-full font-bold text-[10px]"
                :style="{
                  background: getGenStyle(m.generation).bgColor,
                  color: getGenStyle(m.generation).color,
                }"
              >
                {{ getGenStyle(m.generation).roman }}
              </span>
            </td>

            <!-- Chi -->
            <td class="py-3 px-3 font-medium text-slate-700">
              {{ m.branch }}
            </td>

            <!-- Vai vế -->
            <td class="py-3 px-3 text-slate-600">
              {{ m.orderTitle || '—' }}
            </td>

            <!-- Năm sinh - mất -->
            <td class="py-3 px-3 text-slate-600">
              <span>{{ m.birthDate || '?' }}</span> –
              <span :class="m.isAlive ? 'text-emerald-700 font-semibold' : ''">
                {{ m.isAlive ? 'Còn sống' : (m.deathDate || '?') }}
              </span>
            </td>

            <!-- Ngày giỗ -->
            <td class="py-3 px-3">
              <span
                v-if="!m.isAlive && m.deathDateLunar"
                class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px]"
              >
                {{ m.deathDateLunar }}
              </span>
              <span v-else class="text-slate-400">—</span>
            </td>

            <!-- Phối ngẫu -->
            <td class="py-3 px-3 text-slate-600">
              <div v-if="m.spouses && m.spouses.length > 0" class="flex flex-col gap-0.5">
                <span v-for="sp in m.spouses" :key="sp.id" class="text-[11px]">
                  {{ sp.fullName }}
                </span>
              </div>
              <span v-else class="text-slate-400">—</span>
            </td>

            <!-- Thao tác -->
            <td class="py-3 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  class="px-2 py-1 rounded bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-semibold transition-colors"
                  title="Định vị trên sơ đồ phả hệ"
                  @click="$emit('locateOnTree', m.id)"
                >
                  Cây 🌳
                </button>
                <button
                  type="button"
                  class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Xem hồ sơ"
                  @click="$emit('viewDetail', m)"
                >
                  Xem
                </button>
                <button
                  type="button"
                  class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Sửa"
                  @click="$emit('edit', m)"
                >
                  Sửa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredMembers.length === 0" class="py-12 text-center text-slate-400 text-sm">
        Không tìm thấy thành viên nào phù hợp với bộ lọc
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FamilyMember } from '../types/family'
import { useFamilyTree } from '../composables/useFamilyTree'
import { getGenerationStyle } from '../data/generationStyles'

defineEmits<{
  viewDetail: [member: FamilyMember]
  edit: [member: FamilyMember]
  locateOnTree: [memberId: string]
}>()

const { flatMembers, stats } = useFamilyTree()

const searchQuery = ref('')
const selectedGen = ref<number | null>(null)
const selectedBranch = ref<string | null>(null)
const selectedStatus = ref<'all' | 'alive' | 'deceased'>('all')

const maxGen = computed(() => stats.value.generations)
const branches = computed(() => stats.value.branches)

function getGenStyle(gen: number) {
  return getGenerationStyle(gen)
}

const filteredMembers = computed(() => {
  return flatMembers.value.filter((m) => {
    // Tìm kiếm
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchName = m.fullName.toLowerCase().includes(q)
      const matchAlias = m.courtesyName?.toLowerCase().includes(q)
      const matchYear = m.birthDate?.includes(q) || m.deathDate?.includes(q)
      const matchSpouse = m.spouses?.some((s) => s.fullName.toLowerCase().includes(q))
      if (!matchName && !matchAlias && !matchYear && !matchSpouse) return false
    }

    // Lọc theo thế hệ
    if (selectedGen.value !== null && m.generation !== selectedGen.value) {
      return false
    }

    // Lọc theo chi
    if (selectedBranch.value !== null && m.branch !== selectedBranch.value) {
      return false
    }

    // Lọc tình trạng
    if (selectedStatus.value === 'alive' && !m.isAlive) return false
    if (selectedStatus.value === 'deceased' && m.isAlive) return false

    return true
  })
})
</script>
