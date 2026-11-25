<template>
  <div class="max-w-5xl mx-auto space-y-8 py-2">
    <!-- Header Sử Ký -->
    <div class="text-center space-y-2">
      <AppBadge tone="primary" class="font-bold uppercase tracking-widest text-[11px] px-3 py-1">
        Văn Hiến Dòng Tộc
      </AppBadge>
      <h1 class="text-2xl sm:text-3xl font-bold text-kyn-text-title tracking-tight">
        Phả Ký & Tộc Ước Chi Phạm Tộc
      </h1>
      <p class="text-xs text-kyn-text-subtitle max-w-xl mx-auto">
        "Cây có gốc mới nở cành xanh ngọn, nước có nguồn mới biển rộng sông sâu. Con người có tổ tiên mới nên thân nên hình."
      </p>
    </div>

    <!-- Cội nguồn lịch sử -->
    <!-- <div class="bg-kyn-bg-primary rounded-kyn-4 border border-kyn-divider-dividers-2 p-6 md:p-8 shadow-xs space-y-4 transition-colors duration-200">
      <h2 class="text-xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 border-b border-kyn-divider-dividers-1 pb-3">
        <KynIcon name="building-2" :size="20" />
        <span>Nguồn Gốc & Sự Nghiệp Khởi Tổ</span>
      </h2>
      <div class="text-sm text-kyn-text-primary leading-relaxed space-y-3">
        <p>
          Dòng họ Nguyễn Phúc nguyên quán tại vùng đất văn hiến Nam Trực, tỉnh Nam Định. Cụ Khởi Tổ là Nguyễn Phúc Khởi (1890 - 1968), Tự Minh Đức, thụy Thuần Khiết. Cụ đỗ Tú tài khoa Tân Hợi dưới triều Duy Tân, là bậc túc nho tài đức vẹn toàn.
        </p>
        <p>
          Thời niên thiếu cụ nổi danh cần mẫn, hay chữ, sau theo nghiệp bốc thuốc cứu đời và dạy chữ Nho cho con em quanh vùng. Cụ cùng cụ bà Lê Thị Từ Tâm sinh hạ được bốn người con: Chi Trưởng là cụ Nguyễn Phúc Trực, Chi Hai là cụ Nguyễn Phúc Quang, Chi Ba là cụ Nguyễn Phúc Hùng (Liệt sĩ chống Mỹ), và cô gái lớn Nguyễn Thị Hòa.
        </p>
        <p>
          Từ thuở khai cơ đến nay, dòng họ đã phát triển qua 5 thế hệ, con cháu kế thừa gia phong, đỗ đạt cử nhân, thạc sĩ, tiến sĩ, nhiều người là kỹ sư, bác sĩ, sĩ quan quân đội, doanh nhân, góp phần xây dựng đất nước và rạng danh tiên tổ.
        </p>
      </div>
    </div> -->

    <!-- Tộc ước 10 điều -->
    <div class="bg-amber-500/5 rounded-kyn-4 border border-amber-500/20 p-6 md:p-8 shadow-xs space-y-6 transition-colors duration-200">
      <h2 class="text-xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 border-b border-amber-500/20 pb-3">
        <KynIcon name="scroll-text" :size="20" />
        <span>Thập Giới Tộc Ước (10 Điều Quy Ước Gia Phong)</span>
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-normal">
        <div class="p-3.5 bg-kyn-bg-primary rounded-kyn-3 border border-kyn-divider-dividers-2 space-y-1">
          <div class="font-bold text-amber-600 dark:text-amber-400 text-sm">Điều 1: Kính Tiên Tổ</div>
          <p class="text-kyn-text-secondary">Nhớ ngày giỗ tết, phụng thờ tiên tổ chu đáo, gìn giữ từ đường trang nghiêm sạch đẹp.</p>
        </div>
        <div class="p-3.5 bg-kyn-bg-primary rounded-kyn-3 border border-kyn-divider-dividers-2 space-y-1">
          <div class="font-bold text-amber-600 dark:text-amber-400 text-sm">Điều 2: Hiếu Phụ Mẫu</div>
          <p class="text-kyn-text-secondary">Tròn đạo làm con, hiếu kính phụ dưỡng cha mẹ ông bà lúc tuổi già sức yếu.</p>
        </div>
        <div class="p-3.5 bg-kyn-bg-primary rounded-kyn-3 border border-kyn-divider-dividers-2 space-y-1">
          <div class="font-bold text-amber-600 dark:text-amber-400 text-sm">Điều 3: Hòa Huynh Đệ</div>
          <p class="text-kyn-text-secondary">Anh em một nhà phải thương yêu đùm bọc, nhường nhịn chở che, chia ngọt sẻ bùi.</p>
        </div>
        <div class="p-3.5 bg-kyn-bg-primary rounded-kyn-3 border border-kyn-divider-dividers-2 space-y-1">
          <div class="font-bold text-amber-600 dark:text-amber-400 text-sm">Điều 4: Nghiêm Giáo Tử</div>
          <p class="text-kyn-text-secondary">Chăm lo dạy dỗ con cháu từ thuở ấu thơ, lấy đức làm gốc, lấy học làm đầu.</p>
        </div>
        <div class="p-3.5 bg-kyn-bg-primary rounded-kyn-3 border border-kyn-divider-dividers-2 space-y-1">
          <div class="font-bold text-amber-600 dark:text-amber-400 text-sm">Điều 5: Tôn Tộc Trưởng</div>
          <p class="text-kyn-text-secondary">Kính trọng các bậc cao niên, trưởng tộc, giữ gìn tôn ty trật tự trong ngoài gia tộc.</p>
        </div>
        <div class="p-3.5 bg-kyn-bg-primary rounded-kyn-3 border border-kyn-divider-dividers-2 space-y-1">
          <div class="font-bold text-amber-600 dark:text-amber-400 text-sm">Điều 6: Trọng Học Vấn</div>
          <p class="text-kyn-text-secondary">Khuyến khích con cháu gắng công học tập, lập thân lập nghiệp, không ngừng vươn lên.</p>
        </div>
        <div class="p-3.5 bg-kyn-bg-primary rounded-kyn-3 border border-kyn-divider-dividers-2 space-y-1">
          <div class="font-bold text-amber-600 dark:text-amber-400 text-sm">Điều 7: Giữ Gia Phong</div>
          <p class="text-kyn-text-secondary">Sống trong sạch, cần kiệm liêm chính, tuyệt đối tránh xa tệ nạn xã hội.</p>
        </div>
        <div class="p-3.5 bg-kyn-bg-primary rounded-kyn-3 border border-kyn-divider-dividers-2 space-y-1">
          <div class="font-bold text-amber-600 dark:text-amber-400 text-sm">Điều 8: Nghĩa Xóm Làng</div>
          <p class="text-kyn-text-secondary">Sống hòa thuận với xóm làng, tuân thủ pháp luật quốc gia, làm tròn nghĩa vụ công dân.</p>
        </div>
        <div class="p-3.5 bg-kyn-bg-primary rounded-kyn-3 border border-kyn-divider-dividers-2 space-y-1">
          <div class="font-bold text-amber-600 dark:text-amber-400 text-sm">Điều 9: Trợ Bần Khó</div>
          <p class="text-kyn-text-secondary">Con cháu khá giả tương trợ người gặp hoạn nạn, đau ốm, giữ trọn tình máu mủ ruột rà.</p>
        </div>
        <div class="p-3.5 bg-kyn-bg-primary rounded-kyn-3 border border-kyn-divider-dividers-2 space-y-1">
          <div class="font-bold text-amber-600 dark:text-amber-400 text-sm">Điều 10: Tục Biên Phả</div>
          <p class="text-kyn-text-secondary">Định kỳ cập nhật phả hệ khi có sinh, tử, giá, thú để lưu truyền đời đời không mai một.</p>
        </div>
      </div>
    </div>

    <!-- Thông tin Từ đường và Quỹ Khuyến học -->
    <!-- <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-kyn-bg-primary rounded-kyn-4 border border-kyn-divider-dividers-2 p-6 shadow-xs space-y-3 transition-colors duration-200">
        <h3 class="font-bold text-kyn-text-title text-base flex items-center gap-2">
          <KynIcon name="home" :size="18" class="text-amber-600" />
          <span>Nhà Thờ Tổ & Lăng Mộ</span>
        </h3>
        <p class="text-xs text-kyn-text-secondary leading-relaxed">
          <strong class="text-kyn-text-title">Nhà thờ Tổ:</strong> Tọa lạc tại xã Nam Hùng, huyện Nam Trực, tỉnh Nam Định. Xây dựng năm 1935, trùng tu năm 2012 với kiến trúc 3 gian 2 chái bằng gỗ lim truyền thống.
        </p>
        <p class="text-xs text-kyn-text-secondary leading-relaxed">
          <strong class="text-kyn-text-title">Khu Lăng mộ Tổ:</strong> Khu lăng mộ Cụ Thủy Tổ đặt tại đồi Thông, Nam Trực. Ngày tảo mộ hàng năm tổ chức vào ngày 25 tháng Chạp âm lịch.
        </p>
      </div>

      <div class="bg-kyn-bg-primary rounded-kyn-4 border border-kyn-divider-dividers-2 p-6 shadow-xs space-y-3 transition-colors duration-200">
        <h3 class="font-bold text-kyn-text-title text-base flex items-center gap-2">
          <KynIcon name="graduation-cap" :size="18" class="text-amber-600" />
          <span>Quỹ Khuyến Học - Khuyến Tài</span>
        </h3>
        <p class="text-xs text-kyn-text-secondary leading-relaxed">
          Thành lập năm 2005 do Trưởng tộc và Hội đồng gia tộc quản lý. Hàng năm trao phần thưởng cho các cháu đạt học sinh giỏi, đỗ đại học và đạt thành tích cao trong các kỳ thi quốc gia.
        </p>
        <div class="p-3 bg-amber-500/10 rounded-kyn-2 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
          Lễ phát thưởng khuyến học được tổ chức vào ngày Giỗ Tổ (Rằm tháng 8 Âm lịch) hàng năm tại Nhà thờ họ.
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { AppBadge, KynIcon } from '@kyn/vue-components'
</script>
