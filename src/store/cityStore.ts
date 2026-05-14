import { defineStore } from 'pinia'
import { ref } from 'vue'
// import {http} from '@/util/tools'
import axios from 'axios'
//第一个参数是唯一storeId
const TENCENT_MAP_KEY = import.meta.env.VITE_TENCENT_MAP_KEY
const useCityStore = defineStore("city", () => {
  const userCoords = ref<{ latitude: number; longitude: number } | null>(null)
  const locationError = ref<string | null>(null)
  const locationsuccess = ref(false)
  const loading = ref(false)
  const cityName = ref("北京市")
  const cityId = ref(110100)
  const copycityId = ref(cityId.value);
  const change = (name: string, id: number) => {
    copycityId.value = cityId.value
    if (id !== cityId.value) {
      cityName.value = name
      cityId.value = id
    }
  }
  const isReady = ref(false)
  let readyPromise: Promise<void> | null = null

  const ensureCityReady = () => {
    if (readyPromise) return readyPromise
    readyPromise = (async () => {
      try {
        await updateCityByLocation()   // 你的定位+逆地理编码方法
        locationsuccess.value = true
      } catch (error) {

        locationsuccess.value = false
        console.warn('定位失败，使用默认城市', error)
      } finally {
        isReady.value = true
      }
    })()
    return readyPromise
  }
  //获取用户位置
  const requestLocation = () => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        locationError.value = '浏览器不支持地理定位'
        reject(locationError.value)
        return
      }
      loading.value = true
      locationError.value = null

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          userCoords.value = coords
          locationError.value = null
          loading.value = false
          resolve(coords)
        },
        (error) => {

          loading.value = false
          switch (error.code) {
            case error.PERMISSION_DENIED:
              locationError.value = '您拒绝了位置权限，是否手动定位？'
              break
            case error.POSITION_UNAVAILABLE:
              locationError.value = '无法获取位置信息'
              break
            case error.TIMEOUT:
              locationError.value = '定位超时，请重试'
              break
            default:
              locationError.value = '定位失败，未知错误'
          }
          reject(locationError.value)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  // 通过腾讯地图逆地理编码获取城市信息
  const fetchCityByCoords = async (coords: { latitude: number; longitude: number }) => {
    const { latitude, longitude } = coords
    try {
      const res = await axios.get('/geocoder/v1/', {
        params: {
          location: `${latitude},${longitude}`,
          key: TENCENT_MAP_KEY,
          output: 'json'
        }
      })
      if (res.data.status !== 0) {
        throw new Error(res.data.message || '逆地理编码失败')
      }
      const ad_info = res.data.result.ad_info
      // 从 city_code 中截取后六位作为城市ID
      let newCityId: number
      if (ad_info.city_code) {
        // city_code 格式如 "156520300"，取后六位 "520300"
        const cityCodeStr = ad_info.city_code.slice(-6)
        newCityId = Number(cityCodeStr)
      } else {
        // 如果没有 city_code，使用 adcode（但 adcode 可能是区县级）
        newCityId = Number(ad_info.adcode)
      }

      const cityNameFromApi = ad_info.city || ad_info.province  // 城市名称，优先使用 city

      return { cityId: newCityId, cityName: cityNameFromApi }
    } catch (error) {
      console.error('逆地理编码请求失败', error)
      throw new Error('获取城市信息失败')
    }
  }

  // 对外方法：定位并更新城市
  const updateCityByLocation = async () => {
    try {
      const coords = await requestLocation()
      const { cityId: newCityId, cityName: newCityName } = await fetchCityByCoords(coords)
      change(newCityName, newCityId)
      return { cityId: newCityId, cityName: newCityName }
    } catch (error) {
      // 定位或逆地理失败，保留原城市，错误信息已在 locationError 中
      throw error
    }
  }


  return {
    cityName,
    cityId,
    change,
    copycityId,
    userCoords,
    locationError,
    loading,
    requestLocation,
    updateCityByLocation,
    ensureCityReady,
    isReady,
    locationsuccess
  }
})

export default useCityStore