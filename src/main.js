// polyfill
import 'babel-polyfill';

import Vue from 'vue';
import App from './App';
import store from './store';
import chat from './chat'

Vue.config.devtools = true;

new Vue({
    el: 'body',
    components: { App },
    store: store
});
