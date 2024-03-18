<script setup>
import { ref, computed } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { useMapControlsStore } from "@/store/mapControls";
import { useanAlysisFunctionsStore } from "@/store/analysisFunctions";

const apexchart = VueApexCharts;
const mapControls = useMapControlsStore();
const draw = mapControls.mapboxDraw;
const analysisFunctions = useanAlysisFunctionsStore();

const initialChartOptions = {
  chart: {
    height: 350,
    type: "line",
    zoom: {
      enabled: false,
    },
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: "straight",
  },
  title: {
    text: "Heat-Flow Data (Demo)",
    align: "left",
  },
  grid: {
    row: {
      colors: ["#f3f3f3", "transparent"],
      opacity: 0.5,
    },
  },
  noData: {
    text: "Loading...",
  },
  xaxis: {
    type: "numeric",
    title: {
      text: "longitude",
    },
  },
  yaxis: {
    title: {
      text: "heat flow value (q)",
    },
  },
};

const chartOptions = initialChartOptions;
const series = ref([]);

// Adjust the height/width of the chart to the chartContainer.
const chartContainer = ref(null);
const chartHeight = computed(() => {
  // calculate height of chartContainer
  if (chartContainer.value) {
    return `${chartContainer.value.offsetHeight}px`;
  } else {
    return "100%"; // if chartContainer = null, default height
  }
});
const chartWidth = computed(() => {
  // calculate width of chartContainer
  if (chartContainer.value) {
    return `${chartContainer.value.offsetWidth}px`;
  } else {
    return "100%"; // if chartContainer = null, default width
  }
});

// add HF-Data in the Chart
const addHFData = async () => {
  const data = draw.getAll();
  if (data.features.length > 0) {
    try {
      const points = analysisFunctions.pointsWithin150km;
      console.log("points data below");
      console.log(points);
      
      const newData = points.map((item) => ({
        x: item.geometry.coordinates[0],
        y: item.properties.q,
      }));

      newData.sort((a, b) => a.x - b.x);
      console.log("newData below");
      console.log(newData);

      chartOptions.value = {
        ...chartOptions.value,
        xaxis: {
          categories: points.map(
            (item) => item.geometry.coordinates[0]
          ),
        },
      };

      series.value = [
        {
          data: newData,
        },
      ];
    } catch (error) {
      console.error("Error occured:", error);
    }
  } else {
    chartOptions.value = initialChartOptions;
    series.value = [];
  }
};

// to allow parent component to use function addHFData
defineExpose({
  addHFData,
});
</script>

<template>
  <div class="chartContainer">
    <apexchart
      type="line"
      :height="chartHeight"
      :width="chartWidth"
      :options="chartOptions"
      :series="series"
    >
    </apexchart>
  </div>
</template>

<style scoped>
.chartContainer {
  height: 35vh;
  width: 80vw;
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 15px;
  margin-bottom: 5px;
  text-align: center;
}
</style>
