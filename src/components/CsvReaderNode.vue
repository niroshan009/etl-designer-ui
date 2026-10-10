<script setup>
import { ref } from "vue";
import { Handle, Position } from "@vue-flow/core";

const props = defineProps({
  label: {
    type: String,
    default: "CSV Reader",
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update-config"]);
const isConfigOpen = ref(false);
const config = ref([]);
const CSV_CONFIG_FIELDS = [
  { key: "filePath", label: "CSV file path", placeholder: "s3://bucket/path/file.csv", default: "" },
  { key: "delimiter", label: "Delimiter", placeholder: ",", default: "," },
  { key: "hasHeader", label: "First row contains headers", type: "checkbox", default: true },
  { key: "inferSchema", label: "Infer schema", type: "checkbox", default: true },
];

function openConfig() {
  const savedConfig = Array.isArray(props.data?.config) ? props.data.config : [];
  config.value = CSV_CONFIG_FIELDS.map((field) => {
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
  <div class="csv-reader-node">
    <Handle type="target" :position="Position.Top" />
    <div class="node-content" @click="openConfig">📄 {{ label }}</div>
    <Handle type="source" :position="Position.Bottom" />
  </div>

  <Teleport to="body">
    <div
      v-if="isConfigOpen"
      class="csv-config-backdrop"
      @click.self="isConfigOpen = false"
    >
      <form class="csv-config-dialog" @submit.prevent="saveConfig">
        <h3>Configure CSV Reader</h3>

        <div
          v-for="field in CSV_CONFIG_FIELDS"
          :key="field.key"
          class="csv-config-field"
        >
          <label :for="`csv-${field.key}`">{{ field.label }}</label>
          <input
            v-if="field.type === 'checkbox'"
            :id="`csv-${field.key}`"
            type="checkbox"
            :checked="getConfigValue(field.key) === true || getConfigValue(field.key) === 'true'"
            @change="updateConfigValue(field.key, $event.target.checked)"
          />
          <input
            v-else
            :id="`csv-${field.key}`"
            type="text"
            :placeholder="field.placeholder"
            :value="getConfigValue(field.key)"
            @input="updateConfigValue(field.key, $event.target.value)"
          />
        </div>

        <div class="csv-config-actions">
          <button type="button" @click="isConfigOpen = false">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  </Teleport>
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

.node-content {
  cursor: pointer;
}

.csv-config-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
}

.csv-config-dialog {
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

.csv-config-dialog h3 {
  margin: 0;
}

.csv-config-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.csv-config-field label,
.csv-config-checkbox {
  font-size: 13px;
  font-weight: 600;
}

.csv-config-field input,
.csv-config-field textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: inherit;
  font: inherit;
}

.csv-config-field textarea {
  resize: vertical;
}

.csv-config-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.csv-config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.csv-config-actions button {
  padding: 7px 14px;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.csv-config-actions button[type="submit"] {
  background: #4f46e5;
  color: #fff;
}
</style>