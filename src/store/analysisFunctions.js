import { ref } from "vue";
import { defineStore } from "pinia";
import * as turf from "@turf/turf";
import geojson from "@/assets/data/parent_elements.geojson";

export const useAnalysisFunctionsStore = defineStore(
  "analysisFunctions",
  () => {
    const pointsWithinDistance = ref([]);
    let line = ref(null);

    function getPointsWithinDistance(event, distance) {
      console.log("getPointsWithinDistance is called; distance:", distance);
      if (event.features[0].geometry.coordinates.length >= 2) {
        try {
          line.value = turf.lineString(event.features[0].geometry.coordinates);
          console.log("test getpoints", line.value);
          pointsWithinDistance.value = geojson.features.filter((feature) => {
            // get coordinate of point from geojson
            const pt = turf.point(feature.geometry.coordinates);
            // calculate distance between point and line
            const pointToLineDistance = turf.pointToLineDistance(
              pt,
              line.value,
              { units: "kilometers" },
              { method: "planar" }
            );
            // return, if within distance -> true
            return pointToLineDistance <= distance;
          });
          console.log("pointsWithinDistance:", pointsWithinDistance.value);
        } catch (error) {
          console.error("Error occured:", error);
        }
      } else if (event.features[0].geometry.coordinates.length < 2) {
        console.log("line successfully deleted");
      }
    }

    // Haversine formula
    function Haversine(lat1, lon1, lat2, lon2, unit) {
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
    return { getPointsWithinDistance, pointsWithinDistance, Haversine, line };
  }
);
