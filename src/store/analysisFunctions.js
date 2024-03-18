import { ref } from "vue";
import { defineStore } from "pinia";
import * as turf from "@turf/turf";
import geojson from "@/assets/data/heatflow_sample_data.geojson";

export const useanAlysisFunctionsStore = defineStore("analysisFunctions", () => {
  let pointsWithin150km = ref([]);

  function getPointsWithin150km(event) {
    const lineCoordinates = event.features[0].geometry.coordinates;
    const line = turf.lineString(lineCoordinates);
    pointsWithin150km.value = geojson.features.filter((feature) => {
      // get coordinate of point
      const pointCoordinates = feature.geometry.coordinates;
      // distance between point and line
      const distance = turf.pointToLineDistance(
        turf.point(pointCoordinates),
        line,
        { units: "kilometers" }
        );
        // if within 150km => true
        return distance <= 150;
    });
    console.log("hello from function getPointsWithin150km")
    console.log(pointsWithin150km.value);
  }
  return { getPointsWithin150km, pointsWithin150km };
});