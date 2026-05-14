<template >
  <div>
    <van-popup v-model:show="noticePopup" round safe-area-inset-bottom position="center" :style="{ width: '68vw' }">
      <div class="title"> {{ schedule?.cinema.notice }} </div>
      <div class="option" @click="know">我知道了</div>
    </van-popup>
     <van-popup v-model:show="showmsgPopup" round safe-area-inset-bottom position="center" :style="{ width: '68vw' }">
      <div class="title"> {{ msg }} </div>
      <div class="option">
        <div @click="comfirm">确定</div>
      </div>
    </van-popup>
    <van-popup v-model:show="cancelorderPopup" round safe-area-inset-bottom position="center" :style="{ width: '68vw' }">
      <div class="title">您还有一笔未付款订单,是否需要帮您取消?</div>
      <div class="option">
        <div @click="pay">去支付</div>
        <div @click="cancel">取消旧订单</div>
      </div>
    </van-popup>
    <div class="header-fix">
      <myheader :title="schedule?.cinema?.name" leftType="back" />
      <div v-if="(schedule?.sectionPrices.length ?? 0) > 1" class="section-price-container">
        <div class="item" v-for="sectionPrice in schedule?.sectionPrices" :key="sectionPrice.sectionId">
          <svg class="seat-icon " aria-hidden="true">
            <use :href="'#icon-' + sectionIconMap[sectionPrice.sectionId]?.icon"></use>
          </svg>

          <div class="price"><span class="price-character">¥</span><span>{{
            sectionIconMap[sectionPrice.sectionId]?.price
              }}</span></div>
        </div>
      </div>
    </div>
    <div ref="seatingChartWrapRef" class="seating-chart-wrap" @scroll="onscroll">
      <div class="seating-chart" @wheel.capture="onwheel">
        <div class="screen">
          {{ schedule?.hall.name }}
        </div>


        <div class="axion-y">
          <span :style="{
            'gridRow': Number(row)
          }" v-for="row in rowId_set">{{ row }}</span>
        </div>

        <div ref="mapRef" class="map">
          <div class="seat-item" :style="{
            'gridColumn': seat.colSpan > 1 ? `${Number(seat.columnNum) + 1} / span ${seat.colSpan}` : Number(seat.columnNum) + 1,
            'gridRow': Number(seat.rowNum),
            'width': seat.isCouple ? 'var(--cell-size)*2' : 'var(--cell-size)',
            'height': seat.isCouple ? 'var(--cell-size)*2' : 'var(--cell-size)',
            'transform': `scale(${seat.isCouple ? 1 : 1.15})`
          }" @click="select_tick(seat)" v-for="seat in processedSeats" :key="seat.offerSeatId">

            <svg aria-hidden="true">
              <use :href="getSeatIcon(seat)"></use>
            </svg>
          </div>

        </div>

      </div>
    </div>
    <div class="seat-type">
      <div class="seat-item">
        <svg class="seat-icon " aria-hidden="true">
          <use :href="'#icon-' + sectionIconMap['isBroken']?.icon"></use>
        </svg>
        <span>不可选</span>
      </div>
      <div class="seat-item">
        <svg class="seat-icon " aria-hidden="true">
          <use :href="'#icon-' + sectionIconMap['isOccupied']?.icon"></use>
        </svg>
        <span>已售</span>
      </div>
      <div class="seat-item">
        <svg class="seat-icon " aria-hidden="true">
          <use href="#icon-icon-0"></use>
        </svg>
        <span>可选</span>
      </div>
      <div class="seat-item">
        <svg class="seat-icon " aria-hidden="true">
          <use href="#icon-xuanzhong-copy"></use>
        </svg>
        <span>选中</span>
      </div>
    </div>

    <div class="info">
      <div class="film-name">{{ schedule?.film.name }}</div>
      <div class="button" @click="fold"><span ref="show">展开场次</span> <van-icon name="arrow-down"></van-icon></div>
      <div class="film-time">{{ computedDate }}</div>
      <div ref="infoItemContainerRef" class="info-item-container">
        <div ref="infoItemRef" class="info-item" v-for="schedule, index in schedules"
          @click="toggleschedule(schedule, index)"
          :class="{ 'sold-out': isScheduleSoldOut(schedule), 'selected-item': currentScheduleId === schedule.scheduleId }"
          :key="schedule.scheduleId">
          <div> {{ formattedTimes[index] }} </div>
          <div class="language">{{ schedule.filmLanguage + schedule.imagery }}</div>
          <div><span>¥</span>{{ schedule.salePrice / 100 }}<span>起</span></div>
        </div>
      </div>
      <div class="selectedseat-container">
        <div class="selected-item" v-for="[id, seat] in selectedSeats" :key="id">
          <div>{{ seat.rowId }}排{{ seat.columnId }}座</div>
          <div class="price-container">
            <div class="price"><span class="money-chart">¥</span><span>{{ sectionIconMap[seat.sectionId]?.price
                }}</span> </div>
            <van-icon name="cross" @click="clearSeat(id)" />
          </div>
        </div>
      </div>
    </div>



    <div @click="gotopreorder" class="select-seat-button" :class="{ 'seat-price': selectedSeats.size !== 0 }">
      {{ selectedSeats.size === 0 ? '请选择座位' : countmoney + '元 确认选座' }}
    </div>


  </div>
