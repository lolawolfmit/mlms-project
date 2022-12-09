<!-- Page that shows an expanded view of a story segment that the user has clicked and the children of that segment they can navigate to. -->

<template>
  <main>
    <section v-if="$store.state.currentlyReading.storyPart > 1">
      <button @click="goToPrevious" class = "previous-button">Previous</button>
    </section>
    <section v-if="$store.state.currentlyReading">
      <SegmentViewComponent />
    </section>
    <h3 v-if="$store.state.currentlyReadingChildren.length">Read next...</h3>
    <h3 v-else>There are no more stories in this story tree. Write one yourself by clicking "fork"!</h3>
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
      /**
       * Triggers going back a story in a story branch to the currentlyReading segment's parent (if applicable)
       */
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
.previous-button {
    border: 2px solid #3e363f;
    border-radius: 8px;
    margin: 12px 4px 4px 4px;
    font-size: 24px;
    font-family: Futura,Trebuchet MS,Arial,sans-serif;
    cursor: pointer;
    background-color: #ddd;
    padding: 8px 16px;
    text-decoration: none;
    color: #3e363f;
    border: 2px solid #3e363f;
    border-radius: 12px;
    width: 240px;
    max-width: 100%;
}
.previous-button:hover {

    background-color: #3e363f;
    color: #ddd;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}
</style>
