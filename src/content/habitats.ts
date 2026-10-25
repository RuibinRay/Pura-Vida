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
  jaguar: [
    { at: 'area-corcovado', note: { en: 'Corcovado is central to the Osa subpopulation; camera traps recorded a rising density there in 2015–20.', es: 'Corcovado es central para la subpoblación de Osa; las cámaras trampa registraron allí una densidad creciente en 2015–20.', zh: '科尔科瓦多是奥萨亚种群的核心；2015–20年相机陷阱记录到那里的密度在上升。' }, status: 'approximate' },
    { at: 'area-tortuguero', note: { en: 'On the nesting beach jaguars take green turtles — dozens a year in the 2000s.', es: 'En la playa de anidación los jaguares cazan tortugas verdes: decenas al año en los años 2000.', zh: '在产卵海滩上美洲豹捕食绿海龟——2000年代每年数十只。' }, status: 'approximate' },
    { at: 'area-la-amistad', note: { en: 'The Talamanca forests hold one of the three Costa Rican subpopulations.', es: 'Los bosques de Talamanca albergan una de las tres subpoblaciones costarricenses.', zh: '塔拉曼卡森林是哥斯达黎加三个亚种群之一的所在。' }, status: 'approximate' },
  ],
  'mantled-howler-monkey': [
    { at: 'area-santa-rosa', note: { en: 'Studied in Santa Rosa since 1983; the howlers there reached the park’s capacity by 1999.', es: 'Estudiados en Santa Rosa desde 1983; los congos alcanzaron allí la capacidad del parque en 1999.', zh: '自1983年起在圣罗莎被研究；到1999年那里的吼猴已达公园承载量。' }, status: 'approximate' },
    { at: 'area-manuel-antonio', note: { en: 'Pacific coastal forest within a range that covers the whole country.', es: 'Bosque costero del Pacífico, dentro de una distribución que cubre todo el país.', zh: '太平洋沿海森林，属于覆盖全国的分布范围。' }, status: 'approximate' },
  ],
  'geoffroys-spider-monkey': [
    { at: 'area-corcovado', note: { en: 'The largest monkey of the country, at home in the Osa rainforest.', es: 'El mono más grande del país, en casa en el bosque lluvioso de Osa.', zh: '全国体型最大的猴子，奥萨雨林是它的家。' }, status: 'approximate' },
  ],
  kinkajou: [
    { at: 'area-corcovado', note: { en: 'A night animal of the canopy near the Osa Peninsula, among the commonest medium-sized mammals.', es: 'Un animal nocturno del dosel cerca de la península de Osa, entre los mamíferos medianos más comunes.', zh: '奥萨半岛一带树冠层的夜行动物，是最常见的中型哺乳动物之一。' }, status: 'approximate' },
  ],
  'white-nosed-coati': [
    { at: 'area-santa-rosa', note: { en: 'Recorded by the Área de Conservación Guanacaste in dry and wet forest alike.', es: 'Registrado por el Área de Conservación Guanacaste tanto en bosque seco como húmedo.', zh: '瓜纳卡斯特保护区在干燥森林和湿润森林中都有记录。' }, status: 'approximate' },
  ],
  'strawberry-poison-dart-frog': [
    { at: 'area-tortuguero', note: { en: 'The Caribbean lowlands, on the forest floor among the leaf litter.', es: 'Las tierras bajas del Caribe, en el suelo del bosque entre la hojarasca.', zh: '加勒比低地，森林地面的落叶之间。' }, status: 'approximate' },
    { at: 'limon-barra-del-colorado-refuge', note: { en: 'Reported from Caño Palma and Cerro Tortuguero in the refuge.', es: 'Reportada en Caño Palma y Cerro Tortuguero, dentro del refugio.', zh: '在保护区内的卡尼奥帕尔马和托尔图格罗山有记录。' }, status: 'approximate' },
  ],
  'fleischmanns-glass-frog': [
    { at: 'area-monteverde', note: { en: 'On the amphibian list of the Monteverde Cloud Forest Reserve.', es: 'En la lista de anfibios de la Reserva Bosque Nuboso Monteverde.', zh: '列于蒙特维德云雾林保护区的两栖动物名录。' }, status: 'approximate' },
  ],
  'plumed-basilisk': [
    { at: 'area-tortuguero', note: { en: 'Along the canals and streams, where it runs across the water when alarmed.', es: 'A lo largo de los canales y quebradas, donde corre sobre el agua cuando se asusta.', zh: '沿运河与溪流分布，受惊时会在水面上奔跑。' }, status: 'approximate' },
  ],
  'spectacled-caiman': [
    { at: 'area-cano-negro', note: { en: 'Studied in the Río Frío wetlands of Caño Negro.', es: 'Estudiado en los humedales del río Frío en Caño Negro.', zh: '在卡尼奥内格罗的弗里奥河湿地被研究。' }, status: 'approximate' },
    { at: 'area-tortuguero', note: { en: 'The canals of Tortuguero, basking on the banks.', es: 'Los canales de Tortuguero, asoleándose en las orillas.', zh: '托尔图格罗的运河，在岸边晒太阳。' }, status: 'approximate' },
  ],
  'west-indian-manatee': [
    { at: 'area-tortuguero', note: { en: 'The canals and lagoons of Tortuguero, one of the few Costa Rican refuges of the Antillean manatee.', es: 'Los canales y lagunas de Tortuguero, uno de los pocos refugios costarricenses del manatí antillano.', zh: '托尔图格罗的运河与潟湖，是哥斯达黎加少数几处安的列斯海牛的庇护地之一。' }, status: 'approximate' },
    { at: 'limon-barra-del-colorado-refuge', note: { en: 'The Colorado subpopulation of the northern Caribbean.', es: 'La subpoblación del Colorado, en el Caribe norte.', zh: '加勒比北部的科罗拉多亚种群。' }, status: 'approximate' },
  ],
  'humpback-whale': [
    { at: 'area-marino-ballena', note: { en: 'Named for the whales: two populations visit, one from the north (Dec–Apr) and one from the south (Jul–Nov).', es: 'Lleva el nombre de las ballenas: lo visitan dos poblaciones, una del norte (dic–abr) y otra del sur (jul–nov).', zh: '以鲸命名：两个种群来访，一个来自北方（12月至4月），一个来自南方（7月至11月）。' }, status: 'approximate' },
  ],
  'bottlenose-dolphin': [
    { at: 'area-marino-ballena', note: { en: 'On the park’s fauna list; the best-studied group lives in Golfo Dulce further south.', es: 'En la lista de fauna del parque; el grupo mejor estudiado vive más al sur, en el Golfo Dulce.', zh: '列于公园的动物名录；研究最充分的群体生活在更南边的杜尔塞湾。' }, status: 'approximate' },
  ],
  'great-green-macaw': [
    { at: 'heredia-puerto-viejo-de-sarapiqui', note: { en: 'The Sarapiquí lowlands, where the almendro trees it nests in still stand.', es: 'Las tierras bajas de Sarapiquí, donde aún quedan los almendros en los que anida.', zh: '萨拉皮基低地，它筑巢的杏仁树仍然矗立在那里。' }, status: 'approximate' },
    { at: 'limon-gandoca-manzanillo-refuge', note: { en: 'Birds released on the southern Caribbean coast.', es: 'Aves liberadas en la costa del Caribe sur.', zh: '在加勒比南部海岸放归的个体。' }, status: 'approximate' },
  ],
};

/** species ids present at a given landmark */
export function speciesAt(landmarkId: string): string[] {
  return Object.entries(HABITATS).filter(([, places]) => places.some((p) => p.at === landmarkId)).map(([id]) => id);
}
