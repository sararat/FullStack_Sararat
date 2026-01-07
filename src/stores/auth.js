import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    role: null,
    isLogin: false
  }),

  actions: {
    login(user, token) {
      this.user = user
      this.token = token
      this.role = user.role
      this.isLogin = true

      // เก็บลง localStorage
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
      localStorage.setItem('role', user.role)
    },

    logout() {
      this.user = null
      this.token = null
      this.role = null
      this.isLogin = false

      // ล้าง localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('role')
    },

    restore() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      const role = localStorage.getItem('role')

      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.role = role
        this.isLogin = true
      }
    }
  }
})
