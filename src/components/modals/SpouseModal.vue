<template>
  <AppModal
    :model-value="isOpen && !!targetMember"
    title="Thêm người phối ngẫu"
    :subtitle="targetMember ? `Phối ngẫu của: ${targetMember.fullName}` : undefined"
    :close-on-backdrop="false"
    size="md"
    @update:model-value="(val) => !val && $emit('close')"
  >
    <!-- Form Body -->
    <form id="spouseForm" class="space-y-4 text-xs" @submit.prevent="handleSubmit">
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

      <div>
        <label class="block font-semibold text-kyn-text-title mb-1">
          Danh vị / Danh xưng theo cổ lệ
        </label>
        <!-- Gợi ý danh vị vợ theo cổ truyền -->
        <div class="flex flex-wrap gap-1.5 mb-2">
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
          placeholder="Chính thất, Kế thất, Trắc thất, Thứ thất, Phu quân..."
          class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
        />
      </div>

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
          class="w-4 h-4 text-kyn-primary rounded border-kyn-neutral-5 focus:ring-kyn-primary"
        />
        <label for="spouseAliveCheck" class="font-semibold text-kyn-text-title cursor-pointer">
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
          Lưu phối ngẫu
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { AppModal, AppButton } from '@kyn/vue-components'
import type { FamilyMember, SpouseInfo } from '../../types/family'

const props = defineProps<{
  isOpen: boolean
  targetMember: FamilyMember | null
}>()

const emit = defineEmits<{
  close: []
  save: [memberId: string, spouse: Omit<SpouseInfo, 'id'>]
}>()

const titlePresets = computed(() => {
  if (props.targetMember?.gender === 'female') {
    return [{ label: 'Phu quân (Chồng)', value: 'Phu quân' }]
  }
  return [
    { label: 'Chính thất (Bà Cả)', value: 'Chính thất' },
    { label: 'Kế thất (Bà Kế)', value: 'Kế thất' },
    { label: 'Trắc thất (Bà Hai)', value: 'Trắc thất' },
    { label: 'Thứ thất (Bà Ba)', value: 'Thứ thất' },
    { label: 'Á thất (Vợ lẽ)', value: 'Á thất' },
  ]
})

const form = reactive({
  fullName: '',
  title: 'Chính thất',
  origin: '',
  isAlive: false,
  birthYear: '',
  deathYear: '',
  deathDateLunar: '',
  burialPlace: '',
  bio: '',
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.fullName = ''
      form.title = props.targetMember?.gender === 'female' ? 'Phu quân' : 'Chính thất'
      form.origin = ''
      form.isAlive = false
      form.birthYear = ''
      form.deathYear = ''
      form.deathDateLunar = ''
      form.burialPlace = ''
      form.bio = ''
    }
  },
)

function handleSubmit() {
  if (!form.fullName.trim() || !props.targetMember) return
  emit('save', props.targetMember.id, { ...form })
  emit('close')
}
</script>
