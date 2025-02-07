export const toggleLayersVisibility = (state: any) => {
  for (const layer of state.neuroglancer.layers) {
    layer.visible = !(layer.visible === undefined || layer.visible);
  }
  return state;
};
