<template>
  <div class="min-h-screen bg-kyn-bg-secondary-1 text-kyn-text-title flex flex-col font-sans transition-colors duration-200">
    <!-- Header chính của Hệ thống Gia Phả -->
    <header class="bg-kyn-bg-primary border-b border-kyn-divider-dividers-2 sticky top-0 z-40 shadow-xs transition-colors duration-200">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
          <!-- Logo & Tên Dòng Họ -->
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-kyn-3 bg-gradient-to-br from-amber-700 via-rose-800 to-amber-900 flex items-center justify-center text-amber-200 font-bold text-xl shadow-md border border-amber-500/30 flex-none"
            >
              范
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-base sm:text-lg font-bold text-kyn-text-title tracking-tight">
                  GIA PHẢ CHI PHẠM TỘC
                </h1>
                <AppBadge tone="primary" class="hidden md:inline-flex text-[10px] font-bold">
                  Phả Hệ Trực Quan
                </AppBadge>
              </div>
              <p class="text-[11px] text-kyn-text-subtitle hidden sm:block">
                {{ stats.generations }} Thế hệ · {{ stats.total }} Thành viên
              </p>
            </div>
          </div>

          <!-- Ô tìm kiếm nhanh thành viên trên header -->
          <div class="relative max-w-xs w-full hidden md:block">
            <input
              v-model="quickSearch"
              type="text"
              placeholder="Tìm nhanh thành viên trong họ..."
              class="w-full pl-8 pr-3 py-1.5 text-xs rounded-kyn-2 border border-kyn-divider-dividers-2 focus:border-kyn-primary focus:ring-1 focus:ring-kyn-primary bg-kyn-bg-secondary-2 text-kyn-text-title placeholder:text-kyn-text-subtitle outline-none transition-all"
              @focus="isSearchOpen = true"
            />
            <span class="absolute left-2.5 top-2 text-kyn-icon-tertiary">
              <KynIcon name="search" :size="14" />
            </span>

            <!-- Dropdown kết quả tìm kiếm nhanh -->
            <div
              v-if="isSearchOpen && quickSearch && searchResults.length > 0"
              class="absolute left-0 right-0 top-9 bg-kyn-bg-primary rounded-kyn-2 shadow-xl border border-kyn-divider-dividers-2 py-1 z-50 max-h-64 overflow-y-auto text-xs"
            >
              <button
                v-for="res in searchResults"
                :key="res.id"
                type="button"
                class="w-full text-left px-3 py-2 hover:bg-kyn-bg-secondary-2 flex items-center justify-between group transition-colors cursor-pointer"
                @click="handleSelectSearchResult(res.id)"
              >
                <div>
                  <div class="font-bold text-kyn-text-title group-hover:text-amber-600">
                    {{ res.fullName }}
                  </div>
                  <div class="text-[11px] text-kyn-text-subtitle">
                    Đời {{ res.generation }} {{ res.orderTitle ? '· ' + res.orderTitle : '' }}
                  </div>
                </div>
                <span class="text-amber-600 font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Xem <KynIcon name="chevron-right" :size="12" />
                </span>
              </button>
            </div>
          </div>

          <!-- Các nút hành động chính (Lưu file, Chế độ Darkmode, Xuất/Nhập, Thêm người) -->
          <div class="flex items-center gap-2">
            <!-- Huy hiệu file đang liên kết (nếu có) -->
            <div
              v-if="linkedFileName"
              class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-kyn-bg-secondary-2 border border-kyn-divider-dividers-2 text-kyn-text-secondary select-none"
              :title="'Đang làm việc trên file: ' + linkedFileName"
            >
              <KynIcon name="file-text" :size="12" class="text-kyn-primary" />
              <span class="max-w-[130px] truncate font-mono font-bold text-kyn-text-title">{{ linkedFileName }}</span>
              <span
                class="w-2 h-2 rounded-full flex-none"
                :class="isDirty ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'"
                :title="isDirty ? 'Có thay đổi chưa lưu vào file' : 'Đã đồng bộ với file'"
              ></span>
            </div>

            <!-- Nút Lưu File nhanh (Ctrl + S) -->
            <AppButton
              variant="secondary"
              size="sm"
              :title="linkedFileName ? `Lưu vào ${linkedFileName} (Ctrl+S)` : 'Lưu dữ liệu vào file JSON (Ctrl+S)'"
              :disabled="isSaving"
              @click="handleQuickSave(false)"
            >
              <KynIcon :name="isDirty ? 'file-pen-line' : 'file-check'" :size="14" class="text-amber-600 dark:text-amber-400" />
              <span class="hidden sm:inline">{{ isSaving ? 'Đang lưu...' : (linkedFileName ? 'Lưu file' : 'Lưu vào JSON') }}</span>
            </AppButton>

            <!-- Nút Dark Mode -->
            <AppButton
              variant="ghost"
              size="sm"
              :title="resolved === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
              class="text-kyn-text-secondary hover:text-kyn-text-title"
              @click="toggleTheme"
            >
              <KynIcon :name="resolved === 'dark' ? 'sun' : 'moon'" :size="16" />
            </AppButton>

            <!-- Nút Thêm thành viên -->
            <AppButton
              variant="primary"
              size="sm"
              @click="openAddMember(null)"
            >
              <KynIcon name="plus" :size="14" />
              <span class="hidden sm:inline">Thêm thành viên</span>
            </AppButton>

            <!-- Menu Quản lý File JSON & Dữ liệu -->
            <div class="relative">
              <AppButton
                variant="secondary"
                size="sm"
                title="Quản lý File & Dữ liệu JSON"
                @click="showDataMenu = !showDataMenu"
              >
                <KynIcon name="sliders-horizontal" :size="14" />
              </AppButton>

              <div
                v-if="showDataMenu"
                class="absolute right-0 top-10 w-60 bg-kyn-bg-primary rounded-kyn-2 shadow-xl border border-kyn-divider-dividers-2 py-1.5 z-50 text-xs"
              >
                <button
                  type="button"
                  class="w-full text-left px-3.5 py-2 hover:bg-kyn-bg-secondary-2 text-kyn-text-title flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleQuickSave(false)"
                >
                  <KynIcon name="file-check" :size="14" class="text-amber-600 dark:text-amber-400" />
                  <span>Lưu vào file JSON <kbd class="ml-1 text-[10px] font-mono opacity-70 border border-kyn-divider-dividers-2 px-1 rounded">Ctrl+S</kbd></span>
                </button>
                <button
                  type="button"
                  class="w-full text-left px-3.5 py-2 hover:bg-kyn-bg-secondary-2 text-kyn-text-title flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleReloadFromProjectFile"
                >
                  <KynIcon name="refresh-cw" :size="14" class="text-sky-600 dark:text-sky-400" />
                  <span>Đọc lại từ file JSON (family-tree.json)</span>
                </button>
                <button
                  type="button"
                  class="w-full text-left px-3.5 py-2 hover:bg-kyn-bg-secondary-2 text-kyn-text-title flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleQuickSave(true)"
                >
                  <KynIcon name="file-text" :size="14" class="text-kyn-icon-secondary" />
                  <span>Lưu thành file mới... (Save As)</span>
                </button>
                <button
                  type="button"
                  class="w-full text-left px-3.5 py-2 hover:bg-kyn-bg-secondary-2 text-kyn-text-title flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleOpenLocalFile"
                >
                  <KynIcon name="upload" :size="14" class="text-kyn-icon-secondary" />
                  <span>Mở file JSON từ máy tính</span>
                </button>
                <button
                  type="button"
                  class="w-full text-left px-3.5 py-2 hover:bg-kyn-bg-secondary-2 text-kyn-text-title flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleSaveProjectFile"
                >
                  <KynIcon name="cloud-check" :size="14" class="text-sky-600" />
                  <span>Lưu vào file dự án (/public/data)</span>
                </button>
                <hr class="my-1 border-kyn-divider-dividers-1" />
                <button
                  type="button"
                  class="w-full text-left px-3.5 py-2 hover:bg-kyn-bg-secondary-2 text-kyn-text-title flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleExportJSON"
                >
                  <KynIcon name="download" :size="14" class="text-kyn-icon-secondary" />
                  <span>Tải bản sao (.json) về máy</span>
                </button>
                <label
                  class="w-full text-left px-3.5 py-2 hover:bg-kyn-bg-secondary-2 text-kyn-text-title flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <KynIcon name="upload" :size="14" class="text-kyn-icon-secondary" />
                  <span>Tải lên file JSON</span>
                  <input type="file" accept=".json" class="hidden" @change="handleImportFile" />
                </label>
                <hr class="my-1 border-kyn-divider-dividers-1" />
                <button
                  type="button"
                  class="w-full text-left px-3.5 py-2 hover:bg-rose-500/10 text-rose-600 flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleResetDefault"
                >
                  <KynIcon name="rotate-ccw" :size="14" />
                  <span>Khôi phục dữ liệu mẫu</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs kề header dùng AppTabs của KYN -->
        <div class="mt-1 -mb-px">
          <AppTabs
            v-model="currentTab"
            :tabs="tabItems"
            variant="underline"
          />
        </div>
      </div>
    </header>

    <!-- Nội dung chính của Tab đang chọn -->
    <main class="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col">
      <!-- Tab 1: Phả Đồ Trực Quan (Kế thừa KynOrgChart) -->
      <div v-show="currentTab === 'chart'" class="flex-1 bg-kyn-bg-primary rounded-kyn-4 border border-kyn-divider-dividers-2 shadow-xs p-3 sm:p-5 flex flex-col transition-colors duration-200">
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
          @delete="confirmDelete"
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
    <footer class="bg-kyn-bg-primary border-t border-kyn-divider-dividers-2 py-4 text-center text-xs text-kyn-text-subtitle transition-colors duration-200">
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
      @edit-spouse="openEditSpouse"
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

    <!-- Modal Thêm / Sửa Phối Ngẫu (Vợ / Chồng) -->
    <SpouseModal
      :is-open="isSpouseOpen"
      :target-member="spouseTargetMember"
      :spouse-to-edit="spouseToEdit"
      @close="closeSpouseModal"
      @save="handleSaveSpouse"
    />

    <!-- Modal Xác Nhận Xóa Thành Viên -->
    <ConfirmDeleteModal
      :is-open="isConfirmDeleteOpen"
      :member="memberToDelete"
      @close="isConfirmDeleteOpen = false"
      @confirm="handleExecuteDelete"
    />

    <!-- Pop-up Modal dùng chung thay thế toàn bộ alert / confirm -->
    <AppPopupModal />

    <!-- Toast thông báo lưu file góc dưới-phải -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="toastMessage"
        class="fixed bottom-6 right-6 z-50 py-2.5 px-4 rounded-xl bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 shadow-2xl border border-white/10 dark:border-black/10 flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-600 animate-pulse flex-none"></span>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  AppButton,
  AppBadge,
  AppTabs,
  KynIcon,
  useColorScheme,
  type AppTabItem,
} from '@kyn/vue-components'
import type { FamilyMember, SpouseInfo } from './types/family'
import { useFamilyTree } from './composables/useFamilyTree'
import { useClientFileStorage } from './composables/useClientFileStorage'
import FamilyOrgChart from './components/chart/FamilyOrgChart.vue'
import TableView from './views/TableView.vue'
import AnniversaryView from './views/AnniversaryView.vue'
import HistoryView from './views/HistoryView.vue'
import MemberDetailModal from './components/modals/MemberDetailModal.vue'
import MemberFormModal from './components/modals/MemberFormModal.vue'
import SpouseModal from './components/modals/SpouseModal.vue'
import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal.vue'
import AppPopupModal from './components/modals/AppPopupModal.vue'
import { usePopup } from './composables/usePopup'

