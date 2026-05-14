<template>
    <myheader class="title" title="电影票问题" leftType="back" />
      <van-cell-group>
            <van-cell title="如何购票"  is-link to="/active/cCQYnJ926749" />
            <van-cell title="如何取票"  is-link to="/active/UJfdyH525193" />
            <van-cell title="退票/改签"  is-link to="/active/vwxmSR042594" />
            <van-cell title="出票失败"  is-link to="/active/FqQsDI053874" />
        </van-cell-group>
</template>
<script lang="ts" setup>
import Myheader from '@/components/Myheader.vue';
import { Cell as vanCell, CellGroup as vanCellGroup } from 'vant';
</script>
