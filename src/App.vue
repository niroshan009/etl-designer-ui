<script setup>
import { ref } from 'vue'
import { VueFlow, MarkerType, useVueFlow} from '@vue-flow/core'
import DropzoneBackground from './DropzoneBackground.vue'
import Sidebar from './Sidebar.vue'
import useDragAndDrop from './useDnD'
import { log } from 'console'

const { onConnect, addEdges, onNodesChange } = useVueFlow()

const { onDragOver, onDrop, onDragLeave,  isDragOver } = useDragAndDrop()

const nodes = ref([])

// onConnect(addEdges)

onNodesChange((changes) => {
  changes.forEach((change) => {
    if (change.type === 'add') {
      console.log('Node added to pane:', change.item)
    } else {
      console.log("event type :"+change.type)
    }
  })
})

onConnect((connection) => {
  console.log('Edge connection attempted:', connection)

  // Example: Add custom styling or data to the edge before saving
  const customEdge = {
    ...connection,
    type: 'smoothstep',
    animated: true,
    markerEnd: MarkerType.ArrowClosed,
    data: { createdAt: Date.now() },
  }

  // Manually add the edge to the flow
  addEdges(customEdge)
  
  console.log('Edge successfully added!')
})
</script>


<template>
  <div   class="flow-container" @drop="onDrop">

    <VueFlow
      :nodes="nodes"
      connection-line-type="smoothstep"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >

      <DropzoneBackground
        :style="{
          backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
          transition: 'background-color 0.2s ease',
        }"
      >
      </DropzoneBackground>

    </VueFlow>

    <Sidebar />

  </div>
</template>

<style scoped>
.flow-container {
  width: 100vw;
  height: 80vh;
}
</style>
