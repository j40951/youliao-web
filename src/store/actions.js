import * as types from './mutation-types'
import Url from '../api/url.js';
import axios from 'axios';

export const initData = ({ dispatch, commit, state }) => {
    commit(types.INIT_DATA);
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
            commit(types.INIT_SESSIONS, records);

            // 初始化getIamUser，因时序问题需要在INIT_SESSION之后执行
            let params = Url.getQueryParams();
            if ("to" in params) {
                dispatch('getIamUser', params.to);
            } else {
                dispatch('setMessage');    
            }
        }
    }).catch(error => {
        console.log(error);
    });
}

export const setMessage = ({ commit, state}) => {

    const storeName = "session:" + state.currentSessionId;
    const trans = state.messageDB.transaction([storeName], "readonly", (tr, {getAll}) => {
        const messageStore = tr.objectStore(storeName);
        const messages = getAll(messageStore);
        return Promise.all([messages]);
    });
    trans.then(result => {
        if (result.length > 0) {
            commit(types.SET_MESSAGES, result[0]);
        }
    }).catch(error => {
        console.log("Save message fail. " + error);
    });
}

export const addSession = ({ commit, state }, user, isActive) => {
    const trans = state.storeDB.transaction(["session"], "readwrite", (tr, {request}) => {
        console.log("Add session to indexedDB.");
        const sessionStore = tr.objectStore("session");
        const itemProm = request(sessionStore.add(user));
        return Promise.all([itemProm]);
    });
    trans.then(result => {
        console.log("Add session success, result = " + result);
        if (result.length > 0) {
            let index = result[0];
            let session = {};
            session.id = index;
            session.user = user;
            commit(types.ADD_SESSION, session);

            if (isActive) {
                console.log('active session sessionId = ' + session.id);
                commit(type.SELECT_SESSION, session.id);
            }
        }
    }).catch(error => {
        console.log("Add session fail. error = " + error);
    });
}

export const saveMessage = ({ state }, message, userId) => {

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
    const trans = state.messageDB.transaction([storeName], "readwrite", (tr, {request}) => {
        const messageStore = tr.objectStore(storeName);        
        const itemProm = request(messageStore.add(message));
        return Promise.all([itemProm]);
    });
    trans.then(result => {
        // Save message success
    }).catch(error => {
        console.log("Save message fail. " + error);
    });
}

export const sendMessage = ({ commit }, message) => commit('SEND_MESSAGE', message)

export const pushMessage = ({ commit }, message) => {
    // commit('SEND_MESSAGE', message);
    console.log('push_message:' + message);
}

export const selectSession = ({ dispatch, commit, state }, id) => {
    commit(types.SELECT_SESSION, id);
    dispatch('setMessage');
}

export const search = ({ commit }, value) => commit('SET_FILTER_KEY', value)

export const onmessage = ({dispatch, state}, msg) => {
    let session = state.sessions.find(session => session.user.id === msg.from.id);

    let message = {};
    message.content = msg.content;
    message.date = new Date();

    if (session != null) {
        if (session.id === state.currentSessionId) {
            dispatch('sendMessage', message);
        } else {
            dispatch('saveMessage', message, msg.from.id);
        }

    } else {
        dispatch('addSession', msg.from, false);
        dispatch('saveMessage', message, msg.from.id);
    }
}

export const setuser = ({ commit }, msg) => {
    commit(types.SET_USER, msg.user);
}

export const getIamUser = ({dispatch, commit, state}, userId) => {

    console.log('userId = ' + userId);
    let userUrl = '/iam/v1/users/' + userId + '.json';
    console.log("userUrl = " + userUrl);

    axios.get(userUrl).then(function(response) {

        if (response.status == 200) {
            let user    = {};
            user.id     = response.data.user.id;
            user.name   = response.data.user.name;
            user.img    = response.data.user.avatar;

            let session = state.sessions.find(session => session.user.id === user.id);
            if (session == null) {
                console.log('Session not exist.');
                dispatch('addSession', user, true);
            } else {
                console.log('Session is exist.');
                commit(types.SELECT_SESSION, session.id);
            }
        }
    }).catch(function(error) {
        console.log(error);
    });
}

