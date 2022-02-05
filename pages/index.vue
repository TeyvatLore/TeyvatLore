<template>
  <div id="map-wrap" style="height: 100vh">
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
      >
        <l-marker :lat-lng="[2576, 1742]" />
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
  data () {
    return {
      maxBounds: null as unknown as L.LatLngBounds,
      mapCRS: null as unknown as L.CRS,
      tileLayer: null as unknown as L.TileLayer,
      mapReady: false
    }
  },
  mounted () {
    this.maxBounds = this.$L.latLngBounds(
      this.$L.latLng(-mapCenter[0] - 10000, -mapCenter[1] - 10000),
      this.$L.latLng(mapSize[0] - mapCenter[0] + 10000, mapSize[1] - mapCenter[1] + 10000))

    this.mapCRS = this.$L.Util.extend({}, this.$L.CRS.Simple, {
      transformation: new this.$L.Transformation(1, 0, 1, 0),
      projection: {
        project: (latlng: L.LatLng) => {
          return new this.$L.Point(latlng.lat + mapCenter[0], latlng.lng + mapCenter[1])
        },
        unproject: (point: L.Coords) => {
          return new this.$L.LatLng(point.x - mapCenter[0], point.y - mapCenter[1])
        }
      },
      bounds: this.$L.bounds(this.$L.point(0, 0), this.$L.point(mapSize[0], mapSize[1]))
    })

    const TileLayerClass = this.$L.TileLayer.extend({
      getTileUrl (coords : L.Coords) {
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
      (this.$refs.mapi as any).mapObject.addLayer(this.tileLayer)
    })
    // const mapObject = new TileLayerClass('', {
    //   maxZoom: 10,
    //   minZoom: -6,
    //   maxNativeZoom: 0,
    //   minNativeZoom: -3,
    //   bounds: latLngBounds(
    //     latLng(-mapCenter[0], -mapCenter[1]),
    //     latLng(mapSize[0] - mapCenter[0], mapSize[1] - mapCenter[1])
    //   )
    // })
  }
})
</script>
