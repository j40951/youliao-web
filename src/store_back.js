/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from 'vue';
import Vuex from 'vuex';
import PromisedDB from 'promised-db'

Vue.use(Vuex);

const now = new Date();
const store = new Vuex.Store({
    state: {
        // 当前用户
        user: {
            id: 'ab07b356-afa1-450a-bc9b-b90394169e7e',
            name: 'coffce',
            img: 'dist/images/1.jpg'
        },
        messages: [
            {
                content: 'Hello，这是一个基于Vue + Vuex + Webpack构建的简单chat示例，聊天记录保存在localStorge, 有什么问题可以通过Github Issue问我。',
                date: now
            }, {
                content: '项目地址: https://github.com/coffcer/vue-chat',
                date: now
            }
        ],
        
        // 会话列表
        sessions: [
            
        ],
        // 当前选中的会话
        currentSessionId: 1,
        messageDBVersion: 1,
        // 过滤出只包含这个key的会话
        filterKey: '',

        messageDB: null,
        storeDB: null
    },
    mutations: {
        INIT_DATA (state) {
            // let data = localStorage.getItem('vue-chat-session');
            // if (data) {
            //     state.sessions = JSON.parse(data);
            // }

            // localStorage.setItem('user', JSON.stringify(state.user));

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

            // const trans = state.storeDB.transaction(["session"], "readwrite",
            //     ( tr, { request } ) => {
            //         console.log("Add session to indexedDB.");
            //         const sessionStore = tr.objectStore("session");
            //         let user = {};
            //         user.id = '2e0e1626-eaab-4b40-918e-ae4517c3dfc0';
            //         user.name = 'jack.ju';
            //         user.img = 'dist/images/2.png';
            //         const itemProm = request(sessionStore.add(user));
            //         return Promise.all([itemProm]);
            //     }
            // );
            // trans.then(result => {
            //     console.log("Add session success, result = " + result);
            //     if (result.length > 0) {
            //         let index = result[0];
            //         session.id = index;
            //         // dispatch('ADD_SESSION', session);
            //     }
            // }).catch(error => {
            //     console.log("Add session fail. error = " + error);
            // });
        },

        // 初始化会话，从IndexedDB中取出会话，更新到Store中
        INIT_SESSIONS (state, records) {

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
        ADD_SESSION (state, session) {
            state.sessions.push(session);

            state.messageDBVersion += 1;
            localStorage.setItem(messageDBVersion, state.messageDBVersion);

            if (state.messageDB != null) {
                state.messageDB.close();
            }
            state.messageDB = new PromisedDB("message", state.messageDBVersion, (db, oldVersion, newVersion) => {
                console.log("storeDB==>oldVersion:" + oldVersion + ", newVersion:" + newVersion);
                for (let index = 0; index < state.sessions.length; index ++) {
                    let storeName = "session:" + state.sessions[index].id;
                    console.log(storeName);
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { autoIncrement: true } );
                    }
                }
            });
        },

        // 发送消息
        SEND_MESSAGE ({ messages }, message) {
            messages.push(message);
        },

        SET_MESSAGES (state, messages) {
            state.messages = messages;
        },

        // 选择会话
        SELECT_SESSION (state, id) {
            state.currentSessionId = id;
            localStorage.setItem("currentSessionId", state.currentSessionId);
        },

        // 搜索
        SET_FILTER_KEY (state, value) {
            state.filterKey = value;
        },

        // 设置当前User
        SET_USER (state, value) {
            state.user = value;
            localStorage.setItem("user", JSON.stringify(state.user));
        },

        SOCKET_ONMESSAGE (state, message)  {
          state.message = message
          console.log("hello world...." + state.message);
        }

    },
    actions: actions
});

export default store;
export const actions = {
    initData: ({ commit, state }) => {
        commit('INIT_DATA');
        const trans = state.storeDB.transaction(["session"], "readonly", 
            (tr, {getAll}) => {
                const sessionStore = tr.objectStore("session");
                const records = getAll(sessionStore);
                return Promise.all([records]);
            }
        );

        trans.then(result => {
            if (result.length > 0) {
                let records = result[0];
                commit('INIT_SESSIONS', records);
            }
        }).catch(error => {
            console.log(error);
        });
    },

    addSession: ({ commit, state }, session) => {
        const trans = state.storeDB.transaction(["session"], "readwrite",
            ( tr, { request } ) => {
                console.log("Add session to indexedDB.");
                const sessionStore = tr.objectStore("session");
                const itemProm = request(sessionStore.add(session));
                return Promise.all([itemProm]);
            }
        );
        trans.then(result => {
            console.log("Add session success, result = " + result);
            if (result.length > 0) {
                let index = result[0];
                session.id = index;
                commit('ADD_SESSION', session);
            }
        }).catch(error => {
            console.log("Add session fail. error = " + error);
        });
    },

    saveMessage: ({ commit, state }, message, userId) => {

        let sessionId = state.currentSessionId;
        if (userId != null) {
            let session = state.sessions.find(session => session.user.id === userId);
            if (session == null) {
                console.log("Not found session by userId : " + userId);
                return;
            }
            sessionId = session.id;
        }

        const storeName = "session:" + sessionId;
        const trans = state.messageDB.transaction([storeName], "readwrite",
            ( tr, { request } ) => {
                const messageStore = tr.objectStore(storeName);        
                const itemProm = request(messageStore.add(message));
                return Promise.all([itemProm]);
            }
        );
        trans.then(result => {
            // Save message success
        }).catch(error => {
            console.log("Save message fail. " + error);
        });
    },

    sendMessage: ({ commit }, message) => commit('SEND_MESSAGE', message),

    pushMessage: ({ commit }, message) => {
        // commit('SEND_MESSAGE', message);
        console.log('push_message:' + message);
    },

    selectSession: ({ commit, state }, id) => {
        commit('SELECT_SESSION', id);
        console.log("currentSessionId: " + state.currentSessionId);

        const storeName = "session:" + state.currentSessionId;
        const trans = state.messageDB.transaction([storeName], "readonly",
            ( tr, { getAll } ) => {
                const messageStore = tr.objectStore(storeName);        
                const messages = getAll(messageStore);
                return Promise.all([messages]);
            }
        );
        trans.then(result => {
            // Save message success
            if (result.length > 0) {
                console.log(result[0]);
                commit('SET_MESSAGES', result[0]);
            }
        }).catch(error => {
            console.log("Save message fail. " + error);
        });
    },
    search: ({ commit }, value) => commit('SET_FILTER_KEY', value)
};
