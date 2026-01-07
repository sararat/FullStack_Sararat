<template>
  <div class="bg-white p-20 rounded-2xl shadow">
    <!-- Header -->
    <h1 class="text-2xl font-bold text-gray-800 mb-2">
      แบบประเมินผลบุคลากร
    </h1>
    <p class="text-gray-800">
      ครูผู้สอน: {{ teacher.name }} • ภาควิชา: {{ teacher.department }}
    </p>

    <hr class="my-5" />

    <!-- Criteria Table -->
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-200">
          <th class="p-3 text-left">ตัวชี้วัด</th>
          <th class="p-3 text-center w-32">คะแนน</th>
          <th class="p-3 text-center w-24">ผ่าน</th>
          <th class="p-3">หมายเหตุ</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="item in criteria"
          :key="item.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="p-3">{{ item.title }}</td>

          <!-- Score -->
          <td class="p-3 text-center">
            <input
              v-model="item.score"
              type="number"
              min="0"
              max="5"
              class="w-20 border rounded-lg p-1 text-center"
            />
          </td>

          <!-- Pass -->
          <td class="p-3 text-center">
            <select v-model="item.pass" class="border rounded-lg p-1 px-2">
              <option :value="true">✓ ผ่าน</option>
              <option :value="false">✗ ไม่ผ่าน</option>
            </select>
          </td>

          <!-- Notes -->
          <td class="p-3">
            <input
              v-model="item.note"
              class="w-full border rounded-lg p-2"
              placeholder="เพิ่มหมายเหตุ..."
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Footer Buttons -->
    <div class="flex justify-end gap-4 mt-8">
      <button
        @click="emitSave"
        class="px-6 py-3 bg-gray-300 rounded-xl hover:bg-gray-400"
      >
        บันทึกชั่วคราว
      </button>

      <button
        @click="emitSubmit"
        class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        ยืนยันผลประเมิน
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

  methods: {
    emitSave() {
      this.$emit("save-draft", this.criteria)
    },
    emitSubmit() {
      this.$emit("submit", this.criteria)
    }
  }
}
</script>
