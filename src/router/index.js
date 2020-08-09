import Vue from 'vue'
import Router from 'vue-router'
import ChatPage from '@/views/ChatPage'
import ChatArea from '@/views/ChatPage/ChatArea'
import JoinSession from '@/views/JoinSession'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'chat-page',
      component: ChatPage,
      redirect: '/sessions'
    },
    {
      path: '/sessions',
      name: 'chat-page',
      component: ChatPage,
    },
    {
      path: '/chat',
      name: 'mobile-chat',
      component: ChatArea
    },
    {
      path: '/join-session',
      name: 'join-session',
      component: JoinSession
    }
  ]
})
