<template>
  <AppModal
    :model-value="isOpen && !!targetMember"
    :title="isEditing ? 'Chỉnh sửa thông tin phối ngẫu' : 'Thêm người phối ngẫu'"
    :subtitle="targetMember ? `Phối ngẫu của: ${targetMember.fullName}` : undefined"
    :close-on-backdrop="false"
    size="md"
    z-class="z-[60]"
    @update:model-value="(val) => !val && $emit('close')"
  >
    <!-- Form Body -->
    <form id="spouseForm" class="space-y-4 text-xs" @submit.prevent="handleSubmit">
      <!-- Họ và tên phối ngẫu -->
      <div>
        <label class="block font-semibold text-kyn-text-title mb-1">
          Họ và tên phối ngẫu <span class="text-kyn-error-primary">*</span>
        </label>
        <input
          v-model="form.fullName"
          type="text"
          required
          placeholder="Ví dụ: Lê Thị Từ Tâm"
          class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
        />
      </div>

      <!-- Checkbox "Có nhiều vợ" (chỉ hiển thị khi thành viên là Nam) -->
      <div
        v-if="targetMember?.gender !== 'female'"
        class="flex items-center justify-between p-2.5 rounded-lg bg-kyn-bg-secondary-2 border border-kyn-divider-dividers-2"
      >
        <label for="hasMultipleWivesCheck" class="font-semibold text-kyn-text-title cursor-pointer flex items-center gap-2 select-none">
          <input
            id="hasMultipleWivesCheck"
            v-model="hasMultipleWives"
            type="checkbox"
            class="w-4 h-4 text-kyn-primary rounded border-kyn-neutral-5 focus:ring-kyn-primary cursor-pointer"
            @change="handleMultipleWivesToggle"
          />
          <span>Có nhiều vợ (Thê thiếp / Đa thê)</span>
        </label>
        <span class="text-[11px] text-kyn-text-subtitle">
          {{ hasMultipleWives ? 'Hiện danh sách: Bà Cả, Bà Hai...' : 'Chỉ có 1 vợ (mặc định)' }}
        </span>
      </div>

      <!-- Danh vị / Danh xưng -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="font-semibold text-kyn-text-title">
            {{ hasMultipleWives ? 'Danh vị theo thứ tự (Bà Cả, Bà Hai, Bà Ba...)' : 'Danh vị / Vai vế' }}
          </label>
          <span v-if="!hasMultipleWives && targetMember?.gender !== 'female'" class="text-[10.5px] text-kyn-text-subtitle italic">
            (Trường hợp 1 vợ dùng "Vợ")
          </span>
        </div>

        <!-- Danh sách chọn nhanh Bà Cả, Bà Hai... (CHỈ HIỆN KHI CÓ NHIỀU VỢ hoặc là nữ) -->
        <div v-if="hasMultipleWives || targetMember?.gender === 'female'" class="flex flex-wrap gap-1.5 mb-2">
          <button
            v-for="preset in titlePresets"
            :key="preset.value"
            type="button"
            class="px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer"
            :class="
              form.title === preset.value
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/50 font-bold'
                : 'bg-kyn-bg-secondary-2 text-kyn-text-secondary border-kyn-divider-dividers-2 hover:bg-kyn-bg-secondary-1'
            "
            @click="form.title = preset.value"
          >
            {{ preset.label }}
          </button>
        </div>

        <input
          v-model="form.title"
          type="text"
          :placeholder="hasMultipleWives ? 'Bà Cả, Bà Hai, Bà Ba, Bà Tư...' : (targetMember?.gender === 'female' ? 'Chồng, Phu quân...' : 'Vợ, Hiền thê...')"
          class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
        />
      </div>

      <!-- Nguyên quán -->
      <div>
        <label class="block font-semibold text-kyn-text-title mb-1">Nguyên quán / Quê quán</label>
        <input
          v-model="form.origin"
          type="text"
          placeholder="Ví dụ: Nam Định, Hà Nội..."
          class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
        />
      </div>

      <!-- Tình trạng sống -->
      <div class="flex items-center gap-2 py-1">
        <input
          id="spouseAliveCheck"
          v-model="form.isAlive"
          type="checkbox"
          class="w-4 h-4 text-kyn-primary rounded border-kyn-neutral-5 focus:ring-kyn-primary cursor-pointer"
        />
        <label for="spouseAliveCheck" class="font-semibold text-kyn-text-title cursor-pointer select-none">
          Người phối ngẫu còn sống
        </label>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-kyn-text-title mb-1">Năm sinh</label>
          <input
            v-model="form.birthYear"
            type="text"
            placeholder="Ví dụ: 1955"
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
          />
        </div>
        <div v-if="!form.isAlive">
          <label class="block font-semibold text-kyn-text-title mb-1">Ngày mất</label>
          <input
            v-model="form.deathYear"
            type="text"
            placeholder="Ví dụ: 28/03/1965 hoặc 1965"
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
          />
        </div>
      </div>

      <!-- Ngày giỗ âm lịch -->
      <div v-if="!form.isAlive">
        <label class="block font-semibold text-amber-600 dark:text-amber-400 mb-1">
          Ngày giỗ (Âm lịch) - Định dạng ngày/tháng
        </label>
        <input
          v-model="form.deathDateLunar"
          type="text"
          placeholder="Ví dụ: 08/04 hoặc 22/02"
          class="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/30 text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
        />
      </div>

      <div v-if="!form.isAlive">
        <label class="block font-semibold text-kyn-text-title mb-1">Mộ phần / Nơi an táng</label>
        <input
          v-model="form.burialPlace"
          type="text"
          placeholder="Ví dụ: Nghĩa trang quê nhà"
          class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
        />
      </div>

      <div>
        <label class="block font-semibold text-kyn-text-title mb-1">Ghi chú / Tiểu sử</label>
        <textarea
          v-model="form.bio"
          rows="2"
          placeholder="Ghi chú thêm..."
          class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
        ></textarea>
      </div>
    </form>

    <!-- Footer dùng AppButton KYN -->
    <template #footer>
      <div class="w-full flex items-center justify-end gap-2">
        <AppButton variant="secondary" size="sm" @click="$emit('close')">
          Hủy bỏ
        </AppButton>
        <AppButton variant="primary" size="sm" form="spouseForm" @click="handleSubmit">
          {{ isEditing ? 'Cập nhật' : 'Lưu phối ngẫu' }}
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { AppModal, AppButton } from '@kyn/vue-components'
import type { FamilyMember, SpouseInfo } from '../../types/family'

