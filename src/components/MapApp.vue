<script setup>
// vue
import { onMounted, markRaw, ref, watch, computed } from "vue";

// turf
// import * as turf from "@turf/turf";

// map viewer
import { Map, Popup } from "maplibre-gl";

// data
import maps from "./left-panel/settings-panel/maps.json";
import geojson from "@/assets/data/heatflow_sample_data.geojson";
import schemaURL from "@/assets/data/api_schema.json";

// store
import { useMapControlsStore } from "@/store/mapControls";
const mapControls = useMapControlsStore();
const draw = mapControls.mapboxDraw;

import { useAnalysisFunctionsStore } from "@/store/analysisFunctions";
const analysisFunctions = useAnalysisFunctionsStore();
const getPoint = analysisFunctions.getPointsWithin150km;

import { useSelectPropatiesStore } from "@/store/selectPropaties";
const selectPropaties = useSelectPropatiesStore();

import { useMeasurementStore } from "@/store/measurements";
const measurements = useMeasurementStore();
measurements.fetchAPIDataSchema(schemaURL);
measurements.geojson = geojson;
measurements.isLoading = false;

// component
import { CButton, CButtonGroup, COffcanvas } from "@coreui/bootstrap-vue";
import CursorCoordinates from "./map/CursorCoordinates.vue";
import LeftPanel from "./left-panel/LeftPanel.vue";
import HeatFlowChart from "./left-panel/analysis-panel/HeatFlowChart.vue";
import HFUncertaintyChart from "./left-panel/analysis-panel/HFUncertaintyChart.vue";
import MeasuredDepthChart from "./left-panel/analysis-panel/MeasuredDepthChart.vue";
import TrueVerticalDepthChart from "./left-panel/analysis-panel/TrueVerticalDepthChart.vue";

// to call function "addHFData from LineChart.vue"
const heatFlowChart = ref();
const heatFlowUChart = ref();
const measuredDepthChart = ref();
const updateQChart = () => {
  console.log("fonction 'addHFData' from HeatFlowChart.vue is called");
  heatFlowChart.value.addHFData();
};
const updateDepthChart = () => {
  console.log("fonction 'addMDData' from MeasuredDepthChart.vue is called");
  measuredDepthChart.value.addMDData();
};
const updateQCChart = () => {
  console.log("fonction 'addHFUData' from HFUncertaintyChart.vue is called");
  heatFlowUChart.value.addHFUData();
};

const mapContainer = ref();
const map = ref();
const navbarTitles = ref(["Settings", "Filter", "Statistics", "Analysis"]);

// for update Chart
const displayedChartNr = ref(0);
console.log("displayedChartNr", displayedChartNr.value);
watch(
  () => selectPropaties.selectedChartComponent,
  (newValue, oldValue) => {
    console.log("newValue:", newValue, "oldValue:", oldValue);
    console.log("selectedChartComponent from MapApp.vue:", selectPropaties.selectedChartComponent);
    if (newValue === "HeatFlowChart") {
      displayedChartNr.value = 1;
      console.log("displayedChartNr", displayedChartNr.value);
    } else if (newValue === "HFUncertaintyChart") {
      displayedChartNr.value = 2;
      console.log("displayedChartNr", displayedChartNr.value);
    } else if (newValue === "MeasuredDepthChart") {
      displayedChartNr.value = 3;
      console.log("displayedChartNr", displayedChartNr.value);
    } else if (newValue === "TrueVerticalDepthChart") {
      displayedChartNr.value = 4;
      console.log("displayedChartNr", displayedChartNr.value);
    } else {
      displayedChartNr.value = 0;
      console.log("displayedChartNr", displayedChartNr.value);
    }
  }
);
const setIsClosed = () => (displayedChartNr.value = 0);

