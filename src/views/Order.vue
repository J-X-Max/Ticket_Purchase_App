<template v-if="orderData">
  <van-popup v-model:show="showBackPopup" round safe-area-inset-bottom position="center" :style="{ width: '68vw' }">
    <div class="title">退出将释放您锁定的座位</div>
    <div class="option">
      <div @click="comfirm">确认</div>
      <div @click="cancel">取消</div>
    </div>
  </van-popup>

  <van-popup v-model:show="timeOut" round safe-area-inset-bottom position="center" :style="{ width: '68vw' }">
    <div class="title">订单超时</div>
    <div class="option">
      <div @click="hiddenTimeout">确认</div>
    </div>
  </van-popup>

  <van-popup class="away-box" v-model:show="showpay" round safe-area-inset-bottom position="bottom"
    :style="{ height: '30%' }">
    <div class="away-item" v-for="(pay) in payWays" :key="pay.payDisplayName">
      <div class="item-text"><img :src="pay.payIcon"><span>{{ pay.payDisplayName }}</span></div><input type="radio"
        name="payMethod" :value="pay" v-model="selectedPay">
    </div>
  </van-popup>
  <myheader title="确认订单" leftType="back" :Time="{ showTime: true, Seconds: remainingSeconds }" @Timeout="showTimeout"
    @showBackPopup="showPopup" />
  <div class="decorate"> </div>
  <div class="addressee-info">
    <div class="info-input">
      <van-icon name="friends-o" />
      <div class="phone">
        <input @blur="() => validateMobile(mobile, true)" v-model="mobile" id="telephone-number" type="tel"
          maxlength="11" placeholder="请输入手机号" class="main-info">
        <label for="telephone-number">温馨提醒：购票信息请查看订单详情，不再发送短信</label>
      </div>
    </div>
  </div>

  <div class="Product-box">
    <div class="product-up">
      <img :src="orderData?.sku.imgUrl">
      <div class="product-info">
        <div class="title">{{ orderData?.goodsInfo[0].seatExtInfo.filmName }}({{ orderData?.goodsInfo[0].goodsName }})
        </div>
        <div>{{ formattedEndDate }}</div>
        <div class="address">{{ orderData?.cinemaInfo.name }}</div>
        <div class="hall">{{ orderData?.goodsInfo[0].seatExtInfo.hallName + '(' + orderData?.goodsInfo[0].goodsCount +
          '张) ' + orderData?.goodsInfo[0].seatExtInfo.sectionName }}</div>
        <div class="seats">{{ formatseats }}</div>
      </div>
    </div>
    <div class="product-price">
      <span>商品金额</span>
      <span><span class="chart">¥</span>{{ (orderData?.totalPrice ? orderData.totalPrice / 100 : 0).toFixed(2) }}</span>
    </div>
  </div>

  <div class="card-box">
    <div class="item">
      <div><van-icon name="credit-pay" />
        <div>卖座券</div>
      </div>
      <div>{{ total }}张券可用<van-icon name="arrow" /></div>
    </div>
    <div class="item">
      <div><van-icon name="gold-coin-o" />余额(剩余<span>¥{{ availableAmount }}</span>)</div>
    </div>
    <div class="item">
      <div><van-icon name="coupon-o" />发票</div>
      <div>不开发票<van-icon name="arrow" /></div>
    </div>
  </div>
  <ul>
    <li type="none" class="title"><svg zria-hidden="true">
        <use href="#icon-gantanhaozhong"></use>
      </svg>注意事项</li>
    <li class="text">本影城暂不提供自助退换票服务，如需退票，请务必于电影开场前2小时致电客服人工办理。</li>
    <li class="text">退票申请均需由客服审核确认，最终结果以客服答复为准。</li>
    <li class="text">即日起购票成功后，取票码不再以短信发送，改为公众号通知或App站内通知。</li>
  </ul>
  <div class="submit-box">
    <div>实付<span class="price"><span class="chart">¥</span>{{ (orderData?.totalPrice ? orderData.totalPrice / 100 :
      0).toFixed(2)
    }}</span></div>
    <div class="submit" @click="submit">提交订单</div>
  </div>
