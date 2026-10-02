<template>

  <div class="min-h-screen bg-gray-100 p-8">

    <!-- Loading -->
    <div
      v-if="loading"
      class="text-center py-10"
    >
      กำลังโหลดแบบประเมิน...
    </div>


    <!-- Error -->
    <div
      v-else-if="error"
      class="text-center text-red-500 py-10"
    >
      {{ error }}
    </div>


    <!-- แบบประเมิน -->
    <div v-else>

      <div class="bg-white p-6 rounded-2xl shadow mb-6">

        <h1 class="text-2xl font-bold">
          แบบประเมินบุคลากร
        </h1>

        <p class="mt-2">
          ผู้รับการประเมิน:
          <b>{{ evaluation.name }}</b>
        </p>

        <p>
          ภาควิชา:
          {{ evaluation.department }}
        </p>

        <p>
          รอบการประเมิน:
          {{ evaluation.period }}
        </p>

      </div>


      <!-- ตัวชี้วัด -->
      <div
        v-for="item in evaluation.indicators"
        :key="item.id"
        class="bg-white p-6 rounded-2xl shadow mb-4"
      >

        <h2 class="text-lg font-bold">
          {{ item.name }}
        </h2>

        <p class="text-gray-600 mt-2">
          {{ item.description }}
        </p>

        <!-- คะแนน -->
        <div class="mt-4">

          <p class="font-semibold mb-2">
            คะแนน
          </p>

          <div class="flex gap-3">

            <label
              v-for="score in [1, 2, 3, 4]"
              :key="score"
              class="cursor-pointer"
            >

              <input
                type="radio"
                :name="'score-' + item.id"
                :value="score"
                v-model="item.score"
              />

              <span class="ml-1">
                {{ score }}
              </span>

            </label>

          </div>

        </div>

      </div>


      <!-- ปุ่ม -->
      <div class="flex gap-3">

        <button
          @click="saveDraft"
          class="bg-gray-500 text-white px-6 py-3 rounded-lg"
        >
          บันทึกแบบร่าง
        </button>

        <button
          @click="submitEvaluation"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          ส่งแบบประเมิน
        </button>

      </div>

    </div>

  </div>

</template>


<script setup>

import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";


const route = useRoute();
const router = useRouter();

const API = "http://localhost:3000/api";

const loading = ref(true);
const error = ref("");

const evaluation = ref({
  name: "",
  department: "",
  period: "",
  indicators: []
});


// ============================
// โหลดข้อมูล
// ============================

async function loadEvaluation() {

  try {

    const id = route.params.id;

    const response = await axios.get(
      `${API}/evaluation/${id}`
    );

    evaluation.value =
      response.data.data || response.data;

  } catch (err) {

    console.error(err);

    error.value =
      "ไม่สามารถโหลดแบบประเมินได้";

  } finally {

    loading.value = false;

  }

}


// ============================
// บันทึกแบบร่าง
// ============================

async function saveDraft() {

  try {

    await axios.post(
      `${API}/self-assessment/draft`,
      {
        assignment_id: route.params.id,
        indicators: evaluation.value.indicators
      }
    );

    alert("บันทึกแบบร่างเรียบร้อยแล้ว");

  } catch (err) {

    console.error(err);

    alert("บันทึกแบบร่างไม่สำเร็จ");

  }

}


// ============================
// ส่งแบบประเมิน
// ============================

async function submitEvaluation() {

  try {

    await axios.post(
      `${API}/self-assessment/submit`,
      {
        assignment_id: route.params.id,
        indicators: evaluation.value.indicators
      }
    );

    alert("ส่งแบบประเมินเรียบร้อยแล้ว");

    router.push("/evaluatee");

  } catch (err) {

    console.error(err);

    alert("ส่งแบบประเมินไม่สำเร็จ");

  }

}


onMounted(loadEvaluation);

</script>

