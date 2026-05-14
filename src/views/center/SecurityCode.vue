<template>
    <van-popup v-model:show="showPopup" round safe-area-inset-bottom position="center" :style="{ width: '68vw' }">
        <div class="title">{{ popupmsg }}</div>
        <div class="option">
            <div @click="comfirm">确认</div>
        </div>
    </van-popup>
    <div class="box">
        <span>{{ titletext }}</span>
        <img v-if="captcha && showimg" :src="captcha?.imgUrl" @click="refreshCaptcha">
        <input autofocus v-model="codeValues" id="hiddenInput" class="hidden-input" type="text"
            :maxlength="smslength || captcha?.length" @focus="onFocus" @blur="onBlur">
        <label for="hiddenInput" class="input-box" :class="{ 'input-active': isactive }">
            <span class="input-item" v-for="i in smslength || captcha?.length" :key="i">{{ formattedEnter(i) }}</span>
        </label>
        <span class="errortip">{{ msg }}</span>
        <span class="success" v-if="showsuccess">{{ formattedMobile }}</span>
        <span class="voice" v-show="voicetip">收不到验证码?试试语音播报</span>
        <transition name="pop"><van-icon class="pass" v-if="showpassed" name="passed" /></transition>
    </div>
</template>
<script lang="ts" setup>

import { Popup as vanPopup, Icon as vanIcon } from 'vant';
import { useRouter } from 'vue-router'
import { http } from '@/util/tools'
import { onBeforeUnmount, onBeforeMount, ref, watch, computed } from 'vue'
import CryptoJS from 'crypto-js';//MD5加密
import type { GraphicCode,UserSecurity } from '@/types'
// type gra = {
//     imgUrl: string,
//     imgKey: string,
//     length: number,
// }
// type user = {
//     data: {
//         mobile: string,
//     }
//     msg: string,
//     status: number
// }
const processCode = ref(0)
const router = useRouter()
const showpassed = ref(false)
const showPopup = ref(false)
const popupmsg = ref('')
const passwordCompleted = ref(false)
let password1Copy: string
let smscopy: string
const titletext = ref('输入图形验证码')
const smslength = ref(0)
const showimg = ref(false)
const showsuccess = ref(false)
const captcha = ref<GraphicCode | null>(null)
const Userdata = ref<UserSecurity | null>(null)
const msg = ref('')
const voicetip = ref(false)
const isactive = ref(false)
let timer: number | null = null
const isProcessing = ref(false); // 防止重复触发
const SWITCH_DELAY = 150; // 毫秒，可调整为 100~200
// 验证码值数组
const codeValues = ref('')
const comfirm = () => {
    showPopup.value = false
}
const formattedEnter = computed(() => {
    return (i: number) => {

        if (processCode.value !== 2 && processCode.value !== 3) return codeValues.value[i - 1]
        const maskedString = '•'.repeat(codeValues.value.length);
        return maskedString[i - 1] || ''

    }
})
const formattedMobile = computed(() => {
    if (processCode.value === 3) {
        return '请输入刚才设置的6位数字'
    } else if (processCode.value === 2) {
        return '请自由输入6位数字'
    } else {
        return Userdata.value?.data.mobile?.replace(/(\d{3})(\d{4})(\d{4})/, '短信验证码已发送至:$1 $2 $3')
    }

})

