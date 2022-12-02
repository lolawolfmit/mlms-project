<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <h2>Welcome {{ $store.state.username }}</h2>
      </header>
      <header>
        <div class="left">
          <h2>
            Here are some stories you might like:
          </h2>
        </div>
      </header>
      <div class="right">
          <GetSegmentsForm
            ref="getSegmentsForm"
            value="author"
            placeholder="🔍 Filter by keyword or author (optional)"
            button="🔄 Get segments"
          />
        </div>
      <section
        v-if="$store.state.homepageSegments.length"
      >
        <SegmentPreviewComponent
          v-for="segment in $store.state.homepageSegments"
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
      <h2>Welcome to Story Tree! Sign in to continue.</h2>
    </section>
  </main>
</template>

<script>
import SegmentPreviewComponent from '@/components/Profile/SegmentPreviewComponent.vue';
import GetSegmentsForm from '@/components/Homepage/GetSegmentsForm.vue';

export default {
  name: 'Homepage',
  components: {SegmentPreviewComponent, GetSegmentsForm},
  mounted() {
    this.$refs.getSegmentsForm.submit();
  },
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
