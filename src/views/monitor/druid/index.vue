<template>
    <div>
        <!-- <div>学校管理系统数据监控</div>
        <div>系统管理系统数据监控</div> -->
        <i-frame v-model:src="url"></i-frame>
    </div>
</template>

<script setup>
import iFrame from '@/components/iFrame'

import {ref} from 'vue'

// const url = ref(import.meta.env.VITE_APP_BASE_API + '/druid/login.html')
const url = ref('http://localhost:9209/druid')
</script>
