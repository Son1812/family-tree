<template>
  <div class="space-y-5">
    <!-- Header: Tiêu đề & Thanh chuyển đổi chế độ xem Dạng Lịch <-> Dạng Danh Sách -->
    <div class="bg-kyn-bg-primary rounded-kyn-4 border border-kyn-divider-dividers-2 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-lg sm:text-xl font-bold text-kyn-text-title">Sổ Giỗ Chạp & Lịch Vạn Niên</h2>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            {{ deathAnniversaries.length }} ngày giỗ
          </span>
        </div>
        <p class="text-xs text-kyn-text-subtitle mt-0.5">
          Tra cứu ngày giỗ tiên tổ đối chiếu song song giữa Âm lịch và Dương lịch
        </p>
      </div>

      <!-- Thanh công cụ chuyển đổi Dạng Lịch / Dạng Danh Sách & Điều hướng thời gian -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <!-- Nút chuyển đổi chế độ xem nổi bật (Dạng Lịch <-> Dạng Danh Sách) -->
        <div class="inline-flex items-center p-1 rounded-xl bg-kyn-bg-secondary-2 border border-kyn-divider-dividers-2 shadow-xs">
          <button
            type="button"
            class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none"
            :class="
              viewMode === 'calendar'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-kyn-text-secondary hover:text-kyn-text-title hover:bg-kyn-bg-secondary-1'
            "
            @click="viewMode = 'calendar'"
          >
            <KynIcon name="calendar-days" :size="15" />
            <span>Dạng lịch</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none"
            :class="
              viewMode === 'list'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-kyn-text-secondary hover:text-kyn-text-title hover:bg-kyn-bg-secondary-1'
            "
            @click="viewMode = 'list'"
          >
            <KynIcon name="list" :size="15" />
            <span>Dạng danh sách</span>
          </button>
        </div>

        <!-- Bộ chọn tháng & năm (Khi ở chế độ Lịch Vạn Niên) -->
        <div v-if="viewMode === 'calendar'" class="flex items-center gap-1.5">
          <button
            type="button"
            class="w-8 h-8 rounded-lg border border-kyn-divider-dividers-2 flex items-center justify-center hover:bg-kyn-bg-secondary-2 text-kyn-text-secondary hover:text-kyn-text-title transition-colors cursor-pointer"
            title="Tháng trước"
            @click="changeMonth(-1)"
          >
            <KynIcon name="chevron-left" :size="16" />
          </button>

          <!-- Dropdown Tháng -->
          <select
            v-model="currentMonth"
            class="h-8 px-2.5 text-xs font-semibold rounded-lg border border-kyn-divider-dividers-2 bg-kyn-bg-secondary-2 text-kyn-text-title outline-none focus:border-kyn-primary cursor-pointer"
          >
            <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
          </select>

          <!-- Dropdown Năm -->
          <select
            v-model="currentYear"
            class="h-8 px-2.5 text-xs font-semibold rounded-lg border border-kyn-divider-dividers-2 bg-kyn-bg-secondary-2 text-kyn-text-title outline-none focus:border-kyn-primary cursor-pointer"
          >
            <option v-for="y in yearOptions" :key="y" :value="y">Năm {{ y }}</option>
          </select>

          <button
            type="button"
            class="w-8 h-8 rounded-lg border border-kyn-divider-dividers-2 flex items-center justify-center hover:bg-kyn-bg-secondary-2 text-kyn-text-secondary hover:text-kyn-text-title transition-colors cursor-pointer"
            title="Tháng sau"
            @click="changeMonth(1)"
          >
            <KynIcon name="chevron-right" :size="16" />
          </button>

          <!-- Nút Hôm nay -->
          <button
            type="button"
            class="h-8 px-2.5 text-xs font-semibold rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer ml-1"
            title="Về tháng hiện tại"
            @click="goToToday"
          >
            Hôm nay
          </button>
        </div>

        <!-- Bộ chọn năm đối chiếu (Khi ở chế độ Danh Sách) -->
        <div v-else class="flex items-center gap-1.5">
          <span class="text-xs text-kyn-text-subtitle hidden sm:inline">Dương lịch:</span>
          <select
            v-model="currentYear"
            class="h-8 px-2.5 text-xs font-semibold rounded-lg border border-kyn-divider-dividers-2 bg-kyn-bg-secondary-2 text-kyn-text-title outline-none focus:border-kyn-primary cursor-pointer"
          >
            <option v-for="y in yearOptions" :key="y" :value="y">Năm {{ y }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Banner Ngày Giỗ Hôm Nay hoặc Tóm tắt Âm Dương -->
    <div
      v-if="todayAnniversaries.length > 0"
      class="bg-gradient-to-r from-amber-950 via-amber-900 to-rose-950 rounded-kyn-4 p-5 text-white shadow-lg border border-amber-800/40"
    >
      <div class="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
        <span class="inline-block animate-pulse text-base">🕯️</span>
        <span>HÔM NAY CÓ {{ todayAnniversaries.length }} NGÀY GIỖ TRONG DÒNG HỌ:</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
        <div
          v-for="item in todayAnniversaries"
          :key="item.memberId + item.name"
          class="bg-white/10 dark:bg-black/30 backdrop-blur-md p-3.5 rounded-kyn-3 border border-white/15 flex items-start justify-between gap-3"
        >
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full inline-block">
                {{ item.lunarDate }} ÂL (Hôm nay)
              </span>
              <span class="text-xs text-amber-100/80">Đời {{ item.generation }}</span>
            </div>
            <h4 class="font-bold text-base text-white mt-1">{{ item.name }}</h4>
            <div class="text-xs text-amber-100/80 mt-0.5">
              {{ item.role }}
              <span v-if="item.spouseOfName"> (phối ngẫu {{ item.spouseOfName }})</span>
            </div>
            <div v-if="item.burialPlace" class="text-xs text-amber-200 mt-1 flex items-center gap-1">
              <KynIcon name="map-pin" :size="12" /> An táng: {{ item.burialPlace }}
            </div>
          </div>
          <AppButton
            variant="primary"
            size="sm"
            @click="handleLocate(item.memberId)"
          >
            Xem vị trí
          </AppButton>
        </div>
      </div>
    </div>

    <!-- Banner Thông tin Ngày Hôm Nay (khi không có giỗ hôm nay) -->
    <div
      v-else
      class="bg-gradient-to-r from-amber-950/90 via-amber-900/90 to-stone-900/90 rounded-kyn-4 p-4 sm:p-5 text-white shadow-md border border-amber-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <div class="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <KynIcon name="calendar-days" :size="14" />
          <span>Lịch Vạn Niên Việt Nam</span>
        </div>
        <h3 class="text-lg sm:text-xl font-bold mt-1 text-white">
          Hôm nay: {{ todaySolarText }}
        </h3>
        <p class="text-xs text-amber-200/90 mt-0.5">
          {{ todayLunar.text }}
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <div class="bg-white/10 rounded-kyn-2 px-3 py-2 border border-white/10 text-center min-w-[90px]">
          <div class="text-[10px] text-amber-200 uppercase font-semibold">Dương lịch</div>
          <div class="text-lg font-bold text-white">{{ todayD }}/{{ todayM }}</div>
        </div>
        <div class="bg-white/10 rounded-kyn-2 px-3 py-2 border border-white/10 text-center min-w-[90px]">
          <div class="text-[10px] text-amber-200 uppercase font-semibold">Âm lịch</div>
          <div class="text-lg font-bold text-amber-300">{{ todayLunar.day }}/{{ todayLunar.month }}</div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- CHẾ ĐỘ 1: DẠNG LỊCH (LỊCH VẠN NIÊN THÁNG VỚI NGÀY ÂM & DƯƠNG) -->
    <!-- ========================================================================= -->
    <div v-if="viewMode === 'calendar'" class="space-y-4">
      <div class="bg-kyn-bg-primary rounded-kyn-4 border border-kyn-divider-dividers-2 shadow-xs p-4 sm:p-5 transition-colors duration-200">
        <!-- Tiêu đề tháng đang xem -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-kyn-divider-dividers-2">
          <div class="flex items-center gap-2">
            <h3 class="text-base sm:text-lg font-bold text-kyn-text-title">
              Tháng {{ currentMonth }} năm {{ currentYear }}
            </h3>
            <span class="text-xs text-kyn-text-subtitle">
              ({{ getLunarMonthRangeText }})
            </span>
          </div>

          <div class="flex items-center gap-3 text-xs text-kyn-text-subtitle">
            <span class="inline-flex items-center gap-1.5">
              <span class="w-3 h-3 rounded bg-amber-500/20 border border-amber-500 inline-block"></span>
              <span>Có ngày giỗ</span>
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="w-3 h-3 rounded bg-kyn-bg-primary border-2 border-amber-500 inline-block"></span>
              <span>Hôm nay</span>
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="w-3 h-3 rounded bg-rose-500/20 inline-block"></span>
              <span>Mùng 1 / Rằm</span>
            </span>
          </div>
        </div>

        <!-- Lưới lịch 7 cột (Thứ Hai -> Chủ Nhật) -->
        <div class="overflow-x-auto">
          <div class="min-w-[680px]">
            <!-- Header Thứ -->
            <div class="grid grid-cols-7 gap-1 text-center font-bold text-xs uppercase tracking-wider py-2 bg-kyn-bg-secondary-2 rounded-t-lg border-b border-kyn-divider-dividers-2 text-kyn-text-secondary select-none">
              <div>Thứ 2</div>
              <div>Thứ 3</div>
              <div>Thứ 4</div>
              <div>Thứ 5</div>
              <div>Thứ 6</div>
              <div class="text-amber-600 dark:text-amber-400">Thứ 7</div>
              <div class="text-rose-600 dark:text-rose-400">Chủ Nhật</div>
            </div>

            <!-- Các ô ngày trong tháng -->
            <div class="grid grid-cols-7 gap-1 mt-1">
              <div
                v-for="cell in calendarCells"
                :key="cell.solarYear + '-' + cell.solarMonth + '-' + cell.solarDay"
                class="min-h-[82px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-lg border transition-all duration-150 flex flex-col justify-between cursor-pointer relative"
                :class="[
                  cell.isCurrentMonth
                    ? 'bg-kyn-bg-primary text-kyn-text-title'
                    : 'bg-kyn-bg-secondary-1/50 text-kyn-text-disable border-transparent',
                  cell.isToday
                    ? 'border-2 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-kyn-divider-dividers-1 hover:border-kyn-primary',
                  selectedCell && isSameCell(selectedCell, cell)
                    ? 'ring-2 ring-kyn-primary border-kyn-primary'
                    : '',
                  getAnniversariesForCell(cell).length > 0
                    ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/15 to-orange-500/15 border-amber-500/50 shadow-xs'
                    : '',
                ]"
                @click="selectedCell = cell"
              >
                <!-- Hàng trên: Ngày Dương Lịch & Biểu tượng Giỗ -->
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-1">
                    <span
                      class="text-sm sm:text-base font-bold leading-none font-mono"
                      :class="[
                        cell.isToday ? 'text-amber-600 dark:text-amber-400 font-black' : '',
                        !cell.isCurrentMonth ? 'text-kyn-text-disable' : '',
                        cell.dayOfWeek === 0 && cell.isCurrentMonth ? 'text-rose-600 dark:text-rose-400' : '',
                        cell.dayOfWeek === 6 && cell.isCurrentMonth ? 'text-amber-600 dark:text-amber-400' : '',
                      ]"
                    >
                      {{ cell.solarDay }}
                    </span>
                    <span
                      v-if="cell.isToday"
                      class="text-[8.5px] px-1 py-0 rounded font-bold uppercase tracking-wider bg-amber-500 text-white"
                    >
                      Nay
                    </span>
                  </div>

                  <!-- Biểu tượng ngọn nến nếu có giỗ -->
                  <div v-if="getAnniversariesForCell(cell).length > 0" class="flex items-center gap-0.5">
                    <span class="text-xs" title="Ngày giỗ dòng họ">🕯️</span>
                    <span
                      v-if="getAnniversariesForCell(cell).length > 1"
                      class="text-[9px] font-bold px-1 rounded-full bg-amber-600 text-white"
                    >
                      {{ getAnniversariesForCell(cell).length }}
                    </span>
                  </div>
                </div>

                <!-- Giữa: Tên người giỗ (nếu có) -->
                <div v-if="getAnniversariesForCell(cell).length > 0" class="my-0.5 min-w-0">
                  <div
                    v-for="ann in getAnniversariesForCell(cell).slice(0, 1)"
                    :key="ann.memberId + ann.name"
                    class="text-[10px] sm:text-[10.5px] font-bold text-amber-700 dark:text-amber-300 truncate leading-tight"
                    :title="`Giỗ: ${ann.name} (${ann.role})`"
                  >
                    Giỗ: {{ ann.name }}
                  </div>
                  <div
                    v-if="getAnniversariesForCell(cell).length > 1"
                    class="text-[9px] text-amber-600 dark:text-amber-400 italic truncate"
                  >
                    +{{ getAnniversariesForCell(cell).length - 1 }} người khác
                  </div>
                </div>

                <!-- Hàng dưới: Ngày Âm Lịch (Số âm to rõ) -->
                <div class="flex items-center justify-between text-[10px] sm:text-[11px] pt-1 border-t border-kyn-divider-dividers-1/60 select-none">
                  <span
                    class="text-[9px] font-medium truncate max-w-[65px] text-kyn-text-subtitle hidden sm:inline"
                    :title="cell.canChiDay"
                  >
                    {{ cell.canChiDay }}
                  </span>
                  <span
                    class="font-bold ml-auto font-mono text-[10.5px] sm:text-[11px]"
                    :class="[
                      cell.isFirstOrFullMoon
                        ? 'text-rose-600 dark:text-rose-400 font-extrabold bg-rose-500/15 px-1 rounded border border-rose-500/30'
                        : 'text-amber-700 dark:text-amber-400 font-semibold',
                    ]"
                    :title="`Âm lịch: Ngày ${cell.lunarDay} tháng ${cell.lunarMonth}`"
                  >
                    {{ cell.lunarLabel }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chuyển nhanh sang Dạng Danh Sách từ chân lịch -->
        <div class="mt-4 pt-3 border-t border-kyn-divider-dividers-2 flex items-center justify-between text-xs">
          <span class="text-kyn-text-subtitle">
            Nhấp vào ô ngày để xem chi tiết các cụ quy tiên và thông tin âm dương
          </span>
          <button
            type="button"
            class="font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
            @click="viewMode = 'list'"
          >
            <span>Xem danh sách toàn bộ ngày giỗ</span>
            <KynIcon name="arrow-right" :size="13" />
          </button>
        </div>
      </div>

      <!-- Khung Chi Tiết Ngày Đang Chọn trên Lịch -->
      <div v-if="selectedCell" class="bg-kyn-bg-primary rounded-kyn-4 border border-kyn-divider-dividers-2 p-5 shadow-xs transition-colors duration-200">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-kyn-divider-dividers-2">
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-base font-bold text-kyn-text-title">
                {{ formatSelectedCellSolarDate(selectedCell) }}
              </h4>
              <span
                v-if="selectedCell.isToday"
                class="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white"
              >
                Hôm nay
              </span>
            </div>
            <div class="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5 flex flex-wrap items-center gap-2">
              <span>Âm lịch: Ngày {{ selectedCell.lunarDay }} tháng {{ selectedCell.lunarMonth }}</span>
              <span>·</span>
              <span>Ngày {{ selectedCell.canChiDay }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs text-kyn-text-subtitle">
            <span v-if="selectedCellAnniversaries.length > 0" class="font-bold text-amber-600 dark:text-amber-400">
              🕯️ {{ selectedCellAnniversaries.length }} ngày giỗ trong ngày này
            </span>
            <span v-else>Không có ngày giỗ</span>
          </div>
        </div>

        <!-- Danh sách ngày giỗ trong ngày đang chọn -->
        <div v-if="selectedCellAnniversaries.length > 0" class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div
            v-for="item in selectedCellAnniversaries"
            :key="item.memberId + item.name"
            class="p-4 rounded-kyn-3 border border-amber-500/50 bg-amber-500/10 flex flex-col justify-between gap-3 shadow-xs"
          >
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="px-2 py-0.5 rounded font-bold bg-amber-600 text-white text-[11px]">
                  Giỗ: {{ item.lunarDate }} ÂL
                </span>
                <span class="font-medium text-kyn-text-secondary text-[11px]">
                  Đời thứ {{ item.generation }}
                </span>
              </div>
              <h5 class="font-bold text-base text-kyn-text-title mt-1.5">
                {{ item.name }}
              </h5>
              <div class="text-xs text-kyn-text-subtitle mt-0.5">
                {{ item.role }}
                <span v-if="item.spouseOfName"> (phối ngẫu {{ item.spouseOfName }})</span>
              </div>
              <div v-if="item.branch" class="text-xs text-kyn-text-secondary mt-1">
                Thuộc: {{ item.branch }}
              </div>
              <div v-if="item.burialPlace" class="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                <KynIcon name="map-pin" :size="12" class="flex-none" />
                <span>An táng tại: {{ item.burialPlace }}</span>
              </div>
            </div>

            <div class="pt-2 border-t border-amber-500/20 flex items-center justify-end">
              <AppButton
                variant="secondary"
                size="sm"
                @click="handleLocate(item.memberId)"
              >
                <KynIcon name="git-branch" :size="13" />
                <span>Định vị trên phả đồ</span>
              </AppButton>
            </div>
          </div>
        </div>

        <div v-else class="py-6 text-center text-kyn-text-subtitle text-xs">
          Ngày này không có ngày giỗ nào trong gia tộc họ Phạm.
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- CHẾ ĐỘ 2: DẠNG DANH SÁCH (SỔ GIỖ CẢ NĂM KÈM BỘ LỌC & ĐỐI CHIẾU DƯƠNG LỊCH) -->
    <!-- ========================================================================= -->
    <div v-else class="bg-kyn-bg-primary rounded-kyn-4 border border-kyn-divider-dividers-2 p-5 sm:p-6 shadow-xs transition-colors duration-200 space-y-5">
      <!-- Header Danh Sách & Bộ Lọc -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-kyn-divider-dividers-2">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base sm:text-lg font-bold text-kyn-text-title">
              Danh Sách Giỗ Chạp Cả Năm (Theo 12 Tháng Âm Lịch)
            </h3>
            <span class="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
              {{ filteredAnniversaries.length }} ngày giỗ
            </span>
          </div>
          <p class="text-xs text-kyn-text-subtitle mt-0.5">
            Đối chiếu ngày Dương lịch tương ứng trong năm {{ currentYear }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Ô tìm kiếm tên cụ -->
          <div class="relative">
            <input
              v-model="listSearchQuery"
              type="text"
              placeholder="Tìm theo tên cụ..."
              class="pl-8 pr-3 py-1.5 text-xs rounded-kyn-2 border border-kyn-divider-dividers-2 bg-kyn-bg-secondary-2 text-kyn-text-title placeholder:text-kyn-text-subtitle outline-none focus:border-kyn-primary w-44 sm:w-48 transition-all"
            />
            <span class="absolute left-2.5 top-2 text-kyn-icon-tertiary">
              <KynIcon name="search" :size="14" />
            </span>
          </div>

          <!-- Lọc theo tháng âm lịch -->
          <select
            v-model="filterMonth"
            class="px-2.5 py-1.5 text-xs rounded-kyn-2 border border-kyn-divider-dividers-2 bg-kyn-bg-secondary-2 text-kyn-text-title outline-none focus:border-kyn-primary cursor-pointer"
          >
            <option :value="null">Tất cả 12 tháng</option>
            <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }} Âm lịch</option>
          </select>

          <!-- Nút chuyển về Dạng Lịch -->
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-semibold rounded-kyn-2 border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer flex items-center gap-1.5"
            @click="viewMode = 'calendar'"
          >
            <KynIcon name="calendar-days" :size="13" />
            <span>Xem dạng lịch</span>
          </button>
        </div>
      </div>

      <!-- Bảng danh sách ngày giỗ cả năm (Dạng danh sách - bảng) -->
      <div class="overflow-auto rounded-kyn-3 border border-kyn-divider-dividers-2 max-h-[calc(100vh-320px)] min-h-[300px] shadow-inner relative bg-kyn-bg-primary">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="sticky top-0 z-10 bg-kyn-bg-secondary-2 border-b border-kyn-divider-dividers-2 text-kyn-text-subtitle font-semibold uppercase tracking-wider text-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <tr>
              <th class="py-2.5 px-3 bg-kyn-bg-secondary-2 w-12 text-center">STT</th>
              <th class="py-2.5 px-4 bg-kyn-bg-secondary-2">Người được giỗ</th>
              <th class="py-2.5 px-3 bg-kyn-bg-secondary-2">Ngày giỗ (Âm lịch)</th>
              <th class="py-2.5 px-3 bg-kyn-bg-secondary-2">Dương lịch năm {{ currentYear }}</th>
              <th class="py-2.5 px-3 bg-kyn-bg-secondary-2">Thế hệ</th>
              <th class="py-2.5 px-3 bg-kyn-bg-secondary-2">Chi phái</th>
              <th class="py-2.5 px-4 bg-kyn-bg-secondary-2">Mộ phần / Nơi an táng</th>
              <th class="py-2.5 px-4 text-right bg-kyn-bg-secondary-2">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-kyn-divider-dividers-1">
            <tr
              v-for="(item, idx) in filteredAnniversaries"
              :key="item.memberId + item.name"
              class="hover:bg-kyn-bg-secondary-1 transition-colors h-[52px]"
              :class="item.isToday ? 'bg-amber-500/10' : ''"
            >
              <!-- STT -->
              <td class="py-2 px-3 text-center align-middle whitespace-nowrap">
                <span class="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 rounded-md font-mono text-[11.5px] font-bold tabular-nums bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                  {{ idx + 1 }}
                </span>
              </td>

              <!-- Người được giỗ & Vai vế -->
              <td class="py-2 px-4 align-middle">
                <div>
                  <div
                    class="font-bold text-kyn-text-title text-[13px] hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-1.5"
                    @click="handleLocate(item.memberId)"
                  >
                    <span>{{ item.name }}</span>
                    <span
                      v-if="item.isToday"
                      class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-amber-500 text-white"
                    >
                      Hôm nay
                    </span>
                  </div>
                  <div class="text-[11px] text-kyn-text-subtitle mt-0.5">
                    {{ item.role }}
                    <span v-if="item.spouseOfName" class="italic"> (phối ngẫu {{ item.spouseOfName }})</span>
                  </div>
                </div>
              </td>

              <!-- Ngày giỗ Âm lịch -->
              <td class="py-2 px-3 align-middle whitespace-nowrap">
                <span
                  class="px-2.5 py-1 rounded-full font-bold font-mono tracking-wide text-xs"
                  :class="
                    item.isToday
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  "
                >
                  {{ item.lunarDate }} ÂL
                </span>
              </td>

              <!-- Dương lịch tương ứng năm nay -->
              <td class="py-2 px-3 align-middle whitespace-nowrap">
                <div class="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                  <span>{{ getSolarDateFullText(item.lunarDay, item.lunarMonth, currentYear) }}</span>
                </div>
              </td>

              <!-- Thế hệ -->
              <td class="py-2 px-3 align-middle whitespace-nowrap">
                <span
                  class="px-2 py-0.5 rounded-full font-bold text-[10px]"
                  :style="{
                    background: getGenerationStyle(item.generation).bgColor,
                    color: getGenerationStyle(item.generation).color,
                  }"
                >
                  {{ getGenerationStyle(item.generation).roman }}
                </span>
              </td>

              <!-- Chi phái -->
              <td class="py-2 px-3 text-kyn-text-secondary align-middle whitespace-nowrap">
                {{ item.branch || '—' }}
              </td>

              <!-- Mộ phần / Nơi an táng -->
              <td class="py-2 px-4 text-kyn-text-secondary align-middle max-w-xs truncate">
                <div v-if="item.burialPlace" class="flex items-center gap-1 text-[11.5px] text-amber-600 dark:text-amber-400" :title="item.burialPlace">
                  <KynIcon name="map-pin" :size="12" class="flex-none" />
                  <span class="truncate">{{ item.burialPlace }}</span>
                </div>
                <span v-else class="text-kyn-text-disable">—</span>
              </td>

              <!-- Thao tác -->
              <td class="py-2 px-4 text-right align-middle whitespace-nowrap">
                <AppButton
                  size="sm"
                  variant="secondary"
                  title="Định vị trên sơ đồ phả hệ"
                  @click="handleLocate(item.memberId)"
                >
                  <KynIcon name="git-branch" :size="12" />
                  <span>Xem trên cây</span>
                </AppButton>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredAnniversaries.length === 0" class="py-16 text-center text-kyn-text-subtitle text-xs">
          Không tìm thấy ngày giỗ nào phù hợp với bộ lọc
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AppButton, KynIcon } from '@kyn/vue-components'
import { useFamilyTree } from '../composables/useFamilyTree'
import { getGenerationStyle } from '../data/generationStyles'
import {
  getTodayLunar,
  buildMonthCalendarGrid,
  convertLunar2SolarForYear,
  type CalendarDayCell,
} from '../utils/lunar'
import type { DeathAnniversary } from '../types/family'

