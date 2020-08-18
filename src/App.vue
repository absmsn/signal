<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { Modal } from "ant-design-vue";
import { mapState, mapGetters } from "vuex";
import { checkMobileMode } from "./utils/lib";

export default {
  name: "App",
  mounted() {
    // FIXME:解决移动端因为防抖造成的问题
    window.addEventListener("resize", this.setMobileMode);
  },
  destroyed() {
    window.removeEventListener("resize", this.setMobileMode);
  },
  methods: {
    setMobileMode() {
      let mobileMode = checkMobileMode();
      if (mobileMode !== this.mobileMode) {
        this.$store.commit("setMobileMode", mobileMode);
      }
    },
    handleMsgN(msg) {
      this.$socket.client.emit("ackn", {
        userID: msg.userID,
        sessionID: msg.sessionID,
        msgID: msg.msgID,
      });
      msg.source = "peer";
      if (msg.userID) {
        delete msg.userID;
      }
      if (msg.sendTime) {
        msg.sendTime = new Date(msg.sendTime);
      }
      this.$store.commit("pushMessage", msg);
    },
  },
  computed: {
    ...mapState(["mobileMode", "sessions", "activeSession"]),
  },
  sockets: {
    userID(userID) {
      this.$store.commit("setUserID", userID);
    },
    connect() {
      this.$store.commit("setOnlineStatus", true);
      let userID = this.$store.state.userID;
      let sessions = this.$store.state.sessions;

      if (userID) {
        sessions = sessions.map((s) => {
          return {
            sessionID: s.sessionID,
            joinTime: s.joinTime,
          };
        });

        this.$socket.client.emit("rejoin", {
          userID: userID,
          sessions: sessions,
        });
      } else {
        this.$socket.client.emit("getUserID");
      }
    },
    disconnect() {
      this.$store.commit("setOnlineStatus", false);
    },
    peerStatus(msg) {
      this.$store.commit("setPeerStatus", msg);
    },
    rejoinResults(results) {
      for (let result of results) {
        // 成功加入
        if (result.result === "joined") {
          // 是否有离线消息
          if (result.offlines) {
            this.$store.commit("pushOfflines", {
              sessionID: result.sessionID,
              offlines: result.offlines,
            });
          }
          if (result.messages) {
            for (let msg of result.messages) {
              this.handleMsgN(msg);
            }
          }
        } else {
          this.$store.commit("setSessionStatus", {
            sessionID: result.sessionID,
            sessionStatus: "rejoinRejected",
          });
        }
        this.$store.commit("setPeerStatus", {
          sessionID: result.sessionID,
          peerStatus: result.peerStatus,
        });
      }
      // 对那些因网络中断暂停发送的消息，开始投递
      let sessions = this.$store.state.sessions;
      for (let session of sessions) {
        if (session.sessionStatus !== "rejoinRejected") {
          let waiting = session.messages.filter(
            (x) => x.msgStatus === "send_waiting"
          );
          for (let msg of waiting) {
            this.$socket.client.emit("getMsgID", {
              sessionID: session.sessionID,
              localMsgID: msg.localMsgID,
            });
            this.$set(msg, "msgStatus", "msgID_waiting");
          }
        } else {
          let token = session.token;
          Modal.confirm({
            title: "没能重新加入会话",
            content: `没能重新加入会话 ${token}, 有其他人加入了你所在的会话`,
            okText: "我已明白",
          });
        }
      }
    },
    msgID(msg) {
      let message = this.$store.getters.getMessageByLocalMsgID(
        msg.sessionID,
        msg.localMsgID
      );

      // TODO:各种消息的等待队列
      if (message) {
        message.msgID = msg.msgID;
        this.$socket.client.emit("msgr", {
          msg: message.msg,
          msgID: message.msgID,
          msgType: message.msgType,
          sessionID: message.sessionID,
          userID: this.$store.state.userID,
        });
        this.$set(message, "msgStatus", "sending");
      }
    },
    ackr(msg) {
      let obj = {
        msgStatus: msg.msgStatus,
      }
      if(msg.sendTime){
        obj.sendTime = new Date(msg.sendTime)
      }
      this.$store.commit("updateMessage", {
        sessionID: msg.sessionID,
        msgID: msg.msgID,
        object: obj
      });
    },
    msgn(msg) {
      this.handleMsgN(msg);
    },
    acka(msg) {
      // FIXME:操作太快属性不更新
      this.$store.commit("updateMessage", {
        sessionID: msg.sessionID,
        msgID: msg.msgID,
        object: {
          msgStatus: "received",
        },
      });
    },
    pushOfflines(sessions) {
      for (let session of sessions) {
        this.$store.commit("pushOfflines", session.sessionID, session.offlines);
      }
    },
    recallResult(result) {
      if (result.result && result.result === "successed") {
        this.$store.commit("clearMessage", {
          msgID: result.msgID,
          sessionID: result.sessionID,
        });
      } else {
        this.$store.commit("updateMessage", {
          sessionID: result.sessionID,
          msgID: result.msgID,
          object: {
            msgStatus: "recall_failed",
          },
        });
      }
    },
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}
ul,
li {
  margin: 0;
  padding: 0;
  list-style: none;
}
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}
</style>
