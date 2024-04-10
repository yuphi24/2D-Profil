import { ref } from "vue";
import { defineStore } from "pinia";
import * as turf from "@turf/turf";
import geojson from "@/assets/data/heatflow_sample_data.geojson";

export const useAnalysisFunctionsStore = defineStore(
  "analysisFunctions",
  () => {
    const pointsWithin150km = ref([]);
    let line = ref(null);

    function getPointsWithin150km(event) {
      console.log("function 'getPointsWithin150km' is called")
      const lineCoordinates = event.features[0].geometry.coordinates;
      console.log("lineCoordinates:", lineCoordinates);
      line.value = turf.lineString(lineCoordinates);
      console.log("line:", line.value);
      pointsWithin150km.value = geojson.features.filter((feature) => {
        // get coordinate of point
        const pointCoordinates = feature.geometry.coordinates;
        // distance between point and line
        const distance = turf.pointToLineDistance(
          turf.point(pointCoordinates),
          line.value,
          { units: "kilometers" }
        );
        // return, if within 150km -> true
        return distance <= 150;
      });
      console.log("pointsWithin150km:", pointsWithin150km.value);
    }
    return { getPointsWithin150km, pointsWithin150km, line };
  }
);
