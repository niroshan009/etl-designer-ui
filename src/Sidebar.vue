<script setup>
import useDragAndDrop from './useDnD'

const { onDragStart } = useDragAndDrop()
</script>

<template>
  <aside>
    <div class="description">Drag below components to yout ETL flow</div>

    <div class="nodes">
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'csvreader')">CSV Reader</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'filter')">Filter</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'icebergwriter')">Iceberg Writer</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'join')">Join</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'left-anti-join')">Left Anti Join</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'drop-column')">Drop Columns</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'lit-column')">Litaral Column</div>
    </div>
  </aside>
</template>