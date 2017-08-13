import Vue from 'vue'
import * as types from './mutation-types'
import PromisedDB from 'promised-db'

export default {
    [types.INIT_DATA] (state) {

        let currentUser = localStorage.getItem('user');
        if (currentUser) {
            state.user = JSON.parse(currentUser);
        }

        let currentSessionId = localStorage.getItem('currentSessionId');
        if (currentSessionId) {
            state.currentSessionId = parseInt(currentSessionId);
        }

        let messageDBVersion = localStorage.getItem('messageDBVersion');
        if (messageDBVersion) {
            state.messageDBVersion = parseInt(messageDBVersion);
        } else {
            localStorage.setItem('messageDBVersion', state.messageDBVersion);
        }

        // Create Session Store
        state.storeDB = new PromisedDB("store", 1,
            (db, oldVersion, newVersion) => {
                console.log("storeDB==>oldVersion:" + oldVersion + ", newVersion:" + newVersion);
                if (!db.objectStoreNames.contains("session")) {
                    let sessionStore = db.createObjectStore("session", { autoIncrement: true } );
                    sessionStore.createIndex("id", "id", { unique: true });    
                }
            }
        );
    },

    // 初始化会话，从IndexedDB中取出会话，更新到Store中
    [types.INIT_SESSIONS] (state, records) {

        for (let index = 0; index < records.length; index ++) {
            let session = {};
            session.id = index + 1;
            session.user = records[index];
            state.sessions.push(session);
        }

        state.messageDB = new PromisedDB("message", state.messageDBVersion, (db, oldVersion, newVersion) => {
            for (let index = 0; index < state.sessions.length; index ++) {
                let storeName = "session:" + state.sessions[index].id;
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { autoIncrement: true } );
                }
            }
        });
    },

    // 增加会话
    [types.ADD_SESSION] (state, session) {

        state.sessions.push(session);

        state.messageDBVersion += 1;
        localStorage.setItem('messageDBVersion', state.messageDBVersion);

        if (state.messageDB != null) {
            state.messageDB.close();
        }
        state.messageDB = new PromisedDB("message", state.messageDBVersion, (db, oldVersion, newVersion) => {
            console.log("messageDB==>oldVersion:" + oldVersion + ", newVersion:" + newVersion);
            for (let index = 0; index < state.sessions.length; index ++) {
                let storeName = "session:" + state.sessions[index].id;
                if (!db.objectStoreNames.contains(storeName)) {
                    console.log("Add session message store, storeName=" + storeName)
                    db.createObjectStore(storeName, { autoIncrement: true } );
                }
            }
        });
    },

    // 发送消息
    [types.SEND_MESSAGE] ({ messages }, message) {
        messages.push(message);
    },

    [types.SET_MESSAGES] (state, messages) {
        state.messages = messages;
    },

    // 选择会话
    [types.SELECT_SESSION] (state, id) {
        state.currentSessionId = id;
        localStorage.setItem("currentSessionId", state.currentSessionId);
    },

    // 搜索
    [types.SET_FILTER_KEY] (state, value) {
        state.filterKey = value;
    },

    // 设置当前User
    [types.SET_USER] (state, value) {
        state.user = value;
        localStorage.setItem("user", JSON.stringify(state.user));
    },

    [types.SOCKET_ONOPEN] (state, message)  {
        console.log("Chat tunnel connect success.");
    },

    [types.SOCKET_ONERROR] (state, message) {
        console.log("Chat tunnel connect error.", message);
    },

    [types.SOCKET_ONCLOSE] (state, message) {
        console.log("Chat tunnel connect close.");
    }
}
