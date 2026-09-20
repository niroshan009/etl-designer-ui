<script setup>
import { Handle, Position } from "@vue-flow/core";

defineProps({
  label: {
    type: String,
    default: "Iceberg Writer",
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<template>
  <div class="icebergwriter-node">
    <Handle type="target" :position="Position.Top" />
     

    <div class="node-content"> {{ label }}</div>
    <Handle type="source" :position="Position.Bottom" />
    <div v-if="data?.description" class="node-description">
      {{ data.description }}
    </div>
  </div>
</template>

<style scoped>
.icebergwriter-node {
  padding: 10px 15px;
  border-radius: 8px;
  background: #6366f1;
  color: white;
  font-weight: bold;
  border: 2px solid #4338ca;
  text-align: center;
}

.funnel-icon {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 12px solid #333; /* Change color here */
}

</style>