<script setup>
const emit = defineEmits(["delete"]);
</script>

<template>
  <button
    type="button"
    class="node-delete-button nodrag nopan"
    aria-label="Delete node"
    title="Delete node"
    @pointerdown.stop
    @mousedown.stop
    @click.stop.prevent="emit('delete')"
  >
    ×
  </button>
</template>

<style>
.node-delete-button {
  position: absolute;
  top: -9px;
  right: -9px;
  z-index: 10;
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  padding: 0;
  border: 1px solid #fff;
  border-radius: 50%;
  background: #dc2626;
  color: #fff;
  font: inherit;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.node-delete-button:hover {
  background: #b91c1c;
}
</style>