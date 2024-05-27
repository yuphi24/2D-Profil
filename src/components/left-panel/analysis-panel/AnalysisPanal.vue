<script setup>
import { ref, defineEmits } from "vue";
import Multiselect from "vue-multiselect";
import { useMeasurementStore } from "@/store/measurements";
import { useSelectPropertiesStore } from "@/store/selectProperties";
import {
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CFormText,
} from "@coreui/bootstrap-vue";

const selectProperties = useSelectPropertiesStore();
const updateSelectedProperty = selectProperties.updateSelectedProperty;
const updateChart = selectProperties.updateChart;
const updateSelectedProperties = selectProperties.updateSelectedProperties;
const measurements = useMeasurementStore();

const error = ref(false);

console.log("dataSchema from AnalysisPanel");
console.log(measurements.dataSchema);

const emit = defineEmits(["collapse-event", "toggle-event"]);

const addTag = (newTag) => {
  const tag = {
    title: newTag,
    key: newTag.substring(0, 2) + Math.floor(Math.random() * 10000000),
  };
  measurements.selectableNumberProperties.value.push(tag);
};

const handleEnterKey = () => {
  if (validateDistance()) {
    updateChart();
    emit("collapse-event");
    emit("toggle-event");
  }
};

const handleOkButton = () => {
  if (validateDistance()) {
    updateChart();
    emit("collapse-event");
    emit("toggle-event");
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
    <div class="card card-body mb-2">
      <label>select one property</label>
      <multiselect
        v-model="selectProperties.selectedProperty"
        :options="measurements.selectableNumberProperties"
        label="title"
        placeholder="Selct Property"
        @select="updateSelectedProperty"
        @remove="updateSelectedProperty"
      >
      </multiselect>
      <CForm>
        <CFormLabel for="distanceInput1">Distance value</CFormLabel>
        <CFormInput
          type="number"
          v-model="selectProperties.distance1"
          id="distanceInput1"
          placeholder="enter distance in km"
          min="1"
          max="500"
          aria-describedby="exampleFormControlInputHelpInline"
        />
        <CFormText as="span" id="exampleFormControlInputHelpInline">
          Distance must be 1-500 km long.
        </CFormText>
      </CForm>
      <CButton
        type="button"
        class="btn btn-outline-primary mt-2"
        @click="updateChart()"
      >
        OK
      </CButton>
    </div>
    <div class="card card-body">
      <label>select one or two properties</label>
      <multiselect
        v-model="selectProperties.selectedMultiProperty"
        placeholder="Search or add a property"
        label="title"
        track-by="key"
        :options="measurements.selectableNumberProperties"
        :multiple="true"
        :taggable="true"
        :max="2"
        @tag="addTag"
        @select="updateSelectedProperties"
        @remove="updateSelectedProperties"
      >
      </multiselect>
      <CForm onsubmit="return false">
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
      <CButton
        type="button"
        class="btn btn-outline-primary mt-2"
        @click="handleOkButton"
      >
        OK
      </CButton>
    </div>
  </div>
</template>

<style>
@import "~vue-multiselect/dist/vue-multiselect.css";
</style>
