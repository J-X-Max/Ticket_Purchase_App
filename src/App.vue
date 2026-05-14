<template>
 <div class="app">


  <router-view ></router-view>

  <van-tabbar route fixed placeholder v-model="active" active-color="orange" v-show="store.isTabbarShow">

    <van-tabbar-item replace to="/films">
      <span>电影</span>
      <van-icon class-prefix="iconfont" name="dianying" #icon />
    </van-tabbar-item>

    <van-tabbar-item replace to="/cinemas">
      <span>影院</span>
      <van-icon class-prefix="iconfont" name="dianyingyuan" #icon />
    </van-tabbar-item>

    <van-tabbar-item  to="/active/ElzMZU125260">
      <span>资讯</span>
      <van-icon class-prefix="iconfont" name="zixun" #icon />
    </van-tabbar-item>

    <van-tabbar-item replace to="/center">
      <span>我的</span>
      <van-icon class-prefix="iconfont" name="denglu-copy" #icon />
    </van-tabbar-item>

  </van-tabbar>

  <van-popup v-model:show="showLocationPopup" round safe-area-inset-bottom position="center"
    :style="{ height: '35vw', width: '68vw' }">
    <div class="title"> {{cityStore.locationError  }} </div>
    <div class="option">
      <van-button type="default"  @click="cancelLocation">取消</van-button>
      <van-button type="default" @click="goToCitySelect">确认</van-button>
    </div>
  </van-popup>
 </div>
</template>



<script setup lang="ts">
import { ref , watch } from 'vue';
import useCityStore from './store/cityStore.ts';
import {
  Popup as vanPopup,
  Button as vanButton,
  Tabbar as vanTabbar,
  TabbarItem as vanTabbarItem,
  Icon as vanIcon,
} from 'vant';
import useTabbarStore from './store/tabbarStore.ts';
import { useRouter } from 'vue-router';
const cityStore = useCityStore();
const store = useTabbarStore();
const active = ref(0);
const router = useRouter();
const showLocationPopup = ref(false);

/**
 *  你好,我是文档注释,我又两个星号,区别于代码注释,我会在代码审查时被高亮显示
 *  
 */

/**
 * @param {String} timeStr 这里的大括号里面表示参数类型 
 * @returns  这里表示返回类型 
 */
const goToCitySelect = () => {
  showLocationPopup.value = false
  router.push('/city')  // 假设你有城市选择页
}
const cancelLocation = () => {
  showLocationPopup.value = false
  cityStore.locationError = null  // 清除错误
}

watch(() => cityStore.locationError, (newVal) => {
  showLocationPopup.value = !!newVal  // 有错误时显示弹窗
})
// store.isTabbarShow = true;
// onBeforeMount(() => {
  
// store.change(true)
// })
</script>
<style scoped lang="scss">

.van-popup {
  display: flex;
  flex-direction: column;


  .title {
    flex: 1.8;
    padding: 5% 10%;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    align-items: center;
    /* 垂直居中 */
    justify-content: center;
    font-size: $font-size-base ;
    color: $text-primary;
    text-align: justify;
  }

  .option {
    flex: 1.2;
    display: flex;
    justify-content: space-around;

 
    .van-button {
      width: 30%;
      height: 50%;
      line-height: normal;
      font-size: $font-size-base;
    }

    .van-button:hover {
      border: .1875rem solid #5ebfff
    }

    .van-button:active {
      background-color: #ebebeb;
    }
  }
}

:deep(.van-tabbar) {
  height: auto;

  .van-tabbar-item__text {
    height: 100%;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: space-evenly;
    padding: 5px 0;
    font-size: 0.75rem;
  box-sizing: border-box;
  }
}
</style>