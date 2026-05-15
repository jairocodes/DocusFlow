import { create } from 'zustand'

const useToastStore = create((set) => ({
  message: '',
  type: 'success',
  visible: false,
  show: (message, type = 'success') => {
    set({ message, type, visible: true })
    setTimeout(() => set({ visible: false }), 2800)
  },
}))

export default useToastStore
