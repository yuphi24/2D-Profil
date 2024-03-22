import { ref } from "vue";
import { defineStore } from "pinia";

export const useSelectPropatiesStore = defineStore("selectPropaties", () => {
  let selectedProperty = ref("");
  let selectedChartComponent = ref("");

  function updateChart() {
    console.log("selectedProperty below");
    console.log(selectedProperty.value);
    console.log(selectedProperty.value.key);
    if (selectedProperty.value.key === "q") {
      selectedChartComponent.value = "HeatFlowChart";
      console.log("selectedChartComponent below");
      console.log(selectedChartComponent.value);
      return selectedChartComponent.value;
    } else if (selectedProperty.value.key === "total_depth_MD") {
      selectedChartComponent.value = "MeasuredDepthChart";
      console.log("selectedChartComponent below");
      console.log(selectedChartComponent.value);
      return selectedChartComponent.value;
    } else if (selectedProperty.value.key === "q_uncertainty") {
      selectedChartComponent.value = "HFUncertaintyChart";
      console.log("selectedChartComponent below");
      console.log(selectedChartComponent.value);
      return selectedChartComponent.value;
    }
  }
  return { updateChart, selectedProperty, selectedChartComponent };
});
