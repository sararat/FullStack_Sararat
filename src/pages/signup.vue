<template>
  <div class="min-h-full flex items-center justify-center bg-blue-100 py-25 pb-8 " style="font-family: 'Prompt', sans-serif;">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Sign Up</h1>
        <p class="text-blue-500 text-sm">Please fill in the form below to create an account.</p>
      </div>

      <form @submit.prevent="signup" class="space-y-4">

        <div>
          <label class="text-gray-700 font-medium">First Name</label>
          <input v-model="form.fname" type="text"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="First Name" required />
        </div>

        <div>
          <label class="text-gray-700 font-medium">Last Name</label>
          <input v-model="form.lname" type="text"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Last Name" required />
        </div>

        <div>
          <label class="text-gray-700 font-medium">Username</label>
          <input v-model="form.username" type="text"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Username" required />
        </div>

        <div>
          <label class="text-gray-700 font-medium">Password</label>
          <input v-model="form.password" type="password"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Password" required />
        </div>

        <div>
          <label class="text-gray-700 font-medium">Role</label>
          <select v-model="form.role"
            class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label class="text-gray-700 font-medium">Avatar</label>
          <input type="file" @change="handleFile" class="w-full mt-1 text-gray-600" />
        </div>

        <button type="submit"
          class="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition">
          Sign Up
        </button>

        <p class="text-sm text-gray-600 text-center">
          ถ้าคุณมีบัญชีอยู่แล้ว?
          <router-link to="/login" class="text-blue-600 hover:underline">เข้าสู่ระบบ</router-link>
        </p>
      </form>
    </div>

  </div >
  <!-- Footer -->
 
  <footer class="bg-white text-center py-4 text-gray-500 text-sm mt-8" style="font-family: 'Prompt', sans-serif;">
    © 2025 วิทยาลัยเทคนิคขอนแก่น — ระบบประเมินบุคลากร
  </footer>
</template>

<script>
export default {
  name: "SignUp",
  data() {
    return {
      form: {
        fname: "",
        lname: "",
        username: "",
        password: "",
        avatar: null,
        role: "user",
      },
    };
  },
  methods: {
    handleFile(event) {
      this.form.avatar = event.target.files[0];
    },
    async signup() {
      const formData = new FormData();
      formData.append("fname", this.form.fname);
      formData.append("lname", this.form.lname);
      formData.append("username", this.form.username);
      formData.append('password', this.form.password);
      if (this.form.avatar) {
        formData.append('avatar', this.form.avatar);
      }
      formData.append('role', this.form.role);


      try {
        const res = await fetch('http://localhost:3000/signup', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          this.form = {
            fname: '',
            lname: '',
            username: '',
            password: '',
            avatar: null,
            role: 'user',
          };
          alert('Signup successful!');
        }
        else {
          const error = await res.json();
          console.log(error);
          alert('Signup failed: ' + (error.message || 'Unknown error'));
        }
      }
      catch (err) {
        console.error('Error during signup:', err);
        alert('Error connecting to server');
      }
    },
  },
};
</script>