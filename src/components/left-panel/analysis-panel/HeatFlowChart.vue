<script setup>
import { ref, watch, defineExpose, defineEmits, defineProps } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { useMapControlsStore } from "@/store/mapControls";
import { useAnalysisFunctionsStore } from "@/store/analysisFunctions";
import {
  CRow,
  CCard,
  CCardHeader,
  CCardBody,
  CCardText,
  CCloseButton,
} from "@coreui/bootstrap-vue";

const props = defineProps({ map: Map });

const apexchart = VueApexCharts;
const mapControls = useMapControlsStore();
const draw = mapControls.mapboxDraw;
const analysisFunctions = useAnalysisFunctionsStore();

const showText = ref(false);
function hideText() {
  if (showText.value === true) {
    showText.value = !showText.value;
  }
}

const id = ref("");
const env = ref("");
const method = ref("");

const initialChartOptions = {
  chart: {
    height: "100%",
    type: "line",
    zoom: {
      enabled: false,
    },
  },
  colors: ["transparent"],
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 2,
    colors: "#fff",
    strokeColors: "gray",
    strokeWidth: 2,
    fillOpacity: 1,
  },
  tooltip: {
    y: {
      formatter: function (y) {
        if (typeof y !== "undefined") {
          return y.toFixed(3);
        }
        return y;
      },
    },
    x: {
      style: {
        colors: ["#333"],
      },
      formatter: function (val, opts) {
        const { seriesIndex, dataPointIndex, w } = opts;
        const id = w.config.series[seriesIndex].data[dataPointIndex].id;
        return "ID" + ":  " + id;
      },
    },
    shared: false,
    intersect: true,
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
          color: "#50bcc9",
          opacity: 1,
        },
        {
          offset: 50,
          color: "#7dcdd7",
          opacity: 0.75,
        },
        {
          offset: 100,
          color: "#e6f5f7",
          opacity: 1,
        },
      ],
    },
  },
  stroke: {
    curve: "smooth",
  },
  title: {
    text: "2D Profil (Demo)",
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
      text: "Distance from A to B (km)",
    },
  },
  yaxis: {
    title: {
      text: "Heat-Flow Value (q)",
    },
  },
};

const chartOptions = initialChartOptions;
const series = ref([]);

const coordinateA = ref();
const coordinateB = ref();

function updatePoints() {
  console.log("function updatePoints is called");
  if (props.map.getLayer("pointAB")) {
    props.map.removeLayer("pointAB");
  }
  if (props.map.getSource("pointAB")) {
    props.map.removeSource("pointAB");
  }

  const pointAB = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coordinateA.value,
        },
        properties: { "marker-symbol": "A" },
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coordinateB.value,
        },
        properties: { "marker-symbol": "B" },
      },
    ],
  };

  function addPoints() {
    console.log("function addPoints is called");

    props.map.addSource("pointAB", {
      type: "geojson",
      data: pointAB,
    });

    props.map.addLayer({
      id: "pointAB",
      type: "symbol",
      source: "pointAB",
      layout: {
        "text-field": ["get", "marker-symbol"],
        "text-offset": [0, 1.0],
      },
    });
  }

  addPoints();
}

watch([coordinateA, coordinateB], () => {
  console.log("coordinateA&B are changed");
  updatePoints();
});

function deletePointAB() {
  if (props.map.getLayer("pointAB")) {
    props.map.removeLayer("pointAB");
  }
  if (props.map.getSource("pointAB")) {
    props.map.removeSource("pointAB");
  }
}

// Haversine formula
function Distance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
}