const currentTab = ref('chart')
const showDataMenu = ref(false)

// ── Dark Mode & Color Scheme KYN ──────────────────────────────────────
const { resolved, setPreference } = useColorScheme()

function toggleTheme() {
  const next = resolved.value === 'dark' ? 'light' : 'dark'
  setPreference(next)
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }
}

const {
  tree,
  flatMembers,
  memberById,
  stats,
  deathAnniversaries,
  addMember,
  updateMember,
  deleteMember,
  addSpouse,
  updateSpouse,
  removeSpouse,
  resetToDefault,
  loadFromFamilyTreeFile,
  exportJSON,
  importJSON,
  focusMember,
} = useFamilyTree()

// ── Client-side JSON File Storage (Lưu trực tiếp vào file JSON máy khách) ──
const {
  linkedFileName,
  isSaving,
  isDirty,
  saveToFile,
  openFromLocalFile,
  saveToProjectFile,
  markDirty,
} = useClientFileStorage(tree, importJSON)

const { showAlert, showConfirm } = usePopup()

// Lắng nghe thay đổi cây để đánh dấu dirty
watch(
  tree,
  () => {
    markDirty()
  },
  { deep: true },
)

// ── Toast thông báo trạng thái ───────────────────────────────────────
const toastMessage = ref('')
let toastTimer: any = null

