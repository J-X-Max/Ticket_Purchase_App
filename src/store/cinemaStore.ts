import { defineStore } from "pinia";
import { http } from '@/util/tools'
import { ref, computed } from "vue";
import useCityStore from "./cityStore";
import { getDistance } from "@/util/tools";
//引用另一个store
type Cinema = {
    cinemaId: number;  // 根据实际数据类型调整
    name: string;
    eTicketFlag: number;
    districtName: string;
    address: string;
    lowPrice: number;

    latitude: number;
    longitude: number;
}
type CinemaWithDistance = Cinema & {
    distance: number | string; // 距离，单位可选
};

interface Schedule {
    advanceStopMins: number;
    endAt: number;
    filmLanguage: string;
    hallName: string;
    imagery: string;
    isOnsell: boolean;
    marketPrice: number;
    maxSalePrice: number;
    minSalePrice: number;
    salePrice: number;
    scheduleId: number;
    showAt: number;
}
const useCinemaStore = defineStore("cinema", () => {
    const cityStore = useCityStore()
    // const scheduleList = ref<sches[]|null>(null); 
    const schedulesCache = ref<Record<string, Schedule[]>>({})
    const selectedType = ref(0);           // 订票类型：0-前台兑换，1-APP订票
    const selectedDistrict = ref(''); // 地区名，''表示全城
    const selectedSort = ref<'a' | 'b'>('a'); // 排序：a-最近去过，b-离我最近
    const oldcinemaList = ref<Cinema[]>([])
    const cinemaList = ref<Cinema[]>([])
    const typeOptions = [
        { text: 'APP订票', value: 0 },
        { text: '前台兑换', value: 1 },
    ];
    const sortOptions = [
        { text: '最近去过', value: 'a' },
        { text: '离我最近', value: 'b' },
    ];
    const getCinemaList = async () => {

        var res = await http({
            url: `/gateway?cityId=${cityStore.cityId}&ticketFlag=1&k=5385023`,
            headers: {
                'X-Host': 'mall.film-ticket.cinema.list'
            }
        })
        //  cinemaList.value = res.data.data.cinemas
        oldcinemaList.value = res.data.data.cinemas
    }


    const cinemasWithDistance = computed<CinemaWithDistance[]>(() => {
        if (!cityStore.userCoords) {
            // 如果还没有用户坐标，返回原始数据（距离字段留空）
            return oldcinemaList.value.map(cinema => ({ ...cinema, distance: "未知" }));
        }
        const { latitude: userLat, longitude: userLng } = cityStore.userCoords;
        return oldcinemaList.value.map(cinema => {
            const distance = getDistance(
                userLat,
                userLng,
                cinema.latitude,
                cinema.longitude
            );
            return {
                ...cinema,
                distance, // 添加距离字段
            };
        });
    });
    // 计算属性：过滤后的影院列表（同时应用类型和地区筛选）
    const filteredCinemas = computed(() => {
        return cinemasWithDistance.value.filter(item => {
            // 类型筛选
            if (item.eTicketFlag !== selectedType.value) return false;
            // 地区筛选（如果 selectedDistrict 不为 null）
            if (selectedDistrict.value && item.districtName !== selectedDistrict.value) return false;
            return true;
        });
    });
    const sortedCinemas = computed(() => {
        const list = filteredCinemas.value;
        
        return [...list].sort((a, b) => {
                 const distA = typeof a.distance === 'number' ? a.distance : Infinity;
            const distB = typeof b.distance === 'number' ? b.distance : Infinity;
            return distA - distB;
        });
         }
       
    );
    // 计算属性：所有不重复的地区名（基于原始列表，用于生成下拉选项）
    const districtOptions = computed(() => {
        const allDistricts = oldcinemaList.value.map(item => item.districtName);
        const unique = [...new Set(allDistricts)];
        // 添加“全城”选项作为第一个
        return [{ text: '全城', value: '' }, ...unique.map(name => ({ text: name, value: name }))];
    });
    //   computed( ()=>{
    //     return cinemaList.value.
    // }
    // )getDistance(cityStore.userCoords?.latitude,cityStore.userCoords?.longitude)
    // 返回需要暴露的状态和方法
    return {
        oldcinemaList,
        cinemasWithDistance,
        cinemaList,
        sortedCinemas,
        getCinemaList,
        selectedType,
        selectedDistrict,
        selectedSort,
        filteredCinemas,
        districtOptions,
        typeOptions,
        sortOptions,
        schedulesCache,
    };

})


export default useCinemaStore