<template>
  <AppModal
    :model-value="!!member"
    :title="member?.fullName || ''"
    :subtitle="member?.courtesyName ? `Tên gọi khác: ${member.courtesyName}` : (member ? genStyle.roman : '')"
    :close-on-backdrop="false"
    size="lg"
    @update:model-value="(val) => !val && $emit('close')"
  >
    <template #header>
      <div v-if="member" class="space-y-1 text-left">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold"
            :style="{ background: genStyle.color, color: '#ffffff' }"
          >
            {{ genStyle.roman }}
          </span>
          <AppBadge :tone="member.isAlive ? 'success' : 'neutral'">
            {{ member.isAlive ? 'Còn sống' : 'Đã tạ thế' }}
          </AppBadge>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            :class="member.gender === 'male' ? 'bg-sky-500/10 text-sky-600' : 'bg-rose-500/10 text-rose-600'"
          >
            {{ member.gender === 'male' ? 'Nam (Đinh)' : 'Nữ' }}
          </span>
        </div>
        <h2 class="text-xl font-bold text-kyn-text-title tracking-tight mt-0.5">{{ member.fullName }}</h2>
        <p v-if="member.courtesyName" class="text-xs text-amber-700 dark:text-amber-400 italic">
          Tên gọi khác: {{ member.courtesyName }}
        </p>
      </div>
    </template>

    <!-- Body nội dung -->
    <div v-if="member" class="space-y-5 text-sm text-kyn-text-primary">
      <!-- Thông tin cơ bản dạng grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-kyn-bg-secondary-2 p-4 rounded-xl border border-kyn-divider-dividers-1">
        <div>
          <span class="text-xs text-kyn-text-subtitle block">Vai vế dòng họ</span>
          <span class="font-semibold text-kyn-text-title">{{ member.orderTitle || '—' }}</span>
        </div>
        <div>
          <span class="text-xs text-kyn-text-subtitle block">Giới tính</span>
          <span class="font-semibold text-kyn-text-title">{{ member.gender === 'male' ? 'Nam (Đinh)' : 'Nữ' }}</span>
        </div>
        <div>
          <span class="text-xs text-kyn-text-subtitle block">Năm sinh / Sinh nhật</span>
          <span class="font-semibold text-kyn-text-title">
            {{ member.birthDate || 'Chưa rõ' }}
            <span v-if="member.birthDateLunar" class="text-xs text-kyn-text-subtitle">({{ member.birthDateLunar }})</span>
          </span>
        </div>
        <div>
          <span class="text-xs text-kyn-text-subtitle block">{{ member.isAlive ? 'Tình trạng' : 'Ngày mất / Ngày giỗ' }}</span>
          <span class="font-semibold text-kyn-text-title">
            <template v-if="member.isAlive">Còn sống</template>
            <template v-else>
              {{ member.deathDate || '—' }}
              <span v-if="member.deathDateLunar" class="text-amber-600 dark:text-amber-400 font-bold ml-1">
                (Giỗ: {{ member.deathDateLunar }} ÂL)
              </span>
            </template>
          </span>
        </div>
        <div v-if="member.burialPlace" class="md:col-span-2">
          <span class="text-xs text-kyn-text-subtitle block">Mộ phần / Nơi an táng</span>
          <span class="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <span>📍</span> {{ member.burialPlace }}
          </span>
        </div>
        <div v-if="member.address" class="md:col-span-2">
          <span class="text-xs text-kyn-text-subtitle block">Nơi ở / Cư trú</span>
          <span class="text-kyn-text-title">
            <span>🏠 {{ member.address }}</span>
          </span>
        </div>

        <!-- Thông tin Phụ mẫu (Cha & Mẹ) -->
        <div v-if="parentMember" class="md:col-span-2 bg-kyn-bg-secondary-1 p-2.5 rounded-lg border border-kyn-divider-dividers-2">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <div>
              <span class="text-kyn-text-subtitle">Phụ thân (Cha): </span>
              <span class="font-bold text-kyn-text-title">{{ parentMember.fullName }}</span>
            </div>
            <div v-if="member.motherName">
              <span class="text-kyn-text-subtitle">Mẫu thân (Mẹ): </span>
              <span class="font-bold text-amber-600 dark:text-amber-400">{{ member.motherName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Phối ngẫu & Thê thiếp (Một chồng có thể có nhiều vợ) -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-kyn-text-title flex items-center gap-1.5 text-sm">
            <span>💍</span> {{ member.gender === 'male' ? 'Phối ngẫu & Thê thiếp' : 'Phối ngẫu (Phu quân)' }} ({{ member.spouses?.length || 0 }})
          </h3>
          <AppButton variant="secondary" size="sm" @click="$emit('addSpouse', member)">
            <KynIcon name="plus" :size="14" />
            <span>Thêm {{ member.gender === 'male' ? 'vợ' : 'chồng' }}</span>
          </AppButton>
        </div>

        <div
          v-if="!member.spouses || member.spouses.length === 0"
          class="text-xs text-kyn-text-subtitle italic py-2"
        >
          Chưa có thông tin phối ngẫu
        </div>
        <div v-else class="space-y-2.5">
          <div
            v-for="sp in member.spouses"
            :key="sp.id"
            class="p-3 bg-kyn-bg-secondary-2 rounded-xl border border-kyn-divider-dividers-1 flex flex-col gap-2"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="px-2 py-0.5 rounded text-[11px]"
                    :class="getSpouseBadgeClass(sp.title)"
                  >
                    {{ sp.title || (member.gender === 'male' ? 'Vợ' : 'Chồng') }}
                  </span>
                  <span class="font-bold text-kyn-text-title text-sm">
                    {{ sp.fullName }}
                  </span>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full"
                    :class="sp.isAlive ? 'bg-kyn-success-tag-bg text-kyn-success-pressed-active' : 'bg-kyn-bg-secondary-3 text-kyn-text-secondary'"
                  >
                    {{ sp.isAlive ? 'Còn sống' : 'Đã mất' }}
                  </span>
                </div>
                <div class="text-xs text-kyn-text-subtitle mt-1 flex flex-wrap gap-x-3">
                  <span v-if="sp.birthYear || sp.deathYear">
                    Năm: {{ sp.birthYear || '?' }} – {{ sp.isAlive ? 'nay' : (sp.deathYear || '?') }}
                  </span>
                  <span v-if="!sp.isAlive && sp.deathDateLunar" class="text-amber-600 dark:text-amber-400 font-medium">
                    Giỗ: {{ sp.deathDateLunar }} ÂL
                  </span>
                  <span v-if="sp.origin">Quê quán: {{ sp.origin }}</span>
                </div>
                <div v-if="sp.burialPlace" class="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Mộ phần: {{ sp.burialPlace }}
                </div>
                <div v-if="sp.bio" class="text-xs text-kyn-text-subtitle mt-1 italic">
                  "{{ sp.bio }}"
                </div>
              </div>

              <div class="flex items-center gap-2 flex-none">
                <button
                  type="button"
                  class="text-xs text-kyn-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  title="Sửa thông tin phối ngẫu"
                  @click="$emit('editSpouse', member, sp)"
                >
                  <KynIcon name="pencil" :size="12" />
                  <span>Sửa</span>
                </button>
                <span class="text-kyn-divider-dividers-2">|</span>
                <button
                  type="button"
                  class="text-xs text-kyn-error-primary hover:underline flex items-center gap-1 cursor-pointer"
                  title="Xóa phối ngẫu"
                  @click="$emit('removeSpouse', member.id, sp.id)"
                >
                  <KynIcon name="trash-2" :size="12" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>

            <!-- Các con do bà này sinh hạ -->
            <div
              v-if="childrenByMother(sp.id).length > 0"
              class="pt-2 border-t border-kyn-divider-dividers-1/60 text-xs"
            >
              <span class="text-kyn-text-subtitle font-medium">
                Con do bà sinh hạ ({{ childrenByMother(sp.id).length }}):
              </span>
              <div class="flex flex-wrap gap-1.5 mt-1">
                <button
                  v-for="child in childrenByMother(sp.id)"
                  :key="child.id"
                  type="button"
                  class="px-2 py-0.5 rounded bg-kyn-bg-primary border border-kyn-divider-dividers-2 hover:border-kyn-primary text-[11px] font-semibold text-kyn-text-title transition-colors cursor-pointer"
                  @click="$emit('focusMember', child.id)"
                >
                  {{ child.fullName }} {{ child.orderTitle ? `(${child.orderTitle})` : '' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Danh sách Con cái -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-kyn-text-title flex items-center gap-1.5 text-sm">
            <span>🌿</span> Các con ({{ member.children?.length || 0 }})
          </h3>
          <AppButton variant="ghost" size="sm" @click="$emit('addChild', member)">
            <KynIcon name="plus" :size="14" />
            <span>Thêm con</span>
          </AppButton>
        </div>

        <div
          v-if="!member.children || member.children.length === 0"
          class="text-xs text-kyn-text-subtitle italic py-2"
        >
          Chưa có thông tin con cái
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            v-for="c in member.children"
            :key="c.id"
            type="button"
            class="text-left p-2.5 rounded-lg border border-kyn-divider-dividers-1 hover:border-kyn-primary hover:bg-kyn-bg-secondary-2 transition-colors flex items-center justify-between group cursor-pointer"
            @click="$emit('focusMember', c.id)"
          >
            <div>
              <span class="font-semibold text-kyn-text-title group-hover:text-kyn-primary text-xs">
                {{ c.fullName }}
              </span>
              <span v-if="c.orderTitle" class="text-[11px] text-amber-600 dark:text-amber-400 block">
                {{ c.orderTitle }}
              </span>
            </div>
            <span class="text-xs text-kyn-text-subtitle group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      <!-- Tiểu sử & Công trạng -->
      <div v-if="member.bio">
        <h3 class="font-bold text-kyn-text-title flex items-center gap-1.5 mb-1.5 text-sm">
          <span>📜</span> Tiểu sử & Công trạng
        </h3>
        <div class="p-3.5 bg-kyn-bg-secondary-2 border border-kyn-divider-dividers-1 rounded-xl text-kyn-text-primary leading-relaxed text-sm">
          {{ member.bio }}
        </div>
      </div>
    </div>

    <!-- Footer thao tác dùng AppButton KYN -->
    <template #footer>
      <div v-if="member" class="w-full flex items-center justify-between">
        <AppButton variant="danger" size="sm" @click="$emit('delete', member)">
          Xóa thành viên
        </AppButton>

        <div class="flex items-center gap-2">
          <AppButton variant="primary" size="sm" @click="$emit('edit', member)">
            <KynIcon name="pencil" :size="14" />
            <span>Sửa thông tin</span>
          </AppButton>
          <AppButton variant="secondary" size="sm" @click="$emit('close')">
            Đóng
          </AppButton>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AppModal, AppButton, AppBadge, KynIcon } from '@kyn/vue-components'
import type { FamilyMember, SpouseInfo } from '../../types/family'
import { getGenerationStyle } from '../../data/generationStyles'
import { useFamilyTree } from '../../composables/useFamilyTree'

const props = defineProps<{
  member: FamilyMember | null
}>()

defineEmits<{
  close: []
  edit: [member: FamilyMember]
  addChild: [parent: FamilyMember]
  addSpouse: [member: FamilyMember]
  editSpouse: [member: FamilyMember, spouse: SpouseInfo]
  removeSpouse: [memberId: string, spouseId: string]
  focusMember: [memberId: string]
  delete: [member: FamilyMember]
}>()

const { memberById } = useFamilyTree()

const parentMember = computed(() => {
  if (!props.member?.parentId) return null
  return memberById.value.get(props.member.parentId) ?? null
})

function childrenByMother(spouseId: string): FamilyMember[] {
  if (!props.member?.children) return []
  return props.member.children.filter((c) => c.motherId === spouseId)
}

function getSpouseBadgeClass(title?: string) {
  if (!title) return 'bg-kyn-bg-secondary-2 text-kyn-text-secondary border border-kyn-divider-dividers-2'
  const t = title.toLowerCase()
  if (t.includes('bà cả') || t.includes('chính thất') || t.includes('nguyên phối')) {
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold'
  }
  if (t.includes('bà hai') || t.includes('kế thất') || t.includes('bà kế')) {
    return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-bold'
  }
  if (t.includes('bà ba') || t.includes('trắc thất')) {
    return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold'
  }
  if (t.includes('bà tư') || t.includes('bà năm') || t.includes('thứ thất') || t.includes('vợ lẽ') || t.includes('á thất')) {
    return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold'
  }
  if (t === 'vợ' || t.includes('hiền thê')) {
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold'
  }
  return 'bg-kyn-bg-secondary-2 text-kyn-text-secondary border border-kyn-divider-dividers-2 font-medium'
}

const genStyle = computed(() => {
  return props.member ? getGenerationStyle(props.member.generation) : getGenerationStyle(1)
})
</script>