const props = defineProps<{
  isOpen: boolean
  targetMember: FamilyMember | null
  spouseToEdit?: SpouseInfo | null
}>()

const emit = defineEmits<{
  close: []
  save: [memberId: string, spouse: Omit<SpouseInfo, 'id'>, spouseId?: string]
}>()

const isEditing = computed(() => !!props.spouseToEdit)

// Trạng thái checkbox có nhiều vợ hay không
const hasMultipleWives = ref(false)

function isMultipleWivesTitle(title?: string): boolean {
  if (!title) return false
  const t = title.toLowerCase()
  return (
    t.includes('bà cả') ||
    t.includes('bà hai') ||
    t.includes('bà ba') ||
    t.includes('bà tư') ||
    t.includes('bà năm') ||
    t.includes('vợ lẽ') ||
    t.includes('chính thất') ||
    t.includes('kế thất') ||
    t.includes('trắc thất') ||
    t.includes('thứ thất') ||
    t.includes('á thất')
  )
}

const titlePresets = computed(() => {
  if (props.targetMember?.gender === 'female') {
    return [
      { label: 'Chồng (Phu quân)', value: 'Chồng' },
      { label: 'Chồng trước', value: 'Chồng trước' },
      { label: 'Chồng sau', value: 'Chồng sau' },
    ]
  }
  return [
    { label: 'Bà Cả', value: 'Bà Cả' },
    { label: 'Bà Hai', value: 'Bà Hai' },
    { label: 'Bà Ba', value: 'Bà Ba' },
    { label: 'Bà Tư', value: 'Bà Tư' },
    { label: 'Bà Năm', value: 'Bà Năm' },
    { label: 'Vợ lẽ', value: 'Vợ lẽ' },
  ]
})

