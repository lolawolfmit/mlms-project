import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

/**
 * Storage for data that needs to be accessed from various compoentns.
 */
const store = new Vuex.Store({
  state: {
    filter: null, // Username or keyword to filter shown segments by (null = show all)
    following: [], // All users that the user presently follows
    followers: [], // All users that the user presently follows
    profileFollowerCount: 0,
    profileFollowingCount: 0,
    profilePublicity: 0,
    profileContributions: 0,
    profileStoryCount: 0,
    forkingStory: null,
    profileUser: null,
    likes: [],
    username: null, // Username of the logged in user
    userID: null, // ID of the logged in user
    currentlyReading: null, // id of the story segment currently being read (last one that was clicked)
    currentlyReadingChildren: [], // children of the story segment currently being read
    storySegments: [], // ALL STORY SEGMENTS ON APP, DO NOT DELETE THIS OR MODIFY HOW IT IS POPULATED
    homepageSegments: [], // Story segments for displaying on the homepage
    alerts: {} // global success/error messages encountered during submissions to non-visible forms
  },
  actions: {
    loadProfile(context, username) {
      context.commit('loadProfile', username);
    }
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
    setUserID(state, userID) {
      /**
       * Update the stored userID to the specified one.
       * @param userID - new userID to set
       */
      state.userID = userID;
    },
    updateFilter(state, filter) {
      /**
       * Update the segments filter to the specified one.
       * @param filter - Username or keyword to filter segments by
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
    async refreshHomepageSegments(state) {
      /**
       * Request the server for the currently available segments for a user's homepage (custom for each user)
       */
      const url = state.filter ? `/api/segment/homepage?filter=${state.filter}` : '/api/segment/homepage';
      const res = await fetch(url).then(async r => r.json());
      let authorSegments = state.storySegments.filter(story => story.author == state.filter);
      if (authorSegments) {
        for (let segment of authorSegments) {
          if (!res.includes(segment)) {
            res.push(segment);
          }
        }
      }
      state.homepageSegments = res;
    },
    async refreshChildren(state, parent) {
      const url = `/api/segment/children?parentId=${parent}`;
      const res = await fetch(url).then(async r => r.json());
      state.currentlyReadingChildren = res;
    },
    updateHomepageSegments(state, segments) {
      /**
       * Update the stored homepage segments to the provided segments.
       * @param segments - segments to store
       */
      state.homepageSegments = segments;
    },
    updateCurrentlyReading(state, currentlyReading) {
      /**
       * Update the story segment that is currently being read in expanded view
       * @param currentlyReading - the story segment that is currently being read
       */
      state.currentlyReading = currentlyReading;
    },
    async refreshFollowing(state) {
      /**
       * Request the server for the users the current user is following.
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
       * Request the server for the users following the current user.
       */
      const url = `/api/users/followers/${state.username}`;
      const res = await fetch(url).then(async r => r.json());
      state.followers = res;
    },
    updateForkingStory(state, story) {
      /**
       * Update forkingStory to the story that is currently being forked.
       */
      state.forkingStory = story;
    },
    async loadProfile(state, username) {
      /**
       * Request the server for all information necessary for loading the profile.
       */
      if (!username) {
        return;
      }

      state.profileUser = username;
      const url = `/api/users/followers/${username}`;
      const res = await fetch(url).then(async r => r.json())
      state.profileFollowerCount = res.length;


      const url2 = `/api/users/following/${username}`;
      const res2 = await fetch(url2).then(async r => r.json());
      state.profileFollowingCount = res2.length;

      const url3 = `/api/users/publicity/${username}`;
      const res3 = await fetch(url3).then(async r => r.json());
      state.profilePublicity = res3;


      state.profileContributions = 0;
      state.profileStoryCount = 0;
      for (let segment in state.storySegments) {
        let currentSegment = state.storySegments[segment];
        if (currentSegment.author != username) {
          continue;
        }
        state.profileContributions += 1;
        if (currentSegment.storyPart == 1) {
          state.profileStoryCount += 1;
        }
      }

    },
  },
  // Store data across page refreshes, only discard on browser close
  plugins: [createPersistedState()]
});

export default store;
