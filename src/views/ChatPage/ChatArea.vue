<template>
  <div class="chat-area">
    <div v-if="activeSession !== null">
      <div class="top-operation-area">
        <div class="back-home-btn">
          <router-link to="/sessions" class="centered" v-show="mobileMode">
            <a-icon type="left" />
          </router-link>
        </div>
        <div :title="activeSession.token" class="session-name">{{ activeSession.token }}</div>
        <div class="peer-status">
          <div
            :style="{
            'background-color':activeSession.peerStatus?'green':'red'
          }"
            :title="activeSession.peerStatus?'对方在线':'对方离线'"
          ></div>
        </div>
        <div class="detailed-operation">
          <a-dropdown :trigger="['click']" placement="bottomRight">
            <div>
              <a-icon type="more" />
            </div>
            <a-menu slot="overlay">
              <a-menu-item>
                <div @click="quitSession">关闭会话</div>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </div>
      <!--  -->
      <div
        :class="['message-area', {
          'gray-view':session.sessionStatus === 'rejoinRejected'
        }]"
        :key="session.sessionID"
        v-for="session in sessions"
        v-show="session.sessionID === activeSession.sessionID"
      >
        <message-box :messages="session.messages" />
        <offline-box
          :offlines="session.offlines"
          v-if="session.offlines.length > 0"
          class="offline-box"
        />
      </div>
      <div class="edit-area">
        <div class="msg-input-area">
          <input
            v-model="currentText"
            @keyup.enter.prevent="sendTextMsg"
            autofocus
            :disabled="activeSession.sessionStatus==='rejoinRejected'"
          />
          <img src="../../assets/img/send.svg" @click="sendTextMsg" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import { Icon, Dropdown, Menu } from "ant-design-vue";
import MessageBox from "./MessageBox";
import OfflineBox from "./OfflineBox";

Vue.use(Icon);
Vue.use(Dropdown);
Vue.use(Menu);


export default {
  name: "chat-area",
  data() {
    return {
      currentText: "",
    };
  },
  components: {
    MessageBox,
    OfflineBox,
  },
  computed: {
    ...mapState(["mobileMode", "activeSession", "sessions"]),
  },
  watch: {
    mobileMode: function (prev, cur) {
      if (prev === true && cur === false) {
        this.$router.replace("/sessions");
      }
    },
  },
  methods: {
    sendTextMsg() {
      if (this.currentText === "") return;
      let msg = {
        userID: this.$store.state.userID,
        sessionID: this.activeSession.sessionID,
        msg: this.currentText,
        msgType: "text",
        localMsgID: this.$store.state.localMsgID,
        source: "self",
        sendTime: new Date(),
      };
      this.currentText = "";

      let online = this.$store.state.online;
      msg.msgStatus = online ? "msgID_waiting" : "send_waiting";

      this.$store.commit("pushMessage", msg);

      if (online) {
        this.$socket.client.emit("getMsgID", {
          sessionID: this.activeSession.sessionID,
          localMsgID: this.$store.state.localMsgID,
        });
      }
      // 本地消息ID自增
      this.$store.state.localMsgID++;
    },
    quitSession() {
      this.$socket.client.emit("quitSession", {
        sessionID: this.activeSession.sessionID,
        userID: this.$store.state.userID,
      });
      this.$store.commit("quitSession", this.activeSession.sessionID);

      if (this.mobileMode) {
        this.$router.replace("/sessions");
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../assets/css/public.scss";

.chat-area {
  height: 100%;
  > div {
    display: flex;
    flex-direction: column;
    height: 100%;
    .top-operation-area {
      $barHeight: 48px;
      flex: 0 0 $barHeight;
      box-shadow: 0 0 10px #cfcfcf;
      border-bottom: 1ps solid #dfdfdf;
      display: flex;
      .back-home-btn {
        flex: 0 0 $barHeight;
        text-align: center;
      }
      $peerAreaSize: 16px;
      .session-name {
        flex: 1 0 auto;
        text-align: center;
        line-height: $barHeight;
        font-weight: 700;
        margin-right: -$peerAreaSize;
      }
      .peer-status {
        display: flex;
        flex-basis: $peerAreaSize;
        align-items: center;
        justify-content: center;
        div {
          $dotSize: 10px;
          height: $dotSize;
          width: $dotSize;
          border-radius: 50%;
        }
      }
      .detailed-operation {
        display: flex;
        flex: 0 0 48px;
        justify-content: center;
        align-items: center;
        > div {
          padding: 4px 8px;
          &:hover {
            background-color: #f2f2f2;
            border-radius: 4px;
          }
        }
      }
    }
    .gray-view {
      filter: grayscale(1);
    }
    .message-area {
      overflow-y: hidden;
      flex: 1 1 auto;
      position: relative;
      > .offline-box {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: 1;
        background-color: rgba(255, 255, 255, 0.8);
      }
    }
    .edit-area {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      .msg-input-area {
        position: relative;
        margin: 8px 0;
        input {
          // 去掉默认样式
          outline: none;
          border: 1px solid rgb(255, 255, 255); //
          border-radius: 30px;
          padding: 5px 10px;
          box-shadow: 0px 0px 10px #cfcfcf;
          width: 20rem;
          max-width: 100%;
          &:disabled {
            box-shadow: unset;
          }
        }
        img {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          height: 24px;
        }
      }
    }
  }
}
</style>