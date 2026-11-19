import type { GenerationStyle } from '../types/family'

export const GENERATION_STYLES: Record<number, GenerationStyle> = {
  1: {
    generation: 1,
    roman: 'Đời I',
    title: 'Thủy Tổ Khởi Nghiệp',
    color: '#b45309', // Amber Gold
    bgColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  2: {
    generation: 2,
    roman: 'Đời II',
    title: 'Phân Chi Phát Tích',
    color: '#881337', // Crimson / Burgundy
    bgColor: '#ffe4e6',
    borderColor: '#f43f5e',
  },
  3: {
    generation: 3,
    roman: 'Đời III',
    title: 'Trung Hưng Dòng Tộc',
    color: '#065f46', // Emerald / Jade
    bgColor: '#d1fae5',
    borderColor: '#10b981',
  },
  4: {
    generation: 4,
    roman: 'Đời IV',
    title: 'Phúc Lộc Đương Thời',
    color: '#1e3a8a', // Royal Indigo / Blue
    bgColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  5: {
    generation: 5,
    roman: 'Đời V',
    title: 'Hậu Duệ Hưng Thịnh',
    color: '#581c87', // Royal Purple
    bgColor: '#f3e8ff',
    borderColor: '#a855f7',
  },
  6: {
    generation: 6,
    roman: 'Đời VI',
    title: 'Thế Hệ Mầm Non',
    color: '#0f766e', // Teal
    bgColor: '#ccfbf1',
    borderColor: '#14b8a6',
  },
}

export function getGenerationStyle(gen: number): GenerationStyle {
  if (GENERATION_STYLES[gen]) return GENERATION_STYLES[gen]
  return {
    generation: gen,
    roman: `Đời ${gen}`,
    title: `Thế hệ thứ ${gen}`,
    color: '#475569',
    bgColor: '#f1f5f9',
    borderColor: '#94a3b8',
  }
}
