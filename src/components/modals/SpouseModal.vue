<template>
  <div
    v-if="isOpen && targetMember"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Header -->
      <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
        <div>
          <h2 class="text-lg font-bold text-slate-800 font-serif">Thêm người phối ngẫu</h2>
          <p class="text-xs text-amber-800 mt-0.5">
            Phối ngẫu của: <strong>{{ targetMember.fullName }}</strong> ({{ targetMember.branch }})
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
        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Họ và tên phối ngẫu <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.fullName"
            type="text"
            required
            placeholder="Ví dụ: Lê Thị Từ Tâm"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Danh vị / Danh xưng</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Chính thất, Kế thất, Phu quân..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nguyên quán / Quê quán</label>
            <input
              v-model="form.origin"
              type="text"
              placeholder="Ví dụ: Nam Định, Hà Nội..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>
        </div>

        <!-- Tình trạng sống -->
        <div class="flex items-center gap-2 py-1">
          <input
            id="spouseAliveCheck"
            v-model="form.isAlive"
            type="checkbox"
            class="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
          />
          <label for="spouseAliveCheck" class="font-semibold text-slate-700 cursor-pointer">
            Người phối ngẫu còn sống
          </label>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Năm sinh</label>
            <input
              v-model="form.birthYear"
              type="text"
              placeholder="Ví dụ: 1955"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>
          <div v-if="!form.isAlive">
            <label class="block font-semibold text-slate-700 mb-1">Năm mất (Dương lịch)</label>
            <input
              v-model="form.deathYear"
              type="text"
              placeholder="Ví dụ: 2018"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
            />
          </div>
        </div>

        <!-- Ngày giỗ âm lịch -->
        <div v-if="!form.isAlive">
          <label class="block font-semibold text-amber-900 mb-1">
            Ngày giỗ (Âm lịch) - Định dạng ngày/tháng
          </label>
          <input
            v-model="form.deathDateLunar"
            type="text"
            placeholder="Ví dụ: 08/04 hoặc 22/02"
            class="w-full px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/40 focus:border-amber-600 outline-none text-sm"
          />
        </div>

        <div v-if="!form.isAlive">
          <label class="block font-semibold text-slate-700 mb-1">Mộ phần / Nơi an táng</label>
          <input
            v-model="form.burialPlace"
            type="text"
            placeholder="Ví dụ: Nghĩa trang quê nhà"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Ghi chú / Tiểu sử</label>
          <textarea
            v-model="form.bio"
            rows="2"
            placeholder="Ghi chú thêm..."
            class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 outline-none text-sm"
          ></textarea>
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
            Lưu phối ngẫu
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { FamilyMember, SpouseInfo } from '../../types/family'

const props = defineProps<{
  isOpen: boolean
  targetMember: FamilyMember | null
}>()

const emit = defineEmits<{
  close: []
  save: [memberId: string, spouse: Omit<SpouseInfo, 'id'>]
}>()

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
