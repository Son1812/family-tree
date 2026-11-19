<template>
  <div class="space-y-6">
    <!-- Banner Âm Lịch Hôm Nay -->
    <div
      class="bg-gradient-to-r from-amber-900 via-amber-800 to-rose-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <div class="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider">
          <span>🏮</span> Lịch Vạn Niên & Giỗ Chạp Dòng Họ
        </div>
        <h2 class="text-2xl font-bold font-serif mt-1">
          Hôm nay: {{ todayLunar.text }}
        </h2>
        <p class="text-xs text-amber-100/80 mt-1">
          "Uống nước nhớ nguồn, chim có tổ người có tông" – Bổn phận con cháu ghi nhớ ngày tiên tổ quy tiên.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[120px]">
          <div class="text-xs text-amber-200 uppercase font-semibold">Tháng Âm lịch</div>
          <div class="text-2xl font-bold font-serif">{{ todayLunar.month }}</div>
        </div>
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[120px]">
          <div class="text-xs text-amber-200 uppercase font-semibold">Ngày Âm lịch</div>
          <div class="text-2xl font-bold font-serif text-amber-300">{{ todayLunar.day }}</div>
        </div>
      </div>
    </div>

    <!-- Ngày Giỗ Trùng Hôm Nay hoặc Sắp tới trong tháng -->
    <div v-if="todayAnniversaries.length > 0" class="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-md">
      <div class="flex items-center gap-2 text-amber-900 font-bold text-base mb-3">
        <span class="animate-bounce">🕯️</span>
        <span>HÔM NAY CÓ NGÀY GIỖ TRONG DÒNG HỌ:</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in todayAnniversaries"
          :key="item.memberId + item.name"
          class="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex items-start justify-between"
        >
          <div>
            <span class="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              HÔM NAY ({{ item.lunarDate }} ÂL)
            </span>
            <h4 class="font-bold text-lg text-slate-800 font-serif mt-1">{{ item.name }}</h4>
            <div class="text-xs text-slate-500 mt-0.5">
              {{ item.role }} · {{ item.branch }} · Đời {{ item.generation }}
            </div>
            <div v-if="item.burialPlace" class="text-xs text-amber-900 mt-2 flex items-center gap-1">
              <span>📍</span> An táng tại: {{ item.burialPlace }}
            </div>
          </div>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-sm transition-colors"
            @click="$emit('locateOnTree', item.memberId)"
          >
            Định vị trên cây
          </button>
        </div>
      </div>
    </div>

    <!-- Danh Sách Toàn Bộ Ngày Giỗ Trong Năm (Sắp xếp theo thứ tự tháng) -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-800 font-serif">
            Sổ Giỗ Chạp Cả Năm (Theo 12 Tháng Âm Lịch)
          </h3>
          <p class="text-xs text-slate-500">
            Tổng cộng {{ deathAnniversaries.length }} ngày giỗ đã được ghi chép trong phả hệ
          </p>
        </div>

        <!-- Lọc theo tháng âm lịch -->
        <select
          v-model="filterMonth"
          class="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 outline-none"
        >
          <option :value="null">Tất cả 12 tháng</option>
          <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }} Âm lịch</option>
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in filteredAnniversaries"
          :key="item.memberId + item.name"
          class="p-4 rounded-xl border transition-all duration-150 hover:shadow-md flex flex-col justify-between"
          :class="[
            item.isToday
              ? 'border-amber-400 bg-amber-50/60'
              : 'border-slate-200 bg-slate-50/40 hover:border-amber-400',
          ]"
        >
          <div>
            <div class="flex items-center justify-between text-xs mb-2">
              <span
                class="px-2.5 py-0.5 rounded-full font-bold font-mono tracking-wide"
                :class="
                  item.isToday
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-900'
                "
              >
                Giỗ: {{ item.lunarDate }} ÂL
              </span>
              <span class="text-slate-500 font-medium text-[11px]">
                {{ item.branch }}
              </span>
            </div>

            <h4 class="font-bold text-base text-slate-800 font-serif">
              {{ item.name }}
            </h4>
            <div class="text-xs text-slate-500 mt-0.5">
              {{ item.role }}
              <span v-if="item.spouseOfName"> (phối ngẫu {{ item.spouseOfName }})</span>
            </div>

            <div v-if="item.burialPlace" class="text-[11px] text-amber-900 mt-2.5 line-clamp-2">
              📍 {{ item.burialPlace }}
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span class="text-slate-400">Đời thứ {{ item.generation }}</span>
            <button
              type="button"
              class="text-amber-800 hover:text-amber-900 font-semibold hover:underline"
              @click="$emit('locateOnTree', item.memberId)"
            >
              Xem vị trí ›
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredAnniversaries.length === 0" class="py-12 text-center text-slate-400 text-xs">
        Không có ngày giỗ nào trong tháng đã chọn
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFamilyTree } from '../composables/useFamilyTree'
import { getTodayLunar } from '../utils/lunar'

defineEmits<{
  locateOnTree: [memberId: string]
}>()

const { deathAnniversaries } = useFamilyTree()
const todayLunar = getTodayLunar()

const filterMonth = ref<number | null>(null)

const todayAnniversaries = computed(() => {
  return deathAnniversaries.value.filter((a) => a.isToday)
})

const filteredAnniversaries = computed(() => {
  if (filterMonth.value === null) return deathAnniversaries.value
  return deathAnniversaries.value.filter((a) => a.lunarMonth === filterMonth.value)
})
</script>
