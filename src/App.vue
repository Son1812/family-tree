<template>
  <div class="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
    <!-- Header chính của Hệ thống Gia Phả -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
          <!-- Logo & Tên Dòng Họ -->
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 via-rose-800 to-amber-900 flex items-center justify-center text-amber-200 font-serif font-bold text-xl shadow-md border border-amber-500/30 flex-none"
            >
              阮
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-base sm:text-lg font-bold font-serif text-slate-900 tracking-tight">
                  GIA PHẢ ĐẠI TỘC NGUYỄN PHÚC
                </h1>
                <span class="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                  Phả Hệ Trực Quan
                </span>
              </div>
              <p class="text-[11px] text-slate-500 hidden sm:block">
                {{ stats.generations }} Thế hệ · {{ stats.total }} Thành viên · {{ stats.branches.length }} Chi phái
              </p>
            </div>
          </div>

          <!-- Ô tìm kiếm nhanh thành viên trên header -->
          <div class="relative max-w-xs w-full hidden md:block">
            <input
              v-model="quickSearch"
              type="text"
              placeholder="Tìm nhanh thành viên trong họ..."
              class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-slate-50/70 outline-none transition-all"
              @focus="isSearchOpen = true"
            />
            <span class="absolute left-2.5 top-1.5 text-slate-400 text-xs">🔍</span>

            <!-- Dropdown kết quả tìm kiếm nhanh -->
            <div
              v-if="isSearchOpen && quickSearch && searchResults.length > 0"
              class="absolute left-0 right-0 top-9 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 max-h-64 overflow-y-auto text-xs"
            >
              <button
                v-for="res in searchResults"
                :key="res.id"
                type="button"
                class="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center justify-between group transition-colors"
                @click="handleSelectSearchResult(res.id)"
              >
                <div>
                  <div class="font-bold text-slate-800 group-hover:text-amber-900">
                    {{ res.fullName }}
                  </div>
                  <div class="text-[11px] text-slate-400">
                    Đời {{ res.generation }} · {{ res.branch }} {{ res.orderTitle ? '· ' + res.orderTitle : '' }}
                  </div>
                </div>
                <span class="text-amber-700 font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform">
                  Xem ›
                </span>
              </button>
            </div>
          </div>

          <!-- Các nút hành động chính (Xuất/Nhập, Thêm người) -->
          <div class="flex items-center gap-2">
            <!-- Nút Thêm thành viên -->
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              @click="openAddMember(null)"
            >
              <span>➕</span>
              <span class="hidden sm:inline">Thêm thành viên</span>
            </button>

            <!-- Menu phụ (Xuất/Nhập/Khôi phục) -->
            <div class="relative">
              <button
                type="button"
                class="w-8 h-8 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center justify-center text-sm font-semibold transition-colors"
                title="Tùy chọn dữ liệu"
                @click="showDataMenu = !showDataMenu"
              >
                ⚙️
              </button>

              <div
                v-if="showDataMenu"
                class="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
              >
                <button
                  type="button"
                  class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  @click="handleExportJSON"
                >
                  <span>📥</span> Xuất file dữ liệu (JSON)
                </button>
                <label
                  class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <span>📤</span> Nhập file dữ liệu (JSON)
                  <input type="file" accept=".json" class="hidden" @change="handleImportFile" />
                </label>
                <hr class="my-1 border-slate-100" />
                <button
                  type="button"
                  class="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                  @click="handleResetDefault"
                >
                  <span>🔄</span> Khôi phục dữ liệu mẫu
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1 sm:gap-2 border-t border-slate-100 pt-1 -mb-px overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            class="px-3 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors"
            :class="
              currentTab === 'chart'
                ? 'border-amber-700 text-amber-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            "
            @click="currentTab = 'chart'"
          >
            <span>🌳</span> Phả Đồ (Sơ đồ cây)
          </button>
          <button
            type="button"
            class="px-3 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors"
            :class="
              currentTab === 'table'
                ? 'border-amber-700 text-amber-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            "
            @click="currentTab = 'table'"
          >
            <span>📋</span> Danh Sách Phả Ký ({{ stats.total }})
          </button>
          <button
            type="button"
            class="px-3 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors"
            :class="
              currentTab === 'anniversary'
                ? 'border-amber-700 text-amber-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            "
            @click="currentTab = 'anniversary'"
          >
            <span>🏮</span> Sổ Giỗ Chạp ({{ deathAnniversaries.length }})
          </button>
          <button
            type="button"
            class="px-3 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors"
            :class="
              currentTab === 'history'
                ? 'border-amber-700 text-amber-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            "
            @click="currentTab = 'history'"
          >
            <span>📜</span> Tộc Ước & Sử Ký
          </button>
        </div>
      </div>
    </header>

    <!-- Nội dung chính của Tab đang chọn -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
      <!-- Tab 1: Phả Đồ Trực Quan (Kế thừa KynOrgChart) -->
      <div v-show="currentTab === 'chart'" class="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col">
        <FamilyOrgChart
          @view-detail="openViewDetail"
          @add-child="openAddMember"
          @add-spouse="openAddSpouse"
          @edit="openEditMember"
          @delete="confirmDelete"
        />
      </div>

      <!-- Tab 2: Danh Sách Bảng -->
      <div v-show="currentTab === 'table'">
        <TableView
          @view-detail="openViewDetail"
          @edit="openEditMember"
          @locate-on-tree="locateOnTree"
        />
      </div>

      <!-- Tab 3: Sổ Giỗ Chạp Âm Lịch -->
      <div v-show="currentTab === 'anniversary'">
        <AnniversaryView @locate-on-tree="locateOnTree" />
      </div>

      <!-- Tab 4: Sử Ký & Tộc Ước -->
      <div v-show="currentTab === 'history'">
        <HistoryView />
      </div>
    </main>

    <!-- Footer thanh lịch -->
    <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
      Hệ thống Gia Phả Đại Tộc Nguyễn Phúc · Phát triển trên nền tảng Sơ đồ tổ chức KYN Components · 2026
    </footer>

    <!-- Modals -->
    <!-- Modal Xem Chi Tiết Hồ Sơ -->
    <MemberDetailModal
      :member="viewingMember"
      @close="viewingMember = null"
      @edit="openEditMember"
      @add-child="openAddMember"
      @add-spouse="openAddSpouse"
      @remove-spouse="handleRemoveSpouse"
      @focus-member="locateOnTree"
      @delete="confirmDelete"
    />

    <!-- Modal Thêm / Sửa Thành Viên -->
    <MemberFormModal
      :is-open="isFormOpen"
      :member-to-edit="memberToEdit"
      :parent-member="parentMember"
      @close="isFormOpen = false"
      @save="handleSaveMember"
    />

    <!-- Modal Thêm Phối Ngẫu -->
    <SpouseModal
      :is-open="isSpouseOpen"
      :target-member="spouseTargetMember"
      @close="isSpouseOpen = false"
      @save="handleSaveSpouse"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FamilyMember, SpouseInfo } from './types/family'
