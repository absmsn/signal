<template>
  <div class="chat-page">
    <div class="side-area">
      <div class="operation-bar">
        <div class="button-area">
          <router-link to="/join-session">
            <a-button icon="plus" />
          </router-link>
        </div>
      </div>
      <session-list class="session-area"></session-list>
    </div>
    <chat-area class="chat-area" v-if="!mobileMode"></chat-area>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import Vue from "vue";
import SessionList from "./SessionList";
import ChatArea from "./ChatArea";
import { checkMobileMode, debounce } from "../../utils/lib";
import { Button } from "ant-design-vue";

Vue.use(Button);

export default {
  name: "chat-page",
  components: {
    ChatArea,
    SessionList
  },
  mounted() {
    window.addEventListener("resize", debounce(this.setMobileMode, 500));
  },
  destroyed() {
    window.removeEventListener("resize", this.setMobileMode);
  },
  methods: {
    setMobileMode() {
      let mobileMode = checkMobileMode();
      this.$store.commit("setMobileMode", mobileMode);
    }
  },
  computed: {
    ...mapState(["mobileMode", "sessions", "activeSession"])
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/public.scss";

.chat-page {
  display: flex;
  height: 100vh;
  .side-area {
    flex: 1 0 256px;
    box-shadow: 0 0 10px #cfcfcf;
    border-right: 1px solid #cfcfcf;
    .operation-bar {
      border-bottom: 1px solid #bfbfbf;
      button {
        margin: 6px;
        // float: right;
      }
    }
    .session-area {
    }
  }
  .chat-area {
    flex: 10 0 auto;
  }
}
</style>