<template>
  <div class="min-h-screen p-5 py-30 bg-gray-100" style="font-family: 'Prompt', sans-serif;">

    <h2 class="text-2xl font-bold mb-6 text-center">
      แบบฟอร์มประเมินครู
    </h2>

    <div v-if="assignment" class="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto">

      <p class="text-lg font-semibold">{{ assignment.teacher }}</p>
      <p class="text-gray-600">{{ assignment.department }}</p>
      <p class="text-sm bg-blue-200 text-blue-700 px-2 py-1 rounded-md inline-block mt-1">
        {{ assignment.period }}
      </p>

      <hr class="my-4" />

      <form @submit.prevent="submitForm">
        <label class="block font-medium mt-4">1. ความรับผิดชอบ</label>
        <select v-model="form.responsibility" class="border w-full p-2 rounded-lg" required>
          <option value="">เลือกคะแนน</option>
          <option v-for="n in 5" :key="n">{{ n }}</option>
        </select>

        <label class="block font-medium mt-4">2. การสอน</label>
        <select v-model="form.teaching" class="border w-full p-2 rounded-lg" required>
          <option value="">เลือกคะแนน</option>
          <option v-for="n in 5" :key="n">{{ n }}</option>
        </select>

        <label class="block font-medium mt-4">ความคิดเห็นเพิ่มเติม</label>
        <textarea v-model="form.comment" class="border w-full p-2 rounded-lg" rows="3"></textarea>

        <button class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow">
          ส่งแบบประเมิน
        </button>

      </form>
    </div>

    
  </div>
   <footer class="bg-white text-center py-4 text-gray-500 text-sm mt-8" style="font-family: 'Prompt', sans-serif;">
    © 2025 วิทยาลัยเทคนิคขอนแก่น — ระบบประเมินบุคลากร
  </footer>
</template>

<script>
export default {
  name: "EvaluationForm",
  props: ["id"],

  data() {
    return {
      assignment: null,
      form: {
        responsibility: "",
        teaching: "",
        comment: ""
      }
    }
  },

  async created() {
    try {
      const res = await fetch(`https://dummyjson.com/users/${this.id}`)
      if (!res.ok) throw new Error("ไม่พบข้อมูล")

      const user = await res.json()

      this.assignment = {
        id: user.id,
        teacher: `${user.firstName} ${user.lastName}`,
        department: user.company?.department || "ไม่ระบุ",
        period: "รอบที่ 1/2568",
        email: user.email
      }

    } catch (err) {
      console.error(err)
    }
  },

  methods: {
    submitForm() {
      const evaluation = {
        id: Date.now(),
        userId: this.assignment.id,
        teacher: this.assignment.teacher,
        department: this.assignment.department,
        period: this.assignment.period,
        responsibility: Number(this.form.responsibility),
        teaching: Number(this.form.teaching),
        comment: this.form.comment,
        totalScore:
          Number(this.form.responsibility) +
          Number(this.form.teaching),
        date: new Date().toLocaleDateString("th-TH")
      }

      // localStorage
      const list = JSON.parse(localStorage.getItem("evaluations")) || []
      list.push(evaluation)
      localStorage.setItem("evaluations", JSON.stringify(list))

      alert("ส่งแบบประเมินเรียบร้อย!")
      this.$router.push("/reports")
    }
  }
}
</script>
