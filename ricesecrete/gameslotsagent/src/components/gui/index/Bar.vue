<script setup lang="ts">
import { ref, reactive, computed, type Ref } from "vue";
import { useDark, useECharts, type EchartOptions } from "@pureadmin/utils";
import { http } from "@/utils/http";

const { isDark } = useDark();

const theme: EchartOptions["theme"] = computed(() => {
  return isDark.value ? "dark" : "light";
});

const barChartRef = ref<HTMLDivElement | null>(null);
const { setOptions } = useECharts(barChartRef as Ref<HTMLDivElement>, {
  theme
});
const options: any = reactive({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    }
  },
  grid: {
    bottom: "20%",
    height: "68%",
    containLabel: true
  },
  xAxis: [
    {
      type: "category",
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        interval: 0
        // width: "70",
        // overflow: "truncate"
      },
      data: []
    }
  ],
  yAxis: [
    {
      type: "value"
    }
  ],
  legend: {
    data: []
  },
  series: []
})
const getBarDat = () => {
  http.get('/report/get_bar').then((response: any) => {
    console.log(response)
    if (response.code == 1) {
      options.xAxis[0].data = response.xAxisData;
      options.legend.data = response.legend;
      options.series = response.seriesData;
      setOptions(options);
    }
  })
}
getBarDat();
</script>

<template>
  <div ref="barChartRef" style="width: 100%; height: 300px" />
</template>
