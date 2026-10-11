<script setup>
import { ref } from "vue";
import { Handle, Position } from "@vue-flow/core";
import { Plus, Save, Trash2, X } from "@lucide/vue";
import NodeDeleteButton from "./NodeDeleteButton.vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
  label: {
    type: String,
    default: "Litrarl Column",
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update-config", "delete-node"]);
const isConfigOpen = ref(false);
const columns = ref([]);

function openConfig() {
  const savedConfig = Array.isArray(props.data?.configurations)
    ? props.data.configurations
    : [];
  columns.value = savedConfig.length
    ? savedConfig.map(({ config, value }) => ({ config, value }))
    : [{ config: "", value: "" }];
  isConfigOpen.value = true;
}

function addColumn() {
  columns.value.push({ config: "", value: "" });
}

function removeColumn(index) {
  if (columns.value.length > 1) {
    columns.value.splice(index, 1);
  }
}

function saveConfig() {
  emit("update-config", {
    configurations: columns.value.filter(({ config }) => config.trim()),
  });
  isConfigOpen.value = false;
}
</script>

<template>
  <div v-bind="$attrs" class="lit-column-node spark-narrow">
    <Handle type="target" :position="Position.Top" />
    <NodeDeleteButton @delete="emit('delete-node')" />
    <div class="node-content" @click="openConfig">{{ label }}</div>
    <Handle type="source" :position="Position.Bottom" />
    <div v-if="data?.description" class="node-description">
      {{ data.description }}
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="isConfigOpen"
      class="lit-column-config-backdrop"
      @click.self="isConfigOpen = false"
    >
      <form class="lit-column-config-dialog" @submit.prevent="saveConfig">
        <h3>Configure Literal Columns</h3>

        <div class="lit-column-config-rows">
          <div v-for="(column, index) in columns" :key="index" class="lit-column-config-row">
            <label>
              Column name
              <input v-model="column.config" type="text" placeholder="e.g. status" />
            </label>
            <label>
              Literal value
              <input v-model="column.value" type="text" placeholder="e.g. active" />
            </label>
            <button
              class="action-button"
              v-if="columns.length > 1"
              type="button"
              :aria-label="`Remove column ${index + 1}`"
              @click="removeColumn(index)"
            >
              <Trash2 aria-hidden="true" /> Remove row
            </button>
          </div>
        </div>

        <button type="button" class="lit-column-add action-button" @click="addColumn">
          <Plus aria-hidden="true" /> Add column
        </button>

        <div class="lit-column-config-actions">
          <button class="action-button" type="button" @click="isConfigOpen = false">
            <X aria-hidden="true" /> Cancel
          </button>
          <button class="action-button" type="submit">
            <Save aria-hidden="true" /> Save columns
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.lit-column-node {
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

.lit-column-config-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
}

.lit-column-config-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(560px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 24px;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  box-shadow: 0 4px 15px rgb(0 0 0 / 20%);
}

.lit-column-config-dialog h3 {
  margin: 0;
}

.lit-column-config-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lit-column-config-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: end;
  gap: 8px;
}

.lit-column-config-row label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.lit-column-config-row input {
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: inherit;
  font: inherit;
}

.lit-column-config-row button,
.lit-column-add,
.lit-column-config-actions button {
  padding: 7px 14px;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.lit-column-add {
  align-self: flex-start;
  background: #e5e7eb;
  color: #374151;
}

.lit-column-config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.lit-column-config-actions button[type="submit"] {
  background: #4f46e5;
  color: #fff;
}

@media (max-width: 560px) {
  .lit-column-config-row {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>