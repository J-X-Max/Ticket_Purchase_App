// import { createWebHistory, createRouter } from 'vue-router'
import { createWebHashHistory, createRouter } from 'vue-router'
import Nowplaying from '@/views/films/Nowplaying.vue'
import Comingsoon from '@/views/films/Comingsoon.vue'
import Search from '@/views/Search.vue'
import City from '@/views/City.vue'
import Login from '@/views/Login.vue'
import Detail from '@/views/Detail.vue'
// import cinemasDetail from '@/views/cinemasDetail.vue'
import NotFound from '@/views/NotFound.vue'

// import store from '../store'
/* Vue.use(VueRouter) */ // 注册路由插件, 两个全局 router-view router-link

// 配置表
const routes = [
  {
    path: "/films",
    component: () => import('@/views/Films.vue'),  // default: () => import('@/views/Films.vue'),

    // header: () => import('@/components/Myheader.vue')  // 公共头部组件
    meta: { title: '电影' },
    //  redirect: '/films/nowplaying',  // 默认重定向
    // 嵌套路由
    children: [
      {
        // path: '/films/nowplaying',
        path: 'nowplaying',//  子路径可以省略和父路径的路径拼接,也就是前面一样的部分,不用像上面这样写
        component: Nowplaying
        // meta: {
        //   isShow: true 
        // }
      },
      {
        // path: '/films/comingsoon',
        path: 'comingsoon',
        component: Comingsoon
      },
      {
        // path: '/films',
        path: '',
        redirect: '/films/nowplaying'
      }
    ]
  },

  {
    name: 'Detail', // 命名路由
    path: '/detail/:id', // 动态二级路由
    component: Detail
    // meta: {
    //   isShow: false
    // }

  },
  {
    path: '/detail/:id/cinemas',
    component: () => import('@/views/Choicecinema.vue')
  },
  {
    path: '/cinemas',
    component: () => import('@/views/Cinemas.vue'),
    meta: { title: '影院' }
  },

  {
    path: '/cinemas/:cinemaid/film',
    component: () => import('@/views/cinemasDetail.vue'),
    children: [
      {
        path: ':filmid/:date',
        name: 'cinemasDetailWithFilm',
        component: () => import('@/views/cinemasDetail.vue') // 可复用同一组件
      }
    ]
  },
  {
    path: '/schedule/:scheduleid/:dateid',
    component: () => import('@/views/Schedule.vue'),
    meta: {
      requiredAuth: true
    }
  },
  {

    path: '/preorder/:orderid',
    component: () => import('@/views/Order.vue')
  },

  // {
  //   path: '/consultation',
  //   component: () => import('@/views/Consultation.vue'),
  //   meta: { title: '资讯' }
  // },
  {
    path: '/city',
    component: City
  },
  {
    path: '/cinemas/search',
    component: Search
  },
  {
    path: '/center',
    component: () => import('@/views/Center.vue'), // 懒加载
    // meta: {
    //   requiredAuth: true
    // },
  },
  {
    path: '/center/record',
    component: () => import('@/views/center/Record.vue'),
    meta: {
      requiredAuth: true
    },
  },
  {
    path: '/center/setting',
    component: () => import('@/views/center/Setting.vue'),
    meta: {
      requiredAuth: true
    },
  },
  {
    path: '/active/:activeid',
    component: () => import('@/views/center/Active.vue'),
  },
  {
    name: "Login",
    path: "/login",
    component: Login
  },
  {
    path: "/",
    redirect: "/films"
    // redirect: {
    //     name: "myfilms"
    // }
  },


  // {   path: '/:pathMatch(.*)*', 
  {
    path: '/:pathMatch(.*)*',  // /aaa /bbb /ccc  /aaa/a1/a2
    component: NotFound
  }

  ,
  {
    path: '/order',
    component: () => import('@/views/Order.vue'),
    meta: {
      requiredAuth: true
    }

  },
  {
    path: '/user',
    component: () => import('@/views/center/User.vue'),
    meta: {
      requiredAuth: true
    },
  },
  {
    path: '/user/card',
    component: () => import('@/views/center/Usercard.vue'),
    meta: {
      requiredAuth: true
    },
  },
  {
    path: '/user/balance',
    component: () => import('@/views/center/Userbalance.vue'),
    meta: {
      requiredAuth: true
    },
  },
  {
    path: '/user/order',
    component: () => import('@/views/center/Userorder.vue'),

    meta: {
      requiredAuth: true
    },
  },
  {
    path: '/user/order/:payorderid',
    component: () => import('@/views/center/Orderinfo.vue'),
  },
  {
    path: '/user/redPacket',
    component: () => import('@/views/center/UserredPacket.vue'),

    meta: {
      requiredAuth: true
    },
  },
  {
    path: '/user/reset-password',
    component: () => import('@/views/center/ResetPassword.vue'),
  },
  {
    path: '/user/security-code',
    component: () => import('@/views/center/SecurityCode.vue'),
  },
  {
    path: '/user/change-mobile',
    component: () => import('@/views/center/ChangeMobile.vue'),
  },
  {
    path: '/help',
    component: () => import('@/views/center/Help.vue'),

    meta: {
      requiredAuth: true
    },
  },
  {
    path: '/help/1',
    component: () => import('@/views/center/Help/Help1.vue'),
  },

  {
    path: '/help/2',
    component: () => import('@/views/center/Help/Help2.vue'),
  },

  {
    path: '/help/3',
    component: () => import('@/views/center/Help/Help3.vue'),
  },

  {
    path: '/help/4',
    component: () => import('@/views/center/Help/Help4.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(), // hash  #/film #/center
  // history: createWebHistory(), // 
  // history /film /center
  routes, // `routes: routes` 的缩写

})

// 应用就绪后，始终保证栈里最少有一条应用内记录
// router.isReady().then(() => {
//   // 如果当前就是默认页面，并且没有其他历史记录
//   if (window.history.length <= 1) {
//     // 先 replace 到根路径，再用 push 推一条默认页面
//     window.history.replaceState(null, '', '/films/nowplaying')
//     // 再推一条同样的，这样用户按返回时，会回到这个页面而不是退出
//     window.history.pushState(null, '', '/films/nowplaying')
//   }
// })
router.beforeEach((to, _, next) => {
  // to.meta.from = from.fullPath;
  // if (history.state.back === null) {
  //   router.push('/films')
  //   console.log('1')
  // } else {
  //   console.log('2')
  // }
  // console.log(to.matched.length,history.length)
  //  if(to.matched.length === 0){
  // router.push('/films')
  //  } 
  // console.log(to)
  let isAuthenticated = localStorage.getItem("token")

  // console.log(to.fullPath)
  // var arr = ['/center','/card']
  //  可以通过to.name命名路由来判断哪些路径需要授权才能访问,还可以通过在meta中设置一个属性requiredAuth来表示这个路径是否需要授权
  if (to.name !== 'Login' && !isAuthenticated && to.meta.requiredAuth) {
    next({
      path: '/login',
      query: {
        redirect: to.fullPath,
        // redirect: '/center'
      }
    })
  } else {
    next()
  }

})
// router.afterEach((to, from) => {
//   console.log(history.state.back, window.history.length)
// })
// 全局拦截 (守卫)

/* router.beforeEach((to, from, next) => {
  // console.log('进入', to.meta.isShow)
  // if (to.meta.isShow) {
  //   console.log(store)
  //   store.commit('show')
  // } else {
  //   store.commit('hide')
  // }
  if (to.meta.requiredAuth) {
    // 判断 本地存储中是否token
    if (localStorage.getItem('token')) {
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    next()
  }
}) */

export default router
