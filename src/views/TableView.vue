<template>
  <div class="bg-kyn-bg-primary rounded-kyn-4 border border-kyn-divider-dividers-2 shadow-xs p-4 sm:p-5 flex flex-col gap-3.5 transition-colors duration-200 h-[calc(100vh-200px)] min-h-[540px]">
    <!-- Header & Bộ lọc -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-none">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-base sm:text-lg font-bold text-kyn-text-title">Danh Sách Thành Viên Phả Ký</h2>
          <span class="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            {{ totalMembers }} người
          </span>
        </div>
        <p class="text-xs text-kyn-text-subtitle mt-0.5">Tra cứu thông tin chi tiết, thế hệ, mộ phần và ngày giỗ</p>
      </div>

      <!-- Thanh công cụ tìm kiếm và lọc -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm theo tên, năm sinh..."
            class="pl-8 pr-3 py-1.5 text-xs rounded-kyn-2 border border-kyn-divider-dividers-2 focus:border-kyn-primary focus:ring-1 focus:ring-kyn-primary outline-none w-48 sm:w-56 bg-kyn-bg-secondary-2 text-kyn-text-title placeholder:text-kyn-text-subtitle transition-all"
          />
          <span class="absolute left-2.5 top-2 text-kyn-icon-tertiary">
            <KynIcon name="search" :size="14" />
          </span>
        </div>

        <!-- Lọc theo đời -->
        <select
          v-model="selectedGen"
          class="px-2.5 py-1.5 text-xs rounded-kyn-2 border border-kyn-divider-dividers-2 bg-kyn-bg-secondary-2 text-kyn-text-title outline-none focus:border-kyn-primary cursor-pointer"
        >
          <option :value="null">Tất cả thế hệ (Đời)</option>
          <option v-for="g in maxGen" :key="g" :value="g">Đời thứ {{ g }}</option>
        </select>

        <!-- Lọc theo chi (chỉ hiện khi có nhiều chi) -->
        <select
          v-if="branches.length > 1"
          v-model="selectedBranch"
          class="px-2.5 py-1.5 text-xs rounded-kyn-2 border border-kyn-divider-dividers-2 bg-kyn-bg-secondary-2 text-kyn-text-title outline-none focus:border-kyn-primary cursor-pointer"
        >
          <option :value="null">Tất cả chi phái</option>
          <option v-for="b in branches" :key="b" :value="b">{{ b }}</option>
        </select>

        <!-- Lọc tình trạng -->
        <select
          v-model="selectedStatus"
          class="px-2.5 py-1.5 text-xs rounded-kyn-2 border border-kyn-divider-dividers-2 bg-kyn-bg-secondary-2 text-kyn-text-title outline-none focus:border-kyn-primary cursor-pointer"
        >
          <option value="all">Tất cả tình trạng</option>
          <option value="alive">Còn sống</option>
          <option value="deceased">Đã quy tiên</option>
        </select>
      </div>
    </div>

    <!-- Bảng danh sách - Chỉ cho phép cuộn bên trong vùng bảng -->
    <div class="flex-1 min-h-0 overflow-auto rounded-kyn-3 border border-kyn-divider-dividers-2 relative bg-kyn-bg-primary shadow-inner">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="sticky top-0 z-20 bg-kyn-bg-secondary-2 border-b border-kyn-divider-dividers-2 text-kyn-text-subtitle font-semibold uppercase tracking-wider text-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <tr>
            <th class="py-2.5 px-3 bg-kyn-bg-secondary-2 w-14 text-center">STT</th>
            <th class="py-2.5 px-4 bg-kyn-bg-secondary-2">Thành viên</th>
            <th class="py-2.5 px-3 bg-kyn-bg-secondary-2">Thế hệ</th>
            <th v-if="branches.length > 1" class="py-2.5 px-3 bg-kyn-bg-secondary-2">Chi phái</th>
            <th class="py-2.5 px-3 bg-kyn-bg-secondary-2">Vai vế</th>
            <th class="py-2.5 px-3 bg-kyn-bg-secondary-2">Sinh – Mất</th>
            <th class="py-2.5 px-3 bg-kyn-bg-secondary-2">Ngày giỗ (ÂL)</th>
            <th class="py-2.5 px-3 bg-kyn-bg-secondary-2">Phối ngẫu</th>
            <th class="py-2.5 px-4 text-right bg-kyn-bg-secondary-2">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-kyn-divider-dividers-1">
          <tr
            v-for="(m, idx) in paginatedMembers"
            :key="m.id"
            class="hover:bg-kyn-bg-secondary-1 transition-colors h-[52px]"
          >
            <!-- Số thứ tự (STT) -->
            <td class="py-2 px-3 text-center align-middle whitespace-nowrap">
              <span class="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 rounded-md font-mono text-[11.5px] font-bold tabular-nums bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {{ (currentPage - 1) * pageSize + idx + 1 }}
              </span>
            </td>

            <!-- Tên & Giới tính -->
            <td class="py-2 px-4 align-middle">
              <div class="flex items-center gap-2.5">
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] flex-none border"
                  :class="
                    m.gender === 'male'
                      ? 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  "
                >
                  {{ m.gender === 'male' ? 'Nam' : 'Nữ' }}
                </span>
                <div class="min-w-0">
                  <div
                    class="font-bold text-kyn-text-title text-[13px] hover:text-amber-600 cursor-pointer transition-colors truncate"
                    @click="emit('view-detail', m)"
                  >
                    {{ m.fullName }}
                  </div>
                  <div v-if="m.courtesyName" class="text-[11px] text-amber-600 italic truncate">
                    {{ m.courtesyName }}
                  </div>
                  <div v-if="m.motherName" class="text-[10.5px] text-kyn-text-subtitle italic truncate">
                    Mẹ: {{ m.motherName }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Đời -->
            <td class="py-2 px-3 align-middle">
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

            <!-- Chi (chỉ hiện khi có nhiều chi) -->
            <td v-if="branches.length > 1" class="py-2 px-3 font-medium text-kyn-text-primary align-middle whitespace-nowrap">
              {{ m.branch }}
            </td>

            <!-- Vai vế -->
            <td class="py-2 px-3 text-kyn-text-secondary align-middle whitespace-nowrap">
              {{ m.orderTitle || '—' }}
            </td>

            <!-- Năm sinh - mất -->
            <td class="py-2 px-3 text-kyn-text-secondary align-middle whitespace-nowrap">
              <span>{{ m.birthDate || '?' }}</span> –
              <span :class="m.isAlive ? 'text-emerald-600 font-semibold' : ''">
                {{ m.isAlive ? 'Còn sống' : (m.deathDate || '?') }}
              </span>
            </td>

            <!-- Ngày giỗ -->
            <td class="py-2 px-3 align-middle whitespace-nowrap">
              <span
                v-if="!m.isAlive && m.deathDateLunar"
                class="px-2 py-0.5 rounded-kyn-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[11px]"
              >
                {{ m.deathDateLunar }}
              </span>
              <span v-else class="text-kyn-text-disable">—</span>
            </td>

            <!-- Phối ngẫu -->
            <td class="py-2 px-3 text-kyn-text-secondary align-middle">
              <div v-if="m.spouses && m.spouses.length > 0" class="flex flex-wrap items-center gap-1.5">
                <span v-for="sp in m.spouses" :key="sp.id" class="text-[11px] inline-flex items-center gap-1">
                  <span class="text-[9.5px] px-1 py-0.2 rounded font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex-none">
                    {{ sp.title || 'Vợ' }}
                  </span>
                  <span class="font-medium text-kyn-text-title">{{ sp.fullName }}</span>
                </span>
              </div>
              <span v-else class="text-kyn-text-disable">—</span>
            </td>

            <!-- Thao tác -->
            <td class="py-2 px-4 text-right align-middle whitespace-nowrap">
              <div class="flex items-center justify-end gap-1.5">
                <AppButton
                  size="sm"
                  variant="secondary"
                  title="Định vị trên sơ đồ phả hệ"
                  @click="emit('locate-on-tree', m.id)"
                >
                  <KynIcon name="git-branch" :size="12" />
                  <span>Cây</span>
                </AppButton>
                <AppButton
                  size="sm"
                  variant="ghost"
                  title="Xem hồ sơ"
                  @click="emit('view-detail', m)"
                >
                  <KynIcon name="eye" :size="14" />
                </AppButton>
                <AppButton
                  size="sm"
                  variant="ghost"
                  title="Sửa"
                  @click="emit('edit', m)"
                >
                  <KynIcon name="pencil" :size="14" />
                </AppButton>
                <AppButton
                  size="sm"
                  variant="ghost"
                  title="Xóa thành viên"
                  class="text-kyn-error-primary hover:bg-kyn-error-tag-bg hover:text-kyn-error-pressed-active"
                  @click="emit('delete', m)"
                >
                  <KynIcon name="trash-2" :size="14" />
                </AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredMembers.length === 0" class="py-16 text-center text-kyn-text-subtitle text-sm">
        Không tìm thấy thành viên nào phù hợp với bộ lọc
      </div>
    </div>

    <!-- Thanh phân trang cố định ở chân bảng -->
    <div class="pt-2.5 border-t border-kyn-divider-dividers-2 flex-none">
      <AppPagination
        v-if="totalMembers > 0"
        :current-page="currentPage"
        :total="totalMembers"
        :page-size="pageSize"
        :page-size-options="[15, 25, 50, 100]"
        :show-page-size="true"
        :show-jump="true"
        :page-size-label="(size: number) => `${size} dòng/trang`"
        @change="(p: number) => currentPage = p"
        @update:current-page="(p: number) => currentPage = p"
        @page-size-change="handlePageSizeChange"
        @update:page-size="handlePageSizeChange"
      />
      <div v-else class="text-xs text-kyn-text-subtitle text-right">
        0 thành viên
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AppButton, AppPagination, KynIcon } from '@kyn/vue-components'
import type { FamilyMember } from '../types/family'
import { useFamilyTree } from '../composables/useFamilyTree'
import { getGenerationStyle } from '../data/generationStyles'

const emit = defineEmits<{
  (e: 'view-detail', member: FamilyMember): void
  (e: 'edit', member: FamilyMember): void
  (e: 'locate-on-tree', memberId: string): void
  (e: 'delete', member: FamilyMember): void
}>()

const { flatMembers, stats } = useFamilyTree()

const searchQuery = ref('')
const selectedGen = ref<number | null>(null)
const selectedBranch = ref<string | null>(null)
const selectedStatus = ref<'all' | 'alive' | 'deceased'>('all')

// Phân trang
const currentPage = ref(1)
const pageSize = ref(25)

const maxGen = computed(() => stats.value.generations)
const branches = computed(() => stats.value.branches)

function getGenStyle(gen: number) {
  return getGenerationStyle(gen)
}

function handlePageSizeChange(newSize: number) {
  pageSize.value = newSize
  currentPage.value = 1
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

const totalMembers = computed(() => filteredMembers.value.length)

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredMembers.value.slice(start, start + pageSize.value)
})

// Tự động trở về trang 1 khi thay đổi điều kiện tìm kiếm hoặc bộ lọc
watch([searchQuery, selectedGen, selectedBranch, selectedStatus], () => {
  currentPage.value = 1
})
</script>
