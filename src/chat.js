import Vue from 'vue'
import VueNativeSock from 'vue-native-websocket';
import store from './store'

//Vue.use(VueNativeSock, 'ws://localhost:8070/tunnel',  {store: store, protocol: 'youliao', format: 'json'});

Vue.use(VueNativeSock, 'ws://localhost:8060/vchat/tunnels',  {store: store, protocol: '', format: 'json'});

