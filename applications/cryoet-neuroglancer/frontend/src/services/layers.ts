export const toggleLayersVisibility = (state: any) => {
  state.layers.forEach((layer: any) => {
    layer.visible = !(layer.visible === undefined || layer.visible);
  });
  return state;
};
