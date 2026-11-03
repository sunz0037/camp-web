<script setup>
import { computed } from 'vue'
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Monitor,
  Network,
  Pencil,
  Plus,
  Search,
  Upload,
  UserCog,
  UserRound,
  Users,
  X
} from 'lucide-vue-next'

const ICONS = {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Monitor,
  Network,
  Pencil,
  Plus,
  Search,
  Upload,
  UserCog,
  UserRound,
  Users,
  X
}

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 18 }
})

const icon = computed(() => ICONS[props.name])
</script>

<template>
  <component :is="icon" :size="size" :stroke-width="1.75" aria-hidden="true" />
</template>
