<template>

    <transition name="fade">
        <div v-if="changeuser">
            <myheader title="我的资料" leftType="back" />
            <van-cell-group>
                <van-cell center title="头像" is-link>
                    <template #right-icon>
                        <img :src="userInfo?.headIcon">
                        <van-icon name="arrow" />
                    </template>
                </van-cell>
                <van-cell title="昵称" :value="userInfo?.nickName" is-link @click="startEditNickname" />
                <van-cell title="性别" :value="userInfo?.gender === 0 ? '未设置' : userInfo?.gender === 1 ? '男' : '女'"
                    is-link @click="showGender = true" />
                <van-cell title="出生日期" :value="formattedBirthday" is-link @click="showBirthday = true" />
            </van-cell-group>
            <van-popup v-model:show="showGender" destroy-on-close round position="bottom">
                <van-picker v-model="genderSelected" :columns="columns" @cancel="showGender = false"
                    @confirm="onChangeGender" />
            </van-popup>
            <van-popup v-model:show="showBirthday" destroy-on-close round position="bottom">
                <van-date-picker v-model="birthdaySelected" title="选择日期" :min-date="minDate" :max-date="maxDate"
                    @cancel="showBirthday = false" @confirm="onChangeBirthday" />
            </van-popup>
        </div>
    </transition>
    <transition name="fade">
        <div v-if="!changeuser">
            <myheader title="更改昵称" leftType="back" text="保存" @save="hanldSave" @show-back-user="backuser" />
            <!-- 这里写成show-back-user,show-Back-User也可,会自动转为showBackUser -->
            <div class="text-telnumber">
                <input  ref="nicknameInput" autocomplete="off" type="text" v-model="Nickname" placeholder="新昵称" name="phone" >

                <van-icon v-if="Nickname" name="close" @click="cleartel"></van-icon>
            </div>
        </div>
    </transition>

</template>
<script lang="ts" setup>
import {
    Cell as vanCell,
    CellGroup as vanCellGroup,
    Icon as vanIcon,
    DatePicker as vanDatePicker,
    Picker as vanPicker,
    Popup as vanPopup,
    showToast
} from 'vant';
import { ref, onBeforeMount, computed, watch,nextTick  } from 'vue'
import { http } from '@/util/tools'
import Myheader from '@/components/Myheader.vue';
import useTabbarStore from '@/store/tabbarStore';
import type { User } from '@/types'
// type user = {
//     headIcon: string,
//     nickName: string,
//     gender: number,
//     birthday: string

