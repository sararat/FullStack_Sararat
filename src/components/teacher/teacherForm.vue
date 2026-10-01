<template>
  <div class="bg-white p-10 rounded-2xl shadow">

    <h1 class="text-2xl font-bold mb-2">
      แบบประเมินผลบุคลากร
    </h1>

    <p class="text-gray-700 mb-6">
      ผู้รับการประเมิน:
      <b>{{ teacher.name }}</b>
      <span class="mx-2">•</span>
      {{ teacher.department }}
    </p>

    <table class="w-full border-collapse">

      <thead>
        <tr class="bg-gray-200">
          <th class="p-3 text-left">ตัวชี้วัด</th>
          <th class="p-3 text-center w-32">คะแนน</th>
          <th class="p-3">รายละเอียด</th>
          <th class="p-3 w-64">หลักฐาน</th>
        </tr>
      </thead>

      <tbody>

        <tr
          v-for="item in localCriteria"
          :key="item.id"
          class="border-b"
        >

          <!-- ตัวชี้วัด -->
          <td class="p-3">

            <div class="font-semibold">
              {{ item.code }}
            </div>

            <div>
              {{ item.name }}
            </div>

            <div class="text-sm text-gray-500">
              {{ item.description }}
            </div>

          </td>

          <!-- คะแนน -->
          <td class="p-3 text-center">

            <input
              v-model.number="item.score"
              type="number"
              min="0"
              :max="item.max_score || 5"
              step="0.01"
              class="w-20 border rounded-lg p-2 text-center"
            />

            <div class="text-xs text-gray-400">
              / {{ item.max_score || 5 }}
            </div>

          </td>

          <!-- รายละเอียด -->
          <td class="p-3">

            <textarea
              v-model="item.note"
              rows="3"
              class="w-full border rounded-lg p-2"
              placeholder="รายละเอียดการดำเนินงาน"
            />

          </td>

          <!-- หลักฐาน -->
          <td class="p-3">

            <input
              type="file"
              multiple
              @change="selectFiles($event, item)"
              class="w-full text-sm"
            />

            <div
              v-for="(file, index) in item.files"
              :key="index"
              class="text-sm text-gray-600 mt-2"
            >
              📎 {{ file.name }}
            </div>

          </td>

        </tr>

      </tbody>

    </table>


    <!-- ปุ่ม -->
    <div class="flex justify-end gap-3 mt-8">

      <button
        @click="saveDraft"
        :disabled="saving"
        class="px-6 py-3 bg-gray-400 text-white rounded-xl"
      >
        💾
        {{ saving ? "กำลังบันทึก..." : "บันทึกชั่วคราว" }}
      </button>


      <button
        @click="submit"
        class="px-6 py-3 bg-blue-600 text-white rounded-xl"
      >
        ✓ ยืนยันผลประเมิน
      </button>

    </div>

  </div>
</template>


<script>

export default {

  name: "TeacherForm",

  props: {

    teacher: {
      type: Object,
      required: true
    },

    criteria: {
      type: Array,
      required: true
    }

  },

  data() {

    return {

      localCriteria: [],
      saving: false

    };

  },

  watch: {

    criteria: {

      immediate: true,

      deep: true,

      handler(value) {

        this.localCriteria =
          value.map(item => ({

            ...item,

            score:
              item.score ?? null,

            note:
              item.note ?? "",

            files:
              item.files ?? []

          }));

      }

    }

  },

  methods: {

    // ==============================
    // เลือกไฟล์
    // ==============================

    selectFiles(event, item) {

      item.files =
        Array.from(event.target.files);

    },


    // ==============================
    // สร้าง FormData
    // ==============================

    createFormData() {

      const formData =
        new FormData();

      formData.append(
        "employee_id",
        this.teacher.id
      );

      formData.append(
        "period_id",
        this.teacher.period_id || 1
      );


      const assessments =
        this.localCriteria.map(item => ({

          indicator_id:
            item.id,

          score:
            item.score,

          note:
            item.note

        }));


      formData.append(
        "assessments",
        JSON.stringify(assessments)
      );


      // เพิ่มไฟล์
      this.localCriteria.forEach(item => {

        item.files.forEach(file => {

          formData.append(
            `evidence_${item.id}`,
            file
          );

        });

      });


      return formData;

    },


    // ==============================
    // บันทึกชั่วคราว
    // ==============================

    async saveDraft() {

      this.saving = true;

      try {

        const formData =
          this.createFormData();

        await this.$emit(
          "save-draft",
          formData
        );

      } finally {

        this.saving = false;

      }

    },


    // ==============================
    // ยืนยันผลประเมิน
    // ==============================

    submit() {

      const data = {

        employee_id:
          this.teacher.id,

        period_id:
          this.teacher.period_id || 1

      };

      this.$emit(
        "submit",
        data
      );

    }

  }

};

</script>