import Vue from 'vue'
import Vuex from 'vuex'
import {
  checkMobileMode
} from '../utils/lib'

Vue.use(Vuex)

let mobileMode = checkMobileMode()

let getSessionByID = (state, sessionID) => {
  return state.sessions.find(x => x.sessionID === sessionID)
}

const store = new Vuex.Store({
  state: {
    mobileMode: mobileMode,
    sessions: [],
    activeSession: null,
    userID: null,
    localMsgID: 0,
    online: true // 是否联网
  },
  mutations: {
    // 参数最多两个
    setMobileMode(state, mobileMode) {
      state.mobileMode = mobileMode
    },
    setActiveSession(state, sessionID) {
      let session = getSessionByID(state, sessionID)
      if (session) {
        state.activeSession = session
      }
    },
    setOnlineStatus(state, onlineStatus) {
      state.online = onlineStatus
    },
    setPeerStatus(state, {
      sessionID,
      peerStatus
    }) {
      let session = getSessionByID(state, sessionID)
      if (session) {
        session.peerStatus = peerStatus
      }
    },
    setSessionStatus(state, {
      sessionID,
      sessionStatus
    }) {
      let session = getSessionByID(state, sessionID)
      if (session) {
        session.sessionStatus = sessionStatus
      }
    },
    joinSession(state, session) {
      state.sessions.push(
        Object.assign({
          unreadCount: 0,
          messages: [],
          offlines: []
        }, session)
      )
    },
    quitSession(state, sessionID) {
      let i = state.sessions.findIndex(x => x.sessionID === sessionID)
      if (i !== -1) {
        state.sessions.splice(i, 1)
        if (state.sessions.length > 0) {
          state.activeSession = state.sessions[0]
        } else {
          state.activeSession = null
        }
      }
    },
    setUserID(state, userID) {
      state.userID = userID
    },
    pushMessage(state, msg) {
      let session = getSessionByID(state, msg.sessionID)

      if (session) {
        session.messages.push(msg)
        if (msg.source === "peer") {
          if (msg.sessionID !== state.activeSession.sessionID) {
            session.unreadCount++
          }
        }
      }
    },
    pushOfflines(state, {
      sessionID,
      offlines
    }) {
      let session = getSessionByID(state, sessionID)
      if (session) {
        session.offlines = session.offlines.concat(offlines)
      }
    },
    clearOffline(state, {
      sessionID,
      msgID
    }) {
      let session = getSessionByID(state, sessionID)
      if (session) {
        let i = session.offlines.findIndex(x => x.msgID === msgID)
        if (i !== -1) {
          session.offlines.splice(i, 1)
        }
      }
    },
    clearOfflines(state, sessionID) {
      let session = getSessionByID(state, sessionID)
      if (session) {
        session.offlines = []
      }
    },
    clearMessage(state, {
      sessionID,
      msgID
    }){
      let session = getSessionByID(state, sessionID)
      if (session) {
        let i = session.messages.findIndex(x => x.msgID === msgID)
        if (i !== -1) {
          session.messages.splice(i, 1)
        }
      }
    }
  },
  actions: {},
  getters: {
    getLastMessages: (state) => {
      return state.sessions.map(x => x.messages[x.messages.length - 1])
    },
    getSessionByID: (state) => (sessionID) => {
      return getSessionByID(state, sessionID)
    },
    getMessageByMsgID: (state) => (sessionID, msgID) => {
      let session = state.sessions.find(x => x.sessionID === sessionID)
      if (session) {
        let msg = session.messages.find(x => x.msgID === msgID)
        return msg
      }
    },
    getMessageByLocalMsgID: state => (sessionID, localMsgID) => {
      let session = state.sessions.find(x => x.sessionID === sessionID)
      if (session) {
        let msg = session.messages.find(x => x.localMsgID === localMsgID)
        return msg
      }
    }
  }
})

export default store
