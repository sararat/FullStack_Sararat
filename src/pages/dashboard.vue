<template>
  <div class="min-h-screen bg-gray-100 py-20" style="font-family: 'Prompt', sans-serif;">
    <div class="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">User Management</h1>

      <div class="overflow-x-auto rounded-lg shadow border border-gray-200">
        <table class="w-full text-left text-gray-700">
          <thead class="bg-blue-100 text-gray-800">
            <tr>
              <th class="px-4 py-3">No</th>
              <th class="px-4 py-3">Full Name</th>
              <th class="px-4 py-3">Username</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(user, index) in users" :key="user.id" class="border-b hover:bg-gray-50">
              <td class="px-4 py-3">{{ index + 1 }}</td>

              <td class="px-4 py-3">
                <div v-if="editId !== user.id">{{ user.fname }} {{ user.lname }}</div>
                <div v-else class="space-x-2">
                  <input v-model="editForm.fname" class="border rounded p-1" placeholder="First Name" />
                  <input v-model="editForm.lname" class="border rounded p-1" placeholder="Last Name" />
                </div>
              </td>

              <td class="px-4 py-3">
                <div v-if="editId !== user.id">{{ user.username }}</div>
                <div v-else>
                  <input v-model="editForm.username" class="border rounded p-1" placeholder="Username" />
                </div>
              </td>

              <td class="flex flex-col items-center gap-2 px-4 py-2">
                <button v-if="editId !== user.id" @click="startEdit(user)" class="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">Edit</button>
                <button v-else @click="saveEdit(user.id)" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
                <button v-if="editId === user.id" @click="cancelEdit" class="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
                <button @click="deleteUser(user.id)" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="4" class="text-center py-4 text-gray-500">No users yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const users = ref([]);
const editId = ref(null);
const editForm = ref({ fname: '', lname: '', username: '' });


const fetchUsers = async () => {
  try {
    const res = await fetch('http://localhost:3000/users');
    users.value = await res.json();
  } catch (err) {
    console.error(err);
  }
};

const startEdit = (user) => {
  editId.value = user.id;
  editForm.value = { ...user };
};

const cancelEdit = () => {
  editId.value = null;
  editForm.value = { fname: '', lname: '', username: '' };
};

const saveEdit = async (id) => {
  try {
    await fetch(`http://localhost:3000/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value)
    });
    cancelEdit();
    fetchUsers();
  } catch (err) {
    console.error(err);
  }
};

const deleteUser = async (id) => {
  if (confirm('คุณต้องการลบ user นี้ใช่หรือไม่?')) {
    try {
      await fetch(`http://localhost:3000/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }
};

onMounted(fetchUsers);
</script>
