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

const { onConnect, addEdges, onNodesChange } = useVueFlow();

const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();

const nodes = ref([]);
const edges = ref([]);


const isModalOpen = ref(false)
const selectedNode = ref(null)
const nodeDescriptionInput = ref('')

const DESCRIPTIVE_NODE_TYPES = ['join', 'filter'] // Add/remove types here
// onConnect(addEdges)

onNodesChange((changes) => {
  changes.forEach((change) => {
    if (change.type === "add") {
      console.log("Node added to pane:", change.item);
    } else {
      console.log("event type :" + change.type);
    }
  });
});

onConnect((connection) => {
  console.log("Edge connection attempted:", connection);

  // Example: Add custom styling or data to the edge before saving
  const customEdge = {
    ...connection,
    type: "smoothstep",
    animated: true,
    markerEnd: MarkerType.ArrowClosed,
    data: { createdAt: Date.now() },
  };

  addEdges(customEdge);
  edges.value.push(customEdge)
  console.log(edges);

  console.log("Edge successfully added!");
});

function handleNodeClick({ node }) {
  if (!DESCRIPTIVE_NODE_TYPES.includes(node.type)) {
    console.log(`Node type "${node.type}" skipped description edit.`)
    return
  }
  selectedNode.value = node
  nodeDescriptionInput.value = node.data?.description || ''
  isModalOpen.value = true
}

function saveNodeData() {
  if (!selectedNode.value) return

  if (!selectedNode.value.data) {
    selectedNode.value.data = {}
  }
  selectedNode.value.data.description = nodeDescriptionInput.value
  console.log('Saved data for node:', selectedNode.value.id, selectedNode.value.data)
  closeModal()
}

function closeModal() {
  isModalOpen.value = false
  selectedNode.value = null
  nodeDescriptionInput.value = ''
}
</script>


<template>
  <div class="flow-container" @drop="onDrop">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      @node-click="handleNodeClick"
      connection-line-type="smoothstep"
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

  </div>
</template>

<style scoped>
.flow-container {
  width: 100vw;
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
  width: 340px;
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
</style>
