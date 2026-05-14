<template>
    <div class="container">
        <myheader class="title" title="卖座券" leftType="back" />
        <div v-if="shownullcard" class="box">
            <img src="https://assets.maizuo.com/h5/v5/public/app/img/rectangle.e95a2cd6.png">
            <div>你还没有卖座券哦~</div>
            <button>激活新券</button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onBeforeMount } from 'vue';
import Myheader from '@/components/Myheader.vue'
import useTabbarStore from '@/store/tabbarStore';
import { http } from '@/util/tools';
const tabbarStore = useTabbarStore()
const shownullcard = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const vaildFlag = ref([0, 1])
const cardList_0 = ref(null)
const cardList_1 = ref(null)
const fetchCard = async () => {
    try {
        const [res1,res2] = await Promise.all([
            http.get('/gateway/', {
                params: {
                    pageNum:pageNum.value,
                    pageSize:pageSize.value,
                    validFlag: vaildFlag.value[0],
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.user.card.list',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),
             http.get('/gateway/', {
                params: {
                    pageNum:pageNum.value,
                    pageSize:pageSize.value,
                    validFlag: vaildFlag.value[1],
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.user.card.list',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),
        ])
        if(res1.data.status !==6003){
            cardList_1.value = res1.data.data
        }else{
            shownullcard.value = true
        }
        if(res2.data.status !==6003){
            cardList_0.value = res2.data.data
        }else{
            shownullcard.value = true
        }
    } catch (error) {
        console.log(error)
    }
}
tabbarStore.isTabbarShow = false
onBeforeMount(
    fetchCard
)
</script>
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
    position: relative;

    .title {
        width: 100%;
    }

    .box {
        position: absolute;
        left: 50%;
        top: 50%;
        translate: -50% -95%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        img {
            width: 55%;
        }

        div {
            margin: 10px 0;
            color: #bdc0c5;
            font-size: 0.875rem;
        }

        button {
            border: 1px solid #ff5f16;
            color: #ff5f16;
            border-radius: 3px;
            height: 2.0625rem;
            width: 9.375rem;
            background-color: transparent;
        }
    }
}
</style>
