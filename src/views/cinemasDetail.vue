<template>
    <div class="backbutton" v-show="!isSticky">
        <van-icon name="arrow-left" @click="goBack" />
    </div>
    <myheader :title="cinema?.name" leftType="back" ref="headerRef" :class="{ sticky: isSticky }" v-show="isSticky" />
    <div class="title">{{ cinema?.name }}</div>
    <div v-show="show_services">
        <div class="services-container" @click="go_services">
            <div class="services">
                <div class="child">{{ cinema?.services?.[0]?.name || '-' }}</div>
                <div class="park">{{ cinema?.services?.[1]?.name || '-' }}</div>
                <van-icon name="arrow" />
            </div>
        </div>
        <div class="address-container">
            <div class="address">
                <van-icon name="location-o" />
                <div>{{ cinema?.address }}</div>
                <van-icon name="phone-o" />
            </div>
        </div>
        <swiper @swiper="onFilmSwiper" :initial-slide="activeFilmIndex" @slideChange="handleSlideChange"
            :slides-per-view="3" :slideToClickedSlide="true" :space-between="20" :centeredSlides="true"
            class="poster-swiper">
            <swiper-slide v-for="film in films" :key="film.filmId">
                <div class="poster" :style="{ backgroundImage: `url(${film.poster})` }"></div>
            </swiper-slide>
            <div class="triangle-container">
                <div class="triangle-up"></div>
            </div>
        </swiper>
        <div class="title-container-isSticky" :class="{ sticky: isSticky_title }"
            :style="{ top: isSticky_title ? headerHeight + 'px' : '' }" ref="title">
            <div class="title-container" @click="gotocinema">
                <div class="title-details">
                    <div class="name">{{ activeFilm?.name }}<span>{{ activeFilm?.grade }}分</span></div>
                    <div class="category">{{ activeFilm?.category }}|{{ activeFilm?.runtime }}分钟|{{ activeFilm?.director
                    }}|{{
                            activeFilm?.actors?.map(actor => actor.name).join(' ')}}</div>
                </div>
                <van-icon name="arrow"></van-icon>
            </div>
            <swiper @swiper="onDateSwiper" :initial-slide="selectedDateIndex" @slideChange="handleDateChange"
                :slides-per-view="3" :slideToClickedSlide="true" :space-between="20" :centeredSlides="true"
                class="date-swiper">
                <swiper-slide v-for="date, index in datemap" :key="date"
                    :class="{ active: index === selectedDateIndex }">
                    <div>{{ date }}</div>
                </swiper-slide>
            </swiper>
        </div>
        <!-- 这里的列表跳转需要做登录验证,使用路由守卫 -->
        <div class="schedule-container">
            <div @click="handleBuy(schedule)" class="schedule" :class="{ 'sold-out': isScheduleSoldOut(schedule) }"
                v-for="schedule, index in schedules" :key="schedule.scheduleId">
                <div class="time">
                    <div>{{ schedule_date[index]?.showAt }}</div>
                    <div class="endAt">{{ schedule_date[index]?.endAt }}散场</div>
                </div>
                <div class="language">
                    <div>{{ schedule.filmLanguage }}{{ schedule.imagery }}</div>
                    <div class="hallName">{{ schedule.hallName }}</div>
                </div>
                <div class="price"><span>¥</span>{{ schedule.salePrice / 100 }}</div>
                <div class="buy"><button>{{ isScheduleSoldOut(schedule) ? '停售' : '购票' }}</button></div>
            </div>
        </div>
    </div>
    <div v-show="!show_services">
        <div v-if="cinema?.services[0]" class="show-services">
            <div class="box">
                <div class="child">{{ cinema?.services?.[0]?.name || '-' }}</div>
            </div>
            <div class="notice">{{ cinema?.services?.[0]?.description }}</div>
        </div>
        <div v-if="cinema?.services[1]" class="show-services">
            <div class="box">
                <div class="park">{{ cinema?.services?.[1]?.name || '-' }}</div>
            </div>
            <div class="notice">{{ cinema?.services?.[1]?.description }}</div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css' // 引入核心样式
import type SwiperType from 'swiper' // 导入 Swiper 类型
import { ref, computed, onBeforeMount, watch, nextTick, onBeforeUnmount, onMounted } from 'vue';
import { http, useSticky } from '@/util/tools.ts'
import { useRoute, useRouter } from 'vue-router';
import { Icon as vanIcon } from 'vant';
import Myheader from '@/components/Myheader.vue'
import useTabbarStore from '@/store/tabbarStore.ts';
import useCinemaStore from '@/store/cinemaStore';
import type { Film,CinemaDetail, Schedule} from '@/types'
// interface Actor {
//     name: string
//     role: string
//     avatarAddress: string
// }

