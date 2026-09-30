<script setup>
import MyBar from '../src/views/mybar.vue'
</script>
<template>
  <div id="app">
    <MyBar />
    <router-view />
  </div>
</template>
<script>
export default {
 name :"App",
 components : {
  MyBar },};
</script>
