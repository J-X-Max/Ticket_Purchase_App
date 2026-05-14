<template>
    <van-list  v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad"
        class="list-container " offset="10">
        <router-link :to="'/detail/' + item.filmId" v-for="item in list" :key="item.filmId" class="film-link">
            <van-card :thumb="item.poster">
                <template #title>
                    <div class="van-card__title">{{ item.name }} <button class="button-style"> {{ item.item.name
                    }}</button></div>
                </template>

                <template #desc>
                    <div class="audience-rating"> 观众评分 <span class="grade">{{ item.grade }} </span> </div>
                    <div class="actor-style">主演: {{item.actors.map(a => a.name).join(' ')}}</div>
                    <div class="time-style">{{ item.nation }}|{{ item.runtime ? item.runtime + "分钟" : "" }}</div>
                </template>
                <template #footer>
                    <van-button class="shopping" @click.stop.prevent="handleBuy(item.filmId)">购票</van-button>
                </template>
            </van-card>
        </router-link>

    </van-list>
</template>
<script setup lang="ts">
import useCityStore from '@/store/cityStore'
import { http } from '@/util/tools'
import { useRouter } from 'vue-router'
import useTabbarStore from '@/store/tabbarStore'
import { ref } from 'vue'
import { Card as vanCard, List as vanList, Button as vanButton } from 'vant'
type Actors =
    {
        name: string;
        role: string;
        avatarAddress: '';

    }
type Item =
    {
        name: string;
        type: number;
    }

interface Iitem {
    filmId: number,
    name: string,
    poster: string,
    grade: string,
    actors: Actors[],
    item: Item,
    runtime: number;
    nation: string;
}
const list = ref<Iitem[]>([]);  // 这里表示数组中每个元素是IItem这个接口类型
const router = useRouter();
const cityStore = useCityStore()
const tabbarStore = useTabbarStore();
const loading = ref<boolean>(false);
const finished = ref<boolean>(false);
const pageNum = ref<number>(0);
const handleBuy = (filmId: number) => {
    // 跳转到选座页面或其他逻辑，例如 router.push(`/buy/${filmId}`)
    router.push(`/detail/${filmId}/cinemas`)

}
const onLoad =
    // 异步更新数据
    // setTimeout 仅做示例，真实场景中一般为 ajax 请求
    async () => {
       await cityStore.ensureCityReady() 
        pageNum.value++;
        const res = await http({
            url: `/gateway?cityId=${cityStore.cityId}&pageNum=${pageNum.value}&pageSize=10&type=1&k=6151240`,
            headers: {
                'X-Host': 'mall.film-ticket.film.list'
            }
        });
        list.value = [...list.value, ...res.data.data.films];
        // console.log(list.value);
        loading.value = false;

        // 数据全部加载完成
        if (list.value.length >= res.data.data.total) {
            finished.value = true;
        }

    };

tabbarStore.change(true)

</script>


<style scoped lang="scss">
.film-link {
    text-decoration: none;
    color: inherit;
    display: block;
}

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
                font-size: 1.2rem;
                display: flex;
                justify-content: center;
            }

            .van-card__title {
                white-space: nowrap;
                line-height: 1;
                margin-top: 0.2rem;
                display: flex;
                align-items: center;
                margin-bottom: 0.475rem;

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
                font-size: 1rem;
                display: flex;
                align-items: center;
                line-height: 1.2;

                .grade {
                    color: rgb(255, 150, 112);
                    font-weight: 600;
                    font-size: 0.9rem;
                    margin-left: 0.1875rem;

                }
            }

            .actor-style {
                font-size: 1rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .time-style {
                font-size: 1rem;
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
</style>
