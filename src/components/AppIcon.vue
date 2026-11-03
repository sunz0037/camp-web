<script setup>
import { computed } from 'vue'
import {
  Bell,
  BookMarked,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Contact,
  Download,
  Eye,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Link2,
  LogOut,
  Megaphone,
  Monitor,
  Network,
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Upload,
  UserCog,
  UserRound,
  Users,
  X
} from 'lucide-vue-next'

const ICONS = {
  Bell,
  BookMarked,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Contact,
  Download,
  Eye,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Link2,
  LogOut,
  Megaphone,
  Monitor,
  Network,
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldCheck,
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
