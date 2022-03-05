export interface GenshinRegion {
  mondstadt: '蒙德';
  liyue: '璃月';
  inazuma: '稻妻';
  dragonspine: '龙脊雪山';
  enkanomiya: '渊下宫';
}

type GenshinRegionUnion<T, K = keyof T> = K extends K
  ? { id: keyof T & K; name: T[keyof T & K] }
  : never;

export type Region = GenshinRegionUnion<GenshinRegion> & {
  latlng: [number, number];
};

export type Nullable<T> = T | null;
