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
          <div id="top-nav">
            <h1>图研所</h1>
            <div id="top-nav-location">
              {{ currentRegion }}
            </div>
          </div>
        </l-control>
        <l-control class="nav-wrapper" position="topleft">
          <div id="side-nav">
            <div id="location-btn">
              <button @click="selectRegion">
                <img
                  name="0"
                  :src="imgFolder + regions[0] + regionImgPostfix[0] + '.png'"
                >
              </button>
              <button @click="selectRegion">
                <img
                  name="1"
                  :src="imgFolder + regions[1] + regionImgPostfix[1] + '.png'"
                >
              </button>
              <button @click="selectRegion">
                <img
                  name="2"
                  :src="imgFolder + regions[2] + regionImgPostfix[2] + '.png'"
                >
              </button>
              <button @click="selectRegion">
                <img
                  name="3"
                  :src="imgFolder + regions[3] + regionImgPostfix[3] + '.png'"
                >
              </button>
              <button @click="selectRegion">
                <img
                  name="4"
                  :src="imgFolder + regions[4] + regionImgPostfix[4] + '.png'"
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
import '@/assets/styles/global.css'

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
      posX: 0,
      posY: 0,
      currentRegion: '蒙德',
      regions: ['蒙德', '璃月', '稻妻', '龙脊雪山', '渊下宫'],
      regionImgPostfix: ['1', '', '', '', ''],
      imgFolder: './images/'
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
    })
  },
  methods: {
    // switch region on map
    selectRegion (event: any) {
      const index = Number(event.target.name)
      this.currentRegion = this.regions[index]
      for (let i = 0; i < this.regionImgPostfix.length; i++) {
        if (index === i) {
          this.regionImgPostfix[i] = '1'
        } else {
          this.regionImgPostfix[i] = ''
        }
      }
    }
  }
})
</script>

<style scoped>
#map-wrap {
  height: 91vh;
}
.nav-wrapper {
  margin-left: 0;
}
#top-nav {
  display: flex;
  color: #fff;
}
#top-nav > h1 {
  font-size: 30px;
}
#top-nav-location {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-left: 2em;
}
#side-nav {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
#location-btn,
#other-btn {
  display: flex;
  flex-direction: column;
}

#location-btn img {
  width: 60px;
  height: 60px;
}
</style>
