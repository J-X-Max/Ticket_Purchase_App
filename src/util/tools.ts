import axios from 'axios'
import { showLoadingToast, closeToast } from 'vant';
import { ref, onMounted, onUnmounted } from 'vue'
export const http = axios.create({
  baseURL: 'https://m.maizuo.com',
  timeout: 10000,
  headers: {
    'X-Client-Info':
      '{"a":"3000","ch":"1002","v":"5.0.4","e":"1606697250632532718583809","bc":"440100"}'
  }
})

http.interceptors.request.use(function (config) {
  // Do something before request is sent

  showLoadingToast({
    message: '加载中哦...',

    forbidClick: true,
  });

  return config;
}, function (error) {
  return Promise.reject(error);
});
http.interceptors.response.use(function (response) {
  closeToast()
  return response;
}, function (error) {
  closeToast()

  return Promise.reject(error);
});
// 距离函数
export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  // 内部辅助函数
  const deg2rad = (deg: number) => deg * (Math.PI / 180)

  const R = 6371 // 地球半径（千米）
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = (R * c).toFixed(1) // 距离（千米）
  return d
}

// 滚动函数
export function useSticky(shouldSticky: () => boolean) {
  const isSticky = ref(false)
  let ticking = false

  const check = () => {
    isSticky.value = shouldSticky()
    ticking = false
  }

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(check)
      ticking = true
    }
  }

  onMounted(() => {
    check()
    window.addEventListener('scroll', onScroll)
    // 初始化检查

  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { isSticky }
}