</template>
<script setup lang="ts">
import { Popup as vanPopup, Icon as vanIcon, showToast } from 'vant';
import { ref, onBeforeMount, onMounted, computed } from 'vue'
import { http } from '@/util/tools';
import { useRoute, useRouter } from 'vue-router';
import Myheader from '@/components/Myheader.vue';
type OrderData = {
  userId: number,
  orderId: string,
  mobile: string,
  totalPrice: number,
  orderStatus: number,
  isComplete: number,
  payOrderId: string,
  endPayTime: number,
  createdAt: number,
  cinemaInfo: {
    cinemaId: number,
    name: string,
    tel: string,
    address: string,
    gps: string
  },
  goodsInfo: [{
    endDate: number,
    goodsCount: number,
    goodsId: number,
    goodsName: string,
    goodsType: number,
    startDate: number,
    seatExtInfo: {
      hallName: string,
      filmName: string,
      seats: string,
      sectionName: string,
      price: number,
    }
  }]
  sku: {
    imgUrl: string,
    skuId: number,
    count: number,
    price: number,
  }
}
type skus = {
  list: [{
    deliveryAttr: [],
    groupType: number,
    productType: number,
    skuId: number,
  }]

}
type payWayitem = {
  payType: number,
  payDisplayName: string,
  payDesc: string,
  payIcon: string,
  payLabelImg: string,
  defaultSelected: number,
  index: number,
  status: number

}


const orderData = ref<OrderData | null>(null)
const skus = ref<skus | null>(null)
const payWay = ref<payWayitem[] | null>(null)
const preOrderId = ref('')
const total = ref(0)
const availableAmount = ref(0)
const mobile = ref('')
const timeOut = ref(false)
const showBackPopup = ref(false)
const showpay = ref(false)
const router = useRouter()
const route = useRoute();
const showPopup = () => {
  showBackPopup.value = true
}
const comfirm = async () => {
  await cancelorder()
  router.back()
}
const cancel = () => {
  showBackPopup.value = false
}
const showTimeout = () => {
  timeOut.value = true
}
const hiddenTimeout = async () => {
  timeOut.value = false
  await cancelorder()
  router.back()
}
const cancelorder = async () => {
  try {
    await http.post('/gateway/', { orderId: route.params.orderid },
      {
        params: {
          k: 7105868,
        },
        headers: {
          'X-Host': 'mall.ticket.order.cancel',
          "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
        }
      })
  } catch (error) {
    console.log(error);
  }
}
const payWays = computed(() => {
  if (!payWay.value) return []
  const result = []
  const seen = new Set();
  const data = payWay.value.filter(item => item.payDisplayName === '微信支付' || item.payDisplayName === '支付宝支付')
  for (const item of data) {
    // 判断是否是微信或支付宝支付
    const isWechat = item.payDisplayName.includes('微信');
    const isAlipay = item.payDisplayName.includes('支付宝');
    if (isWechat && !seen.has('wechat')) {
      result.push({ payIcon: item.payIcon, payDisplayName: item.payDisplayName });
      seen.add('wechat');
    } else if (isAlipay && !seen.has('alipay')) {
      result.push({ payIcon: item.payIcon, payDisplayName: item.payDisplayName });
      seen.add('alipay');
    }
  }
  console.log(result)
  return result

})