// interface Film {
//     filmId: number
//     name: string
//     director: string
//     poster: string
//     category: string
//     premiereAt: number
//     nation: string
//     runtime: number
//     synopsis: string
//     actors: Actor[]
//     filmType: {
//         name: string
//     }
//     photos: string[]
//     grade: string
//     showDate: number[]
//     // 其他字段按需添加
// }
// interface serve {
//     name: string;
//     description: string;
// }
// interface Cinema {
//     address: string;
//     cinemaId: number;
//     cityId: number;
//     name: string;
//     services: serve[]
//     notice: string;
// }
// interface Schedule {
//     advanceStopMins: number;
//     endAt: number;
//     filmLanguage: string;
//     hallName: string;
//     imagery: string;
//     isOnsell: boolean;
//     marketPrice: number;
//     maxSalePrice: number;
//     minSalePrice: number;
//     salePrice: number;
//     scheduleId: number;
//     showAt: number;
// }
const cinemastore = useCinemaStore();
const now = ref(Date.now() / 1000);
let timer: number | null = null;
const title = ref<HTMLDivElement | null>(null)
const show_services = ref(true)
const headerRef = ref<InstanceType<typeof Myheader> | null>(null) // 组件实例
const headerHeight = ref(0)
const tabbarstore = useTabbarStore();
const route = useRoute();
const router = useRouter();
const activeFilm = ref<Film>()
const activeFilmIndex = ref(0)
const cinemaId = Number(route.params.cinemaid)
const cinema = ref<CinemaDetail | null>(null)
const films = ref<Film[] | null>(null)
const selectedDateIndex = ref(0)
const schedules = ref<Schedule[]>([])
const schedulesCache = ref<Record<string, Schedule[]>>({})
const { isSticky } = useSticky(() => window.scrollY > 10)
const { isSticky: isSticky_title } = useSticky(() => {
    if (!title.value) return false
    if (!isSticky.value) return false   // 关键：myheader 未吸顶时不吸顶
    const rect = title.value.getBoundingClientRect()
    return rect.top <= headerHeight.value
})
const isInitializing = ref(true)
const filmSwiper = ref<SwiperType | null>(null)
const dateSwiper = ref<SwiperType | null>(null)

const onFilmSwiper = (swiper: any) => {
    filmSwiper.value = swiper
}
const onDateSwiper = (swiper: any) => {
    dateSwiper.value = swiper
}
const goBack = () => {
    if (show_services.value === false) {
        show_services.value = true
    } else {
        router.back()
    }
}
const go_services = () => {
    show_services.value = false
}
const gotocinema = () => {
    router.push(`/detail/${activeFilm.value?.filmId}`)
}
const handleSlideChange = (swiper: any) => {
    if (isInitializing.value) return
    activeFilm.value = films.value?.[swiper.activeIndex]
    activeFilmIndex.value = swiper.activeIndex
    selectedDateIndex.value = 0
    console.log("1")
    fetchSchedules()
}
const handleDateChange = (swiper: any) => {
    if (isInitializing.value) return
    selectedDateIndex.value = swiper.activeIndex
    fetchSchedules()
}
const fetchSchedules = async () => {
    if (!activeFilm.value || !cinemaId) return
    const filmId = activeFilm.value.filmId
    const dateTs = activeFilm.value.showDate?.[selectedDateIndex.value]
    if (!dateTs) return

    const cacheKey = `${filmId}_${dateTs}`

    // 命中缓存，直接返回
    if (schedulesCache.value[cacheKey]) {
        schedules.value = schedulesCache.value[cacheKey]
        return
    }

    // 否则发起请求
    try {
        const res = await http({
            url: `/gateway/?filmId=${filmId}&cinemaId=${cinemaId}&date=${dateTs}&k=4514762`,
            headers: {
                'X-Host': 'mall.film-ticket.schedule.list',
                "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3MjY4NzIwNywidXNlcklkIjozMTk0MjU4N30.B0ZW7yJ2mVk0J-KjxxU5cMzsLmkxVWuNFUXhtvD3boE"
            }
        })
        const data = res.data.data?.schedules || []
        // 存入缓存
        schedulesCache.value[cacheKey] = data
        schedules.value = data
        cinemastore.schedulesCache[cacheKey] = data
        console.log(cinemastore.schedulesCache)
    } catch (error) {
        console.error(error)
        schedules.value = []
    }
}

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
const formatDate_schedule = (endAt: Date, showAt: Date) => {
    const endHour = endAt.getHours().toString().padStart(2, '0')//padstart函数是一个字符串方法,要先转为字符串才能用这个方法,确保字符串长度至少为2，不足时在前面补0
    const endMinute = endAt.getMinutes().toString().padStart(2, '0')
    const showHour = showAt.getHours().toString().padStart(2, '0')
    const showMinute = showAt.getMinutes().toString().padStart(2, '0')
    return {
        endAt: `${endHour}:${endMinute}`,
        showAt: `${showHour}:${showMinute}`
    }
}
// 计算属性：返回格式化后的日期字符串数组
const datemap = computed(() => {
    if (!activeFilm.value?.showDate) return []
    // 如果 showDate 是秒级时间戳，需要 *1000；否则直接 new Date(date)
    return activeFilm.value.showDate.map((ts) => {
        const date = new Date(ts * 1000) // 如果已经是毫秒，去掉 *1000
        return formatDateItem(date)
    })
})
const schedule_date = computed(() => {
    return schedules.value?.map((item) => {
        const endAt = new Date(item.endAt * 1000)
        const showAt = new Date(item.showAt * 1000)
        return formatDate_schedule(endAt, showAt)
    })
})
const isScheduleSoldOut = (schedule: Schedule) => {
    const stopTime = schedule.showAt - schedule.advanceStopMins * 60;
    return now.value >= stopTime;
}

