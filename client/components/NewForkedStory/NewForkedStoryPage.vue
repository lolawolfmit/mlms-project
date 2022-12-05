<!-- Page for creating a new forked story segment -->

<template>
  <main>
    <section>
      <header>
        <h2>Continue the story</h2>
      </header>
      <CreateForkedStoryForm />
    </section>
  </main>
</template>

<script>
import CreateForkedStoryForm from '@/components/NewForkedStory/CreateForkedStoryForm.vue';

export default {
  name: 'NewForkedStoryPage',
  components: {
    CreateForkedStoryForm
  }
};
</script>
