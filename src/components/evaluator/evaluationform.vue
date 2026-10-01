<template>
  <div
    class="min-h-screen bg-gray-100 p-5"
    style="font-family: 'Prompt', sans-serif;"
  >

    <h2 class="text-2xl font-bold mb-6 text-center">
      แบบประเมินผลบุคลากร
    </h2>

    <div
      v-if="loading"
      class="text-center py-10"
    >
      กำลังโหลดข้อมูล...
    </div>

    <div
      v-else-if="assignment"
      class="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto"
    >

      <!-- 1. ข้อมูลผู้รับการประเมิน -->
      <div class="mb-6">
        <h3 class="text-lg font-bold mb-3">
          ข้อมูลผู้รับการประเมิน
        </h3>

        <p class="font-semibold">
          {{ assignment.teacher }}
        </p>

        <p class="text-gray-600">
          {{ assignment.department }}
        </p>

        <span
          class="text-sm bg-blue-200 text-blue-700 px-2 py-1 rounded-md inline-block mt-1"
        >
          {{ assignment.period }}
        </span>
      </div>

      <hr class="my-5" />

      <!-- 2-3. ตัวชี้วัดและการให้คะแนน -->
      <form @submit.prevent="submitForm">

        <div
          v-for="(indicator, index) in assignment.indicators"
          :key="indicator.id"
          class="border rounded-xl p-5 mb-5"
        >

          <h3 class="font-semibold text-lg">
            {{ index + 1 }}. {{ indicator.name }}
          </h3>

          <p class="text-gray-600 mt-1">
            {{ indicator.description }}
          </p>

          <p class="text-sm text-blue-600 mt-2">
            น้ำหนักคะแนน: {{ indicator.weight }}
          </p>

          <!-- หลักฐาน -->
          <div
            v-if="indicator.evidence"
            class="mt-3 bg-gray-50 p-3 rounded-lg"
          >
            <span class="font-medium">
              หลักฐาน:
            </span>

            <a
              :href="indicator.evidence"
              target="_blank"
              class="text-blue-600 ml-2"
            >
              ดูหลักฐาน
            </a>
          </div>

          <!-- คะแนน -->
          <label class="block font-medium mt-4">
            คะแนน
          </label>

          <select
            v-model="form.scores[indicator.id]"
            class="border w-full p-2 rounded-lg mt-1"
            required
          >
            <option value="">
              เลือกคะแนน
            </option>

            <option
              v-for="n in 4"
              :key="n"
              :value="n"
            >
              {{ n }}
            </option>
          </select>

        </div>

        <!-- 4. ความคิดเห็น -->
        <label class="block font-medium mt-6">
          ความคิดเห็นสรุปโดยภาพรวม
        </label>

        <textarea
          v-model="form.comment"
          class="border w-full p-3 rounded-lg mt-2"
          rows="4"
          placeholder="กรอกความคิดเห็น..."
          required
        ></textarea>


        <!-- 5. ลายเซ็น -->
        <label class="block font-medium mt-5">
          ลายเซ็นกรรมการผู้ประเมิน
        </label>

        <input
          type="file"
          accept="image/png,image/jpeg"
          @change="handleSignature"
          class="border p-2 rounded-lg w-full mt-2"
          required
        />

        <img
          v-if="signaturePreview"
          :src="signaturePreview"
          class="mt-3 h-20 border rounded"
        />


        <!-- สรุปคะแนน -->
        <div class="mt-6 bg-gray-50 p-4 rounded-xl">

          <h3 class="font-bold mb-3">
            สรุปผลการประเมิน
          </h3>

          <table class="w-full border-collapse">

            <thead>
              <tr class="bg-gray-200">
                <th class="border p-2 text-left">
                  ตัวชี้วัด
                </th>

                <th class="border p-2">
                  น้ำหนัก
                </th>

                <th class="border p-2">
                  คะแนน
                </th>
              </tr>
            </thead>

            <tbody>

              <tr
                v-for="indicator in assignment.indicators"
                :key="indicator.id"
              >
                <td class="border p-2">
                  {{ indicator.name }}
                </td>

                <td class="border p-2 text-center">
                  {{ indicator.weight }}
                </td>

                <td class="border p-2 text-center">
                  {{ form.scores[indicator.id] || "-" }}
                </td>
              </tr>

            </tbody>

          </table>

          <p class="text-right font-bold mt-4">
            คะแนนรวม: {{ totalScore }}
          </p>

        </div>


        <!-- 6. ส่งผล -->
        <button
          type="submit"
          :disabled="saving"
          class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow"
        >
          {{ saving ? "กำลังส่ง..." : "ยืนยันและส่งผลการประเมิน" }}
        </button>

      </form>

    </div>

    <div
      v-else
      class="text-center text-red-500"
    >
      ไม่พบข้อมูลการประเมิน
    </div>

  </div>

  <footer
    class="bg-white text-center py-4 text-gray-500 text-sm mt-8"
    style="font-family: 'Prompt', sans-serif;"
  >
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

      loading: false,

      saving: false,

      signature: null,

      signaturePreview: "",

      form: {
        scores: {},
        comment: ""
      }

    }
  },


  computed: {

    totalScore() {

      if (!this.assignment) return 0

      return this.assignment.indicators.reduce(
        (total, indicator) => {

          return total +
            Number(this.form.scores[indicator.id] || 0)

        },
        0
      )

    }

  },


  async created() {

    await this.loadAssignment()

  },


  methods: {

    // =========================
    // โหลดข้อมูลจาก Backend
    // =========================

    async loadAssignment() {

      this.loading = true

      try {

        const res = await fetch(
          `http://localhost:3000/api/evaluator/assignments/${this.id}`
        )

        if (!res.ok) {
          throw new Error("ไม่พบข้อมูล")
        }

        const result = await res.json()

        this.assignment =
          result.data || result

      } catch (err) {

        console.error(err)

      } finally {

        this.loading = false

      }

    },


    // =========================
    // ลายเซ็น
    // =========================

    handleSignature(event) {

      const file =
        event.target.files[0]

      if (!file) return

      this.signature = file

      this.signaturePreview =
        URL.createObjectURL(file)

    },


    // =========================
    // ส่งผลการประเมิน
    // =========================

    async submitForm() {

      if (!this.assignment) return

      this.saving = true

      try {

        const formData =
          new FormData()

        const evaluation = {

          assignment_id:
            Number(this.id),

          scores:
            this.assignment.indicators.map(
              indicator => ({

                indicator_id:
                  indicator.id,

                score:
                  Number(
                    this.form.scores[indicator.id]
                  )

              })
            ),

          comment:
            this.form.comment,

          totalScore:
            this.totalScore

        }


        formData.append(
          "data",
          JSON.stringify(evaluation)
        )


        if (this.signature) {

          formData.append(
            "signature",
            this.signature
          )

        }


        const res = await fetch(
          `http://localhost:3000/api/evaluator/assignments/${this.id}/submit`,
          {
            method: "POST",
            body: formData
          }
        )


        if (!res.ok) {
          throw new Error("ส่งข้อมูลไม่สำเร็จ")
        }


        alert(
          "ส่งผลการประเมินเรียบร้อยแล้ว"
        )


        this.$router.push("/evaluator")


      } catch (err) {

        console.error(err)

        alert(
          "ไม่สามารถส่งผลการประเมินได้"
        )

      } finally {

        this.saving = false

      }

    }

  }

}
</script>