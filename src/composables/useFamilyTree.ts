import { ref, computed, watch } from 'vue'
import type { FamilyMember, SpouseInfo, DeathAnniversary } from '../types/family'
import { INITIAL_FAMILY_TREE } from '../data/mockFamily'
import { buildAncestorChain } from '../components/chart/geometry'
import { getTodayLunar } from '../utils/lunar'

const STORAGE_KEY = 'family_tree_data_v4'

function loadFromStorage(): FamilyMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc dữ liệu gia phả từ localStorage:', err)
  }
  return JSON.parse(JSON.stringify(INITIAL_FAMILY_TREE))
}

const tree = ref<FamilyMember[]>(loadFromStorage())
const selectedMemberId = ref<string | null>(null)
const collapsedIds = ref<Set<string>>(new Set())

// Watch và tự động lưu vào localStorage khi cây thay đổi
watch(
  tree,
  (newTree) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTree))
    } catch (err) {
      console.error('Lỗi lưu trữ localStorage:', err)
    }
  },
  { deep: true },
)

export function useFamilyTree() {
  // Bản đồ phẳng id -> member và id -> parentId
  const index = computed(() => {
    const byId = new Map<string, FamilyMember>()
    const parent = new Map<string, string | null>()
    const list: FamilyMember[] = []

    const walk = (nodes: FamilyMember[], pId: string | null) => {
      for (const node of nodes) {
        byId.set(node.id, node)
        parent.set(node.id, pId)
        list.push(node)
        if (node.children?.length) {
          walk(node.children, node.id)
        }
      }
    }

    walk(tree.value, null)
    return { byId, parent, list }
  })

  const flatMembers = computed(() => index.value.list)
  const memberById = computed(() => index.value.byId)
  const parentById = computed(() => index.value.parent)

  const selectedMember = computed(() => {
    if (!selectedMemberId.value) return null
    return index.value.byId.get(selectedMemberId.value) ?? null
  })

  // Chuỗi huyết mạch từ Thủy tổ -> Người đang chọn
  const bloodlineChain = computed(() => {
    return buildAncestorChain(
      selectedMemberId.value,
      (id) => index.value.parent.get(id) ?? null,
      (id) => index.value.byId.has(id),
    )
  })

  const bloodlinePathIds = computed(() => new Set(bloodlineChain.value))

  function selectMember(id: string | null) {
    selectedMemberId.value = id
  }

  function toggleCollapse(id: string) {
    const next = new Set(collapsedIds.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    collapsedIds.value = next
  }

  function collapseAll() {
    const next = new Set<string>()
    for (const m of flatMembers.value) {
      if (m.children && m.children.length > 0) {
        next.add(m.id)
      }
    }
    collapsedIds.value = next
  }

  function expandAll() {
    collapsedIds.value = new Set()
  }

  /** Mở toàn bộ tổ tiên của thành viên và chọn thành viên đó */
  function focusMember(id: string) {
    const ancestors = buildAncestorChain(
      id,
      (i) => index.value.parent.get(i) ?? null,
      (i) => index.value.byId.has(i),
    )
    const nextCollapsed = new Set(collapsedIds.value)
    for (const ancId of ancestors) {
      nextCollapsed.delete(ancId)
    }
    collapsedIds.value = nextCollapsed
    selectedMemberId.value = id
  }

  // Thêm thành viên mới (là con của parentId, hoặc nhánh mới)
  function addMember(
    data: Omit<FamilyMember, 'id' | 'children'>,
    targetParentId?: string | null,
  ): FamilyMember {
    const newId = 'mem-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
    const parent = targetParentId ? memberById.value.get(targetParentId) : null
    const generation = parent ? parent.generation + 1 : data.generation || 1
    const branch = parent ? parent.branch : data.branch || 'Chi Trưởng'

    const newMember: FamilyMember = {
      ...data,
      id: newId,
      generation,
      branch,
      parentId: targetParentId ?? null,
      children: [],
    }

    if (targetParentId && parent) {
      if (!parent.children) parent.children = []
      parent.children.push(newMember)
      // Mở nhánh cha nếu đang thu gọn
      if (collapsedIds.value.has(targetParentId)) {
        const next = new Set(collapsedIds.value)
        next.delete(targetParentId)
        collapsedIds.value = next
      }
    } else {
      tree.value.push(newMember)
    }

    selectedMemberId.value = newId
    return newMember
  }

  // Cập nhật thông tin thành viên
  function updateMember(id: string, updates: Partial<FamilyMember>) {
    const target = memberById.value.get(id)
    if (!target) return
    Object.assign(target, updates)
  }

  // Xóa thành viên
  function deleteMember(id: string) {
    const pId = parentById.value.get(id)
    if (pId) {
      const parent = memberById.value.get(pId)
      if (parent && parent.children) {
        parent.children = parent.children.filter((c) => c.id !== id)
      }
    } else {
      tree.value = tree.value.filter((n) => n.id !== id)
    }
    if (selectedMemberId.value === id) {
      selectedMemberId.value = null
    }
  }

  // Thêm người phối ngẫu (Vợ / Chồng)
  function addSpouse(memberId: string, spouse: Omit<SpouseInfo, 'id'>) {
    const target = memberById.value.get(memberId)
    if (!target) return
    if (!target.spouses) target.spouses = []
    const newSpouse: SpouseInfo = {
      ...spouse,
      id: 'sp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    }
    target.spouses.push(newSpouse)
  }

  // Cập nhật thông tin người phối ngẫu (Vợ / Chồng)
  function updateSpouse(memberId: string, spouseId: string, data: Partial<SpouseInfo>) {
    const target = memberById.value.get(memberId)
    if (!target || !target.spouses) return
    const idx = target.spouses.findIndex((s) => s.id === spouseId)
    if (idx !== -1) {
      target.spouses[idx] = {
        ...target.spouses[idx],
        ...data,
      }

      // Tự động đồng bộ motherName cho các con do bà này sinh hạ nếu đổi tên hoặc danh vị
      if (target.children && (data.fullName || data.title)) {
        const updated = target.spouses[idx]
        const motherLabel = updated.title
          ? `${updated.fullName} (${updated.title})`
          : updated.fullName

        for (const child of target.children) {
          if (child.motherId === spouseId) {
            child.motherName = motherLabel
          }
        }
      }
    }
  }

  function removeSpouse(memberId: string, spouseId: string) {
    const target = memberById.value.get(memberId)
    if (!target || !target.spouses) return
    target.spouses = target.spouses.filter((s) => s.id !== spouseId)
  }

  // Nạp dữ liệu trực tiếp từ file public/data/family-tree.json
  async function loadFromFamilyTreeFile(): Promise<boolean> {
    try {
      const res = await fetch(`/data/family-tree.json?t=${Date.now()}`)
      if (res.ok) {
        const parsed = await res.json()
        if (Array.isArray(parsed) && parsed.length > 0) {
          tree.value = parsed
          selectedMemberId.value = null
          collapsedIds.value = new Set()
          return true
        }
      }
    } catch (e) {
      console.warn('Chưa nạp được /data/family-tree.json:', e)
    }
    return false
  }

  // Đặt lại dữ liệu ban đầu
  function resetToDefault() {
    tree.value = JSON.parse(JSON.stringify(INITIAL_FAMILY_TREE))
    selectedMemberId.value = null
    collapsedIds.value = new Set()
  }

  // Xuất file JSON
  function exportJSON(): string {
    return JSON.stringify(tree.value, null, 2)
  }

  // Nhập file JSON
  function importJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr)
      if (Array.isArray(parsed) && parsed.length > 0) {
        tree.value = parsed
        selectedMemberId.value = null
        collapsedIds.value = new Set()
        return true
      }
    } catch (e) {
      console.error('JSON không hợp lệ:', e)
    }
    return false
  }

  // Tính toán danh sách ngày giỗ trong năm
  const deathAnniversaries = computed<DeathAnniversary[]>(() => {
    const today = getTodayLunar()
    const list: DeathAnniversary[] = []

    for (const mem of flatMembers.value) {
      // Thành viên chính đã khuất
      if (!mem.isAlive && mem.deathDateLunar) {
        const parts = mem.deathDateLunar.split('/')
        if (parts.length >= 2) {
          const day = parseInt(parts[0], 10)
          const month = parseInt(parts[1], 10)
          if (!isNaN(day) && !isNaN(month)) {
            const isToday = today.day === day && today.month === month
            list.push({
              memberId: mem.id,
              name: mem.fullName,
              role: 'Thành viên dòng họ',
              generation: mem.generation,
              branch: mem.branch,
              lunarDate: `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}`,
              lunarDay: day,
              lunarMonth: month,
              isToday,
              burialPlace: mem.burialPlace,
            })
          }
        }
      }

      // Người phối ngẫu đã khuất
      if (mem.spouses) {
        for (const sp of mem.spouses) {
          if (!sp.isAlive && sp.deathDateLunar) {
            const parts = sp.deathDateLunar.split('/')
            if (parts.length >= 2) {
              const day = parseInt(parts[0], 10)
              const month = parseInt(parts[1], 10)
              if (!isNaN(day) && !isNaN(month)) {
                const isToday = today.day === day && today.month === month
                list.push({
                  memberId: mem.id,
                  name: sp.fullName,
                  role: sp.title || 'Người phối ngẫu',
                  spouseOfName: mem.fullName,
                  generation: mem.generation,
                  branch: mem.branch,
                  lunarDate: `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}`,
                  lunarDay: day,
                  lunarMonth: month,
                  isToday,
                  burialPlace: sp.burialPlace,
                })
              }
            }
          }
        }
      }
    }

    // Sắp xếp theo thứ tự ngày trong năm âm lịch (từ tháng 1 -> tháng 12)
    return list.sort((a, b) => {
      if (a.lunarMonth !== b.lunarMonth) {
        return a.lunarMonth - b.lunarMonth
      }
      return a.lunarDay - b.lunarDay
    })
  })

  // Thống kê tổng quan
  const stats = computed(() => {
    const all = flatMembers.value
    const alive = all.filter((m) => m.isAlive).length
    const deceased = all.length - alive
    const maxGen = Math.max(...all.map((m) => m.generation), 1)
    const branches = Array.from(new Set(all.map((m) => m.branch).filter(Boolean)))

    return {
      total: all.length,
      alive,
      deceased,
      generations: maxGen,
      branches,
    }
  })

  return {
    tree,
    flatMembers,
    memberById,
    parentById,
    selectedMemberId,
    selectedMember,
    bloodlineChain,
    bloodlinePathIds,
    collapsedIds,
    selectMember,
    toggleCollapse,
    collapseAll,
    expandAll,
    focusMember,
    addMember,
    updateMember,
    deleteMember,
    addSpouse,
    updateSpouse,
    removeSpouse,
    resetToDefault,
    loadFromFamilyTreeFile,
    exportJSON,
    importJSON,
    deathAnniversaries,
    stats,
  }
}
