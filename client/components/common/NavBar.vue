<!-- A basic navigation bar component -->
<!-- Example of a component which is included on all pages (via App.vue) -->
<!-- This navbar takes advantage of both flex and grid layouts for positioning elements; feel free to redesign as you see fit! -->

<template>
  <nav>
    <div class="left">
     
      <router-link class = "icon-link"
        to="/"
      >
      <img src="../../public/logo.svg">
      <h1 class="title">
        Story Tree
      </h1>
      </router-link>
    </div>
    <div class="right">
      <router-link class="navbar-link" to="/">
        Home
      </router-link>
      <router-link class="navbar-link"
        v-if="$store.state.username"
        to="/account"
      >
        Account
      </router-link>
      <router-link class="navbar-link"
        v-if="$store.state.username"
        :to="'/profile/'+$store.state.username"
      >
        Profile
      </router-link>
      <router-link class="navbar-link invert-navbar-link"
        v-else
        to="/login"
      >
        Login
      </router-link>
    </div>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in $store.state.alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </nav>
</template>

<style scoped>
nav {
    padding: 1vw 2vw;
    background-color: #50C878;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
}

.title {
    font-size: 32px;
    margin: 0 5px;
    color: #3e363f;
}

img {
    height: 32px;
}

.left {
	display: flex;
	align-items: center;
}

.right {
    font-size: 20px;
    display: grid;
    gap: 16px;
    grid-auto-flow: column;
    align-items: center;
}

.right a {
    margin-left: 5px;
}

.alerts {
    width: 25%;
}
.navbar-link {
  background-color: #ddd;
  padding: 8px 16px;
  text-decoration: none;
  color: #3e363f;
  border: 2px solid #3e363f;
  border-radius: 12px;
}
.invert-navbar-link {
  color: #ddd;
  background-color: #3e363f;
}
.navbar-link:hover {
  background-color: #0047AB;
  color: #ddd;
}
.invert-navbar-link:hover {
  background-color: #0047AB;
  color: #ddd;
}
.icon-link {
  display:flex;
  text-decoration: none;
}


</style>
