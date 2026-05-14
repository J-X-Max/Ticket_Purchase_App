<template>
  <div class="container">
    <myheader class="head" leftType="back" :title="'当前城市-' + citytitleName" />
    <div class="input-box">
      <div>
        <van-icon name="search" color="black" />
        <input v-model="searchvalue" @focus="handleFocus" type="text" name="cityname" placeholder="输入城市名或拼音">
        <van-icon v-if="searchvalue&&showclose" @click="searchvalue = ''" name="close" color="black" />
      </div>

      <span v-if="showcancel" @click="hanldcancel">取消</span>
    </div>
    <div v-if="forceShowRecommend || !searchvalue" class="recommend-city">

      <div class="title">GPS定位你所在的城市</div>
      <div class="item-box">
        <div class="item" @click="gotopositioncity" :class="{ 'disabled': Disabled }">{{ cityName }}</div>
      </div>


      <div class="title">热门城市</div>
      <div class="item-box">
        <div class="item" @click="handleChange(item)" v-for="item in hotcitylist" :key="item.cityId">{{ item.name }}
        </div>
      </div>


      <div class="city-list">
        <van-index-bar :index-list="indexList">
          <div v-for="item in datalist" :key="item.type">
            <van-index-anchor :index="item.type" />
            <van-cell :title="data.name" v-for="data in item.list" :key="data.cityId" @click="handleChange(data)" />

          </div>
        </van-index-bar>
      </div>

    </div>
    <template v-else>

      <div v-if="filtersearchcity.length" class="searchlist">

        <van-cell :title="item.name" v-for="item in filtersearchcity" :key="item.cityId" @click="handleChange(item)" />
      </div>
      <div v-else="!filtersearchcity.length" class="empty-result">
        <img
          src="data:image/png;base64,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">
        <p>没有找到匹配的城市</p>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import Myheader from '@/components/Myheader.vue';
import { http } from '@/util/tools.ts'
import { ref, computed, onBeforeMount, onBeforeUnmount, watch } from 'vue'
import _ from 'lodash'
import { Icon as VanIcon, IndexBar as vanIndexBar, IndexAnchor as vanIndexAnchor, Cell as vanCell } from 'vant';
import useCityStore from '../store/cityStore.ts'
import useTabbarStore from '../store/tabbarStore.ts'
import { useRouter } from 'vue-router'

interface City {
  name: string,
  cityId: number,
  pinyin: string,
  isHot: number,
  // 可根据实际接口字段补充
}
interface CityGroup {
  type: string
  list: City[]
}
const forceShowRecommend = ref(false);
const controller = new AbortController();
const hotcitylist = ref()
const showclose = ref(false)
const Disabled = ref(false);
// const searchList = ref<City[]| null>(null)
const searchvalue = ref('')
const showcancel = ref(false)
const router = useRouter()
const cityStore = useCityStore()
const tabbarstore = useTabbarStore()
const datalist = ref<CityGroup[]>([])
const cityName = ref('')
const cityId = ref()
const origincitylist = ref()
const citytitleName = ref('')
const hanldcancel = () => {
  showcancel.value = false
  showclose.value = false
  console.log(showclose.value)
  forceShowRecommend.value = true;
}
// 输入框聚焦时
const handleFocus = () => {
  console.log(1)
  if(searchvalue.value){
    showclose.value = true
  }else{
showclose.value = false
  }
  showcancel.value = true;
  forceShowRecommend.value = false; // 恢复正常搜索逻辑
};
const gotopositioncity = () => {
  cityStore.change(cityName.value, cityId.value)
  // router.go(-1) // 返
  router.push('/films')
}

watch(searchvalue, () => {
  if (searchvalue.value) {
    showclose.value = true;
    console.log(-1)
  } else {
    showclose.value = false;
  }
  // forceShowRecommend.value = false;
})
onBeforeMount(async () => {
  tabbarstore.change(false)

  await cityStore.ensureCityReady()
  if (cityStore.locationsuccess) {
    cityName.value = cityStore.cityName
    citytitleName.value =cityStore.cityName
    cityId.value = cityStore.cityId
  } else {
    cityName.value = '定位失败'
    Disabled.value = true
  }

  var res1 = await http({
    url: "/gateway?k=7605862",
    headers: {
      'X-Host': 'mall.film-ticket.city.list'
    },
    signal: controller.signal,
  })
  hotcitylist.value = filterHotcity(res1.data.data.cities)
  datalist.value = filterCity(res1.data.data.cities)
  origincitylist.value = res1.data.data.cities
})
// onMounted(
//   async () => {
//       await cityStore.ensureCityReady()
//     console.log(cityStore.locationsuccess)
//     console.log(cityStore.userCoords)
//     var res1 = await http({
//       url: "/gateway?k=7605862",
//       headers: {
//         'X-Host': 'mall.film-ticket.city.list'
//       }
//     })
//     if (cityStore.locationsuccess) {
//      const res2 =await http({
//         url: "/gateway?k=7605862",
//         headers: {
//           'X-Host': 'mall.film-ticket.city.locate',
//           'Latitude':cityStore.userCoords?.latitude,
//           'Longitude':cityStore.userCoords?.longitude
//         }
//       })

