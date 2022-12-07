<!-- Page for creating a new story segment -->

<template>
  <main>
    <section>
      <header>
        <h2>Begin your story</h2>
      </header>
      <CreateStoryForm />
    </section>
  </main>
</template>

<script>
import CreateStoryForm from '@/components/NewStory/CreateStoryForm.vue';

export default {
  name: 'NewStoryPage',
  components: {
    CreateStoryForm
  }
};
</script>
