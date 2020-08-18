// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import io from 'socket.io-client'
import VueSocketIOExt from 'vue-socket.io-extended'
import { message, notification } from 'ant-design-vue'

Vue.config.productionTip = false

const socket = io('http://52.187.132.228:3000');
Vue.use(VueSocketIOExt, socket);

Vue.prototype.$message = message;
Vue.prototype.$notification = notification;
// Vue.prototype.$confirm = confirm;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

// TODO:消息状态显示 DONE
// TODO:客户端消息缓存 DONE
// TODO:消息时间 DONE
// TODO:修改input样式 DONE
// TODO:离线消息显示 DONE
// TODO:消息撤回
// TODO:消息删除
// TODO:事件节流和防抖
// TODO:使用手势操作库
// TODO:传输Token文件
// TODO:修改会话密码
// TODO:添加转场动画
// TODO:各种消息的等待队列，如msgr,ackn
// TODO:重传机制和保证消息不重不漏
// TODO:二维码扫描添加