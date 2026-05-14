<template>

    <myheader leftType="back" :title="film?.name" :showSearch="true" class="head" />
    <swiper @slideChange="handleDateChange" :slides-per-view="3" :slideToClickedSlide="true" :space-between="20"
        :centeredSlides="true" class="date-swiper">
        <swiper-slide v-for="date, index in datemap" :key="date" :class="{ active: index === selectedDateIndex }">
            <div>{{ date }}</div>
        </swiper-slide>
    </swiper>
    <van-dropdown-menu ref="menuRef" active-color="orange">
        <van-dropdown-item v-model="selectedDistrict" :options="districtOptions" />
        <van-dropdown-item v-model="selectedSort" :options="sortOptions" />

    </van-dropdown-menu>


    <div class="list-wrapper">
        <van-cell center :title="cinema.name" :label="cinema.address" v-for="cinema in sortedCinemas"
            :key="cinema.cinemaId" :to="'/cinemas/' + cinema.cinemaId + '/film/' + route.params.id +'/'+ activeshowDate">
            <div>
                <div>¥<span> {{ cinema.lowPrice / 100 }} </span>起</div>
                <div class="distance">距离{{ cinema.distance }}km</div>
            </div>
        </van-cell>
    </div>
</template>

<script setup lang="ts">
import { getDistance } from "@/util/tools.ts";
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css' // 引入核心样式
import { http } from '@/util/tools.ts'
import Myheader from '@/components/Myheader.vue';
import { useRoute } from 'vue-router'
import { computed, ref, onBeforeMount  } from 'vue'
import useTabbarStore from '@/store/tabbarStore.ts';
// import { useCinemaStore } from '@/store/cinemaStore';
// import useCinemaStore from '../store/cinemaStore';
import useCityStore from '../store/cityStore';
import {
    DropdownMenu as vanDropdownMenu,
    DropdownItem as vanDropdownItem,
    Cell as vanCell
} from 'vant';
interface Actor {
    name: string
    role: string
    avatarAddress: string
}

interface Film {
    filmId: number
    name: string
    poster: string
    category: string
    premiereAt: number
    nation: string
    runtime: number
    synopsis: string
    actors: Actor[]
    filmType: {
        name: string
    }
    photos: string[]
    grade: string
    // 其他字段按需添加
}
interface showCinemas {
    cinemaList: number[];
    showDate: number
}
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
// const router = useRouter()

const tabbarstore = useTabbarStore()
const selectedDateIndex = ref(0)
const handleDateChange = (swiper: any) => {
    selectedDateIndex.value = swiper.activeIndex
    activeshowDate.value = showCinemas.value[swiper.activeIndex]?.showDate
    fetchCinemas()
}
const route = useRoute()
// const store = useCinemaStore()
const cityStore = useCityStore()
const film = ref<Film | null>(null)
const showCinemas = ref<showCinemas[]>([])
const activeshowDate = ref()
const cinemas = ref<Cinema[]>([])
const cinemasCache = ref<Record<string, Cinema[]>>({})
const selectedDistrict = ref(''); // 地区名，''表示全城
const selectedSort = ref<'a' | 'b'>('a'); // 排序：a-最近去过，b-离我最近
const sortOptions = [
    { text: '最近去过', value: 'a' },
    { text: '离我最近', value: 'b' },
];

