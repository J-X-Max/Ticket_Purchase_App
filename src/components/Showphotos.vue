<template>
<myheader :title="'剧照('+show?.length+')' " leftType="back"   :prevent-default-back="false"  @back="handleCustomBack"></myheader>
<van-row :gutter="[10, 10]">
  <van-col span="8" v-for="photo,index in show" :key="photo" @click="handlePreview(index)"><img :src="photo" alt="加载失败" :title="`第${index+1}剧照`"></van-col>
</van-row>
</template>
<script lang="ts" setup>
import {Col as vanCol,Row as vanRow,showImagePreview} from 'vant'
import Myheader from './Myheader.vue';
const props = defineProps({
  show: {
    type: Array as () => string[] | undefined,
    required: true
  }
})
const emit = defineEmits(['back'])
const handlePreview = (index: number) => {
  // 调用 ImagePreview.show 方法
  // 参数1: 图片数组
  // 参数2: 初始显示的图片索引 (从0开始)
  // 参数3: 配置选项 (例如: Closeable: true 显示关闭按钮)
  showImagePreview({
    images: props.show || [], // 确保 props.show 存在，否则传空数组
    startPosition: index,
    closeable: true,
    doubleScale: true
  });
}
const handleCustomBack = () => {
  emit('back')
}
</script>
<style>
.van-row{
    margin: .3125rem .3125rem;
}
img{
  width: 100%;
  height: 100%;
}

</style>