</template>
<script setup lang="ts">
import Myheader from '@/components/Myheader.vue';
import { http } from '@/util/tools';
import { useRoute, useRouter } from 'vue-router';
import { ref, onBeforeMount, computed, nextTick, onBeforeUnmount, onMounted } from 'vue';
import { Icon as vanIcon, Popup as vanPopup, showToast } from 'vant';
import useCinemaStore from '@/store/cinemaStore';
type seatItem = {
  columnId: string;
  columnNum: string;
  coupleType: number;
  isBroken: boolean;
  isOccupied: boolean;
  offerSeatId: string;
  rowId: string;
  rowNum: string;
  sectionId: string;
  sectionName: string;
}
type seat = {
  height: number,
  width: number,
  scheduleId: number,
  seats: seatItem[]
}
type sche = {
  maxSeatsCount: number,
  sectionPrices: sectionPrices_item[]
  showAt: number,
  endAt: number,
  imagery: string,
  cinema: {
    cinemaId: number,
    name: string,
    notice: string,
  }
  film: {
    filmId: number,
    name: string,
    language: string,
  }
  hall: {
    hallId: string,
    name: string,
  }
}
type sectionPrices_item = {
  price: number,
  sectionId: string,
}
type sches = {
  advanceStopMins: number,
  showAt: number,
  imagery: string,
  filmLanguage: string,
  salePrice: number,
  scheduleId: number,
}
type item = {
  icon: string;
  price: number;
  iconseat?: string;
}

type ProcessedSeat = seatItem & {
  colSpan: number;
  isCouple: boolean;
  partnerId?: string;
  partnerColumnNum?: string; // 右座的列号，用于显示
};
type SectionIconMap = {
  isBroken: item;
  isOccupied: item;
  [key: string]: item; // 其他动态键
};
const msg = ref('')
const showmsgPopup = ref(false)
const cancelorderPopup = ref(false) 
const orderId = ref('')
const seatingChartWrapRef = ref<HTMLElement | null>(null);
const mapRef = ref<HTMLElement | null>(null);
const infoItemContainerRef = ref<HTMLElement | null>(null);
const leftX = ref(0)
const leftY = ref(0)
const initialLeft = ref(0)
const initialTop = ref(0)
const initialposition = ref(false)
const cinemastore = useCinemaStore()
const router = useRouter()
const currentScheduleId = ref<number | null>(null);// 当前高亮的场次 ID
const selectedSeats = ref<Map<string, ProcessedSeat>>(new Map());
const now = ref(Date.now() / 1000);
let timer: number | null = null;
const noticePopup = ref(false)
const show = ref<HTMLElement | null>(null)
const route = useRoute();
const seatingChart = ref<seat | null>(null)
const schedule = ref<sche | null>(null)
const schedules = ref<sches[] | null>(null)
const mapScale = ref(1);               // 当前缩放比例
const initialScale = ref(); // 初始缩放比例
const offsetX = ref(0);  // 当前 X 轴偏移量（像素）
const offsetY = ref(0);  // 当前 Y 轴偏移量（像素）
const comfirm =async () => {
  showmsgPopup.value = false
}
const pay = () => {
  
}
const cancel = async() => {
  try {
   const res7= await http.post('/gateway/', { orderId:orderId.value },
      {
        params: {
          k: 7105868,
        },
        headers: {
          'X-Host': 'mall.ticket.order.cancel',
          "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
        }
      })
    const res1 = await http.get('/gateway/', {
      params: {
        scheduleId: route.params.scheduleid,
        k: 7105868,
      },
      headers: {
        'X-Host': 'mall.film-ticket.seat.list',
        //  "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3MjY4NzIwNywidXNlcklkIjozMTk0MjU4N30.B0ZW7yJ2mVk0J-KjxxU5cMzsLmkxVWuNFUXhtvD3boE"
      }
    })
    if(res7.data.status === 0){
      orderId.value = ''
      showToast('取消成功')
    }else{
      showToast('取消失败')
    }
    seatingChart.value = res1.data.data.seatingChart
  } catch (error) {
    console.log(error);
  }
  cancelorderPopup.value = false
}
const rowId_set = computed<Set<String>>(() => {
  if (!seatingChart.value) return new Set<string>();
  const rowId_set = new Set<String>();
  seatingChart.value.seats.forEach(seat => {
    rowId_set.add(seat.rowNum)
  })
  return rowId_set
})
const processedSeats = computed<ProcessedSeat[]>(() => {
  if (!seatingChart.value) return [];
  const rows = new Map<number, seatItem[]>();
  // 按行分组
  seatingChart.value.seats.forEach(seat => {
    const row = Number(seat.rowNum);
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row)!.push(seat);
  });
  const result: ProcessedSeat[] = [];
  for (const [, rowSeats] of rows) {
    // 先按列号排序
    rowSeats.sort((a, b) => Number(a.columnNum) - Number(b.columnNum));
    // const newRow: typeof result = [];
    for (let i = 0; i < rowSeats.length; i++) {
      const seat = rowSeats[i]!;
      const nextSeat = rowSeats[i + 1];
      // 如果是情侣座（左），且下一座位是情侣座（右）且列号相邻
      if (seat.coupleType === 1 && nextSeat && nextSeat.coupleType === 2 && Number(nextSeat.columnNum) === Number(seat.columnNum) + 1) {
        // 合并为一个跨两列的座位
        const merged: ProcessedSeat = {
          ...seat,
          colSpan: 2,
          isCouple: true,
          partnerId: nextSeat.offerSeatId,
          partnerColumnNum: nextSeat.columnNum, // 记录右座列号
        };
        result.push(merged);
        i++; // 跳过右座
      } else {
        // 普通座位
        const normal: ProcessedSeat = {
          ...seat,
          colSpan: 1,
          isCouple: false,
        };
        result.push(normal);
      }
    }

  }
  console.log(result)
  return result;
});

