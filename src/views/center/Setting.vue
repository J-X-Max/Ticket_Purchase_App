<template>
    <template v-if="userInfo">
        <myheader class="title" title="设置" leftType="back" />
        <van-cell-group>
            <van-cell title="账号ID" :value="`${userInfo.gender}` + userInfo.userId" />
        </van-cell-group>

        <van-cell-group>
            <van-cell title="登录密码" is-link value="修改" to="/user/reset-password" />
            <van-cell title="安全密码" is-link :value="userInfo.hasPayPwd ? '修改' : '未设置'" to="/user/security-code" />
        </van-cell-group>

        <van-cell-group>
            <van-cell title="手机号码" is-link :value="passMobile" to="/user/change-mobile" />

            <van-cell title="软件版本" is-link />
            <van-cell title="隐私政策" is-link />
            <van-cell title="用户协议" is-link />
            <van-cell title="个人信息与第三方共享说明" is-link />
            <van-cell title="意见反馈" is-link />
        </van-cell-group>
        <van-cell-group>
            <van-cell title="清除缓存" @click="clearCache" is-link value="0KB" />
        </van-cell-group>
        <van-cell-group>
            <van-cell title="注销账号" is-link />
        </van-cell-group>
        <button @click="Exitlog">退出登录</button>

        <van-popup class="clear-box" v-model:show="showclearCache" round safe-area-inset-bottom position="bottom"
            :style="{ height: 'auto' }">
            <div class="title">是否确认清除缓存</div>
            <div class="comfirm" @click="comfirm">清除</div>
            <div class="cancel" @click="cancel">取消</div>
        </van-popup>

        <van-popup class="clear-box" v-model:show="showExit" round safe-area-inset-bottom position="bottom"
            :style="{ height: 'auto' }">
            <div class="title">是否退出卖座电影</div>
            <div class="comfirm" @click="exit">退出</div>
            <div class="cancel" @click="cancel">取消</div>
        </van-popup>
    </template>
</template>
<script lang="ts" setup>
import Myheader from '@/components/Myheader.vue';
import { Cell as vanCell, CellGroup as vanCellGroup, Popup as vanPopup } from 'vant';
import { http } from '@/util/tools';
import { ref, onBeforeMount, computed } from 'vue'
import useTabbarStore from '@/store/tabbarStore';
import useSetStore from '@/store/setStore';
import { useRouter } from 'vue-router';
import type { User } from '@/types';
// type User = {
//     mobile: string,
//     headIcon: string,
//     nickName: string,
//     gender: number,
//     birthday: string,
//     userId: number,
//     hanPassword: number,
//     hasPayPwd: number,
// }
const router = useRouter()
const showExit = ref(false)
const showclearCache = ref(false)
const setStore = useSetStore()
const tabbarStore = useTabbarStore()
const userInfo = ref<User | null>(null);
const clearCache = () => {
    showclearCache.value = true
}
const Exitlog = () => {
    showExit.value = true
}
const exit = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('set');
    router.push('/login')
}
const comfirm = () => {

    showclearCache.value = false

}

const cancel = () => {
    showclearCache.value = false
    showExit.value = false
}
const fetchUser = async () => {
    try {
        const [res1] = await Promise.all([//_是占位符号,不用的参数可以用其占位,但是不能在一个数组里出现两个_ 这样是重复声明了,可以用_res4等不同的变量名即可.
            http.get('/gateway/', {
                params: {
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.user.info.get',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),
        ])

        userInfo.value = res1?.data.data
        setStore.mobile = userInfo.value?.mobile
    } catch (error) {
        console.log(error)
    }
}
const passMobile = computed(() => {
    if (!userInfo.value) return ''
    return userInfo.value.mobile.replace(userInfo.value.mobile.slice(3, 7), '****')
})
tabbarStore.isTabbarShow = false
onBeforeMount(
    fetchUser

)
</script>
<style scoped lang="scss">
.van-cell-group {
    margin-top: .625rem;
}

button {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3.125rem;
    background-color: rgb(255, 255, 255);
    color: #ff5f16;
    text-align: center;
    border: none;
}

.clear-box {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    // padding: 0 10px;
    background: #ececec;

    .cancel,
    .comfirm {
        padding: 1rem 0;
        background-color: #ffffff;
    }

    .title {
        border-bottom: 1px solid #dedede8b;
        padding: .55rem 0;
        font-size: .9rem;
        color: #bdc0c5;

        background-color: #ffffff;
    }

    .comfirm {
        margin-bottom: 5px;
        color: #ff5f16;
    }

    .cancel {
        margin-top: auto;
    }
}
</style>