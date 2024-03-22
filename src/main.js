import "@babel/polyfill";
import "mutationobserver-shim";
import VueApexCharts from "vue3-apexcharts";

import { createApp } from "vue";
import App from "./App.vue";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.js";

import { createPinia } from "pinia";

const app = createApp(App).use(createPinia());

app
  .use(VueApexCharts)
  .mount(document.getElementsByClassName("whfd-mapping")[0]);
