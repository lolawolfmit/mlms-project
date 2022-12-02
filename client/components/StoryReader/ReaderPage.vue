<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.currentlyReading.storyPart > 1">
      <button @click="goToPrevious">Go to the previous segment in the tree</button>
    </section>
    <section v-if="$store.state.currentlyReading">
      <SegmentViewComponent />
    </section>
    <section
        v-if="$store.state.currentlyReadingChildren.length"
      >
        <StoryChild
          v-for="child in $store.state.currentlyReadingChildren"
          :key="child.id"
          :child="child"
        />
    </section>
  </main>
</template>

<script>
import SegmentViewComponent from '@/components/StoryReader/SegmentViewComponent.vue';
import StoryChild from '@/components/StoryReader/StoryChild.vue';

export default {
  name: 'ReaderPage',
  components: {SegmentViewComponent, StoryChild},
  methods: {
    goToPrevious() {
      this.$store.commit('refreshChildren', this.$store.state.currentlyReading.parent);
      this.$store.commit('updateCurrentlyReading', this.$store.state.storySegments.find(story => story._id == this.$store.state.currentlyReading.parent));
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