const sectionIconMap = computed<SectionIconMap>(() => {
  const seat_Type = new Set<Number>()
  processedSeats.value.forEach(seat => {
    seat_Type.add(Number(seat.coupleType))
  });
  const map: SectionIconMap = {
    isBroken: { icon: 'suodingzuowei', iconseat: 'qinglvsuoding', price: 0 },
    isOccupied: { icon: 'yishou', iconseat: 'qinglvyishou', price: 0 }
  };
  const pricesitem = schedule.value?.sectionPrices;
  if (!pricesitem) {
    return map
  } else {
    const ids = pricesitem.map(item => ({ sectionId: item.sectionId, price: item.price / 100 }));
    ids.forEach((id, idx) => {
      if (ids.length === 1) {
        if (seat_Type.has(1)) {

          map[id.sectionId] = { icon: 'icon-qinglvmap', iconseat: 'qinglv', price: id.price };
          return
        }
        map[id.sectionId] = { icon: 'icon-0', price: id.price };
      } else if (id.sectionId === processedSeats.value.find(seat => seat.coupleType === 1)?.sectionId) {

        map[id.sectionId] = { icon: 'icon-qinglvmap', iconseat: 'qinglv', price: id.price };
      } else {
        map[id.sectionId] = { icon: `icon-${idx + 1}`, price: id.price };
      }
    });
    return map;

  }
});
const getSeatIcon = (seat: ProcessedSeat) => {
  // 优先判断选中状态（情侣座需要检查左右是否都被选中）

  const selected = selectedSeats.value.get(seat.offerSeatId);
  if (selected) {
    if (selected.isCouple) {
      return '#icon-qinglvxuanzhong';
    }
    return '#icon-xuanzhong-copy'; // 选中图标
  }
  if (seat.isBroken) {
    // 损坏的座位，优先使用情侣区的损坏图标（如果有）
    if (seat.isCouple && sectionIconMap.value.isBroken.iconseat) {
      return `#icon-${sectionIconMap.value.isBroken.iconseat}`;
    }
    return `#icon-${sectionIconMap.value.isBroken.icon}`;
  }
  if (seat.isOccupied) {
    if (seat.isCouple && sectionIconMap.value.isOccupied.iconseat) {
      return `#icon-${sectionIconMap.value.isOccupied.iconseat}`;
    }
    return `#icon-${sectionIconMap.value.isOccupied.icon}`;
  }
  // 可选状态：根据区域获取普通图标或情侣图标
  const sectionIcon = sectionIconMap.value[seat.sectionId];
  if (seat.isCouple && sectionIcon?.iconseat) {
    return `#icon-${sectionIcon.iconseat}`;
  }
  return `#icon-${sectionIcon?.icon}`;
};
const isScheduleSoldOut = (schedule: sches) => {
  const stopTime = schedule.showAt - schedule.advanceStopMins * 60;
  return now.value >= stopTime;
}
const scrollToFirstAvailable = () => {
  if (!schedules.value) return;
  const firstAvailableIndex = schedules.value.findIndex(sche => !isScheduleSoldOut(sche));
  if (firstAvailableIndex !== -1) {
    // const container = document.querySelector('.info-item-container');
    // const items = container?.querySelectorAll('.info-item-container .info-item');
    const container = infoItemContainerRef.value
    const items = container?.querySelectorAll('.info-item-container .info-item');
    if (items && items[firstAvailableIndex]) {
      const targetItem = items[firstAvailableIndex] as HTMLElement;
      container?.scrollTo({
        left: targetItem.offsetLeft,
        behavior: 'smooth'
      });
    }
  }
};

