<script setup>
import { ref } from "vue";
import { Handle, Position } from "@vue-flow/core";
import { Save, X } from "@lucide/vue";
import NodeDeleteButton from "./NodeDeleteButton.vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
  label: {
    type: String,
    default: "Left Anti Join",
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update-config", "delete-node"]);
const isConfigOpen = ref(false);
const joinColumn = ref("");

function openConfig() {
  const savedConfig = Array.isArray(props.data?.configurations) ? props.data.configurations : [];
  joinColumn.value =
    savedConfig.find((setting) => setting.config === "joinColumn")?.value ??
    props.data?.joinColumn ?? "";
  isConfigOpen.value = true;
}

function saveConfig() {
  emit("update-config", {
    configurations: [{ config: "joinColumn", value: joinColumn.value }],
  });
  isConfigOpen.value = false;
}
</script>

<template>
  <div v-bind="$attrs" class="left-anti-join-node spark-wide">
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
      class="anti-join-config-backdrop"
      @click.self="isConfigOpen = false"
    >
      <form class="anti-join-config-dialog" @submit.prevent="saveConfig">
        <h3>Configure Left Anti Join</h3>

        <div class="anti-join-config-field">
          <label for="anti-join-column">Join column</label>
          <input
            id="anti-join-column"
            v-model="joinColumn"
            type="text"
            placeholder="e.g. customer_id"
          />
        </div>

        <div class="anti-join-config-actions">
          <button class="action-button" type="button" @click="isConfigOpen = false">
            <X aria-hidden="true" /> Cancel
          </button>
          <button class="action-button" type="submit">
            <Save aria-hidden="true" /> Save join settings
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.left-anti-join-node {
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

.anti-join-config-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
}

.anti-join-config-dialog {
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

.anti-join-config-dialog h3 {
  margin: 0;
}

.anti-join-config-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.anti-join-config-field label {
  font-size: 13px;
  font-weight: 600;
}

.anti-join-config-field input {
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: inherit;
  font: inherit;
}

.anti-join-config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.anti-join-config-actions button {
  padding: 7px 14px;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.anti-join-config-actions button[type="submit"] {
  background: #4f46e5;
  color: #fff;
}
</style>