const selectedPay = ref(payWays.value[0])
const remainingSeconds = computed(() => {
  if (!orderData.value) return 0
  const now = Math.floor(Date.now() / 1000)           // 当前秒级时间戳
  const end = orderData.value.endPayTime              // 订单支付截止时间（秒）
  const remaining = end - now
  return remaining > 0 ? remaining : 0
})
// 校验手机号格式，返回布尔值，并可选弹出提示
const validateMobile = (phone: string, showErrorMessage = true): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phone) {
    if (showErrorMessage) showToast('手机号不能为空');
    return false;
  }
  if (!phoneRegex.test(phone)) {
    if (showErrorMessage) showToast('请输入正确的11位手机号');
    return false;
  }
  return true;
};
const formatseats = computed(() => {
  const price = (orderData.value?.goodsInfo[0].seatExtInfo.price ?? 0) / 100
  const str = orderData.value?.goodsInfo[0].seatExtInfo.seats
  if (str) {
    return str.split('|').map((item) => {
      // 操作 item
      return item.replace(':', '排').concat('座(¥' + price + ')')
    }).join(' ');
  } else {
    return ''
  }
})
const formattedEndDate = computed(() => {
  if (!orderData.value?.goodsInfo[0].startDate) return ''
  // if (!orderData.value?.createdAt) return ''
  const date = new Date(orderData.value?.goodsInfo[0].startDate * 1000)
  const weekdays = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const weekday = weekdays[date.getDay()]
  return `${weekday} ${year}-${month}-${day} ${hours}:${minutes}`
})
const submit = async () => {
  try {
    const res1 = await http.post('/gateway/',
      {
        "orderType": skus.value?.list[0].productType,
        "mobile": mobile.value,
        "delivery": {},
        "externalPayAmount": orderData.value?.totalPrice,
        "ePaySign": [],
        "ePayDetails": {},
        "isFromCart": 0,
        "skuList": [{
          "skuId": orderData.value?.sku.skuId,
          "count": orderData.value?.sku.count,
          "price": orderData.value?.sku.price,
          "deliveryExtInfo": []
        }],
        "thirdOrderId": orderData.value?.orderId,
      }, {
      params: {
        k: 7105868,
      },
      headers: {
        'X-Host': 'mall.order.create.v2',
        "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
      }
    })
     await http.get('/gateway/',
      {
        params: {
          orderId: res1.data.data.payOrderId,
          k: 7105868,
          type: 2,
        },
        headers: {
          'X-Host': 'mall.order.detail.v2',
          "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
        }
      })
    const res3 = await http.get('/gateway/',
      {
        params: {
          payOrderId: res1.data.data.payOrderId,
          k: 7105868,
        },
        headers: {
          'X-Host': 'mall.order.pay.way',
          "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
        }
      })
    payWay.value = res3.data.data
    showpay.value = true
  } catch (error) {
    console.log(error);
  }
}
onBeforeMount(async () => {
  try {
    const res1 = await http.get('/gateway/', {
      params: {
        orderId: route.params.orderid,
        k: 7105868,
      },
      headers: {
        'X-Host': 'mall.ticket.order.detail',
        "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
      }
    })
    orderData.value = res1.data.data
    mobile.value = orderData.value?.mobile || ''
    const res2 = await http.post('/gateway/',
      {
        thirdOrderId: orderData.value?.orderId,
        skuList: [{ "skuId": orderData.value?.sku.skuId, "count": orderData.value?.sku.count, "price": orderData.value?.sku.price }]
      },
      {
        params: {
          k: 7105868,
        },
        headers: {
          'X-Host': 'mall.order.verify.v2',
          "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
        }
      })
    preOrderId.value = res2.data.data.preOrderId
    const [res3, _res4, res5,_res6, res7] = await Promise.all([
      http.post('/gateway/',
        {
          preOrderId: preOrderId.value,
        },
        {
          params: {
            k: 7105868,
          },
          headers: {
            'X-Host': 'mall.order.sku-extend',
            "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
          }
        }),
      http.post('/gateway/',
        {
          preOrderId: preOrderId.value,
        },
        {
          params: {
            k: 7105868,
          },
          headers: {
            'X-Host': 'mall.order.pay-limit.v2',
            "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
          }
        }),

      http.post('/gateway/',
        {
          preOrderId: preOrderId.value,
        },
        {
          params: {
            k: 7105868,
          },
          headers: {
            'X-Host': 'mall.order.card.match-total.v2',
            "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
          }
        }),
      http.post('/gateway/',
        {
          preOrderId: preOrderId.value,
        },
        {
          params: {
            k: 7105868,
          },
          headers: {
            'X-Host': 'mall.order.optimal-pay.v2',
            "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
          }
        }),
      http.get('/gateway/',
        {
          params: {
            k: 7105868,
          },
          headers: {
            'X-Host': 'mall.asset.balance.info',
            "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
          }
        })

    ])
    
    skus.value = res3.data.data
    total.value = res5.data.data.total
    availableAmount.value = res7.data.data.availableAmount.toFixed(2)
  } catch (error) {
    console.log(error);
  }
})
onMounted(() => {
  if (mobile.value) validateMobile(mobile.value, false);
});
</script>
<style scoped lang="scss">
.van-popup {
  display: flex;
  flex-direction: column;

  .title {
    flex: 1;
    padding: 5% 10%;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    align-items: center;
    /* 垂直居中 */
    justify-content: center;
    font-size: $font-size-base ;
    color: $text-primary;
    text-align: justify;
  }

  .option {
    border-top: 1px solid #ddd;
    color: orange;
    height: 7vh;
    align-items: center;
    display: flex;
    justify-content: center;

    div {
      text-align: center;
      flex: 1;
    }
  }

}