const select_tick = (seat: ProcessedSeat) => {
  if (seat.isBroken || seat.isOccupied) return;
  // if(seat.sectionId !== preId)return;
  const id = seat.offerSeatId
  const newMap = new Map(selectedSeats.value); // 复制一份
  if (newMap.has(id)) {
    if (seat.isCouple && seat.partnerId) {
      newMap.delete(seat.partnerId)
      newMap.delete(id);
    } else {
      newMap.delete(id);
    }
  } else if (newMap.size > 0) {
    if ((selectedSeats.value.size) >= (schedule.value?.maxSeatsCount ?? Infinity)) {
      showToast({
        message: `最多只能选择${schedule.value?.maxSeatsCount}个座位哦`
      })
      return
    } else {
      const firstSeat = newMap.values().next().value;
      if (seat.sectionId !== firstSeat?.sectionId) {
        showToast({
          message: '不能跨区域选座'
        })
        return;
      } else if (seat.isCouple) {  //情侣座位存两个位置
        newMap.set(id, seat);
        const partnerseat: ProcessedSeat = {
          ...seat,
          columnId: String(Number(seat.columnId) + 1),
          columnNum: String(Number(seat.columnNum) + 1),
          coupleType: seat.coupleType + 1,
          offerSeatId: seat.partnerId!,
          partnerId: id,
        }
        newMap.set(partnerseat.offerSeatId, partnerseat)
      } else {     // 否则直接存一个位置
        newMap.set(id, seat);
      }
    }
  } else {//第一次存储
    if (seat.isCouple) {
      newMap.set(id, seat);
      const partnerseat: ProcessedSeat = {
        ...seat,
        columnId: String(Number(seat.columnId) + 1),
        columnNum: String(Number(seat.columnNum) + 1),
        coupleType: seat.coupleType + 1,
        offerSeatId: seat.partnerId!,
        partnerId: id,
      }
      newMap.set(partnerseat.offerSeatId, partnerseat)

    } else {
      newMap.set(id, seat);
    }
  }
  selectedSeats.value = newMap; // 替换以触发响应式更新
  console.log(selectedSeats.value)
}
const clearSeat = (id: string) => {
  if (selectedSeats.value.get(id)?.isCouple) {
    selectedSeats.value.delete(selectedSeats.value.get(id)?.partnerId!)
    selectedSeats.value.delete(id)
  } else {
    selectedSeats.value.delete(id)
  }

}
// 计算初始缩放比例，使地图完整显示
const computeInitialScale = async () => {
  await nextTick(); // 等待 DOM 更新

  // const wrap = document.querySelector('.seating-chart-wrap') as HTMLElement;
  // const map = document.querySelector('.map-container') as HTMLElement;
  // mapHeightrect.value = map.getBoundingClientRect().height;
  const wrap = seatingChartWrapRef.value
  const map = mapRef.value

  if (!wrap || !map || !seatingChart.value) return;

  const wrapWidth = wrap.clientWidth;
  const wrapHeight = wrap.clientHeight;

  // 获取地图原始尺寸（未缩放）
  const mapWidth = map.scrollWidth;
  const mapHeight = map.scrollHeight;

  // 计算宽高方向的缩放比，取较小的那个（留 5% 边距）
  const scaleX = (wrapWidth / mapWidth) * 1;
  const scaleY = (wrapHeight / mapHeight) * 1;
  const scale = Math.min(scaleX, scaleY);

  // 限制缩放范围（例如 0.5 ~ 3）
  mapScale.value = Math.min(Math.max(scale, 0.1), 3);
  initialScale.value = mapScale.value; // 初始缩放比例
  await nextTick();

  const parent = map.parentElement as HTMLElement;
  const parentWidth = parent.clientWidth;   // 实际等于 4 * wrapWidth
  const parentHeight = parent.clientHeight; // 实际等于 4 * wrapHeight

  // 再次获取地图原始尺寸（缩放不影响 offsetWidth）
  const origWidth = map.offsetWidth;
  const origHeight = map.offsetHeight;
  // 地图左上角相对于父容器的坐标（因为父容器使用 flex 居中）
  const mapLeft = (parentWidth - origWidth) / 2;
  const mapTop = (parentHeight - origHeight) / 2;

  // 计算滚动位置，使地图视觉中心与视口中心重合
  const targetScrollLeft = mapLeft + origWidth / 2 - wrapWidth / 2;
  const targetScrollTop = mapTop + origHeight / 2 - wrapHeight / 2;
  // 限制滚动范围（不能小于0，不能超过最大滚动距离）
  const maxScrollLeft = parentWidth - wrapWidth;
  const maxScrollTop = parentHeight - wrapHeight;
  wrap.scrollLeft = Math.min(Math.max(targetScrollLeft, 0), maxScrollLeft);
  wrap.scrollTop = Math.min(Math.max(targetScrollTop, 0), maxScrollTop);
  initialLeft.value = wrap.scrollLeft
  initialTop.value = wrap.scrollTop
  initialposition.value = true

  // const elRect = wrap.getBoundingClientRect().left;
  // left.value = wrap.scrollLeft 
  // left.value =map.offsetLeft+7 
  //   console.log(left.value,elRect,mapScale.value)
};
let wheelTicking = false;
const onwheel = (e: WheelEvent) => {
  e.preventDefault(); // 阻止页面滚动
  if (wheelTicking) return;
  wheelTicking = true;
  requestAnimationFrame(() => {
    // 原有的缩放逻辑
    // ...
    const delta = e.deltaY > 0 ? -0.1 : 0.1; // 向下滚缩小，向上滚放大
    let newScale = mapScale.value + delta;
    newScale = Math.min(Math.max(newScale, initialScale.value), 3); // 限制范围
    const factor = newScale / mapScale.value;
    // const mapElement = document.querySelector('.seating-chart') as HTMLElement;
    // const mapElement = document.querySelector('.map-container') as HTMLElement;
    if (!mapRef.value) return
    const rect = mapRef.value.getBoundingClientRect();
    offsetX.value -= (1 - factor) * (rect.width / 2 - e.clientX + rect.x)
    offsetY.value -= (1 - factor) * (rect.height / 2 - e.clientY + rect.y)
    mapScale.value = newScale;
    wheelTicking = false;
  });


}
let ticking = false;
const onscroll = () => {
  if (!initialposition.value) return
  // const wrap = document.querySelector('.seating-chart-wrap') as HTMLElement;
  // left.value = wrap.scrollLeft
  // console.log(left.value)
  if (!ticking) {
    requestAnimationFrame(() => {
      if (seatingChartWrapRef.value) {
        leftX.value = seatingChartWrapRef.value.scrollLeft - initialLeft.value;
        leftY.value = seatingChartWrapRef.value.scrollTop - initialTop.value;
        // mapContainerRef.value?.getBoundingClientRect().left
      }
      ticking = false;
    });
    ticking = true
  }
}
const computedDate = computed(() => {
  if (!schedule.value) return

  //  const date1 = new Date(schedule.value?.endAt as number * 1000 )
  const date = new Date(schedule.value?.showAt as number * 1000)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  const showHour = date.getHours().toString().padStart(2, '0')
  const showMinute = date.getMinutes().toString().padStart(2, '0')
  return `${weekday} ${month}月${day}日 ${showHour}:${showMinute} ${schedule.value.film.language}${schedule.value.imagery}`
})
const formattedTimes = computed(() => {
  if (!schedules.value) return [];
  return schedules.value.map(item => {
    const date = new Date(item.showAt * 1000);
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  });
});
const fold = () => {
  const container = document.querySelector('.info .info-item-container');
  const icon = document.querySelector('.info .button .van-icon');
  const wasHidden = container?.classList.contains('hidden'); // 记录展开前状态
  container?.classList.toggle('hidden')
  icon?.classList.toggle('up')
  if (show.value && container && getComputedStyle(container).display === 'none') {
    show.value.innerText = " 展开场次"
  } else if (show.value) {
    show.value.innerText = "收起场次"

  }
  if (!wasHidden && container?.classList.contains('hidden')) {
    scrollToFirstAvailable();
  }
}
const know = () => {
  noticePopup.value = false
}
const Process_SlectedSeats = () => {
  const scheduleId = currentScheduleId.value;
  const seatsList = Array.from(selectedSeats.value.values());
  console.log(seatsList)
// console.log(sectionIconMap.value[seatsList[0]!.sectionId]?.price)
const rawPrice = sectionIconMap.value[seatsList[0]!.sectionId]?.price ?? 0;
const price = Math.round(rawPrice * 100);
  // 生成 seats 字符串：格式 "row:col|row:col|..."
  const seatsStr = seatsList
    .map(seat => `${seat.rowId}:${seat.columnId}`)
    .join('|');
  // 生成 seatList 数组
  const seatList = seatsList.map(seat => ({ offerSeatId: seat.offerSeatId }));
  // 实际项目中手机号应从用户状态获取，这里示例先写固定值
  const mobile = '15086064281'; // 实际可从 store 或用户输入获取
  return {
    scheduleId,
    seats: seatsStr,
    count: seatsList.length,
    price,
    mobile,
    seatList,
    realNameAuth: { realNameList: [] }
  };
}
const gotopreorder = async () => {
  if(orderId.value){
cancelorderPopup.value =true
  }else{
    const requestData = Process_SlectedSeats();
    try {
      const res4 = await http.post('/gateway/', requestData,
        {
          params: {
            k: 7105868,
          },
          headers: {
            'X-Host': 'mall.ticket.order.seat',
            "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3MjY4NzIwNywidXNlcklkIjozMTk0MjU4N30.B0ZW7yJ2mVk0J-KjxxU5cMzsLmkxVWuNFUXhtvD3boE"
          }
        })
        if (res4.data.status === 1005) {
          msg.value = res4.data.msg
          showmsgPopup.value = true
        } else {
        orderId.value = res4.data.data.orderId
        router.push({
          path: `/preorder/${orderId.value}`,//这里需要修改为preorderId
          query: { type: 2 }
        })
      }
    } catch (error) {
      console.log(error);
    }
  }
}

