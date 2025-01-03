<template>
  <div>
    <Header />
    <router-view></router-view>
    <!-- <testSocketVue /> -->
    <Footer />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import testSocketVue from "./components/testSocket.vue";
import Footer from "@/components/Footer.vue";
export default {
  components: {
    Header,
    testSocketVue,
    Footer
  },
};
</script>

<style>
</style>