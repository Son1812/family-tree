import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { FamilyMember } from '../types/family'

export function useClientFileStorage(
  tree: Ref<FamilyMember[]>,
  importJSON: (jsonStr: string) => boolean,
) {
  // Handle file hiện tại đang được liên kết (File System Access API)
  const currentFileHandle = ref<any>(null)
  const linkedFileName = ref<string>('')
  const isSaving = ref(false)
  const isDirty = ref(false)
  const lastSavedAt = ref<Date | null>(null)
  const autoSaveToFile = ref(false)

  // Kiểm tra xem trình duyệt có hỗ trợ File System Access API không
  const isFileSystemSupported = computed(() => {
    return typeof window !== 'undefined' && 'showSaveFilePicker' in window && 'showOpenFilePicker' in window
  })

  // Định dạng nội dung JSON có thụt lề 2 khoảng trắng
  function getTreeJSON(): string {
    return JSON.stringify(tree.value, null, 2)
  }

  // 1. Lưu trực tiếp và ghi đè vào file family-tree.json
  async function saveToFile(forceSaveAs = false): Promise<{ success: boolean; message: string }> {
    try {
      isSaving.value = true
      const jsonStr = getTreeJSON()

      // Nếu không yêu cầu "Save As" file mới, ưu tiên ghi đè thẳng vào file family-tree.json của dự án
      if (!forceSaveAs) {
        try {
          const res = await fetch('/api/save-tree-json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonStr,
          })
          if (res.ok) {
            isDirty.value = false
            lastSavedAt.value = new Date()
            linkedFileName.value = 'family-tree.json'
            try {
              localStorage.setItem('family_tree_data_v4', jsonStr)
            } catch (_) {}
            return {
              success: true,
              message: 'Đã ghi đè thành công vào file family-tree.json!',
            }
          }
        } catch (_) {
          // Dev API server không có (vd: môi trường static host), chuyển sang File System Access
        }

        // Nếu đã có file handle liên kết từ trước
        if (currentFileHandle.value) {
          const writable = await currentFileHandle.value.createWritable()
          await writable.write(jsonStr)
          await writable.close()
          isDirty.value = false
          lastSavedAt.value = new Date()
          return {
            success: true,
            message: `Đã ghi đè thành công vào file "${currentFileHandle.value.name}".`,
          }
        }
      }

      // Khi yêu cầu Save As hoặc trên trình duyệt độc lập
      if (isFileSystemSupported.value) {
        const pickerOptions = {
          suggestedName: linkedFileName.value || 'family-tree.json',
          types: [
            {
              description: 'File JSON Gia Phả',
              accept: { 'application/json': ['.json'] },
            },
          ],
        }
        currentFileHandle.value = await (window as any).showSaveFilePicker(pickerOptions)
        linkedFileName.value = currentFileHandle.value?.name || 'family-tree.json'
        const writable = await currentFileHandle.value.createWritable()
        await writable.write(jsonStr)
        await writable.close()
        isDirty.value = false
        lastSavedAt.value = new Date()
        return {
          success: true,
          message: `Đã ghi đè thành công vào file "${linkedFileName.value}".`,
        }
      } else {
        // Fallback tải file về máy
        downloadFallback('family-tree.json')
        isDirty.value = false
        lastSavedAt.value = new Date()
        return { success: true, message: 'Đã tải và xuất file family-tree.json về máy tính.' }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, message: 'Bạn đã hủy thao tác lưu file.' }
      }
      console.error('Lỗi lưu file family-tree.json:', err)
      return { success: false, message: 'Lỗi khi lưu file: ' + err.message }
    } finally {
      isSaving.value = false
    }
  }

  // 2. Mở file JSON trực tiếp từ máy tính client
  async function openFromLocalFile(): Promise<{ success: boolean; message: string }> {
    try {
      if (isFileSystemSupported.value) {
        const pickerOptions = {
          multiple: false,
          types: [
            {
              description: 'File JSON Gia Phả',
              accept: { 'application/json': ['.json'] },
            },
          ],
        }
        const [handle] = await (window as any).showOpenFilePicker(pickerOptions)
        if (!handle) return { success: false, message: 'Không chọn file nào.' }

        const file = await handle.getFile()
        const text = await file.text()
        const ok = importJSON(text)

        if (ok) {
          currentFileHandle.value = handle
          linkedFileName.value = handle.name
          isDirty.value = false
          lastSavedAt.value = new Date()
          return {
            success: true,
            message: `Đã mở và liên kết thành công file "${handle.name}".`,
          }
        } else {
          return { success: false, message: 'Nội dung file không đúng định dạng cây gia phả.' }
        }
      } else {
        return {
          success: false,
          message: 'Trình duyệt không hỗ trợ mở file trực tiếp. Vui lòng dùng nút Nhập file.',
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, message: 'Bạn đã hủy thao tác mở file.' }
      }
      return { success: false, message: 'Lỗi khi đọc file: ' + err.message }
    }
  }

  // 3. Tải xuống file JSON (Download fallback)
  function downloadFallback(filename?: string) {
    const dataStr = getTreeJSON()
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `gia-pha-chi-pham-toc-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 4. Lưu trực tiếp vào thư mục dự án (public/data/family-tree.json) qua dev API nếu có
  async function saveToProjectFile(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/save-tree-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: getTreeJSON(),
      })
      if (res.ok) {
        isDirty.value = false
        lastSavedAt.value = new Date()
        return { success: true, message: 'Đã lưu thành công vào "public/data/family-tree.json".' }
      }
    } catch (e) {
      // Khi không chạy dưới vite server hoặc đã build production
    }
    // Fallback sang lưu file máy khách
    return saveToFile()
  }

  // Đánh dấu có thay đổi
  function markDirty() {
    isDirty.value = true
  }

  // Hủy liên kết file hiện tại
  function unlinkFile() {
    currentFileHandle.value = null
    linkedFileName.value = ''
    isDirty.value = false
  }

  return {
    currentFileHandle,
    linkedFileName,
    isFileSystemSupported,
    isSaving,
    isDirty,
    lastSavedAt,
    autoSaveToFile,
    saveToFile,
    openFromLocalFile,
    downloadFallback,
    saveToProjectFile,
    markDirty,
    unlinkFile,
  }
}
