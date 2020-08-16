<template>
  <div class="join-session">
    <div class="header">
      <div class="back-home-btn">
        <router-link to="/sessions" class="centered" style="display: block;">
          <a-icon type="left" />
        </router-link>
      </div>
      <div class="page-name">创建新的会话</div>
    </div>
    <div class="content">
      <a-radio-group v-model="tokenType">
        <a-radio-button value="char">字符</a-radio-button>
        <a-radio-button value="file">文件</a-radio-button>
      </a-radio-group>
      <div class="char-token-area" v-if="tokenType === 'char'">
        <!-- <input v-model="charToken" /> -->
        <multi-char-input @change="charToken = $event" @enter="joinSession" />
      </div>
      <div class="file-token-area" v-else>
        <a-upload
          :file-list="fileToken"
          :remove="handleRemoveFile"
          :beforeUpload="handleBeforeUpload"
        >
          <a-button>
            <a-icon type="upload" />选择一个文件
          </a-button>
        </a-upload>
      </div>
      <div>
        <a-button type="primary" :disabled="checkTokenNull" @click="joinSession">添加会话</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import md5 from "blueimp-md5";
import MultiCharInput from "@/components/MultiCharInput";
import { Radio, Upload, Button } from "ant-design-vue";
Vue.use(Upload);
Vue.use(Radio);

export default {
  name: "join-session",
  data() {
    return {
      tokenType: "char",
      charToken: "",
      fileToken: [],
    };
  },
  components: {
    MultiCharInput
  },
  methods: {
    // 向服务器请求添加会话
    joinSession() {
      // 网络已断开或未申请到userID
      if (!this.$store.state.userID || !this.$store.state.online) {
        this.$message.warn("网络已断开，请稍后重试");
        return;
      }

      let handleAdd = (token, hashToken, type) => {
        let userID = this.$store.state.userID;

        let i = this.$store.state.sessions.findIndex(
          (x) => x.sessionID === hashToken
        );

        if (i !== -1) {
          this.$message.error("会话已存在!");
          return;
        }

        this.$socket.client.emit("joinSession", {
          userID: userID,
          token: token,
          sessionID: hashToken,
          tokenType: type,
        });
      };

      // 获取字符串或文件内容的hash值
      let maxFileSize = 1024 * 2048;
      if (this.tokenType === "char") {
        let hashToken = md5(this.charToken);
        handleAdd(this.charToken, hashToken, "char");
      } else {
        let file = this.fileToken[0];
        if (file.size > maxFileSize) {
          this.$message.error(`文件大小不能超过${maxFileSize}`);
          return;
        }

        let reader = new FileReader();
        reader.onload = (e) => {
          let content = e.target.result;
          let hashToken = md5(content);
          handleAdd(file.name, hashToken, "file");
        };
        reader.readAsBinaryString(file);
      }
    },
    // 移除已选择的token文件时的动作
    handleRemoveFile(file) {
      let index = this.fileToken.indexOf(file);
      this.fileToken.splice(index, 1);
    },
    // 文件上传前的动作，返回false组织文件上传
    handleBeforeUpload(file) {
      this.fileToken = [...this.fileToken, file];
      return false;
    },
    getColorFromStr(str){
      if(typeof str !== 'string') return
      if(str.length < 6) return str.padStart(6, "0")

      let subStr = str.slice(str.length-6, str.length)
      return "#" + subStr
    }
  },
  sockets: {
    joinResult(data) {
      if (data.sessionStatus === "joined") {

        if (data.messages) {
          for (let msg of data.messages) {
            this.$socket.client.emit("ackn", {
              userID: msg.userID,
              sessionID: msg.sessionID,
              msgID: msg.msgID,
            });
            msg.source = "peer";
            if (msg.sendTime) {
              msg.sendTime = new Date(msg.sendTime);
            }
          }
        }
        data.color = this.getColorFromStr(data.sessionID)
        this.$store.commit("joinSession", data);
        if (!this.$store.activeSession) {
          this.$store.commit("setActiveSession", data.sessionID);
        }
        this.$router.push("sessions");
      } else if (data.sessionStatus === "full") {
        this.$message.error("会话已满，不能加入!");
        // this.charToken = "";
        this.fileToken = [];
      }
    },
  },
  computed: {
    checkTokenNull() {
      if (this.tokenType === "char") {
        return this.charToken === "";
      } else {
        return this.fileToken.length === 0;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../assets/css/public.scss";

.join-session {
  .header {
    $barHeight: 48px;
    height: $barHeight;
    box-shadow: 0 0 10px #cfcfcf;
    .back-home-btn {
      float: left;
      text-align: center;
      width: $barHeight;
      height: $barHeight;
    }
    .page-name {
      float: left;
      line-height: $barHeight;
    }
  }
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 60px;
    .char-token-area, .file-token-area {
      width: 400px;
      margin: 40px 0;
      max-width: 100%;
      text-align: center;
      > div {
        justify-content: center;
      }
    }
  }
}
</style>