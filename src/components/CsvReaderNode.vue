<script setup>
import { ref } from "vue";
import { Handle, Position } from "@vue-flow/core";
import { Save, X } from "@lucide/vue";
import NodeDeleteButton from "./NodeDeleteButton.vue";

defineOptions({ inheritAttrs: false });

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

const emit = defineEmits(["update-config", "delete-node"]);
const isConfigOpen = ref(false);
const config = ref([]);
const CSV_CONFIG_FIELDS = [
  { config: "filePath", label: "CSV file path", placeholder: "s3://bucket/path/file.csv", default: "" },
  { config: "delimiter", label: "Delimiter", placeholder: ",", default: "," },
  { config: "hasHeader", label: "First row contains headers", type: "checkbox", default: true },
  { config: "inferSchema", label: "Infer schema", type: "checkbox", default: true },
];

function openConfig() {
  const savedConfig = Array.isArray(props.data?.configurations) ? props.data.configurations : [];
  config.value = CSV_CONFIG_FIELDS.map((field) => {
    const setting = savedConfig.find((item) => item.config === field.config);
    return {
      config: field.config,
      value: setting?.value ?? props.data?.[field.config] ?? field.default,
    };
  });
  isConfigOpen.value = true;
}

function getConfigValue(configName) {
  return config.value.find((setting) => setting.config === configName)?.value;
}

function updateConfigValue(configName, value) {
  const setting = config.value.find((item) => item.config === configName);
  if (setting) {
    setting.value = value;
  }
}

function saveConfig() {
  emit("update-config", {
    configurations: config.value.map(({ config, value }) => ({ config, value })),
  });
  isConfigOpen.value = false;
}
</script>

<template>
  <div v-bind="$attrs" class="csv-reader-node spark-source">
    <Handle type="target" :position="Position.Top" />
    <NodeDeleteButton @delete="emit('delete-node')" />
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
          :key="field.config"
          class="csv-config-field"
        >
          <label :for="`csv-${field.config}`">{{ field.label }}</label>
          <input
            v-if="field.type === 'checkbox'"
            :id="`csv-${field.config}`"
            type="checkbox"
            :checked="getConfigValue(field.config) === true || getConfigValue(field.config) === 'true'"
            @change="updateConfigValue(field.config, $event.target.checked)"
          />
          <input
            v-else
            :id="`csv-${field.config}`"
            type="text"
            :placeholder="field.placeholder"
            :value="getConfigValue(field.config)"
            @input="updateConfigValue(field.config, $event.target.value)"
          />
        </div>

        <div class="csv-config-actions">
          <button class="action-button" type="button" @click="isConfigOpen = false">
            <X aria-hidden="true" /> Cancel
          </button>
          <button class="action-button" type="submit">
            <Save aria-hidden="true" /> Save settings
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.csv-reader-node {
  position: relative;
  padding: 10px 15px;
  border-radius: 8px;
  background: var(--spark-node-background);
  color: #fff;
  font-weight: bold;
  border: 2px solid var(--spark-node-border);
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