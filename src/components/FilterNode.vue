<script setup>
import { ref } from "vue";
import { Handle, Position } from "@vue-flow/core";

const props = defineProps({
  label: {
    type: String,
    default: "Filter",
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update-config"]);
const isConfigOpen = ref(false);
const condition = ref("");

function openConfig() {
  const savedConfig = Array.isArray(props.data?.config) ? props.data.config : [];
  condition.value =
    savedConfig.find((setting) => setting.key === "condition")?.value ??
    props.data?.condition ??
    "";
  isConfigOpen.value = true;
}

function saveConfig() {
  emit("update-config", {
    config: [{ key: "condition", value: condition.value }],
  });
  isConfigOpen.value = false;
}
</script>

<template>
  <div class="filter-node">
    <Handle type="target" :position="Position.Top" />
    <div class="node-content" @click="openConfig"> {{ label }}</div>
    <Handle type="source" :position="Position.Bottom" />
    <div v-if="data?.description" class="node-description">
      {{ data.description }}
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="isConfigOpen"
      class="filter-config-backdrop"
      @click.self="isConfigOpen = false"
    >
      <form class="filter-config-dialog" @submit.prevent="saveConfig">
        <h3>Configure Filter</h3>

        <div class="filter-config-field">
          <label for="filter-condition">Filter condition</label>
          <textarea
            id="filter-condition"
            v-model="condition"
            placeholder="e.g. age &gt; 18"
            rows="4"
          ></textarea>
        </div>

        <div class="filter-config-actions">
          <button type="button" @click="isConfigOpen = false">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.filter-node {
  padding: 10px 15px;
  border-radius: 8px;
  background: #6366f1;
  color: white;
  font-weight: bold;
  border: 2px solid #4338ca;
  text-align: center;
}

.node-content {
  cursor: pointer;
}

.filter-config-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
}

.filter-config-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(480px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 24px;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  box-shadow: 0 4px 15px rgb(0 0 0 / 20%);
}

.filter-config-dialog h3 {
  margin: 0;
}

.filter-config-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-config-field label {
  font-size: 13px;
  font-weight: 600;
}

.filter-config-field textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: inherit;
  font: inherit;
  resize: vertical;
}

.filter-config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.filter-config-actions button {
  padding: 7px 14px;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.filter-config-actions button[type="submit"] {
  background: #4f46e5;
  color: #fff;
}

.funnel-icon {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 12px solid #333; /* Change color here */
}

</style>