const emit = defineEmits<{
  (e: 'locate-on-tree', memberId: string): void
}>()

function handleLocate(id: string) {
  emit('locate-on-tree', id)
}

const { deathAnniversaries } = useFamilyTree()
const todayLunar = getTodayLunar()

const now = new Date()
const todayD = now.getDate()
const todayM = now.getMonth() + 1
const todayY = now.getFullYear()

const todaySolarText = computed(() => {
  const dows = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  return `${dows[now.getDay()]}, ${todayD < 10 ? '0' + todayD : todayD}/${todayM < 10 ? '0' + todayM : todayM}/${todayY}`
})

// Chế độ xem: 'calendar' (Dạng lịch) hoặc 'list' (Dạng danh sách)
const viewMode = ref<'calendar' | 'list'>('calendar')

// Tháng và Năm đang xem trên lịch
const currentMonth = ref<number>(todayM)
const currentYear = ref<number>(todayY)

// Các tùy chọn năm hiển thị
const yearOptions = computed(() => {
  const base = todayY
  return [base - 2, base - 1, base, base + 1, base + 2, base + 3, base + 4]
})

function changeMonth(delta: number) {
  let m = currentMonth.value + delta
  let y = currentYear.value
  if (m < 1) {
    m = 12
    y -= 1
  } else if (m > 12) {
    m = 1
    y += 1
  }
  currentMonth.value = m
  currentYear.value = y
}

