<script setup>
import { ref, computed } from "vue";
import VueApexCharts from "vue3-apexcharts";
const apexchart = VueApexCharts;

const chartOptions = {
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
    text: "2D Profil",
    align: "left",
  },
  grid: {
    row: {
      colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
      opacity: 0.5,
    },
  },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  },
};

const series = [
  {
    name: "Desktops",
    data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
  },
];

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
