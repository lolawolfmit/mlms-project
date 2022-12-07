<!-- Form for signing in (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'LoginForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/users/session',
      method: 'POST',
      hasBody: true,
      setUsername: true,
      fields: [
        {id: 'username', label: null, value: '', placeholder: 'Username'},
        {id: 'password', label: null, value: '', placeholder: 'Password'}
      ],
      title: 'Sign in',
      callback: () => {
        this.$router.push({name: 'Homepage'});
        this.$store.commit('alert', {
          message: 'You are now signed in!', status: 'success'
        });
      }
    };
  }
};
</script>
