<template>
  <div id="map-wrap">
    <client-only>
      <l-map
        v-if="mapReady"
        ref="mapi"
        :zoom="4"
        :center="[2576, 1742]"
        :zoom-delta="0"
        :zoom-snap="0.5"
        :max-zoom="2"
        :min-zoom="-4"
        :max-bounds="maxBounds"
        :crs="mapCRS"
        :options="{ zoomControl: false }"
      >
        <l-control>
          <div>
            <p>
              <b>Pos:</b>
              {{ posX }} {{ posY }}
            </p>
          </div>
        </l-control>
        <l-control class="nav-wrapper" position="topleft">
          <div class="flex text-white">
            <h1 class="text-xl">
              图研所
            </h1>
            <div class="flex flex-col justify-end ml-8">
              {{ currentRegionName }}
            </div>
          </div>
        </l-control>
        <l-control class="nav-wrapper" position="topleft">
          <div class="flex flex-col justify-between">
            <div class="flex flex-col location-btn">
              <button v-for="r in regions" :key="r.id" @click="selectRegion(r)">
                <img
                  name="r.name"
                  :src="getRegionButtonImage(r.id)"
                >
              </button>
            </div>
          </div>
        </l-control>
        <l-control class="nav-wrapper" position="bottomleft">
          <div id="other-btn">
            <button>二维码</button>
            <button>分享</button>
          </div>
        </l-control>
      </l-map>
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

const mapCenter = [3568, 6286]
const mapSize = [12288, 15360]

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
      mapObject: null as unknown,
      posX: 0,
      posY: 0,
      regions: [
        { id: 'mondstadt', name: '蒙德', latlng: [1700, -3800] },
        { id: 'liyue', name: '璃月', latlng: [0, 0] },
        { id: 'inazuma', name: '稻妻', latlng: [6500, 3600] },
        { id: 'dragonspine', name: '龙脊雪山', latlng: [1600, -2200] },
        { id: 'enkanomiya', name: '渊下宫', latlng: [0, 0] }
      ],
      currentRegion: 'mondstadt',
      currentRegionName: '蒙德'
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
      getTileUrl (coords: L.Coords) {
        const [x, y, z] = [coords.x, coords.y, coords.z + 13]
        return `https://assets.yuanshen.site/tiles_twt/${z}/${x}_${y}.png`
      },
      reuseTiles: true
    })

    // @ts-ignore
    this.tileLayer = new TileLayerClass('', {
      maxZoom: 10,
      minZoom: -6,
      maxNativeZoom: 0,
      minNativeZoom: -3,
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
    getRegionButtonImage (id : string) {
      const active = id === this.currentRegion ? '_active' : ''
      return require(`~/assets/images/btn_switch_${id}${active}.png`)
    },
    // switch region on map
    selectRegion ({ id, name, latlng } : { id: string, name: string, latlng: Array<Number>}) {
      this.currentRegion = id
      this.currentRegionName = name
      this.mapObject.setView(latlng, 0)
    }
  }
})
</script>

<style lang="postcss" scoped>
#map-wrap {
  height: 91vh;
}

.nav-wrapper {
  margin-left: 0;
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
</style>
