<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Header -->
      <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
        <div>
          <h2 class="text-lg font-bold text-slate-800 font-serif">
            {{ isEditing ? 'Chỉnh sửa thông tin thành viên' : 'Thêm thành viên mới' }}
          </h2>
          <p v-if="parentMember" class="text-xs text-amber-800 mt-0.5">
            Thêm con của: <strong>{{ parentMember.fullName }}</strong> ({{ parentMember.branch }})
          </p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center text-lg transition-colors"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Form Body -->
      <form class="p-6 overflow-y-auto space-y-4 text-xs" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Họ và tên -->
          <div class="sm:col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">
              Họ và tên <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.fullName"
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Phúc Thành"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all text-sm"
            />
          </div>

          <!-- Tên tự / Tên húy / Thụy hiệu -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Tên tự / Húy / Hiệu</label>
            <input
              v-model="form.courtesyName"
              type="text"
              placeholder="Ví dụ: Tự Phúc An, Thụy Khiết"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>

          <!-- Giới tính -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Giới tính</label>
            <div class="flex items-center gap-4 py-2">
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input v-model="form.gender" type="radio" value="male" class="text-amber-600" />
                <span>Nam (Đinh)</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input v-model="form.gender" type="radio" value="female" class="text-amber-600" />
                <span>Nữ</span>
              </label>
            </div>
          </div>

          <!-- Thế hệ (Đời) -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Thế hệ (Đời)</label>
            <input
              v-model.number="form.generation"
              type="number"
              min="1"
              max="20"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>

          <!-- Chi phái -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Chi phái / Nhánh</label>
            <input
              v-model="form.branch"
              type="text"
              placeholder="Ví dụ: Chi Trưởng, Chi Hai..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>

          <!-- Vai vế / Thứ tự con -->
          <div class="sm:col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">Vai vế trong gia đình</label>
            <input
              v-model="form.orderTitle"
              type="text"
              placeholder="Ví dụ: Trưởng nam, Thứ nam, Trưởng nữ, Con thứ ba..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>

          <!-- Tình trạng sống -->
          <div class="sm:col-span-2 flex items-center gap-2 py-1">
            <input
              id="isAliveCheck"
              v-model="form.isAlive"
              type="checkbox"
              class="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
            />
            <label for="isAliveCheck" class="font-semibold text-slate-700 cursor-pointer">
              Thành viên còn sống
            </label>
          </div>

          <!-- Năm sinh / Sinh nhật -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Năm / Ngày sinh</label>
            <input
              v-model="form.birthDate"
              type="text"
              placeholder="Ví dụ: 1950 hoặc 15/08/1950"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>

          <!-- Năm mất (nếu đã khuất) -->
          <div v-if="!form.isAlive">
            <label class="block font-semibold text-slate-700 mb-1">Năm mất (Dương lịch)</label>
            <input
              v-model="form.deathDate"
              type="text"
              placeholder="Ví dụ: 2020"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>

          <!-- Ngày giỗ Âm lịch -->
          <div v-if="!form.isAlive" class="sm:col-span-2">
            <label class="block font-semibold text-amber-900 mb-1">
              Ngày giỗ (Âm lịch) - Định dạng ngày/tháng
            </label>
            <input
              v-model="form.deathDateLunar"
              type="text"
              placeholder="Ví dụ: 15/08 hoặc 10/03"
              class="w-full px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/40 focus:border-amber-600 outline-none text-sm"
            />
            <p class="text-[11px] text-slate-400 mt-1">
              Dùng để tự động tính ngày giỗ âm lịch và thông báo tới con cháu hàng năm.
            </p>
          </div>

          <!-- Mộ phần / Nơi an táng -->
          <div v-if="!form.isAlive" class="sm:col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">Mộ phần / Nơi an táng</label>
            <input
              v-model="form.burialPlace"
              type="text"
              placeholder="Ví dụ: Khu lăng mộ đồi Thông, Nam Trực, Nam Định"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>

          <!-- Liên hệ nếu còn sống -->
          <div v-if="form.isAlive">
            <label class="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
            <input
              v-model="form.phone"
              type="text"
              placeholder="0912..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>

          <div v-if="form.isAlive">
            <label class="block font-semibold text-slate-700 mb-1">Nơi ở / Cư trú</label>
            <input
              v-model="form.address"
              type="text"
              placeholder="Ví dụ: Hà Nội"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>

          <!-- Tiểu sử, công đức -->
          <div class="sm:col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">Tiểu sử & Công đức</label>
            <textarea
              v-model="form.bio"
              rows="3"
              placeholder="Học vị, chức vị, huân huy chương, hành trạng cống hiến..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            ></textarea>
          </div>
        </div>

        <!-- Buttons -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
            @click="$emit('close')"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold shadow-sm transition-colors"
          >
            {{ isEditing ? 'Lưu thay đổi' : 'Tạo thành viên' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { FamilyMember, Gender } from '../../types/family'

const props = defineProps<{
  isOpen: boolean
  memberToEdit?: FamilyMember | null
  parentMember?: FamilyMember | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Partial<FamilyMember>, parentId?: string | null]
}>()

const isEditing = computed(() => !!props.memberToEdit)

const form = reactive({
  fullName: '',
  courtesyName: '',
  gender: 'male' as Gender,
  generation: 1,
  branch: 'Chi Trưởng',
  orderTitle: '',
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
      form.branch = props.memberToEdit.branch || 'Chi Trưởng'
      form.orderTitle = props.memberToEdit.orderTitle || ''
      form.isAlive = props.memberToEdit.isAlive
      form.birthDate = props.memberToEdit.birthDate || ''
      form.deathDate = props.memberToEdit.deathDate || ''
      form.deathDateLunar = props.memberToEdit.deathDateLunar || ''
      form.burialPlace = props.memberToEdit.burialPlace || ''
      form.phone = props.memberToEdit.phone || ''
      form.address = props.memberToEdit.address || ''
      form.bio = props.memberToEdit.bio || ''
    } else if (props.parentMember) {
      form.fullName = ''
      form.courtesyName = ''
      form.gender = 'male'
      form.generation = props.parentMember.generation + 1
      form.branch = props.parentMember.branch || 'Chi Trưởng'
      form.orderTitle = ''
      form.isAlive = true
      form.birthDate = ''
      form.deathDate = ''
      form.deathDateLunar = ''
      form.burialPlace = ''
      form.phone = ''
      form.address = ''
      form.bio = ''
    } else {
      // Thành viên mới không có cha mẹ
      form.fullName = ''
      form.courtesyName = ''
      form.gender = 'male'
      form.generation = 1
      form.branch = 'Chi Trưởng'
      form.orderTitle = ''
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
