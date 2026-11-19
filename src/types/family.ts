export type Gender = 'male' | 'female'

export interface SpouseInfo {
  id: string
  fullName: string
  birthYear?: string | number
  deathYear?: string | number
  isAlive: boolean
  deathDateLunar?: string // Ví dụ: "15/07 Âm lịch"
  burialPlace?: string
  title?: string // "Chính thất", "Kế thất", "Phu quân", "Trắc thất"
  origin?: string // Quê quán nguyên quán
  bio?: string
}

export interface FamilyMember {
  id: string
  fullName: string
  courtesyName?: string // Tên tự, húy, thụy hiệu
  gender: Gender
  generation: number // 1 = Đời thứ nhất (Thủy tổ), 2 = Đời thứ 2...
  branch: string // "Chi Trưởng", "Chi Hai", "Chi Ba"...
  orderTitle?: string // "Trưởng nam", "Thứ nam", "Trưởng nữ", "Con út"...
  isAlive: boolean
  birthDate?: string // Năm hoặc ngày sinh dương lịch
  birthDateLunar?: string
  deathDate?: string // Năm hoặc ngày mất dương lịch
  deathDateLunar?: string // Ngày giỗ âm lịch, ví dụ: "10/03"
  burialPlace?: string // Nơi an táng / Mộ phần
  avatar?: string
  phone?: string
  address?: string
  bio?: string // Tiểu sử, hành trạng, công trạng
  spouses?: SpouseInfo[]
  parentId?: string | null
  motherId?: string | null // ID của người mẹ (thuộc spouses của người cha)
  motherName?: string // Tên / Danh vị người mẹ (Ví dụ: "Lê Thị Từ Tâm (Chính thất)")
  children?: FamilyMember[]
}

export interface GenerationStyle {
  generation: number
  roman: string // "Đời I", "Đời II"...
  title: string // "Khởi Tổ", "Tiên Hiền"...
  color: string
  bgColor: string
  borderColor: string
}

export interface DeathAnniversary {
  memberId: string
  name: string
  role: string // "Thành viên" | "Người phối ngẫu"
  spouseOfName?: string
  generation: number
  branch: string
  lunarDate: string // "DD/MM"
  lunarDay: number
  lunarMonth: number
  solarDateEstimated?: string
  daysUntil?: number
  isToday?: boolean
  burialPlace?: string
}
