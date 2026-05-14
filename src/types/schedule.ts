// 场次相关类型定义

export interface Schedule {
  advanceStopMins: number
  endAt: number
  filmLanguage: string
  hallName: string
  imagery: string
  isOnsell: boolean
  marketPrice: number
  maxSalePrice: number
  minSalePrice: number
  salePrice: number
  scheduleId: number
  showAt: number
}

export interface SectionPrice {
  price: number
  sectionId: string
}

export interface ScheduleDetail {
  maxSeatsCount: number
  sectionPrices: SectionPrice[]
  showAt: number
  endAt: number
  imagery: string
  cinema: {
    cinemaId: number
    name: string
    notice: string
  }
  film: {
    filmId: number
    name: string
    language: string
  }
  hall: {
    hallId: string
    name: string
  }
}
