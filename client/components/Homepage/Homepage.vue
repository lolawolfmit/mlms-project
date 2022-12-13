<!-- Default page that displays segments from the user's followers or any user they search -->

<template>
  <main>
    <section v-if="$store.state.username">
        <header>
          <h2>Welcome, {{ $store.state.username }}</h2>
        </header>
        <span>
        <input 
          type="text"
          v-model="username"
          placeholder="👤 Search for a user"
        />
        <button 
        class="search-button"
          @click="searchUser"
        >
          Search
        </button>
        </span
      <header>
        <div class="left">
          <h3 v-if="$store.state.following.length < 1 && $store.state.homepageSegments.length <= 10">
            You don't follow any authors yet. Explore!
          </h3>
          <h3 v-else>
            Your feed:
          </h3>
        </div>
      <div class="right">
          <GetSegmentsForm
            ref="getSegmentsForm"
            value="author"
            placeholder="🔍 Filter by keywords or author (optional)"
            button="Search"
          />
        </div>

      </header>
      <section
        v-if="$store.state.homepageSegments.length"
      >
        <SegmentPreviewComponent
          v-for="segment in $store.state.homepageSegments.slice(0, $store.state.homepageSegments.length - 10)"
          :key="segment.id"
          :segment="segment"
        />
        <h2>
          Here are some of our recommendations for you to check out:
        </h2>
        <SegmentPreviewComponent
          v-for="segment in $store.state.homepageSegments.slice($store.state.homepageSegments.length - 10)"
          :key="segment.id"
          :segment="segment"
        />
      </section>
      <article
        v-else
      >
        <h3>No stories found.</h3>
      </article>
    </section>
    <section v-else>
      <LoggedOutPitchComponent/>
    </section>
  </main>
</template>

<script>
import SegmentPreviewComponent from '@/components/common/SegmentPreviewComponent.vue';
import GetSegmentsForm from '@/components/Homepage/GetSegmentsForm.vue';
import LoggedOutPitchComponent from '@/components/Homepage/LoggedOutPitchComponent.vue';

export default {
  name: 'Homepage',
  components: {SegmentPreviewComponent, GetSegmentsForm, LoggedOutPitchComponent},
  mounted() {
    this.$refs.getSegmentsForm.submit();
  },
  methods: {
    async searchUser() {
      fetch(`/api/users/followers/${this.username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((response) => {
        if (response.status === 200) {
          this.$router.push(`/profile/` + this.username);
        }
        else if (response.status === 404) {
          this.$router.push('/profilenotfound');
        }
      }).catch((error) => {
        console.log(error);
      }
      );
    },
  },
  data() {
    return {
      username: '',
    };
  },
};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

header, header > * {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    margin-right: 10px;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}
</style>
