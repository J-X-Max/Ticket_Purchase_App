<template>
    <myheader class="title" title="订单详情" leftType="back" />
    <div class="banner">
        <span>订单取消</span>
        <img src="https://assets.maizuo.com/h5/v5/public/app/img/iconCancel@2x.7230fc66.png">
    </div>
    <div class="mobile padding">
        <van-icon name="friends-o" />
        <span>{{ orderInfo ? formatMobile(orderInfo.mobile) : '' }}</span>
    </div>


    <div class="Product-box">
        <div class="product-up">
            <img :src="orderInfo?.skuList[0].imgUrl">
            <div class="product-info">
                <div class="title">{{ orderInfo?.skuList[0].thirdOrderExtInfo.goodsInfo[0]?.seatExtInfo.filmName }}({{
                    orderInfo?.skuList[0].thirdOrderExtInfo.goodsInfo[0]?.goodsName }})
                </div>
                <div>{{ formattedEndDate }}</div>
                <div class="address">{{ orderInfo?.skuList[0].thirdOrderExtInfo.cinemaInfo.name }}</div>
                <div class="hall">{{ orderInfo?.skuList[0].thirdOrderExtInfo.goodsInfo[0]?.seatExtInfo.hallName + '(' +
                    orderInfo?.skuList[0].thirdOrderExtInfo.goodsInfo[0]?.goodsCount +
                    '张) ' + orderInfo?.skuList[0].thirdOrderExtInfo.goodsInfo[0]?.seatExtInfo.sectionName }}</div>
                <div class="seats">{{ formatseats }}</div>
            </div>
        </div>


    </div>

    <div class="price-box">
        <div class="product-price">
            <span>商品金额</span>
            <span><span class="chart">¥</span>{{ (orderInfo?.totalPrice ? orderInfo.totalPrice / 100 : 0).toFixed(2)
                }}</span>
        </div>
        <div class="product-price-pay">
            <span>实付</span>
            <span><span class="chart">¥</span>{{ (orderInfo?.skuList[0].finalPrice ? orderInfo?.skuList[0].finalPrice /
                100 : 0).toFixed(2)
            }}</span>
        </div>
    </div>

    <div class="address-box">
        <div class="address-info">
            <div>{{ orderInfo?.skuList[0].thirdOrderExtInfo.cinemaInfo.name }}</div>
            <div>{{ orderInfo?.skuList[0].thirdOrderExtInfo.cinemaInfo.address }}</div>
        </div>
        <div class="icon-box">
            <van-icon name="phone-o" />
        </div>
    </div>
    <div class="order-box">
        <div class="order-info">
            <div>订单编号 {{ ' ' + (orderInfo ? formatOrderNumber(orderInfo.payOrderId) : '') }}</div>
            <div>下单时间 {{ ' ' + formattedPaytime }}</div>
        </div>
        <button @click="handleCopy" :disabled="isCopied">
            {{ isCopied ? '已复制' : '复制' }}
        </button>
    </div>
    <div class="Re-purchase-button">
        <van-icon name="service-o" />
        <button @click="gotoRebuy">重新购买</button>
    </div>
</template>
<script lang="ts" setup>
import Myheader from '@/components/Myheader.vue';
import { http } from '@/util/tools';
import { useRoute,useRouter } from 'vue-router';
import { ref, onBeforeMount, computed } from 'vue';
import { showToast, Icon as vanIcon } from 'vant';
import useTabbarStore from '@/store/tabbarStore';
import type { OrderInfo } from '@/types';
// type Order = {
//     mobile: number,
//     totalPrice: number,
//     payOrderId: string,
//     createdAt: number,
//     endPayTime: number,
//     skuList: [{
//         finalPrice: number,
//         imgUrl: string,
//         thirdOrderExtInfo: {
//             cinemaInfo: {
//                 name: string,
//                 address: string,
//             },
//             goodsInfo: [{
//                 goodsCount: number,
//                 goodsName: string,
//                 seatExtInfo: {
//                     filmId:number,
//                     filmName: string,
//                     hallName: string,
//                     seats: string,
//                     watchTime: number,
//                     sectionName: string,
//                     price: number,
//                 }
//             }]
//         }
//     }]
// }
const route = useRoute()
const router = useRouter()
const tabbarStore = useTabbarStore()
const orderInfo = ref<OrderInfo | null>(null)
const customer = ref({})
const formatMobile = (mobile: number | string): string => {
    const str = String(mobile);
    return str.length === 11 ? str.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') : str;
};
const formatOrderNumber = (orderNumber: number | string): string => {
    const str = String(orderNumber);
    return str.replace(/(.{4})/g, '$1 ').trim();
};
const isCopied = ref(false);

const handleCopy = async () => {
    // 1. 检查浏览器是否支持 Clipboard API
    if (!navigator.clipboard) {
        showToast('您的浏览器不支持一键复制功能，请手动复制。')
        return;
    }
    if (!orderInfo.value?.payOrderId) {
        showToast('无订单号,请稍后再试')
        return;
    }
    try {
        // 2. 调用 API 写入剪贴板
        await navigator.clipboard.writeText(orderInfo.value?.payOrderId);
        showToast('复制成功！');

        // 3. 提供视觉反馈
        isCopied.value = true;
    setTimeout(() => {
            isCopied.value = false;
        }, 1500);

    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请重试。');

    }
};
const formatseats = computed(() => {
    const price = (orderInfo.value?.skuList[0].thirdOrderExtInfo.goodsInfo[0]?.seatExtInfo.price ?? 0) / 100
    const str = orderInfo.value?.skuList[0].thirdOrderExtInfo.goodsInfo[0]?.seatExtInfo.seats
    if (str) {
        return str.split('|').map((item) => {
            // 操作 item
            return item.replace(':', '排').concat('座(¥' + price + ')')
        }).join(' ');
    } else {
        return ''
    }
})

