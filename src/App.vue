<script>
import { actions } from './store';

import Card from 'components/card';
import List from 'components/list';
import Textbox from 'components/textbox';
import Message from 'components/message';

export default {
    components: { Card, List, Textbox, Message },
    vuex: {
        actions: actions
    },
    created () {
        this.initData();
        console.log(this);
    },
    sockets: {
        onopen: (event) => {
            console.log('Chat tunnel connected success.');
        },
        onmessage: (event) => {
            console.log('on message---->', event.data);
            let message = JSON.parse(event.data);
            // this.sendMessage(message);
            console.log(event);
            console.log(this);
            // console.log("this's type is " + typeof(obj));
        }
    }
}
</script>

<template>
<div id="app">
    <div class="sidebar">
        <card></card>
        <list></list>
    </div>
    <div class="main">
        <message></message>
        <textbox></textbox>
    </div>
</div>
</template>

<style lang="less" scoped>
#app {
    margin: 20px auto;
    width: 800px;
    height: 600px;

    overflow: hidden;
    border-radius: 3px;

    .sidebar, .main {
        height: 100%;
    }
    .sidebar {
        float: left;
        width: 200px;
        color: #f4f4f4;
        background-color: #2e3238;
    }
    .main {
        position: relative;
        overflow: hidden;
        background-color: #eee;
    }
    .textbox {
        position: absolute;
        width: 100%;
        bottom: 0;
        left: 0;
    }
    .message {
        height: ~'calc(100% - 160px)';
    }
}
</style>
