<script>
import { actions } from '../store';

export default {
    vuex: {
        actions: actions,
        getters: {
            from: ({ user }) => user,
            to: ({ sessions, currentSessionId }) => {
                let session = sessions.find(session => session.id === currentSessionId);
                return session.user;
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
                this.sendMessage(this.content);
                this.sendTo(this.content);
                this.content = '';
            }
        },
        sendTo (content) {
            let msg = {};
            msg.from = this.from;
            msg.to = this.to;
            msg.content = this.content;
            console.log(JSON.stringify(msg));
            this.$socket.send(JSON.stringify(msg));
        }
    }
};
</script>

<template>
<div class="text">
    <textarea placeholder="按 Ctrl + Enter 发送" v-model="content" @keyup="onKeyup"></textarea>
</div>
</template>

<style lang="less" scoped>
.text {
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