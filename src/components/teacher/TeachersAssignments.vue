<template>

  <div class="min-h-screen bg-gray-100 p-8">

    <h1 class="text-2xl font-bold mb-6">
      แบบประเมินของฉัน
    </h1>

    <!-- Loading -->
    <div v-if="loading">
      กำลังโหลดข้อมูล...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>

    <!-- รายการ -->
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

      <div v-for="item in assignments" :key="item.id" class="bg-white p-6 rounded-xl shadow">

        <h2 class="text-xl font-bold">
          {{ item.evaluatee_name }}
        </h2>

        <p>
          ภาควิชา: {{ item.department }}
        </p>

        <p>
          รอบ: {{ item.period }}
        </p>

        <p>
          สถานะ: {{ item.status }}
        </p>

        <button @click="openEvaluation(item.id)" class="bg-blue-500 text-white px-4 py-2 rounded">
          ทำแบบประเมิน
        </button>

      </div>

    </div>

  </div>

</template>


<script setup>

import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useAuthStore } from "../../stores/auth.js";


const router = useRouter();
const auth = useAuthStore();

const assignments = ref([]);
const loading = ref(true);
const error = ref("");

const API = "http://localhost:3000/api";


async function loadAssignments() {

  try {

    const res = await axios.get(
      `${API}/evaluatee/assignments`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }
    );

    assignments.value = res.data.data;

  } catch (err) {

    console.error(err);

    error.value = "ไม่สามารถโหลดข้อมูลได้";

  } finally {

    loading.value = false;

  }

}


function openEvaluation(id) {

  router.push(`/evaluatee/assignments/${id}`);

}


onMounted(loadAssignments);

</script>
