// 影院相关类型定义

export interface CinemaService {
  name: string
  description: string
}
export interface showCinemas {
    cinemaList: number[];
    showDate: number
}
export interface Cinema {
  cinemaId: number
  name: string
  eTicketFlag: number
  districtName: string
  address: string
  lowPrice: number
  latitude: number
  longitude: number
}

export interface CinemaWithDistance extends Cinema {
  distance: number | string
}

export interface CinemaDetail extends Cinema{
  // address: string
  // cinemaId: number
  cityId: number
  // name: string
  services: CinemaService[]
  notice: string
}
