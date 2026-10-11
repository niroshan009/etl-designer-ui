<script setup>
import { ref } from "vue";
import { VueFlow, MarkerType, useVueFlow, Panel } from "@vue-flow/core";
import DropzoneBackground from "./DropzoneBackground.vue";
import CsvReaderNode from "./components/CsvReaderNode.vue";
import FilterNode from "./components/FilterNode.vue";
import IcebergWriterNode from "./components/IcebergWriterNode.vue";
import JoinNode from "./components/JoinNode.vue";
import LeftAntiJoin from "./components/LeftAntiJoin.vue";
import DropColumn from "./components/DropColumn.vue";
import LitColumn from "./components/LitColumn.vue";

import Sidebar from "./Sidebar.vue";
import useDragAndDrop from "./useDnD";
import { log } from "console";
import { debug } from "console";
import { parseMarkdown } from "comark";
import { Markdown } from "@comark/vue";

import githubLight from "@shikijs/themes/github-light";
import githubDark from "@shikijs/themes/github-dark";
import shiki from "comark/plugins/shiki";


import { VueMarkdownIt } from 'vue-markdown-shiki'


const { onConnect, addEdges, onNodesChange, removeEdges, removeNodes, updateEdge, findEdge, findNode } = useVueFlow();

const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();

const nodes = ref([]);
const edges = ref([]);
const configuration = ref([{config:"spark.sql.extensions", value: "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions"},
{config:"spark.sql.catalog.demo", value: "org.apache.iceberg.spark.SparkCatalog"},
{config:"spark.sql.catalog.demo.type", value: "rest"},
{config:"spark.sql.catalog.demo.uri", value: "http://iceberg-rest.orb.local:8181"},
{config:"spark.sql.catalog.demo.s3.endpoint", value: "http://rustfs.orb.local:9000"},
{config:"spark.sql.catalog.demo.s3.path-style-access", value: "true"},
{config:"spark.sql.catalog.demo.s3.access-key-id", value: "rustfsadmin"},
{config:"spark.sql.catalog.demo.s3.secret-access-key", value: "rustfsadmin"},
{config:"spark.sql.catalog.demo.warehouse", value: "s3://warehouse/"},
{config:"spark.hadoop.fs.s3.impl", value: "org.apache.hadoop.fs.s3a.S3AFileSystem"},
{config:"spark.hadoop.fs.s3a.endpoint", value: "http://rustfs.orb.local:9000"},
{config:"spark.hadoop.fs.s3a.access.key", value: "rustfsadmin"},
{config:"spark.hadoop.fs.s3a.secret.key", value: "rustfsadmin"},
{config:"spark.hadoop.fs.s3a.path.style.access", value: "true"},
{config:"spark.hadoop.fs.s3a.aws.credentials.provider", value: "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider"}]);

const isModalOpen = ref(false);
const isEdgeModalOpen = ref(false);
const isPopupRefData = ref(false);
const selectedNode = ref(null);
const selectedEdge = ref(null);
const edgeLabelInput = ref("");
const nodeDescriptionInput = ref("");
const scriptName = ref("");

const isOpen = ref(false);
const isLoading = ref(false);
const markdownText = ref("");

const plugins = [
  shiki({
    themes: {
      light: githubLight,
      dark: githubDark,
    },
  }),
];

const DESCRIPTIVE_NODE_TYPES = ["join", "filter", "csvreader", "icebergwriter", "left-anti-join", "drop-column"];
const KEY_VALUE_NODE_TYPE = ["lit-column"]

onNodesChange((changes) => {
  changes.forEach((change) => {
    if (change.type === "add") {
      const payload = {
        id: change.item.id,
        type: change.item.type,
        ...(change.item.type !== "csvreader" ? { description: "" } : {}),
      };
      nodes.value.push(payload);
    } else {
    }
  });
});

