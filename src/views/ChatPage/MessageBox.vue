<template>
  <ul class="message-list">
    <li v-for="(message,i) in messages" :key="i" :style="getRowDirectionStyle(message.source)">
      <!--消息所在的日期-->
      <i class="message-time-day" v-if="firstMsgOfDay(i)">{{ message.sendTime | toDate }}</i>
      <div class="message-item">
        <user-avatar
          class="user-avatar-area"
          :text="message.source === 'self'?'我':''"
          :color="activeSession.color"
        ></user-avatar>
        <a-dropdown :trigger="['contextmenu']" class="message-body">
          <text-msg
            v-if="message.msgType === 'text'"
            :orientation="getMessageOrientation(message.source)"
            :message="message"
          ></text-msg>
          <a-menu slot="overlay">
            <!-- 没有msgID时使用localMsgID -->
            <a-menu-item
              :key="i+'_1'"
              @click="pasteTextToBoard(message.msg)"
              v-if="message.msgType === 'text'"
            >复制消息文本</a-menu-item>
            <a-menu-item :key="i+'_2'">删除消息</a-menu-item>
            <a-menu-item
              :key="i+'_3'"
              v-if="message.msgStatus === 'cached'"
              @click="recallOffline(message)"
            >撤回消息</a-menu-item>
          </a-menu>
        </a-dropdown>
        <div class="send-time">{{ message.sendTime | toTime }}</div>
        <div class="msg-status">
          <img src="../../assets/img/cached.svg" v-if="message.msgStatus === 'cached'" title="已缓存" />
          <img
            src="../../assets/img/sending.svg"
            v-else-if="message.msgStatus === 'sending'"
            title="发送中"
          />
          <img
            src="../../assets/img/received.svg"
            v-else-if="message.msgStatus === 'received'"
            title="对端收到"
          />
          <img
            src="../../assets/img/waiting.svg"
            v-else-if="message.msgStatus === 'send_waiting' || message.msgStatus === 'msgID_waiting'"
            title="等待发送"
          />
        </div>
      </div>
      <!-- 何时提示消息以缓存 -->
      <div class="centered-text" v-if="lastCachedMsg(i)">
        <a-tag color="cyan">对方离线,消息已缓存</a-tag>
      </div>
      <!-- 提示撤回消息失败 -->
      <div class="centered-text" v-if="message.msgStatus === 'recall_failed'">
        <a-tag color="red">消息撤回失败</a-tag>
      </div>
    </li>
  </ul>
</template>

<script>
import Vue from 'vue'
import { mapState } from "vuex";
import TextMsg from "@/components/TextMsg";
import UserAvatar from "@/components/UserAvatar";
import { Tag } from 'ant-design-vue'

Vue.use(Tag)

export default {
  name: "message-box",
  props: ["messages"],
  components: {
    TextMsg,
    UserAvatar,
  },
  methods: {
    getRowDirectionStyle(source) {
      let direction;
      if (source === "self" && this.mobileMode) {
        direction = "row-reverse";
      } else {
        direction = "row";
      }
      return {
        "flex-direction": direction,
      };
    },
    getMessageOrientation(source) {
      let orientation;
      if (source === "self" && this.mobileMode) {
        orientation = "right";
      } else {
        orientation = "left";
      }
      return orientation;
    },
    // 检查某消息是否为当天的第一条消息
    firstMsgOfDay(i) {
      if (i === 0) {
        return true;
      } else {
        let last = this.messages[i - 1].sendTime.toLocaleDateString();
        let cur = this.messages[i].sendTime.toLocaleDateString();
        return last !== cur;
      }
    },
    // 检查是否为会话中最后一个缓存消息，若是，则显示提示信息
    lastCachedMsg(i) {
      // 非缓存消息
      if (this.messages[i].msgStatus !== "cached") return false;
      // 最后一个消息
      if (i === this.messages.length - 1) return true;
      return this.messages[i + 1].msgStatus !== "cached";
    },
    // 将文本消息的内容复制到剪切板
    pasteTextToBoard(text) {
      let input = document.createElement("input");
      document.body.appendChild(input);
      input.setAttribute("value", text);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      this.$message.success("复制成功");
    },
    // 撤回消息
    recallOffline(msg) {
      this.$socket.client.emit("recallOffline", {
        msgID: msg.msgID,
        sessionID: this.activeSession.sessionID,
      });
    },
  },
  computed: {
    ...mapState(["mobileMode", "activeSession"]),
  },
  filters: {
    toTime(date) {
      if (!date) return "";
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      return `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
    },
    toDate(date) {
      if (!date) return "";
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
  },
  watch: {
    // messages(newVals, oldVals) {
    //   this.$nextTick(() => {
    //     this.$el.scrollTo(0, this.$el.scrollHeight);
    //   });
    // },
  },
};
</script>

<style scoped lang="scss">
@import "../../assets/css/public.scss";

@keyframes message-popout {
  0% {
    top: 20px;
    opacity: 0;
  }
  100% {
    top: 0px;
  }
}
.message-list {
  height: 100%;
  // 这里与它的父容器都需要设置该属性
  overflow-y: auto;
  padding-top: 10px;
  .message-time-day {
    display: block;
    text-align: center;
    font-size: 12px;
    font-weight: 700;
  }
  .message-item {
    display: grid;
    align-items: center;
    position: relative;
    margin: 10px 0;
    grid-auto-flow: column;
    justify-content: start;
    grid-template-rows: repeat(2, 50%);
    grid-template-columns: repeat(3, auto);
    animation: message-popout 0.5s ease-in 0s;
    .user-avatar-area {
      grid-row: span 2;
      margin: 0 10px;
    }
    .message-body {
      grid-row: span 2;
      user-select: none;
      max-width: 15rem;
    }
    .send-time {
      font-size: 12px;
      font-weight: 700;
      align-self: start;
    }
    .msg-status,
    .send-time {
      margin-left: 6px;
    }
    .msg-status {
      place-self: end center;
      img {
        height: 12px;
      }
    }
  }
}
</style>