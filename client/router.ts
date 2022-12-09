import Vue from 'vue';
import VueRouter from 'vue-router';
import FreetsPage from './components/Freet/FreetsPage.vue';
import AccountPage from './components/Account/AccountPage.vue';
import LoginPage from './components/Login/LoginPage.vue';
import ProfilePage from './components/Profile/ProfilePage.vue';
import NewStoryPage from './components/NewStory/NewStoryPage.vue';
import NewForkedStoryPage from './components/NewForkedStory/NewForkedStoryPage.vue';
import ReaderPage from './components/StoryReader/ReaderPage.vue';
import Homepage from './components/Homepage/Homepage.vue';
import DraftsPage from './components/Draft/DraftsPage.vue';
import NotFound from './NotFound.vue';

Vue.use(VueRouter);

const routes = [
  {path: '/', name: 'Homepage', component: Homepage},
  {path: '/account', name: 'Account', component: AccountPage},
  {path: '/login', name: 'Login', component: LoginPage},
  {path: '/profile/:username', name: 'Profile', component: ProfilePage},
  {path: '/newstory', name: 'NewStory', component: NewStoryPage},
  {path: '/newforkedstory', name: 'NewForkedStory', component: NewForkedStoryPage},
  {path: '/reader', name: 'ReaderPage', component: ReaderPage},
  {path: '/drafts', name: 'DraftsPage', component: DraftsPage},
  {path: '*', name: 'Not Found', component: NotFound}
];

const router = new VueRouter({routes});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from, next) => {
  if (router.app.$store) {
    if (to.name === 'Login' && router.app.$store.state.username) {
      next({name: 'Account'}); // Go to Account page if user navigates to Login and are signed in
      return;
    }

    if (to.name === 'Account' && !router.app.$store.state.username) {
      next({name: 'Login'}); // Go to Login page if user navigates to Account and are not signed in
      return;
    }
  }

  next();
});

export default router;
