# Hệ Thống Quản Lý Gia Phả Đại Tộc (Family Tree System)

> Hệ thống quản lý gia phả và phả đồ dòng họ trực quan, được xây dựng và tối ưu hoá dựa trên kiến trúc **Sơ đồ tổ chức (KynOrgChart)** của thư viện `@kyn/vue-components`.

---

## 🌟 Tính Năng Nổi Bật

### 1. Phả Đồ Trực Quan (Interactive Family Tree Chart)
- **Kế thừa kiến trúc từ `KynOrgChart`**:
  - Cơ chế đệ quy thuần với đường nối connector mượt mà bằng CSS pseudo-elements (`::before`, `::after`).
  - **Auto-fit & Thu phóng mượt mà**: Tự động tính toán scale (`computeFitScale`) để cây vừa vặn khung hình, hỗ trợ zoom tay từ 25% đến 200%, nút bấm `+`, `−`, `100%`, `Vừa màn hình`.
  - **Kéo rê mặt phẳng (Pan & Drag)**: Giữ chuột trái kéo rê để điều hướng khắp cây phả hệ lớn một cách nhẹ nhàng.
  - **In đậm đường huyết mạch (Bloodline Highlight)**: Khi chọn bất kỳ thành viên nào, hệ thống tính toán (`computeHighlightSegments`) và vẽ overlay SVG polyline nổi bật nối liền từ Cụ Thủy Tổ xuyên suốt qua các đời dẫn thẳng tới người đó.
  - **Thu gọn / Mở rộng cành nhánh (Collapsible Branches)**: Thu gọn các nhánh con cháu để tập trung theo dõi nhánh quan tâm; có kèm huy hiệu số con/cháu trên nút đóng mở.
  - **Đường dẫn huyết thống (Ancestor Breadcrumb)**: Hiển thị chuỗi thứ bậc từ Tiên Tổ tới thành viên hiện tại: `Cụ Thủy Tổ › Cụ Trưởng Chi › Ông Cố › Ông Nội › Thân Phụ › [Thành viên]`.
  - **Hệ thống màu sắc theo Đời (Generation Legend)**: Phân biệt rõ rệt từ Đời I (Hoàng Kim), Đời II (Đỏ Son), Đời III (Xanh Ngọc), Đời IV (Lam Chàm), Đời V (Tím Hoàng Gia)...

### 2. Đặc Trưng Gia Phả Việt Nam
- **Hiển thị cặp Vợ - Chồng (Phối ngẫu)**: Tích hợp thông tin phối ngẫu (Chính thất, Kế thất, Phu quân, Bà hai...) ngay trên thẻ hoặc trong hồ sơ chi tiết.
- **Ngày Giỗ Âm Lịch (Tử Nhật)**: Tích hợp bộ tính Âm lịch Việt Nam chuẩn xác (thuật toán Hồ Ngọc Đức), ghi nhận ngày giỗ (ví dụ "15/08 ÂL").
- **Nhắc nhở ngày giỗ sắp tới**: Tab "Sổ Giỗ Chạp" tự động tính toán ngày âm lịch hôm nay, thông báo ngày giỗ tổ, giỗ cụ, giỗ ông bà trong tháng/năm.
- **Mộ phần & Nơi an táng**: Lưu trữ địa điểm an táng của các cụ để con cháu dễ dàng tảo mộ, viếng thăm.
- **Tên chữ & Húy & Hiệu**: Hỗ trợ đầy đủ tên tự, tên húy, thụy hiệu truyền thống.

### 3. Đa Chế Độ Xem (Multi-View)
- **Phả Đồ**: Cây phả hệ phân cấp top-down trực quan.
- **Phả Ký (Bảng tra cứu)**: Tìm kiếm theo tên, năm sinh; lọc theo Chi phái, theo Thế hệ (Đời), theo trạng thái Còn sống / Đã khuất.
- **Sổ Giỗ Chạp**: Theo dõi các ngày giỗ theo 12 tháng Âm lịch.
- **Tộc Ước & Sử Ký**: Nguồn gốc dòng họ và 10 điều tộc ước (Thập giới gia phong).

### 4. Quản Trị & Lưu Trữ Dữ Liệu
- **Tìm kiếm thông minh**: Ô tìm kiếm trên header có gợi ý ngay lập tức. Bấm vào thành viên bất kỳ sẽ tự động chuyển sang Phả Đồ, mở các nhánh cha mẹ bị đóng, cuộn đến và highlight người đó.
- **Thao tác nhanh**: Xem chi tiết hồ sơ, Thêm con, Thêm phối ngẫu, Sửa thông tin, Xóa thành viên.
- **Lưu trữ tự động**: Đồng bộ thời gian thực vào `localStorage`.
- **Xuất / Nhập JSON**: Sao lưu dự phòng file `.json` hoặc khôi phục dữ liệu mẫu ban đầu.

---

## 🚀 Cài Đặt & Chạy Dự Án

### Yêu cầu môi trường
- Node.js ≥ 20
- npm ≥ 10

### Lệnh thực thi
```bash
# Cài đặt thư viện
npm install

# Khởi chạy môi trường phát triển (Dev Server)
npm run dev

# Kiểm tra kiểu TypeScript
npm run type-check

# Biên dịch sản phẩm (Production Build)
npm run build

# Xem trước bản build
npm run preview
```

---

## 📁 Cấu Trúc Dự Án

```
family-tree/
├── src/
│   ├── assets/
│   │   └── main.css                    # Tailwind CSS v4 & Heritage theme tokens
│   ├── components/
│   │   ├── chart/
│   │   │   ├── FamilyOrgChart.vue      # Viewport, zoom/pan, SVG bloodline, toolbar
│   │   │   ├── FamilyOrgNode.vue       # Node đệ quy (<li> + <ul>), thẻ thành viên, vợ chồng
│   │   │   ├── FamilyOrgLegend.vue     # Bảng chú thích màu sắc các đời & ký hiệu
│   │   │   ├── chartCtx.ts             # Context injection cho cây
│   │   │   └── geometry.ts             # Hàm toán học thuần: computeFitScale, computeHighlightSegments
│   │   └── modals/
│   │       ├── MemberDetailModal.vue   # Modal xem hồ sơ chi tiết thành viên
│   │       ├── MemberFormModal.vue     # Modal thêm/sửa thành viên
│   │       └── SpouseModal.vue         # Modal thêm phối ngẫu (vợ/chồng)
│   ├── composables/
│   │   └── useFamilyTree.ts            # Quản lý trạng thái cây gia phả, localStorage, giỗ chạp
│   ├── data/
│   │   ├── mockFamily.ts               # Dữ liệu gia phả mẫu (5 đời, 25+ thành viên, chi họ)
│   │   └── generationStyles.ts         # Bảng màu sắc & phong cách các đời
│   ├── types/
│   │   └── family.ts                   # Định nghĩa kiểu dữ liệu FamilyMember, SpouseInfo, v.v.
│   ├── utils/
│   │   └── lunar.ts                    # Thuật toán tính Âm lịch Việt Nam & Can Chi
│   ├── views/
│   │   ├── TableView.vue               # Danh sách phả ký dạng bảng kèm bộ lọc
│   │   ├── AnniversaryView.vue         # Lịch giỗ chạp âm lịch theo tháng
│   │   └── HistoryView.vue             # Tộc ước 10 điều & lịch sử dòng họ
│   ├── App.vue                         # Layout chính, header, navigation, search
│   └── main.ts                         # Entry point của ứng dụng Vue 3
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```
