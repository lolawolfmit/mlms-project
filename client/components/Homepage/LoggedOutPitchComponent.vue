<template>
    <article>
      <h2>Welcome to Story Tree</h2>
      <h1>A platform that makes it easy for our community of authors, poets, and lyricists to collaborate on compositions, and to help remix, extend, and finish each other's work.</h1>
      <br/>
    <h2>
      <router-link class="login-link"
        to="/login"
      >
    Sign in to continue.
      </router-link>
    </h2>
    </article>

</template>
<script>
export default {
  name: 'LoggedOutPitchComponent',
  props: {
  },
  data() {
    return {
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {
  }
};
</script>


<style scoped>

.login-link {
  text-decoration: none;
  color: #84ABA9;
}
</style>