function goToToday() {
  currentMonth.value = todayM
  currentYear.value = todayY
  const cell = calendarCells.value.find((c) => c.isToday)
  if (cell) selectedCell.value = cell
}

// Lưới các ô lịch của tháng
const calendarCells = computed<CalendarDayCell[]>(() => {
  return buildMonthCalendarGrid(currentYear.value, currentMonth.value)
})

// Ô ngày đang được chọn để xem chi tiết
const selectedCell = ref<CalendarDayCell | null>(null)

// Tự động chọn ngày hôm nay khi mở lịch
const initialCell = calendarCells.value.find((c) => c.isToday) || calendarCells.value.find((c) => c.isCurrentMonth && c.solarDay === 1) || null
selectedCell.value = initialCell

function isSameCell(a: CalendarDayCell, b: CalendarDayCell): boolean {
  return a.solarDay === b.solarDay && a.solarMonth === b.solarMonth && a.solarYear === b.solarYear
}

// Lấy danh sách ngày giỗ trùng với ô ngày lịch
function getAnniversariesForCell(cell: CalendarDayCell): DeathAnniversary[] {
  return deathAnniversaries.value.filter(
    (a) => a.lunarDay === cell.lunarDay && a.lunarMonth === cell.lunarMonth,
  )
}

// Danh sách giỗ của ngày đang chọn
const selectedCellAnniversaries = computed<DeathAnniversary[]>(() => {
  if (!selectedCell.value) return []
  return getAnniversariesForCell(selectedCell.value)
})

