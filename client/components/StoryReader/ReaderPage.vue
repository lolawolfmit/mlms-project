<!-- Default page that also displays freets -->

<template>
  <main>
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
