<!-- Form for creating a new story segment for a story that does not yet exist (block style) -->

<script>
import BlockFormTwoButtons from '@/components/common/BlockFormTwoButtons.vue';

export default {
  name: 'CreateStoryForm',
  mixins: [BlockFormTwoButtons],
  data() {
    return {
      url: '/api/segment',
      otherUrl: '/api/drafts',
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
      otherTitle: 'Save as Draft',
      redirectFirst: `/profile/${this.$store.state.username}`, // if you click first button, it will push this to router after fetching
      redirectOther: '/drafts', // if you click second button, it will push this to router after fetching
      callback: () => {
        const message = 'Successfully created your story segment!';
        this.$store.commit('refreshSegments');
        this.$store.commit('refreshDrafts');
        this.$router.push(this.$store.state.nextRedirectForBlockFormTwoButtons);
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
