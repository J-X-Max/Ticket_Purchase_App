<template>
    <myheader class="title" title="更换手机号" leftType="back" />
    <div class="box">
        <div v-show="showoldtel">当前绑定手机号 {{ passMobile }}</div>

        <div class="sms-input-box" v-show="shownewtel">
            <input maxlength="11" v-model="newtel" placeholder="请输入您需要绑定的新手机号" type="tel">

            <van-icon class="close" v-if="showtelclear" name="close" @click="cleartel" />
        </div>
        <div class="sms-input-box" v-show="showinput"><input maxlength="6" v-model="smscode" placeholder="请输入收到的短信验证码"
                type="tel">
            <van-icon class="close" v-if="showclear" name="close" @click="clearsms" />
            <span v-if="!showInterval" :class="{ 'smsCode-active': isactive }" @click="fetchSmSandCaptcha">获取验证码</span>
            <span v-if="showInterval" class="interval">{{ remainingSeconds ? remainingSeconds + '秒' : '等待中' }}</span>
        </div>
        <div class="graphic-input-box" v-show="showgraphicinput"><input v-model="graCode"
                :maxlength="graphicCode?.length" placeholder="图形验证码" type="tel">
            <transition name="pop"><van-icon class="pass" v-if="showpassed" name="passed" /></transition>
            <img :src="graphicCode?.imgUrl" @click="refreshCaptcha"></img>
        </div>

        <div class="toast" v-if="showtip">{{ msg }}</div>
        <button @click="changeMobile" :class="{ 'able': isable }">{{ buttonText }}</button>
        <div>收不到验证码</div>
    </div>
</template>
<script lang="ts" setup>
import { Icon as vanIcon, showToast } from 'vant'
import useSetStore from '@/store/setStore';
import { computed, ref, onUnmounted, watch } from 'vue'
import Myheader from '@/components/Myheader.vue';
import { http } from '@/util/tools.ts';
import { useRouter } from 'vue-router'
import type { GraphicCode } from '@/types';
// type gra = {
//     imgUrl: string,
//     imgKey: string,
//     length: number,
// }

const router = useRouter()
const showtelclear = ref(false)
const showoldtel = ref(true)
const shownewtel = ref(false)
const newtel = ref('')
const showtip = ref(false)
const msg = ref('')
const showclear = ref(false)
const showpassed = ref(false)
const graCode = ref('')
const smscode = ref('')
const isable = ref(false)
const showInterval = ref(false)
const buttonText = ref('更换手机号')
const isactive = ref(false)
const remainingSeconds = ref<number>(60)
const setStore = useSetStore()
const showinput = ref(false)
const showgraphicinput = ref(false)
const graphicCode = ref<GraphicCode | null>(null)
const processCode = ref(0)
const isInitialization = ref(false)
const fetchSmSed = ref(false)
const authToken = ref('')
let timerInterval: number | null = null

const clearsms = () => {
    smscode.value = ''
}