onConnect((connection) => {

  const customEdge = {
    ...connection,
    id: connection.source + "_" + connection.target,
    type: "step",
    label: connection.source + "_" + connection.target,
    animated: false,
    markerEnd: MarkerType.ArrowClosed,
    data: { createdAt: Date.now(),
      isRefData: false
     },
  };

  addEdges(customEdge);

  const newEdge = {
    id: connection.source + "_" + connection.target,
    source: connection.source,
    target: connection.target,
    label: connection.source + "_" + connection.target,
    isRefData: false
  };
  edges.value.push(newEdge);

  console.log("Edge successfully added!");
});

function handleEdgeClick({ edge }) {
  selectedEdge.value = edge;
  edgeLabelInput.value = edge.label || "";
  isPopupRefData.value = edge.data.isRefData;
  
  isEdgeModalOpen.value = true;
 
}
function saveEdgeData() {
  if (!selectedEdge.value) return;
  selectedEdge.value.label = edgeLabelInput.value;

  console.log("selected " + selectedEdge.value.source);
  const edg = edges.value.find(
    (i) =>
      i.source == selectedEdge.value.source &&
      i.target == selectedEdge.value.target
  );
  edg.label = edgeLabelInput.value;
  edg.source = selectedEdge.value.source;
  edg.isRefData = isPopupRefData.value;

  console.log('---------');
  console.log(edg);
 


  const existingEdge = findEdge(edg.id);
  existingEdge.animated =  edg.isRefData;
  existingEdge.data = {
    ...existingEdge.data,
    isRefData: edg.isRefData
  }

  console.log("existing edge")
  console.log(existingEdge)
  closeEdgeModal();
  

}
function closeEdgeModal() {
  isEdgeModalOpen.value = false;
  selectedEdge.value = null;
  isPopupRefData.value = false;
}
function handleNodeClick({ node }) {
  if (["csvreader", "filter", "join", "left-anti-join", "drop-column"].includes(node.type)) return;
  if (!DESCRIPTIVE_NODE_TYPES.includes(node.type)) {
    console.log(`Node type "${node.type}" skipped description edit.`);
    return;
  }

  selectedNode.value = node;
  nodeDescriptionInput.value = node.data?.description || "";
  isModalOpen.value = true;
}

function saveNodeConfig(nodeId, config) {
  const flowNode = findNode(nodeId);
  if (flowNode) {
    Object.assign(flowNode.data, config);
  }

  const nodeRecord = nodes.value.find((node) => node.id === nodeId);
  if (nodeRecord) {
    Object.assign(nodeRecord, config, {
      data: { ...nodeRecord.data, ...config },
    });
  }
}

function getJoinDatasets(nodeId) {
  const inputIds = new Set(
    edges.value
      .filter((edge) => edge.target === nodeId && edge.source !== nodeId)
      .map((edge) => edge.source),
  );

  return nodes.value
    .filter((node) => inputIds.has(node.id))
    .map((node) => ({
      id: node.id,
      label: findNode(node.id)?.data?.label ?? node.id,
    }));
}

function saveNodeData() {
  if (!selectedNode.value) return;

  if (!selectedNode.value.data) {
    selectedNode.value.data = {};
  }
  selectedNode.value.data.description = nodeDescriptionInput.value;
  const nod = nodes.value.find((i) => i.id == selectedNode.value.id);
  nod.description = nodeDescriptionInput.value;
  console.log("edited the node :" + nod.id);

  console.log(
    "Saved data for node:",
    selectedNode.value.id,
    selectedNode.value.data
  );
  closeModal();
}

function closeModal() {
  isModalOpen.value = false;
  selectedNode.value = null;
  nodeDescriptionInput.value = "";
}

function deleteEdge() {
  const edg = edges.value.find((i) => i.id = selectedEdge.value.id);
  edges.value = edges.value.filter((i) => i.id != selectedEdge.id);
  removeEdges(edg);
  closeEdgeModal();
}