import { useFamilyTree } from './composables/useFamilyTree'
import FamilyOrgChart from './components/chart/FamilyOrgChart.vue'
import TableView from './views/TableView.vue'
import AnniversaryView from './views/AnniversaryView.vue'
import HistoryView from './views/HistoryView.vue'
import MemberDetailModal from './components/modals/MemberDetailModal.vue'
import MemberFormModal from './components/modals/MemberFormModal.vue'
import SpouseModal from './components/modals/SpouseModal.vue'

const currentTab = ref<'chart' | 'table' | 'anniversary' | 'history'>('chart')
const showDataMenu = ref(false)

const {
  flatMembers,
  memberById,
  stats,
  deathAnniversaries,
  addMember,
  updateMember,
  deleteMember,
  addSpouse,
  removeSpouse,
  resetToDefault,
  exportJSON,
  importJSON,
  focusMember,
} = useFamilyTree()

// ── Tìm kiếm nhanh ──────────────────────────────────────────────────
const quickSearch = ref('')
const isSearchOpen = ref(false)

const searchResults = computed(() => {
  if (!quickSearch.value.trim()) return []
  const q = quickSearch.value.toLowerCase()
  return flatMembers.value
    .filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.courtesyName?.toLowerCase().includes(q) ||
        m.birthDate?.includes(q),
    )
    .slice(0, 8)
})

