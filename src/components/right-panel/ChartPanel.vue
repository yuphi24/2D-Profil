<!-- Chart Panel -->
<script setup>
import {
  ref,
  defineEmits,
  watch,
  computed,
  defineProps,
  defineExpose,
} from "vue";

// Extern Libraries
import {
  CCloseButton,
  CCard,
  CCardHeader,
  CCardBody,
  CCardTitle,
  CPopover,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CFormText,
} from "@coreui/bootstrap-vue";
import Multiselect from "vue-multiselect";
import VueApexCharts from "vue3-apexcharts";

const apexchart = VueApexCharts;
const emit = defineEmits(["point-click", "legend-event"]);

// stores
import { useSelectPropertiesStore } from "@/store/selectProperties";
const selectProperties = useSelectPropertiesStore();
import { useMeasurementStore } from "@/store/measurements";
const measurements = useMeasurementStore();
import { useMapControlsStore } from "@/store/mapControls";
const mapControls = useMapControlsStore();
import { useAnalysisFunctionsStore } from "@/store/analysisFunctions";
const analysisFunctions = useAnalysisFunctionsStore();

// props
const props = defineProps({
  map: Map,
  currentPage: Number,
  selectedColorPalette: Object,
  colorPaletteOptions: Array,
});

// functions
const updateChart = selectProperties.updateChart;
const Haversine = analysisFunctions.Haversine;

const draw = mapControls.mapboxDraw;
const coordinateA = ref();
const coordinateB = ref();
const error = ref(false);

const propertyOptions = computed(() => {
  const options = [...measurements.selectableNumberProperties];

  if (
    !options.some(
      (option) => option.key === null && option.title === "No Property"
    )
  ) {
    options.push({ title: "No Property", key: null, units: null });
  }

  return options;
});

// Chart initial settings
const charts = ref([]);
chartInitialSetting();
function chartInitialSetting() {
  let data = [];
  let options = [];
  let series = [];
  let selectedProperty1 = [];
  let selectedProperty2 = [];
  let distance = [];

  const initialChart = {
    data,
    options,
    series,
    selectedProperty1,
    selectedProperty2,
    distance,
  };
  charts.value.push(initialChart);

  const last = charts.value.length - 1;
  charts.value[last].selectedProperty1.push(selectProperties.selectedProperty1);
  if (selectProperties.selectedProperty2 != null) {
    charts.value[last].selectedProperty2.push(
      selectProperties.selectedProperty2
    );
  } else {
    charts.value[last].selectedProperty2.push(null);
  }
  charts.value[last].distance.push(selectProperties.distance2);
  selectProperties.selectedProperty1 = [];
  selectProperties.selectedProperty2 = [];
  selectProperties.distance2 = [];
  console.log("charts test", charts.value);
}

function Options() {
  const last = charts.value.length - 1;
  charts.value[last].options.push({
    chart: {
      height: "100%",
      type: "line",
      stacked: false,
      zoom: {
        enabled: false,
      },
    },
    colors: ["#FF1654", "#247BA0"],
    stroke: {
      width: [4, 4],
    },
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
    yaxis: [
      {
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: "#FF1654",
        },
        labels: {
          style: {
            colors: "#FF1654",
          },
        },
        title: {
          text:
            charts.value[last].selectedProperty1[0].title +
            " (" +
            charts.value[last].selectedProperty1[0].units +
            ")",
          style: {
            color: "#FF1654",
          },
        },
      },
      {
        opposite:
          charts.value[last].selectedProperty2[0] != null ? true : false,
        axisTicks: {
          show: charts.value[last].selectedProperty2[0] != null ? true : false,
        },
        axisBorder: {
          show: charts.value[last].selectedProperty2[0] != null ? true : false,
          color:
            charts.value[last].selectedProperty2[0] != null ? "#247BA0" : "",
        },
        labels: {
          show: charts.value[last].selectedProperty2[0] != null ? true : false,
          style: {
            colors:
              charts.value[last].selectedProperty2[0] != null ? "#247BA0" : "",
          },
        },
        title: {
          text:
            charts.value[last].selectedProperty2[0] != null
              ? charts.value[last].selectedProperty2[0].title +
                " (" +
                charts.value[last].selectedProperty2[0].units +
                ")"
              : "",
          style: {
            color:
              charts.value[last].selectedProperty2[0] != null ? "#247BA0" : "",
          },
        },
      },
    ],
  });
}
Options();