// 购票点击处理（示例跳转到选座页）
const handleBuy = (schedule: Schedule) => {
    // 可根据实际需求调整路由
    router.push(`/schedule/${schedule.scheduleId}/${activeFilm.value?.showDate[selectedDateIndex.value]}`);
}
watch(isSticky, async (newVal) => {
    if (newVal) {
        await nextTick()
        if (headerRef.value) {
            headerHeight.value = headerRef.value.$el.offsetHeight
        }
    } else {
        headerHeight.value = 0
    }
    window.dispatchEvent(new Event('scroll'))
})
// onBeforeMount(() => {
// console.log("执行行藏")
// })
onBeforeMount(async () => {

    tabbarstore.change(false)
    try {
        const res_cinema = await http({
            url: `/gateway/?cinemaId=${cinemaId}&k=7706601`,
            headers: {
                'X-Host': 'mall.film-ticket.cinema.info'
            }
        })
        const res_film = await http({
            url: `/gateway/?cinemaId=${cinemaId}&k=7706601`,
            headers: {
                'X-Host': 'mall.film-ticket.film.cinema-show-film'
            }
        })
        cinema.value = res_cinema.data.data.cinema
        films.value = res_film.data.data.films

    } catch (error) {
        console.log(error)
    } finally {
        isInitializing.value = true  // 进入初始化模式
        try {
            if (films.value && route.params.filmid && route.params.date) {
                const index1 = films.value?.findIndex(item => item.filmId === Number(route.params.filmid)) ?? 0
                const index2 = films.value?.[index1]?.showDate.indexOf(Number(route.params.date)) ?? 0
                activeFilmIndex.value = Math.max(0, index1);
                activeFilm.value = films.value[activeFilmIndex.value]
                selectedDateIndex.value = Math.max(0, index2)
                await nextTick()
                if (filmSwiper.value) {
                    filmSwiper.value.slideTo(activeFilmIndex.value, 0)
                }
                if (dateSwiper.value) {
                    dateSwiper.value.slideTo(selectedDateIndex.value, 0)
                }
            } else {
                // activeFilmIndex.value = 0
                activeFilm.value = films.value?.[0]
                // selectedDateIndex.value = 0
                await nextTick()
                if (filmSwiper.value) {
                    filmSwiper.value.slideTo(activeFilmIndex.value, 0) // 0 表示无动画跳转
                }
                if (dateSwiper.value) {
                    dateSwiper.value.slideTo(selectedDateIndex.value, 0)
                }
            }
            await fetchSchedules()
        } finally {
            isInitializing.value = false  // 初始化完成，恢复正常响应
        }

    }
})
onMounted(() => {
    // 每分钟更新一次，你也可以改为 30 秒或更短
    timer = setInterval(() => {
        now.value = Date.now() / 1000;
    }, 60000); // 60 * 1000 ms
});
onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
});
</script>
<style scoped lang="scss">
.backbutton {
    width: 100%;
    height: 7vh;
    font-size: 1rem;
    display: flex;
    background-color: rgb(255, 255, 255);
    align-items: center;

    .van-icon {
        margin-left: .625rem;

    }
}

.title {
    width: clamp(200px, 73vw + 1rem, 90%);

    font-size: 1.25rem;
    text-align: center;
    margin: .625rem auto;
    letter-spacing: 0.2rem;
}

.sticky {
    position: sticky;
    top: 0px;
    background-color: white;
    z-index: 100;
}

