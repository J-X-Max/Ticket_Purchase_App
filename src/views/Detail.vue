<template>
    <div v-if="film && isDetailVisible" class="detail-container">
          <div class="backbutton" v-show="!isSticky">

      <van-icon name="arrow-left" @click="goBack" />
    </div>
    <myheader  :title="film?.name" leftType="back" :class="{ sticky: isSticky }" v-show="isSticky" />
      <!-- 背景海报 -->
      <div class="poster" :style="{ backgroundImage: `url(${film.poster})` }"></div>

        <div class="backgroundcolor">
          <div class="film-name"> 
            <div class="film-info">
    {{ film.name }} 
    <span class="film-type">{{ film.filmType.name }}</span> 
  </div>
  <!-- 评分单独放在右边 -->
  <span class="grade"> {{ film.grade }} <span>分</span></span>
             </div>

          <div class="info-section">
            <div class="detail-text">{{ film.category }}</div>
            <div class="detail-text">
              {{ formatDate(film.premiereAt) }} 上映
            </div>
            <div class="detail-text">
              {{ film.nation }} | {{ film.runtime }} 分钟
            </div>
            <div class="detail-text synopsis" :class="{ hidden: isSynopsisHidden }">
              {{ film.synopsis }}
            </div>
            <div class="toggle-btn">
              <van-icon @click="isSynopsisHidden = !isSynopsisHidden"
                :name="isSynopsisHidden ? 'arrow-down' : 'arrow-up'" />
            </div>
          </div>
        </div>


        <div class="actors-section backgroundcolor">
          <div class="section-title">演职人员</div>
          <!-- 使用 Swiper 组件 -->
          <swiper :slides-per-view="3" :space-between="20" class="actors-swiper">
            <swiper-slide v-for="actor in film.actors" :key="actor.name">
              <div class="avatar" :style="{ backgroundImage: `url(${actor.avatarAddress})` }"></div>
              <div class="actor-name">{{ actor.name }}</div>
              <div class="actor-role">{{ actor.role }}</div>
            </swiper-slide>
          </swiper>
        </div>

        <div class="actors-section backgroundcolor">
          <div class="section-title" @click="gophotos">剧照<span class="section-title-right">全部({{ film.photos.length }})
              <van-icon name="arrow" /> </span>

          </div>
          <!-- 使用 Swiper 组件 -->
          <swiper :slides-per-view="3" :space-between="20" class="actors-swiper">
            <swiper-slide v-for="photos in film.photos" :key="photos">
              <div class="avatar" :style="{ backgroundImage: `url(${photos})` }"></div>
            </swiper-slide>
          </swiper>
        </div>

  <div class="goSchedule" @click="gocinemas"><div>选座购票</div></div>
  <div class="end"></div>
    </div>
    <div v-else-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
  <showphotos v-if="!isDetailVisible" :show="film?.photos"  @back="handlePhotosBack" />
</template>


<script setup lang="ts">
import useTabbarStore  from '@/store/tabbarStore.ts'
import { ref, onMounted,onBeforeMount,onBeforeUnmount } from 'vue'
import { useRoute, useRouter /* onBeforeRouteUpdate  */ } from 'vue-router'
import { http, useSticky } from '@/util/tools'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css' // 引入核心样式
import Myheader from '@/components/Myheader.vue'
import { Icon as vanIcon } from 'vant';
import showphotos from '@/components/Showphotos.vue'
// 类型定义
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
const tabbarstore = useTabbarStore()
const isDetailVisible = ref(true)
const { isSticky } = useSticky(() => window.scrollY > 10)
const route = useRoute()
const router = useRouter()
const film = ref<Film | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const isSynopsisHidden = ref(true) // 控制剧情简介展开/收起

// 格式化日期
const formatDate = (timestamp: number) => {
  if (!timestamp) return ''

  const date = new Date(timestamp * 1000)

  // 辅助函数：如果数字小于 10，在前面补 '0'
  const pad = (n: number) => n < 10 ? `0${n}` : `${n}`

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1) // 记得 +1
  const day = pad(date.getDate())

  return `${year}-${month}-${day}`
}

