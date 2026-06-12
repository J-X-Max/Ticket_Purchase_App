<template><!--最外部只能有一个template,且v-if等指令在这个上面不生效-->
    <!-- <template v-if="userInfo && special"> -->
    <div class="banner">
        <div @click="gotouser" class="headPortrait-box">
            <div v-if="isAuthenticated === null" class="img-box">
                <img :src="`/Profile_picture/image.png`">
            </div>
            <div v-if="userInfo?.headIcon" class="img-box">
                <img :src="userInfo?.headIcon">
            </div>
            <strong>{{ nickName }}</strong>
        </div>
    </div>

    <div class="couponCount-box">
        <div @click="gotousercard" class="couponCount-item">
            <div>
                <span>{{ special?.couponCount ? special.couponCount : 0 }}张 </span>
                <span class="text">卖座券</span>
            </div>
        </div>
        <div @click="gotouserbalance" class="couponCount-item">
            <div>
                <span>¥{{ special?.availableBalance ? special.availableBalance : 0 }}</span>
                <span class="text">余额</span>
            </div>
        </div>
    </div>
    <van-cell-group>
        <van-cell title="电影订单" icon="coupon-o" is-link to="/user/order" />
        <van-cell title="组合红包" icon="bill-o" is-link to="/user/redPacket" />
        <van-cell title="历史记录" icon="underway-o" is-link to="/center/record" />
        <van-cell title="帮助与客服" icon="service-o" is-link to="/help" />
        <van-cell title="设置" icon="setting-o" is-link to="/center/setting" />
    </van-cell-group>
    <!-- </template> -->
</template>

<script lang="ts" setup>
import useTabbarStore from '@/store/tabbarStore';
import { onBeforeMount, ref } from 'vue';
import { http } from '@/util/tools';
import { Cell as vanCell, CellGroup as vanCellGroup } from 'vant';
import { useRouter } from 'vue-router';
import type { User, Spe } from '@/types'

// type user = {
//     headIcon: string,
//     nickName: string,
// }
// type spe = {
//     couponCount: number,
//     availableBalance: number,
// }
const tabbarStore = useTabbarStore();
const userInfo = ref<User | null>(null);
const special = ref<Spe | null>(null);
const nickName = ref<string | undefined>()
const isAuthenticated = localStorage.getItem("token")
const router = useRouter();
const gotouser = () => {
    router.push('/user')
}
const gotousercard = () => {
    router.push('/user/card')
}
const gotouserbalance = () => {
    router.push('/user/balance')
}
tabbarStore.isTabbarShow = true;
onBeforeMount(async () => {
    if (isAuthenticated === null) {
        nickName.value = '立即登录'
        return

    }
    try {
        const [res1, res2] = await Promise.all([//_是占位符号,不用的参数可以用其占位,但是不能在一个数组里出现两个_ 这样是重复声明了,可以用_res4等不同的变量名即可.
            http.get('/gateway/', {
                params: {
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.user.info.get',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),

            http.get('/gateway/', {
                params: {
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.user.page.data',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),

            http.get('/gateway/', {
                params: {
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.asset.balance.info',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),

            http.get('/gateway/', {
                params: {
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.ticket.order.user-today-orders',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),
        ])
        userInfo.value = res1.data.data
        nickName.value = userInfo.value?.nickName
        special.value = res2.data.data
    } catch (error) {
        console.log(error)
    }
})

</script>
<style lang="scss" scoped>
// @media (orientation: landscape) {
//         strong {
//             font-size:.7rem!important;
//             // flex: 5;
//         }
// }

// @media (orientation: portrait) {

.banner {
    width: 100%;
    height: clamp(20%, 1px + 10rem, 30%);
    background: url(https://assets.maizuo.com/h5/v5/public/app/img/bg.a5bdd690.png) no-repeat center/cover #ffffff;
    position: relative;

    .headPortrait-box {
        width: 40%;
        height: 30%;
        position: absolute;
        left: 3%;
        top: 50%;
        display: flex;
        column-gap: .5rem;
        align-items: center;

        .img-box {
            // width: 20vw;
            border-radius: 50%;
            background-color: #f0f0f000; // 加载时背景色
            border: 3px solid #ffffff;
            // flex:2;
             img {
                border-radius: 50%;
                object-fit: fill;
                object-position: center center;
                transform: scale(1.3);
                width: 100%;
                height: 100%;
            }
        }

        strong {
            color: #ffffff;
            font-size: .9rem;
            // flex: 5;
        }
    }
}

.couponCount-box {
    background-color: #ffffff;
    width: 100%;
    // height: 10vh;
    margin-bottom: 10px;
    display: flex;

    .couponCount-item {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;

        div {
            display: flex;
            align-items: center;
            flex-direction: column;

            span {
                font-size: 1rem;
                flex: 1;
            }

            .text {
                font-size: 0.8rem;
                color: #999999;
            }
        }
    }
}

:deep(.van-cell) {
    font-size: .9rem;

    .van-cell__left-icon,
    .van-cell__right-icon {
        font-size: 1rem;
    }
}
// }
</style>