function deleteNode() {
  if (!selectedNode.value) return;
  const nodeToDelete = selectedNode.value;
  edges.value = edges.value.filter((e) =>  e.source != nodeToDelete.id && e.target != nodeToDelete.id );
  nodes.value = nodes.value.filter((node) => node.id !== nodeToDelete.id)
  console.log(nodes.value);

  removeNodes(nodeToDelete, true);
  closeModal();
}

const sendData = async () => {
  const url = "http://localhost:8081/etl/create";
  const payload = {
    edges: edges.value,
    nodes: nodes.value,
    configuration: configuration.value,
    scriptName: scriptName.value
  };

  try {
    isLoading.value = true;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    markdownText.value = data;
    isOpen.value = true;
  } catch (error) {
    errorMessage.value = error.message; // Handle errors
  } finally {
    isLoading.value = false;
  }
};

const closeMDModal = () => {
  isOpen.value = false;
  markdownText.value = ""; // Clear content on close to save memory
};
const saveRow = (item, index) => {
  console.log(`Saving row at index ${index} with new data:`, item);
  // item.name and item.role already contain the updated input text here
};

const addRow = () => {
  configuration.value.push({ config: "", value: "" });
};

const submitJob = async () => {
  const url = "http://localhost:8081/etl/submitjob";
  const payload = {
    scriptName: scriptName.value
  };

  try {
    isLoading.value = true;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    await response.text();

  } catch (error) {
    errorMessage.value = error.message; // Handle errors
  } finally {
    isLoading.value = false;
  }
}
</script>


