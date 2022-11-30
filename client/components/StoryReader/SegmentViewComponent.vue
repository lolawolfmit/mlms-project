<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="segment"
  >
    <header>
      <h3 class="author">
        {{ this.$store.state.currentlyReading.segmentTitle }}, the first chapter of {{ this.$store.state.currentlyReading.storyTitle }} by {{ this.$store.state.currentlyReading.author }} 
         <button v-if="this.$store.state.following.includes(this.$store.state.currentlyReading.author)"
        @click="followAuthor">Unfollow</button>
        <button v-else
        @click="followAuthor">Follow</button>
        <button v-if="this.$store.state.likes.includes(this.$store.state.currentlyReading._id)"
        @click="likeStory">Unlike</button>
        <button v-else
        @click="likeStory">Like</button>
        <button @click="forkStory">Fork</button>
      </h3>
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
        //this.$store.commit('refreshFollowing');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    forkStory() {
        this.$store.commit('updateForkingStory', this.$store.state.currentlyReading);
        this.$router.push('/newforkedstory');
    },
    async likeStory() {
      // set global variable
      // push storyreader page into router

      let message = this.$store.state.likes.includes(this.segment._id) ? 'Unliked!' : 'Liked!';

      const params = {
        method: 'PATCH',
        message: message,
        body: JSON.stringify({segmentId: this.segment._id}),
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
        this.$store.commit('refreshLikes');

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
    border: 1px solid #111;
    padding: 20px;
    position: relative;
}
</style>
