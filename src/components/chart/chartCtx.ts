import type { InjectionKey, Ref } from 'vue'
import type { FamilyMember } from '../../types/family'

export interface FamilyChartCtx {
  selectedMemberId: Ref<string | null>
  bloodlinePathIds: Ref<Set<string>>
  collapsedIds: Ref<Set<string>>
  onSelect: (node: FamilyMember) => void
  onToggleCollapse: (id: string) => void
  onAddChild: (parent: FamilyMember) => void
  onEdit: (member: FamilyMember) => void
  onViewDetail: (member: FamilyMember) => void
  onAddSpouse: (member: FamilyMember) => void
  onDelete: (member: FamilyMember) => void
}

export const FAMILY_CHART_CTX: InjectionKey<FamilyChartCtx> = Symbol('familyChartCtx')