watch([captcha, codeValues, processCode], ([newCaptcha, _newCodeValues, newProcessCode], [oldCaptcha, _oldCodeValues, _oldProcessCode]) => {
    console.log(processCode.value)
    if (newCaptcha !== oldCaptcha) {
        codeValues.value = '';
    }
    if (codeValues.value) {
        msg.value = ''
        voicetip.value = false
    }
    if (codeValues.value && timer !== null) {
        clearTimeout(timer)
        timer = null

    }
    if (isProcessing.value) return;
    switch (newProcessCode) {
        case 0:        //图形码阶段

            titletext.value = '输入图形验证码';
            smslength.value = 0
            if (codeValues.value.length === captcha.value?.length) {
                fetchSmSandCaptcha()

            }
            break
        case 1:     //短信码阶段

            titletext.value = '输入短信验证码'
            smslength.value = 6
            timer = setTimeout(() => {
                voicetip.value = true
            }, 120000)
            showimg.value = false
            if (codeValues.value.length === 6) {
                if (!passwordCompleted.value) {
                    isProcessing.value = true;
                    smscopy = codeValues.value
                    setTimeout(() => {
                        codeValues.value = '';
                        processCode.value = 2;
                        isProcessing.value = false;
                    }, SWITCH_DELAY);
                } else {

                    smscopy = codeValues.value
                    fetchSmSandPassword()
                }
            }

            break

        case 2:
            voicetip.value = false
            showsuccess.value = true
            titletext.value = '输入安全密码';
            console.log('2密码阶段')
            if (codeValues.value.length === 6) {
                console.log('2密码长度为6');
                isProcessing.value = true;
                password1Copy = codeValues.value
                setTimeout(() => {
                    codeValues.value = '';
                    processCode.value = 3;
                    isProcessing.value = false;
                }, SWITCH_DELAY);//密码阶段1
            }
            break
        case 3:
            titletext.value = '再次输入安全密码';
            if (codeValues.value.length === 6) {

                console.log('3密码长度为6');
                isProcessing.value = true;
                if (password1Copy === codeValues.value) {
                    console.log('一致');
                    fetchSmSandPassword()
                    isProcessing.value = false;
                    //两次密码一样,提交请求并且跳转
                } else {

                    console.log('不一致');
                    setTimeout(() => {
                        codeValues.value = ''

                        processCode.value = 2
                    }, SWITCH_DELAY)
                    msg.value = '两次密码输入不一致'

                    isProcessing.value = false;
                    //两次密码不一样,提示用户两次密码输入不一致,返回第一次输入密码
                }
            }

            break
        // default:

    }
}, { immediate: true })


// 刷新验证码
const refreshCaptcha = async () => {
    try {
        const res = await http.get('/gateway', {
            headers: { 'X-Host': 'mall.user.captcha' }
        })
        if (res.data.status === 0) {
            captcha.value = res.data.data
            // 清空输入
            // codeValues.value = '' 
            // 聚焦第一个输入框

        }
    } catch (error) {
        console.log(error)
    }
}




const onFocus = () => {
    isactive.value = true

}

