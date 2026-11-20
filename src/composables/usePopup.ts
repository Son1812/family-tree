import { ref, reactive } from 'vue'

export type PopupType = 'alert' | 'confirm'
export type PopupTone = 'success' | 'error' | 'warning' | 'info'
export type PopupButtonVariant = 'primary' | 'danger' | 'secondary'

export interface PopupOptions {
  title: string
  message: string
  subtitle?: string
  type?: PopupType
  tone?: PopupTone
  confirmText?: string
  cancelText?: string
  confirmVariant?: PopupButtonVariant
}

interface PopupState extends PopupOptions {
  isOpen: boolean
  resolver: ((val: boolean) => void) | null
}

const state = reactive<PopupState>({
  isOpen: false,
  title: '',
  subtitle: undefined,
  message: '',
  type: 'alert',
  tone: 'info',
  confirmText: 'Đồng ý',
  cancelText: 'Hủy bỏ',
  confirmVariant: 'primary',
  resolver: null,
})

export function usePopup() {
  function openPopup(options: PopupOptions): Promise<boolean> {
    return new Promise((resolve) => {
      // Nếu có popup đang mở trước đó, đóng giải quyết trước
      if (state.resolver) {
        state.resolver(false)
      }

      state.title = options.title
      state.subtitle = options.subtitle
      state.message = options.message
      state.type = options.type || 'alert'
      state.tone = options.tone || 'info'
      state.confirmText = options.confirmText || (options.type === 'confirm' ? 'Xác nhận' : 'Đồng ý')
      state.cancelText = options.cancelText || 'Hủy bỏ'
      state.confirmVariant = options.confirmVariant || (options.tone === 'error' ? 'danger' : 'primary')
      state.resolver = resolve
      state.isOpen = true
    })
  }

  function showAlert(options: Omit<PopupOptions, 'type'>): Promise<boolean> {
    return openPopup({
      ...options,
      type: 'alert',
      confirmText: options.confirmText || 'Đóng',
    })
  }

  function showConfirm(options: Omit<PopupOptions, 'type'>): Promise<boolean> {
    return openPopup({
      ...options,
      type: 'confirm',
      confirmText: options.confirmText || 'Xác nhận',
      cancelText: options.cancelText || 'Hủy bỏ',
    })
  }

  function resolvePopup(val: boolean) {
    if (state.resolver) {
      state.resolver(val)
      state.resolver = null
    }
    state.isOpen = false
  }

  function closePopup() {
    resolvePopup(false)
  }

  return {
    popupState: state,
    openPopup,
    showAlert,
    showConfirm,
    resolvePopup,
    closePopup,
  }
}
