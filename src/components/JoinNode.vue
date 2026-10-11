<script setup>
import { ref } from "vue";
import { Handle, Position } from "@vue-flow/core";
import NodeDeleteButton from "./NodeDeleteButton.vue";

const props = defineProps({
  label: {
    type: String,
    default: "Join",
  },
  datasets: {
    type: Array,
    default: () => [],
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update-config", "delete-node"]);
const isConfigOpen = ref(false);
const conditions = ref([]);

function newConditionId() {
  return `condition-${crypto.randomUUID()}`;
}

function newCondition(logicalOperator = null) {
  return {
    id: newConditionId(),
    leftDataset: props.datasets[0]?.id ?? "",
    leftColumn: "",
    rightDataset: props.datasets[1]?.id ?? "",
    rightColumn: "",
    logicalOperator,
  };
}

function parseDatasetColumn(reference) {
  const dataset = [...props.datasets]
    .sort((left, right) => right.id.length - left.id.length)
    .find(({ id }) => reference.startsWith(`${id}.`));

  if (dataset) {
    return {
      dataset: dataset.id,
      column: reference.slice(dataset.id.length + 1),
    };
  }

  const separator = reference.indexOf(".");
  return separator < 0
    ? { dataset: "", column: reference }
    : { dataset: reference.slice(0, separator), column: reference.slice(separator + 1) };
}

function parseConditionExpression(expression, firstConditionId = newConditionId()) {
  const parts = expression.split(/\s+(AND|OR)\s+/);

  return parts.filter((_, index) => index % 2 === 0).map((part, index) => {
    const [leftReference = "", rightReference = ""] = part.split(" = ");
    const left = parseDatasetColumn(leftReference);
    const right = parseDatasetColumn(rightReference);

    return {
      id: index === 0 ? firstConditionId : newConditionId(),
      leftDataset: left.dataset,
      leftColumn: left.column,
      rightDataset: right.dataset,
      rightColumn: right.column,
      logicalOperator: index === 0 ? null : parts[index * 2 - 1] ?? "AND",
    };
  });
}

function openConfig() {
  const savedConfig = Array.isArray(props.data?.configurations) ? props.data.configurations : [];
  const conditionEntries = savedConfig.filter(
    (setting) =>
      setting.config?.startsWith("condition-") &&
      !setting.config.endsWith(".operator") &&
      typeof setting.value === "string",
  );

  if (conditionEntries.length) {
    conditions.value = conditionEntries.map((entry, index) => {
      const conditionId = entry.config;
      const operatorSetting = savedConfig.find(
        (setting) => setting.config === `${conditionId}.operator`,
      );

      return {
        ...parseConditionExpression(entry.value, conditionId)[0],
        logicalOperator: index === 0
          ? null
          : operatorSetting?.value ?? "AND",
      };
    });
  } else {
    conditions.value = [newCondition()];
  }
  isConfigOpen.value = true;
}

function addCondition() {
  conditions.value.push(newCondition("AND"));
}

function removeCondition(index) {
  if (conditions.value.length > 1) {
    conditions.value.splice(index, 1);
  }
}

function saveConfig() {
  const configurations = conditions.value.flatMap(
    ({ id, leftDataset, leftColumn, rightDataset, rightColumn, logicalOperator }, index) => [
      {
        config: id,
        value: `${leftDataset}.${leftColumn} = ${rightDataset}.${rightColumn}`,
      },
      ...(index > 0
        ? [{ config: `${id}.operator`, value: logicalOperator }]
        : []),
    ],
  );

  emit("update-config", {
    configurations,
  });
  isConfigOpen.value = false;
}
</script>

<template>
  <div class="join-node">
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
      class="join-config-backdrop"
      @click.self="isConfigOpen = false"
    >
      <form class="join-config-dialog" @submit.prevent="saveConfig">
        <h3>Configure Join</h3>

        <div class="join-conditions">
          <div
            v-for="(condition, index) in conditions"
            :key="index"
            class="join-condition"
          >
            <label v-if="index > 0" :for="`join-operator-${index}`">Combine with</label>
            <select
              v-if="index > 0"
              :id="`join-operator-${index}`"
              v-model="condition.logicalOperator"
              aria-label="Condition operator"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>

            <div class="join-condition-fields">
              <label>
                Dataset 1
                <select v-model="condition.leftDataset" required>
                  <option value="" disabled>Select dataset</option>
                  <option
                    v-for="dataset in datasets"
                    :key="dataset.id"
                    :value="dataset.id"
                    :disabled="dataset.id === condition.rightDataset"
                  >
                    {{ dataset.label }}
                  </option>
                </select>
                Column
                <input v-model="condition.leftColumn" type="text" placeholder="e.g. customer_id" required />
              </label>
              <span class="join-equals">=</span>
              <label>
                Dataset 2
                <select v-model="condition.rightDataset" required>
                  <option value="" disabled>Select dataset</option>
                  <option
                    v-for="dataset in datasets"
                    :key="dataset.id"
                    :value="dataset.id"
                    :disabled="dataset.id === condition.leftDataset"
                  >
                    {{ dataset.label }}
                  </option>
                </select>
                Column
                <input v-model="condition.rightColumn" type="text" placeholder="e.g. id" required />
              </label>
              <button
                v-if="conditions.length > 1"
                type="button"
                class="join-remove-condition"
                :aria-label="`Remove condition ${index + 1}`"
                @click="removeCondition(index)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <button type="button" class="join-add-condition" @click="addCondition">
          Add condition
        </button>

        <div class="join-config-actions">
          <button type="button" @click="isConfigOpen = false">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.join-node {
  position: relative;
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

.join-config-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
}

.join-config-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(640px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 24px;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  box-shadow: 0 4px 15px rgb(0 0 0 / 20%);
}

.join-config-dialog h3 {
  margin: 0;
}

.join-conditions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.join-condition {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.join-condition select,
.join-condition-fields input {
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: inherit;
  font: inherit;
}

.join-condition-fields {
  display: flex;
  align-items: end;
  gap: 8px;
}

.join-condition-fields label {
  flex: 1 1 0;
  min-width: 0;
}

.join-condition-fields label,
.join-condition > label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.join-equals {
  padding-bottom: 8px;
  font-weight: 700;
}

.join-remove-condition,
.join-add-condition,
.join-config-actions button {
  padding: 7px 14px;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.join-add-condition {
  align-self: flex-start;
  background: #e5e7eb;
  color: #374151;
}

.join-config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.join-config-actions button[type="submit"] {
  background: #4f46e5;
  color: #fff;
}

@media (max-width: 560px) {
  .join-condition-fields {
    flex-direction: column;
    align-items: stretch;
  }

  .join-equals {
    padding: 0;
  }
}
</style>