// added chart settings
const addNewChart = () => {
  if (charts.value.length < 4) {
    charts.value.push({
      options: [],
      series: [],
      selectedProperty1: [],
      selectedProperty2: [],
      distance: [],
    });
    const last = charts.value.length - 1;
    charts.value[last].selectedProperty1.push(
      selectProperties.selectedProperty1
    );
    if (selectProperties.selectedProperty2.key != null) {
      charts.value[last].selectedProperty2.push(
        selectProperties.selectedProperty2
      );
    } else {
      charts.value[last].selectedProperty2.push(null);
    }
    charts.value[last].distance.push(selectProperties.distance2);
    selectProperties.selectedProperty1 = [];
    selectProperties.selectedProperty2 = [];
    selectProperties.distance2 = [];
    Options();
  }
};

const handleEnterKey = () => {
  if (validateDistance()) {
    addNewChart();
  }
};

const handleOkButton = () => {
  if (validateDistance()) {
    addNewChart();
  }
};

const validateDistance = () => {
  const distance = parseInt(selectProperties.distance2, 10);
  if (distance < 1 || distance > 500 || isNaN(distance)) {
    error.value = true;
    return false;
  } else {
    error.value = false;
    return true;
  }
};

// Popover
const popoverContent = computed(() => {
  return charts.value.map((chart) => {
    const selectedProperty1 = chart.selectedProperty1[0].title;
    const selectedProperty2 = chart.selectedProperty2?.[0]?.title || "none";
    const distance = chart.distance[0];
    return `Property1: ${selectedProperty1} \n Property2: ${selectedProperty2} \n Distance: ${distance} km`;
  });
});

// pointA & pointB
watch([coordinateA, coordinateB], () => {
  console.log("coordinateA&B are changed");
  updatePoints();
});

