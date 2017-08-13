<script>
import { actions } from '../store';
import { mapState, mapActions } from 'vuex'

export default {
    data () {
        return {
            content: ''
        };
    },

    computed: mapState({
        from : ({ user }) => user,
        to: ({ sessions, currentSessionId }) => {
            let session = sessions.find(session => session.id === currentSessionId);
            if (session == null) {
                return null;
            }
            return session.user.id;
        }
    }),

    methods: {
        onKeyup (e) {
            this.content = this.content.substring(0, this.content.length - 1);
            if (e.keyCode === 13 && this.content.length > 0) {
                let message = {};
                message.content = this.content;
                message.date = new Date();
                message.self = true;
                this.sendMessage(message);
                this.saveMessage(message);
                this.postMessage(this.content);
                this.content = '';
            } else {
                this.content = '';
            }
        },
        postMessage (content) {
            let message = {};
            message.from = this.from;
            message.to = this.to;
            message.content = this.content;
            message.action = 'onmessage';
            this.$socket.send(JSON.stringify(message));
        },
        ...mapActions([
            'sendMessage',
            'saveMessage'
        ])
    }
};
</script>

<template>
<div class="textbox">
    <textarea placeholder="按 Enter 发送" v-model="content" @keyup.enter="onKeyup"></textarea>
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