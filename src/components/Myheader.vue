        <template>
            <van-nav-bar :title="computedTitle" @click-left="handleLeftClick" @click-right="handleRightClick">
                <template #left>
                    <div v-if="leftType === 'city'">
                        <span style="float: left;">{{ cityStore.cityName }}</span>
                        <van-icon name="arrow-down" />
                    </div>
                    <div v-else-if="leftType === 'back'">
                        <van-icon name="arrow-left" />
                    </div>
                </template>
                <template #right>
                    <van-icon v-if="showSearch" name="search" color="black"  />
                    <span class="time" v-else-if="Time.showTime">{{ formattedTime }}</span>
                    <span v-else-if="text">{{ text }}</span>
                    <van-icon v-else-if="showWarning" name="warning-o" />
                </template>
            </van-nav-bar>
        </template>
<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useCityStore from '@/store/cityStore';
import {
    NavBar as vanNavBar,
    Icon as vanIcon,
} from 'vant';

const router = useRouter()
const route = useRoute()
const cityStore = useCityStore()
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    leftType: {
        type: String as () => 'city' | 'back' | '',
        default: '' // 默认为城市选择模式
    },
    showSearch: {
        type: Boolean,
        default: false // 默认显示搜索图标
    },
    Time: {
        type: Object,
        default: () => ({ showTime: false, Seconds: 0 }) // 默认显示搜索图标
    },
    preventDefaultBack: {
        type: Boolean,
        default: true
    },
    text: {
        type: String,
        default: ''
    },
    showWarning: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['back', 'showBackPopup', 'Timeout', 'save','showBackUser','goToWarning'])
// 点击城市，跳转到城市选择页

// 点击搜索，跳转到搜索页面（可根据需要调整路径）
// const goToSearch = () => {
//     router.push('/cinemas/search') // 或者 '/cinemas/search' 等
// }
const handleRightClick = () => {
    if (props.showSearch) {
        router.push('/cinemas/search') // 或者 '/cinemas/search' 等
        return
    }
    if (props.text) {
        emit('save')
        return
    }
    if (props.showWarning) {
        emit('goToWarning')
        return
    }
}
const handleLeftClick = () => {
    // 如果没有阻止默认返回行为，则执行返回上一级
    if (props.preventDefaultBack && props.leftType === 'back') {
        if (props.Time.showTime) {
            emit('showBackPopup')
            return
        }
        if(props.text){
            emit('showBackUser')
            return
        }
        router.back()

    } else if (props.preventDefaultBack && props.leftType === 'city') {
        router.push('/city')
    }else {
        emit('back')
    }
}
const computedTitle = computed(() => {
    if (props.title) {
        return props.title
    }
    // 从路由元信息中读取 title
    if (route.meta?.title) {
        return route.meta.title as string
    }
    return '' // 默认空
})
// 剩余秒数（5分钟 = 300秒）
const remainingSeconds = ref(props.Time.Seconds)
let timerInterval: number | null = null
// 监听外部传入的 Seconds 变化，同步更新内部状态并重置倒计时
watch(
    () => props.Time.Seconds,
    (newSeconds) => {
        // 更新剩余秒数
        remainingSeconds.value = newSeconds
        // 如果倒计时正在运行，先清除
        if (timerInterval !== null) {
            clearInterval(timerInterval)
            timerInterval = null
        }
        // 如果要求显示倒计时且新的剩余秒数 > 0，重新启动
        if (props.Time.showTime && remainingSeconds.value > 0) {
            startCountdown()
        }
    },
    { immediate: false } // 不立即执行，因为组件初始化时已设置过初始值
)


// 更新时间显示（mm:ss 格式）
// 格式化后的时间字符串（用于显示）
const formattedTime = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60)
    const seconds = remainingSeconds.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})
// 开始倒计时（页面加载自动执行）
function startCountdown() {
    if (timerInterval !== null) return; // 避免重复启动
    timerInterval = setInterval(() => {
        if (remainingSeconds.value <= 0) {
            // 倒计时结束
            clearInterval(timerInterval!);
            timerInterval = null;
            emit('Timeout')
        } else {
            remainingSeconds.value--;
        }
    }, 1000);
}

// 页面加载后自动启动
// 组件挂载后启动倒计时（仅当 showTime 为 true 时）
onMounted(() => {
    if (props.Time.showTime && remainingSeconds.value > 0) {
        startCountdown()
    }
})

// 组件卸载前清除定时器，避免内存泄漏
onUnmounted(() => {
    if (timerInterval !== null) {
        clearInterval(timerInterval)
        timerInterval = null
    }
})
</script>
<style lang="scss" scoped>
.van-nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: white;
    height: 7vh;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(.van-nav-bar__content) {
        width: 100%;
        height: 100%;

        .van-nav-bar__title {
            font-size: $font-size-md;
        }

        .van-nav-bar__left {
            font-size: $font-size-base;

        }

        .van-nav-bar__right {
            // font-size: $font-size-base;
            font-size: 1.3rem;

            span {
                font-size: 1rem;
            }

            .time {
                color: orange;
            }
        }
    }
}
</style>
