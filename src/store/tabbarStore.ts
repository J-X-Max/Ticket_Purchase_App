
import {defineStore} from 'pinia';
import {ref} from 'vue';
//第一个参数是唯一storeId
const useTabbarStore = defineStore("tabbar",()=>{
    // ref包装定义的就是 state
    const isTabbarShow = ref(true);

    const change = (value:boolean)=>{
        isTabbarShow.value = value;
    }
    return {
        isTabbarShow,
        change
    }
},
{
    persist:{
        storage:sessionStorage, //存储引擎，默认 localStorage
        pick: ['isTabbarShow'] // 指定持久化的字段（不指定则全部持久化）
    }
}
// {
//     persist:true ,  //持久化状态,把状态存入localstorage中.这里只有一个状态所以默认存储当前状态.
//   }
);

// persist: {                      指定那些状态可以持久化
//   key: 'my-custom-key',        // 存储的 key 名
//   storage: sessionStorage,      // 存储引擎，默认 localStorage
//   paths: ['name', 'token']      // 指定持久化的字段（不指定则全部持久化）
// }

export default useTabbarStore