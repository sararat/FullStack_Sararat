import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../src/stores/auth.js";

// หน้าเว็บ
import Main from "../src/views/main.vue";
import Signup from "../src/views/Signup.vue";
import Login from "../src/views/Login.vue";
import NotFound from "../src/views/notfound.vue";


// หน้าอื่น
import ProfilePage from "../src/pages/profilepage.vue";
import Dashboard from "../src/pages/dashboard.vue";

// Evaluator
import EvaluationForm from "../src/components/evaluator/evaluationform.vue";
import EvaluatorAssignments from "../src/components/evaluator/evaluatorAssignments.vue";

// Evaluatee
import TeachersAssignments from "../src/components/teacher/TeachersAssignments.vue";



const routes = [

  // หน้าแรก
  {
    path: "/",
    component: Main
  },

  // Login
  {
    path: "/login",
    component: Login
  },

  // Signup
  {
    path: "/signup",
    component: Signup
  },

  // Profile
  {
    path: "/profile",
    component: ProfilePage,
    meta: {
      requiresAuth: true
    }
  },


  // =========================
  // Personnel
  // =========================

  {
    path: "/personnel",
    name: "Personnel",
    component: Dashboard,
    meta: {
      requiresAuth: true,
      role: "personnel"
    }
  },


  // =========================
  // Evaluator
  // =========================

  {
    path: "/evaluator",
    name: "Evaluator",
    component: EvaluatorAssignments,
    meta: {
      requiresAuth: true,
      role: "evaluator"
    }
  },

  {
    path: "/evaluator/assignments/:id",
    name: "EvaluationForm",
    component: EvaluationForm,
    props: true,
    meta: {
      requiresAuth: true,
      role: "evaluator"
    }
  },


  // =========================
  // Evaluatee
  // =========================

  {
    path: "/evaluatee",
    name: "Evaluatee",
    component: TeachersAssignments,
    meta: {
      requiresAuth: true,
      role: "evaluatee"
    }
  },

  // {
  //   path: "/evaluatee/assignments/:id",
  //   name: "EvaluateeAssignment",
  //   component: EvaluateeEvaluation,
  //   props: true,
  //   meta: {
  //     requiresAuth: true,
  //     role: "evaluatee"
  //   }
  // },

  {
    path: "/reports",
    name: "Reports",
    component: () => import("../src/views/reports.vue"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/:catchAll(.*)",
    component: NotFound
  }

];


const router = createRouter({

  history: createWebHistory(),

  routes

});


// =========================
// ตรวจสอบ Login + Role
// =========================

router.beforeEach((to) => {

  const auth = useAuthStore();


  // ยังไม่ได้ Login
  if (to.meta.requiresAuth && !auth.isLogin) {

    return "/login";

  }


  // Role ไม่ตรง
  if (
    to.meta.role &&
    auth.role !== to.meta.role
  ) {

    return "/";

  }


  return true;

});


export default router;
 
