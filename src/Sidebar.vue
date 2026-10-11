<script setup>
import useDragAndDrop from './useDnD'

const { onDragStart } = useDragAndDrop()
</script>

<template>
  <aside>
    <div class="description">Drag below components to your ETL flow</div>

    <div class="node-groups">
      <section class="node-group" aria-labelledby="source-nodes-heading">
        <h3 id="source-nodes-heading">Sources</h3>
        <div class="nodes">
          <div class="vue-flow__node-output spark-node-output spark-source" :draggable="true" @dragstart="onDragStart($event, 'csvreader')">CSV Reader</div>
        </div>
      </section>

      <section class="node-group" aria-labelledby="narrow-nodes-heading">
        <h3 id="narrow-nodes-heading">Narrow transformations</h3>
        <div class="nodes">
          <div class="vue-flow__node-output spark-node-output spark-narrow" :draggable="true" @dragstart="onDragStart($event, 'filter')">Filter</div>
          <div class="vue-flow__node-output spark-node-output spark-narrow" :draggable="true" @dragstart="onDragStart($event, 'drop-column')">Drop Columns</div>
          <div class="vue-flow__node-output spark-node-output spark-narrow" :draggable="true" @dragstart="onDragStart($event, 'lit-column')">Literal Column</div>
        </div>
      </section>

      <section class="node-group" aria-labelledby="wide-nodes-heading">
        <h3 id="wide-nodes-heading">Wide transformations</h3>
        <div class="nodes">
          <div class="vue-flow__node-output spark-node-output spark-wide" :draggable="true" @dragstart="onDragStart($event, 'join')">Join</div>
          <div class="vue-flow__node-output spark-node-output spark-wide" :draggable="true" @dragstart="onDragStart($event, 'left-anti-join')">Left Anti Join</div>
        </div>
      </section>

      <section class="node-group" aria-labelledby="sink-nodes-heading">
        <h3 id="sink-nodes-heading">Sinks</h3>
        <div class="nodes">
          <div class="vue-flow__node-output spark-node-output spark-sink" :draggable="true" @dragstart="onDragStart($event, 'icebergwriter')">Iceberg Writer</div>
          <div class="vue-flow__node-output spark-node-output spark-sink" :draggable="true" @dragstart="onDragStart($event, 'databasewriter')">Database Writer</div>
        </div>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.node-groups {
  display: grid;
  gap: 14px;
}

.node-group h3 {
  margin: 0 0 7px;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-align: left;
}

.node-group .nodes {
  display: grid;
  gap: 7px;
}

.node-group .nodes > * {
  margin: 0;
}
</style>