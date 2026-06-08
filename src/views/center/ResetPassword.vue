<template>
    <div class="container">
        <div class="banner"><img src="https://assets.maizuo.com/h5/mz-auth/public/app/img/logo.19ca0be.png"></div>
        <form>
            <input type="tel" v-model="telnumber" maxlength="11" placeholder="手机号" name="phone" autofocus>
            <div v-if="!showInterval" @click="getgraphicCode" class="smsCode"
                :class="{ 'smsCode-active': isMobileValid }">获取验证码</div>
            <div v-if="showInterval" class="smsCode">{{ remainingSeconds ? remainingSeconds + '秒' : '等待中' }}</div>
            <van-icon v-if="telnumber ? true : false" name="close" @click="cleartel" />
            <div class="graphic-wrapper" v-if="isgraphic">
                <input v-model="graphicCode" maxlength="graphic_code.length" @change="Graphiccode_verification"
                    class="Graphic-text" type="text" placeholder="图形验证码" name="GraphicCode">
                <van-loading class="loading" v-if="showloading" type="spinner" color="#ff5f16" />
                <transition name="pop"><van-icon class="pass" v-if="showpassed" name="passed" /></transition>

                <div v-if="isgraphic" class="picture">
                    <img :src="graphic_code?.imgUrl">
                </div>
            </div>
            <div class="toast" v-if="showtip">{{ msg }}</div>
            <input v-model="smscode" type="tel" maxlength="6" placeholder="验证码" name="smsCode">

            <div class="toast" v-if="showSmsCodeTip">{{ smscodemsg }}</div>
            <input v-model="newpassword" type="password" maxlength="20" mixlength="6" placeholder="新密码" name="password">
            <div class="toast" v-if="showNewPasswordTip">{{ newpasswordmsg }}</div>
        </form>
        <div class="button-box"><button @click="handleLogin" :class="{ 'active': islogin }">重置密码</button></div>
    </div>

</template>


<script setup lang="ts">
import { useRouter } from 'vue-router'
import useTabbarStore from '@/store/tabbarStore'
import { Icon as vanIcon, showToast, Loading as vanLoading } from 'vant'
import { onUnmounted, ref, watch } from 'vue'
import { http } from '@/util/tools.ts'
import CryptoJS from 'crypto-js';//MD5加密
import type { GraphicCode } from '@/types'
// type gra = {
//     imgUrl: string,
//     imgKey: string,
//     length: number,
// }
const smscodemsg = ref('')
const newpasswordmsg = ref('请输入6至20位密码')
const showSmsCodeTip = ref(false)
const showNewPasswordTip = ref(false)
const msg = ref('')
const newpassword = ref('')
const showloading = ref(false)
const showpassed = ref(false)
const tabbarStore = useTabbarStore()
const isMobileValid = ref(false);
const islogin = ref(false)
const showtip = ref(false)
const router = useRouter()
// const route = useRoute()
const telnumber = ref('')
const isgraphic = ref(false)
const graphic_code = ref<GraphicCode | null>(null)
const graphicCode = ref('')
const smscode = ref('')
const timer = ref<number | null>(null);
const remainingSeconds = ref<number>(60)
let timerInterval: number | null = null
const showInterval = ref(false)
// 开始倒计时（页面加载自动执行）
function startCountdown() {
    if (timerInterval !== null) return; // 避免重复启动
    timerInterval = setInterval(() => {
        if (remainingSeconds.value <= 0) {
            // 倒计时结束
            // remainingSeconds.value = '等待中'
            clearInterval(timerInterval!);
            timerInterval = null;
            showInterval.value = false
        } else {
            remainingSeconds.value--;
        }
    }, 1000);
}
const handleLogin = async () => {
    console.log('1')
    if (!isMobileValid.value) {
        showToast('请输入正确的手机号')
        return
    }
    if (smscode.value.length !== 6) {
        showToast('请输入正确的验证码')
        return
    }
    let hashed = CryptoJS.MD5(newpassword.value).toString();
    try {
        const res1 = await http.post('/gateway/', { imgCode: "", imgKey: "", mobile: telnumber.value, password: hashed, smsCode: smscode.value },
            {
                headers: {
                    'X-Host': 'mall.user.password.reset',
                }
            })
        if (res1.data.status === 6101) {
            // showToast(res1.data.msg)
            smscodemsg.value = res1.data.msg
            showSmsCodeTip.value = true
        } else {
            // showToast('success')           
            router.back();          // 默认跳转首页
        }
    } catch (error) {
        console.log(error)
    }
}
watch([telnumber, graphicCode, smscode, newpassword], ([newValtel, newgraphicCode, newsmscode, new_newpassword]) => {
    if (newValtel.length !== 11) {
        isMobileValid.value = false;
    } else {
        // 注意：第二个参数设为 false，避免每次输入都弹 toast
        isMobileValid.value = validateMobile(newValtel, false);
    }

    // 图形码部分：当已输入长度小于验证码要求长度时，清除“通过”标志
    if (graphic_code.value && newgraphicCode.length < graphic_code.value.length) {
        showpassed.value = false;
        showtip.value = false;
    }
    if (new_newpassword.length < 20 && new_newpassword.length >= 6 && newsmscode) {
        islogin.value = true

    } else {
        islogin.value = false
        if (new_newpassword.length > 20 || new_newpassword.length < 6 && new_newpassword) {
            showNewPasswordTip.value = true
        } else {

            showNewPasswordTip.value = false
        }
    }
})
const Graphiccode_verification = async () => {
    console.log('4')
    if (graphicCode.value.length !== graphic_code.value?.length || !isMobileValid.value) return
    showloading.value = true
    try {
        const res1 = await http.post('/gateway/', { imgCode: graphicCode.value, imgKey: graphic_code.value?.imgKey, mobile: telnumber.value, type: '1' },
            {
                headers: {
                    'X-Host': 'mall.user.sms-code.send',
                }
            })
        showloading.value = false
        if (res1.data.status === 0) {
            showpassed.value = true
        } else {

            showInterval.value = true
            msg.value = res1.data.msg
            showtip.value = true
            // showToast(res1.data.msg)
            if (timer.value) clearTimeout(timer.value);
            timer.value = setTimeout(async () => {
                await getcode()
            }, 1000)
        }
    } catch (error) {
        console.log(error)
    }


}
const getcode = async () => {

    const res2 = await http.get('/gateway/',
        {
            headers: {
                'X-Host': 'mall.user.captcha',
            }
        })
    graphic_code.value = res2.data.data
}
const getgraphicCode = async () => {
    if (!validateMobile(telnumber.value, true)) return

    startCountdown()
    try {
        const res1 = await http.post('/gateway/', { imgCode: '', imgKey: '', mobile: telnumber.value, type: '1' },
            {
                headers: {
                    'X-Host': 'mall.user.sms-code.send',
                }
            })
        if (res1.data.status === 6103) {
            showToast(res1.data.msg)
        }
        if (res1.data.status === 6007) {
            msg.value = res1.data.msg


            await getcode()

            showInterval.value = true
            isgraphic.value = true
            showtip.value = true
        }
    } catch (error) {
        console.log(error)
    }
}
const cleartel = () => {
    telnumber.value = ''
}

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


