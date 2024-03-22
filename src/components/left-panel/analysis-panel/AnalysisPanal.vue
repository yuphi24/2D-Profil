<script setup>
// import { ref } from "vue";
import Multiselect from "vue-multiselect";
import { useMeasurementStore } from "@/store/measurements";
import { useSelectPropatiesStore } from "@/store/selectPropaties";

const selectPropaties = useSelectPropatiesStore();
const updateChart = selectPropaties.updateChart;

const measurements = useMeasurementStore();
// const selectPropaties = useSelectPropatiesStore();
// const updateChart = selectPropaties.updateChart;

console.log("data schema from AnalysisPanel");
console.log(measurements.dataSchema);
</script>

<template>
  <!-- 2D Profil -->
  <!-- Property selection -->
  <p class="d-grid gap-2">
    <button
      class="btn btn-primary"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#dataDrivenColoring"
      aria-expanded="false"
      aria-controls="dataDrivenColoring"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-arrows-expand"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M1 8a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 8M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2M8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10"
        />
      </svg>
      2D Profil
    </button>
  </p>
  <div class="collapse" id="dataDrivenColoring">
    <div class="card card-body">
      <multiselect
        v-model="selectPropaties.selectedProperty"
        :options="measurements.selectableProperties"
        label="title"
        placeholder="Selct Property"
        :allow-empty="false"
        @select="updateChart"
      >
      </multiselect>
    </div>
  </div>
</template>

<style>
@import "~vue-multiselect/dist/vue-multiselect.css";
</style>
