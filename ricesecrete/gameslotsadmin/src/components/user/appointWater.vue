<script setup lang='tsx'>
import { reactive, ref, computed} from 'vue';
import { timeCycle } from '@/utils/global'
import { appointWater } from "@/api/user";
import { transformI18n } from '@/plugins/i18n';
import { message } from "@/utils/message";

const props = defineProps({
  uid:String,
})
const uid = computed(() => {
  return props.uid ? props.uid : '';
})

const visibleUserInfo = ref(false)
const showUid = ref(0)
const showUserInfo = (uid) => {
  visibleUserInfo.value = true
  showUid.value = uid
}

const pagination = ({
  page: 1,//页数
  limit: 12,//条数
  total: 0,//总数
  uid: uid.value
});

const columnsDetail = [//TableColumnList
    {
    headerRenderer: () => transformI18n("用户账号"),
    prop: "username",
    width: 180,
    cellRenderer: ({ row }) => (
      <>
        {/* <p title={row.username} style="white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;">{row.username}</p> */}
        <div onClick={() => showUserInfo(row.id)}>
          <div v-show={row.phone} class="flex items-center">
            <iconify-icon-online icon="material-symbols:phone-android-outline-rounded" />
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count > 1} style="color:red">{row.phone}</p>
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count <= 1}>{row.phone}</p>
          </div>
          <div v-show={row.mail} class="flex items-center">
            <iconify-icon-online icon="material-symbols:mail-outline-sharp" />
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count > 1} style="color:red">{row.mail}</p>
            <p class="ml-[3px] el-link2" v-show={row.login_ip_count <= 1}>{row.mail}</p>
          </div>
        </div>
      </>
    )
  },
    {
      label: transformI18n("来源"),
      slot: "source"
    }, 
    {
      label: transformI18n("指定游戏/平台"),
      width: 180,
      prop:'game_or_platform'
    },
    {
      label: transformI18n("奖励金额"),
      prop: "uac_money",
    }, 
    {
      label: transformI18n("流水倍数"),
      prop: "uac_rate",
    }, 
    {
      label: transformI18n("所需流水"),
      prop: "uac_water",
    }, 
    {
      label: transformI18n("已完成流水"),
      prop: "uac_waterdone",
    }, 
    {
      label: transformI18n("状态"),
      slot: "uac_done"
    }, 
];


const list = [];
const tableData = reactive({
  list
})


const onPageSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  init(pagination);
};
const onCurrentChange = (current: number) => {
  pagination.page = current;
  init(pagination);
};

init(pagination)

const ajax = ref(false);
function init(query?: object) {
  if( !pagination.uid ){
    return false
  }
  appointWater(pagination).then((res:any) => {
    tableData.list = res.data
    ajax.value = false;
  })
}

</script>
<template>
  <userInfo v-if="visibleUserInfo" :id="showUid" :visible2="visibleUserInfo" @handleClose="visibleUserInfo=false"/>
  <div class="bankcard-box3">
      <pure-table  :border="true" :data="tableData.list" width="100%" :columns="columnsDetail" >
        <template #uac_done="{ row }">
          <el-tag type="success" size="small" v-if="row.uac_done == 1">{{ $t('已完成') }}</el-tag>
          <el-tag type="danger" size="small" v-if="row.uac_done == 0">{{ $t('未完成') }}</el-tag>
        </template>
        <template #source="{ row }">
          <el-tag type="success" size="small" v-if="row.uac_type == 0">{{ $t('活动') }}</el-tag>
          <el-tag type="danger" size="small" v-else-if="row.uac_type == 1">{{ $t('任务') }}</el-tag>
          <el-tag type="danger" size="small" v-else>{{ $t('其他') }}</el-tag>
        </template>
      </pure-table>
      <el-pagination
        class="float-right"
        v-model:currentPage="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[12, 24, 36, 50, 100]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onPageSizeChange"
        @current-change="onCurrentChange"
      />
  </div>

</template>