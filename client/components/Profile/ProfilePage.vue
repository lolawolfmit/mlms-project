<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <h2 v-if="$route.params.username != $store.state.username">{{ $route.params.username }}'s page</h2>
        <h2 v-else>Welcome {{ $store.state.username }}</h2>
        <h3>x publicity</h3>
        <h3>y stories, z contributions</h3>
        <h3 v-if="$route.params.username != $store.state.username">{{ $store.state.profileFollowerCount }} followers, {{ $store.state.profileFollowingCount }} following</h3>
        <h3 v-else>{{ $store.state.followers.length }} followers, {{ $store.state.following.length }} following</h3>
        <div v-if="$route.params.username != $store.state.username">
          <button v-if="$store.state.following.includes($route.params.username)"
          @click="followAuthor">Unfollow</button>
          <button v-else
          @click="followAuthor">Follow</button>
        </div>

        <section class="alerts">
          <article
            v-for="(status, alert, index) in alerts"
            :key="index"
            :class="status"
          >
            <p>{{ alert }}</p>
          </article>
        </section>
      </header>
      <button @click="newStoryPage">Create New Story</button>
    </section>
    <section>
      <header>
        <div class="left">
          <h2>
            Your stories
          </h2>
        </div>
      </header>
      <section
        v-if="$store.state.storySegments.length"
      >
        <SegmentPreviewComponent
          v-for="segment in $store.state.storySegments"
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
  </main>
</template>

<script>
import SegmentPreviewComponent from '@/components/Profile/SegmentPreviewComponent.vue';

export default {
  name: 'ProfilePage',
  components: {SegmentPreviewComponent},
    mounted () {
      this.$store.commit('refreshFollowing');
      this.$store.commit('loadProfile', this.$route.params.username);
    },
    data() {
      return {
        alerts: {} // Displays success/error messages encountered during freet modification
      };
    },
  methods: {
    async followAuthor() {
      // set global variable
      // push storyreader page into router
      let message = this.$store.state.following.includes(this.$store.state.profileUser) ? 'No longer following!' : 'Following!';

      const params = {
        method: 'PATCH',
        message: message,
        body: JSON.stringify({}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };

      try {

        const options = {
          method: params.method, headers: {'Content-Type': 'application/json'}
        };
        console.log(this.$store.state.profileUser);
        const r = await fetch(`/api/users/follow/${this.$store.state.profileUser}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFollowing');

        console.log("Done!");
        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    newStoryPage() {
      /**
       * Enables edit mode on this freet.
       */
      this.$router.push({name: 'NewStory'});
    }
  }
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
