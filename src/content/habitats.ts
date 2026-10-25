// Where each species of the wildlife journal can be met, as places on the map. Every placement follows the
// species' own sourced "Where in Costa Rica" paragraph (src/content/generated/species.json, distributionCR and the
// per-stop habitat fit of the homepage walk); the status is "approximate" because a species lives in a region, not
// at a pin. The map's wildlife layer draws the cartoon of the species at each place; the card says why it is there.
import type { Localized } from '../i18n';
import type { Status } from './types';

export interface HabitatPlace {
  /** landmark id from landmarks.json (gives the coordinates and the province) */
  at: string;
  note: Localized;
  status?: Status;
}

export const HABITATS: Record<string, HabitatPlace[]> = {
  'keel-billed-toucan': [
    { at: 'area-tortuguero', note: { en: 'Caribbean lowland rainforest, where the toucans of the walk live.', es: 'Bosque lluvioso de las tierras bajas del Caribe, donde viven los tucanes del recorrido.', zh: '加勒比低地雨林，步行之旅中的巨嘴鸟就生活在这里。' } },
    { at: 'area-braulio-carrillo', note: { en: 'Wet forest of the Caribbean slope, within the species’ Central American range.', es: 'Bosque húmedo de la vertiente caribeña, dentro de su distribución centroamericana.', zh: '加勒比坡面的湿润森林，属于该物种在中美洲的分布范围。' } },
    { at: 'heredia-estacion-biologica-la-selva', note: { en: 'Lowland rainforest research station with a long bird record.', es: 'Estación de bosque lluvioso de tierras bajas con un largo registro de aves.', zh: '低地雨林研究站，鸟类记录悠久。' } },
  ],
  'brown-throated-three-toed-sloth': [
    { at: 'area-cahuita', note: { en: 'Caribbean coastal forest in Limón, where Costa Rican studies document the sloth.', es: 'Bosque costero del Caribe en Limón, donde estudios costarricenses documentan al perezoso.', zh: '利蒙的加勒比沿海森林，哥斯达黎加的研究在此记录了树懒。' } },
    { at: 'area-tortuguero', note: { en: 'Riparian forest and canals of the Caribbean slope.', es: 'Bosque ribereño y canales de la vertiente caribeña.', zh: '加勒比坡面的河岸森林与运河。' } },
    { at: 'area-cano-negro', note: { en: 'Near Upala in northern Alajuela, where research recorded the species.', es: 'Cerca de Upala, en el norte de Alajuela, donde la investigación registró la especie.', zh: '靠近阿拉胡埃拉北部的乌帕拉，研究曾在此记录该物种。' } },
  ],
  'blue-morpho': [
    { at: 'area-monteverde', note: { en: 'Flies along the forest trails of the cloud forest.', es: 'Vuela por los senderos del bosque nuboso.', zh: '在云雾林的小径上飞舞。' } },
    { at: 'area-corcovado', note: { en: 'The southern Pacific slope, where the subspecies marinita is documented.', es: 'Vertiente del Pacífico sur, donde está documentada la subespecie marinita.', zh: '太平洋南坡，亚种 marinita 在此有记录。' } },
    { at: 'area-santa-rosa', note: { en: 'Recorded in the Guanacaste dry forest.', es: 'Registrada en el bosque seco de Guanacaste.', zh: '在瓜纳卡斯特干燥森林中有记录。' } },
  ],
  'clay-colored-thrush': [
    { at: 'city-san-jose', note: { en: 'The national bird sings in gardens and parks of the Central Valley.', es: 'El ave nacional canta en jardines y parques del Valle Central.', zh: '国鸟在中央谷地的花园和公园里鸣唱。' } },
    { at: 'cartago-volcan-irazu', note: { en: 'At home on the Irazú slopes of the walk.', es: 'En casa en las laderas del Irazú del recorrido.', zh: '在步行之旅的伊拉苏火山山坡上安家。' } },
    { at: 'alajuela-alajuela-city', note: { en: 'One of the most recorded birds in the country, in every town.', es: 'Una de las aves más registradas del país, en todos los pueblos.', zh: '全国记录最多的鸟类之一，遍布每个城镇。' } },
  ],
  'white-faced-capuchin': [
    { at: 'area-manuel-antonio', note: { en: 'Among the monkeys most often seen in the park.', es: 'Entre los monos que más se ven en el parque.', zh: '是公园里最常见到的猴子之一。' } },
    { at: 'area-corcovado', note: { en: 'Common in the Osa rainforest.', es: 'Común en el bosque lluvioso de Osa.', zh: '在奥萨雨林中很常见。' } },
    { at: 'area-santa-rosa', note: { en: 'The Guanacaste dry-forest population.', es: 'La población del bosque seco de Guanacaste.', zh: '瓜纳卡斯特干燥森林中的种群。' } },
  ],
  'scarlet-macaw': [
    { at: 'area-carara', note: { en: 'Carara and the Tárcoles river mouth: a stronghold of the Pacific population.', es: 'Carara y la desembocadura del Tárcoles: un bastión de la población del Pacífico.', zh: '卡拉拉与塔尔科莱斯河口：太平洋种群的重要据点。' } },
    { at: 'area-corcovado', note: { en: 'The Osa Peninsula, the largest Pacific population.', es: 'La península de Osa, la mayor población del Pacífico.', zh: '奥萨半岛，太平洋沿岸最大的种群。' } },
    { at: 'area-guanacaste', note: { en: 'Pacific populations around the Nicoya Peninsula and Guanacaste.', es: 'Poblaciones del Pacífico alrededor de la península de Nicoya y Guanacaste.', zh: '尼科亚半岛与瓜纳卡斯特一带的太平洋种群。' } },
  ],
  'red-eyed-tree-frog': [
    { at: 'area-tortuguero', note: { en: 'Caribbean lowlands, from sea level up.', es: 'Tierras bajas del Caribe, desde el nivel del mar.', zh: '加勒比低地，自海平面起。' } },
    { at: 'heredia-estacion-biologica-la-selva', note: { en: 'The wet Caribbean lowland forest of Sarapiquí.', es: 'El bosque húmedo de las tierras bajas caribeñas de Sarapiquí.', zh: '萨拉皮基的加勒比低地湿润森林。' } },
    { at: 'area-piedras-blancas', note: { en: 'The Pacific lowlands of southern Costa Rica.', es: 'Las tierras bajas del Pacífico del sur de Costa Rica.', zh: '哥斯达黎加南部的太平洋低地。' } },
  ],
  'central-american-agouti': [
    { at: 'area-manuel-antonio', note: { en: 'Forest floor of the Pacific coastal forest.', es: 'Suelo del bosque costero del Pacífico.', zh: '太平洋沿海森林的林地。' } },
    { at: 'area-carara', note: { en: 'Lowland forest within its Central American range.', es: 'Bosque de tierras bajas dentro de su distribución centroamericana.', zh: '属于其中美洲分布范围内的低地森林。' } },
    { at: 'area-cahuita', note: { en: 'Caribbean coastal forest.', es: 'Bosque costero del Caribe.', zh: '加勒比沿海森林。' } },
  ],
  'green-iguana': [
    { at: 'guanacaste-tempisque-river', note: { en: 'Riverside trees of the Tempisque lowlands.', es: 'Árboles ribereños de las tierras bajas del Tempisque.', zh: '滕皮斯克低地的河岸树木。' } },
    { at: 'area-manuel-antonio', note: { en: 'Pacific lowland forest and beach edge.', es: 'Bosque de tierras bajas del Pacífico y borde de playa.', zh: '太平洋低地森林与海滩边缘。' } },
    { at: 'limon-cahuita-and-puerto-viejo', note: { en: 'Caribbean lowlands, within the species’ native range.', es: 'Tierras bajas del Caribe, dentro de su distribución nativa.', zh: '加勒比低地，属于该物种的原生分布范围。' } },
  ],
  'resplendent-quetzal': [
    { at: 'area-monteverde', note: { en: 'The cloud forest of the walk, famous for quetzal watching.', es: 'El bosque nuboso del recorrido, famoso por la observación del quetzal.', zh: '步行之旅中的云雾林，以观赏凤尾绿咬鹃闻名。' } },
    { at: 'san-jose-cerro-de-la-muerte', note: { en: 'The oak highlands of the Talamanca range.', es: 'Los robledales de altura de la cordillera de Talamanca.', zh: '塔拉曼卡山脉的高地栎树林。' } },
    { at: 'area-tapanti', note: { en: 'Montane forest of the Cartago highlands.', es: 'Bosque montano de las alturas de Cartago.', zh: '卡塔戈高地的山地森林。' } },
  ],
  'bairds-tapir': [
    { at: 'area-corcovado', note: { en: 'The Osa rainforest, where the tapir of the walk lives.', es: 'El bosque lluvioso de Osa, donde vive la danta del recorrido.', zh: '奥萨雨林，步行之旅中的貘生活在这里。' } },
    { at: 'area-rincon-de-la-vieja', note: { en: 'Guanacaste forests, where the walk shows it at home.', es: 'Bosques de Guanacaste, donde el recorrido lo muestra en casa.', zh: '瓜纳卡斯特的森林，步行之旅中它在此安家。' } },
    { at: 'area-la-amistad', note: { en: 'The large forests of the Talamanca cordillera.', es: 'Los grandes bosques de la cordillera de Talamanca.', zh: '塔拉曼卡山脉的大片森林。' } },
  ],
  'white-tailed-deer': [
    { at: 'area-santa-rosa', note: { en: 'The savannas of Santa Rosa, described as its home ground.', es: 'Las sabanas de Santa Rosa, descritas como su territorio.', zh: '圣罗莎的稀树草原，被描述为它的家园。' } },
    { at: 'area-palo-verde', note: { en: 'Dry forest and wetland edge of the Tempisque.', es: 'Bosque seco y borde de humedal del Tempisque.', zh: '滕皮斯克的干燥森林与湿地边缘。' } },
    { at: 'area-guanacaste', note: { en: 'Guanacaste dry forest, as on the walk.', es: 'Bosque seco de Guanacaste, como en el recorrido.', zh: '瓜纳卡斯特干燥森林，正如步行之旅中所示。' } },
  ],
  'great-blue-heron': [
    { at: 'area-tortuguero', note: { en: 'The canals of the walk, fishing at the water’s edge.', es: 'Los canales del recorrido, pescando a la orilla del agua.', zh: '步行之旅中的运河，在水边捕鱼。' } },
    { at: 'area-palo-verde', note: { en: 'The great wetland of the Tempisque.', es: 'El gran humedal del Tempisque.', zh: '滕皮斯克的大型湿地。' } },
    { at: 'area-cano-negro', note: { en: 'Seasonal lagoons of the northern lowlands.', es: 'Lagunas estacionales de las tierras bajas del norte.', zh: '北部低地的季节性潟湖。' } },
  ],
  'volcano-hummingbird': [
    { at: 'peak-irazu', note: { en: 'The nominate subspecies lives on Irazú and Turrialba.', es: 'La subespecie nominal vive en el Irazú y el Turrialba.', zh: '指名亚种生活在伊拉苏和图里亚尔瓦火山。' } },
    { at: 'peak-poas', note: { en: 'S. f. simoni, on Poás and Barva.', es: 'S. f. simoni, en el Poás y el Barva.', zh: '亚种 S. f. simoni，分布于波阿斯和巴尔瓦火山。' } },
    { at: 'peak-cerro-de-la-muerte', note: { en: 'S. f. torridus, in the Cordillera de Talamanca.', es: 'S. f. torridus, en la cordillera de Talamanca.', zh: '亚种 S. f. torridus，分布于塔拉曼卡山脉。' } },
  ],
  'purple-throated-mountain-gem': [
    { at: 'area-monteverde', note: { en: 'Documented at the Monteverde hummingbird gallery.', es: 'Documentado en la galería de colibríes de Monteverde.', zh: '在蒙特维德蜂鸟观赏廊有记录。' } },
    { at: 'peak-barva', note: { en: 'The Cordillera Central highlands.', es: 'Las alturas de la cordillera Central.', zh: '中央山脉高地。' } },
    { at: 'area-tenorio', note: { en: 'The Cordillera de Guanacaste.', es: 'La cordillera de Guanacaste.', zh: '瓜纳卡斯特山脉。' } },
  ],
};

/** species ids present at a given landmark */
export function speciesAt(landmarkId: string): string[] {
  return Object.entries(HABITATS).filter(([, places]) => places.some((p) => p.at === landmarkId)).map(([id]) => id);
}