// add HF-Data in the Chart
const addHFData = async () => {
  const data = draw.getAll();
  if (showText.value === false) {
    showText.value = !showText.value;
  }
  if (data.features.length > 0) {
    try {
      const points = analysisFunctions.pointsWithin150km;
      const line = analysisFunctions.line;
      console.log("points data within 150km", points);

      // draw Point A & B
      coordinateA.value = line.geometry.coordinates[1];
      coordinateB.value = line.geometry.coordinates[0];
      console.log("A:", coordinateA.value, "B:", coordinateB.value);

      // Coordinates transformation 1
      const latA = coordinateA.value[1];
      const lonA = coordinateA.value[0];

      const latB = coordinateB.value[1];
      const lonB = coordinateB.value[0];

      const pointsData = points.map((item) => ({
        id: item.properties.id,
        y: item.properties.q.toFixed(3),
        lon: item.geometry.coordinates[0],
        lat: item.geometry.coordinates[1],
        properties: item.properties,
      }));

      console.log(
        "latA & lonA:",
        latA,
        lonA,
        "latB & lonB:",
        latB,
        lonB,
        "pointsData:",
        pointsData
      );

      // Distance to Point A
      pointsData.forEach((point) => {
        const distanceToA = Distance(latA, lonA, point.lat, point.lon, "K");
        point.x = distanceToA;
        console.log(
          `Distance from point id ${point.id} to point A: ${distanceToA} km`
        );
      });
      const distanceBtoA = Distance(latA, lonA, latB, lonB, "K");
      console.log(`Distance from point B to point A: ${distanceBtoA} km`);

      const pointAData = {
        id: "pointA",
        x: 0,
        y: null,
        lat: latA,
        lon: lonA,
      };

      const pointBData = {
        id: "pointB",
        x: distanceBtoA,
        y: null,
        lat: latB,
        lon: lonB,
      };

      const newData = [...pointsData, pointAData, pointBData];

      console.log("New Data:", newData);

      // draw graphic
      chartOptions.value = {
        ...chartOptions.value,
        xaxis: {
          categories: newData.map((item) => item.x.toFixed(2)),
        },
      };

      newData.sort((a, b) => a.x - b.x);

      series.value = [
        {
          name: "q",
          type: "area",
          data: newData,
        },
      ];
      console.log("series.value", series.value);
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
  deletePointAB,
});

const emit = defineEmits(["close-event"]);

// for "About this Data" Card
const showAboutSelectedData = ref(false);

function getAboutSelectedData(val, chartContext, config) {
  console.log("getAboutSelectedData is called");
  const { seriesIndex, dataPointIndex, w } = config;
  id.value = w.config.series[seriesIndex].data[dataPointIndex].id;
  env.value =
    w.config.series[seriesIndex].data[dataPointIndex].properties.environment;
  method.value =
    w.config.series[seriesIndex].data[dataPointIndex].properties.explo_method;
  const purpose =
    w.config.series[seriesIndex].data[dataPointIndex].properties.explo_purpose;
  console.log(
    "Selected Data",
    "ID:" + id.value,
    "env:" + env.value,
    "method:" + method.value,
    "purpose:" + purpose
  );
  if (showAboutSelectedData.value === false) {
    showAboutSelectedData.value = !showAboutSelectedData.value;
  }
}

// for drag
const drag = ref(null);
const onMouseDown = (event) => {
  let shiftX = event.clientX - drag.value.getBoundingClientRect().left;
  let shiftY = event.clientY - drag.value.getBoundingClientRect().top;

  drag.value.style.position = "absolute";
  drag.value.style.zIndex = 1000;
  document.body.appendChild(drag.value);

  moveAt(event.pageX, event.pageY);

  function moveAt(pageX, pageY) {
    drag.value.style.left = pageX - shiftX + "px";
    drag.value.style.top = pageY - shiftY + "px";
  }

  const onMouseMove = (event) => {
    moveAt(event.pageX, event.pageY);
  };
  document.addEventListener("mousemove", onMouseMove);

  drag.value.onmouseup = () => {
    document.removeEventListener("mousemove", onMouseMove);
    drag.value.onmouseup = null;
  };
};
const onDragStart = () => {
  return false;
};

const vars = {
  "--bs-card-bg": "rgba(255, 255, 255, 0.1)",
  "--bs-card-cap-color": "#373d3f",
};
</script>

<template>
  <div ref="drag" class="chartContainer">
    <CRow :xs="{ cols: 2 }" style="height: 100%">
      <CCard class="h-100 border border-0" style="width: 80%" :style="vars">
        <apexchart
          type="area"
          height="100%"
          :options="chartOptions"
          :series="series"
          @dataPointSelection="getAboutSelectedData"
        >
        </apexchart>
      </CCard>
      <CCard
        class="h-100 p-0 mb-3 border-top-3 border-top-dark"
        style="width: 18%"
      >
        <CCardHeader class="text-center" :style="vars">
          <strong>About this Data</strong>
        </CCardHeader>
        <CCardBody v-show="!showText" class="overflow-auto"></CCardBody>
        <CCardBody v-show="showText" class="overflow-auto">
          <div v-show="!showAboutSelectedData">
            <CCardText>Click on any point data for details.</CCardText>
          </div>
          <div v-show="showAboutSelectedData">
            <p class="subtitle">id:</p>
            <p>{{ id }}</p>
            <p class="subtitle">Basic geographical environment:</p>
            <p>{{ env }}</p>
            <p class="subtitle">Type of exploration method:</p>
            <p>{{ method }}</p>
          </div>
        </CCardBody>
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
      @click="
        emit('close-event');
        hideText();
      "
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
}

.chartContainer svg {
  position: absolute;
  right: 26px;
  top: 2px;
}

.chartContainer p {
  font-size: 14px;
  color: #373d3f;
}

.chartContainer .subtitle {
  font-weight: 600;
  margin: 0;
}

#chart .apexcharts-tooltip {
  color: #fff;
  transform: translateX(10px) translateY(10px);
  overflow: visible !important;
  white-space: normal !important;
}

#chart .apexcharts-tooltip span {
  padding: 5px 10px;
  display: inline-block;
}
</style>
