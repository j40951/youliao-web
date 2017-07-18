import Vue from 'vue'
import VueNativeSock from 'vue-native-websocket';
// import store from './store'

Vue.use(VueNativeSock, 'ws://localhost:8070/sredis',  {protocol: 'youliao'});

