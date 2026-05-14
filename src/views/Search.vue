<template>
    <div class="container">

        <div class="search-box">
            <div class="search">
                <van-icon name="search" color="black" />
                <input v-model="searchvalue" type="text" placeholder="输入影城名称" name="search">
                <van-icon class="clearicon" v-if="searchvalue" name="close" @click="cleartel" />
            </div>
            <span @click="router.back">取消</span>
        </div>
        <div v-if="cinemalist && !searchvalue" class="list-search">
            <div class="title">离你最近</div>
            <div class="list">
                <span class="item" v-for="item in cinemalist" @click="gotocinemasDetail(item.cinemaId)">{{ item.name
                    }}</span>
            </div>
        </div>
        <template v-else-if="searchvalue">
            <div v-if="sortedCinemas.length > 0" class="list-wrapper">
                <van-cell center :title="cinema.name" :label="cinema.address" v-for="cinema in sortedCinemas"
                    :key="cinema.cinemaId" :to="'/cinemas/' + cinema.cinemaId + '/film'">
                    <div>
                        <div>¥<span> {{ cinema.lowPrice / 100 }} </span>起</div>
                        <div class="distance">距离{{ cinema.distance }}km</div>
                    </div>
                </van-cell>
            </div>
            <div v-else class="empty-result">
                <img src="https://assets.maizuo.com/h5/v5/public/app/img/rectangle@2x.2bdf0374.png">
                <p>没有找到匹配的影院</p>
                <p class="empty-list-tip">提示：仅支持搜索“影院”，建议您检查输入的影院名称是否有误？</p>
            </div>
        </template>
    </div>
</template>
<script lang="ts" setup>

import { getDistance } from "@/util/tools";
import { http } from '@/util/tools';
import { onBeforeMount, ref, onUnmounted, computed } from 'vue'
import useTabbarStore from '@/store/tabbarStore';
import useCityStore from '@/store/cityStore';
import router from '@/router';
import { Icon as VanIcon, Cell as VanCell } from 'vant';
type Cinema = {
    cinemaId: number;  // 根据实际数据类型调整
    name: string;
    eTicketFlag: number;
    districtName: string;
    address: string;
    lowPrice: number;

    latitude: number;
    longitude: number;
}

type CinemaWithDistance = Cinema & {
    distance: number | string; // 距离，单位可选
};

const controller = new AbortController();
const tabbarStore = useTabbarStore()
const cityStore = useCityStore()
const searchvalue = ref('')
const cinemalist = ref<Cinema[] | null>(null)
const cinemalistall = ref<Cinema[] | null>(null)
const cleartel = () => {
    searchvalue.value = ''
}
const searchcinema = computed(() => {

    if (!cinemalistall.value || !searchvalue.value) {
        return []
    }
    const keyword = searchvalue.value.toLowerCase();
    const filtername = cinemalistall.value.filter((item) => {
        return item.name.toLowerCase().includes(keyword) ||
            item.address.toLowerCase().includes(keyword)
    })

    return filtername
})
const gotocinemasDetail = (id: number) => {
    router.push(`/cinemas/${id}/film`)
}
const cinemasWithDistance = computed<CinemaWithDistance[]>(() => {
    if (!cityStore.userCoords) {
        // 如果还没有用户坐标，返回原始数据（距离字段留空）
        return searchcinema.value.map(cinema => ({ ...cinema, distance: "未知" }));
    }
    const { latitude: userLat, longitude: userLng } = cityStore.userCoords;
    return searchcinema.value.map(cinema => {
        const distance = getDistance(
            userLat,
            userLng,
            cinema.latitude,
            cinema.longitude
        );
        return {
            ...cinema,
            distance, // 添加距离字段
        };
    });
});

const sortedCinemas = computed(() => {
    const list = cinemasWithDistance.value;

    return [...list].sort((a, b) => {
        const distA = typeof a.distance === 'number' ? a.distance : Infinity;
        const distB = typeof b.distance === 'number' ? b.distance : Infinity;
        return distA - distB;
    });
}

);
const fetchCinemas = async () => {
    try {
        const [res1, res2] = await Promise.all([//_是占位符号,不用的参数可以用其占位,但是不能在一个数组里出现两个_ 这样是重复声明了,可以用_res4等不同的变量名即可.
            http.get('/gateway/', {
                params: {
                    cityId: cityStore.cityId,
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.film-ticket.cinema.recommend',
                },
                signal: controller.signal,
            }),
            http.get('/gateway/', {
                params: {
                    cityId: cityStore.cityId,
                    ticketFlag: 0,
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.film-ticket.cinema.list',
                },
                signal: controller.signal,
            }),
        ])

        cinemalist.value = res1?.data.data.cinemas
        cinemalistall.value = res2?.data.data.cinemas
    } catch (error) {
        console.log(error)
    }
}
tabbarStore.isTabbarShow = false

onBeforeMount(
    fetchCinemas

)
onUnmounted(() => {
    controller.abort();
});
</script>
<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;


    .search-box {
        // position: sticky;
        // top: 0;
        // left: 0;
        // z-index: 6;
        padding: .625rem .9375rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        // height: 4%;
        // anchor-name: --search-box;
        height: 7vh;
        box-sizing: border-box;
        width: 100vw;
        line-height: 1;
        background-color: #ffffff;
        border-bottom: #cccccc7f solid 1px;

        .search {
            background-color: #d5d5d5;
            padding: 5px 5px;
            width: 80%;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            border-radius: 5px;

            input,
            input:focus,
            input:hover {

                height: 80%;
                border: none;
                outline: none;
                box-shadow: none;
                background: transparent;
            }

            .clearicon {
                margin-left: auto;
            }

        }

    }

    .list-search {

        padding: 0 .9375rem;

        .title {
            color: #bdc0c5;
            font-size: .8125rem;

        }

        .list {

            display: flex;
            justify-content: flex-start;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px 4px;

            span {
                border-radius: 3px;
                font-size: .8125rem;
                background-color: hsla(0, 0%, 95.7%, .6);
                padding: 2px 4px;
                // margin: 4px 8px 0 0px;
                background-color: #d5d5d5;
            }
        }
    }

    .list-wrapper {
        // height: 80vh;
        overflow-y: auto;
        // position-anchor: --sarch-box;
        // top: anchor(bottom);
        // left: anchor(left);
        flex: 1;

        :deep(.van-cell) {
            font-size: 1rem;
            line-height: 1.7;

            .van-cell__title {
                flex-basis: 0%;
                flex-grow: 2;
                flex-shrink: 1;
                width: 50%;


                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;

                .van-cell__label {
                    font-size: 0.8rem;
                    line-height: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;


                }
            }

            .van-cell__value {
                color: orange;
                font-size: 0.7rem;
                flex-basis: 0%;
                flex-grow: 1;
                flex-shrink: 1;

                span {
                    font-size: 1rem;
                    padding-left: 1vw;
                }

                .distance {
                    font-size: 0.6rem;
                    color: #969799;
                }
            }
        }
    }

    .empty-result {
        position: absolute;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 50%;
        font-size: .875rem;
        color: #bdc0c5;

        img {
            width: 50%;
            height: auto;
        }

        .empty-list-tip {
            text-align: center;
            font-size: .6875rem;
        }
    }
}
</style>