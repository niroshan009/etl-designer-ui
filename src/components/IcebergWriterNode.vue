<script setup>
import { ref } from "vue";
import { Handle, Position } from "@vue-flow/core";

const props = defineProps({
  label: {
    type: String,
    default: "Iceberg Writer",
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update-config"]);
const isConfigOpen = ref(false);
const config = ref([]);
const ICEBERG_CONFIG_FIELDS = [
  { key: "catalog", label: "Catalog", placeholder: "e.g. demo", default: "" },
  { key: "namespace", label: "Namespace / database", placeholder: "e.g. analytics", default: "" },
  { key: "table", label: "Table name", placeholder: "e.g. customer_events", default: "" },
  {
    key: "writeMode",
    label: "Write mode",
    type: "select",
    options: ["append", "overwrite", "errorifexists", "ignore"],
    default: "append",
  },
  { key: "partitionBy", label: "Partition columns", placeholder: "e.g. event_date, region", default: "" },
];

function openConfig() {
  const savedConfig = Array.isArray(props.data?.config) ? props.data.config : [];
  config.value = ICEBERG_CONFIG_FIELDS.map((field) => {
    const savedValue = savedConfig.find((setting) => setting.key === field.key)?.value;
    return {
      key: field.key,
      value: savedValue ?? props.data?.[field.key] ?? field.default,
    };
  });
  isConfigOpen.value = true;
}

function getConfigValue(key) {
  return config.value.find((setting) => setting.key === key)?.value;
}

function updateConfigValue(key, value) {
  const setting = config.value.find((item) => item.key === key);
  if (setting) {
    setting.value = value;
  }
}

function saveConfig() {
  emit("update-config", {
    config: config.value.map(({ key, value }) => ({ key, value })),
  });
  isConfigOpen.value = false;
}
</script>

<template>
  <div class="icebergwriter-node">
    <Handle type="target" :position="Position.Top" />
     

    <div class="node-content" @click="openConfig">{{ label }}</div>
    <Handle type="source" :position="Position.Bottom" />
    <div v-if="data?.description" class="node-description">
      {{ data.description }}
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="isConfigOpen"
      class="iceberg-config-backdrop"
      @click.self="isConfigOpen = false"
    >
      <form class="iceberg-config-dialog" @submit.prevent="saveConfig">
        <h3>Configure Iceberg Writer</h3>

        <div
          v-for="field in ICEBERG_CONFIG_FIELDS"
          :key="field.key"
          class="iceberg-config-field"
        >
          <label :for="`iceberg-${field.key}`">{{ field.label }}</label>
          <select
            v-if="field.type === 'select'"
            :id="`iceberg-${field.key}`"
            :value="getConfigValue(field.key)"
            @change="updateConfigValue(field.key, $event.target.value)"
          >
            <option v-for="option in field.options" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <input
            v-else
            :id="`iceberg-${field.key}`"
            type="text"
            :placeholder="field.placeholder"
            :value="getConfigValue(field.key)"
            @input="updateConfigValue(field.key, $event.target.value)"
          />
        </div>

        <div class="iceberg-config-actions">
          <button type="button" @click="isConfigOpen = false">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  </Teleport>
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

.node-content {
  cursor: pointer;
}

.iceberg-config-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
}

.iceberg-config-dialog {
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

.iceberg-config-dialog h3 {
  margin: 0;
}

.iceberg-config-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.iceberg-config-field label {
  font-size: 13px;
  font-weight: 600;
}

.iceberg-config-field input,
.iceberg-config-field select {
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: inherit;
  font: inherit;
}

.iceberg-config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.iceberg-config-actions button {
  padding: 7px 14px;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.iceberg-config-actions button[type="submit"] {
  background: #4f46e5;
  color: #fff;
}
</style>