const countmoney = computed(() => {
  return Array.from(selectedSeats.value.values())
    .reduce((acc, seat) => acc + (sectionIconMap.value[seat.sectionId]?.price || 0), 0)
    .toFixed(2);
});

const toggleschedule = (sche: sches, index: number) => {
  // 如果点击的是当前已高亮的场次，不做任何操作
  if (currentScheduleId.value === sche.scheduleId) return;
  // 更新高亮
  currentScheduleId.value = sche.scheduleId;
  if (index === 0) {
    return
  } else {
    const schehttp = async () => {
      try {
        const res1 = await http.get('/gateway/', {
          params: {
            scheduleId: sche.scheduleId,
            k: 7105868,
          },
          headers: {
            'X-Host': 'mall.film-ticket.seat.list',
            //  "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3MjY4NzIwNywidXNlcklkIjozMTk0MjU4N30.B0ZW7yJ2mVk0J-KjxxU5cMzsLmkxVWuNFUXhtvD3boE"
          }
        })
        const res2 = await http.get('/gateway/', {
          params: {
            scheduleId: sche.scheduleId,
            k: 1054573,
          },
          headers: {
            'X-Host': 'mall.film-ticket.schedule.info',
            //  "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3MjY4NzIwNywidXNlcklkIjozMTk0MjU4N30.B0ZW7yJ2mVk0J-KjxxU5cMzsLmkxVWuNFUXhtvD3boE"
          }
        })
        seatingChart.value = res1.data.data.seatingChart
        schedule.value = res2.data.data.schedule
        await computeInitialScale();
      } catch (error) {
        console.log(error);
      }
    };
    schehttp();
  }
}
onBeforeMount(async () => {
  try {
    const res1 = await http.get('/gateway/', {
      params: {
        scheduleId: route.params.scheduleid,
        k: 7105868,
      },
      headers: {
        'X-Host': 'mall.film-ticket.seat.list',
        //  "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3MjY4NzIwNywidXNlcklkIjozMTk0MjU4N30.B0ZW7yJ2mVk0J-KjxxU5cMzsLmkxVWuNFUXhtvD3boE"
      }
    })
    const res2 = await http.get('/gateway/', {
      params: {
        scheduleId: route.params.scheduleid,
        k: 1054573,
      },
      headers: {
        'X-Host': 'mall.film-ticket.schedule.info',
        //  "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3MjY4NzIwNywidXNlcklkIjozMTk0MjU4N30.B0ZW7yJ2mVk0J-KjxxU5cMzsLmkxVWuNFUXhtvD3boE"
      }
    })
     const res6 = await http.get('/gateway/', {
      params: {
        k: 1054573,
      },
      headers: {
        'X-Host': 'mall.ticket.order.preorder',
         "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NDIwMzY3OCwidXNlcklkIjozMTk0MjU4N30.TpsHHuNAjDKS88YQBSyGY0ebuFTzQwtORkCVnNmAnp8"
      }
    })
    seatingChart.value = res1.data.data.seatingChart
    schedule.value = res2.data.data.schedule
    if(res6.data.data){
      orderId.value = res6.data.data.orderId 
    }else{
      orderId.value = ''
    }
    const cacheKey = `${schedule.value?.film.filmId}_${route.params.dateid}`
    // 命中缓存，直接返回
    if (cinemastore.schedulesCache[cacheKey]) {
      schedules.value = cinemastore.schedulesCache[cacheKey]
    } else {// 没有命中缓存，发起请求
      const res3 = await http.get('/gateway/', {
        params: {
          filmId: schedule.value?.film.filmId,
          cinemaId: schedule.value?.cinema.cinemaId,
          date: route.params.dateid,
          k: 1780766,
        },
        headers: {
          'X-Host': 'mall.film-ticket.schedule.list',
          "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3MjY4NzIwNywidXNlcklkIjozMTk0MjU4N30.B0ZW7yJ2mVk0J-KjxxU5cMzsLmkxVWuNFUXhtvD3boE"
        }
      })
      schedules.value = res3.data.data.schedules;
    }
    // 设置当前高亮场次（初始为路由中的 scheduleId）
    currentScheduleId.value = Number(route.params.scheduleid);
    //IIfe 立即执行的函数  这里是作用于弹窗的
    (function (notice: string | undefined) {
      if (notice !== '') {
        noticePopup.value = true
      } else {
        noticePopup.value = false
      }
    }(schedule.value?.cinema.notice));
    await computeInitialScale();
    scrollToFirstAvailable();

  } catch (error) {
    console.log(error);
  }
})
onMounted(() => {

  // 每分钟更新一次，你也可以改为 30 秒或更短
  timer = setInterval(() => {
    now.value = Date.now() / 1000;
  }, 60000); // 60 * 1000 ms
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
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
    // flex: 1.2;
    height: 7vh;
    align-items: center;
    display: flex;
    justify-content: center;
    div{
      flex: 1;
      text-align: center;
    }
  }

}

