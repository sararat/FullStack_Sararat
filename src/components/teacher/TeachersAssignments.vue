<template>
   <div class="h-dvh w-screen bg-gray-100 " style="font-family: 'Prompt', sans-serif;">
    <TeacherForm
      :teacher="teacher"
      :criteria="criteria"
      @save-draft="saveDraft"
      @submit="submitEvaluation"
    />
  </div>
   
  <footer class="bg-white text-center py-4 text-gray-500 text-sm mt-8" style="font-family: 'Prompt', sans-serif;">
    © 2025 วิทยาลัยเทคนิคขอนแก่น — ระบบประเมินบุคลากร
  </footer>
</template>

<script>
import TeacherForm from "../../views/teacherform.vue";
import jsonData from "../../resource/criteria.json";
export default {
  name: "TeachersAssignments",

  components: { TeacherForm },

  data() {
    return {
      teacher: jsonData.teacher,      
      criteria: jsonData.criteria     
    }
  },

  methods: {
    saveDraft(data) {
      console.log("บันทึก:", data)
    },

    submitEvaluation(data) {
      console.log("ส่งผลประเมิน:", data)
    }
  }
}
</script>