<template>
  <div class="app-layout">
    <div class="main-container">
      <!-- Flow Workspace Area -->
      <div
        class="flow-container"
        @drop="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
      >
        <VueFlow
          :nodes="nodes"
          :edges="edges"
          connection-line-type="smoothstep"
          @node-click="handleNodeClick"
          @edge-click="handleEdgeClick"
        >
          <!-- Custom Node Templates -->
          <template #node-csvreader="nodeProps">
            <CsvReaderNode
              v-bind="nodeProps"
              @update-config="saveNodeConfig(nodeProps.id, $event)"
            />
          </template>
          <template #node-filter="nodeProps">
            <FilterNode
              v-bind="nodeProps"
              @update-config="saveNodeConfig(nodeProps.id, $event)"
            />
          </template>
          <template #node-icebergwriter="nodeProps">
            <IcebergWriterNode v-bind="nodeProps" />
          </template>
          <template #node-join="nodeProps">
            <JoinNode
              v-bind="nodeProps"
              :datasets="getJoinDatasets(nodeProps.id)"
              @update-config="saveNodeConfig(nodeProps.id, $event)"
            />
          </template>
          <template #node-left-anti-join="nodeProps">
            <LeftAntiJoin
              v-bind="nodeProps"
              @update-config="saveNodeConfig(nodeProps.id, $event)"
            />
          </template>
          <template #node-drop-column="nodeProps">
            <DropColumn
              v-bind="nodeProps"
              @update-config="saveNodeConfig(nodeProps.id, $event)"
            />
          </template>
          <template #node-lit-column="nodeProps">
            <LitColumn v-bind="nodeProps" />
          </template>

          <!-- Dropzone Highlight -->
          <DropzoneBackground
            :style="{
              backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
              transition: 'background-color 0.2s ease',
            }"
          />

          <!-- Floating Overlay Panel for Sidebar & Action Buttons -->
          <Panel position="top-left" class="controls-panel">
            <Sidebar />
          </Panel>
        </VueFlow>

        <!-- Node Configuration Modal -->
        <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-content">
            <h3>Configure {{ selectedNode?.type }} Node</h3>
            <p class="node-id">ID: {{ selectedNode?.id }}</p>

            <div class="form-group">
              <label>Description / Metadata:</label>
              <textarea
                v-model="nodeDescriptionInput"
                placeholder="Enter description..."
                rows="4"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button class="btn-save" @click="deleteNode">Delete Component</button>
              <button class="btn-cancel" @click="closeModal">Cancel</button>
              <button class="btn-save" @click="saveNodeData">Save</button>
            </div>
          </div>
        </div>

        <!-- Edge Configuration Modal -->
        <div
          v-if="isEdgeModalOpen"
          class="modal-backdrop"
          @click.self="closeEdgeModal"
        >
          <div class="modal-content">
            <h3>Edit Edge ({{ selectedEdge?.id }})</h3>
            <div class="form-group">
              <label>Edge Name / Label:</label>
              <input
                v-model="edgeLabelInput"
                type="text"
                placeholder="e.g., Success Flow"
              />
              <div>
               <input type="checkbox" id="reference" v-model="isPopupRefData" />
               <label for="reference">Is Reference Dataset</label>
               </div>
            </div>
           
            <div class="modal-actions">
              <button class="btn-save" @click="deleteEdge">Delete Connector</button>
              <button class="btn-cancel" @click="closeEdgeModal">Cancel</button>
              <button class="btn-save" @click="saveEdgeData">Save</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Configurations Table Panel -->
      <div class="config-table-container">
        Script Name: <input
                  v-model="scriptName"
                  type="text"
                  placeholder="Enter Script name"
                />
        <table class="fit-table">
          <thead>
            <tr>
              <th>Configuration</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="config in configuration" :key="config.id">
              <td>
                <input
                  v-model="config.config"
                  type="text"
                  placeholder="Enter name"
                  class="cell-input" 
                />
              </td>
              <td>
                <input
                  v-model="config.value"
                  type="text"
                  placeholder="Enter value"
                  class="cell-input" 
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button class="btn-add" @click="addRow">Add Configuration</button>
        <div>
          Generate the python script
          <button class="btn-generate" @click="sendData">Generate</button>
        </div>
      </div>
    </div>

    <!-- Markdown Modal Viewer -->
    <div v-if="isOpen" class="modal-overlay" @click.self="closeMDModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeMDModal">&times;</button>
        <div class="markdown-body">
              <VueMarkdownIt :content="markdownText" />
        </div>
        <button @click="submitJob">Submit</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flow-container {
  width: 80vw;
  height: 80vh;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  padding: 24px;
  border-radius: 8px;
  width: 80vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.node-id {
  font-size: 12px;
  color: #6b7280;
  margin-top: -8px;
  margin-bottom: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.form-group textarea {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.btn-save {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
}

.main-container {
  display: flex; /* Activates Flexbox layout */
  flex-direction: row; /* Aligns children horizontally (default) */
  gap: 20px; /* Adds clean spacing between the side-by-side divs */
  width: 100%; /* Ensures the main div spans full width */
}

/* Modal overlay targeting full screen backdrop */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* The actual modal popup container box */
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 80vw;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Top right exit switch styling */
.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

/* Content spacing for the rendered markdown */
.markdown-body {
  line-height: 1.6;
  text-align: left;
}

.fetch-btn {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

/* Container Layouts */
.app-layout {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* Row layout: Workspace on left (80%), Config Panel on right (20%) */
.main-container {
  display: flex;
  flex-direction: row; /* Align side-by-side */
  width: 100%;
  height: 100%;
}

/* Main VueFlow Workspace taking 80% viewport width */
.flow-container {
  position: relative;
  width: 70vw;
  flex-basis: 70vw;
  height: 100%;
}

/* VueFlow Panel Controls Overlay */
.controls-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 10px 14px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

/* Modal Stacking */
.modal-backdrop,
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* Stacks reliably above canvas */
}

.config-table-container {
  width: 30vw;
  flex-basis: 30vw;
  height: 100%;
  overflow-y: auto; /* Adds scrollbar if table content exceeds height */
  padding: 16px;
  box-sizing: border-box;
  border-left: 1px solid #e2e8f0;
  background-color: #f8fafc;
}
.fit-table {
  width: 100%;
  table-layout: fixed; /* Prevents cells from overflowing past content bounds */
}

.cell-input {
  width: 100%;
  box-sizing: border-box; /* Includes padding & border in the 100% width calculation */
  display: block;        /* Removes baseline gap alignments */
}
</style>
