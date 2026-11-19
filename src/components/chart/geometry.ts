/**
 * Geometry và các hàm thuần toán học phục vụ Sơ đồ Phả hệ / Cây Gia Phả.
 * Kế thừa và mở rộng từ orgChartGeometry.ts của KYN OrgChart.
 */

export interface ChartRect {
  left: number
  top: number
  bottom: number
  width: number
  height: number
}

/** Giới hạn giá trị trong khoảng [min, max] */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export type ChartFitMode = 'contain' | 'width'

/**
 * Tính toán scale tự động để cây vừa vặn trong khung nhìn viewport.
 */
export function computeFitScale(
  natural: { w: number; h: number },
  viewport: { w: number; h: number },
  min: number,
  max: number,
  fallback = 1,
  mode: ChartFitMode = 'contain',
): number {
  if (natural.w <= 0 || natural.h <= 0 || viewport.w <= 0) return fallback
  if (mode === 'contain' && viewport.h <= 0) return fallback
  const byWidth = viewport.w / natural.w
  const k = mode === 'width' ? Math.min(byWidth, 1) : Math.min(byWidth, viewport.h / natural.h, 1)
  return clamp(k, min, max)
}

/**
 * Tính toán các đoạn polyline SVG in đậm đường huyết mạch từ Cụ Thủy Tổ tới thành viên được chọn.
 * Toạ độ tính theo hệ toạ độ tự nhiên (trước khi scale) để không bị lệch khi zoom.
 */
export function computeHighlightSegments(
  ids: string[],
  measure: (id: string) => ChartRect | null,
  origin: { left: number; top: number },
  scale: number,
): string[] {
  if (ids.length < 2) return []
  const k = scale || 1
  const at = (id: string): { cx: number; top: number; bottom: number } | null => {
    const r = measure(id)
    if (!r) return null
    return {
      cx: (r.left - origin.left + r.width / 2) / k,
      top: (r.top - origin.top) / k,
      bottom: (r.bottom - origin.top) / k,
    }
  }

  const segs: string[] = []
  for (let i = 0; i < ids.length - 1; i++) {
    const p = at(ids[i])
    const c = at(ids[i + 1])
    if (!p || !c) continue
    const mid = (p.bottom + c.top) / 2
    segs.push(`${p.cx},${p.bottom} ${p.cx},${mid} ${c.cx},${mid} ${c.cx},${c.top}`)
  }
  return segs
}

/**
 * Xây dựng chuỗi tổ tiên: Thủy tổ -> Đời 2 -> ... -> Người đang chọn.
 * Chặn lặp vô tận nếu dữ liệu có chu trình.
 */
export function buildAncestorChain(
  selectedId: string | null,
  parentOf: (id: string) => string | null | undefined,
  exists: (id: string) => boolean,
): string[] {
  const chain: string[] = []
  const seen = new Set<string>()
  let id: string | null | undefined = selectedId
  while (id && !seen.has(id) && exists(id)) {
    seen.add(id)
    chain.unshift(id)
    id = parentOf(id) ?? null
  }
  return chain
}
