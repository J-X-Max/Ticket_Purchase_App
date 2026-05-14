<template>
    <myheader class="title" title="电影订单" leftType="back" />
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad"
        class="list-container " offset="10">

        <div v-for="(item, index) in list" :key="item.payOrderId">
            <router-link :to="`/user/order/${item.payOrderId}?type=2`">
                <div class="Product-box">
                    <div class="product-up">
                        <img :src="item.skuList[0].imgUrl">
                        <div class="product-info">
                            <div class="title">{{ item.skuList[0].productName }}
                            </div>
                            <div>{{ formattedEndDate[index]?.skuList[0].extraInfo.watchTime }}</div>
                            <div>×{{ item.skuList[0].count }}</div>
                        </div>
                    </div>
                    <div class="product-price">
                        <span>共{{ item.skuList[0].count }}件商品</span>
                        <span>实付<span class="price"><span class="chart">¥</span>{{
                            (item.totalPrice ? item.totalPrice / 100 : 0).toFixed(2) }}</span></span>
                    </div>

                </div>
            </router-link>
            <div class="orderCancel">
                <span>订单取消</span>
                <button @click="gotofilmdetail(item.skuList[0].extraInfo.filmId)">重新购买</button>
            </div>
        </div>
    </van-list>
</template>
<script lang="ts" setup>
import { List as vanList } from 'vant'
import { ref, computed } from 'vue'
import Myheader from '@/components/Myheader.vue';
import { http } from '@/util/tools';
import { useRouter } from 'vue-router';
import useTabbarStore from '@/store/tabbarStore';
type ListItem = {
    payOrderId: string,
    endPayTime: number,
    totalPrice: number,
    orderStatus: number,
    createdAt: number,
    skuList: [
        {
            productName: string,
            imgUrl: string,
            count: number,
            price: number,
            extraInfo: {
                filmId: number,
                finishTime: number
                watchTime: number,
            },
        }
    ],
}
// type FormattedListItem = Omit<ListItem, 'createdAt'> & {//Omit表示排除createdAt属性创建一个新类型在与后面&的属性合并
//     createdAt: string;   // 明确变为 string
// };
type Modify<T, R> = Omit<T, keyof R> & R;//注意Omit是ts内置工具类型,Modify是自定义的

type FormattedListItem = Modify<ListItem, {
    skuList: [
        Modify<ListItem['skuList'][0], {
            extraInfo: Modify<ListItem['skuList'][0]['extraInfo'], {
                watchTime: string;
            }>;
        }>
    ];
}>;
const tabbarStore = useTabbarStore();
const loading = ref<boolean>(false);
const finished = ref<boolean>(false);
const pageNum = ref<number>(0);
const router = useRouter();
const list = ref<ListItem[]>([]);  // 这里表示数组中每个元素是IItem这个接口类型
const gotofilmdetail = (id: number) => {
    router.push(`/detail/${id}`)
}
const onLoad = async () => {
    pageNum.value++;
    try {
        const [res1] = await Promise.all([
            http.get('/gateway/', {
                params: {
                    pageSize: 10,
                    pageNum: pageNum.value,
                    sortKey: 2,
                    sortType: 1,
                    type: 9999,
                    k: 3812450,
                },
                headers: {
                    'X-Host': 'mall.order.user-orders',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),
        ])
        list.value = [...list.value, ...res1.data.data.list];
        // console.log(list.value);
        loading.value = false;

        // 数据全部加载完成
        if (list.value.length >= res1.data.data.page.total) {
            finished.value = true;
        }
    } catch (error) {
        console.log(error)
    }
}
const formattedEndDate = computed<FormattedListItem[]>(() => {
    if (!list.value) return []

    const newlist: FormattedListItem[] = list.value.map(item => {
        const date = new Date(item.skuList[0].extraInfo.watchTime * 1000)
        const weekdays = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const weekday = weekdays[date.getDay()]
        return {
            ...item,
            skuList: [
                {
                    ...item.skuList[0],
                    extraInfo: {
                        ...item.skuList[0].extraInfo,
                        watchTime: `${weekday} ${year}-${month}-${day} ${hours}:${minutes}`,  // ✅ 正确位置
                    },
                },
            ],
        }
    })
    return newlist
})
tabbarStore.isTabbarShow = false;
</script>
<style scoped lang="scss">
.Product-box {
    display: flex;
    flex-direction: column;
    padding: 10px 10px;
    padding-bottom: 0;
    background-color: #fff;
    box-sizing: border-box;

    .product-up {
        display: flex;
        border-bottom: #dddddd43 1px solid;
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


        }
    }

    .product-price {
        margin-top: 10px;
        padding-bottom: 10px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        font-size: .9rem;
        border-bottom: rgba(221, 221, 221, 0.262745098) 1px solid;

        >span:first-child {
            color: #000000;
            margin-right: 20px;
        }

        span:nth-child(2) {
            color: #000000;

            .price {
                color: #ff5f16;

                .chart {
                    margin: 0 3px;
                    font-size: .6rem
                }
            }
        }
    }
}

.orderCancel {
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    margin-bottom: 10px;
    padding: 10px 10px;
    color: #bdc0c5;
    font-size: .8rem;
    align-items: center;

    button {
        background-color: transparent;
        border: 1px solid #000000;
        padding: 5px 10px;
        border-radius: 3px;
        color: #000000;
    }
}
</style>