// avoid to get points data by drawing line, if it's not 2d profil modus
watch(displayedChartNr, currentDisplayChartNr => {
  console.log("currentDisplayChartNr",currentDisplayChartNr);
  if(currentDisplayChartNr === 1) {
    // get points within 150km of line
    map.value.on("draw.create", getPoint);
    map.value.on("draw.update", getPoint);
    // draw line chart of q-value
    map.value.on("draw.create", updateQChart);
    map.value.on("draw.delete", updateQChart, backPointColor);
    map.value.on("draw.update", updateQChart);
    map.value.off("draw.create", updateDepthChart);
    map.value.off("draw.delete", updateDepthChart);
    map.value.off("draw.update", updateDepthChart);
    map.value.off("draw.create", updateQCChart);
    map.value.off("draw.delete", updateQCChart);
    map.value.off("draw.update", updateQCChart);
  } else if (currentDisplayChartNr === 2) {
    // get points within 150km of line
    map.value.on("draw.create", getPoint);
    map.value.on("draw.update", getPoint);
    map.value.on("draw.create", updateDepthChart);
    map.value.on("draw.delete", updateDepthChart);
    map.value.on("draw.update", updateDepthChart);
    map.value.off("draw.create", updateQChart);
    map.value.off("draw.delete", updateQChart);
    map.value.off("draw.update", updateQChart);
    map.value.off("draw.create", updateQCChart);
    map.value.off("draw.delete", updateQCChart);
    map.value.off("draw.update", updateQCChart);
  } else if (currentDisplayChartNr === 3) {
    // get points within 150km of line
    map.value.on("draw.create", getPoint);
    map.value.on("draw.update", getPoint);
    map.value.on("draw.create", updateQCChart);
    map.value.on("draw.delete", updateQCChart);
    map.value.on("draw.update", updateQCChart);
    map.value.off("draw.create", updateDepthChart);
    map.value.off("draw.delete", updateDepthChart);
    map.value.off("draw.update", updateDepthChart);
  } else {
    map.value.off("draw.create", getPoint);
    map.value.off("draw.update", getPoint);
    map.value.off("draw.create", updateQChart);
    map.value.off("draw.delete", updateQChart);
    map.value.off("draw.update", updateQChart);
    map.value.off("draw.create", updateDepthChart);
    map.value.off("draw.delete", updateDepthChart);
    map.value.off("draw.update", updateDepthChart);
    map.value.off("draw.create", updateQCChart);
    map.value.off("draw.delete", updateQCChart);
    map.value.off("draw.update", updateQCChart);
  }
});

// Color setting
const defaultCircleColor = ref("#41b6c4");
const newCircleColor = ref("#fa9b1e");

watch(
  () => analysisFunctions.pointsWithin150km,
  (newPoints, oldPoints) => {
    console.log("points color will be changed");
    console.log("new:", newPoints, "old:", oldPoints);

    const newPointIds = newPoints.map(point => point.id);
    console.log("newPointIds", newPointIds);
    changeNewPointColor(newCircleColor.value, newPointIds);

    const oldPointIds = oldPoints.map(point => point.id);
    console.log("oldPointIds", oldPointIds);
  }, { deep: true }
);

function changeNewPointColor(color, pointIds) {
  console.log("pointId", pointIds);
  console.log("color", color);
  map.value.setPaintProperty("sites", "circle-color", ["match", ["get", "id"], pointIds, color, defaultCircleColor.value]);
};

function backPointColor() {
  map.value.setPaintProperty("sites", "circle-color", defaultCircleColor.value);
};

// for CButtonGroup
const panelTitle = ref("");
const isCollapsed = ref(true);
const visibleScrolling = ref(false);
const setIsCollapsed = () => (isCollapsed.value = !isCollapsed.value);
function setPanelTitle(event) {
  panelTitle.value = event.srcElement.innerHTML;
}
function toggleVisibleScrolling() {
  visibleScrolling.value = !visibleScrolling.value;
}

// for basemaps
const basemaps = ref(maps);
const activeBaseLayer = ref("");
function setBaseMapsSource(basemaps) {
  let bmSourceObject = {};

  basemaps.forEach((baseMapSource) => {
    bmSourceObject[baseMapSource.id] = {
      type: "raster",
      tiles: [baseMapSource.tiles],
      tileSize: 256,
      attribution: baseMapSource.attribution,
      minzoom: 0,
      maxzoom: 22,
    };
  });
  return bmSourceObject;
}
function setBaseMapsLayer(basemaps) {
  let layerObjects = [];

  basemaps.forEach((baseMapLayer, ix) => {
    let layerObject = {
      id: baseMapLayer.id,
      type: "raster",
      source: baseMapLayer.id,
    };
    if (ix == 0) {
      activeBaseLayer.value = baseMapLayer.id;
      // first object in maps.json will be default base map
      layerObject.layout = {
        visibility: "visible",
      };
    } else {
      // others are already added but not visible
      layerObject.layout = {
        visibility: "none",
      };
    }
    layerObjects.push(layerObject);
  });
  return layerObjects;
}

