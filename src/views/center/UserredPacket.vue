<template>
    <myheader class="title" title="组合红包" leftType="back" />
    <van-list v-if="showlist" v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad"
        class="list-container " offset="10">
    </van-list>
    <div v-if="!showlist" class="noPacket-box">
        <img src="https://assets.maizuo.com/h5/v5/public/app/img/nopacket.9c5ff9d1.png">
        <div>没有组合红包~</div>
    </div>
</template>
<script lang="ts" setup>
import { List as vanList } from 'vant'
import { http } from '@/util/tools';
import Myheader from '@/components/Myheader.vue';
import { ref } from 'vue'
import useTabbarStore from '@/store/tabbarStore';
const showlist = ref(true)
const tabbarStore = useTabbarStore();
const loading = ref<boolean>(false);
const finished = ref<boolean>(false);
const pageNum = ref(0);
const list = ref<any[]>([]);  // 这里表示数组中每个元素是IItem这个接口类型
const onLoad = async () => {
    pageNum.value++;
    try {
        const [res1] = await Promise.all([
            http.get('/gateway/', {
                params: {
                    pageSize: 10,
                    pageNum: pageNum.value,
                    k: 3812450,
                },
                headers: {
                    'X-Host': 'mall.brand-act.red-packet.list',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),
        ])
        if (res1.data.status === 6003) {
            showlist.value = false;
            finished.value = true;
            return;
        }
        list.value = [...list.value, ...res1.data.data.list];
        loading.value = false;
        // 数据全部加载完成
        if (list.value.length >= res1.data.data.page.total) {
            finished.value = true;
        }
    } catch (error) {
        console.log(error)
    }
}

tabbarStore.isTabbarShow = false;
</script>
<style lang="scss" scoped>
.noPacket-box {
   color: #bdc0c5;
   font-size: .9rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    img {
        width: 50%;
        margin-bottom: 20px;
    }
}
</style>