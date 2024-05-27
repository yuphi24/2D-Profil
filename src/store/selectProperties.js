import { ref } from "vue";
import { defineStore } from "pinia";

export const useSelectPropertiesStore = defineStore("selectProperties", () => {
  let selectedProperty = ref("");
  let selectedChartComponent = ref("");
  let selectedMultiProperty = ref("");
  let selectedProperty1 = ref("");
  let selectedProperty2 = ref("");
  const distance1 = ref(null);
  const distance2 = ref(null);
  const distance = ref(null);

  // SelectedProperty for Single Chart
  function updateSelectedProperty() {
    if (selectedProperty.value) {
      console.log("selectedProperty:", selectedProperty.value);
    } else {
      console.log(
        "SelectedProperty is empty.",
        "SelectedProperty:",
        selectedProperty.value
      );
    }
  }

  // SelectedProperties for Multiple Chart
  function updateSelectedProperties() {
    if (selectedMultiProperty.value.length > 0) {
      const length = selectedMultiProperty.value.length;

      if (length >= 1) {
        selectedProperty1.value = selectedMultiProperty.value[0];
      } else {
        selectedProperty1.value = null;
      }
      if (length >= 2) {
        selectedProperty2.value = selectedMultiProperty.value[1];
      } else {
        selectedProperty2.value = null;
      }

      console.log(
        "selectedProperty1:",
        selectedProperty1.value,
        "selectedProperty2:",
        selectedProperty2.value
      );
    } else {
      selectedProperty1.value = null;
      selectedProperty2.value = null;
      console.log(
        "SelectedProperty is empty.",
        "selectedProperty1:",
        selectedProperty1.value,
        "selectedProperty2:",
        selectedProperty2.value
      );
    }
  }

  function updateChart() {
    if (selectedProperty.value.key === "q") {
      selectedChartComponent.value = "HeatFlowChart";
      selectedProperty.value = [];
      return selectedChartComponent.value;
    } else if (selectedProperty.value.key === "q_uncertainty") {
      selectedChartComponent.value = "HFUncertaintyChart";
      selectedProperty.value = [];
      return selectedChartComponent.value;
    } else if (selectedProperty.value.key === "total_depth_MD") {
      selectedChartComponent.value = "MeasuredDepthChart";
      selectedProperty.value = [];
      return selectedChartComponent.value;
    } else if (selectedProperty.value.key === "total_depth_TVD") {
      selectedChartComponent.value = "TrueVerticalDepthChart";
      selectedProperty.value = [];
      return selectedChartComponent.value;
    } else if (selectedMultiProperty.value.length > 0) {
      selectedChartComponent.value = "2DProfil";
      selectedMultiProperty.value = [];
      return selectedChartComponent.value;
    }
  }

  return {
    updateSelectedProperty,
    updateChart,
    updateSelectedProperties,
    selectedProperty,
    selectedMultiProperty,
    selectedProperty1,
    selectedProperty2,
    selectedChartComponent,
    distance1,
    distance2,
    distance,
  };
});
