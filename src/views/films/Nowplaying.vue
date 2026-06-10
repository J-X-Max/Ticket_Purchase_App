<template>
    <div v-if="cityStore.isReady">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad"
                class="list-container " offset="10" v-model:error="error" error-text="请求失败，点击重新加载">
                <router-link :to="'/detail/' + item.filmId" v-for="item in list" :key="item.filmId" class="film-link">
                    <van-card :thumb="item.poster">
                        <template #title>
                            <div class="van-card__title">{{ item.name }} <button class="button-style"> {{ item.item.name
                            }}</button></div>
                        </template>

                        <template #desc>
                            <div class="audience-rating"> 观众评分 <span class="grade">{{ item.grade }} </span> </div>
                            <div class="actor-style">主演: {{item.actors?.map(a => a.name).join(' ') ?? '暂无'}}</div>
                            <div class="time-style">{{ item.nation }}|{{ item.runtime ? item.runtime + "分钟" : "" }}
                            </div>
                        </template>
                        <template #footer>
                            <van-button class="shopping" @click.stop.prevent="handleBuy(item.filmId)">购票</van-button>
                        </template>
                    </van-card>
                </router-link>
            </van-list>
        </van-pull-refresh>
    </div>
</template>
<script setup lang="ts">
import useCityStore from '@/store/cityStore'
import { http } from '@/util/tools'
import { useRouter } from 'vue-router'
import useTabbarStore from '@/store/tabbarStore'
import { onBeforeMount, ref, watch } from 'vue'
import { Card as vanCard, List as vanList, Button as vanButton, PullRefresh as vanPullRefresh } from 'vant'
import type { Items } from '@/types'
// type Actors =
//     {
//         name: string;
//         role: string;
//         avatarAddress: '';

//     }
// type Item =
//     {
//         name: string;
//         type: number;
//     }

// interface Iitem {
//     filmId: number,
//     name: string,
//     poster: string,
//     grade: string,
//     actors: Actors[],
//     item: Item,
//     runtime: number;
//     nation: string;
// }
const list = ref<Items[]>([]);  // 这里表示数组中每个元素是IItem这个接口类型
const router = useRouter();
const cityStore = useCityStore()
const tabbarStore = useTabbarStore();
const loading = ref<boolean>(false);
const error = ref<boolean>(false);
const finished = ref<boolean>(false);
const refreshing = ref(false);
const pageNum = ref<number>(0);
const handleBuy = (filmId: number) => {
    // 跳转到选座页面或其他逻辑，例如 router.push(`/buy/${filmId}`)
    router.push(`/detail/${filmId}/cinemas`)

}

const onRefresh = () => {
    // 清空列表数据
    refreshing.value = true;
    finished.value = false;
    error.value = false;
    // 将 loading 设置为 true，表示处于加载状态
    loading.value = true;
    onLoad();
};
const onLoad = async () => {
    console.log('触发 onLoad，当前 loading:', loading.value, 'finished:', finished.value, 'pageNum:', pageNum.value,'error:', error.value);
    // if (loading.value || finished.value || error.value) return;
    // console.log('后')
    if (refreshing.value) {
        list.value = [];
        pageNum.value = 0;
        refreshing.value = false;
    }
    // console.log(cityStore.isReady)
    // if (cityStore.isReady === false ) return;
    // loading.value = true; // 👈 立刻上锁，防止并发触发
    loading.value = true;
    error.value = false;
    pageNum.value++;
    try {

        const res = await http({
            url: `/gateway?cityId=${cityStore.cityId}&pageNum=${pageNum.value}&pageSize=10&type=1&k=6151240`,
            headers: {
                'X-Host': 'mall.film-ticket.film.list'
            }
        });
        list.value = [...list.value, ...res.data.data.films];
        loading.value = false;
        // 数据全部加载完成
        if (list.value.length >= res.data.data.total) {
            finished.value = true;
        }
    } catch (e) {
        pageNum.value--;
        error.value = true;
        console.error(e);
    } finally {
        loading.value = false;

    console.log('触发 onLoad，当前 loading:', loading.value, 'finished:', finished.value, 'pageNum:', pageNum.value,'error:', error.value);
    }
};


// const onLoad = async () => {
//     if (loading.value || finished.value) return;
//     loading.value = true;

//     try {
//         await cityStore.ensureCityReady();
//         pageNum.value++;
//         const res = await http({
//             url: `/gateway?cityId=${cityStore.cityId}&pageNum=${pageNum.value}&pageSize=10&type=1&k=6151240`,
//             headers: { 'X-Host': 'mall.film-ticket.film.list' }
//         });
//         const newData = res.data.data.films || [];
//         list.value.push(...newData);

//         if (list.value.length >= res.data.data.total) {
//             finished.value = true;
//         }
//     } catch (error) {
//         pageNum.value--;   // 请求失败，页码回退
//         console.error('加载失败', error);
//     } finally {
//         loading.value = false;
//     }
// };
watch (() => cityStore.isReady,  (newready, oldready) => {
   console.log('cityStore.isReady', newready, oldready) 
})

onBeforeMount(async () => {
    await cityStore.ensureCityReady()
})


tabbarStore.change(true)

</script>


<style scoped lang="scss">
.film-link {
    text-decoration: none;
    color: inherit;
    display: block;
}
.van-pull-refresh{
overflow:auto;
.list-container {
    padding: 1vh 1.5vw 0vw;

    .van-card {
        font-size: 1rem;
        height: 17vh;
        padding-left: .5625rem;
        display: flex;

        :deep(.van-card__header) {
            //深度选择器下的样式不用再用深度选择了
            display: flex;
            align-items: stretch;
            height: 100%;
            width: 40%;
            flex-grow: 3;
            flex-shrink: 0;
            flex-basis: auto;

            .van-card__thumb {
                width: 11vh;
                height: 100%;
                // margin-right: .625rem;
            }

            .van-card__content {
                font-size: .9rem;

                line-height: 1.2;
                // display: flex;
                justify-content: center;
            }

            .van-card__title {
                font-size: 1rem;
                white-space: nowrap;
                line-height: 1.2;
                margin-top: 0.2rem;
                display: flex;
                align-items: center;
                margin-bottom: 3px;

                .button-style {
                    color: #fff;
                    padding: 0 .1875rem;
                    font-size: 0.6rem;
                    background-color: #d2d6dc;
                    border-radius: .25rem;
                    margin-left: .1875rem;
                    border-width: 0.15rem;
                }
            }

            .audience-rating {
                // font-size: .9rem;
                display: flex;
                align-items: center;
                // line-height: 1;

                .grade {
                    color: rgb(255, 150, 112);
                    font-weight: 600;
                    font-size: 0.7rem;
                    margin-left: 0.1875rem;

                }
            }

            .actor-style {
                // font-size: .9rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .time-style {
                // font-size: .9rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }


    :deep(.van-card__footer) {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-grow: 1;
        flex-shrink: 0;
        flex-basis: auto;

        .van-button--normal {
            padding: 0px 0px;
        }

        .shopping {
            border: 0.1875rem solid orange;
            color: orange;
            font-size: 1rem;
            width: 3.175rem;
            height: 1.5375rem;
            text-align: center;
        }
    }

    /*  .list-content {
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: repeat(3, 100px);
    } */
}
}
</style>
