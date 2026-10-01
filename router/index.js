import {
  createRouter,
  createWebHistory
} from "vue-router";

import { useAuthStore } from "../src/stores/auth.js";
// views
import Main from "../src/views/main.vue";
import NotFound from "../src/views/notfound.vue";
import Signup from "../src/views/Signup.vue";
import Login from "../src/views/Login.vue";
// pages
import ProfilePage from "../src/pages/profilepage.vue";
// evaluator
import EvaluationForm from "../src/components/evaluator/evaluationform.vue";
import EvaluatorAssignments from "../src/components/evaluator/evaluatorAssignments.vue";

// evaluatee
import TeachersAssignments from "../src/components/teacher/TeachersAssignments.vue";

const routes = [
  {
    path: "/",
    component: Main
  },

  {
    path: "/login",
    component: Login
  },

  {
    path: "/signup",
    component: Signup
  },

  {
    path: "/profile",
    component: ProfilePage,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: "/personnel",
    name: "Personnel",
    component: () =>
      import("../src/pages/dashboard.vue"),
    meta: {
      requiresAuth: true,
      role: "personnel"
    }
  },

  {
    path: "/evaluator",
    component: EvaluatorAssignments,
    meta: {
      requiresAuth: true,
      role: "evaluator"
    }
  },
  {
    path: "/evaluator/assignments/:id",
    component: EvaluationForm,
    props: true,
    meta: {
      requiresAuth: true,
      role: "evaluator"
    }
  },

  {
    path: "/evaluatee",
    component: TeachersAssignments,
    meta: {
      requiresAuth: true,
      role: "evaluatee"
    }
  },
  {
    path: "/evaluatee/assignments/:id",
    name: "EvaluateeAssignment",
    component: TeachersAssignments,
    props: true,
    meta: {
      requiresAuth: true,
      role: "evaluatee"
    }
  },
  {
    path: "/reports",
    component: () =>
      import("../src/views/reports.vue"),
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

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (
    to.meta.requiresAuth &&
    !auth.isLogin
  ) {
    return "/login";
  }

  if (to.meta.role) {
    if (auth.role !== to.meta.role) {
      return "/";
    }
  }
  return true;
});
export default router;