<template>
  <AppModal
    :model-value="popupState.isOpen"
    :title="popupState.title"
    :subtitle="popupState.subtitle"
    :icon="popupIcon"
    :tone="modalTone"
    size="sm"
    z-class="z-[80]"
    :close-on-backdrop="false"
    @update:model-value="(val) => !val && closePopup()"
  >
    <div class="space-y-3 text-xs sm:text-sm text-kyn-text-primary leading-relaxed whitespace-pre-line py-1">
      <p>{{ popupState.message }}</p>
    </div>

    <template #footer>
      <div class="w-full flex items-center justify-end gap-2.5">
        <AppButton
          v-if="popupState.type === 'confirm'"
          variant="secondary"
          size="sm"
          @click="resolvePopup(false)"
        >
          {{ popupState.cancelText }}
        </AppButton>
        <AppButton
          :variant="popupState.confirmVariant"
          size="sm"
          @click="resolvePopup(true)"
        >
          <KynIcon v-if="popupIcon && popupState.confirmVariant === 'danger'" name="trash-2" :size="14" />
          <KynIcon v-else-if="popupState.tone === 'success'" name="check" :size="14" />
          <span>{{ popupState.confirmText }}</span>
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AppModal, AppButton, KynIcon } from '@kyn/vue-components'
import { usePopup } from '../../composables/usePopup'

const { popupState, resolvePopup, closePopup } = usePopup()

const popupIcon = computed(() => {
  switch (popupState.tone) {
    case 'success':
      return 'check-circle-2'
    case 'error':
      return 'alert-triangle'
    case 'warning':
      return 'alert-triangle'
    case 'info':
    default:
      return 'info'
  }
})

const modalTone = computed(() => {
  switch (popupState.tone) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
    default:
      return 'info'
  }
})
</script>
