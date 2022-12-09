<!-- Reusable component representing a single expanded view of a segment and its actions (including fork) -->

<template>
  <article
    class="segment"
  >
    <header>
      <span class="author">
      <div class = "header-flex">
      <h2 >
        {{ this.$store.state.currentlyReading.segmentTitle }}
        </h2>
        <h3>Part {{ this.$store.state.currentlyReading.storyPart }} of {{ this.$store.state.currentlyReading.storyTitle }}</h3>
        </div>
        <div class = "header-flex">
        <h1>by <router-link class = "author-link" :to="'/profile/'+this.$store.state.currentlyReading.author">{{ this.$store.state.currentlyReading.author }} </router-link>

         <button v-if="this.$store.state.following.includes(this.$store.state.currentlyReading.author)"
        @click="followAuthor" class = "follow-button">Unfollow</button>
        <button v-else
        @click="followAuthor" class = "follow-button">Follow</button></h3>
        </h1>
        <span>

        {{ this.$store.state.currentlyReading.likes.length }} likes
        <button class = "button-like" v-if="this.$store.state.storySegments.find(s => s._id === this.$store.state.currentlyReading._id).likes.includes(this.$store.state.userID)"
        @click="likeStory">Unlike</button>
        <button class = "button-like" v-else
        @click="likeStory">Like</button>
        </span>
        </div>
        <div class="header-flex">

          <button class = "fork-button"
          @click="forkStory">Fork this segment!</button>
        </div>
        </span>
    </header>
    <p
      class="content"
    >
      {{ this.$store.state.currentlyReading.content }}
    </p>
    <p class="info">
      Posted at {{ this.$store.state.currentlyReading.datePublished }}
    </p>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </article>
</template>

<script>
export default {
  name: 'SegmentViewComponent',
  data() {
    return {
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {

    async followAuthor() {
      // set global variable
      // push storyreader page into router

      const params = {
        method: 'PATCH',
        message: 'Following!',
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
        const r = await fetch(`/api/users/follow/${this.$store.state.currentlyReading.author}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFollowing');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    forkStory() {
        /**
        * Triggers forking a story (will open up new segment creation page).
        */
        this.$store.commit('updateForkingStory', this.$store.state.currentlyReading);
        this.$router.push('/newforkedstory');
    },
    async likeStory() {
      // set global variable
      // push storyreader page into router

      let message = this.$store.state.currentlyReading.likes.includes(this.$store.state.userID) ? 'Unliked!' : 'Liked!';

      const params = {
        method: 'PATCH',
        message: message,
        body: JSON.stringify({segmentId: this.$store.state.currentlyReading._id}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };

      try {

        const options = {
          method: params.method, headers: {'Content-Type': 'application/json'}, body: params.body
        };
        const r = await fetch(`/api/segment/like`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshSegments');
        this.$store.commit('refreshHomepageSegments');
        const targetSegment = this.$store.state.storySegments.find(s => s._id === this.$store.state.currentlyReading._id);
        this.$store.commit('updateCurrentlyReading', targetSegment);

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    startEditing() {
      /**
       * Enables edit mode on this freet.
       */
      this.editing = true; // Keeps track of if a freet is being edited
      this.draft = this.freet.content; // The content of our current "draft" while being edited
    },
    stopEditing() {
      /**
       * Disables edit mode on this freet.
       */
      this.editing = false;
      this.draft = this.freet.content;
    },
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    submitEdit() {
      /**
       * Updates freet to have the submitted draft content.
       */
      if (this.freet.content === this.draft) {
        const error = 'Error: Edited freet content should be different than current freet content.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }

      const params = {
        method: 'PATCH',
        message: 'Successfully edited freet!',
        body: JSON.stringify({content: this.draft}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.request(params);
    },
    async request(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }

      try {
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFreets');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
.segment {
    padding: 20px;
    position: relative;
    border: none;
    background-color: #eee;
    border-radius: 15px;
    margin-bottom: 12px;
    margin-top: 12px;
}
.follow-button {
    border: 2px solid #3e363f;
    padding: 8px 16px;
    border-radius: 8px;
    margin: 4px;
    font-size: 14px;
    font-family: Futura,Trebuchet MS,Arial,sans-serif;
    cursor: pointer;
    background-color: #ddd;
}
.follow-button:hover {
    background-color: #3e363f;
    color: #ddd;
}
.author-link {
  text-decoration: none;
  color: #0047AB;
}
.author {
}
h1 {
  margin: 0px;
  padding: 4px 0px;
}
h2 {
  margin: 0px;
  padding: 4px 0px;
}
h3 {
  margin: 0px;
  padding: 4px 0px;
}
.content {
  font-family: Helvetica,sans-serif;
}
.button-like {
    border: 2px solid #3e363f;
    padding: 8px 16px;
    border-radius: 8px;
    margin: 4px;
    font-size: 14px;
    font-family: Futura,Trebuchet MS,Arial,sans-serif;
    cursor: pointer;
    background-color: #ddd;
}
.button-like:hover {
    background-color: #3e363f;
    color: #ddd;
}
.fork-button {
    margin: 0px;
    padding: 4px;
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
.fork-button:hover {
    color: #ddd;
    background-color: #3e363f;
}
.header-flex {
  display: flex;
  justify-content: space-between;
}
</style>