function formatSelectedCellSolarDate(cell: CalendarDayCell): string {
  const dows = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const dow = dows[cell.dayOfWeek]
  const d = cell.solarDay < 10 ? '0' + cell.solarDay : cell.solarDay
  const m = cell.solarMonth < 10 ? '0' + cell.solarMonth : cell.solarMonth
  return `${dow}, ngày ${d}/${m}/${cell.solarYear} (Dương lịch)`
}

// Chuỗi hiển thị khoảng tháng âm lịch trong tháng dương
const getLunarMonthRangeText = computed(() => {
  const currentMonthCells = calendarCells.value.filter((c) => c.isCurrentMonth)
  if (currentMonthCells.length === 0) return ''
  const first = currentMonthCells[0]
  const last = currentMonthCells[currentMonthCells.length - 1]
  if (first.lunarMonth === last.lunarMonth) {
    return `Tháng ${first.lunarMonth} Âm lịch`
  }
  return `Tháng ${first.lunarMonth} – Tháng ${last.lunarMonth} Âm lịch`
})

// Tính ngày dương lịch tương ứng cho ngày giỗ âm lịch
function getSolarDateText(lunarDay: number, lunarMonth: number, year: number): string {
  const res = convertLunar2SolarForYear(lunarDay, lunarMonth, year)
  if (!res) return 'Chưa tính được'
  const [d, m, y] = res
  const dStr = d < 10 ? '0' + d : d
  const mStr = m < 10 ? '0' + m : m
  return `${dStr}/${mStr}/${y}`
}

