<template>

    <div class="head">
        <myheader leftType="city" :showSearch="true" />
        <van-dropdown-menu ref="menuRef" active-color="orange">
            <!-- <van-dropdown-item title="筛选" ref="itemRef"/> -->
            <van-dropdown-item v-model="store.selectedDistrict" :options="store.districtOptions" />

            <!-- 订票类型：绑定 selectedType，选项固定 -->
            <van-dropdown-item v-model="store.selectedType" :options="store.typeOptions" />

            <!-- 排序方式：绑定 selectedSort，选项固定 -->
            <van-dropdown-item v-model="store.selectedSort" :options="store.sortOptions" />

        </van-dropdown-menu>
    </div>


    <div class="list-wrapper">
        <van-cell center :title="cinema.name" :label="cinema.address" v-for="cinema in store.sortedCinemas"
            :key="cinema.cinemaId" :to="'/cinemas/' + cinema.cinemaId + '/film'">
            <div>
                <div>¥<span> {{ cinema.lowPrice / 100 }} </span>起</div>
                <div class="distance">距离{{ cinema.distance }}km</div>
            </div>
        </van-cell>
    </div>
</template>

<script setup lang="ts">
import Myheader from '@/components/Myheader.vue';
import { onBeforeMount } from 'vue'
import useCinemaStore from '../store/cinemaStore';
import useCityStore from '../store/cityStore';
import {
    DropdownMenu as vanDropdownMenu,
    DropdownItem as vanDropdownItem,
    Cell as vanCell
} from 'vant';
import useTabbarStore from '@/store/tabbarStore';
// import { useRouter } from 'vue-router'
// const router = useRouter()
const tabbarStore = useTabbarStore()
const store = useCinemaStore()
const cityStore = useCityStore()

onBeforeMount(async () => {
    tabbarStore.change(true)
    await cityStore.ensureCityReady()

    if (store.oldcinemaList.length === 0 || cityStore.cityId !== cityStore.copycityId) {
        //请求数据
        await store.getCinemaList()
        // console.log(store.cinemasWithDistance)
        //隐藏代码
    } else {
        // console.log("缓存", store.cinemaList)
    }
})

</script>
<style scoped lang="scss">
.head {
    position: sticky;
    top: 0;
    z-index: 100;

    // :deep(.van-nav-bar__left) {
    //     width: 30%;

    //     div {
    //         text-align: left;
    //         flex: 1;

    //         span {
    //             font-size: .9rem;
    //             text-wrap: nowrap;
    //             width: 40%;
    //             overflow-x:clip;
    //             text-overflow: ellipsis;
    //         }
    //     }

    // }
}

:deep(.van-dropdown-menu) {
    height: 6vh;

    .van-dropdown-menu__bar {
        height: inherit;

        .van-dropdown-menu__title {
            font-size: 1rem;
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
    height:fit-content;
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
<!-- position: sticky;
    top: 0;
    z-index: 100;
    background-color: white;
    height: 6vh;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center; -->