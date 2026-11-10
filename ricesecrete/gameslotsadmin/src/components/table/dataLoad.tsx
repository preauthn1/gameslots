import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, reactive } from "vue";
// import { clone, delay } from "@pureadmin/utils";
import { transformI18n } from "@/plugins/i18n";
import { http } from "@/utils/http";

export function useDataLoad(url: string) {
  const dataList = ref([]);
  const loading = ref(false);
  const queryParams = ref({});
  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60, 100],
    total: 0,
    align: "right",
    background: true,
    small: false
  });

  /** 加载动画配置 */
  const loadingConfig = reactive<LoadingConfig>({
    text: transformI18n("加载中..."),
    viewBox: "-10, -10, 50, 50",
    spinner: `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
    // svg: "",
    // background: rgba()
  });

  /** 撑满内容区自适应高度相关配置 */
  const adaptiveConfig: AdaptiveConfig = {
    /** 表格距离页面底部的偏移量，默认值为 `96` */
    offsetBottom: 64
    /** 是否固定表头，默认值为 `true`（如果不想固定表头，fixHeader设置为false并且表格要设置table-layout="auto"） */
    // fixHeader: true
    /** 页面 `resize` 时的防抖时间，默认值为 `60` ms */
    // timeout: 60
    /** 表头的 `z-index`，默认值为 `100` */
    // zIndex: 100
  };

  function onSizeChange(val) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onInitList(queryParams.value);
  }

  function onCurrentChange(val) {
    loadingConfig.text = `正在加载第${val}页...`;
    loading.value = true;
    onInitList(queryParams.value);
  }

  function onInitList(query?: any, callback?: Function) {
    if (!query) {
      query = {};
    }
    query.page = pagination.currentPage;
    query.limit = pagination.pageSize;
    queryParams.value = query;
    loading.value = true;
    http.post(url, { data: query }).then((res: any) => {
      if (typeof callback === "function") {
        callback(res);
      }
      if (res.code == 1) {
        if (res.data?.data) {
          dataList.value = res.data.data;
          pagination.total = res.data.total;
        } else {
          dataList.value = res.data;
          pagination.total = res.total;
        }
      }
      loading.value = false;
    });
  }

  return {
    loading,
    dataList,
    pagination,
    loadingConfig,
    adaptiveConfig,
    onInitList,
    onSizeChange,
    onCurrentChange
  };
}
