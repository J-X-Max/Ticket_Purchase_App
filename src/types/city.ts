// 城市相关类型定义

export interface City {
  name: string
  cityId: number
  pinyin: string
  isHot: number
}

export interface CityGroup {
  type: string
  list: City[]
}