const form = reactive({
  fullName: '',
  title: 'Vợ',
  origin: '',
  isAlive: false,
  birthYear: '',
  deathYear: '',
  deathDateLunar: '',
  burialPlace: '',
  bio: '',
})

watch(
  () => [props.isOpen, props.spouseToEdit],
  () => {
    if (props.isOpen) {
      if (props.spouseToEdit) {
        // Nạp dữ liệu phối ngẫu cần sửa
        const currentTitle = props.spouseToEdit.title || ''
        const memberSpouseCount = props.targetMember?.spouses?.length || 0
        
        // Nhận diện xem người này có thuộc diện nhiều vợ hay không
        hasMultipleWives.value = isMultipleWivesTitle(currentTitle) || memberSpouseCount > 1

        form.fullName = props.spouseToEdit.fullName || ''
        form.title = currentTitle || (hasMultipleWives.value ? 'Bà Cả' : 'Vợ')
        form.origin = props.spouseToEdit.origin || ''
        form.isAlive = !!props.spouseToEdit.isAlive
        form.birthYear = props.spouseToEdit.birthYear != null ? String(props.spouseToEdit.birthYear) : ''
        form.deathYear = props.spouseToEdit.deathYear != null ? String(props.spouseToEdit.deathYear) : ''
        form.deathDateLunar = props.spouseToEdit.deathDateLunar || ''
        form.burialPlace = props.spouseToEdit.burialPlace || ''
        form.bio = props.spouseToEdit.bio || ''
      } else {
        // Thêm mới phối ngẫu
        const currentCount = props.targetMember?.spouses?.length || 0
        if (props.targetMember?.gender === 'female') {
          hasMultipleWives.value = false
          form.title = 'Chồng'
        } else {
          // Nếu người này đã có từ 1 vợ trở lên, việc thêm tiếp tục thuộc diện nhiều vợ
          if (currentCount >= 1) {
            hasMultipleWives.value = true
            if (currentCount === 1) form.title = 'Bà Hai'
            else if (currentCount === 2) form.title = 'Bà Ba'
            else if (currentCount === 3) form.title = 'Bà Tư'
            else if (currentCount === 4) form.title = 'Bà Năm'
            else form.title = `Bà thứ ${currentCount + 1}`
          } else {
            // Mới có 1 vợ: Mặc định không tick "Có nhiều vợ", chỉ dùng "Vợ"
            hasMultipleWives.value = false
            form.title = 'Vợ'
          }
        }

        form.fullName = ''
        form.origin = ''
        form.isAlive = false
        form.birthYear = ''
        form.deathYear = ''
        form.deathDateLunar = ''
        form.burialPlace = ''
        form.bio = ''
      }
    }
  },
  { immediate: true },
)

function handleMultipleWivesToggle() {
  if (hasMultipleWives.value) {
    // Khi vừa tích chọn "Có nhiều vợ"
    if (form.title === 'Vợ' || !form.title.trim()) {
      const currentCount = props.targetMember?.spouses?.length || 0
      if (currentCount === 0 || (props.spouseToEdit && props.targetMember?.spouses?.[0]?.id === props.spouseToEdit.id)) {
        form.title = 'Bà Cả'
      } else if (currentCount === 1) {
        form.title = 'Bà Hai'
      } else if (currentCount === 2) {
        form.title = 'Bà Ba'
      } else {
        form.title = 'Bà Cả'
      }
    }
  } else {
    // Khi bỏ chọn "Có nhiều vợ", quay về danh vị "Vợ" chuẩn trường hợp 1 vợ
    if (isMultipleWivesTitle(form.title) || !form.title.trim()) {
      form.title = 'Vợ'
    }
  }
}

function handleSubmit() {
  if (!form.fullName.trim() || !props.targetMember) return
  emit('save', props.targetMember.id, { ...form }, props.spouseToEdit?.id)
  emit('close')
}
</script>
