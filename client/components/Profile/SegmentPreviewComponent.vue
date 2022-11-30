<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="segment"
  >
    <header>
      <h3 class="author">
        {{ segment.segmentTitle}}, the first chapter of {{ segment.storyTitle }} by {{ segment.author }}
        <button v-if="this.$store.state.following.includes(segment.author)"
        @click="followAuthor">Unfollow</button>
        <button v-else
        @click="followAuthor">Follow</button>
        <button v-if="this.$store.state.likes.includes(segment._id)"
        @click="likeStory">Unlike</button>
        <button v-else
        @click="likeStory">Like</button>
        <button @click="forkStory">Fork</button>
      </h3>
    </header>
    <p
      class="content"
      v-if="segment.content.length > 20"
    >
      {{ segment.content.slice(0, 20) }}...
    </p>
    <p
      class="content"
      v-else
    >
      {{ segment.content }}
    </p>
    <p class="info">
      Posted at {{ segment.datePublished }}
    </p>
    <button @click="expandSegment">Read More</button>
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
  name: 'SegmentPreviewComponent',
  props: {
    // Data from the stored segment
    segment: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {
    expandSegment() {
      // set global variable
      // push storyreader page into router
      this.$store.state.currentlyReading = this.segment;
      this.$store.commit('refreshChildren', this.segment._id);
      this.$router.push('/reader');
    },

    async followAuthor() {
      // set global variable
      // push storyreader page into router

      let message = this.$store.state.following.includes(this.segment.author) ? 'No longer following!' : 'Following!';

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
        const r = await fetch(`/api/users/follow/${this.segment.author}`, options);
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
        this.$store.commit('updateForkingStory', this.segment._id);
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
