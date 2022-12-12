<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="draftSegment"
  >
    <header>

      <div class = "header-split">
        <h2 class="storyTitle">
          {{ draftSegment.segmentTitle }}
        </h2>
        <div>

          <button class = "button-side"
            v-if="editing"
            @click="submitEdit"
          >
            ✅ Save changes
          </button>
          <button class = "button-side"
            v-if="editing"
            @click="stopEditing"
          >
            🚫 Discard changes
          </button>
          <button class = "button-side"
            v-if="!editing"
            @click="startEditing"
          >
            ✏️ Edit
          </button>
          <button @click="deleteDraft" class = "button-side">
            🗑️ Delete
          </button>
        </div>
      </div>

      <h1
        class="segmentTitle"
      >

        Chapter {{draftSegment.storyPart}} of {{ draftSegment.storyTitle }}
      </h1>
      <textarea
        v-if="editing"
        class="content"
        :value="draft"
        @input="draft = $event.target.value"
      />
      <p
        v-else
        class="content"
      >
        {{ draftSegment.content }}
      </p>
      <div
        class="actions"
      >
      </div>
    <button @click="publishDraft" class = "form-button border-button">
        Publish
    </button>
    </header>
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
  name: 'DraftComponent',
  props: {
    // Data from the stored freet
    draftSegment: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editing: false, // Whether or not this freet is in edit mode
      draft: this.draftSegment.content, // Potentially-new content for this freet
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {
    startEditing() {
      /**
       * Enables edit mode on this draft.
       */
      this.editing = true; // Keeps track of if a freet is being edited
      this.draft = this.draftSegment.content; // The content of our current "draft" while being edited
    },
    stopEditing() {
      /**
       * Disables edit mode on this draft.
       */
      this.editing = false;
      this.draft = this.draftSegment.content;
    },
    deleteDraft() {
      /**
       * Deletes this draft.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted draft!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    publishDraft() {
      /**
       * Publishes this draft.
       */
      const params = {
        method: 'POST',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully published draft!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    submitEdit() {
      /**
       * Updates freet to have the submitted draft content.
       */
      if (this.draftSegment.content === this.draft) {
        const error = 'Error: Edited draft content should be different than current draft content.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }
      const params = {
        method: 'PATCH',
        message: 'Successfully edited draft!',
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
        const r = await fetch(`/api/drafts/${this.draftSegment._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshDrafts');
        if (params.method === 'POST') {
          this.$router.push(`/profile/${this.$store.state.username}`);
        }

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
.button-side {
    border: 2px solid #3e363f;
    padding: 8px 16px;
    border-radius: 8px;
    margin: 4px;
    font-size: 14px;
    font-family: Futura,Trebuchet MS,Arial,sans-serif;
    cursor: pointer;
    background-color: #ddd;
}
.button-side:hover {
    color: #ddd;
    background-color: #3e363f;
}
.border-button {
  border: 2px solid #3e363f;
}
.draftSegment {
    border: none;
    padding: 20px;
    position: relative;
    background-color: #eee;
    border-radius: 15px;
}
.header-split {
  display: flex;
  justify-content: space-between;
}
.content {
  font-family: Helvetica,sans-serif;
}

h1 {
  margin: 0px;
  padding: 4px 0px;
}
h2 {
  margin: 0px;
  padding: 4px 0px;
}
textarea {
   font-family: inherit;
   font-size: inherit;
   border: none;
   border-radius: 4px;
}
</style>