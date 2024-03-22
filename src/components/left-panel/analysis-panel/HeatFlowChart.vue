<script setup>
import { ref, computed, defineExpose, defineEmits } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { useMapControlsStore } from "@/store/mapControls";
import { useAnalysisFunctionsStore } from "@/store/analysisFunctions";
import { CRow, CCard, CCardHeader, CCloseButton } from "@coreui/bootstrap-vue";

const apexchart = VueApexCharts;
const mapControls = useMapControlsStore();
const draw = mapControls.mapboxDraw;
const analysisFunctions = useAnalysisFunctionsStore();

const initialChartOptions = {
  chart: {
    height: "100%",
    type: "area",
    zoom: {
      enabled: false,
    },
  },
  colors: ["transparent"],
  dataLabels: {
    enabled: true,
    position: "top",
    style: {
      colors: ["#333"],
    },
    offsetX: 10,
    offsetY: -5,
    formatter: function (val, opts) {
      const { seriesIndex, dataPointIndex, w } = opts;
      const id = w.config.series[seriesIndex].data[dataPointIndex].id;
      return "id" + ":  " + id;
    },
  },
  markers: {
    size: 3,
    colors: "#fff",
    strokeColors: "gray",
    strokeWidth: 2,
    fillOpacity: 1,
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100],
      colorStops: [
        {
          offset: 0,
          color: "#e61e1e",
          opacity: 1,
        },
        {
          offset: 50,
          color: "#e6e31e",
          opacity: 0.75,
        },
        {
          offset: 100,
          color: "#1e9de6",
          opacity: 1,
        },
      ],
    },
  },
  stroke: {
    curve: "smooth",
  },
  title: {
    text: "Heat-Flow Data (Demo)",
    align: "left",
  },
  noData: {
    text: "draw a line to create a chart",
    offsetY: -15,
    zIndex: 10000,
  },
  grid: {
    row: {
      colors: ["#f3f3f3", "transparent"],
      opacity: 0.5,
    },
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
        id: item.properties.id,
      }));

      newData.sort((a, b) => a.x - b.x);
      console.log("newData below");
      console.log(newData);

      chartOptions.value = {
        ...chartOptions.value,
        xaxis: {
          categories: points.map((item) => item.geometry.coordinates[0]),
        },
      };

      console.log(chartOptions.value.xaxis);

      series.value = [
        {
          data: newData,
        },
      ];
      console.log(series.value);
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

const emit = defineEmits(["close-event"]);

// for drag
const drag = ref(null);
const onMouseDown = (event) => {
    let shiftX = event.clientX - drag.value.getBoundingClientRect().left;
    let shiftY = event.clientY - drag.value.getBoundingClientRect().top;
  
    drag.value.style.position = 'absolute';
    drag.value.style.zIndex = 1000;
    document.body.appendChild(drag.value);
  
    moveAt(event.pageX, event.pageY);
  
    function moveAt(pageX, pageY) {
      drag.value.style.left = pageX - shiftX + 'px';
      drag.value.style.top = pageY - shiftY + 'px';
    }
  
    const onMouseMove = (event) => {
      moveAt(event.pageX, event.pageY);
    };
  
    document.addEventListener('mousemove', onMouseMove);
  
    drag.value.onmouseup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      drag.value.onmouseup = null;
    };
  };
const onDragStart = () => {
  return false;
};
</script>

<template>
  <div ref="drag" class="chartContainer">
    <CRow :xs="{ cols: 2 }" style="height: 100%">
      <CCard class="h-100 border border-0" style="width: 80%">
        <apexchart
          type="area"
          height="100%"
          :options="chartOptions"
          :series="series"
        >
        </apexchart>
      </CCard>
    <CCard class="h-100 p-0" style="width: 18%">
      <CCardHeader>About this Data</CCardHeader>
    </CCard>
    </CRow>
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="gray"
      viewBox="0 0 512 512"
      @mousedown="onMouseDown" 
      @dragstart="onDragStart"
    >
      <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
      <path 
        d="M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4V224H109.3l9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4H224V402.7l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4V288H402.7l-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4H288V109.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z"
      />
    </svg>
    <CCloseButton
      class="position-absolute top-0 end-0" 
      @click="emit('close-event')"
    />
  </div>
</template>

<style scoped>
.chartContainer {
  height: 40vh;
  width: 75vw;
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 80px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 26px 15px 15px 15px;
  margin-bottom: 5px;
  text-align: center;
}

.chartContainer svg {
  position: absolute;
  right: 26px;
  top: 2px;
}
</style>
