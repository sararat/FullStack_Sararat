<template>
  <div class="min-h-screen bg-gray-100">

    <!-- Header -->
    <header
      class="bg-white shadow px-10 py-4 flex justify-between items-center"
    >
      <h1 class="text-xl font-bold text-blue-600">
        ระบบประเมินบุคลากร
      </h1>

      <div class="space-x-3">
        <button
          @click="goSignIn"
          class="px-4 py-2 border rounded-lg"
        >
          Sign In
        </button>

        <button
          @click="goSignUp"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Sign Up
        </button>
      </div>
    </header>

    <!-- Filter -->
    <section class="flex gap-4 justify-center py-6 flex-wrap">

      <!-- รอบการประเมิน -->
      <select
        v-model="selectedPeriod"
        class="border rounded-lg px-4 py-2 bg-white"
      >
        <option value="">
          รอบการประเมิน
        </option>

        <option
          v-for="period in periods"
          :key="period"
          :value="period"
        >
          {{ period }}
        </option>
      </select>

      <!-- ภาควิชา -->
      <select
        v-model="selectedDept"
        class="border rounded-lg px-4 py-2 bg-white"
      >
        <option value="">
          ภาควิชา
        </option>

        <option
          v-for="department in departments"
          :key="department"
          :value="department"
        >
          {{ department }}
        </option>
      </select>

      <!-- ค้นหา -->
      <input
        v-model="search"
        type="text"
        placeholder="🔍 ค้นหาชื่อบุคลากร..."
        class="border rounded-lg px-4 py-2 w-64 bg-white"
      />

    </section>

    <!-- Loading -->
    <div
      v-if="loading"
      class="text-center py-10 text-gray-500"
    >
      กำลังโหลดข้อมูล...
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="mx-10 bg-red-100 text-red-700 p-4 rounded-lg"
    >
      {{ error }}
    </div>

    <!-- ไม่มีข้อมูล -->
    <div
      v-else-if="filteredUsers.length === 0"
      class="text-center py-10 text-gray-500"
    >
      ไม่พบข้อมูลผู้รับการประเมิน
    </div>

    <!-- รายการบุคลากร -->
    <section
      v-else
      class="px-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >

      <div
        v-for="u in filteredUsers"
        :key="u.id"
        class="bg-blue-100 rounded-2xl p-6 shadow hover:shadow-lg transition"
      >

        <h3 class="text-lg font-semibold">
          {{ u.name }}
        </h3>

        <p class="text-gray-600 text-sm mt-1">
          {{ u.department }}
        </p>

        <span
          class="inline-block mt-2 text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded"
        >
          {{ u.period }}
        </span>

        <!-- สถานะ -->
        <div class="mt-3">
          <span
            v-if="u.status === 'pending'"
            class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
          >
            รอประเมิน
          </span>

          <span
            v-else-if="u.status === 'completed'"
            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
          >
            ประเมินแล้ว
          </span>

          <span
            v-else
            class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
          >
            {{ u.status }}
          </span>
        </div>

        <!-- ปุ่มประเมิน -->
        <div class="mt-6 flex justify-end">

          <router-link
            :to="{
              name: 'EvaluationForm',
              params: {
                id: u.id
              }
            }"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            เริ่มประเมิน
          </router-link>

        </div>

      </div>

    </section>

    <!-- Footer -->
    <footer
      class="bg-white text-center py-4 text-gray-500 text-sm mt-8"
      style="font-family: 'Prompt', sans-serif;"
    >
      © 2025 วิทยาลัยเทคนิคขอนแก่น — ระบบประเมินบุคลากร
    </footer>

  </div>
</template>


<script setup>

import {
  ref,
  computed,
  onMounted
} from "vue";

import { useRouter } from "vue-router";


const router = useRouter();


// =====================================================
// State
// =====================================================

const users = ref([]);

const search = ref("");

const selectedPeriod = ref("");

const selectedDept = ref("");

const loading = ref(false);

const error = ref("");


// =====================================================
// API
// =====================================================

const API_URL = "http://localhost:3000/api";


// =====================================================
// โหลดข้อมูลการประเมิน
// =====================================================

const loadAssignments = async () => {

  loading.value = true;

  error.value = "";

  try {

    const response = await fetch(
      `${API_URL}/evaluator/assignments`
    );

    if (!response.ok) {

      throw new Error(
        `HTTP Error ${response.status}`
      );

    }

    const data = await response.json();

    console.log(
      "ข้อมูลจาก Backend:",
      data
    );


    // รองรับทั้ง
    // { data: [...] }
    // และ [...]
    const assignments =
      Array.isArray(data)
        ? data
        : data.data || [];


    users.value = assignments.map(item => ({

      id: item.id,

      name:
        item.name ||
        `${item.first_name || ""} ${item.last_name || ""}`.trim(),

      department:
        item.department ||
        "ไม่ระบุ",

      period:
        item.period ||
        "ไม่ระบุ",

      status:
        item.status ||
        "pending"

    }));


  } catch (err) {

    console.error(
      "โหลดข้อมูลไม่สำเร็จ:",
      err
    );

    error.value =
      "ไม่สามารถโหลดข้อมูลจากฐานข้อมูลได้";

  } finally {

    loading.value = false;

  }

};


// =====================================================
// โหลดข้อมูลเมื่อเปิดหน้า
// =====================================================

onMounted(() => {

  loadAssignments();

});


// =====================================================
// รอบการประเมิน
// =====================================================

const periods = computed(() => {

  return [
    ...new Set(
      users.value.map(
        u => u.period
      )
    )
  ];

});


// =====================================================
// ภาควิชา
// =====================================================

const departments = computed(() => {

  return [
    ...new Set(
      users.value.map(
        u => u.department
      )
    )
  ];

});


// =====================================================
// Filter
// =====================================================

const filteredUsers = computed(() => {

  const keyword =
    search.value
      .trim()
      .toLowerCase();


  return users.value.filter(u => {

    const matchPeriod =
      !selectedPeriod.value ||
      u.period === selectedPeriod.value;


    const matchDepartment =
      !selectedDept.value ||
      u.department === selectedDept.value;


    const matchSearch =
      !keyword ||
      u.name
        .toLowerCase()
        .includes(keyword);


    return (
      matchPeriod &&
      matchDepartment &&
      matchSearch
    );

  });

});


// =====================================================
// Navigation
// =====================================================

const goSignIn = () => {

  router.push("/signin");

};


const goSignUp = () => {

  router.push("/signup");

};

</script>