<template>
    <van-swipe class="my-swipe" :autoplay="3000" lazy-render indicator-color="blue">
        <van-swipe-item v-for="image in images" :key="image">
            <img :src="image" />
        </van-swipe-item>
    </van-swipe>

    <div class="header" ref="headerRef">
        <!-- <myheader leftType="city" :showSearch="false" v-show="isSticky" /> -->
        <ul class="options">
            <li v-for="tab in tabs" :key="tab.path">
                <router-link custom :to="tab.path" v-slot="{ isActive, navigate }">
                    <span @click="navigate" :class="{ 'kerwinactive': isActive }">{{ tab.name }}</span>
                </router-link>
            </li>
        </ul>
    </div>
    <router-view class="list" v-slot="{ Component }">
        <transition name="fade" mode="out-in">
            <component :is="Component" />
        </transition>
    </router-view>
</template>

<script lang="ts" setup>
import { useSticky } from '@/util/tools'
import { ref, } from 'vue';
import { Swipe as vanSwipe, SwipeItem as vanSwipeItem, /* NavBar as vanNavBar, Icon as vanIcon */ } from 'vant';
// import Myheader from '@/components/Myheader.vue';

// const headerRef = ref<HTMLElement | null>(null);
const tabs = [
    { path: '/films/nowplaying', name: '正在热映' },
    { path: '/films/comingsoon', name: '即将上映' }
]
const images = ref(['https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',]);
/* const images = ref(["http://localhost:3000/images/0/a.jpg",
                    "http://localhost:3000/images/0/b.jpg",
                    "http://localhost:3000/images/0/c.jpg"]); */





// const { isSticky } = useSticky(() => {
//     if (!headerRef.value) return false
//     const rect = headerRef.value.getBoundingClientRect()
//     return rect.top <= 0 && window.scrollY > 0
// })



</script>
<style scoped lang="scss">
// @media (max-width: $breakpoint-xl ) {
//     .my-swipe {
//         aspect-ratio: 4/2;
//     }

// }

// @media (max-width: $breakpoint-lg) {
//     .my-swipe {
//         aspect-ratio: 16/9;
//     }
// }



// @media (max-width: $breakpoint-md) {
//     .my-swipe {
//         aspect-ratio: 2/1;
//     }

// }


// @media (max-width: $breakpoint-sm) {
//     .my-swipe {
//         aspect-ratio: 1.8/1;
//     }

// }

.my-swipe {
    background-color: rgb(255, 255, 255);
    max-height: 30%;
    height: 20%;

    .van-swipe-item {


        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center center;
        }
    }
}


.header {
    position: sticky;
    top: 0px;
    z-index: 100;
    background-color: white;
    display: flex;
    align-items: center;
    // flex-direction: column;
    border-bottom: .0625rem solid rgb(207, 203, 203);
    text-align: center;
    // max-height: 10%;
    // height: 8%;
height: clamp(38px, 29.5px + 1.5rem, 86px);
    .options {
        flex: 1;
        display: flex;
        align-items: center;

        li {

            flex: 1;

            span {
                margin: 10px 0;
            }

            .kerwinactive {
                color: orange;
                border-bottom: .1875rem solid orange;
                font-size: $font-size-md;
                font-weight: $font-weight-base ;
                line-height: 1;
            }
        }


    }
}

.list {
    height: auto;
    overflow-y: auto;
}
</style>
<style lang="scss">
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>