.header-fix {
  position: sticky;
  top: 0;
  z-index: 100;

  .section-price-container {
    width: 100%;
    box-sizing: border-box;
    padding: 2px 15px 2px;
    background-color: #fff;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: scroll;
    column-gap: .375rem;

    .item {
      display: flex;
      align-items: center;

      .price {
        flex: 1.6;
        line-height: 1;
        margin-top: 8px;

        .price-character {
          font-size: 0.7rem;
        }
      }

      .seat-icon {
        width: 2rem;
        height: 2rem;
        /* 强制覆盖 use 内部图形的 fill */
      }

    }
  }

  .section-price-container::-webkit-scrollbar {
    display: none;
  }
}

.seating-chart-wrap {
  height: 47vh;
  width: 100%;
  overflow: scroll;
  // position: relative;

  .seating-chart {
    height: 400%;
    width: 400%;
    justify-content: center;
    align-items: center;
    display: flex;
    // border: 1px solid red;
    position: relative;

    // transform-origin: center;
    /* 原点设为左上角，配合偏移计算 */
    // transform: translate(v-bind('offsetX + "px"'), v-bind('offsetY + "px"')) scale(v-bind('mapScale'));

    .screen {
      text-wrap: nowrap;
      padding: 0 5px;
      height: 2%;
      font-size: 1rem;
      position: absolute;
      top: 37.5%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      border-radius: 0 0 11.5px 11.5px;
      background-color: rgb(0 0 0 / 36%);
      transform: translate(v-bind('offsetX + "px"'), v-bind('leftY + "px"'));
      z-index: 1;
    }

    .axion-y {
      width: 10.2px;
      position: absolute;
      display: grid;
      grid-template-rows: repeat(v-bind('seatingChart?.height ?? 1'), var(--cell-size));
      font-size: 0.6rem;
      left: 37.5%;
      z-index: 888;
      transform: translate(v-bind('leftX + "px"'), v-bind('offsetY + "px"')) scaleY(v-bind(mapScale));
      background-color: rgb(0 0 0 / 36%);
      border-radius: 11.5px;
      color: #fff;
      padding: 0 1px;

      span {
        justify-content: center;
        display: flex;
        align-items: center;
      }
    }

    --cell-size: 1.5rem;

    .map {
      display: grid;
      grid-template-columns: repeat(v-bind('(seatingChart?.width ?? 0) + 1'), var(--cell-size));
      grid-template-rows: repeat(v-bind('seatingChart?.height ?? 1'), var(--cell-size));
      width: fit-content;
      height: fit-content;
      transform-origin: center;
      /* 原点设为左上角，配合偏移计算 */
      transform: translate(v-bind('offsetX + "px"'), v-bind('offsetY + "px"')) scale(v-bind('mapScale'));

      .seat-item {

        svg {
          width: 100%;
          height: 100%;
        }
      }
    }


  }
}


