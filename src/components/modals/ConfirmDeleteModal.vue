<template>
  <AppModal
    :model-value="isOpen"
    title="Xác nhận xóa thành viên"
    icon="alert-triangle"
    tone="error"
    size="md"
    z-class="z-[60]"
    :close-on-backdrop="false"
    @update:model-value="(val) => !val && $emit('close')"
  >
    <div v-if="member" class="space-y-4 text-xs text-kyn-text-primary">
      <!-- Thẻ thông tin tóm tắt thành viên sắp xóa -->
      <div class="p-3.5 bg-kyn-bg-secondary-2 rounded-xl border border-kyn-divider-dividers-1 space-y-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            v-if="genStyle"
            class="px-2 py-0.5 rounded-full text-[10px] font-bold"
            :style="{ background: genStyle.color, color: '#ffffff' }"
          >
            {{ genStyle.roman }}
          </span>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            :class="member.gender === 'male' ? 'bg-sky-500/10 text-sky-600' : 'bg-rose-500/10 text-rose-600'"
          >
            {{ member.gender === 'male' ? 'Nam (Đinh)' : 'Nữ' }}
          </span>
          <span v-if="member.orderTitle" class="text-amber-700 dark:text-amber-400 font-medium">
            {{ member.orderTitle }}
          </span>
          <span
            class="px-2 py-0.5 rounded-full text-[10px]"
            :class="member.isAlive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-kyn-bg-secondary-3 text-kyn-text-secondary'"
          >
            {{ member.isAlive ? 'Còn sống' : 'Đã tạ thế' }}
          </span>
        </div>

        <div class="text-base font-bold text-kyn-text-title tracking-tight">
          {{ member.fullName }}
          <span v-if="member.courtesyName" class="text-xs font-normal text-amber-700 dark:text-amber-400 italic ml-1.5">
            (Tên gọi khác: {{ member.courtesyName }})
          </span>
        </div>

        <div class="text-kyn-text-subtitle text-[11.5px] flex flex-wrap gap-x-3 gap-y-0.5">
          <span>Sinh: {{ member.birthDate || 'Chưa rõ' }}</span>
          <span v-if="!member.isAlive">
            Mất: {{ member.deathDate || '—' }}
            <span v-if="member.deathDateLunar" class="text-amber-600 dark:text-amber-400 font-semibold ml-1">
              (Giỗ: {{ member.deathDateLunar }} ÂL)
            </span>
          </span>
          <span v-if="member.burialPlace">Mộ: {{ member.burialPlace }}</span>
        </div>
      </div>

      <!-- Cảnh báo nếu là Thủy Tổ / Gốc cây gia phả -->
      <div
        v-if="isRootMember"
        class="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-700 dark:text-rose-300 space-y-1.5"
      >
        <div class="font-bold flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
          <KynIcon name="alert-triangle" :size="16" />
          <span>ĐÂY LÀ THỦY TỔ / GỐC CÂY GIA PHẢ!</span>
        </div>
        <p class="text-[11.5px] leading-relaxed">
          Thành viên này là <strong>gốc đầu tiên của dòng họ</strong>. Việc xóa thành viên này sẽ
          <strong>xóa toàn bộ toàn bộ cây gia phả</strong> bao gồm tất cả các thế hệ con cháu bên dưới!
        </p>
      </div>

      <!-- Cảnh báo nếu có nhánh con cháu -->
      <div
        v-else-if="totalDescendants > 0"
        class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-300 space-y-1.5"
      >
        <div class="font-bold flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
          <KynIcon name="alert-triangle" :size="16" />
          <span>Cảnh báo: Sẽ xóa toàn bộ nhánh con cháu trực hệ!</span>
        </div>
        <p class="text-[11.5px] leading-relaxed text-rose-600 dark:text-rose-400">
          Thành viên này đang có <strong class="underline">{{ directChildrenCount }} người con</strong> và tổng cộng
          <strong class="underline">{{ totalDescendants }} hậu duệ</strong> trực hệ ở các thế hệ sau.
          Khi xóa, <strong class="underline">toàn bộ nhánh con cháu này sẽ bị xóa khỏi sơ đồ</strong>.
        </p>
      </div>

      <!-- Cảnh báo nếu có phối ngẫu -->
      <div
        v-if="spousesCount > 0"
        class="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-800 dark:text-amber-300 text-[11.5px]"
      >
        Thông tin liên kết với <strong>{{ spousesCount }} người phối ngẫu (vợ/chồng)</strong> của thành viên này cũng sẽ bị gỡ bỏ.
      </div>

      <p class="text-kyn-text-primary leading-relaxed text-[12.5px]">
        Bạn có chắc chắn muốn xóa thành viên <strong class="text-kyn-text-title font-semibold">{{ member.fullName }}</strong> khỏi gia phả không?
      </p>

      <div class="p-2.5 rounded-lg bg-kyn-bg-secondary-1 border border-kyn-divider-dividers-2 text-[11px] text-kyn-text-subtitle flex items-center gap-2">
        <span class="text-base flex-none">💡</span>
        <span>Sau khi xóa, hãy nhấn nút <strong>"Lưu vào JSON"</strong> (hoặc <strong>Ctrl + S</strong>) trên thanh Header để ghi đè vào file.</span>
      </div>
    </div>

    <!-- Nút hành động -->
    <template #footer>
      <div class="w-full flex items-center justify-end gap-2.5">
        <AppButton variant="secondary" size="sm" @click="$emit('close')">
          Hủy bỏ
        </AppButton>
        <AppButton variant="danger" size="sm" @click="handleConfirm">
          <KynIcon name="trash-2" :size="14" />
          <span>Xác nhận xóa</span>
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AppModal, AppButton, KynIcon } from '@kyn/vue-components'
import type { FamilyMember } from '../../types/family'
import { getGenerationStyle } from '../../data/generationStyles'
import { useFamilyTree } from '../../composables/useFamilyTree'

const props = defineProps<{
  isOpen: boolean
  member: FamilyMember | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', member: FamilyMember): void
}>()

const { tree } = useFamilyTree()

const genStyle = computed(() => {
  if (!props.member) return null
  return getGenerationStyle(props.member.generation)
})

// Kiểm tra xem có phải Thủy Tổ (gốc cao nhất trong tree) không
const isRootMember = computed(() => {
  if (!props.member) return false
  return tree.value.some((root) => root.id === props.member?.id)
})

// Đếm tổng số con cháu trực hệ bên dưới (đệ quy)
function countDescendants(m: FamilyMember): number {
  if (!m.children || m.children.length === 0) return 0
  return m.children.reduce((total, child) => total + 1 + countDescendants(child), 0)
}

const directChildrenCount = computed(() => props.member?.children?.length || 0)
const totalDescendants = computed(() => (props.member ? countDescendants(props.member) : 0))
const spousesCount = computed(() => props.member?.spouses?.length || 0)

function handleConfirm() {
  if (props.member) {
    emit('confirm', props.member)
  }
}
</script>
