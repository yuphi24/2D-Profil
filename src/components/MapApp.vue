<script setup>
// vue
import { onMounted, markRaw, ref } from "vue";

// turf
import * as turf from "@turf/turf";

// map viewer
import { Map, Popup } from "maplibre-gl";

// data
import maps from "./left-panel/maps.json";
import geojson from "@/assets/data/heatflow_sample_data.geojson";

// store
import { useMapControlsStore } from "@/store/mapControls";
import { useanAlysisFunctionsStore } from "@/store/analysisFunctions";

// component
import LineChart from "./analysis/LineChart.vue";

// to call function "addHFData from LineChart.vue"
const lineChart = ref();
const updateQChart = () => {
  console.log("fonction 'addHFData' from LineChart.vue is called")
  lineChart.value.addHFData();
};

const mapContainer = ref();
const map = ref();
const mapControls = useMapControlsStore();
const draw = mapControls.mapboxDraw;
const analysisFunctions = useanAlysisFunctionsStore();
const getPoint = analysisFunctions.getPointsWithin150km;
// const calculatedArea = ref("");

// for basemaps
const basemaps = ref(maps);
const activeBaseLayer = ref("");

const defaultCircleColor = ref("#41b6c4");

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

    // flächen berechnen as turf test
    // map.value.on("draw.create", updateArea);
    // map.value.on("draw.delete", updateArea);
    // map.value.on("draw.update", updateArea);

    // get points within 150km of line
    map.value.on("draw.create", getPoint);
    map.value.on("draw.update", getPoint);

    // draw line chart of q-value
    map.value.on("draw.create", updateQChart);
    map.value.on("draw.delete", updateQChart);
    map.value.on("draw.update", updateQChart);
  });
});
</script>

<template>
  <div class="map-wrap">
    <div class="map" ref="mapContainer" @mousemove="updateLatLng"></div>
    <LineChart ref="lineChart" />
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

p {
  font-family: "Open Sans";
  margin: 0;
  font-size: 13px;
}

.calculated-area {
  padding-top: 3px;
}

.maplibregl-popup {
  max-width: 400px;
  font: 12px/20px "Helvetica Neue", Arial, Helvetica, sans-serif;
}
</style>
