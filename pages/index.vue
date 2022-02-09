<template>
  <div id="map-wrap">
    <client-only>
      <l-map
        v-if="mapReady"
        ref="mapi"
        :zoom="-3"
        :center="[2576, 1742]"
        :zoom-delta="0"
        :zoom-snap="0.5"
        :max-zoom="2"
        :min-zoom="-4"
        :max-bounds="maxBounds"
        :crs="mapCRS"
        :options="{ zoomControl: false }"
      >
        <l-control
          id="location-detail-wrapper"
          :class="!isDetailCardOpen && 'hide-card'"
          position="topright"
        >
          <div id="location-detail-card">
            <img id="card-bg" src="~/assets/images/location_details_bg.png">
            <div id="location-detail-card-content-wrapper">
              <div id="location-detail-card-btn">
                <button @click="toggleLocationDetailCard()">
                  >
                </button>
              </div>
              <div id="location-detail-card-content">
                <div id="detail-header">
                  <img class="w-full absolute" src="~/assets/images/阳炎.png">
                  <p id="card-title">
                    阳炎之门
                  </p>
                </div>
                <div id="location-detail-card-content-info">
                  <div class="content-block">
                    <h2>阳炎之门</h2>
                    <p>
                      阳炎之门是一扇利用阳炎现象制成的用于开起门后甬道的门。
                    </p>
                  </div>
                  <img
                    class="content-block"
                    src="~/assets/images/divider.png"
                  >
                  <div class="content-block">
                    <h2>建筑风格</h2>
                    <p>
                      阳炎之门的整体样式为石砌方柱拱形门，上有金纹装饰和浮雕，并且有幻想的荧光海底植物攀附其上，增加了建筑的历史厚重感。
                    </p>
                  </div>
                  <img
                    class="content-block"
                    src="~/assets/images/divider.png"
                  >
                  <div class="content-block">
                    <h2>链接</h2>
                    <div id="link-block">
                      <div class="ref-link">
                        <a>阳炎之门考据1</a>
                      </div>
                      <div class="ref-link">
                        <a>阳炎之门考据2</a>
                      </div>
                      <div class="ref-link">
                        <a>阳炎之门考据3</a>
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
        </l-control>
        <l-control
          class="nav-wrapper shadow-md"
          style="margin-top: 0"
          position="topleft"
        >
          <div class="flex text-white">
            <div
              class="
                flex
                bg-gradient-to-r
                from-gray-700
                w-screen
                h-12
                items-center
              "
            >
              <div
                class="flex flex-col justify-end ml-8 text-yellow-200 text-lg"
              >
                {{ currentRegionName }} > {{ subRegionName }}
              </div>
            </div>
          </div>
        </l-control>
        <l-control class="nav-wrapper" position="topleft">
          <div class="flex flex-col justify-between">
            <div class="flex flex-col location-btn">
              <button v-for="r in regions" :key="r.id" @click="selectRegion(r)">
                <img name="r.name" :src="getRegionButtonImage(r.id)">
              </button>
            </div>
          </div>
        </l-control>
        <l-control position="topleft">
          <div>
            <p class="text-white">
              <b>Pos:</b>
              {{ posX }} {{ posY }}
            </p>
          </div>
        </l-control>
        <l-control id="other-buttons" class="nav-wrapper" position="bottomleft">
          <div class="flex flex-col">
            <button id="qr_code" />
            <button id="share" />
          </div>
        </l-control>
      </l-map>
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

const mapCenter = [3568, 6286]
const mapSize = [30720, 30720]

