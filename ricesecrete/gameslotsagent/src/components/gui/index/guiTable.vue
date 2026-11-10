<script setup lang="ts">
import { transformI18n } from '@/plugins/i18n';
const props = withDefaults(
  defineProps<{
    height?: string;
  }>(),
  {
    height: null
  }
);

const columns = [
  {
    label: transformI18n("日期"),
    prop: "date",
    width: "260",
    fixed: true
  },
  {
    label: transformI18n("姓名"),
    prop: "name",
    width: "260"
  },
  {
    label: transformI18n("地区"),
    prop: "state",
    width: "260"
  },
  {
    label: transformI18n("城市"),
    prop: "city",
    width: "260"
  },
  {
    label: transformI18n("地址"),
    prop: "address",
    width: "260"
  },
  {
    label: transformI18n("邮编"),
    prop: "post-code",
    width: "260"
  },
  {
    label: transformI18n("操作"),
    width: "120",
    fixed: "right",
    slot: "operation"
  }
];

function handleClick(row) {
  console.log(
    "%crow===>>>: ",
    "color: MidnightBlue; background: Aquamarine; font-size: 20px;",
    row
  );
}
</script>

<template>
  <!-- <pure-table
    :data="
      props.height
        ? tableDataMore.concat(tableDataMore).concat(tableDataMore)
        : tableDataMore
    "
    :columns="columns"
    :height="props.height"
  >
    <template #operation="{ row }">
      <el-button link type="primary" size="small" @click="handleClick(row)">
        Detail
      </el-button>
      <el-button link type="primary" size="small">Edit</el-button>
    </template>
  </pure-table> -->
  <div/>
</template>
