<template>
    <myheader class="title" title="余额明细" leftType="back"  showWarning @go-to-warning="hanldeGoToWarning"/>
    <div class="amount-box">
        <span>当前余额</span>
        <span>¥{{ balance?.availableAmount.toFixed(2) }}</span>
    </div>
    <div class="no-record">
        <img src="https://assets.maizuo.com/h5/v5/public/app/img/empty-bg.de87ac00.png">
        <div>暂无余额使用明细</div>
    </div>
</template>
<script lang="ts" setup>
import Myheader from '@/components/Myheader.vue'
import useTabbarStore from '@/store/tabbarStore';
import { http } from '@/util/tools';
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import type {Record, Balance} from '@/types'
// type Record = {
//     pageNum: number,
//     pageSize: number,
//     record: Array<any>,
//     total: number
// }
// type Balance = {
//     totalAmount: number,
//     availableAmount: number,
//     frozenAmount: number

// }
const router = useRouter()
const tabbarStore = useTabbarStore()
const balance = ref<Balance|null>(null)
const record = ref<Record | null>()
tabbarStore.isTabbarShow = false
const fetchavailable = async () => {
    try {
        const [res1, res2] = await Promise.all([
            http.get('/gateway/', {
                params: {
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.asset.balance.info',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),
            http.post('/gateway/', {
                "pageSize": 10,
                "pageNumber": 1,
                "sortKey": 1,
                "sortType": 0
            },
                {
                    params: {
                        k: 7105868,
                    },
                    headers: {
                        'X-Host': 'mall.asset.balance.record',
                        "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                    }
                }),
        ])
        balance.value = res1.data.data
        record.value = res2.data.data
    } catch (error) {
        console.log(error)
    }
}
const hanldeGoToWarning = () => {
    router.push('/active/fKieYR730084')
}
onBeforeMount(
    fetchavailable
)
</script>
<style scoped lang="scss">
.amount-box {
    height: 25vh;
    background: url(https://assets.maizuo.com/h5/v5/public/app/img/head-bg.8720dca7.png) center center/cover;
color: rgb(255, 255, 255);
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
font-size: 1.7rem;
span:first-child{
font-size: .8rem;
margin: 10px 0;
}

}
.no-record{
    position: absolute;
    width: 100%;
    
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #bdc0c5;
img{
    width: 30%;
}
}
</style>
