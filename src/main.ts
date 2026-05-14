import {  createApp } from 'vue'
import './styles/publiccss.scss'
import App from './App.vue'  //原本项目
// import App from './test项目/App.vue'  //测试项目
import 'vant/lib/index.css';
import router from './router'
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './assets/iconfont/iconfont.css';
import '@/assets/iconfont/iconfont.js'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
createApp(App)
.use(router)
.use(pinia)
.mount('#app')


//vue2 的写法
//  var vm = new Vue({
// //配置对象,也就是传递参数创建vue实例
//   el: '#app', //指定要控制的元素,也就是挂载点或者挂载元素,可以不用id选择器,也可以用class选择器等
//   data:{
//     //界面数据
//     title: 'hello vue'
//   },
//   computed:{

//   }
// })





// new Vue({

//   router, // this.$router === router
//   store, // this.$store === store
//   render: h => h(App) // vue支持的新写法
// }).$mount('#app')
