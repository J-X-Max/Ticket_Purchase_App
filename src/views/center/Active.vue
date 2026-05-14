<template>
    <div class="container" v-html="pageinfo?.content"></div>
</template>
    
<script lang="ts" setup>
import { http } from '@/util/tools';
import { useRoute } from 'vue-router'
import { ref, onBeforeMount } from 'vue';
import useTabbarStore from '@/store/tabbarStore';
type Page = {
    content: string
}
const tabbarStore = useTabbarStore()
const route = useRoute()
const pageinfo = ref<Page | null>(null)
const fetchstaticpage = async () => {
    try {
        const [res1] = await Promise.all([
            http.get('/gateway/', {
                params: {
                    actId: route.params.activeid,
                },
                headers: {
                    'X-Host': 'mall.act.static-page.info',
                    "x-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiMzAwMCIsInRpbWVzdGFtcCI6MTc3NTI5OTcwMCwidXNlcklkIjozMTk0MjU4N30.HTqXrckd5LbnKPmq6LIkx-DmD2rXZ4ff2vWrnkoL1CI"
                }
            }),
        ])
        pageinfo.value = res1.data.data.data
    } catch (error) {
        console.log(error)
    }
}
tabbarStore.isTabbarShow = false;
onBeforeMount(
    fetchstaticpage
)
</script>

<style scoped lang="scss">
.container {


    :deep(img) {

        height: auto !important;
    }

}
</style>