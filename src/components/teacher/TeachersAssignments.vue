<template>
  <div
    class="min-h-screen w-screen bg-gray-100"
    style="font-family: 'Prompt', sans-serif;"
  >

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center min-h-screen"
    >
      <div class="text-gray-500">
        กำลังโหลดข้อมูล...
      </div>
    </div>


    <!-- Error -->
    <div
      v-else-if="error"
      class="flex items-center justify-center min-h-screen"
    >
      <div class="text-red-500">
        {{ error }}
      </div>
    </div>


    <!-- Form -->
    <TeacherForm
      v-else
      :teacher="teacher"
      :criteria="criteria"
      @save-draft="saveDraft"
      @submit="submitEvaluation"
    />


    <!-- Footer -->
    <footer
      class="bg-white text-center py-4 text-gray-500 text-sm mt-8"
    >
      © 2026 วิทยาลัยเทคนิคขอนแก่น — ระบบประเมินบุคลากร
    </footer>

  </div>
</template>


<script setup>

import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

import TeacherForm from "../teacher/teacherForm.vue";


// ==================================================
// Router
// ==================================================

const route = useRoute();
const router = useRouter();


// ==================================================
// Data
// ==================================================

const teacher = ref(null);

const criteria = ref([]);

const loading = ref(true);

const error = ref("");


// ==================================================
// API
// ==================================================

const API_URL = "http://localhost:3000/api";


// ==================================================
// ดึงข้อมูลผู้รับการประเมิน
// ==================================================

const loadEvaluation = async () => {

  loading.value = true;
  error.value = "";

  try {

    /*
      route.params.id
      คือ employee / assignment id
    */

    const id = route.params.id;

    const response = await axios.get(
      `${API_URL}/evaluation/${id}`
    );


    teacher.value = response.data.teacher;

    criteria.value = response.data.criteria;


  } catch (err) {

    console.error(err);

    error.value =
      "ไม่สามารถโหลดข้อมูลการประเมินได้";

  } finally {

    loading.value = false;

  }

};




const saveDraft = async (data) => {

  try {

    await axios.post(
      `${API_URL}/self-assessment/draft`,
      data
    );

    alert("บันทึกแบบร่างเรียบร้อยแล้ว");

  } catch (err) {

    console.error(err);

    alert("ไม่สามารถบันทึกข้อมูลได้");

  }

};




const submitEvaluation = async (data) => {

  try {

    await axios.post(
      `${API_URL}/self-assessment/submit`,
      data
    );

    alert("ส่งผลการประเมินเรียบร้อยแล้ว");

    router.push("/evaluatee");

  } catch (err) {

    console.error(err);

    alert("ไม่สามารถส่งผลการประเมินได้");

  }

};



onMounted(() => {

  loadEvaluation();

});

</script>