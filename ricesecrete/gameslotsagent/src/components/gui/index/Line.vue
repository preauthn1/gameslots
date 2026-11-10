<script setup lang="ts">
import { ref, reactive, computed, type Ref } from "vue";
import { useDark, useECharts, type EchartOptions } from "@pureadmin/utils";
import { http } from "@/utils/http";

const { isDark } = useDark();

const theme: EchartOptions["theme"] = computed(() => {
  return isDark.value ? "dark" : "light";
});

const lineChartRef = ref<HTMLDivElement | null>(null);
const { setOptions } = useECharts(lineChartRef as Ref<HTMLDivElement>, {
  theme
});
const options: any = reactive({
    grid: {
      bottom: "20%",
      height: "68%",
      containLabel: true
    },
    tooltip: {
      trigger: "item"
    },
    xAxis: {
      type: "category",
      axisLabel: {
        interval: 0
      },
      data: []
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        data: [],
        type: "line",
        areaStyle: {}
      }
    ]
  })

const getLineDat = () => {
  http.get('/report/get_line').then((response: any) => {
    if (response.code == 1) {
      options.xAxis.data = response.xAxisData;
      options.series[0].data = response.seriesData;
      setOptions(options);
    }
  })
}
getLineDat();
</script>

<template>
  <div ref="lineChartRef" style="width: 100%; height: 300px" />
</template>