.decorate {
  background: #fff url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAADCAYAAAC+oZX4AAAAAXNSR0IArs4c6QAABB9JREFUWAm1V/tTE1cU/vaRTbKBhGwEJK3ioELLo1SdFsugaB9gUf+d/lX9zRbFakfUorWOVCjYihSGMqZCk5AENrvZu9me4C+Be/Podjwzmdn9zj3n3nu+PY9I33y76sGHdEY1XPsogd7OsNDaWVmC+WAG7k5GqG8EymEd4fOXERweAWSZW57KlXBjIY3VrSKnawaQJQkjPVFM9Meha7x/r2iiOHcH9uJTeOVyMy65NYHjJ6FfmoJypJPTlSnqc6t53H2RhVlyOX0zQKIlgKmhBAaTunC5s/YS5v1bcNNbQn0jUNKCCI+MI3R2FFBUbvl2wcH3i2m8SJmcrhmgwsHZ7hZcGTDQGlI4E8+2YD2+B+vXR/BcfzEKJLvfcnD0Pd4/IU/WCri9nMGu5c9/m67i60EDHx9r4fxXALa5BvPeNNhWSqhvBEqBAELnxhD+9CKgBrjlWZNhejGDhc1dTtcsMExnr9whTnfhxCmh+OQ+rGc/wXMcTt0MoHYmoY9PQX3/hHD5/MYubv6WQa7IhPpGYGtIxcRAHJ+caIUkWOymNmHOTsN5vSHQNoYk+vZDZ84jRPWokhOHJU/fzi06/zO6h+f5KqfoT0ZwdcjAEcrpahEwUq3mnyNBZb+oVYqbMBhvXr8NxuY6b9wEIinKflEOf/Y5pGCIs9i1XcwsZfF0vYCyz2D0HdX3m0tH68Fg7G9GhcCan0Px51lUCoQfUYx26BevINDTJzRfpoJWKWz/UIHzI2FNwRcftGH0VAyKgIRKQTZnb8JZX/HjHpIkIzh0DuHRLyHpEc6HWSrjDjWWx3/m4VY6jQ/paQ/jOjX4ZJvGW3tl2M9/QfHRXZSpUfoRJRZH+MIktN5BofkKNfbvqMH/TY3ej2iqjEt9bRjvjUGVeRLKO2lqjjMovVr24544kKB9OAx9bAJSS5TzYTMPP/6excNXOTDXHwfHjRCuDSfQbfBFB/BQWpqH+fAHlPcK3P7NADKdWx/7Clr/GeHy9bSFG8/T2MzaQn0jMKDIuHA6hsvEg6YKOCjkUHxwG6U/FnwXTu30AOXyJOSYwR3HobjPvszRbwcl5m+I64oFcZ04ONnO17rKhtJG2prkdq4DHDOCtaNpWTLLZ6nq+euENCJAjcYdhEI1b/tXxhZ9TXVOfFAVDSpuLKLWPmAuE2D2Hj9SH3RT+00NeqrRUTPr9ywoGdP+z42xesOuaLCkqpRBImFMYpltqnq1rygyq8bUaHtdDlI5pjHX5TOi2kmdZ504SNThgGUyAbD/wQGIg456HDDiwH3HHKQEnadOUA6p1IjBEInUHOtTOZs4EM5IhzyJX2nQKhsRtfaEkMupzM7zf2vE7jhUpTxAnTywGOTtvC2YkDhXYoDY69Ib5cG75WCLOKB50XceNOKAEQf/AiP6ji9WGR7SAAAAAElFTkSuQmCC) repeat-x;
  width: 100%;
  height: 5px;
}

