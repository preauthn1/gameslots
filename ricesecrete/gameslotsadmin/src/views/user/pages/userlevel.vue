<script setup lang="tsx">
import { reactive, getCurrentInstance, ref, defineAsyncComponent } from "vue";
// import userSelected from  '@/components/user/userSelected.vue'

import { userlevelList, userlevelEdit, userlevelAdd, userlevelDelete } from "@/api/user";
// import userSelected from  '@/components/user/userSelected.vue'

import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";
import { useI18n } from "vue-i18n";
import { hasAuth } from "@/router/utils";
import uploadImage from '@/components/comm/uploadImage.vue'
import menuList from "@/components/menu/menu.vue"

defineOptions({
  name: "userlevelList"
});
const { t } = useI18n();

const columns: any = [
  {
    type: "selection",
    align: "left",
    fixed: "left",
  },
  //TableColumnList
  {
    label: t("等级名称"),
    prop: "level_name",
    align: "center",
    fixed: true
  },
  {
    label: t("累计充值"),
    prop: "recharge_amount",
    width: 150,
    align: "center"
  },
  {
    label: t("游戏流水"),
    prop: "water",
    width: 150,
    align: "center"
  },
  {
    label: t("周游戏流水"),
    prop: "week_water",
    width: 200,
    align: "center"
  },
  {
    label: t("月游戏流水"),
    prop: "month_water",
    width: 200,
    align: "center"
  },
  {
    label: t("等级彩金"),
    prop: "level_gold",
    width: 200,
    align: "center"
  },
  {
    label: t("最低出款金额"),
    prop: "min_amount",
    width: 200,
    align: "center"
  },
  {
    label: t("最高出款金额"),
    prop: "max_amount",
    width: 200,
    align: "center"
  },
    {
    label: t("每日最高出款金额"),
    prop: "day_max_amount",
    width: 200,
    align: "center"
  },
  {
    label: t("每日出款次数"),
    prop: "day_limit",
    width: 200,
    align: "center"
  },
  {
    label: t("每日出款免费次数"),
    prop: "day_free_limit",
    width: 200,
    align: "center"
  },
  {
    label: t("周奖励金额"),
    prop: "week_reward_amount",
    width: 200,
    align: "center"
  },
  {
    label: t("月奖励金额"),
    prop: "month_reward_amount",
    width: 200,
    align: "center"
  },
  {
    label: t("备注"),
    prop: "remarks",
    width: 200,
    align: "center"
  },
  {
    label: t("操作"),
    fixed: "right",
    width: 100,
    cellRenderer: ({ index, row }) => (
      <>
        <el-button
          v-show={hasAuth("edit")}
          type="primary"
          size="small"
          onClick={() => handleEdit(row, index)}
        >
          {t("编辑")}
        </el-button>
      </>
    )
  }
];

const vip_upgrade = ref(0);
//搜索的数据

interface tabinfo {
  page: number;
  limit: number;
  total: number;
}
const pagination = ref<tabinfo>({
  page: 1, //页数
  limit: 200, //条数
  total: 0 //总数
});
const dataList: any = [];
const tableData = reactive({ dataList });
//获取列表数据
init();
function init(query?: object) {
  userlevelList(pagination.value).then((res: any) => {
    tableData.dataList = res.data;
    pagination.value.total = res.total;
    pagination.value.page = res.current_page;
    list2Box.dialogList.first_user_level.options = res.vip_level;
    list2Box.dialogList.first_user_level.options.unshift({
      label: "不限制",
      value: 0
    });
    vip_upgrade.value = parseInt(res.vip_upgrade);
    chanageField();
  });
}

const chanageField = () => {
  if (vip_upgrade.value == 0) {
    if (columns[1].label == t("计算方式")) {
      return;
    }
    columns.splice(
      1,
      0,
      {
        label: t("计算方式"),
        // prop: "type",
        width: 150,
        slot: "type",
        align: "center"
      },
      {
        label: t("充值金额"),
        prop: "recharge_amount",
        width: 150,
        align: "center"
      }
    );
    dialogList.type.show = false;
    dialogList.recharge_amount.show = false;
  } else if (vip_upgrade.value >= 1) {
    if (columns[1].label == t("团队会员")) {
      return;
    }
    columns.splice(
      1,
      0,
      {
        label: t("团队会员"),
        prop: "team_user",
        width: 200,
        align: "center"
      },
      {
        label: t("直属会员"),
        prop: "first_user",
        width: 150,
        align: "center"
      }
    );
    dialogList.first_user_level.show = false;
    dialogList.first_user.show = false;
    dialogList.team_user.show = false;
    dialogList.recharge_amount.show = vip_upgrade.value != 3;
  }
};
const btnaddSave = () => {};

