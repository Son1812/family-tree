/**
 * Thuật toán tính Âm lịch Việt Nam chuẩn xác (Dựa trên thiên văn học Việt Nam UTC+7 của TS. Hồ Ngọc Đức).
 * Giúp tính ngày giỗ âm lịch, ngày hoàng đạo và chuyển đổi giữa Dương lịch - Âm lịch.
 */

// Bảng số ngày Sóc (New Moon) và Tiết Khí cho chu kỳ Âm lịch
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12)
  const y = yy + 4800 - a
  const m = mm + 12 * a - 3
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083
  }
  return jd
}

export function jdToDate(jd: number): [number, number, number] {
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
  return Math.floor(Jd1 + dJ + 0.5 + timeZone / 24)
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

function getLunarMonth11(yy: number, timeZone = 7): number {
  const k = Math.floor((jdFromDate(31, 12, yy) - 2415021.0769986) / 29.530588853)
  let nm = getNewMoonDay(k, timeZone)
  const sunLong = getSunLongitude(nm, timeZone)
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone)
  }
  return nm
}

function getLeapMonthOffset(a11: number, timeZone = 7): number {
  const k = Math.floor((a11 - 2415021.0769986) / 29.530588853 + 0.5)
  let last = 0
  let i = 1
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone)
  do {
    last = arc
    i++
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone)
  } while (arc !== last && i < 14)
  return i - 1
}

export function convertSolar2Lunar(dd: number, mm: number, yy: number, timeZone = 7): [number, number, number, boolean] {
  const dayNumber = jdFromDate(dd, mm, yy)
  const k = Math.floor((dayNumber - 2415021.0769986) / 29.530588853)
  let monthStart = getNewMoonDay(k + 1, timeZone)
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone)
  }
  let a11 = getLunarMonth11(yy - 1, timeZone)
  let b11 = getLunarMonth11(yy, timeZone)
  let lunarYear = yy
  if (dayNumber >= b11) {
    lunarYear = yy
    a11 = b11
    b11 = getLunarMonth11(yy + 1, timeZone)
  } else {
    lunarYear = yy - 1
  }
  const lunarDay = dayNumber - monthStart + 1
  const diff = Math.floor((monthStart - a11) / 29)
  let lunarMonth = diff + 11
  let isLeap = false
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone)
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10
      if (diff === leapMonthDiff) {
        isLeap = true
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1
  }
  if (lunarMonth < 11) {
    lunarYear += 1
  }
  return [lunarDay, lunarMonth, lunarYear, isLeap]
}

/** Chuyển đổi từ ngày Âm lịch sang Dương lịch chính xác cho một năm Dương lịch */
export function convertLunar2SolarForYear(
  lunarDay: number,
  lunarMonth: number,
  solarYear: number,
  timeZone = 7,
): [number, number, number] | null {
  const startJd = jdFromDate(1, 1, solarYear)
  // Quét các ngày trong năm dương lịch (và 60 ngày sang đầu năm sau để bao quát hết tháng chạp)
  for (let i = 0; i <= 390; i++) {
    const [d, m, y] = jdToDate(startJd + i)
    const [ld, lm] = convertSolar2Lunar(d, m, y, timeZone)
    if (ld === lunarDay && lm === lunarMonth) {
      return [d, m, y]
    }
  }
  return null
}

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý']
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']

export function getCanChiYear(year: number): string {
  const canIndex = (year + 6) % 10
  const chiIndex = (year + 8) % 12
  return `${CAN[canIndex]} ${CHI[chiIndex]}`
}

export function getCanChiDay(dd: number, mm: number, yy: number): string {
  const jd = jdFromDate(dd, mm, yy)
  return `${CAN[(jd + 9) % 10]} ${CHI[(jd + 1) % 12]}`
}

export function getCanChiMonth(lunarMonth: number, lunarYear: number): string {
  const can = CAN[(lunarYear * 12 + lunarMonth + 3) % 10]
  const chi = CHI[(lunarMonth + 1) % 12]
  return `${can} ${chi}`
}

/**
 * Trả về chuỗi ngày Âm lịch hiện tại.
 */
export function getTodayLunar(): {
  day: number
  month: number
  year: number
  canChi: string
  canChiDay: string
  canChiMonth: string
  text: string
} {
  const now = new Date()
  const d = now.getDate()
  const m = now.getMonth() + 1
  const y = now.getFullYear()
  const [day, month, year] = convertSolar2Lunar(d, m, y)
  const canChi = getCanChiYear(year)
  const canChiDay = getCanChiDay(d, m, y)
  const canChiMonth = getCanChiMonth(month, year)
  return {
    day,
    month,
    year,
    canChi,
    canChiDay,
    canChiMonth,
    text: `Ngày ${day} tháng ${month} năm ${canChi} (${canChiDay})`,
  }
}

