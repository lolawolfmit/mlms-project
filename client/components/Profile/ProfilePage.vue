<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <h2>Welcome {{ $store.state.username }}</h2>
        <h3>x publicity</h3>
        <h3>y stories, z contributions</h3>
        <h3>{{ $store.state.followers.length }} followers, {{ $store.state.following.length }} following</h3>
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
  methods: {
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
