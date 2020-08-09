<template>
  <div class="offline-box">
    <div class="offline-list">
      <div class="offline-item" v-for="offline of offlines" :key="offline.msgID">
        <div class="send-time">{{ offline.sendTime | toDateTime}}</div>
        <div class="offline-body">
          <text-msg v-if="offline.msgType === 'text'" orientation="left" :message="offline"></text-msg>
        </div>
        <div class="offline-operation-area">
          <a-icon
            type="close"
            class="offline-operation-button"
            title="移除消息"
            @click="clearOffline(offline.msgID)"
          />
          <a-icon
            type="delete"
            class="offline-operation-button"
            title="从远程服务器删除"
            @click="removeOffline(offline.msgID)"
          />
        </div>
      </div>
    </div>
    <div class="all-operation-area">
      <span>
        <a-icon
          type="close"
          class="offline-operation-button"
          title="移除所有消息"
          @click="clearOfflines"
        />
        <a-icon
          type="delete"
          class="offline-operation-button"
          title="从远程服务器删除"
          @click="removeOfflines"
        />
      </span>
    </div>
  </div>
</template>

<script>
import TextMsg from "@/components/TextMsg";
import { Icon } from "ant-design-vue";

export default {
  name: "offline-box",
  props: ["offlines"],
  components: {
    TextMsg,
  },
  methods: {
    // 从远程服务器删除一条离线消息
    removeOffline(msgID) {
      this.clearOffline(msgID);
      this.$socket.client.emit("removeOffline", msgID);
    },
    clearOffline(msgID) {
      this.$store.commit("clearOffline", {
        msgID: msgID,
        sessionID: this.$store.state.activeSession.sessionID,
      });
    },
    clearOfflines() {
      this.$store.commit(
        "clearOfflines",
        this.$store.state.activeSession.sessionID
      );
    },
    // 删除一个会话里，在某个时间区间里的离线消息
    removeOfflines() {
      if (this.offlines.length > 0) {
        let startTime = this.offlines[0].sendTime;
        let endTime = this.offlines[this.offlines.length - 1].sendTime;
        this.$store.commit(
          "clearOfflines",
          this.$store.state.activeSession.sessionID
        );
        this.$socket.client.emit("removeOfflines", {
          startTime: startTime,
          endTime: endTime,
          sessionID: this.$store.state.activeSession.sessionID,
        });
      }
    },
  },
  filters: {
    toDateTime(sendTime) {
      if (!(sendTime instanceof Date) && typeof sendTime === "string") {
        sendTime = new Date(sendTime);
        return `${sendTime.toLocaleDateString()} ${sendTime.getHours()}:${sendTime.getMinutes()}:${sendTime.getSeconds()}`;
      } else return "";
    },
  },
};
</script>

<style lang="scss" scoped>
@mixin hover-icon-btn {
  .offline-operation-button {
    padding: 4px;
    &:hover {
      background-color: #efefef;
      border-radius: 4px;
    }
  }
}
.offline-box{
  overflow-y: scroll;
  .offline-list {
  .offline-item {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
    .send-time {
      flex: 1 0 0;
      color: blueviolet;
      text-align: right;
    }
    .offline-body {
      margin: 0 10px 0 15px;
    }
    .offline-operation-area {
      flex: 1 0 0;
      @include hover-icon-btn;
    }
  }
}
.all-operation-area {
  text-align: center;
  span {
    @include hover-icon-btn;
  }
}
}
</style>