const formatDateItem = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekday = weekdays[date.getDay()]

    if (date.toDateString() === today.toDateString()) return `今天 ${month}月${day}日`
    if (date.toDateString() === tomorrow.toDateString()) return `明天 ${month}月${day}日`
    if (date.toDateString() === dayAfterTomorrow.toDateString()) return `后天 ${month}月${day}日`
    return `${weekday} ${month}月${day}日`
}
const datemap = computed(() => {

    // 如果 showDate 是秒级时间戳，需要 *1000；否则直接 new Date(date)
    return showCinemas.value.map((item) => {
        const date = new Date(item.showDate * 1000) // 如果已经是毫秒，去掉 *1000
        return formatDateItem(date)
    })
})
const districtOptions = computed(() => {
    const allDistricts = cinemas.value.map(item => item.districtName);
    const unique = [...new Set(allDistricts)];
    // 添加“全城”选项作为第一个
    return [{ text: '全城', value: '' }, ...unique.map(name => ({ text: name, value: name }))];
});
const cinemasWithDistance = computed<CinemaWithDistance[]>(() => {
    if (!cityStore.userCoords) {
        // 如果还没有用户坐标，返回原始数据（距离字段留空）
        return cinemas.value.map(cinema => ({ ...cinema, distance: "距离未知" }));
    }
    const { latitude: userLat, longitude: userLng } = cityStore.userCoords;
    return cinemas.value.map(cinema => {
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
// 计算属性：过滤后的影院列表（同时应用类型和地区筛选）
const filteredCinemas = computed(() => {
    return cinemasWithDistance.value.filter(item => {
        // 地区筛选（如果 selectedDistrict 不为 null）
        if (selectedDistrict.value && item.districtName !== selectedDistrict.value) return false;
        return true;
    });
});
const sortedCinemas = computed(() => {
    const list = filteredCinemas.value;

    return [...list].sort((a, b) => {
        const distA = typeof a.distance === 'number' ? a.distance : Infinity;
        const distB = typeof b.distance === 'number' ? b.distance : Infinity;
        return distA - distB;
    });
}

);
const fetchCinemas = async () => {
    if (!showCinemas.value[selectedDateIndex.value]) return
    const showDate = showCinemas.value[selectedDateIndex.value]?.showDate

    const cacheKey = `${showDate}`

    // 命中缓存，直接返回
    if (cinemasCache.value[cacheKey]) {
        cinemas.value = cinemasCache.value[cacheKey]
        return
    }

    // 否则发起请求
    try {
        const res3 = await http.post(
            `/gateway?k=7706601`,
            {
                cityId: cityStore.cityId,
                cinemaIds: showCinemas.value[selectedDateIndex.value]?.cinemaList.join(','),
            },
            {
                headers: {
                    'X-Host': 'mall.film-ticket.cinema.batch-cinema'
                }
            }
        )
        const data = res3.data.data.cinemas
        // 存入缓存
        cinemasCache.value[cacheKey] = data
        cinemas.value = data
    } catch (error) {
        console.error(error)
        cinemas.value = []
    }
}
  
onBeforeMount(async () => {
  tabbarstore.change(false)
    await cityStore.ensureCityReady()
    try {
        const res1 = await http({
            url: `/gateway?filmId=${route.params.id}&k=7706601`,
            headers: { 'X-Host': 'mall.film-ticket.film.info' }
        })
        const res2 = await http({
            url: `/gateway/?filmId=${route.params.id}&cityId=${cityStore.cityId}&k=7706601`,
            headers: { 'X-Host': 'mall.film-ticket.cinema.film-show-cinema' }
        })
        film.value = res1.data.data.film
        showCinemas.value = res2.data.data.showCinemas
    } catch (error) {
        console.error(error)
    } finally {
        if (showCinemas.value) {
              activeshowDate.value = showCinemas.value[0]?.showDate
            selectedDateIndex.value = 0
            await fetchCinemas()
        }
    }
})

</script>
<style scoped lang="scss">
.head {
    position: sticky;
    top: 0;
    z-index: 100;
}

.date-swiper {
    height: clamp(40px, 4vh + 1rem, 60px);
    border-top: 1px solid #d8d8d8;

    border-bottom: 1px solid #d8d8d8;

    .swiper-slide {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        text-wrap: nowrap;
        //  div {
        //       color: inherit;
        //       font-size: 1rem;
        //       transition: all 3s;
        //     }

        // 激活状态：下划线橙色 + 文字放大变橙
        &.active {
            div {
                color: orange;
                font-size: 1.1rem;
                font-weight: bold;
                transition: all 0.2s;
            }

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background-color: orange;
            }
        }
    }
}

.van-dropdown-menu {
    height: 6vh;

    :deep( .van-dropdown-menu__bar ) {
        height: inherit;

        .van-dropdown-menu__title {
            font-size: 1rem ;
            line-height: 1;
        }



    }
}

:deep(.van-dropdown-item__option) {
    font-size: 0.9rem;
    line-height: 1;
    padding: 1vh 1vh;
}

.list-wrapper {
    overflow-y: auto;

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
</style>
