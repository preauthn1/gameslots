<template>
   <el-select v-model="value" @change="selectChage">
        <el-option value="1.5" >1.5</el-option>
        <el-option value="1.45" >1.45</el-option>
        <el-option value="1.4" >1.4</el-option>
        <el-option value="1.35" >1.35</el-option>
        <el-option value="1.3" >1.3</el-option>
        <el-option value="1.25" >1.25</el-option>
        <el-option value="1.2" >1.2</el-option>
        <el-option value="1.15" >1.15</el-option>
        <el-option value="1.1" >1.1</el-option>
        <el-option value="1.05" >1.05</el-option>
        <el-option value="1">1</el-option>
        <el-option value="0.95" >0.95</el-option>
        <el-option value="0.9" >0.9</el-option>
        <el-option value="0.85" >0.85</el-option>
        <el-option value="0.8" >0.8</el-option>
        <el-option value="0.75" >0.75</el-option>
        <el-option value="0.7" >0.7</el-option>
        <el-option value="0.65" >0.65</el-option>
        <el-option value="0.6" >0.6</el-option>
        <el-option value="0.55" >0.55</el-option>
        <el-option value="0.5" >0.5</el-option>
        <el-option value="0.45" >0.45</el-option>
        <el-option value="0.4" >0.4</el-option>
        <el-option value="0.35" >0.35</el-option>
        <el-option value="0.3" >0.3</el-option>
        <el-option value="0.25" >0.25</el-option>
        <el-option value="0.2" >0.2</el-option>
        <el-option value="0.15" >0.15</el-option>
        <el-option value="0.1" >0.1</el-option>
    </el-select>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value = ref('')
const emit = defineEmits(['key'])
const selectChage = (val) => { 
  emit('key',val)
}
</script>
