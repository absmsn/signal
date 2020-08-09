<template>
  <div class="text-msg">
    <div :class="[orientation==='left'?'text-msg-left':'text-msg-left']">{{ message.msg }}</div>
  </div>
</template>

<script>
export default {
  name: "text-msg",
  props: {
    message: Object,
    orientation: {
      default: "none",
    },
  },
  methods: {},
};
</script>

<style scoped lang="scss">
.text-msg-left,
.text-msg-right {
  display: inline-block;
  background-color: aquamarine;
  border-radius: 6px;
  position: relative;
  padding: 6px;
  word-break: break-all;
}
.text-msg-left {
  &::before {
    top: 50%;
    content: "";
    height: 20px;
    width: 20px;
    background-color: aquamarine;
    position: absolute;
    z-index: -1;
    transform: translate(-40%, -50%) rotate(45deg);
  }
}
.text-msg-right {
  &::after {
    top: 50%;
    right: 0;
    content: "";
    height: 20px;
    width: 20px;
    background-color: aquamarine;
    position: absolute;
    z-index: -1;
    transform: translate(10%, -50%) rotate(45deg);
  }
}
</style>