.seating-chart-wrap::-webkit-scrollbar {
  display: none;
}

.seat-type {
  display: flex;
  width: 100%;
  justify-content: space-evenly;
  align-items: center;
  padding: 5px 0px;

  .seat-item {
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      width: fit-content;
      text-wrap: nowrap;
      color: #797d82;
      font-size: 0.9rem;
    }

    .seat-icon {
      width: 2rem;
      height: 2rem;
      margin-right: .1rem;
      /* 强制覆盖 use 内部图形的 fill */
    }
  }
}


.info {
  margin: 0 auto;
  width: 90%;
  display: grid;
  grid-template-columns: 60% 40%;
  // grid-template-rows: 20% 20% 60%;
  grid-template-rows: auto auto auto;
  grid-template-areas: 'a b' 'c c' 'd d' 'e e';
  align-items: center;
  padding: 5px 5px;
  background-color: antiquewhite;
  border-radius: 5px;
  line-height: 1.4;
  grid-row-gap: 6px;

  // height: 16vh;
  .button {
    place-self: center end;

    font-size: 0.9rem;
    color: orange;

    .up {
      transform: rotate(180deg);
    }

    //    .van-icon-arrow-up{
    // transform: rotate(180deg);
    //    } 
  }

  .film-time {
    grid-area: c;
    color: #797d82;
    font-size: 0.9rem;
  }

  .info-item-container {
    grid-area: d;
    height: 100%;
    place-self: start start;
    width: 100%;
    display: none;
    overflow: auto;
    justify-content: flex-start;
    position: relative;

    // margin: 4px 0;
    &.hidden {
      //  visibility: hidden;
      display: flex;
    }

    .info-item {
      width: 18.4%;
      margin-right: .65rem;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      //  align-items: center;
      justify-content: space-around;
      background-color: white;
      border-radius: 5px;
      padding: 0px 7px;

      // color: #797d82;
      .language {
        font-size: 0.7rem;
        color: #797d82;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      div {
        text-align: center;
        text-wrap: nowrap;

        span {
          font-size: 0.7rem;
        }
      }
    }

    .selected-item {
      border: orange 1px solid;

    }

    .sold-out {
      color: #797d82;
      pointer-events: none;
    }
  }

  .info-item-container::-webkit-scrollbar {
    display: none;
  }

  .selectedseat-container::-webkit-scrollbar {
    display: none;
  }

  .selectedseat-container {
    // border-top: 1px solid #fff;
    grid-area: e;
    height: 100%;
    place-self: start start;
    width: 100%;
    display: flex;
    overflow: auto;
    justify-content: flex-start;

    .selected-item {
      width: 28%;
      margin-right: .65rem;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      //  align-items: center;
      justify-content: space-around;
      background-color: white;
      border-radius: 5px;
      padding: 0 7px;

      .price-container {
        display: flex;
        justify-content: space-between;
        align-items: center;

        span {
          color: rgb(250, 182, 70);
        }

        .money-chart {
          font-size: 0.7rem;
        }
      }

    }
  }
}

.select-seat-button {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 0;
  left: 0;
  height: 6.5333vh;
  width: 100%;
  background-color: #ff5f16;
  color: hsla(0, 0%, 100%, .3);
  font-size: 1rem;
  line-height: 1;
  z-index: 100;
  pointer-events: none;
}

.seat-price {
  pointer-events: auto;
  color: #fff;
}
</style>