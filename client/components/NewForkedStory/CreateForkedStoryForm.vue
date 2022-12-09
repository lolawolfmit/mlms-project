<!-- Form for creating a new forked story segment (a continuation of a story that already exists) (block style) -->

<script>
import BlockFormTwoButtons from '@/components/common/BlockFormTwoButtons.vue';

export default {
  name: 'CreateForkedStoryForm',
  mixins: [BlockFormTwoButtons],
  data() {
    return {
      url: '/api/segment',
      otherUrl: '/api/drafts',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'segmentTitle', label: 'Segment Title', value: ''},
        {id: 'content', label: 'Content', value: ''}
      ],
      additionalBody: [
        {id: 'parent', value: this.$store.state.currentlyReading._id},
        {id: 'storyTitle', value: this.$store.state.currentlyReading.storyTitle}
      ],
      title: 'Continue the Story',
      otherTitle: 'Save as Draft',
      callback: () => {
        const message = 'Successfully created your story segment!';
        this.$store.commit('refreshSegments');
        this.$store.commit('refreshDrafts');
        this.$router.push('/');
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