.addressee-info {
  background-color: #fff;
  margin-bottom: 10px;
  // margin-top: 5px;
  display: flex;
  align-items: center;
  padding: 20px 10px;

  .info-input {
    display: flex;

    .van-icon {
      display: flex;
      align-items: center;
      font-size: 1.7rem;
      padding-right: 5px;
    }

    .phone {
      display: flex;
      flex-direction: column;
      font-size: 1.2rem;

      input,
      input:focus,
      input:hover {
        border: none;
        outline: none;
        box-shadow: none;
        background: transparent;
      }

      label {
        font-size: 0.8rem;
        color: #a77924;
      }
    }
  }
}

.Product-box {
  display: flex;
  flex-direction: column;
  padding: 10px 10px;
  background-color: #fff;
  box-sizing: border-box;

  .product-up {
    display: flex;
    border-bottom: #dddddd43 1px solid;
    padding-bottom: 10px;

    img {
      margin-right: 7px;
      width: 22.7vw;
    }

    .product-info {
      white-space: nowrap;
      min-width: 50%;
      color: #797d82;
      font-size: 0.8rem;

      .title {
        color: #191a1b;
        text-overflow: ellipsis;
        overflow: hidden;

        font-size: 1rem;
      }

      .address {
        text-overflow: ellipsis;
        overflow: hidden;

      }

      .hall {
        white-space: pre;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .seats {
        white-space: pre-wrap;
      }
    }
  }

  .product-price {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    font-size: .9rem;

    >span:first-child {
      color: #797d82;
      // font-size: 0.8rem;
    }

    span:nth-child(2) {
      color: #ff5f16;

      .chart {
        font-size: .6rem
      }
    }
  }
}

.card-box {
  display: flex;
  flex-direction: column;
  padding: 0px 10px;
  margin: 10px 0px;
  background-color: #fff;

  .item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0px;

    div {
      display: flex;
      align-items: center;

      .van-icon-credit-pay,
      .van-icon-gold-coin-o,
      .van-icon-coupon-o {
        font-size: 1.5rem;
        padding-right: 5px;
      }
    }

  }
}

ul {
  margin: 10px 10px;
  // list-style-type: "*";
  list-style: none;
  padding: 10px 15px;
  background-color: #fff;
  border-radius: 8px;
  color: #a06b43;

  .title {
    font-size: 1rem;
    display: flex;
    align-items: center;
  }

  .title::before {
    content: '';
  }

  .text {
    padding-left: .375rem;
  }



  li {
    font-size: .8rem;
    position: relative;

    // anchor-name: --li;
    svg {
      width: 1.25rem;
      height: 1.25rem;
      color: #a06b43;
    }
  }

  li::before {
    // position-anchor: --li;
    content: "*";
    font-size: 1rem;
    position: absolute;
    left: anchor(left, -0.3125rem);
    top: anchor(top, .1875rem);
  }
}

.submit-box {
  position: fixed;
  left: 0px;
  bottom: 0px;

  width: 100%;
  height: clamp(30px, 2vh + 2rem, 80px);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: #fff;

  .price {
    color: #ff5f16;

    .chart {
      font-size: .6rem;
    }
  }

  .submit {
    width: 30%;
    color: #fff;
    margin-left: .625rem;
    height: 100%;
    background-color: #ff5f16;
    display: flex;
    justify-content: center;
    align-items: center;

  }
}

.away-box {
  display: flex;
  flex-direction: column;
  padding: 15px 30px;

  .away-item {
    width: 100%;
    height: 5vh;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-text {
      display: flex;
      align-items: center;
      width: 62%;

      img {
        width: 10%;
        height: 10%;
        margin-right: 4px;
      }
    }
  }
}
</style>