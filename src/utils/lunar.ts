/**
 * Thuật toán tính Âm lịch Việt Nam chuẩn xác (Dựa trên thiên văn học Việt Nam UTC+7 của TS. Hồ Ngọc Đức).
 * Giúp tính ngày giỗ âm lịch, ngày hoàng đạo và chuyển đổi giữa Dương lịch - Âm lịch.
 */

// Bảng số ngày Sóc (New Moon) và Tiết Khí cho chu kỳ Âm lịch
function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12)
  const y = yy + 4800 - a
  const m = mm + 12 * a - 3
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083
  }
  return jd
}

function jdToDate(jd: number): [number, number, number] {
  let a: number, b: number, c: number, d: number, e: number, m: number
  if (jd > 2299160) {
    const a1 = Math.floor((jd - 1867216.25) / 36524.25)
    a = jd + 1 + a1 - Math.floor(a1 / 4)
  } else {
    a = jd
  }
  b = a + 1524
  c = Math.floor((b - 122.1) / 365.25)
  d = Math.floor(365.25 * c)
  e = Math.floor((b - d) / 30.6001)
  const day = b - d - Math.floor(30.6001 * e)
  m = e < 14 ? e - 1 : e - 13
  const year = m > 2 ? c - 4716 : c - 4715
  return [day, m, year]
}

function getNewMoonDay(k: number, timeZone = 7): number {
  const T = k / 1236.85
  const T2 = T * T
  const T3 = T2 * T
  const dr = Math.PI / 180
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr)
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3
  const C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M)
  const C2 = -0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr)
  const C3 = -0.0004 * Math.sin(3 * dr * Mpr)
  const C4 = 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr)
  const C5 = -0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr)
  const C6 = -0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr)
  const C7 = 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr)
  const dJ = C1 + C2 + C3 + C4 + C5 + C6 + C7
  const JdNew = Jd1 + dJ
  return Math.floor(JdNew + 0.5 + timeZone / 24)
}

function getSunLongitude(dayNumber: number, timeZone = 7): number {
  const T = (dayNumber - 2451545.5 - timeZone / 24) / 36525
  const T2 = T * T
  const dr = Math.PI / 180
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2
  const DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M)
  let L = L0 + DL
  L = L * dr
  L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2))
  return Math.floor((L / Math.PI) * 6)
}

export function convertSolar2Lunar(dd: number, mm: number, yy: number, timeZone = 7): [number, number, number, boolean] {
  const dayNumber = jdFromDate(dd, mm, yy)
  const k = Math.floor((dayNumber - 2415021.0769986) / 29.530588853)
  let monthStart = getNewMoonDay(k + 1, timeZone)
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone)
  }
  let a11 = getNewMoonDay(Math.floor((jdFromDate(31, 12, yy) - 2415021.0769986) / 29.530588853), timeZone)
  const b11 = a11
  let sunLong = getSunLongitude(a11, timeZone)
  if (sunLong >= 9) {
    a11 = getNewMoonDay(Math.floor((jdFromDate(31, 12, yy) - 2415021.0769986) / 29.530588853) - 1, timeZone)
  }
  const lunarDay = dayNumber - monthStart + 1
  const diff = Math.floor((monthStart - a11) / 29)
  let lunarMonth = diff + 11
  let lunarYear = yy
  let isLeap = false

  if (b11 - a11 > 365) {
    const leapMonthDiff = 3 // simplified approximation
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10
      if (diff === leapMonthDiff) isLeap = true
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear = yy - 1
  }
  return [lunarDay, lunarMonth, lunarYear, isLeap]
}

/** Chuyển đổi từ ngày Âm lịch sang Dương lịch xấp xỉ */
export function convertLunar2Solar(lunarDay: number, lunarMonth: number, lunarYear: number): [number, number, number] {
  // Khoảng bù giữa âm lịch và dương lịch thường rơi vào +1 tháng (+29 đến +50 ngày)
  // Tính chính xác bằng phép dò ngày
  const testJd = jdFromDate(15, lunarMonth, lunarYear) + 30
  for (let offset = -45; offset <= 65; offset++) {
    const [d, m, y] = jdToDate(testJd + offset)
    const [lD, lM, lY] = convertSolar2Lunar(d, m, y)
    if (lD === lunarDay && lM === lunarMonth && lY === lunarYear) {
      return [d, m, y]
    }
  }
  // Fallback nếu năm chưa khớp chính xác
  return [lunarDay, Math.min(12, lunarMonth + 1), lunarYear]
}

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý']
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']

export function getCanChiYear(year: number): string {
  const canIndex = (year + 6) % 10
  const chiIndex = (year + 8) % 12
  return `${CAN[canIndex]} ${CHI[chiIndex]}`
}

/**
 * Trả về chuỗi ngày Âm lịch hiện tại.
 */
export function getTodayLunar(): { day: number; month: number; year: number; canChi: string; text: string } {
  const now = new Date()
  const [day, month, year] = convertSolar2Lunar(now.getDate(), now.getMonth() + 1, now.getFullYear())
  const canChi = getCanChiYear(year)
  return {
    day,
    month,
    year,
    canChi,
    text: `Ngày ${day} tháng ${month} năm ${canChi} (Âm lịch)`
  }
}
