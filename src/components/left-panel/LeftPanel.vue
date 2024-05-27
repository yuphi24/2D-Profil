<script setup>
import { defineEmits, defineProps } from "vue";

import {
  COffcanvasHeader,
  COffcanvasTitle,
  CCloseButton,
  COffcanvasBody,
} from "@coreui/bootstrap-vue";

import AnalysisPanal from "./analysis-panel/AnalysisPanal.vue";

import { Map } from "maplibre-gl";

const props = defineProps({
  title: String,
  map: Map,
  activeBaseLayer: String,
});

const emit = defineEmits(["collapse-event", "toggle-event"]);
</script>

<template>
  <COffcanvasHeader class="bg-primary">
    <COffcanvasTitle class="text-white">{{ props.title }}</COffcanvasTitle>
    <CCloseButton
      class="text-reset"
      @click="emit('collapse-event'), emit('toggle-event')"
    />
  </COffcanvasHeader>
  <COffcanvasBody>
    <AnalysisPanal
      v-if="props.title === 'Analysis'"
      @collapse-event="emit('collapse-event')"
      @toggle-event="emit('toggle-event')"
    />
  </COffcanvasBody>
</template>

<style scoped></style>
