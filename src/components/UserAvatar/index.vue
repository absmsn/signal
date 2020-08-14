<template>
  <div class="user-avatar">
    <div
      class="avatar"
      :style="{'background-color':color, 'color':getContrastColor(color)}"
    >{{text}}</div>
  </div>
</template>

<script>
export default {
  name: "user-avatar",
  props: {
    color: {
      type: String,
      default: "green",
    },
    text: {
      type: String,
      default: ""
    },
  },
  methods: {
    getContrastColor(color) {
      if (typeof color !== "string" || !color.startsWith("#")) return;
      color = Number.parseInt(color.replace("#", ""), 16);
      return color > 0xffffff / 2 ? "black" : "white";
    },
  },
};
</script>

<style scoped lang="scss">
.user-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  .avatar {
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
</style>