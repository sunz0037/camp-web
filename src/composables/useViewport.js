import { onMounted, onUnmounted, ref } from 'vue'

export function useViewport() {
  const query = window.matchMedia('(max-width: 768px)')
  const isMobile = ref(query.matches)
  const update = () => {
    isMobile.value = query.matches
  }
  onMounted(() => query.addEventListener('change', update))
  onUnmounted(() => query.removeEventListener('change', update))
  return { isMobile }
}
