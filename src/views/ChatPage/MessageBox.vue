<template>
  <ul class="message-list">
    <li v-for="(message,i) in messages" :key="i" :style="getRowDirectionStyle(message.source)">
      <!--消息所在的日期-->
      <i class="message-time-day" v-if="firstMsgOfDay(i)">{{ message.sendTime | toDate }}</i>
      <div class="message-item">
        <div class="user-avatar-area">
          <div class="user-avatar">{{ message.source === "self"?"我":"" }}</div>
        </div>
        <a-dropdown :trigger="['contextmenu']" class="message-body">
          <text-msg
            v-if="message.msgType === 'text'"
            :orientation="getMessageOrientation(message.source)"
            :message="message"
          ></text-msg>
          <a-menu slot="overlay">
            <!-- <div>没有msgID时使用localMsgID</div> -->
            <a-menu-item
              :key="i+'_1'"
              @click="pasteTextToBoard(message.msg)"
              v-if="message.msgType === 'text'"
            >复制消息文本</a-menu-item>
            <a-menu-item :key="i+'_2'">删除消息</a-menu-item>
            <a-menu-item :key="i+'_3'" v-if="message.msgStatus === 'cached'">撤回消息</a-menu-item>
          </a-menu>
        </a-dropdown>
        <div class="send-time">{{ message.sendTime | toTime }}</div>
        <div class="msg-status">
          <img src="../../assets/img/cached.svg" v-if="message.msgStatus === 'cached'" />
          <img src="../../assets/img/sending.svg" v-else-if="message.msgStatus === 'sending'" />
          <img src="../../assets/img/received.svg" v-else-if="message.msgStatus === 'received'" />
          <img
            src="../../assets/img/waiting.svg"
            v-else-if="message.msgStatus === 'send_waiting' || message.msgStatus === 'msgID_waiting'"
          />
        </div>
      </div>
    </li>
  </ul>
</template>

<script>
import { mapState } from "vuex";
import TextMsg from "@/components/TextMsg";

export default {
  name: "message-box",
  props: ["messages"],
  components: {
    TextMsg,
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
  },
  computed: {
    ...mapState(["mobileMode"]),
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
    messages() {
      this.$nextTick(() => {
        this.$el.scrollTo(0, this.$el.scrollHeight);
      });
    },
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
      display: flex;
      justify-content: center;
      align-items: center;
      .user-avatar {
        text-align: center;
        $avatarSize: 32px;
        height: $avatarSize;
        width: $avatarSize;
        line-height: $avatarSize;
        font-weight: 700;
        border-radius: 50%;
        background-color: yellow;
      }
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