// 座位相关类型定义

export interface SeatItem {
  columnId: string
  columnNum: string
  coupleType: number
  isBroken: boolean
  isOccupied: boolean
  offerSeatId: string
  rowId: string
  rowNum: string
  sectionId: string
  sectionName: string
}

export interface SeatingChart {
  height: number
  width: number
  scheduleId: number
  seats: SeatItem[]
}

export interface ProcessedSeat extends SeatItem {
  colSpan: number
  isCouple: boolean
  partnerId?: string
  partnerColumnNum?: string
}

export interface SectionIconItem {
  icon: string
  price: number
  iconseat?: string
}

export interface SectionIconMap {
  isBroken: SectionIconItem
  isOccupied: SectionIconItem
  [key: string]: SectionIconItem
}
