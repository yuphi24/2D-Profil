<script setup>
// vue
import { onMounted, markRaw, ref, watch } from "vue";

// turf
// import * as turf from "@turf/turf";

// map viewer
import { Map, Popup } from "maplibre-gl";

// data
import maps from "./left-panel/settings-panel/maps.json";
import geojson from "@/assets/data/parent_elements.geojson";
import schemaURL from "@/assets/data/api_schema.json";

// store
import { useMapControlsStore } from "@/store/mapControls";
const mapControls = useMapControlsStore();
const draw = mapControls.mapboxDraw;

import { useAnalysisFunctionsStore } from "@/store/analysisFunctions";
const analysisFunctions = useAnalysisFunctionsStore();
const getPoint = analysisFunctions.getPointsWithinDistance;

import { useSelectPropertiesStore } from "@/store/selectProperties";
const selectProperties = useSelectPropertiesStore();

import { useMeasurementStore } from "@/store/measurements";
const measurements = useMeasurementStore();
measurements.fetchAPIDataSchema(schemaURL);
measurements.geojson = geojson;
measurements.isLoading = false;

// component
import { CButton, CButtonGroup, COffcanvas } from "@coreui/bootstrap-vue";
import CursorCoordinates from "./map/CursorCoordinates.vue";
import LeftPanel from "./left-panel/LeftPanel.vue";
import ChartPanel from "./left-panel/analysis-panel/ChartPanel.vue";
import HFUncertaintyChart from "./left-panel/analysis-panel/HFUncertaintyChart.vue";
import MeasuredDepthChart from "./left-panel/analysis-panel/MeasuredDepthChart.vue";
import TrueVerticalDepthChart from "./left-panel/analysis-panel/TrueVerticalDepthChart.vue";
import RightPanel from "./right-panel/RightPanel.vue";
import MapLegend from "./map/MapLegend.vue";

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
console.log("displayedChartNr:", displayedChartNr.value);
watch(
  () => selectProperties.selectedChartComponent,
  (newValue, oldValue) => {
    console.log("newValue:", newValue, "oldValue:", oldValue);
    if (newValue === "HeatFlowChart") {
      displayedChartNr.value = 1;
    } else if (newValue === "HFUncertaintyChart") {
      displayedChartNr.value = 2;
    } else if (newValue === "MeasuredDepthChart") {
      displayedChartNr.value = 3;
    } else if (newValue === "TrueVerticalDepthChart") {
      displayedChartNr.value = 4;
    } else if (newValue === "2DProfil") {
      displayedChartNr.value = 5;
    } else {
      displayedChartNr.value = 0;
    }
  }
);
const setIsClosed = () => {
  displayedChartNr.value = 0;
  selectProperties.selectedChartComponent = "";
};

// avoid to get points data by drawing line, if it's not 2d profil modus
watch(displayedChartNr, (currentDisplayChartNr) => {
  console.log("currentDisplayChartNr:", currentDisplayChartNr);
  const drawEvents = ["draw.create", "draw.update", "draw.delete"];
  const createUpdateEvents = ["draw.create", "draw.update"];
  const deleteEvent = "draw.delete";

  if (currentDisplayChartNr === 1) {
    // Heat Flow
    createUpdateEvents.forEach((event) => {
      map.value.on(event, function (e) {
        getPoint(e, selectProperties.distance);
        updateQChart(e);
      });
    });
    map.value.on(deleteEvent, function (e) {
      updateQChart(e);
      backPointColor(e);
    });
    drawEvents.forEach((event) => {
      map.value.off(event, function (e) {
        updateDepthChart(e);
        updateQCChart(e);
      });
    });
  } else if (currentDisplayChartNr === 2) {
    // Heat Flow Uncertainty
    createUpdateEvents.forEach((event) => {
      map.value.on(event, function (e) {
        getPoint(e, selectProperties.distance);
        updateQCChart(e);
      });
    });
    map.value.on(deleteEvent, function (e) {
      updateQCChart(e);
      backPointColor(e);
    });
    drawEvents.forEach((event) => {
      map.value.off(event, function (e) {
        updateQChart(e);
        updateDepthChart(e);
      });
    });
  } else if (currentDisplayChartNr === 3) {
    // Total Measured Depth
    createUpdateEvents.forEach((event) => {
      map.value.on(event, function (e) {
        getPoint(e, selectProperties.distance);
        updateDepthChart(e);
      });
    });
    map.value.on(deleteEvent, function (e) {
      updateDepthChart(e);
      backPointColor(e);
    });
    drawEvents.forEach((event) => {
      map.value.off(event, function (e) {
        updateQChart(e);
        updateQCChart(e);
      });
    });
  } else {
    createUpdateEvents.forEach((event) => {
      map.value.off(event, function (e) {
        getPoint(e, selectProperties.distance);
      });
    });
    drawEvents.forEach((event) => {
      map.value.off(event, function (e) {
        updateQChart(e);
        updateQCChart(e);
        updateDepthChart(e);
      });
    });
  }
});

// Color setting
const defaultCircleColor = ref("#41b6c4");
//const newCircleColor = ref("#fa9b1e");

/* watch(
  () => analysisFunctions.pointsWithinDistance,
  (newPoints, oldPoints) => {
    console.log("points color will be changed");
    console.log("new:", newPoints, "old:", oldPoints);

    const newPointIds = newPoints.map((point) => point.properties.ID);
    console.log("newPointIds", newPointIds);
    changeNewPointColor(newCircleColor.value, newPointIds);

    const oldPointIds = oldPoints.map((point) => point.properties.ID);
    console.log("oldPointIds", oldPointIds);
  },
  { deep: true }
);

function changeNewPointColor(color, pointIds) {
  console.log("pointId:", pointIds);
  console.log("color:", color);
  map.value.setPaintProperty("sites", "circle-color", [
    "match",
    ["get", "ID"],
    pointIds,
    color,
    defaultCircleColor.value,
  ]);
} */

function backPointColor() {
  console.log("backPointColor is called");
  map.value.setPaintProperty("sites", "circle-color", defaultCircleColor.value);
  if (displayedChartNr.value === 1) {
    heatFlowChart.value.deletePointAB();
  }
}

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
      const id = e.features[0].properties.ID;
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
    <div class="column map" ref="mapContainer" @mousemove="updateLatLng">
      <ChartPanel
        ref="heatFlowChart"
        v-if="displayedChartNr === 1"
        @close-event="setIsClosed()"
        :map="map"
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
      <MapLegend />

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
    <div class="column chart-panel" v-if="displayedChartNr === 5">
      <RightPanel @close-event="setIsClosed()" :map="map" />
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

.column {
  width: 100%;
  height: 100vh;
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

.chart-panel {
  max-width: 600px;
}

@media all and (min-width: 500px) {
  .map-wrap {
    display: flex;
  }
}
</style>