//弹框写法
const visible = ref(false);

const dialogList = {
  level_name: {
    type: "input",
    label: t("等级名称"),
    placeholder: t("等级名称"),
    value: "",
    prop: "level_name"
  },
  image: {
    type: 'slot',
    name: 'upload',
    value:'',
    label: t("等级图标"),
    placeholder: t("等级图标"),
    prop:'image'
  },
  type: {
    type: "radio",
    value: 0,
    label: t("计算方式"),
    prop: "type",
    options: [
      {
        label: 0,
        name: t("累计充值")
      },
      {
        label: 1,
        name: t("单次充值")
      }
    ],
    show: true
  },
  recharge_amount: {
    type: "input",
    label: t("充值金额"),
    placeholder: t("充值金额"),
    tip: t("设置 0 不限制"),
    value: 0,
    prop: "recharge_amount",
    show: true
  },
  first_user_level: {
    type: "select",
    placeholder: t("直推会员等级"),
    value: "",
    label: t("直推会员等级"),
    prop: "first_user_level",
    tip: t("不选择则不限制"),
    options: [],
    show: true
  },
  first_user: {
    type: "input",
    label: t("直推会员数"),
    placeholder: t("直推会员数"),
    tip: t("设置 0 不限制"),
    value: 0,
    prop: "first_user",
    show: true
  },
  team_user: {
    type: "input",
    label: t("团队会员数"),
    placeholder: t("团队会员数"),
    tip: t("下属团队会员数，设置 0 不限制"),
    value: 0,
    prop: "team_user",
    show: true
  },
  water: {
    type: "input",
    label: t("游戏流水"),
    placeholder: t("游戏流水"),
    tip: t("只针对三方游戏流水，设置 0 不限制"),
    value: 0,
    prop: "water"
  },
  week_water: {
    type: "input",
    label: t("每周游戏流水"),
    placeholder: t("每周游戏流水"),
    tip: t("每周流水限制，只针对三方游戏流水，设置 0 不限制"),
    value: 0,
    prop: "week_water"
  },
  month_water:{
    type: "input",
    label: t("每月游戏流水"),
    placeholder: t("每月游戏流水"),
    tip: t("每月流水限制，只针对三方游戏流水，设置 0 不限制"),
    value: 0,
    prop: "month_water"
  },
  min_amount: {
    type: "input",
    label: t("最低出款金额"),
    placeholder: t("最低出款金额"),
    value: 0,
    prop: "min_amount"
  },
  max_amount: {
    type: "input",
    label: t("最高出款金额"),
    placeholder: t("最高出款金额"),
    value: 0,
    prop: "max_amount"
  },
    day_max_amount: {
    type: "input",
    label: t("每日最高出款金额"),
    placeholder: t("每日最高出款金额"),
    value: 0,
    prop: "max_amount"
  },
  day_limit: {
    type: "input",
    label: t("每日出款次数"),
    placeholder: t("每日出款次数"),
    value: 0,
    prop: "day_limit"
  },
  day_free_limit: {
    type: "input",
    label: t("每日出款免费次数"),
    placeholder: t("每日出款免费次数"),
    value: 0,
    prop: "day_free_limit"
  },
  level_gold: {
    type: "input",
    label: t("彩金"),
    placeholder: t("彩金"),
    value: 0,
    prop: "level_gold"
  },
  remarks: {
    type: "input",
    label: t("备注"),
    placeholder: t("备注"),
    ty: "textarea",
    value: "",
    prop: "remarks"
  },
  week_reward_amount: {
    type: "input",
    label: t("周奖励金额"),
    placeholder: t("周奖励金额"),
    value: 0,
    prop: "week_reward_amount"
  },
  month_reward_amount: {
    type: "input",
    label: t("月奖励金额"),
    placeholder: t("月奖励金额"),
    value: 0,
    prop: "month_reward_amount"
  },
  savings: {
    type: "input",
    label: t("流水倍数"),
    placeholder: t("流水倍数"),
    value: 1,
    prop: "savings"
  }
};
const dialogModel = reactive({
  level_name: "",
  image: "",
  type: "",
  recharge_amount: "",
  water: 0,
  week_water:0,
  month_water:0,
  min_amount: 0,
  max_amount: 0,
  day_limit: 0,
  day_free_limit:0,
  level_gold: 0,
  remarks: "",
  first_user_level: "",
  first_user: "",
  team_user: "",
  week_reward_amount: 0,
  month_reward_amount: 0,
  savings: 1
});
const listRules = {
  //  name: [
  //   { required: true, message: '分类名称', trigger: 'blur' },
  //   { min: 3, max: 5, message: '长度不能小于', trigger: 'blur' },
  // ],
};
//当前选中的row
let currentRow = {
  id: ""
};
//当前是添加还是编辑
const currentType = ref(0); //0 是添加  1 是编辑
const list2Box = reactive({ dialogList });
const handleDialogChange = ({ value, index }) => {
  list2Box.dialogList[index].value = value;
  dialogModel[index] = value;
};
const handleEdit = (row, index) => {
  currentRow = row;
  currentType.value = 1;
  for (const key in dialogModel) {
    // if (key == dialogList[key]) {
    dialogModel[key] = row[key];
    list2Box.dialogList[key].value = row[key];
    // }
  }
  visible.value = true;
};
//编辑点击确定
const handleSave = () => {
  if (currentType.value == 1) {
    //编辑
    const query = {
      edit: true,
      info: {
        id: currentRow.id,
        transaction_amount: 0,
        ...dialogModel
      }
    };
    userlevelEdit(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: "success" });
        visible.value = false;
        init();
      }
    });
  } else {
    //添加
    const query = {
      add: true,
      info: {
        ...dialogModel
      }
    };
    userlevelAdd(query).then((res: any) => {
      if (res.code == 1) {
        message(res.msg, { type: "success" });
        init();
      }
    });
  }
};
//点击添加
const handleAdd = () => {
  currentType.value = 0;
  for (const key in dialogModel) {
    if (key == "level_name") {
      // let level_name = 'VIP' + tableData.dataList[tableData.dataList.length];
      list2Box.dialogList["level_name"].value = "VIP" + tableData.dataList.length;
      dialogModel[key] = "VIP" + tableData.dataList.length;
    } else if (key == "savings") {
      dialogModel[key] = 1;
      list2Box.dialogList[key].value = 1;
    } else {
      if (key == "remarks") {
        dialogModel[key] = "";
        list2Box.dialogList[key].value = "";
      } else {
        dialogModel[key] = 0;
        list2Box.dialogList[key].value = 0;
      }
    }
  }

  visible.value = true;
};

