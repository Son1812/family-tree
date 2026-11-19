import type { GenerationStyle } from '../types/family'

export const GENERATION_STYLES: Record<number, GenerationStyle> = {
  1: {
    generation: 1,
    roman: 'Đời I',
    title: 'Thủy Tổ Khởi Nghiệp',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.15)',
    borderColor: '#d97706',
  },
  2: {
    generation: 2,
    roman: 'Đời II',
    title: 'Phân Chi Phát Tích',
    color: '#e11d48',
    bgColor: 'rgba(225, 29, 72, 0.15)',
    borderColor: '#e11d48',
  },
  3: {
    generation: 3,
    roman: 'Đời III',
    title: 'Trung Hưng Dòng Tộc',
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.15)',
    borderColor: '#059669',
  },
  4: {
    generation: 4,
    roman: 'Đời IV',
    title: 'Phúc Lộc Đương Thời',
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: '#2563eb',
  },
  5: {
    generation: 5,
    roman: 'Đời V',
    title: 'Hậu Duệ Hưng Thịnh',
    color: '#9333ea',
    bgColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: '#9333ea',
  },
  6: {
    generation: 6,
    roman: 'Đời VI',
    title: 'Thế Hệ Mầm Non',
    color: '#0d9488',
    bgColor: 'rgba(13, 148, 136, 0.15)',
    borderColor: '#0d9488',
  },
}

export function getGenerationStyle(gen: number): GenerationStyle {
  if (GENERATION_STYLES[gen]) return GENERATION_STYLES[gen]
  return {
    generation: gen,
    roman: `Đời ${gen}`,
    title: `Thế hệ thứ ${gen}`,
    color: '#64748b',
    bgColor: 'rgba(100, 116, 139, 0.15)',
    borderColor: '#64748b',
  }
}
