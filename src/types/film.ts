// 电影相关类型定义

export interface Actor {
  name: string
  role: string
  avatarAddress:string
}
export interface Item {
  name: string;
  type: number;
}
export interface Items {
  filmId: number,
  name: string,
  poster: string,
  grade: string,
  actors: Actor[],
  item: Item,
  premiereAt: number,
  runtime: number;
  nation: string;
}
export interface Film extends Items{
  // filmId: number
  // name: string
  director: string
  // poster: string
  category: string
  // premiereAt: number
  // nation: string
  // runtime: number
  synopsis: string
  // actors: Actor[]
  filmType: {
    name: string
  }
  photos: string[]
  // grade: string
  showDate: number[]
  // 其他字段按需添加
}
