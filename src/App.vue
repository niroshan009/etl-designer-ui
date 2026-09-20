<script setup>
import { ref } from "vue";
import { VueFlow, MarkerType, useVueFlow } from "@vue-flow/core";
import DropzoneBackground from "./DropzoneBackground.vue";
import CsvReaderNode from "./components/CsvReaderNode.vue";
import FilterNode from "./components/FilterNode.vue";
import IcebergWriterNode from "./components/IcebergWriterNode.vue";
import JoinNode from "./components/JoinNode.vue";

import Sidebar from "./Sidebar.vue";
import useDragAndDrop from "./useDnD";
import { log } from "console";
import { debug } from "console";
import { parseMarkdown } from "comark";
import { Markdown } from "@comark/vue";

import githubLight from "@shikijs/themes/github-light";
import githubDark from "@shikijs/themes/github-dark";
import shiki from 'comark/plugins/shiki'


const { onConnect, addEdges, onNodesChange } = useVueFlow();

const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();

const nodes = ref([]);
const edges = ref([]);
const configuration = ref([]);

const isModalOpen = ref(false);
const isEdgeModalOpen = ref(false);
const selectedNode = ref(null);
const selectedEdge = ref(null);
const edgeLabelInput = ref("");
const nodeDescriptionInput = ref("");

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

const DESCRIPTIVE_NODE_TYPES = ["join", "filter", "csvreader", "icebergwriter"];

onNodesChange((changes) => {
  changes.forEach((change) => {
    if (change.type === "add") {
      console.log("Node added to pane:", change.item);
      console.log(change.item.id);
      const payload = {
        id: change.item.id,
        type: change.item.type,
        description: "",
      };
      nodes.value.push(payload);
    } else {
      console.log("event type :" + change.type);
    }
  });
});

onConnect((connection) => {
  console.log("Edge connection attempted:", connection);

  const customEdge = {
    ...connection,
    type: "smoothstep",
    label: connection.source + "_" + connection.target,
    animated: true,
    markerEnd: MarkerType.ArrowClosed,
    data: { createdAt: Date.now() },
  };

  addEdges(customEdge);

  const newEdge = {
    source: connection.source,
    target: connection.target,
    label: connection.source + "_" + connection.target,
  };
  edges.value.push(newEdge);
  console.log(customEdge);

  console.log("Edge successfully added!");
});

function handleEdgeClick({ edge }) {
  selectedEdge.value = edge;
  edgeLabelInput.value = edge.label || "";
  isEdgeModalOpen.value = true;
  console.log(selectedEdge);
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

  console.log("=====");
  console.log(edg);

  closeEdgeModal();
}
function closeEdgeModal() {
  isEdgeModalOpen.value = false;
  selectedEdge.value = null;
}
function handleNodeClick({ node }) {
  if (!DESCRIPTIVE_NODE_TYPES.includes(node.type)) {
    console.log(`Node type "${node.type}" skipped description edit.`);
    return;
  }
  selectedNode.value = node;
  nodeDescriptionInput.value = node.data?.description || "";
  isModalOpen.value = true;
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

const sendData = async () => {
  console.log("sending data");
  console.log(edges.value);
  console.log(nodes.value);
  console.log(configuration.value);

  const url = "http://localhost:8080/etl/create";
  const payload = {
    edges: edges.value,
    nodes: nodes.value,
    configuration: configuration.value,
  };

  console.log(payload);
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
    console.log(data);
    markdownText.value = await parseMarkdown(data, {
      plugins: [shiki()],
    });
    isOpen.value = true;
  } catch (error) {
    console.log("error occured");
    console.log(error);
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
</script>


<template>
  <div class="main-container">
    <div class="flow-container" @drop="onDrop">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        @node-click="handleNodeClick"
        connection-line-type="smoothstep"
        @edge-click="handleEdgeClick"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
      >
        <template #node-csvreader="nodeProps">
          <CsvReaderNode v-bind="nodeProps" />
        </template>
        <template #node-filter="nodeProps">
          <FilterNode v-bind="nodeProps" />
        </template>
        <template #node-icebergwriter="nodeProps">
          <IcebergWriterNode v-bind="nodeProps" />
        </template>
        <template #node-join="nodeProps">
          <JoinNode v-bind="nodeProps" />
        </template>
        <DropzoneBackground
          :style="{
            backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
            transition: 'background-color 0.2s ease',
          }"
        >
        </DropzoneBackground>
      </VueFlow>

      <Sidebar />
      <button @click="sendData">Generate</button>

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
            <button class="btn-cancel" @click="closeModal">Cancel</button>
            <button class="btn-save" @click="saveNodeData">Save</button>
          </div>
        </div>
      </div>

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
          </div>
          <div class="modal-actions">
            <button @click="closeEdgeModal">Cancel</button>
            <button class="btn-save" @click="saveEdgeData">Save</button>
          </div>
        </div>
      </div>
    </div>
    <div>
      <table>
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
                type="text"
                v-model="config.config"
                placeholder="Enter name"
              />
            </td>
            <td>
              <input
                type="text"
                v-model="config.value"
                placeholder="Enter role"
              />
            </td>
          </tr>
        </tbody>
        <button @click="addRow()">Add Configuration</button>
      </table>
    </div>
  </div>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeMDModal">
    <div class="modal-content">
      <!-- Close Button -->
      <button class="close-btn" @click="closeMDModal">&times;</button>

      <!-- Markdown View Area -->
      <div class="markdown-body">
        <Suspense>
          <Markdown :plugins="plugins" :value="markdownText" />
        </Suspense>
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
  max-width: 600px;
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
</style>
