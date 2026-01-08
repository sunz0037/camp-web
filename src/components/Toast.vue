<template>
  <Transition name="toast">
    <div v-if="visible" :class="['toast', `toast-${type}`]">
      <span class="toast-icon">{{ icon }}</span>
      <span class="toast-message">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'success', // success, error, info
    validator: (value) => ['success', 'error', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000 // 默认3秒后自动消失
  }
})

const emit = defineEmits(['update:visible', 'close'])

let timer = null

const icon = {
  success: '✓',
  error: '✕',
  info: 'ℹ'
}[props.type]

watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer)
    }
    // 设置新的定时器
    timer = setTimeout(() => {
      emit('update:visible', false)
      emit('close')
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 500px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 10000;
  font-size: 0.9375rem;
  animation: slideIn 0.3s ease-out;
}

.toast-success {
  background: #34c759;
  color: white;
}

.toast-error {
  background: #ff3b30;
  color: white;
}

.toast-info {
  background: #0071e3;
  color: white;
}

.toast-icon {
  font-size: 1.25rem;
  font-weight: bold;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  line-height: 1.5;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>

