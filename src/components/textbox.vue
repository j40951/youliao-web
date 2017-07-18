<script>
import { actions } from '../store';

export default {
    vuex: {
        actions: actions,
        getters: {
            from: ({ user }) => user.id,
            to: ({ sessions, currentSessionId }) => {
                let session = sessions.find(session => session.id === currentSessionId);
                if (session == null) {
                    return null;
                }
                return session.user.id;
            }
        }
    },
    data () {
        return {
            content: ''
        };
    },
    methods: {
        onKeyup (e) {
            if (e.ctrlKey && e.keyCode === 13 && this.content.length) {
                let message = {};
                message.content = this.content;
                message.date = new Date();
                message.self = true;
                this.sendMessage(message);
                this.saveMessage(message);
                this.postMessage(this.content);
                this.content = '';
            }
        },
        postMessage (content) {
            let message = {};
            message.from = this.from;
            message.to = this.to;
            message.content = this.content;
            this.$socket.send(JSON.stringify(message));
        }
    }
};
</script>

<template>
<div class="textbox">
    <textarea placeholder="按 Ctrl + Enter 发送" v-model="content" @keyup="onKeyup"></textarea>
</div>
</template>

<style lang="less" scoped>
.textbox {
    height: 160px;
    border-top: solid 1px #ddd;

    textarea {
        padding: 10px;
        height: 100%;
        width: 100%;
        border: none;
        outline: none;
        font-family: "Micrsofot Yahei";
        resize: none;
    }
}
</style>