title-container-isSticky.sticky {
    position: sticky;
    background-color: white;
    z-index: 99;
    /* 略低于 header 的 100，避免遮挡 */
    /* top 已通过内联样式动态设置 */
}

.services-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #cccccc8c;

    padding: 5px 0;
    margin-bottom: .625rem;

    .services {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 27%;
        height: 100%;
        font-size: 0.9rem;
        color: orange;
        line-height: 1;

        .child,
        .park {
            text-wrap: nowrap;
            margin-right: .35rem;
            padding: .1rem .375rem;
            border-color: orange;
            border-top: 2px solid;
            border-bottom: 2px solid;
            border-right: 2px solid;
        }

    }
}

.address-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: auto;
    padding: .3125rem 0;
    font-size: 1rem;
    line-height: 1;

    .address {
        display: flex;
        align-items: center;
        width: clamp(300px, 60vw + 1rem, 90%);
        justify-content: center;

        .van-icon {
            padding: 0 .8rem
        }
    }

}

.poster-swiper {
    width: 100%;
    overflow: hidden;
    background: radial-gradient(rgb(255, 130, 130), rgb(255, 88, 17));
    height: clamp(10rem, 24vh + 1rem, 30rem);

    .swiper-slide {
        display: flex;
        align-items: center;
        transition: 300ms;
        transform: scale(0.8);
        height: 95%;

        .poster {
            width: 100%;
            height: 90%;
            background-position: center;
            background-size: cover;
            border-radius: .25rem;
        }
    }

    .swiper-slide-active {
        transform: scale(1);
    }
}

.triangle-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;

    .triangle-up {
        position: absolute;
        bottom: 0;
        margin: 0 auto;
        width: 0;
        height: 0;
        border-left: .625rem solid transparent;
        /* 左边框透明，宽度 50px */
        border-right: .625rem solid transparent;
        /* 右边框透明，宽度 50px */
        border-bottom: .625rem solid rgb(255, 255, 255);
        /* 底部边框红色，宽度 100px */
    }
}

.title-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    font-size: 1rem;
    height: 10vh;
    line-height: 1.7;

    .title-details {
        flex: 6;
        min-width: 0;

        .name {

            text-align: center;

            span {
                color: orange;
                font-size: 1.1rem;
                font-style: italic;
                padding-left: .4875rem;
            }
        }

        .category {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            color: #797d82;
            margin-left: 1.625rem;
            font-size: 0.9rem;
        }
    }

    .van-icon {
        flex: 1;
        text-align: center;
    }
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

.schedule-container {
    width: 100%;

    // padding: .625rem .625rem;
    line-height: 1.6;

    .sold-out {
        color: #ccc !important;
        pointer-events: none;

        .price,
        .endAt,
        .hallName,
        button {
            color: #ccc !important;
            border-color: #ccc !important;
        }
    }

    .schedule {
        display: flex;
        align-items: center;
        width: 100%;
        padding: .625rem .625rem;
        border-bottom: 1px solid #d8d8d8;
        box-sizing: border-box;

        .time {
            flex: 1.3;

            .endAt {
                font-size: 0.9rem;
                color: #797d82;
            }
        }

        .language {
            flex: 2;
            overflow: hidden;



            .hallName {
                font-size: 0.9rem;
                color: #797d82;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }

        .price {
            flex: 1;
            text-align: center;
            color: orange;
            font-size: 1.1rem;
        }

        .buy {
            flex: 1;
            text-align: center;

            button {
                font-size: 1rem;
                color: orange;
                border: 0.1875rem solid orange;
                background-color: #ffffff;
            }
        }

        .price {
            flex: 1;
            text-align: center;

            span {
                font-size: 0.9rem;
            }
        }

        .buy {
            flex: 1;
            text-align: center;

            button {
                font-size: 1rem;
                color: orange;
                border: 0.1875rem solid orange;
                background-color: #ffffff;
                border-radius: .375rem;
                padding: 0.025rem 0.7125rem;
            }
        }
    }
}

.show-services {
    display: flex;
    width: 100%;
    padding: 0.425rem 2.025rem;
    box-sizing: border-box;
    font-size: 0.8rem;

    .box {
        margin-right: 2.45rem;
        width: clamp(34px, 2vh + 1rem, 60px)
    }

    .child,
    .park {
        text-wrap: nowrap;
        padding: 0 .375rem;
        border: 2px solid orange;
        text-align: center;
        height: clamp(10px, 0.6vh + 1rem, 30px);
        color: orange;
        width: fit-content;
    }

    .notice {
        color: #797d82;
        flex: 1;

    }
}
</style>