const cleartel = () => {
    newtel.value = ''
}
function startCountdown() {
    if (timerInterval !== null) return; // 避免重复启动
    timerInterval = setInterval(() => {
        if (remainingSeconds.value <= 0) {
            // 倒计时结束
            // remainingSeconds.value = '等待中'
            isactive.value = false
            clearInterval(timerInterval!);
            timerInterval = null;
            showInterval.value = false
        } else {
            remainingSeconds.value--;
        }
    }, 1000);
}
const changeMobile = async () => {
    // showinput.value = true
    // buttonText.value = '下一步'
    // isable.value = true
    if (processCode.value === 0) {
        try {
            const res = await http.post('gateway', null,
                {
                    headers: {
                        'X-Host': 'mall.user.mobile-change-check',
                        "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                    }
                })

        if(res.data.status === 0){
        processCode.value = 1
        }
        } catch (error) {
            console.log(error)
        }
    } else if (processCode.value === 1) {
        if (smscode.value.length === 6) {
            postSms()
        }
    } else if (processCode.value === 2) {
        if (newtel.value === setStore.mobile) {
            showToast({
                message: '该手机号和当前绑定手机号一致',
                duration: 2000,
            })
            return
        }else{
postMobilechange()
        }
    }

}
const postMobilechange = async () => {
    try {
        const res = await http.post('/gateway',
           {
    "authToken":authToken.value ,
    "mobile": newtel.value,
    "smsCode": smscode.value,
    "oldMobile":setStore.mobile, 
},
            {
                headers: {
                    'X-Host': 'mall.user.mobile-change',
                    'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NjY3MzU4MywidXNlcklkIjozMTk0MjU4N30.pg1pQdbN1JojxtO-lNVfAutyrFpYtcVeMAI9KX1iCvQ'
                }
            })
            if (res.data.status === 0) {
                router.back()
            }else{
                msg.value = res.data.msg
                showtip.value = true
            }
}catch (error) {
        console.log(error)
    }

}

const passMobile = computed(() => {
    if (!setStore.mobile) return ''
    return setStore.mobile.replace(setStore.mobile.slice(3, 7), '****')
})
const refreshCaptcha = async () => {
    try {
        const res = await http.get('/gateway', {
            headers: { 'X-Host': 'mall.user.captcha' }
        })
        if (res.data.status === 0) {
            graphicCode.value = res.data.data
            // 清空输入
            // codeValues.value = '' 
            // 聚焦第一个输入框

        }
    } catch (error) {
        console.log(error)
    }
}


const fetchSmSandCaptcha = async () => {
    if (processCode.value === 1) {

        isactive.value = true
        setTimeout(() => {
            showInterval.value = true
        }, 150)
        const res2 = await http.post('/gateway',
            {
                imgCode: graCode.value || '',
                imgKey: graphicCode.value?.imgKey || '',
                mobile: setStore.mobile,
                type: '7',
            },
            {
                headers: {
                    'X-Host': 'mall.user.sms-code.send',
                    'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NjY3MzU4MywidXNlcklkIjozMTk0MjU4N30.pg1pQdbN1JojxtO-lNVfAutyrFpYtcVeMAI9KX1iCvQ'
                }
            })
        if (res2.data.status === 6007 || res2.data.status === 6006) {
            // msg.value = res2.data.msg
            const res3 = await http.get('/gateway',
                {
                    headers: {
                        'X-Host': 'mall.user.captcha',
                    }
                })
            if (res3.data.status === 0) {
                graphicCode.value = res3.data.data
                showgraphicinput.value = true

                startCountdown()
                // showimg.value = true
                // showsuccess.value = false
                // processCode.value = 0
            }

        } else if (res2.data.status === 0 || res2.data.status === 6103 || res2.data.status === -1) {//发送验证码成功
            // codeValues.value = ''
            // processCode.value = 1

            fetchSmSed.value = true
            if (res2.data.status === 6103 || res2.data.status === -1) {
                msg.value = res2.data.msg
                showtip.value = true
            } else if (res2.data.status === 0) {
                // msg.value = ''
                // showsuccess.value = true
                showpassed.value = true

            }
        }
    } else if (processCode.value === 2) {
        isactive.value = true
        setTimeout(() => {
            showInterval.value = true
        }, 150)
        const res2 = await http.post('/gateway',
            {
                imgCode: graCode.value || '',
                imgKey: graphicCode.value?.imgKey || '',
                mobile: newtel.value,
                type: '8',
            },
            {
                headers: {
                    'X-Host': 'mall.user.sms-code.send',
                    'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NjY3MzU4MywidXNlcklkIjozMTk0MjU4N30.pg1pQdbN1JojxtO-lNVfAutyrFpYtcVeMAI9KX1iCvQ'
                }
            })
        if (res2.data.status === 6007 || res2.data.status === 6006) {
            // msg.value = res2.data.msg
            const res3 = await http.get('/gateway',
                {
                    headers: {
                        'X-Host': 'mall.user.captcha',
                    }
                })
            if (res3.data.status === 0) {
                graphicCode.value = res3.data.data
                showgraphicinput.value = true

                startCountdown()
                // showimg.value = true
                // showsuccess.value = false
                // processCode.value = 0
            }

        } else if (res2.data.status === 0 || res2.data.status === 6103 || res2.data.status === -1) {//发送验证码成功
            // codeValues.value = ''
            // processCode.value = 1

            fetchSmSed.value = true
            if (res2.data.status === 6103 || res2.data.status === -1) {
                msg.value = res2.data.msg
                showtip.value = true
            } else if (res2.data.status === 0) {
                // msg.value = ''
                // showsuccess.value = true
                showpassed.value = true

            }
        }
    }


}
const postSms = async () => {
    try {
        const res = await http.post('/gateway', {
            smsCode: smscode.value,
            type: 1
        }, {
            headers: {
                'X-Host': 'mall.user.authorize',
                'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NjY3MzU4MywidXNlcklkIjozMTk0MjU4N30.pg1pQdbN1JojxtO-lNVfAutyrFpYtcVeMAI9KX1iCvQ'
            }
        })
        if (res.data.status === 0) {
            authToken.value = res.data.data.authToken
            processCode.value = 2
            // captcha.value = res.data.data
            // 清空输入
            // codeValues.value = '' 
            // 聚焦第一个输入框

        } else {
            msg.value = res.data.msg
            showtip.value = true
        }
    } catch (error) {
        console.log(error)
    }
}
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

watch([processCode, graCode, smscode, newtel], async ([newProcessCode, newgraCode, newsmscode], [_oldProcessCode, _oldgraCode, _oldsmscode]) => {

    switch (newProcessCode) {
        case 1:     //短信码阶段
            showinput.value = true
            buttonText.value = '下一步'
            isable.value = true
            if (newsmscode) {
                showclear.value = true
                if (newsmscode.length === 6) {
                    isable.value = false
                }
            }
            if (!fetchSmSed.value && newgraCode.length === graphicCode.value?.length) {
                await fetchSmSandCaptcha()
            }

            break

        case 2:
    if (!isInitialization.value){
        if(timerInterval!==null){
            clearInterval(timerInterval)
            timerInterval = null
        }
        console.log('1')
        remainingSeconds.value = 60
        smscode.value = ''
        graCode.value = ''
        showpassed.value = false
        showclear.value = false
        showoldtel.value = false
        showgraphicinput.value = false
        shownewtel.value = true
        buttonText.value = '提交'
        showInterval.value = false
        showtip.value = false
        fetchSmSed.value = false
        isInitialization.value = true //初始化完成
    } 
            if (validateMobile(newtel.value, false)) {
                isactive.value = false
            } else {

                isactive.value = true
            }
        
            if (newtel.value) {
                showtelclear.value = true
            } else {
                showtelclear.value = false
            }
            if (newsmscode.length === 6 && validateMobile(newtel.value, false)) {
                isable.value = false
            } else {
                isable.value = true
            }
console.log(graCode.value,newgraCode,graphicCode.value?.length)
             if (!fetchSmSed.value && graCode.value.length === graphicCode.value?.length) {

        console.log('2')
                await fetchSmSandCaptcha()
            }
            break
        
        // default

    }
}, { immediate: true })
onUnmounted(() => {
    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
    };
});
</script>
<style lang="scss" scoped>
.box {
    padding: 0 1.25rem;

    div,
    button {
        width: 100%;
        margin-top: 2rem;
        font-size: .95rem;
    }

    .sms-input-box,
    .graphic-input-box {
        // padding: ;
        height: 2.75rem;
        border-bottom: 1px solid #d6d6d67f;
        display: flex;
        justify-content: space-between;
        align-items: center;

        input {
            flex: 1;
            border: none;
            background-color: transparent;
        }

        input::placeholder {

            color: #a9a9a9b5;
        }

        .close,
        .pass {
            margin-right: 20px;
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

        .smsCode-active,
        .interval {
            color: rgba(194, 194, 194, 0.599);
            pointer-events: none;
        }

        img {
            width: 75px;
            height: auto;
        }
    }

    .toast {
        color: #ff5f16;
        text-align: left;
        font-size: .7rem;
        // padding-top: 3px;
        margin: 5px 0;
    }

    button {
        height: clamp(44px, 50px + 0.1rem, 60px);
        background: #ff5f16;
        border: none;
        border-radius: 3px;
        color: hsl(0, 0%, 100%);
        font-size: 1rem;

        &.able {

            color: hsla(0, 0%, 77%, 0.551);
            pointer-events: none;
        }
    }

    >div:last-child {
        text-align: right;
    }
}

// .title {
//     background: #fff;
//     color: #000;
// }</style>