function updatePoints() {
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

// draw Chart
// Todo 欠損データのグラフ描写
const drawChart = async (index) => {
  const data = draw.getAll();
  if (data.features.length > 0) {
    try {
      const points = analysisFunctions.pointsWithinDistance;
      const line = analysisFunctions.line;
      console.log("points data within", index.distance[0], points);
      index.series = [];
      index.data = [];
      index.data.push(points);
      console.log("data test", index);
      coordinateA.value = line.geometry.coordinates[1];
      coordinateB.value = line.geometry.coordinates[0];
      console.log("A:", coordinateA.value, "B:", coordinateB.value);

      // Coordinates transformation
      const latA = coordinateA.value[1];
      const lonA = coordinateA.value[0];
      const latB = coordinateB.value[1];
      const lonB = coordinateB.value[0];

      console.log(
        "selected Properties:",
        index.selectedProperty1[0],
        index.selectedProperty2[0]
      );
      const pointsData1 = points.map((item) => ({
        id: item.properties.ID,
        y: item.properties[index.selectedProperty1[0].key],
        lon: item.geometry.coordinates[0],
        lat: item.geometry.coordinates[1],
        properties: item.properties,
      }));

      // calculate distance to pointA
      pointsData1.forEach((point) => {
        const distanceToA = Haversine(latA, lonA, point.lat, point.lon, "K");
        point.x = distanceToA;
      });
      const distanceBtoA = Haversine(latA, lonA, latB, lonB, "K");
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
      const newData1 = [...pointsData1, pointAData, pointBData];
      console.log("New Data:", newData1);
      index.options[0] = {
        ...index.options[0],
        xaxis: {
          categories: newData1.map((item) => item.x.toFixed(2)),
        },
      };
      newData1.sort((a, b) => a.x - b.x);
      // push in series
      index.series.push({
        name: index.selectedProperty1[0].title,
        type: "line",
        data: newData1,
      });
      console.log("series:", index.series);

      if (index.selectedProperty2[0] != null) {
        const pointsData2 = points.map((item) => ({
          id: item.properties.ID,
          y: item.properties[index.selectedProperty2[0].key],
          lon: item.geometry.coordinates[0],
          lat: item.geometry.coordinates[1],
          properties: item.properties,
        }));
        // calculate distance to PointA
        pointsData2.forEach((point) => {
          const distanceToA = Haversine(latA, lonA, point.lat, point.lon, "K");
          point.x = distanceToA;
        });
        const newData2 = [...pointsData2, pointAData, pointBData];
        console.log("New Data:", newData1, newData2);
        newData2.sort((a, b) => a.x - b.x);

        // push in series
        index.series.push({
          name: index.selectedProperty2[0].title,
          type: "line",
          data: newData2,
        });
        console.log("series:", index.series);
      }
    } catch (error) {
      console.error("Error occured:", error);
    }
  } else {
    charts.value.forEach((index) => {
      index.series = [];
      index.data = [];
    });
  }
};

defineExpose({
  charts,
  drawChart,
});

function aboutSelectedData(val, chartContext, config) {
  if (!config) {
    console.warn("config is undefined");
    return;
  } else {
    emit("point-click", val, chartContext, config);
  }
}

const removeChart = (index) => {
  charts.value.splice(index, 1);
};
</script>
<template>
  <div class="chartContainer">
    <CCard
      class="mb-2"
      style="height: 80%"
      v-for="(chart, index) in charts"
      :key="index"
      v-show="props.currentPage === 0 || props.currentPage - 1 === index"
    >
      <CCardHeader
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
        ><CCardTitle style="margin: 0.3em"
          ><strong>Chart {{ index + 1 }}</strong></CCardTitle
        >
        <div>
          <CPopover
            :content="popoverContent[index]"
            placement="left"
            trigger="hover"
            title="Chart settings"
            :style="customPopoverStyle"
          >
            <template #toggler="{ id, on }">
              <CButton
                class="me-md-2"
                color="transparent"
                :aria-describedby="id"
                v-on="on"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-info-circle"
                >
                  <path
                    d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
                  />
                  <path
                    d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
                  />
                </svg>
              </CButton>
            </template>
          </CPopover>
          <CCloseButton class="text-reset" @click="removeChart(index)" />
        </div>
      </CCardHeader>
      <CCardBody style="margin: 0.3em; padding: 0">
        <apexchart
          type="line"
          height="95%"
          style="margin: 0.3em"
          :options="chart.options[0]"
          :series="chart.series"
          :key="index"
          @dataPointSelection="aboutSelectedData"
        >
        </apexchart>
      </CCardBody>
    </CCard>
    <CCard
      class="mb-2"
      style="height: 83%"
      v-if="charts.length < 4 && props.currentPage === 0"
    >
      <CCardHeader>
        <CCardTitle style="margin: 0.3em"
          ><strong>Add new chart</strong>
        </CCardTitle>
      </CCardHeader>
      <CCardBody
        style="
          margin: 0.3em;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-self: center;
          width: 95%;
        "
      >
        <div class="select-box">
          <label class="col-form-label">Property 1</label>
          <multiselect
            v-model="selectProperties.selectedProperty1"
            :options="measurements.selectableNumberProperties"
            label="title"
            placeholder="Selct Property"
            :allow-empty="true"
            :show-labels="false"
            @select="updateChart"
          >
          </multiselect>
        </div>
        <div class="select-box">
          <label class="col-form-label">Property 2</label>
          <multiselect
            v-model="selectProperties.selectedProperty2"
            :options="propertyOptions"
            label="title"
            placeholder="Selct Property"
            :allow-empty="true"
            :show-labels="false"
            @select="updateChart"
          >
          </multiselect>
        </div>
        <CForm style="width: 95%; margin: 0.3em" onsubmit="return false">
          <CFormLabel for="distanceInput2">Distance value</CFormLabel>
          <CFormInput
            type="number"
            v-model="selectProperties.distance2"
            id="distanceInput2"
            placeholder="enter distance in km"
            min="1"
            max="500"
            aria-describedby="exampleFormControlInputHelpInline"
            @keypress.enter="handleEnterKey"
          />
          <CFormText
            as="span"
            id="exampleFormControlInputHelpInline"
            :class="{ 'text-danger': error }"
          >
            Distance must be 1-500 km long.
          </CFormText>
        </CForm>
        <div class="add-button">
          <button
            class="btn btn-outline-primary rounded-circle"
            type="button"
            style="--bs-btn-padding-x: 12px; --bs-btn-padding-y: 8px"
            data-bs-toggle="collapse"
            @click="handleOkButton"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 448 512"
            >
              <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
              <path
                d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
              />
            </svg>
          </button>
          <label>Add</label>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>
<style scoped>
.chartContainer {
  position: absolute;
  width: 100%;
  height: 70%;
  padding-right: 12px;
  overflow: auto;
}
.select-box {
  display: flex;
  margin: 0.3em;
}
.select-box label {
  width: 25%;
  font-size: 1em;
}
.multiselect {
  width: 70%;
}
.add-button {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 8px;
}
.add-button label {
  color: #0d6efd;
  margin-left: 8px;
}
</style>
