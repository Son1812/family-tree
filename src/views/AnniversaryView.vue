<template>
  <div class="space-y-6">
    <!-- Banner Âm Lịch Hôm Nay -->
    <div
      class="bg-gradient-to-r from-amber-950 via-amber-900 to-rose-950 rounded-kyn-4 p-6 text-white shadow-lg border border-amber-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <div class="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <KynIcon name="calendar-days" :size="14" />
          <span>Lịch Vạn Niên & Giỗ Chạp Dòng Họ</span>
        </div>
        <h2 class="text-2xl font-bold mt-1 tracking-tight">
          Hôm nay: {{ todayLunar.text }}
        </h2>
        <p class="text-xs text-amber-100/80 mt-1 max-w-xl">
          "Uống nước nhớ nguồn, chim có tổ người có tông" – Bổn phận con cháu ghi nhớ ngày tiên tổ quy tiên.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-kyn-3 p-3 border border-white/20 text-center min-w-[120px]">
          <div class="text-xs text-amber-200 uppercase font-semibold">Tháng Âm lịch</div>
          <div class="text-2xl font-bold text-white">{{ todayLunar.month }}</div>
        </div>
        <div class="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-kyn-3 p-3 border border-white/20 text-center min-w-[120px]">
          <div class="text-xs text-amber-200 uppercase font-semibold">Ngày Âm lịch</div>
          <div class="text-2xl font-bold text-amber-300">{{ todayLunar.day }}</div>
        </div>
      </div>
    </div>

    <!-- Ngày Giỗ Trùng Hôm Nay hoặc Sắp tới trong tháng -->
    <div v-if="todayAnniversaries.length > 0" class="bg-amber-500/10 border-2 border-amber-500/40 rounded-kyn-4 p-5 shadow-xs">
      <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base mb-3">
        <KynIcon name="calendar-check-2" :size="18" class="text-amber-600 dark:text-amber-400" />
        <span>HÔM NAY CÓ NGÀY GIỖ TRONG DÒNG HỌ:</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in todayAnniversaries"
          :key="item.memberId + item.name"
          class="bg-kyn-bg-primary p-4 rounded-kyn-3 border border-kyn-divider-dividers-2 shadow-xs flex items-start justify-between gap-3"
        >
          <div>
            <span class="text-xs font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full inline-block">
              HÔM NAY ({{ item.lunarDate }} ÂL)
            </span>
            <h4 class="font-bold text-lg text-kyn-text-title mt-1">{{ item.name }}</h4>
            <div class="text-xs text-kyn-text-subtitle mt-0.5">
              {{ item.role }} · Đời {{ item.generation }}
            </div>
            <div v-if="item.burialPlace" class="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
              <KynIcon name="map-pin" :size="12" /> An táng tại: {{ item.burialPlace }}
            </div>
          </div>
          <AppButton
            variant="primary"
            size="sm"
            @click="handleLocate(item.memberId)"
          >
            Định vị trên cây
          </AppButton>
        </div>
      </div>
    </div>

    <!-- Danh Sách Toàn Bộ Ngày Giỗ Trong Năm (Sắp xếp theo thứ tự tháng) -->
    <div class="bg-kyn-bg-primary rounded-kyn-4 border border-kyn-divider-dividers-2 p-6 shadow-xs transition-colors duration-200">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 class="text-lg font-bold text-kyn-text-title">
            Sổ Giỗ Chạp Cả Năm (Theo 12 Tháng Âm Lịch)
          </h3>
          <p class="text-xs text-kyn-text-subtitle">
            Tổng cộng {{ deathAnniversaries.length }} ngày giỗ đã được ghi chép trong phả hệ
          </p>
        </div>

        <!-- Lọc theo tháng âm lịch -->
        <select
          v-model="filterMonth"
          class="px-3 py-1.5 text-xs rounded-kyn-2 border border-kyn-divider-dividers-2 bg-kyn-bg-secondary-2 text-kyn-text-title outline-none focus:border-kyn-primary cursor-pointer"
        >
          <option :value="null">Tất cả 12 tháng</option>
          <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }} Âm lịch</option>
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        <div
          v-for="item in filteredAnniversaries"
          :key="item.memberId + item.name"
          class="p-4 rounded-kyn-3 border transition-all duration-150 flex flex-col justify-between"
          :class="[
            item.isToday
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-kyn-divider-dividers-2 bg-kyn-bg-secondary-1 hover:border-amber-500/60',
          ]"
        >
          <div>
            <div class="flex items-center justify-between text-xs mb-2">
              <span
                class="px-2.5 py-0.5 rounded-full font-bold font-mono tracking-wide"
                :class="
                  item.isToday
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                "
              >
                Giỗ: {{ item.lunarDate }} ÂL
              </span>
              <span class="text-kyn-text-subtitle font-medium text-[11px]">
                Đời {{ item.generation }}
              </span>
            </div>

            <h4 class="font-bold text-base text-kyn-text-title">
              {{ item.name }}
            </h4>
            <div class="text-xs text-kyn-text-subtitle mt-0.5">
              {{ item.role }}
              <span v-if="item.spouseOfName"> (phối ngẫu {{ item.spouseOfName }})</span>
            </div>

            <div v-if="item.burialPlace" class="text-[11px] text-amber-600 dark:text-amber-400 mt-2.5 line-clamp-2 flex items-center gap-1">
              <KynIcon name="map-pin" :size="12" class="shrink-0" />
              <span>{{ item.burialPlace }}</span>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-kyn-divider-dividers-1 flex items-center justify-between text-xs">
            <span class="text-kyn-text-subtitle">Đời thứ {{ item.generation }}</span>
            <AppButton
              variant="ghost"
              size="sm"
              class="text-amber-600 hover:text-amber-700"
              @click="handleLocate(item.memberId)"
            >
              <span>Xem vị trí</span>
              <KynIcon name="chevron-right" :size="12" />
            </AppButton>
          </div>
        </div>
      </div>

      <div v-if="filteredAnniversaries.length === 0" class="py-12 text-center text-kyn-text-subtitle text-xs">
        Không có ngày giỗ nào trong tháng đã chọn
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AppButton, KynIcon } from '@kyn/vue-components'
import { useFamilyTree } from '../composables/useFamilyTree'
import { getTodayLunar } from '../utils/lunar'

const emit = defineEmits<{
  (e: 'locate-on-tree', memberId: string): void
}>()

function handleLocate(id: string) {
  emit('locate-on-tree', id)
}

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
