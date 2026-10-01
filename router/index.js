import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../src/stores/auth.js';

// views
import Main from '../src/views/main.vue'
import NotFound from '../src/views/notfound.vue'
import EvaluationForm from '../src/components/evaluator/evaluationform.vue'
import Signup from '../src/views/Signup.vue'
import Login from '../src/views/Login.vue'
// pages
import ProfilePage from '../src/pages/profilepage.vue'


// components
import EvaluatorAssignments from '../src/components/evaluator/evaluatorAssignments.vue'
import TeachersAssignments from '../src/components/teacher/TeachersAssignments.vue'
const routes = [
  {
    path: '/',
    component: Main
  },

  {
    path: '/login',
    component: Login
  },
  {
    path: '/signup',
    component: Signup
  },

  {
    path: '/profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },

  {
    path: '/evaluator',
    component: EvaluatorAssignments,
    meta: { requiresAuth: true }
  },


  {
    path: '/evaluator/assignments/:id',
    component: EvaluationForm,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/evaluatee/assignments/:id',
    name: 'EvaluateeAssignment',
    component: TeachersAssignments,
    props: true,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/reports',
    component: () => import('../src/views/reports.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    component: () => import('../src/pages/dashboard.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },

  {
    path: '/:catchAll(.*)',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLogin) {
    return '/signin'
  }

  if (to.meta.adminOnly && auth.role !== 'admin') {
    return '/'
  }
})


export default router
