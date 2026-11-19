<template>
  <div
    v-if="member"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Header với dải màu thế hệ -->
      <div
        class="relative p-6 border-b border-slate-100 flex items-start justify-between"
        :style="{
          background: `linear-gradient(135deg, ${genStyle.bgColor} 0%, #ffffff 100%)`,
        }"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 shadow-sm flex-none"
            :class="[
              member.gender === 'male'
                ? 'bg-sky-50 text-sky-800 border-sky-300'
                : 'bg-rose-50 text-rose-800 border-rose-300',
            ]"
          >
            <img
              v-if="member.avatar"
              :src="member.avatar"
              :alt="member.fullName"
              class="w-full h-full object-cover rounded-full"
            />
            <span v-else>{{ member.gender === 'male' ? 'Cụ Ông' : 'Cụ Bà' }}</span>
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                :style="{ background: genStyle.color, color: '#ffffff' }"
              >
                {{ genStyle.roman }} - {{ member.branch }}
              </span>
              <span
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="
                  member.isAlive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                "
              >
                {{ member.isAlive ? '🟢 Còn sống' : '🕊️ Đã quy tiên' }}
              </span>
            </div>

            <h2 class="text-2xl font-bold text-slate-800 mt-1 font-serif">
              {{ member.fullName }}
            </h2>
            <p v-if="member.courtesyName" class="text-xs text-amber-800 italic font-serif">
              {{ member.courtesyName }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-500 flex items-center justify-center text-lg transition-colors"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Body nội dung cuộn -->
      <div class="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
        <!-- Thông tin cơ bản -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
          <div>
            <span class="text-xs text-slate-400 block">Vai vế dòng họ</span>
            <span class="font-semibold text-slate-800">{{ member.orderTitle || '—' }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 block">Giới tính</span>
            <span class="font-semibold text-slate-800">{{ member.gender === 'male' ? 'Nam (Đinh)' : 'Nữ' }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 block">Năm sinh / Sinh nhật</span>
            <span class="font-semibold text-slate-800">
              {{ member.birthDate || 'Chưa rõ' }}
              <span v-if="member.birthDateLunar" class="text-xs text-slate-500">({{ member.birthDateLunar }})</span>
            </span>
          </div>
          <div>
            <span class="text-xs text-slate-400 block">{{ member.isAlive ? 'Tình trạng' : 'Năm tạ thế / Ngày giỗ' }}</span>
            <span class="font-semibold text-slate-800">
              <template v-if="member.isAlive">Còn sống</template>
              <template v-else>
                {{ member.deathDate || '—' }}
                <span v-if="member.deathDateLunar" class="text-amber-700 font-bold ml-1">
                  (Giỗ: {{ member.deathDateLunar }} ÂL)
                </span>
              </template>
            </span>
          </div>
          <div v-if="member.burialPlace" class="md:col-span-2">
            <span class="text-xs text-slate-400 block">Mộ phần / Nơi an táng</span>
            <span class="font-semibold text-amber-900 flex items-center gap-1">
              <span>📍</span> {{ member.burialPlace }}
            </span>
          </div>
          <div v-if="member.phone || member.address" class="md:col-span-2">
            <span class="text-xs text-slate-400 block">Liên hệ / Cư trú</span>
            <span class="text-slate-700">
              <span v-if="member.phone">📞 {{ member.phone }} </span>
              <span v-if="member.address">🏠 {{ member.address }}</span>
            </span>
          </div>
        </div>

        <!-- Phối ngẫu (Vợ / Chồng) -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <span>💍</span> Phối ngẫu (Vợ / Chồng)
            </h3>
            <button
              type="button"
              class="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
              @click="$emit('addSpouse', member)"
            >
              + Thêm phối ngẫu
            </button>
          </div>

          <div
            v-if="!member.spouses || member.spouses.length === 0"
            class="text-xs text-slate-400 italic py-2"
          >
            Chưa có thông tin phối ngẫu
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="sp in member.spouses"
              :key="sp.id"
              class="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-start justify-between gap-3"
            >
              <div>
                <div class="font-bold text-slate-800 text-sm">
                  {{ sp.title || 'Vợ' }}: {{ sp.fullName }}
                  <span
                    class="text-xs px-2 py-0.5 rounded-full ml-1"
                    :class="sp.isAlive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'"
                  >
                    {{ sp.isAlive ? 'Còn sống' : 'Đã mất' }}
                  </span>
                </div>
                <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3">
                  <span v-if="sp.birthYear || sp.deathYear">
                    Năm: {{ sp.birthYear || '?' }} – {{ sp.isAlive ? 'nay' : (sp.deathYear || '?') }}
                  </span>
                  <span v-if="!sp.isAlive && sp.deathDateLunar" class="text-amber-800 font-medium">
                    Giỗ: {{ sp.deathDateLunar }} ÂL
                  </span>
                  <span v-if="sp.origin">Quê quán: {{ sp.origin }}</span>
                </div>
                <div v-if="sp.burialPlace" class="text-xs text-amber-900 mt-1">
                  Mộ phần: {{ sp.burialPlace }}
                </div>
                <div v-if="sp.bio" class="text-xs text-slate-600 mt-1 italic">
                  "{{ sp.bio }}"
                </div>
              </div>

              <button
                type="button"
                class="text-xs text-rose-500 hover:text-rose-700 hover:underline flex-none"
                title="Xóa phối ngẫu"
                @click="$emit('removeSpouse', member.id, sp.id)"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- Danh sách Con cái -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <span>🌿</span> Các con ({{ member.children?.length || 0 }})
            </h3>
            <button
              type="button"
              class="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
              @click="$emit('addChild', member)"
            >
              + Thêm con
            </button>
          </div>

          <div
            v-if="!member.children || member.children.length === 0"
            class="text-xs text-slate-400 italic py-2"
          >
            Chưa có thông tin con cái
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              v-for="c in member.children"
              :key="c.id"
              type="button"
              class="text-left p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-colors flex items-center justify-between group"
              @click="$emit('focusMember', c.id)"
            >
              <div>
                <span class="font-semibold text-slate-800 group-hover:text-amber-900 text-xs">
                  {{ c.fullName }}
                </span>
                <span v-if="c.orderTitle" class="text-[11px] text-amber-800 block">
                  {{ c.orderTitle }}
                </span>
              </div>
              <span class="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        <!-- Tiểu sử & Công trạng -->
        <div v-if="member.bio">
          <h3 class="font-bold text-slate-800 flex items-center gap-2 mb-1.5">
            <span>📜</span> Tiểu sử & Công trạng
          </h3>
          <div class="p-3.5 bg-amber-50/30 border border-amber-200/50 rounded-xl text-slate-700 leading-relaxed font-serif text-sm">
            {{ member.bio }}
          </div>
        </div>
      </div>

      <!-- Footer thao tác -->
      <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          @click="$emit('delete', member)"
        >
          Xóa thành viên
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-colors"
            @click="$emit('edit', member)"
          >
            Sửa thông tin
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
            @click="$emit('close')"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FamilyMember } from '../../types/family'
import { getGenerationStyle } from '../../data/generationStyles'

const props = defineProps<{
  member: FamilyMember | null
}>()

defineEmits<{
  close: []
  edit: [member: FamilyMember]
  addChild: [parent: FamilyMember]
  addSpouse: [member: FamilyMember]
  removeSpouse: [memberId: string, spouseId: string]
  focusMember: [memberId: string]
  delete: [member: FamilyMember]
}>()

const genStyle = computed(() => {
  return props.member ? getGenerationStyle(props.member.generation) : getGenerationStyle(1)
})
</script>