//上传成功后的图片
const backImageData = (val) => {
  dialogModel.image = val.file[0];
  list2Box.dialogList['image'].value = val.file[0];
}
</script>

<template>
  <div>
    <menuList />
    <div class="addBtn">
        <!-- <el-button v-if="hasAuth('delete')" type="danger" @click="handleDelet">{{ $t('删除') }}</el-button> -->
      <el-button type="primary" v-if="hasAuth('add')" @click="handleAdd">{{
        t("添加")
      }}</el-button>
    </div>
    <commDialog
      :title="t('编辑')"
      :dialogObj="dialogModel"
      @currentChage="handleDialogChange"
      @save="handleSave"
      :listRules="listRules"
      :list="list2Box.dialogList"
      :visible="visible"
      @close="visible = false"
    >
    <template v-slot:upload>
          <uploadImage @imageData="backImageData"  :limit="1" :image="dialogModel.image"/>
      </template>
    </commDialog>
    <pure-table :data="tableData.dataList" width="100%" :columns="columns">
      <template #type="{ row }">
        <el-tag size="small" v-if="row.type == 0" type="success"
          >{{ t("累积充值") }}
        </el-tag>
        <el-tag size="small" v-else type="danger">{{ t("单次充值") }} </el-tag>
      </template>
    </pure-table>
  </div>
</template>
<style scoped>
.btmNav {
  padding-top: 10px;
}
.addBtn {
  margin-bottom: 10px;
}
</style>
