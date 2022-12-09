<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <div class="left">
          <h2>
            Viewing your drafts
          </h2>
        </div>
        </div>
      </header>
      <section
        v-if="$store.state.drafts.length"
      >
        <DraftComponent
          v-for="draftSegment in $store.state.drafts"
          :key="draftSegment.id"
          :draftSegment="draftSegment"
        />
      </section>
      <article
        v-else
      >
        <h3>No drafts found.</h3>
      </article>
    </section>
  </main>
</template>

<script>
import DraftComponent from '@/components/Draft/DraftComponent.vue';

export default {
  name: 'DraftsPage',
  components: {DraftComponent},
  mounted() {
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