function showToast(msg: string) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

// ── Thao tác lưu / mở file JSON ─────────────────────────────────────
async function handleQuickSave(forceSaveAs = false) {
  showDataMenu.value = false
  const res = await saveToFile(forceSaveAs)
  if (res.message) {
    showToast(res.message)
  }
}

async function handleOpenLocalFile() {
  showDataMenu.value = false
  const res = await openFromLocalFile()
  if (res.message) {
    showToast(res.message)
  }
}

async function handleSaveProjectFile() {
  showDataMenu.value = false
  const res = await saveToProjectFile()
  if (res.message) {
    showToast(res.message)
  }
}

async function handleReloadFromProjectFile() {
  showDataMenu.value = false
  const ok = await loadFromFamilyTreeFile()
  if (ok) {
    showToast('Đã nạp lại dữ liệu mới nhất từ file family-tree.json!')
  }
}

// ── Phím tắt toàn cục: Ctrl + S để lưu file JSON ─────────────────────
function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    handleQuickSave(false)
  }
}

onMounted(async () => {
  // Thay thế toàn bộ alert mặc định của trình duyệt bằng Pop-up modal chuẩn KYN
  if (typeof window !== 'undefined') {
    window.alert = (msg?: any) => {
      showAlert({
        title: 'Thông báo',
        message: String(msg ?? ''),
        tone: 'info',
        confirmText: 'Đóng',
      })
    }
  }

  window.addEventListener('keydown', handleGlobalKeydown)
  // Tự động nạp dữ liệu chuẩn từ file family-tree.json khi khởi động
  await loadFromFamilyTreeFile()
  linkedFileName.value = 'family-tree.json'
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

// ── Tab items configuration ─────────────────────────────────────────
const tabItems = computed<AppTabItem[]>(() => [
  {
    value: 'chart',
    label: 'Phả Đồ (Sơ đồ cây)',
    icon: 'git-branch',
  },
  {
    value: 'table',
    label: 'Danh Sách Phả Ký',
    count: stats.value.total,
    icon: 'clipboard-list',
  },
  {
    value: 'anniversary',
    label: 'Sổ Giỗ Chạp',
    count: deathAnniversaries.value.length,
    icon: 'calendar',
  },
  {
    value: 'history',
    label: 'Tộc Ước & Sử Ký',
    icon: 'scroll-text',
  },
])

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
const spouseToEdit = ref<SpouseInfo | null>(null)

const isConfirmDeleteOpen = ref(false)
const memberToDelete = ref<FamilyMember | null>(null)

function openViewDetail(member: FamilyMember) {
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
  spouseToEdit.value = null
  isSpouseOpen.value = true
}

function openEditSpouse(member: FamilyMember, spouse: SpouseInfo) {
  spouseTargetMember.value = member
  spouseToEdit.value = spouse
  isSpouseOpen.value = true
}

function closeSpouseModal() {
  isSpouseOpen.value = false
  spouseToEdit.value = null
}

function handleSaveMember(data: Partial<FamilyMember>, parentId?: string | null) {
  if (memberToEdit.value) {
    updateMember(memberToEdit.value.id, data)
  } else {
    addMember(data as any, parentId)
  }
}

function handleSaveSpouse(memberId: string, spouse: Omit<SpouseInfo, 'id'>, spouseId?: string) {
  if (spouseId) {
    updateSpouse(memberId, spouseId, spouse)
    showToast(`✓ Đã cập nhật thông tin "${spouse.fullName}". Nhấn "Lưu vào JSON" để cập nhật tệp.`)
  } else {
    addSpouse(memberId, spouse)
    showToast(`✓ Đã thêm phối ngẫu "${spouse.fullName}". Nhấn "Lưu vào JSON" để cập nhật tệp.`)
  }
  markDirty()
  if (viewingMember.value && viewingMember.value.id === memberId) {
    viewingMember.value = memberById.value.get(memberId) ?? null
  }
}

async function handleRemoveSpouse(memberId: string, spouseId: string) {
  const member = memberById.value.get(memberId)
  const spouse = member?.spouses?.find((s) => s.id === spouseId)
  const spouseName = spouse?.fullName ? ` "${spouse.fullName}"` : ''

  const ok = await showConfirm({
    title: 'Xác nhận xóa phối ngẫu',
    message: `Bạn có chắc chắn muốn xóa thông tin người phối ngẫu${spouseName} khỏi hồ sơ không?\nThao tác này sẽ cập nhật ngay vào cây gia phả.`,
    tone: 'error',
    confirmVariant: 'danger',
    confirmText: 'Xóa phối ngẫu',
    cancelText: 'Hủy bỏ',
  })

  if (ok) {
    removeSpouse(memberId, spouseId)
    if (viewingMember.value) {
      viewingMember.value = memberById.value.get(memberId) ?? null
    }
    markDirty()
    showToast(`✓ Đã xóa người phối ngẫu${spouseName}. Nhấn "Lưu vào JSON" để cập nhật tệp.`)
  }
}

function confirmDelete(member: FamilyMember) {
  memberToDelete.value = member
  isConfirmDeleteOpen.value = true
}

function handleExecuteDelete(member: FamilyMember) {
  const memberName = member.fullName
  deleteMember(member.id)
  isConfirmDeleteOpen.value = false
  memberToDelete.value = null
  if (viewingMember.value && viewingMember.value.id === member.id) {
    viewingMember.value = null
  }
  markDirty()
  showToast(`✓ Đã xóa thành viên "${memberName}" khỏi gia phả. Nhấn "Lưu vào JSON" để cập nhật tệp.`)
}

// ── Quản lý dữ liệu JSON ────────────────────────────────────────────
function handleExportJSON() {
  showDataMenu.value = false
  const dataStr = exportJSON()
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `gia-pha-chi-pham-toc-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function handleImportFile(event: Event) {
  showDataMenu.value = false
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = e.target?.result as string
    if (text) {
      const ok = importJSON(text)
      if (ok) {
        await showAlert({
          title: 'Nhập dữ liệu thành công',
          message: `Đã nạp toàn bộ dữ liệu từ tệp "${file.name}" vào cây gia phả thành công.\nBạn có thể nhấn "Lưu vào JSON" (Ctrl + S) để ghi đè cập nhật vào file dự án.`,
          tone: 'success',
          confirmText: 'Đã hiểu',
        })
      } else {
        await showAlert({
          title: 'Định dạng file không hợp lệ',
          message: 'Tệp JSON đã chọn không đúng cấu trúc cây phả hệ (yêu cầu là mảng danh sách thành viên hợp lệ).\nVui lòng kiểm tra lại nội dung file.',
          tone: 'error',
          confirmText: 'Đóng',
        })
      }
    }
  }
  reader.readAsText(file)
}

async function handleResetDefault() {
  showDataMenu.value = false
  const ok = await showConfirm({
    title: 'Khôi phục dữ liệu mẫu ban đầu',
    message: 'Toàn bộ các chỉnh sửa cục bộ đã lưu trên trình duyệt sẽ được khôi phục về dữ liệu gốc từ file family-tree.json.\nBạn có chắc chắn muốn tiếp tục không?',
    tone: 'warning',
    confirmVariant: 'danger',
    confirmText: 'Khôi phục dữ liệu',
    cancelText: 'Hủy bỏ',
  })
  if (ok) {
    resetToDefault()
    showToast('✓ Đã khôi phục dữ liệu phả hệ ban đầu.')
  }
}
</script>
