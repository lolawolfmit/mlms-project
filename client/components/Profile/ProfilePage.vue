<!-- A user's profile page that displays their stats as well as all story segments they have created -->

<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <h2 v-if="$route.params.username != $store.state.username">{{ $route.params.username }}'s page</h2>

        <h2 v-else>Welcome, {{ $store.state.username }}</h2>
        <div class = "follower-display">

          <h4 v-if="$route.params.username != $store.state.username">{{ $store.state.profileFollowerCount }} followers, {{ $store.state.profileFollowingCount }} following</h4>
      
          <h4 v-else>{{ $store.state.followers.length }} followers, {{ $store.state.following.length }} following</h4>

        <div v-if="$route.params.username != $store.state.username">
          <button v-if="$store.state.following.includes($route.params.username)" class="follow-button"
          @click="followAuthor">Unfollow</button>
          <button v-else class="follow-button"
          @click="followAuthor">Follow</button>
        </div>
        </div>
        
      </header>
      <div class="stat-display">
        <h3> {{ $store.state.profilePublicity }} publicity, {{ $store.state.profileStoryCount }}  stories, {{ $store.state.profileContributions }} contributions</h3>

      <button v-if="$route.params.username == $store.state.username" @click="newStoryPage" class="create-story-button">Create New Story</button>
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
    </section>
    <section>
      <header>
        <div class="left">
          <h2 v-if="$route.params.username != $store.state.username">
            {{ $route.params.username }}'s stories
          </h2>
          <h2 v-else>
            Your stories
          </h2>
        </div>
      </header>
      <section
        v-if="$store.state.storySegments.length"
      >
        <SegmentPreviewComponent
          v-for="segment in $store.state.storySegments.filter(story => story.author == $route.params.username)"
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
import SegmentPreviewComponent from '@/components/common/SegmentPreviewComponent.vue';

export default {
  name: 'ProfilePage',
  components: {SegmentPreviewComponent},
    mounted () {
      this.$store.commit('refreshFollowing');
      this.$store.commit('refreshFollowers');
      this.$store.dispatch('loadProfile', this.$route.params.username);

      this.$store.commit('refreshSegments', this.$route.params.username);
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
        const r = await fetch(`/api/users/follow/${this.$store.state.profileUser}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFollowing');
        this.$store.commit('loadProfile', this.$route.params.username);

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    newStoryPage() {
      /**
      * Triggers the Create New Story page where the user can make a new story.
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
.stat-display > h3 {
  padding: 0px;
}
.stat-display {
  display: flex;
    justify-content: space-between;
}
.follower-display {
  display: flex;
}
.follow-button {
    border: 2px solid #3e363f;
    padding: 8px 16px;
    border-radius: 8px;
    margin: 4px;
    font-size: 14px;
    font-family: Futura,Trebuchet MS,Arial,sans-serif;
    cursor: pointer;
}
.follow-button:hover {
    background-color: #3e363f;
    color: #ddd;
}
.create-story-button {
    margin: 4px;
    border: 2px solid #3e363f;
    font-size: 24px;
    border-radius: 8px;
    font-family: Futura,Trebuchet MS,Arial,sans-serif;
    width: 324px;
    max-width: 100%;
    cursor: pointer;
    color: #3e363f;
    background-color: #50C878;
}

.create-story-button:hover {
    color: #ddd;
    background-color: #3e363f;
}
</style>