export default Vue.extend({
  name: 'IndexPage',
  async asyncData ({ $content }) {
    const markers = await $content('markers').fetch()
    return {
      markers: (markers as any).markers
    }
  },
  data () {
    return {
      maxBounds: null as unknown as L.LatLngBounds,
      mapCRS: null as unknown as L.CRS,
      tileLayer: null as unknown as L.TileLayer,
      mapReady: false,
      mapObject: null as unknown as L.Map,
      posX: 0,
      posY: 0,
      regions: [
        { id: 'mondstadt', name: '蒙德', latlng: [1700, -3800] },
        { id: 'liyue', name: '璃月', latlng: [0, 0] },
        { id: 'inazuma', name: '稻妻', latlng: [6500, 3600] },
        { id: 'dragonspine', name: '龙脊雪山', latlng: [1600, -2200] },
        { id: 'enkanomiya', name: '渊下宫', latlng: [-1000, -4700] }
      ],
      currentRegion: 'mondstadt',
      currentRegionName: '蒙德',
      subRegionName: '西风教堂',
      isDetailCardOpen: true
    }
  },
  mounted () {
    this.maxBounds = this.$L.latLngBounds(
      this.$L.latLng(-mapCenter[0] - 10000, -mapCenter[1] - 10000),
      this.$L.latLng(
        mapSize[0] - mapCenter[0] + 10000,
        mapSize[1] - mapCenter[1] + 10000
      )
    )

    this.mapCRS = this.$L.Util.extend({}, this.$L.CRS.Simple, {
      transformation: new this.$L.Transformation(1, 0, 1, 0),
      projection: {
        project: (latlng: L.LatLng) => {
          return new this.$L.Point(
            latlng.lat + mapCenter[0],
            latlng.lng + mapCenter[1]
          )
        },
        unproject: (point: L.Coords) => {
          return new this.$L.LatLng(
            point.x - mapCenter[0],
            point.y - mapCenter[1]
          )
        }
      },
      bounds: this.$L.bounds(
        this.$L.point(0, 0),
        this.$L.point(mapSize[0], mapSize[1])
      )
    })

    const TileLayerClass = this.$L.TileLayer.extend({
      getTileUrl: (coords: L.Coords) => {
        const [x, y, z] = [coords.x, coords.y, coords.z + 15]
        if (this.currentRegion === 'enkanomiya') {
          if (x >= 0 && x <= 3 && y >= 0 && y <= 3) {
            return `enkanomiya/${x}_${y}.png`
          } else {
            return 'enkanomiya/3_3.png'
          }
        } else {
          return `https://teyvatlore.github.io/MapTile/teyvat/${z}/${x}_${y}.jpg`
        }
      },
      reuseTiles: true
    })

    // @ts-ignore
    this.tileLayer = new TileLayerClass('', {
      maxZoom: 10,
      minZoom: -8,
      maxNativeZoom: 0,
      minNativeZoom: -8,
      bounds: this.$L.latLngBounds(
        this.$L.latLng(-mapCenter[0], -mapCenter[1]),
        this.$L.latLng(mapSize[0] - mapCenter[0], mapSize[1] - mapCenter[1])
      )
    })

    this.mapReady = true
    this.$nextTick(function () {
      const mapObject = (this.$refs.mapi as any).mapObject
      mapObject.addLayer(this.tileLayer)
      for (const m of (this as any).markers) {
        this.$L
          .marker((m as any).pos, { title: (m as any).name })
          .addTo(mapObject)
      }
      mapObject.on('mousemove', (e: L.LeafletMouseEvent) => {
        this.posX = e.latlng.lat
        this.posY = e.latlng.lng
      })
      // Make map object can be used in methods
      this.mapObject = mapObject
    })
  },
  methods: {
    getRegionButtonImage (id: string) {
      const active = id === this.currentRegion ? '_active' : ''
      return require(`~/assets/images/btn_switch_${id}${active}.png`)
    },
    // switch region on map
    selectRegion ({
      id,
      name,
      latlng
    }: {
      id: string;
      name: string;
      latlng: number[];
    }) {
      this.currentRegion = id
      this.currentRegionName = name

      this.mapObject.setView(latlng as [number, number], -1)

      // temp zoom level to show enkanomiya
      if (id === 'enkanomiya') {
        this.mapObject.setZoom(-2)
      }
    },
    toggleLocationDetailCard () {
      this.isDetailCardOpen = !this.isDetailCardOpen
    }
  }
})
</script>

<style lang="postcss" scoped>
#map-wrap {
  height: 91vh;
}

#location-detail-wrapper {
  @apply m-0 relative;
}

#location-detail-card {
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
  @apply absolute flex right-0 mt-1 z-10;
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

#location-detail-card-content {
  @apply flex flex-col items-center relative;
  width: 475px;
  height: 645px;
}

#location-detail-card-content-info {
  @apply mt-2 flex flex-col p-1;
  width: 97%;
  background-color: #ede7de;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
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
  background-size: auto;
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

.nav-wrapper {
  margin: 0;
  font-family: "HYWenHei", sans-serif;
}

#other-buttons button {
  height: 36px;
  width: 36px;
}

#nav {
  @apply flex flex-col w-screen;
  height: 147px;
  background: url("~@/assets/images/nav_logo_bg.png") no-repeat;
}

.location-btn img {
  width: 60px;
  height: 60px;
}

.sideNav {
  @apply flex flex-col;
  /* avoid use inline color, use color palette */
  background-color: rgba(66, 101, 136, 0.5);
}

#qr_code {
  background: url("~@/assets/images/btn_qrcode.png") no-repeat;
}

#qr_code:hover {
  background: url("~@/assets/images/btn_qrcode_active.png") no-repeat;
}

#share {
  background: url("~@/assets/images/btn_share.png") no-repeat;
}

#share:hover {
  background: url("~@/assets/images/btn_share_active.png") no-repeat;
}
</style>
