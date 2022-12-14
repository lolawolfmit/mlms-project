<!-- Reusable component representing a single preview of a segment and its actions -->
<!-- see /components/Profile/SegmentPreviewComponent instead -->

<template>
  <article
    class="segment"
  >
    <header>
      <div class="left">
      <h2 class="author">
        {{ segment.segmentTitle}}
      </h2>
      </div>
      <div class="right">
      <h1>
      by
       <router-link :to = "'/profile/'+segment.author" class="profile-link">
       {{ segment.author }}
       </router-link>
       <span v-if="segment.author !== this.$store.state.username">
        <button class = "follow-button unfollow-button" v-if="this.$store.state.following.includes(segment.author)"
        @click="followAuthor">Unfollow</button>
        <button class = "follow-button" v-else
        @click="followAuthor">Follow</button>
      </span>
      </h1>
      </div>
    </header>
      <header>
      <h1 class="author">
        Part {{segment.storyPart}} of {{ segment.storyTitle }}
      </h1>

    <div class = "like-container">
      <h1>
        {{segment.likes.length}} like(s)
      <button class = "button-like" v-if="this.$store.state.storySegments.find(s => s._id === this.segment._id).likes.includes(this.$store.state.userID)"
        @click="likeStory">Unlike</button>
        <button class = "button-like" v-else
        @click="likeStory">Like</button>
      </h1>
      
      </div>

      </header>
      
    <p
      class="content"
      v-if="segment.content.length > 300"
    >
      {{ segment.content.slice(0, 300) }}...
    </p>
    <p
      class="content"
      v-else
    >
      {{ segment.content }}
    </p>

    <button @click="expandSegment" class="readmore-button">Read More</button>
    <br/>
    <br/>
    <p class="info">
      Posted at {{ segment.datePublished }}
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
      /**
       * Triggers expanding the segment preview into a larger reader page that allows for forking and also displays children (if applicable)
       */
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
        this.$store.commit('refreshSegments');
        this.$store.commit('refreshHomepageSegments');
        this.$store.commit('loadProfile', this.$store.state.profileUser);
        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    forkStory() {
      /**
       * Triggers forking a story.
       */
        this.$store.commit('updateForkingStory', this.segment._id);
    },
    async likeStory() {
      // set global variable
      // push storyreader page into router
      let message = this.segment.likes.includes(this.$store.state.userID) ? 'Unliked!' : 'Liked!';
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
        this.$store.commit('refreshSegments');
        this.$store.commit('refreshHomepageSegments');
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
    padding: 20px;
    position: relative;
    border: none;
    background-color: #eee;
    border-radius: 15px;
    margin-bottom: 12px;
}
h1 {
  margin: 0px;
}
h2 {
  margin: 0px;
}

header, header > * {
    display: flex;
    justify-content: space-between;
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
    background-color: #D6E4D9;
    color: #05433F;
}
.unfollow-button:hover {
    background-color: #ffccbb;
    color: #05433F;
}
.button-like {
    border: 2px solid #05433F;
    padding: 8px 16px;
    border-radius: 8px;
    margin: 4px;
    font-size: 14px;
    font-family: Futura,Trebuchet MS,Arial,sans-serif;
    cursor: pointer;
}
.button-like:hover {
    background-color: #05433F;
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
    color: #05433F;
    background-color: #84ABA9;
}
.fork-button:hover {
    color: #ddd;
    background-color: #05433F;
}
.readmore-button {
    margin: 0px;
    padding: 8px;
    border: 2px solid #05433F;
    border-radius: 8px;
    font-size: 20px;
    font-family: Futura,Trebuchet MS,Arial,sans-serif;
    cursor: pointer;
    color: #05433F;
}
.readmore-button:hover {
    color: #ddd;
    background-color: #05433F;
}
.like-containter {
  display:flex;
  justify-content: space-between;
}
.content {

    font-family: Helvetica,sans-serif;
}
.info {

    font-size: 14px;
}
.profile-link {
  text-decoration: none;
  color: #84ABA9;
}
</style>