export interface CalendarDayCell {
  solarDay: number
  solarMonth: number
  solarYear: number
  lunarDay: number
  lunarMonth: number
  lunarYear: number
  isLeapMonth: boolean
  canChiDay: string
  dayOfWeek: number // 0: CN, 1: T2, ..., 6: T7
  isCurrentMonth: boolean
  isToday: boolean
  isFirstOrFullMoon: boolean
  lunarLabel: string
}

/**
 * Tạo dữ liệu lưới lịch vạn niên cho một tháng dương lịch (Thứ Hai -> Chủ Nhật).
 */
export function buildMonthCalendarGrid(year: number, month: number): CalendarDayCell[] {
  const today = new Date()
  const todayD = today.getDate()
  const todayM = today.getMonth() + 1
  const todayY = today.getFullYear()

  // Ngày đầu tiên của tháng
  const firstDay = new Date(year, month - 1, 1)
  // JS getDay(): 0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy
  // Đưa về tuần bắt đầu từ Thứ Hai (0 = Thứ 2, ..., 6 = Chủ Nhật)
  let startOffset = (firstDay.getDay() + 6) % 7

  // Tổng số ngày trong tháng này
  const daysInMonth = new Date(year, month, 0).getDate()
  // Tổng số ngày trong tháng trước
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()

  const cells: CalendarDayCell[] = []

  // 1. Ngày đệm của tháng trước
  for (let i = startOffset - 1; i >= 0; i--) {
    const sD = daysInPrevMonth - i
    const sM = month === 1 ? 12 : month - 1
    const sY = month === 1 ? year - 1 : year
    const [lD, lM, lY, isLeap] = convertSolar2Lunar(sD, sM, sY)
    const canChiDay = getCanChiDay(sD, sM, sY)
    const dow = new Date(sY, sM - 1, sD).getDay()

    cells.push({
      solarDay: sD,
      solarMonth: sM,
      solarYear: sY,
      lunarDay: lD,
      lunarMonth: lM,
      lunarYear: lY,
      isLeapMonth: isLeap,
      canChiDay,
      dayOfWeek: dow,
      isCurrentMonth: false,
      isToday: sD === todayD && sM === todayM && sY === todayY,
      isFirstOrFullMoon: lD === 1 || lD === 15,
      lunarLabel: lD === 1 ? `${lD}/${lM}` : `${lD}`,
    })
  }

  // 2. Các ngày trong tháng chính
  for (let sD = 1; sD <= daysInMonth; sD++) {
    const [lD, lM, lY, isLeap] = convertSolar2Lunar(sD, month, year)
    const canChiDay = getCanChiDay(sD, month, year)
    const dow = new Date(year, month - 1, sD).getDay()

    cells.push({
      solarDay: sD,
      solarMonth: month,
      solarYear: year,
      lunarDay: lD,
      lunarMonth: lM,
      lunarYear: lY,
      isLeapMonth: isLeap,
      canChiDay,
      dayOfWeek: dow,
      isCurrentMonth: true,
      isToday: sD === todayD && month === todayM && year === todayY,
      isFirstOrFullMoon: lD === 1 || lD === 15,
      lunarLabel: lD === 1 ? `${lD}/${lM}` : `${lD}`,
    })
  }

  // 3. Ngày đệm của tháng sau để tròn 35 hoặc 42 ô (bội số của 7)
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let sD = 1; sD <= remaining; sD++) {
      const sM = month === 12 ? 1 : month + 1
      const sY = month === 12 ? year + 1 : year
      const [lD, lM, lY, isLeap] = convertSolar2Lunar(sD, sM, sY)
      const canChiDay = getCanChiDay(sD, sM, sY)
      const dow = new Date(sY, sM - 1, sD).getDay()

      cells.push({
        solarDay: sD,
        solarMonth: sM,
        solarYear: sY,
        lunarDay: lD,
        lunarMonth: lM,
        lunarYear: lY,
        isLeapMonth: isLeap,
        canChiDay,
        dayOfWeek: dow,
        isCurrentMonth: false,
        isToday: sD === todayD && sM === todayM && sY === todayY,
        isFirstOrFullMoon: lD === 1 || lD === 15,
        lunarLabel: lD === 1 ? `${lD}/${lM}` : `${lD}`,
      })
    }
  }

  return cells
}
