<template>
  <div class="min-h-screen bg-gray-100">

    <header class="bg-white shadow px-10 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold text-blue-600">ระบบประเมินบุคลากร</h1>
      <div class="space-x-3">
        <button class="px-4 py-2 border rounded-lg">Sign In</button>
        <button class="px-4 py-2 bg-blue-500 text-white rounded-lg">Sign Up</button>
      </div>
    </header>

    <section class="flex gap-4 justify-center py-6">
      <select v-model="selectedPeriod" class="border rounded-lg px-4 py-2">
        <option value="">รอบการประเมิน</option>
        <option value="รอบที่ 1/2568">รอบที่ 1/2568</option>
        <option value="รอบที่ 2/2568">รอบที่ 2/2568</option>
      </select>

      <select v-model="selectedDept" class="border rounded-lg px-4 py-2">
        <option value="">ภาควิชา</option>
        <option v-for="d in departments" :key="d">{{ d }}</option>
      </select>

      <input
        v-model="search"
        type="text"
        placeholder="🔍 ค้นหาชื่อครู..."
        class="border rounded-lg px-4 py-2 w-64"
      />
    </section>

    <section class="px-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="u in filteredUsers"
        :key="u.id"
        class="bg-blue-100 rounded-2xl p-6 shadow hover:shadow-lg transition"
      >
        <h3 class="text-lg font-semibold">{{ u.name }}</h3>
        <p class="text-gray-600 text-sm">{{ u.department }}</p>

        <span class="inline-block mt-2 text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">
          {{ u.period }}
        </span>

        <div class="mt-6 flex justify-end">
          <router-link
            :to="`/evaluator/assignments/${u.id}`"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            เริ่มประเมิน
          </router-link>
        </div>
      </div>
    </section>
     <footer class="bg-white text-center py-4 text-gray-500 text-sm mt-8" style="font-family: 'Prompt', sans-serif;">
    © 2025 วิทยาลัยเทคนิคขอนแก่น — ระบบประเมินบุคลากร
  </footer>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";

const users = ref([]);
const search = ref("");
const selectedPeriod = ref("");
const selectedDept = ref("");

// ดึงข้อมูลจาก DummyJSON
onMounted(async () => {
  const res = await fetch("https://dummyjson.com/users?limit=12");
  const data = await res.json();

  users.value = data.users.map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    department: u.company?.department || "ไม่ระบุ",
    period: u.id % 2 === 0 ? "รอบที่ 1/2568" : "รอบที่ 2/2568"
  }));
});

// ดึงภาควิชาไม่ซ้ำ
const departments = computed(() => {
  return [...new Set(users.value.map(u => u.department))];
});

// Filter
const filteredUsers = computed(() => {
  return users.value.filter(u => {
    return (
      (!selectedPeriod.value || u.period === selectedPeriod.value) &&
      (!selectedDept.value || u.department === selectedDept.value) &&
      (!search.value || u.name.includes(search.value))
    );
  });
});
</script>