onMounted(() => {
  // instantiate map object
  map.value = markRaw(
    new Map({
      mapId: "map_1",
      container: mapContainer.value,
      attributionControl: true,
      style: {
        version: 8,
        sources: setBaseMapsSource(basemaps.value),
        layers: setBaseMapsLayer(basemaps.value),
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf", // https://maplibre.org/maplibre-gl-js-docs/style-spec/glyphs/
      },
    })
  );

  map.value.once("load", async () => {
    map.value.addControl(draw);

    map.value.addSource("sites", {
      type: "geojson",
      data: geojson,
    });

    // add data layer
    map.value.addLayer({
      id: "sites",
      type: "circle",
      source: "sites",
      paint: {
        "circle-color": defaultCircleColor.value,
        "circle-radius": 4,
        "circle-stroke-width": 0.5,
        "circle-stroke-color": "#a1dab4",
      },
      layout: {
        visibility: "visible",
      },
    });

    // popup id numbers
    map.value.on("click", "sites", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const id = e.features[0].properties.id;
      new Popup().setLngLat(coordinates).setHTML(id).addTo(map.value);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.value.on("mouseenter", "sites", () => {
      map.value.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    map.value.on("mouseleave", "sites", () => {
      map.value.getCanvas().style.cursor = "";
    });

    // scale
    map.value.addControl(mapControls.scale);
  });
});
</script>

<template>
  <div class="map-wrap">
    <div class="map" ref="mapContainer" @mousemove="updateLatLng"></div>
    <HeatFlowChart
      ref="heatFlowChart" 
      v-if="displayedChartNr === 1" 
      @close-event="setIsClosed()"
    />
    <HFUncertaintyChart
      ref="heatFlowUChart"
      v-if="displayedChartNr === 2"
      @close-event="setIsClosed()"
    />
    <MeasuredDepthChart
      ref="measuredDepthChart"
      v-if="displayedChartNr === 3"
      @close-event="setIsClosed()"
    />
    <TrueVerticalDepthChart
      ref="trueVerticalDepthChart"
      v-if="displayedChartNr === 4"
      @close-event="setIsClosed()"
    />

    <!-- Navigation buttons -->
    <div class="fixed-bottom">
      <CButtonGroup role="group" aria-label="Basic example">
        <CButton
          color="primary"
          v-for="title in navbarTitles"
          :key="title"
          @click="
            isCollapsed ? setPanelTitle($event) : 0,
              setIsCollapsed(),
              toggleVisibleScrolling()
          "
          type="button"
          class="btn btn-primary"
        >
          {{ title }}
        </CButton>
      </CButtonGroup>

      <COffcanvas
        :backdrop="false"
        placement="start"
        scroll
        :visible="visibleScrolling"
        @hide="
          () => {
            visibleScrolling = !visibleScrolling;
          }
        "
      >
        <LeftPanel
          :title="panelTitle"
          :map="map"
          :activeBaseLayer="activeBaseLayer"
          :heatFlowSchema="heatFlowSchema"
          @collapse-event="setIsCollapsed()"
          @toggle-event="toggleVisibleScrolling()"
        />
      </COffcanvas>

      <div class="cursor-div">
        <CursorCoordinates :map="map" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "~maplibre-gl/dist/maplibre-gl.css";
@import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

.map-wrap {
  position: absolute;
  width: 100%;
  height: 100%;
}

.map {
  /* position: relative; */
  width: 100%;
  height: 100%;
}

.fixed-bottom {
  position: absolute;
  width: fit-content;
  height: fit-content;
  margin: 0 auto;
  z-index: 1;
}

.maplibregl-popup {
  max-width: 400px;
  font: 12px/20px "Helvetica Neue", Arial, Helvetica, sans-serif;
}
</style>
