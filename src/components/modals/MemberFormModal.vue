<template>
  <AppModal
    :model-value="isOpen"
    :title="isEditing ? 'Chỉnh sửa thông tin thành viên' : 'Thêm thành viên mới'"
    :subtitle="parentMember ? `Thêm con của: ${parentMember.fullName}` : undefined"
    :close-on-backdrop="false"
    size="lg"
    @update:model-value="(val) => !val && $emit('close')"
  >
    <!-- Form Body -->
    <form id="memberForm" class="space-y-4 text-xs" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <!-- Họ và tên -->
        <div class="sm:col-span-2">
          <label class="block font-semibold text-kyn-text-title mb-1">
            Họ và tên <span class="text-kyn-error-primary">*</span>
          </label>
          <input
            v-model="form.fullName"
            type="text"
            required
            placeholder="Ví dụ: Phạm Văn Thành"
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary focus:ring-1 focus:ring-kyn-primary outline-none transition-all text-sm"
          />
        </div>

        <!-- Tên gọi khác (đổi tên từ Tên tự / Húy / Hiệu) -->
        <div>
          <label class="block font-semibold text-kyn-text-title mb-1">Tên gọi khác</label>
          <input
            v-model="form.courtesyName"
            type="text"
            placeholder="Ví dụ: Tên thường gọi, biệt danh, tên tự..."
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
          />
        </div>

        <!-- Giới tính -->
        <div>
          <label class="block font-semibold text-kyn-text-title mb-1">Giới tính</label>
          <div class="flex items-center gap-4 py-2">
            <label class="flex items-center gap-1.5 cursor-pointer text-kyn-text-primary">
              <input v-model="form.gender" type="radio" value="male" class="text-kyn-primary" />
              <span>Nam (Đinh)</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer text-kyn-text-primary">
              <input v-model="form.gender" type="radio" value="female" class="text-kyn-primary" />
              <span>Nữ</span>
            </label>
          </div>
        </div>

        <!-- Thế hệ (Đời) -->
        <div>
          <label class="block font-semibold text-kyn-text-title mb-1">Thế hệ (Đời)</label>
          <input
            v-model.number="form.generation"
            type="number"
            min="1"
            max="30"
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
          />
        </div>

        <!-- Vai vế / Thứ tự con -->
        <div>
          <label class="block font-semibold text-kyn-text-title mb-1">Vai vế trong gia đình</label>
          <input
            v-model="form.orderTitle"
            type="text"
            placeholder="Ví dụ: Trưởng nam, Thứ nam, Trưởng nữ, Con út..."
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
          />
        </div>

        <!-- Mẫu thân (Mẹ đẻ) khi cha có nhiều vợ -->
        <div v-if="parentSpouses && parentSpouses.length > 0" class="sm:col-span-2 bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
          <label class="block font-semibold text-amber-700 dark:text-amber-300 mb-1">
            Mẫu thân (Mẹ đẻ - do bà nào sinh hạ)
          </label>
          <select
            v-model="form.motherId"
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm cursor-pointer"
            @change="handleMotherChange"
          >
            <option :value="null">-- Chưa xác định / Không rõ --</option>
            <option
              v-for="sp in parentSpouses"
              :key="sp.id"
              :value="sp.id"
            >
              {{ sp.fullName }} ({{ sp.title || 'Phối ngẫu' }})
            </option>
          </select>
          <p class="text-[11px] text-kyn-text-subtitle mt-1">
            Gia phả cổ truyền: một cụ ông có thể có nhiều bà (Chính thất, Kế thất, Trắc thất...). Hãy chỉ định người mẹ sinh hạ người này.
          </p>
        </div>

        <!-- Tình trạng sống / Đã tạ thế -->
        <div class="sm:col-span-2">
          <label class="block font-semibold text-kyn-text-title mb-1">Tình trạng</label>
          <div class="flex items-center gap-5 py-1">
            <label class="flex items-center gap-2 cursor-pointer text-kyn-text-primary">
              <input v-model="form.isAlive" type="radio" :value="true" class="text-kyn-primary" />
              <span class="inline-flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-kyn-success-primary"></span>
                <span class="font-medium">Còn sống</span>
              </span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-kyn-text-primary">
              <input v-model="form.isAlive" type="radio" :value="false" class="text-kyn-primary" />
              <span class="inline-flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-kyn-warning-primary"></span>
                <span class="font-medium">Đã tạ thế (Đã mất)</span>
              </span>
            </label>
          </div>
        </div>

        <!-- Năm / Ngày sinh -->
        <div class="sm:col-span-1">
          <label class="block font-semibold text-kyn-text-title mb-1">Năm / Ngày sinh</label>
          <input
            v-model="form.birthDate"
            type="text"
            placeholder="Ví dụ: 1950 hoặc 15/08/1950"
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
          />
        </div>

        <!-- Nơi ở / Cư trú (nếu còn sống - đã bỏ trường điện thoại) -->
        <div v-if="form.isAlive" class="sm:col-span-1">
          <label class="block font-semibold text-kyn-text-title mb-1">Nơi ở / Cư trú</label>
          <input
            v-model="form.address"
            type="text"
            placeholder="Ví dụ: Hà Nội"
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
          />
        </div>

        <!-- Thêm trường Ngày mất (nếu đã khuất) -->
        <div v-if="!form.isAlive" class="sm:col-span-1">
          <label class="block font-semibold text-kyn-text-title mb-1">Ngày mất</label>
          <input
            v-model="form.deathDate"
            type="text"
            placeholder="Ví dụ: 02/04/1973 hoặc 1973"
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
          />
        </div>

        <!-- Ngày giỗ Âm lịch -->
        <div v-if="!form.isAlive" class="sm:col-span-1">
          <label class="block font-semibold text-amber-600 dark:text-amber-400 mb-1">
            Ngày giỗ (Âm lịch)
          </label>
          <input
            v-model="form.deathDateLunar"
            type="text"
            placeholder="Ví dụ: 02/04 hoặc 15/08"
            class="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/30 text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
          />
        </div>

        <!-- Mộ phần / Nơi an táng -->
        <div v-if="!form.isAlive" class="sm:col-span-1">
          <label class="block font-semibold text-kyn-text-title mb-1">Mộ phần / Nơi an táng</label>
          <input
            v-model="form.burialPlace"
            type="text"
            placeholder="Ví dụ: Đống Do, Mảnh Nội..."
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
          />
        </div>

        <!-- Tiểu sử, công đức & ghi chú -->
        <div class="sm:col-span-2">
          <label class="block font-semibold text-kyn-text-title mb-1">Tiểu sử & Ghi chú</label>
          <textarea
            v-model="form.bio"
            rows="3"
            placeholder="Học vị, chức vị, hành trạng cống hiến..."
            class="w-full px-3 py-2 rounded-lg border border-kyn-neutral-5 bg-kyn-bg-primary text-kyn-text-title focus:border-kyn-primary outline-none text-sm"
          ></textarea>
        </div>
      </div>
    </form>

    <!-- Footer dùng AppButton KYN -->
    <template #footer>
      <div class="w-full flex items-center justify-end gap-2">
        <AppButton variant="secondary" size="sm" @click="$emit('close')">
          Hủy bỏ
        </AppButton>
        <AppButton variant="primary" size="sm" form="memberForm" @click="handleSubmit">
          {{ isEditing ? 'Lưu thay đổi' : 'Tạo thành viên' }}
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { AppModal, AppButton } from '@kyn/vue-components'
import type { FamilyMember, Gender, SpouseInfo } from '../../types/family'
import { useFamilyTree } from '../../composables/useFamilyTree'