function getSolarDateFullText(lunarDay: number, lunarMonth: number, year: number): string {
  const res = convertLunar2SolarForYear(lunarDay, lunarMonth, year)
  if (!res) return '—'
  const [d, m, y] = res
  const dows = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const dow = dows[new Date(y, m - 1, d).getDay()]
  const dStr = d < 10 ? '0' + d : d
  const mStr = m < 10 ? '0' + m : m
  return `${dow}, ${dStr}/${mStr}/${y}`
}

// Bộ lọc cho chế độ danh sách
const filterMonth = ref<number | null>(null)
const listSearchQuery = ref('')

const todayAnniversaries = computed(() => {
  return deathAnniversaries.value.filter((a) => a.isToday)
})

const filteredAnniversaries = computed(() => {
  return deathAnniversaries.value.filter((a) => {
    if (filterMonth.value !== null && a.lunarMonth !== filterMonth.value) {
      return false
    }
    if (listSearchQuery.value) {
      const q = listSearchQuery.value.toLowerCase()
      const matchName = a.name.toLowerCase().includes(q)
      const matchSpouse = a.spouseOfName?.toLowerCase().includes(q)
      const matchBranch = a.branch.toLowerCase().includes(q)
      if (!matchName && !matchSpouse && !matchBranch) return false
    }
    return true
  })
})
</script>
