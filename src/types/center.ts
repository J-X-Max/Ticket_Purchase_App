// 个人中心相关类型定义


export type User = {
    mobile: string,
    headIcon: string,
    nickName: string,
    gender: number,
    birthday: string,
    userId: number,
    hanPassword: number,
    hasPayPwd: number,
}
export type Spe = {
    couponCount: number,
    availableBalance: number,
}
export type UserSecurity = {
     data: {
        mobile: string,
    }
    msg: string,
    status: number
}
export type Record = {
    pageNum: number,
    pageSize: number,
    record: Array<any>,
    total: number
}
export type Balance = {
    totalAmount: number,
    availableAmount: number,
    frozenAmount: number

}

export type ListItem = {
    payOrderId: string,
    endPayTime: number,
    totalPrice: number,
    orderStatus: number,
    createdAt: number,
    skuList: [
        {
            productName: string,
            imgUrl: string,
            count: number,
            price: number,
            extraInfo: {
                filmId: number,
                finishTime: number
                watchTime: number,
            },
        }
    ],
}