// }
const tabbarStore = useTabbarStore()
const changeuser = ref(true)
const userInfo = ref<User | null>(null);
const Nickname = ref('')
const nicknameInput = ref<HTMLInputElement | null>(null);
const genderSelected = ref<string[]>(['1']);
const birthdaySelected = ref<string[]>(['1990', '01', '01'])  // 日期选中的数组 [年,月,日]
// const validateMobile = (phone: string, showErrorMessage = true): boolean => {
//     const phoneRegex = /^1[3-9]\d{9}$/;
//     if (!phone) {
//         if (showErrorMessage) showToast('手机号不能为空');
//         return false;
//     }
//     if (!phoneRegex.test(phone)) {
//         if (showErrorMessage) showToast('请输入正确的11位手机号');
//         return false;
//     }
//     return true;
// };
// const pickerValue = ref(0);
const showGender = ref(false)
const columns = [
    { text: '男', value: '1' },
    { text: '女', value: '2' },
];
const startEditNickname = () => {
    // 同步当前昵称到编辑框
    Nickname.value = userInfo.value?.nickName || '';
    changeuser.value = false;
     // 等待 DOM 更新后再聚焦
  nextTick(() => {
    nicknameInput.value?.focus();
  });
};
const onChangeGender = async ({ selectedValues }: { selectedValues: string | string[] }) => {
    showGender.value = false;
    const newGender = Number(selectedValues[0]);
    // 如果性别没有变化，直接返回
    if (userInfo.value?.gender === newGender) return;
    try {
        const [res3] = await Promise.all([//_是占位符号,不用的参数可以用其占位,但是不能在一个数组里出现两个_ 这样是重复声明了,可以用_res4等不同的变量名即可.
            http.post('/gateway/', {
                "nickName": userInfo.value?.nickName,
                "headIcon": userInfo.value?.headIcon,
                "gender": newGender,
                "birthday": userInfo.value?.birthday,

            }, {
                params: {
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.user.update',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),

        ])
        if (res3.data.status === 0) {
            fetchUser()
        } else {
            showToast('修改失败')
        }
    } catch (error) {
        console.log(error)
    }
};

const onChangeBirthday = async ({ selectedValues }: { selectedValues: string[] }) => {
    showBirthday.value = false;
    const newBirthday = selectedValues.join('-');
    // 如果生日没有变化，直接返回
    if (userInfo.value?.birthday === newBirthday) return;
    try {
        const [res2] = await Promise.all([//_是占位符号,不用的参数可以用其占位,但是不能在一个数组里出现两个_ 这样是重复声明了,可以用_res4等不同的变量名即可.
            http.post('/gateway/', {
                "nickName": userInfo.value?.nickName,
                "headIcon": userInfo.value?.headIcon,
                "gender": userInfo.value?.gender,
                "birthday": newBirthday,

            }, {
                params: {
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.user.update',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),

        ])
        if (res2.data.status === 0) {
            fetchUser()
        } else {
            showToast('修改失败')
        }
    } catch (error) {
        console.log(error)
    }
};
const backuser = () => {
    changeuser.value = true
}
const cleartel = () => {
    Nickname.value = ''
    // const inputEl = document.querySelector('.text-telnumber input') as HTMLInputElement | null;
    // inputEl?.focus();
     nicknameInput.value?.focus(); // 直接使用 ref
}
const showBirthday = ref(false)
const minDate = new Date(1970, 0, 1);
const maxDate = new Date(2036, 12, 31);
const formattedBirthday = computed(() => {
    const birthday = userInfo.value?.birthday;
    if (!birthday) return '未设置';
    if (birthday === '0000-00-00') return '未设置';
    const [year, month, day] = birthday.split('-');
    return `${year}年${month}月${day}日`;
});
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
    } catch (error) {
        console.log(error)
    }
}
const hanldSave = async () => {
    try {
        const [res2] = await Promise.all([//_是占位符号,不用的参数可以用其占位,但是不能在一个数组里出现两个_ 这样是重复声明了,可以用_res4等不同的变量名即可.
            http.post('/gateway/', {
                "nickName": Nickname.value,
                "headIcon": userInfo.value?.headIcon,
                "gender": userInfo.value?.gender,
                "birthday": userInfo.value?.birthday,

            }, {
                params: {
                    k: 7105868,
                },
                headers: {
                    'X-Host': 'mall.user.update',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),

        ])
        if (res2.data.status === 0) {
            fetchUser()
            changeuser.value = true
        } else {
            showToast('修改失败')
        }
    } catch (error) {
        console.log(error)
    }
}
tabbarStore.isTabbarShow = false
watch(showGender, (val) => {
    if (val) {
        const g = userInfo.value?.gender
        genderSelected.value = g === 1 ? ['1'] : g === 2 ? ['2'] : ['1'];
    }
})

watch(showBirthday, (val) => {
    if (val) {
        const b = userInfo.value?.birthday
        if (b && b !== '0000-00-00') {
            birthdaySelected.value = b.split('-')
        } else {
            birthdaySelected.value = ['1990', '01', '01']
        }
    }
})

onBeforeMount(
    fetchUser

)
</script>
<style scoped lang="scss">
.van-cell-group {
    margin-top: 10px;

    :deep(.van-cell) {
        .van-cell__title {
            font-size: 1rem;
        }

        img {
            width: 14%;
            margin-right: 4px;
        }

        .van-icon {
            color: var(--van-cell-right-icon-color);
            font-size: 1.3rem;
        }
    }

}

.text-telnumber {
    padding: 0 10px;
    margin-top: 10px;
    width: 100%;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    justify-content: space-between;
    background-color: rgb(255, 255, 255);
    height: 7%;

    input,
    input:hover,
    input:focus {
        border: none;
        border: none;
        box-shadow: none;
        background: transparent;
        outline: none; //聚焦的时候的边框
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
