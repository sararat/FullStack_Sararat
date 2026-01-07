<template>
  <header class="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur shadow"
    style="font-family: 'Prompt', sans-serif;">
    <nav class="max-w-7xl mx-auto px-6">
      <div class="flex h-16 items-center justify-between">

        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3">
          <img src="../assets/icon.png" class="h-9 w-9" />
          <span class="text-xl font-bold text-blue-700 tracking-tight">
            ระบบประเมินบุคลากร
          </span>
        </router-link>

        <!-- Desktop Menu -->
        <ul class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">

          <li>
            <router-link to="/" class="hover:text-blue-700">
              หน้าแรก
            </router-link>
          </li>

          <!-- Dropdown -->
          <li class="relative group">
            <button class="flex items-center gap-1 px-3 py-2 rounded-md
                     hover:bg-blue-50 hover:text-blue-700 transition">
              แบบประเมิน
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <ul class="absolute left-0 top-11 w-48 bg-white rounded-xl shadow-lg
                     opacity-0 invisible group-hover:opacity-100 group-hover:visible
                     translate-y-2 group-hover:translate-y-0 transition-all">
              <li>
                <router-link to="/evaluator" class="block px-4 py-2 hover:bg-blue-50">
                  กรรมการ
                </router-link>
              </li>
              <li>
                <router-link to="/teachers" class="block px-4 py-2 hover:bg-blue-50">
                  ครูผู้ถูกประเมิน
                </router-link>
              </li>
            </ul>
          </li>

          <li>
            <router-link to="/reports" class="hover:text-blue-700">
              รายงาน
            </router-link>
          </li>

          <li>
            <router-link to="/dashboard" class="hover:text-blue-700">
              Dashboard
            </router-link>
          </li>
        </ul>

        <!-- User -->
        <div class="hidden md:flex items-center gap-4">

          <!-- Not Login -->
          <template v-if="!auth.isLogin">
            <router-link to="/signin" class="px-4 py-2 rounded-lg text-sm font-semibold
                     text-slate-700 hover:bg-slate-100">
              Sign In
            </router-link>
            <router-link to="/signup" class="px-4 py-2 rounded-lg text-sm font-semibold
                     bg-blue-600 text-white hover:bg-blue-700">
              Sign Up
            </router-link>
          </template>

          <!-- Login -->
          <template v-else>
            <div class="relative group flex items-center gap-3 cursor-pointer">
              <img :src="avatarUrl" alt="avatar" class="h-9 w-9 rounded-full border object-cover"
                @error="e => e.target.src = '/uploads/avatar.png'" />

              <span class="text-sm font-semibold text-slate-800">
                {{ auth.user.username }}
              </span>


              <ul class="absolute right-0 top-12 w-44 bg-white rounded-xl shadow-lg
                       opacity-0 invisible group-hover:opacity-100 group-hover:visible
                       translate-y-2 group-hover:translate-y-0 transition-all">
                <li>
                  <router-link to="/profile" class="block px-4 py-2 hover:bg-slate-100">
                    โปรไฟล์
                  </router-link>
                </li>
                <li>
                  <button @click="logout" class="w-full text-left px-4 py-2 text-sm
                           text-red-600 hover:bg-red-50">
                    ออกจากระบบ
                  </button>
                </li>
              </ul>
            </div>
          </template>
        </div>

        <!-- Mobile Toggle -->
        <button @click="isOpen = !isOpen" class="md:hidden">
          <svg class="h-7 w-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <div v-if="isOpen" class="md:hidden bg-white border-t shadow">
      <div class="flex flex-col px-6 py-4 gap-2 text-sm font-medium">
        <router-link to="/" class="py-2">หน้าแรก</router-link>
        <router-link to="/evaluator" class="py-2">กรรมการ</router-link>
        <router-link to="/teachers" class="py-2">ครูผู้ถูกประเมิน</router-link>
        <router-link to="/reports" class="py-2">รายงาน</router-link>

        <hr />

        <router-link v-if="!auth.isLogin" to="/signin" class="py-2">
          Sign In
        </router-link>
        <router-link v-if="!auth.isLogin" to="/signup" class="py-2">
          Sign Up
        </router-link>

        <button v-if="auth.isLogin" @click="logout" class="text-left text-red-600 py-2">
          ออกจากระบบ
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../src/stores/auth'

const auth = useAuthStore()
const isOpen = ref(false)

const avatarUrl = computed(() => {
  if (!auth.user || !auth.user.avatar) {
    return '/uploads/avatar.png'
  }

  return `http://localhost:3000/uploads/${auth.user.avatar}`
})



const logout = () => {
  auth.logout()
}
</script>