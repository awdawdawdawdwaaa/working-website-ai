const ASSET_MAP = {
  '/props/Meshy_AI_Age_Wall_0611070403_texture.glb': '/props-mobile/Meshy_AI_Age_Wall_0611070403_texture.glb',
  '/props/Meshy_AI_Brushed_Steel_City_Sk_0610152611_texture.glb': '/props-mobile/Meshy_AI_Brushed_Steel_City_Sk_0610152611_texture.glb',
  '/props/Meshy_AI_Ahmedabad_Map_Install_0611072026_texture.glb': '/props-mobile/Meshy_AI_Ahmedabad_Map_Install_0611072026_texture.glb',
  '/props/Meshy_AI_Time_in_Steel_0611065420_texture.glb': '/props-mobile/Meshy_AI_Time_in_Steel_0611065420_texture.glb',
  '/props/Meshy_AI_Python_Development_Ex_0611071109_texture.glb': '/props-mobile/Meshy_AI_Python_Development_Ex_0611071109_texture.glb',
  '/assets/character.glb': '/assets-mobile/character.glb',
}

export function getMobilePath(desktopPath) {
  return ASSET_MAP[desktopPath] || null
}

export function getAssetEntries() {
  return Object.entries(ASSET_MAP)
}

export default ASSET_MAP