function handleSelectSearchResult(id: string) {
  locateOnTree(id)
  isSearchOpen.value = false
  quickSearch.value = ''
}

function locateOnTree(id: string) {
  currentTab.value = 'chart'
  focusMember(id)
}

// ── Modals State ────────────────────────────────────────────────────
const viewingMember = ref<FamilyMember | null>(null)
const isFormOpen = ref(false)
const memberToEdit = ref<FamilyMember | null>(null)
const parentMember = ref<FamilyMember | null>(null)

const isSpouseOpen = ref(false)
const spouseTargetMember = ref<FamilyMember | null>(null)

function openViewDetail(member: FamilyMember) {
  // Lấy bản mới nhất từ store
  viewingMember.value = memberById.value.get(member.id) ?? member
}

function openAddMember(parent: FamilyMember | null) {
  viewingMember.value = null
  memberToEdit.value = null
  parentMember.value = parent
  isFormOpen.value = true
}

function openEditMember(member: FamilyMember) {
  viewingMember.value = null
  parentMember.value = null
  memberToEdit.value = member
  isFormOpen.value = true
}

function openAddSpouse(member: FamilyMember) {
  spouseTargetMember.value = member
  isSpouseOpen.value = true
}

function handleSaveMember(data: Partial<FamilyMember>, parentId?: string | null) {
  if (memberToEdit.value) {
    updateMember(memberToEdit.value.id, data)
  } else {
    addMember(data as any, parentId)
  }
}

function handleSaveSpouse(memberId: string, spouse: Omit<SpouseInfo, 'id'>) {
  addSpouse(memberId, spouse)
  if (viewingMember.value && viewingMember.value.id === memberId) {
    viewingMember.value = memberById.value.get(memberId) ?? null
  }
}

function handleRemoveSpouse(memberId: string, spouseId: string) {
  if (confirm('Bạn có chắc muốn xóa thông tin người phối ngẫu này?')) {
    removeSpouse(memberId, spouseId)
    if (viewingMember.value) {
      viewingMember.value = memberById.value.get(memberId) ?? null
    }
  }
}

function confirmDelete(member: FamilyMember) {
  if (
    confirm(
      `Bạn có chắc chắn muốn xóa "${member.fullName}" khỏi gia phả? Hành động này cũng sẽ xóa các nhánh con cháu bên dưới.`,
    )
  ) {
    deleteMember(member.id)
    viewingMember.value = null
  }
}

// ── Quản lý dữ liệu JSON ────────────────────────────────────────────
function handleExportJSON() {
  showDataMenu.value = false
  const dataStr = exportJSON()
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `gia-pha-nguyen-phuc-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function handleImportFile(event: Event) {
  showDataMenu.value = false
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    if (text) {
      const ok = importJSON(text)
      if (ok) {
        alert('Đã nhập dữ liệu gia phả thành công!')
      } else {
        alert('File JSON không đúng định dạng gia phả.')
      }
    }
  }
  reader.readAsText(file)
}

function handleResetDefault() {
  showDataMenu.value = false
  if (
    confirm(
      'Khôi phục dữ liệu mẫu ban đầu? Toàn bộ các chỉnh sửa đã lưu trên trình duyệt sẽ được đặt lại.',
    )
  ) {
    resetToDefault()
  }
}
</script>
