<template>
  <div class="multi-char-input">
    <div class="single-token-area" v-for="(token,i) in tokenArray" :key="i">
      <input
        type="text"
        class="token-input-box"
        v-model="tokenArray[i]"
        @input="inputChanged(i,tokenArray[i])"
        @paste="inputChanged(i,tokenArray[i])"
        @keyup.enter="handleEnterPressed"
        :ref="i"
        size="10"
        v-focus="true"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "multi-char-input",
  data() {
    return {
      tokenArray: [" "],
    };
  },
  directives: {
    focus: {
      inserted: function (el, { value }) {
        if (value) {
          el.focus();
        }
      },
    },
  },
  methods: {
    inputChanged(index, item) {
      if (item === "") {
        // 删除某个元素
        if (index === this.tokenArray.length - 1) {
          this.tokenArray.pop();
          this.tokenArray.push(" ");
        } else {
          this.tokenArray.splice(index, 1);
        }
        if (this.tokenArray.length > 0) {
          if (index > 0) {
            this.$refs[index - 1][0].focus();
          }
        }
      } else {
        let arr = item.split("");
        if (arr.length > 0) {
          if (index === this.tokenArray.length - 1) {
            // 因为输入框在初始化时默认加入了一个空格,所以无论如何在input的value内至少有一个
            if (arr[0] === " ") {
              // 空格,这些都要去掉,但是在输入中文时,输入法会传递一个
              arr.shift();
            } else if (arr[arr.length - 1] === " ") {
              arr.pop();
            }
          }

          this.tokenArray.pop();
          this.tokenArray.splice(index, 1, ...arr);
          this.tokenArray.push(" ");
        }
        this.$emit("change", this.tokenArray.join("").trim())
      }
    },
    handleEnterPressed() {
      this.$emit("enter")
    },
  },
};
</script>

<style scoped lang="scss">
.multi-char-input {
  display: flex;
  flex-wrap: wrap;
  justify-items: center;
  align-content: flex-start;
  .token-input-box {
    width: 36px;
    height: 36px;
    font-size: 20px;
    text-align: center;
    border: 1px solid black;
    margin: 10px;
    border-radius: 20%;
    outline: none;
  }
}
</style>