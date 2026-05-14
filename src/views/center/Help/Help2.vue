<template>
    <myheader class="title" title="卡券问题" leftType="back" />
      <van-cell-group>
            <van-cell title="绑定卡券"  is-link to="/active/SVUlVg972788" />
            <van-cell title="查询卡券余额/有效期"  is-link to="/active/fkARNl102463" />
            <van-cell title="解绑卡券"  is-link to="/active/uoftTR033758" />
            <van-cell title="卡券丢失/挂失补卡"  is-link to="/active/dZeEGo241933" />
            <van-cell title="卡券支持的影城"  is-link to="/active/vOSEPL710055" />
        </van-cell-group>
</template>
<script lang="ts" setup>
import Myheader from '@/components/Myheader.vue';
import { Cell as vanCell, CellGroup as vanCellGroup } from 'vant';
</script>
