<script setup>
import { ref } from "vue";
import { Handle, Position } from "@vue-flow/core";
import NodeDeleteButton from "./NodeDeleteButton.vue";

const props = defineProps({
  label: {
    type: String,
    default: "Database Writer",
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update-config", "delete-node"]);
const isConfigOpen = ref(false);
const config = ref([]);
const DATABASE_TYPES = [
  { value: "mysql", label: "MySQL", driver: "com.mysql.cj.jdbc.Driver", url: "jdbc:mysql://localhost:3306/database" },
  { value: "postgresql", label: "PostgreSQL", driver: "org.postgresql.Driver", url: "jdbc:postgresql://localhost:5432/database" },
  { value: "mariadb", label: "MariaDB", driver: "org.mariadb.jdbc.Driver", url: "jdbc:mariadb://localhost:3306/database" },
  { value: "sqlserver", label: "SQL Server", driver: "com.microsoft.sqlserver.jdbc.SQLServerDriver", url: "jdbc:sqlserver://localhost:1433;databaseName=database;encrypt=true;trustServerCertificate=true" },
];
const DATABASE_CONFIG_FIELDS = [
  { config: "databaseType", label: "Database", type: "select", default: "mysql" },
  { config: "url", label: "JDBC URL", default: "" },
  { config: "dbtable", label: "Table name", placeholder: "e.g. customer_events", default: "" },
  { config: "user", label: "Username", placeholder: "Database username", default: "" },
  { config: "password", label: "Password", type: "password", default: "" },
  { config: "driver", label: "JDBC driver", default: "" },
  {
    config: "writeMode",
    label: "Write mode",
    type: "select",
    options: ["append", "overwrite", "errorifexists", "ignore"],
    default: "append",
  },
  { config: "batchsize", label: "Batch size", type: "number", default: "1000" },
];

function databaseType(value = getConfigValue("databaseType")) {
  return DATABASE_TYPES.find((database) => database.value === value) ?? DATABASE_TYPES[0];
}

function openConfig() {
  const savedConfig = Array.isArray(props.data?.configurations) ? props.data.configurations : [];
  const savedValues = Object.fromEntries(
    savedConfig.map(({ config, value }) => [config, value]),
  );
  const selectedDatabase = databaseType(savedValues.databaseType);

  config.value = DATABASE_CONFIG_FIELDS.map((field) => ({
    config: field.config,
    value: savedValues[field.config] ?? props.data?.[field.config] ??
      (field.config === "driver" ? selectedDatabase.driver : field.default),
  }));
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

function updateDatabaseType(value) {
  const oldDriver = databaseType().driver;
  const currentDriver = getConfigValue("driver");
  updateConfigValue("databaseType", value);

  if (!currentDriver || currentDriver === oldDriver) {
    updateConfigValue("driver", databaseType(value).driver);
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
  <div class="database-writer-node">
    <Handle type="target" :position="Position.Top" />
    <NodeDeleteButton @delete="emit('delete-node')" />
    <div class="node-content" @click="openConfig">{{ label }}</div>
    <Handle type="source" :position="Position.Bottom" />
  </div>

  <Teleport to="body">
    <div
      v-if="isConfigOpen"
      class="database-config-backdrop"
      @click.self="isConfigOpen = false"
    >
      <form class="database-config-dialog" @submit.prevent="saveConfig">
        <h3>Configure Database Writer</h3>

        <div
          v-for="field in DATABASE_CONFIG_FIELDS"
          :key="field.config"
          class="database-config-field"
        >
          <label :for="`database-${field.config}`">{{ field.label }}</label>
          <select
            v-if="field.type === 'select' && field.config === 'databaseType'"
            :id="`database-${field.config}`"
            :value="getConfigValue(field.config)"
            @change="updateDatabaseType($event.target.value)"
          >
            <option v-for="database in DATABASE_TYPES" :key="database.value" :value="database.value">
              {{ database.label }}
            </option>
          </select>
          <select
            v-else-if="field.type === 'select'"
            :id="`database-${field.config}`"
            :value="getConfigValue(field.config)"
            @change="updateConfigValue(field.config, $event.target.value)"
          >
            <option v-for="option in field.options" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <input
            v-else
            :id="`database-${field.config}`"
            :type="field.type ?? 'text'"
            :placeholder="field.config === 'url' ? databaseType().url : field.placeholder"
            :value="getConfigValue(field.config)"
            :min="field.type === 'number' ? 1 : undefined"
            @input="updateConfigValue(field.config, $event.target.value)"
          />
        </div>

        <div class="database-config-actions">
          <button type="button" @click="isConfigOpen = false">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.database-writer-node {
  position: relative;
  padding: 10px 15px;
  border: 2px solid #14532d;
  border-radius: 8px;
  background: #16a34a;
  color: #fff;
  font-weight: bold;
  text-align: center;
}

.node-content {
  cursor: pointer;
}

.database-config-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
}

.database-config-dialog {
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

.database-config-dialog h3 {
  margin: 0;
}

.database-config-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.database-config-field label {
  font-size: 13px;
  font-weight: 600;
}

.database-config-field input,
.database-config-field select {
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: inherit;
  font: inherit;
}

.database-config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.database-config-actions button {
  padding: 7px 14px;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.database-config-actions button[type="submit"] {
  background: #15803d;
  color: #fff;
}
</style>