// 获取电影详情
const fetchFilm = async (filmId: string | string[]) => {
  loading.value = true
  error.value = null
  try {
    const res = await http({
      url: `/gateway?filmId=${filmId}&k=5501344`,
      headers: { 'X-Host': 'mall.film-ticket.film.info' }
    })
    film.value = res.data.data.film
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = '请求失败'
    }
    console.error(err)
  } finally {
    loading.value = false
    console.log(film.value)
  }
}
const goBack = () => {
  router.back()
}
const gophotos = () => {
  isDetailVisible.value = false
}
const gocinemas = () => {
  router.push(`/detail/${route.params.id}/cinemas`)
}
const handlePhotosBack = () => {
  isDetailVisible.value = true
}
// 初始化加载
onBeforeMount(()=>{
    tabbarstore.change(false)
})
onMounted(() => {
  const filmId = route.params.id
  if (filmId) fetchFilm(filmId)
})
onBeforeUnmount(()=>{
    tabbarstore.change(true)
})
// 路由参数变化时重新获取（例如从一部电影详情跳转到另一部）
// onBeforeRouteUpdate(async (to) => {
//   const filmId = to.params.id
//   if (filmId) await fetchFilm(filmId)
// })
</script>

<style scoped lang="scss">
.backbutton {
  width: 1.25rem;
  height: 1.25rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  position: fixed;
  top: .375rem;
  left: .625rem;
  background-color: rgb(228, 215, 215);
  border-radius: 50%;
}

.backgroundcolor {
  background-color: white;
  padding: .83rem;
}

.sticky {
  position: sticky;
  top: 0px;
  background-color: white;
  z-index: 100;
}

.poster {

  width: 100%;
  height: 30vh;
  background-position: center;
  background-size: cover;
}


.film-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
 
}
.film-info {
  display: flex;
  align-items: center;
}
.film-type {
  font-size: .5625rem;
  color: #fff;
  background-color: #d2d6dc;
  height: .875rem;
  line-height: .875rem;
  padding: 0 .125rem;
  border-radius: .125rem;
  display: inline-block;
  margin-left: 0.5rem;
}
.grade {
  font-size:1rem;
  font-style:italic;
  color: #ffb232;
}
.detail-text {
  color: #797d82;
  font-size: .8125rem;
  margin-top: 0.222222rem;
}

.synopsis {
  overflow: hidden;
  transition: max-height 0.3s;

  &.hidden {
    max-height: 10vh;
  }
}

.toggle-btn {
  text-align: center;
  margin: 0.5rem 0;
  cursor: pointer;
}

.actors-section {
  margin-top: 1rem;

}

.section-title {
  font-size: 1rem;
  margin-bottom: 5px;

}

.section-title-right {
  float: right;
  display: flex;
  align-items: center;
  line-height: 1
}

.actors-swiper {
  width: 100%;
  overflow: hidden;
height:fit-content;  
}

.avatar {
  width: 100%;
  height: 20vh;
  background-position: center;
  background-size: cover;
  border-radius: .25rem;
}

.actor-name {
  text-align: center;
  font-size: .75rem;
  margin-top: 0.2rem;
}

.actor-role {
  text-align: center;
  font-size: .8125rem;
  color: #666;
}
.goSchedule{
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
    bottom: 0;
    left: 0;
    height: 6.5333vh;
    width: 100%;
    background-color: #ff5f16;
    color: #fff;
    font-size: 1rem;
    line-height: 1;
    z-index: 100;
      &::after{
  content: '';
  display: block;
  height: 9vh;
}
}
.detail-container::after {
  content: '';
  display: block;
  height: 6.5333vh;
  width: 100%;
  pointer-events: none;
}
// .end{

//   height:3vh;
// }
.loading,
.error {
  text-align: center;
  padding: 2rem;
}
</style>