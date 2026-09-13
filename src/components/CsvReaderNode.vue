<script setup>
import { Handle, Position } from "@vue-flow/core";

defineProps({
  label: {
    type: String,
    default: "CSV Reader",
  },
});
</script>

<template>
  <div class="csv-reader-node">
    <Handle type="target" :position="Position.Top" />
    <div class="node-content">📄 {{ label }}</div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.csv-reader-node {
  padding: 10px 15px;
  border-radius: 8px;
  background: #6366f1;
  color: white;
  font-weight: bold;
  border: 2px solid #4338ca;
  text-align: center;
}
</style>