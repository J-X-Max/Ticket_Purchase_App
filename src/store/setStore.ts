
import {defineStore} from 'pinia';
import {ref} from 'vue';
//第一个参数是唯一storeId
const useSetStore = defineStore("set",()=>{
    // ref包装定义的就是 state
    const mobile = ref<string|undefined>();

    return {
        mobile,
    }
},
{
    persist:{
        storage:sessionStorage, //存储引擎，默认 localStorage
        pick: ['mobile'] // 指定持久化的字段（不指定则全部持久化）
    }
}
);


export default useSetStore;