const formattedPaytime = computed(() => {
    if (!orderInfo.value?.createdAt) return ''
    // if (!orderData.value?.createdAt) return ''
    const date = new Date(orderInfo.value?.createdAt * 1000)
    const weekdays = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const weekday = weekdays[date.getDay()]
    return `${weekday} ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
})
const formattedEndDate = computed(() => {
    if (!orderInfo.value?.skuList[0].thirdOrderExtInfo.goodsInfo[0]?.seatExtInfo.watchTime) return ''
    // if (!orderData.value?.createdAt) return ''
    const date = new Date(orderInfo.value?.skuList[0].thirdOrderExtInfo.goodsInfo[0].seatExtInfo.watchTime * 1000)
    const weekdays = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const weekday = weekdays[date.getDay()]
    return `${weekday} ${year}-${month}-${day} ${hours}:${minutes}`
})
const fetchorder = async () => {
    try {
        const [res1, res2] = await Promise.all([//_是占位符号,不用的参数可以用其占位,但是不能在一个数组里出现两个_ 这样是重复声明了,可以用_res4等不同的变量名即可.
            http.get('/gateway/', {
                params: {
                    orderId: route.params.payorderid,
                    type: route.query.type,
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.order.detail.v2',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),
            http.post('/gateway/',
                {
                    fieldType: 1,
                    fieldValue: route.params.payorderid,
                },
                {
                    params: {
                        k: 7105868,
                    },
                    headers: {
                        'X-Host': 'mall.cfg.customer-url',
                        "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                    }
                }),
        ])

        orderInfo.value = res1?.data.data
        customer.value = res2?.data.data
    } catch (error) {
        console.log(error)
    }
}
const gotoRebuy =() =>{
    router.push(`/detail/${orderInfo.value?.skuList[0].thirdOrderExtInfo.goodsInfo[0]?.seatExtInfo.filmId}`)
}
tabbarStore.isTabbarShow = false
onBeforeMount(() => {
    fetchorder()
})
</script>
<style scoped lang="scss">
.banner {
    height: 12vh;
    background: transparent url(https://assets.maizuo.com/h5/v5/public/app/img/iconBaseMap@2x.fb41c75c.png) no-repeat center center/cover;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
    color: rgb(255, 255, 255);

    img {
        width: 30%;
        /* 或具体的像素值，如 width: 80px; */
        height: auto;
        /* 高度根据宽度自动计算，保持比例 */
    }
}

.padding {
    padding: 10px 15px;
}

.mobile {
    background-color: #fff;
    height: 4vh;
    display: flex;
    align-items: center;

    .van-icon {
        font-size: 1.3rem;
        margin-right: 5px;

    }
}

.Product-box {
    display: flex;
    flex-direction: column;
    padding: 10px 10px;
    background-color: #fff;
    box-sizing: border-box;
    margin-top: 10px;

    .product-up {
        display: flex;
        // border-bottom: #dddddd43 1px solid;
        padding-bottom: 10px;

        img {
            margin-right: 7px;
            width: 22.7vw;
        }

        .product-info {
            white-space: nowrap;
            min-width: 50%;
            color: #797d82;
            font-size: 0.8rem;

            .title {
                color: #191a1b;
                text-overflow: ellipsis;
                overflow: hidden;

                font-size: 1rem;
            }

            .address {
                text-overflow: ellipsis;
                overflow: hidden;

            }

            .hall {
                white-space: pre;
                text-overflow: ellipsis;
                overflow: hidden;
            }

            .seats {
                white-space: pre-wrap;
            }
        }
    }

}

.price-box {
    background-color: #fff;
    margin-top: 10px;

    padding: 5px 10px;

    .product-price {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
        font-size: .9rem;

        >span:first-child {
            color: #797d82;
            // font-size: 0.8rem;
        }

        span:nth-child(2) {
            color: #ff5f16;

            .chart {
                font-size: .6rem
            }
        }
    }

    .product-price-pay {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1rem;

        padding: 5px 0;

        span:nth-child(2) {
            color: #ff5f16;

            .chart {
                font-size: .6rem
            }
        }
    }
}

.address-box {
    background-color: #fff;
    margin-top: 10px;
    padding: 5px 10px;
    display: flex;

    .address-info {
        font-size: .9rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 7;
        padding: 3px 0;

        >div:nth-child(2) {
            color: #797d82;
        }
    }

    .icon-box {
        padding: 3px 0;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.3rem;
    }
}

.order-box {
    background-color: #fff;
    margin-top: 10px;
    padding: 5px 10px;
    display: flex;
    color: #75757574;
    font-size: .7rem;

    .order-info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 7;
        padding: 3px 0;
    }

    button {
        width: 12%;
        height: 1%;
        padding: 2px 0;
        background-color: transparent;
        border: 1px solid #aaaaaa61;
        border-radius: 5px;

    }
}
.Re-purchase-button{
    position: absolute;
   width: 100%; 
    left: 0;
    bottom: 0;
    height: 7vh;
    display: flex;
    justify-content:space-between;
    align-items: center;
    padding: 5px 10px;
    box-sizing: border-box;
    background-color: #fff;
    .van-icon{
        font-size: 1.3rem;
    }
    button{
        background-color: transparent;
        border: 1px solid #00000061;
        border-radius:5px;
        height: 90%;
        width: 20%;
       font-size: .8rem; 
    }
}
</style>