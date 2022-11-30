import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

/**
 * Storage for data that needs to be accessed from various compoentns.
 */
const store = new Vuex.Store({
  state: {
    filter: null, // Username to filter shown freets by (null = show all)
    freets: [], // All freets created in the app
    following: [], // All users that the user presently follows
    followers: [], // All users that the user presently follows
    forkingStory: null,
    likes: [],
    username: null, // Username of the logged in user
    currentlyReading: null, // id of the story segment currently being read (last one that was clicked)
    currentlyReadingChildren: [], // children of the story segment currently being read
    storySegments: [],
    alerts: {} // global success/error messages encountered during submissions to non-visible forms
  },
  mutations: {
    alert(state, payload) {
      /**
       * Add a new message to the global alerts.
       */
      Vue.set(state.alerts, payload.message, payload.status);
      setTimeout(() => {
        Vue.delete(state.alerts, payload.message);
      }, 3000);
    },
    setUsername(state, username) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.username = username;
    },
    updateFilter(state, filter) {
      /**
       * Update the stored freets filter to the specified one.
       * @param filter - Username of the user to fitler freets by
       */
      state.filter = filter;
    },
    async refreshSegments(state) {
      /**
       * Request the server for the currently available segments
       */
      const url = '/api/segment';
      const res = await fetch(url).then(async r => r.json());
      state.storySegments = res;
    },
    async refreshChildren(state, parent) {
      const url = `/api/segment/children?parentId=${parent}`;
      const res = await fetch(url).then(async r => r.json());
      console.log(parent);
      console.log(res);
      state.currentlyReadingChildren = res;
    },
    updateFreets(state, freets) {
      /**
       * Update the stored freets to the provided freets.
       * @param freets - Freets to store
       */
      state.freets = freets;
    },
    updateCurrentlyReading(state, currentlyReading) {
      /**
       * Update the stored freets to the provided freets.
       * @param freets - Freets to store
       */
      state.currentlyReading = currentlyReading;
    },
    async refreshFreets(state) {
      /**
       * Request the server for the currently available freets.
       */
      const url = state.filter ? `/api/users/${state.filter}/freets` : '/api/freets';
      const res = await fetch(url).then(async r => r.json());
      state.freets = res;
    },
    async refreshFollowing(state) {
      /**
       * Request the server for the currently available freets.
       */
      const url = `/api/users/following/${state.username}`;
      const res = await fetch(url).then(async r => r.json());
      state.following = [];
      for (let i = 0; i < res.length; ++i) {
        state.following.push(res[i].username);
      }
    },
    async refreshLikes(state) {
      /**
       * Request the server for the currently available freets.
       */
      /*const url = `/api/segment/likes/${state.username}`;
      const res = await fetch(url).then(async r => r.json());
      state.following = [];
      for (let i = 0; i < res.length; ++i) {
        state.following.push(res[i]);
      }
      console.log(state.following);*/
    },
    async refreshFollowers(state) {
      /**
       * Request the server for the currently available freets.
       */
      const url = `/api/users/followers/${state.username}`;
      const res = await fetch(url).then(async r => r.json());
      state.followers = res;
    },
    updateForkingStory(state, story) {
      /**
       * Request the server for the currently available freets.
       */
      state.forkingStory = story;
    }
  },
  // Store data across page refreshes, only discard on browser close
  plugins: [createPersistedState()]
});

export default store;
