<!-- Form for creating a new story segment for a story that does not yet exist (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateStoryForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/segment',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'storyTitle', label: 'Story Title', value: ''},
        {id: 'segmentTitle', label: 'Segment Title', value: ''},
        {id: 'content', label: 'Content', value: ''}
      ],
      additionalBody: [
        {id: 'parent', value: null}
      ],
      title: 'Start Your Story',
      callback: () => {
        const message = 'Successfully created your story segment!';
        this.$store.commit('refreshSegments');
        this.$router.push(`/profile/${this.$store.state.username}`);
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
