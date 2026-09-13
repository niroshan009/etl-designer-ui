<script setup>
import useDragAndDrop from './useDnD'

const { onDragStart } = useDragAndDrop()
</script>

<template>
  <aside>
    <div class="description">You can drag these nodes to the pane.</div>

    <div class="nodes">
      <div class="vue-flow__node-input" :draggable="true" @dragstart="onDragStart($event, 'input')">Read CSV</div>

      <div class="vue-flow__node-default" :draggable="true" @dragstart="onDragStart($event, 'default')">Filter</div>

      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Save To Iceberg</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'csvreader')">CSV Reader</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'filter')">Filter</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'icebergwriter')">Iceberg Writer</div>



    </div>
  </aside>
</template>