//     hotcity.value = res2.data.data.city
//     }
//     // console.log(res.data.data.cities)

//     datalist.value = filterCity(res1.data.data.cities)
//   })

const indexList = computed(() => datalist.value.map(item => item.type))
// const filterCity = (cities)=>{
//     var letterArr =[]
//     for(let i=65;i<91;i++){
//         letterArr.push(String.fromCharCode(i))
//     }
//     // console.log(letterArr)

//     // console.log(cities.filter(item=>item.pinyin.substring(0,1).toUpperCase()==="B"))

//     var newCities = []

//     for(let i=0;i<letterArr.length;i++){
//         newCities.push({
//             type:letterArr[i],
//             list:cities.filter(item=>item.pinyin.substring(0,1).toUpperCase()===letterArr[i])
//         })
//     }

//     newCities = newCities.filter(item=>item.list.length)

//     console.log(newCities)
// }
const filterHotcity = (cities: City[]): City[] => {
  return cities.filter((item) => item.isHot === 1)
}
const filtersearchcity = computed(() => {

  if (!origincitylist.value || !searchvalue.value) {
    return []
  }
  const keyword = searchvalue.value.toLowerCase();
  const filtername = origincitylist.value.filter((item: City) => {
    return item.name.toLowerCase().includes(keyword) ||
      item.pinyin.toLowerCase().includes(keyword)
  })

  return filtername
})
const filterCity = (cities: City[]): CityGroup[] => {

  //分组 -- lodash 
  cities.sort((a, b) => {
    const codeA = a.pinyin[0]?.toUpperCase().charCodeAt(0) ?? 0;
    const codeB = b.pinyin[0]?.toUpperCase().charCodeAt(0) ?? 0;
    return codeA - codeB;   //??  表示左边为undefinde和null返回右边的值,
    // 而||会在左侧为假值（如 0、""、false、NaN 等）时返回右侧 ,这里主要是解决字符串为空的情况

  });

  const groupObj = _.groupBy(cities, item => item.pinyin[0]?.toUpperCase() ?? '');
  // ✅ 使用 Object.entries 避免 undefined 问题 
  /*    之前你用 for...in 遍历 groupObj，并通过 groupObj[i] 取值，
     TypeScript 无法保证 groupObj[i] 一定存在，所以报 City[] | undefined 的类型错误。
     而 Object.entries 只会遍历实际存在的属性，并且每个 list 的类型被安全地推断为 City[]（因为 groupObj 的值就是 City[] 类型），
     从而避免了 undefined 的可能。 */


  const newCities: CityGroup[] = Object.entries(groupObj).map(([type, list]) => ({
    type,
    list,
  }));

  return newCities;
}

const handleChange = (city: City) => {
  cityStore.change(city.name, city.cityId)
  // router.go(-1) // 返回上一页
  router.push('/films')
}
onBeforeUnmount(() => {
  tabbarstore.change(true)
  controller.abort();
})
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;

  .head {
    flex-shrink: 0;
    // height: 50px;
    // z-index: 3000;
    // position: sticky;
    // top: 0;
    //  left: 0; 
  }

  .input-box {
    padding: .5rem .9375rem;
    background-color: #f4f4f4;
    display: flex;
    align-items: center;
    justify-content: space-between;

    div {
      display: flex;
      align-items: center;
      border-radius: 5px;
      padding: .3125rem .5rem;
      background-color: #fff;
      flex: 1;

      input {
        margin-left: .3125rem;
        flex: 1;

        border: none;
        background-color: transparent;
        outline: none;
        box-shadow: none;
      }
    }

    span {
      margin-left: .9375rem;
    }
  }

  .recommend-city {
    flex: 1;
    overflow-y: auto;
    padding: .625rem .9375rem;

    .title {
      font-size: .9rem;
    }

    .item-box {
      padding: .3125rem .625rem;
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      align-items: center;
      gap: .625rem .625rem;

      .disabled {
        pointer-events: none
      }

      .item {
        font-size: .9rem;
        padding: .3125rem 1.25rem;
        background-color: #f4f4f4;
        border-radius: 3px;
      }
    }

  }

  .empty-result {
    width: 100%;
    display: flex;
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    img {
      width: 30%;
    }

    p {
      color: #bdc0c5;
      font-size: .875rem;
    }
  }
}
</style>