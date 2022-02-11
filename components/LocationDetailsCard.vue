<template>
  <div id="location-detail-card" :class="{ 'hide-card': !isDetailCardOpen }">
    <div id="location-detail-card-content-wrapper">
      <div id="location-detail-card-btn">
        <button @click="toggleLocationDetailCard()">
          <span v-if="isDetailCardOpen">></span>
          <span v-else>&#x0003C;</span>
        </button>
      </div>
      <div id="location-detail-card-content">
        <div id="detail-header">
          <img class="w-full absolute" src="~/assets/images/location_detail_card_header_pattern.png">
          <img class="w-full absolute z-10" src="~/assets/images/阳炎.png">
          <p id="card-title">
            {{ details.title }}
          </p>
        </div>
        <div id="location-detail-card-content-info">
          <div v-for="s in details.sections" :key="s.id">
            <div class="content-block">
              <h2>{{ s.title }}</h2>
              <p>{{ s.description }}</p>
            </div>
            <img class="content-block" src="~/assets/images/divider.png">
          </div>
          <div class="content-block">
            <h2>链接</h2>
            <div id="link-block">
              <div
                v-for="ref in details.refs"
                :key="ref.id"
                class="ref-link"
              >
                <a :href="ref.link">{{ ref.title }}</a>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full text-white text-lg">
          <p><span class="mx-3">&#x0003C;</span>渊下宫</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: ['details'],
  data () {
    return {
      isDetailCardOpen: true
    }
  },
  mounted () {},
  methods: {
    toggleLocationDetailCard () {
      this.isDetailCardOpen = !this.isDetailCardOpen
    }
  }
})
</script>

<style lang="postcss" scoped>
#location-detail-card {
  position: relative;
  height: auto;
  min-width: 574px;
  font-family: "HYWenHei", sans-serif;
  color: #484139;
}

#card-bg {
  @apply absolute;
  z-index: 5;
  top: -3.75em;
}

#location-detail-card-content-wrapper {
  @apply absolute flex right-0 mt-1 z-10 h-full;
  height: 100%;
}

#detail-header {
  @apply w-full relative;
  min-height: 197px;
}

#card-title {
  @apply absolute right-0 bottom-0 text-6xl text-white z-20;
  font-family: "HYWenHei", sans-serif;
}

#location-detail-card-btn {
  @apply text-4xl text-white mt-6;
}

#location-detail-card-btn > button {
  @apply py-1 pl-4 pr-0.5;
  background-color: #2e2e2e;
  border: 1px solid #948364;
  border-right: 0px;
  border-radius: 20px 0px 0px 20px;
}

#location-detail-card-content {
  @apply flex flex-col items-center relative;
  background-color: #2e2e2e;
  border: 1px solid #948364;
  width: 475px;
  height: 645px;
}

#location-detail-card-content-info {
  @apply mt-2 flex flex-col p-1 rounded-t-xl;
  width: 97%;
  background-color: #ede7de;
  flex-grow: 1;
}

.content-block {
  @apply my-1;
}

.content-block > h2 {
  @apply text-lg;
}

.content-block > p {
  @apply mx-4;
}

#link-block {
  @apply flex flex-col;
}

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

/*For hide the location details card*/
.hide-card {
  right: -39.75em;
}
</style>