(() => {
    tabbarStore.isTabbarShow = false
})()
onUnmounted(() => {
    if (timer.value) clearTimeout(timer.value);
    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
    };
});

</script>
<style scoped lang="scss">
.container {
    width: 100%;
    height: 70%;

    .banner {
        height: 28vh;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
            width: 20vw;
            height: 20vw;
        }
    }

    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        position: relative;

        >input:first-child {
            anchor-name: --tel;
        }

        input,
        input:focus,
        input:hover {
            width: 90%;
            height: 7vh;
            margin-bottom: 5px;
            border: none;
            outline: none;
            box-shadow: none;
            background: transparent;
            border-bottom: 1px solid #cccccc57;
        }

        .smsCode {
            color: #6160609a;
            pointer-events: none;
            anchor-name: --smsCode;
            position: absolute;
            position-anchor: --tel;
            right: anchor(right);
            transform: translate(0, -50%);
            top: anchor(center);

            &.smsCode-active {
                color: black;
                pointer-events: auto;
            }
        }

        .van-icon {
            position: absolute;
            position-anchor: --smsCode;
            right: anchor(left);
            transform: translate(-10px, -50%);
            top: anchor(center);
        }

        .graphic-wrapper {
            position: relative;
            width: 100%;
            text-align: center;

            .Graphic-text {
                anchor-name: --graphic
            }

            .picture {
                width: fit-content;
                height: fit-content;
                position: absolute;
                right: anchor(--graphic right); //注意这里使用anchor-name后第三个属性偏移量不生效
                transform: translate(0, -50%);
                top: anchor(--graphic center);
            }

            .loading,
            .pass {
                width: 5vw;
                height: 5vw;
                position: absolute;
                left: 20%;
                transform: translate(0, -50%);
                top: 50%;
            }

            .pop-enter-active {
                transition: all 0.5s ease;
            }

            .pop-enter-from {
                opacity: 0;
                transform: scale(0.5);
            }

            .pop-enter-to {
                opacity: 1;
                transform: scale(1);
            }

            .pass {
                font-size: 1.4rem;
                color: #08bd2c;
                position: absolute;
                left: 20%;
                transform: translate(0, -50%);
                top: 50%;
            }

        }

        .toast {
            color: #ff5f16;
            width: 90%;
            text-align: left;
            font-size: .7rem;
            padding-top: 3px;
        }
    }

    .button-box {
        padding: 20px 0;
        padding-bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;

        button {
            width: 80%;
            height: 6vh;
            border-radius: 5px;
            background-color: #ff5f16;
            color: #ffffff88;
            pointer-events: none;
            border: none;
            anchor-name: --button;

        }

        .active {
            pointer-events: all;
            color: rgb(255, 255, 255);
        }
    }

}

// sk-bd13ff5b63a442acbea275ecddf66501</style>