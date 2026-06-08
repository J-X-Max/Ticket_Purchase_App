// 订单相关类型定义

export interface SeatExtInfo {
  filmId: number,
  watchTime: number,
  hallName: string
  filmName: string
  seats: string
  sectionName: string
  price: number
}

export interface GoodsInfo {
  endDate: number
  goodsCount: number
  goodsId: number
  goodsName: string
  goodsType: number
  startDate: number
  seatExtInfo: SeatExtInfo
}

export interface Sku {
  imgUrl: string
  skuId: number
  count: number
  price: number
}
export interface SkuExtend {
  list: [{
    deliveryAttr: [],
    groupType: number,
    productType: number,
    skuId: number,
  }]

}


export type CinemaInfo = {
  cinemaId: number
  name: string
  tel: string
  address: string
  gps: string
}
export type OrderData = {
  userId: number
  orderId: string
  mobile: string
  totalPrice: number
  orderStatus: number
  isComplete: number
  payOrderId: string
  endPayTime: number
  createdAt: number
  cinemaInfo: CinemaInfo
  goodsInfo: GoodsInfo[]
  sku: Sku
}

export interface PayWayItem {
  payType: number
  payDisplayName: string
  payDesc: string
  payIcon: string
  payLabelImg: string
  defaultSelected: number
  index: number
  status: number
}
export type OrderInfo = Omit<OrderData, 'cinemaInfo' | 'goodsInfo' | 'userId' | 'orderId' | 'orderStatus' | 'isComplete' | 'sku'> & {
  skuList: [
    {
      finalPrice: number,
      imgUrl: string,
      thirdOrderExtInfo: {
        cinemaInfo: CinemaInfo,
        goodsInfo: GoodsInfo[],
      }
    }
  ]
}