const props = defineProps<{
  isOpen: boolean
  memberToEdit?: FamilyMember | null
  parentMember?: FamilyMember | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Partial<FamilyMember>, parentId?: string | null]
}>()

const { memberById } = useFamilyTree()

const parentSpouses = computed<SpouseInfo[]>(() => {
  if (props.parentMember?.spouses?.length) {
    return props.parentMember.spouses
  }
  if (props.memberToEdit?.parentId) {
    const parent = memberById.value.get(props.memberToEdit.parentId)
    return parent?.spouses ?? []
  }
  return []
})

function handleMotherChange() {
  const found = parentSpouses.value.find((s) => s.id === form.motherId)
  form.motherName = found ? `${found.fullName} (${found.title || 'Phối ngẫu'})` : ''
}

const isEditing = computed(() => !!props.memberToEdit)

const form = reactive({
  fullName: '',
  courtesyName: '',
  gender: 'male' as Gender,
  generation: 1,
  branch: 'Dòng chính',
  orderTitle: '',
  motherId: null as string | null,
  motherName: '',
  isAlive: true,
  birthDate: '',
  deathDate: '',
  deathDateLunar: '',
  burialPlace: '',
  phone: '',
  address: '',
  bio: '',
})

watch(
  () => [props.isOpen, props.memberToEdit, props.parentMember],
  () => {
    if (props.memberToEdit) {
      form.fullName = props.memberToEdit.fullName || ''
      form.courtesyName = props.memberToEdit.courtesyName || ''
      form.gender = props.memberToEdit.gender || 'male'
      form.generation = props.memberToEdit.generation || 1
      form.branch = props.memberToEdit.branch || 'Dòng chính'
      form.orderTitle = props.memberToEdit.orderTitle || ''
      form.motherId = props.memberToEdit.motherId ?? null
      form.motherName = props.memberToEdit.motherName ?? ''
      form.isAlive = props.memberToEdit.isAlive
      form.birthDate = props.memberToEdit.birthDate || ''
      form.deathDate = props.memberToEdit.deathDate || ''
      form.deathDateLunar = props.memberToEdit.deathDateLunar || ''
      form.burialPlace = props.memberToEdit.burialPlace || ''
      form.phone = ''
      form.address = props.memberToEdit.address || ''
      form.bio = props.memberToEdit.bio || ''
    } else if (props.parentMember) {
      form.fullName = ''
      form.courtesyName = ''
      form.gender = 'male'
      form.generation = props.parentMember.generation + 1
      form.branch = props.parentMember.branch || 'Dòng chính'
      form.orderTitle = ''
      const defaultSpouse = props.parentMember.spouses?.[0]
      form.motherId = defaultSpouse ? defaultSpouse.id : null
      form.motherName = defaultSpouse ? `${defaultSpouse.fullName} (${defaultSpouse.title || 'Phối ngẫu'})` : ''
      form.isAlive = true
      form.birthDate = ''
      form.deathDate = ''
      form.deathDateLunar = ''
      form.burialPlace = ''
      form.phone = ''
      form.address = ''
      form.bio = ''
    } else {
      form.fullName = ''
      form.courtesyName = ''
      form.gender = 'male'
      form.generation = 1
      form.branch = 'Dòng chính'
      form.orderTitle = ''
      form.motherId = null
      form.motherName = ''
      form.isAlive = true
      form.birthDate = ''
      form.deathDate = ''
      form.deathDateLunar = ''
      form.burialPlace = ''
      form.phone = ''
      form.address = ''
      form.bio = ''
    }
  },
  { immediate: true },
)

function handleSubmit() {
  if (!form.fullName.trim()) return
  emit('save', { ...form }, props.parentMember?.id ?? null)
  emit('close')
}
</script>
