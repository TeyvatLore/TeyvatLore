<template>
  <div class="ref-link">
    <a :href="href">
      <slot />
    </a>
  </div>
</template>

<script lang="ts">

import Vue from 'vue'

export default Vue.extend({
  props: { href: { type: String, default: '#' } }
})
</script>

<style lang="postcss">

.link-bg-size {
  padding-left: 5.25em;
  background-size: 100% 100%;
}

.ref-link {
  @apply p-4 link-bg-size;
  background-image: url("~@/assets/images/btn_link.png");
}

.ref-link > a {
  @apply text-white w-full;
}

.ref-link:hover {
  @apply p-4 link-bg-size;
  background-image: url("~@/assets/images/btn_link_active.png");
}

</style>
