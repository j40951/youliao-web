import Vue from 'vue'
import VueNativeSock from 'vue-native-websocket';

Vue.use(VueNativeSock, 'ws://localhost:8070/sredis',  {protocol: 'my-protocol'});

