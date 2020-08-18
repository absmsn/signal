<template>
  <div class="session-list">
    <div
      v-for="(session, i) in sessions"
      :class="['session-item', {
        'active-session': session.sessionID === activeSession.sessionID
      }]"
      :key="session.sessionID"
      @click="switchChatBox(session)"
    >
      <user-avatar class="avatar-area" :color="session.color" :text="session.token[0]"></user-avatar>
      <div class="session-name">{{ session.token }}</div>
      <div class="last-msg-overview">{{ lastMsgs[i]?lastMsgs[i].msg:"" }}</div>
      <div class="unread-count-area">
        <div
          v-if="session.unreadCount !== 0"
          class="unread-count centered centered-text"
        >{{ session.unreadCount > 99 ? 99 : session.unreadCount}}</div>
      </div>
      <div class="send-time">{{ lastMsgs[i]?lastMsgs[i].sendTime:"" | toDateOrTime}}</div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import UserAvatar from "@/components/UserAvatar";

export default {
  name: "session-list",
  components: {
    UserAvatar,
  },
  data() {
    return {};
  },
  methods: {
    switchChatBox(session) {
      session.unreadCount = 0;
      // 如果点击的不是当前的活跃会话
      if (session.sessionID !== this.activeSession.sessionID) {
        this.$store.commit("setActiveSession", session.sessionID);
      }
      if (this.$store.state.mobileMode) {
        this.$router.push("/chat");
      }
    },
  },
  computed: {
    ...mapState(["sessions", "activeSession"]),
    ...mapGetters({
      lastMsgs: "getLastMessages",
    }),
  },
  filters: {
    // 如果时间是今天的，返回时间，否则返回日期
    toDateOrTime(date) {
      if (!date) return "";
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      let now = new Date();
      if (now.getYear() !== now.getYear()) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      } else if (
        now.getMonth() !== date.getMonth() ||
        now.getDate() !== date.getDate()
      ) {
        return `${date.getMonth() + 1}-${date.getDate()}`;
      } else {
        return `${String(date.getHours()).padStart(2, "0")}:${String(
          date.getMinutes()
        ).padStart(2, "0")}`;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../assets/css/public.scss";

.session-list {
  .active-session {
    background-color: #efefef;
  }
  .session-item {
    display: grid;
    $itemHeight: 60px;
    height: $itemHeight;
    grid-template-rows: repeat(2, 50%);
    grid-template-columns: $itemHeight auto $itemHeight;
    grid-auto-flow: column;
    &:hover {
      cursor: pointer;
      background-color: #efefef;
    }
    .avatar-area {
      grid-row: span 2;
      grid-column: 1;
    }
    .session-name,
    .last-msg-overview {
      padding: 0 10px;
      place-self: center start;
      overflow: hidden;
      text-overflow: ellipsis;
      //防止文本溢出格子容器
      max-width: 100%;
      white-space: nowrap;
    }
    .session-name {
      font-weight: 700;
    }
    .last-msg-overview {
      color: #7f7f7f;
    }
    .unread-count-area {
      $countSize: 18px;
      .unread-count {
        width: $countSize;
        color: white;
        background-color: red;
        border-radius: 50%;
        line-height: $countSize;
        font-size: 12px;
      }
    }
    .send-time {
      place-self: center;
      font-weight: 700;
      font-size: 12px;
    }
  }
}
</style>