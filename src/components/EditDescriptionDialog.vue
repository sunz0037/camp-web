<template>
  <Transition name="dialog">
    <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>编辑年级描述</h3>
          <button class="btn-close" @click="handleCancel">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>年级名称</label>
            <div class="readonly-field">{{ gradeName }}</div>
          </div>
          <div class="form-group">
            <label>年级描述</label>
            <textarea
              v-model="description"
              rows="4"
              placeholder="请输入年级描述..."
              class="description-input"
              @keydown.ctrl.enter="handleConfirm"
              @keydown.meta.enter="handleConfirm"
            ></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="handleCancel">取消</button>
          <button class="btn btn-primary" @click="handleConfirm">确定</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  gradeName: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const description = ref('')

watch(() => props.visible, (newVal) => {
  if (newVal) {
    description.value = props.description || ''
  }
})

watch(() => props.description, (newVal) => {
  if (props.visible) {
    description.value = newVal || ''
  }
})

const handleConfirm = () => {
  emit('confirm', description.value)
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleOverlayClick = () => {
  handleCancel()
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.dialog-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6e6e73;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.btn-close:hover {
  background: #f5f5f7;
}

.dialog-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1d1d1f;
}

.readonly-field {
  padding: 0.75rem;
  background: #f5f5f7;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9375rem;
  color: #6e6e73;
}

.description-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.description-input:focus {
  outline: none;
  border-color: #0071e3;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: white;
  color: #1d1d1f;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #fafafa;
}

.btn-primary {
  background: #000000;
  color: white;
}

.btn-primary:hover {
  background: #333333;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from .dialog-overlay {
  opacity: 0;
}

.dialog-leave-to .dialog-overlay {
  opacity: 0;
}

.dialog-enter-from .dialog-content {
  transform: translateY(20px);
  opacity: 0;
}

.dialog-leave-to .dialog-content {
  transform: translateY(20px);
  opacity: 0;
}
</style>

