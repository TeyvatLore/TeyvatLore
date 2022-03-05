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
        <l-control id="location-detail-wrapper" position="topright">
          <LocationDetailsCard :details="markerData" />
        </l-control>
        <l-control
          class="nav-wrapper shadow-md"
          style="margin-top: 0"
          position="topleft"
        >
          <div class="flex text-white">
            <div class="flex bg-gradient-to-r from-gray-700 w-screen h-12 items-center">
              <div class="flex flex-col justify-end ml-8 text-yellow-200 text-lg">
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
        <l-control id="other-buttons" class="nav-wrapper" position="bottomleft">
          <div class="flex">
            <div class="flex flex-col">
              <button id="qr_code" />
              <button id="share" />
            </div>
            <div class="flex items-end">
              <p class="text-white">
                <b>Pos:</b>
                {{ posX }} {{ posY }}
              </p>
            </div>
          </div>
        </l-control>
      </l-map>
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { GenshinRegion, Nullable, Region } from '~/types'

const mapCenter = [3568, 6286]
const mapSize = [30720, 30720]

export default Vue.extend({
  name: 'IndexPage',
  async asyncData ({ $content }) {
    const markers = await $content('gen/markers').fetch()
    const markerData = await $content('marker/SunfireGate').fetch()
    return {
      markers: (markers as any).markers,
      markerData
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
      ] as Region[],
      currentRegion: 'mondstadt' as keyof GenshinRegion,
      currentRegionName: '蒙德' as GenshinRegion[keyof GenshinRegion],
      subRegionName: '西风教堂',
      markerData: { title: '', body: [] },
      enkanomiyaLayer: null as Nullable<L.TileLayer>
    }
  },
  watch: {
    currentRegion (newRegion: keyof GenshinRegion, oldRegion: keyof GenshinRegion) {
      if (oldRegion === 'enkanomiya' && newRegion !== 'enkanomiya') {
        // switch to teyvat
        this.enkanomiyaLayer?.removeFrom(this.mapObject)
        this.tileLayer.addTo(this.mapObject)
      } else if (oldRegion !== 'enkanomiya' && newRegion === 'enkanomiya') {
        // switch to enkanomiya
        this.tileLayer.removeFrom(this.mapObject)
        this.enkanomiyaLayer?.addTo(this.mapObject)
        this.mapObject.setMinZoom(-5)
        this.mapObject.setMaxZoom(-2)
        this.mapObject.setZoom(-5)
      }
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
        // if (this.currentRegion === 'enkanomiya') {
        // return `https://cdn.jsdelivr.net/gh/TeyvatLore/MapTile@gh-pages/enkanomiya/${z}/${y}_${x}.png`
        // return `https://raw.githubusercontent.com/TeyvatLore/MapTile/gh-pages/enkanomiya/${z}/${y}_${x}.png`
        // } else {
        return `https://cdn.jsdelivr.net/gh/TeyvatLore/MapTile@gh-pages/teyvat/${z}/${x}_${y}.jpg`
        // return `https://teyvatlore.github.io/MapTile/teyvat/${z}/${x}_${y}.jpg`
        // }
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

    // initialize enkanomiyaLayer
    this.enkanomiyaLayer = new this.$L.TileLayer('', {
      maxNativeZoom: -2,
      minNativeZoom: -5,
      maxZoom: -2,
      minZoom: -5,
      bounds: this.$L.latLngBounds(
        this.$L.latLng(-mapCenter[0], -mapCenter[1]),
        this.$L.latLng(mapSize[0] - mapCenter[0], mapSize[1] - mapCenter[1])
      )
    })
    this.enkanomiyaLayer!.getTileUrl = (coords) => {
      const [x, y, z] = [coords.x, coords.y, coords.z + 15]
      return `https://cdn.jsdelivr.net/gh/TeyvatLore/MapTile@gh-pages/enkanomiya/${z}/${y}_${x}.png`
    }

    this.mapReady = true
    this.$nextTick(() => {
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
    selectRegion ({ id, name, latlng } : Region) {
      this.currentRegion = id
      this.currentRegionName = name

      this.mapObject.setView(latlng, -1)
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

.nav-wrapper {
  @apply m-0;
  font-family: "HYWenHei", sans-serif;
}

#other-buttons button {
  height: 36px;
  width: 36px;
}

.location-btn img {
  width: 60px;
  height: 60px;
}

.sideNav {
  @apply flex flex-col;
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