const onBlur = () => {
    isactive.value = false
}
const fetchUser = async () => {
    const res1 = await http.get('/gateway',
        {
            headers: {
                'X-Host': 'mall.user.info.get',
                'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NjY3MzU4MywidXNlcklkIjozMTk0MjU4N30.pg1pQdbN1JojxtO-lNVfAutyrFpYtcVeMAI9KX1iCvQ'
            }
        })
    return Userdata.value = res1.data
}
const fetchSmSandCaptcha = async () => {
    const res2 = await http.post('/gateway',
        {
            imgCode: codeValues.value || '',
            imgKey: captcha.value?.imgKey || '',
            mobile: Userdata.value?.data.mobile,
            type: '5',
        },
        {
            headers: {
                'X-Host': 'mall.user.sms-code.send',
                'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NjY3MzU4MywidXNlcklkIjozMTk0MjU4N30.pg1pQdbN1JojxtO-lNVfAutyrFpYtcVeMAI9KX1iCvQ'
            }
        })
    if (res2.data.status === 6007 || res2.data.status === 6006) {
        msg.value = res2.data.msg
        // showimg.value = true
        const res3 = await http.get('/gateway',
            {
                headers: {
                    'X-Host': 'mall.user.captcha',
                }
            })
        if (res3.data.status === 0) {
            captcha.value = res3.data.data
            showimg.value = true
            showsuccess.value = false
            processCode.value = 0
        }

    } else if (res2.data.status === 0 || res2.data.status === 6103 || res2.data.status === -1) {//发送验证码成功
        codeValues.value = ''
        processCode.value = 1

        if (res2.data.status === 6103 || res2.data.status === -1) {
            msg.value = res2.data.msg
        } else if (res2.data.status === 0) {
            msg.value = ''
            showsuccess.value = true

        }
    }

}
const fetchSmSandPassword = async () => {

    let password = CryptoJS.MD5(password1Copy).toString();
    const res2 = await http.post('/gateway',
        {
            imgCode: '',
            imgKey: captcha.value?.imgKey || '',
            mobile: Userdata.value?.data.mobile,
            password,
            smsCode: smscopy,
        },
        {
            headers: {
                'X-Host': 'mall.user.paypwd.reset',
                'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NjY3MzU4MywidXNlcklkIjozMTk0MjU4N30.pg1pQdbN1JojxtO-lNVfAutyrFpYtcVeMAI9KX1iCvQ'
            }
        })
    if (res2.data.status === 6102) {
        popupmsg.value = '验证码已失效,请重新获取'
        showPopup.value = true

        fetchSmSandCaptcha()
        // processCode.value = 1
    } else if (res2.data.status === 6801012) {
        msg.value = res2.data.msg
        setTimeout(() => {
            codeValues.value = ''
            processCode.value = 2
        }, SWITCH_DELAY)
    } else if (res2.data.status === 0) {

        passwordCompleted.value = true
        showpassed.value = true
        setTimeout(() => {
            router.back()
        }, SWITCH_DELAY)
    } else if (res2.data.status === 6101) {
        passwordCompleted.value = true
        msg.value = res2.data.msg//验证码错误

        setTimeout(() => {
            codeValues.value = ''
            processCode.value = 1
        }, SWITCH_DELAY)
    }

}
onBeforeMount(async () => {
    try {
        await fetchUser();
        if (Userdata.value?.status !== 0) return;
        fetchSmSandCaptcha()
    } catch (error) {
        console.log(error)
    };
})
onBeforeUnmount(() => {
    if (timer !== null) {
        clearTimeout(timer);
        timer = null
    }
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

.box {
    // width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translate(-50%, 0);

    img {
        width: 50%;
        margin: 10% 0;
    }


    .hidden-input {
        position: absolute;
        width: 100vw;
        height: 0;
        opacity: 0;
        border: none;
        outline: none;
        pointer-events: none; //
    }

    .input-box {
        text-wrap: nowrap;
        margin-top: 5%;
        margin-bottom: 3%;
        border: 2px solid #7e7e7e8a;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        anchor-name: --input-box;

        .input-item {
            display: flex;
            align-items: center;
            justify-content: center;
            // caret-color: transparent; //隐藏input光标
            width: 8vh;
            height: 8vh;
            // display: inline-block;
            background-color: transparent;

        }

        .input-item:not(:last-child) {

            border-right: 1px solid #7e7e7e8a;
        }

    }

    .input-active {
        border-color: #3b99fc;
        box-shadow: 0 0 3px 0 #3b99fc;
    }

    .errortip {
        // align-self: flex-start;
        position: absolute;
        position-anchor: --input-box;
        left: anchor(left);
        top: anchor(bottom);
        translate: 0 .5rem;
        text-wrap: nowrap;
        color: #ff5f16;
        font-size: .7875rem;
        margin-bottom: 5vh;

    }

    .success {
        text-wrap: nowrap;
        font-size: .9rem;
        color: #bdc0c5;
        margin-top: 3rem;
    }


    .voice {
        // position: absolute;

        margin-top: 4rem;
        text-wrap: nowrap;
        color: #ff5f16;
        font-size: .9rem;
    }

    .pass {
        width: 5vw;
        height: 5vw;
        font-size: 1.4rem;
        color: #08bd2c;
        // position: absolute;
        // left: 20%;
        // transform: translate(0, -50%);
        // top: 50%;
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

    // .pass {

    //     position: absolute;
    //     left: 20%;
    //     transform: translate(0, -50%);
    //     top: 50%;
    // }



}
</style>
