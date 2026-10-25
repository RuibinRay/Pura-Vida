// Where each dish of the food chapter sits on the map: the place its sourced "Where it is eaten" paragraph names
// first (src/content/generated/foods.json). Every dish is eaten all over the country; the pin marks the region
// the sources tie it to most strongly, and the card says so.
import type { Localized } from '../i18n';

export interface FoodPlace {
  at: string; // landmark id
  note: Localized;
}

export const FOOD_PLACES: Record<string, FoodPlace[]> = {
  'gallo-pinto': [
    { at: 'city-san-jose', note: { en: 'The best-known version is the Central Valley’s, with black beans and culantro.', es: 'La versión más conocida es la del Valle Central, con frijoles negros y culantro.', zh: '最有名的版本来自中央谷地，用黑豆和刺芫荽。' } },
    { at: 'city-liberia', note: { en: 'Guanacaste makes a fattier, more toasted version with red beans.', es: 'Guanacaste prepara una versión más grasosa y tostada, con frijoles rojos.', zh: '瓜纳卡斯特的版本更油、更焦香，用红豆。' } },
  ],
  casado: [
    { at: 'san-jose-san-jose-city', note: { en: 'The standard lunch of the sodas; its consolidation is tied to San José in the 1960s.', es: 'El almuerzo estándar de las sodas; su consolidación se asocia a San José en los años sesenta.', zh: '小餐馆（soda）的标准午餐；其定型与 1960 年代的圣何塞有关。' } },
    { at: 'limon-puerto-limon', note: { en: 'Limón has its own version, the “bochinche casado”.', es: 'Limón tiene su propia versión, el «bochinche casado».', zh: '利蒙有自己的版本——“bochinche casado”。' } },
  ],
  tamal: [
    { at: 'city-cartago', note: { en: 'Pork tamales in plantain leaves are the Christmas standard of the Central Valley.', es: 'Los tamales de cerdo en hoja de plátano son el estándar navideño del Valle Central.', zh: '芭蕉叶包猪肉塔马尔是中央谷地的圣诞标配。' } },
    { at: 'city-ciudad-cortes', note: { en: 'The south makes rice tamales with their own wrappers.', es: 'El sur prepara tamales de arroz con sus propias envolturas.', zh: '南部制作米饭塔马尔，并使用自己的包裹方式。' } },
  ],
  'olla-de-carne': [
    { at: 'city-heredia', note: { en: 'Strongest in the Central Valley: San José, Heredia and Alajuela.', es: 'Más fuerte en el Valle Central: San José, Heredia y Alajuela.', zh: '在中央谷地最为盛行：圣何塞、埃雷迪亚和阿拉胡埃拉。' } },
  ],
  'rice-and-beans': [
    { at: 'limon-puerto-limon', note: { en: 'Limón and the Caribbean coast, home of the Afro-Caribbean community.', es: 'Limón y la costa caribeña, hogar de la comunidad afrocaribeña.', zh: '利蒙与加勒比海岸，非裔加勒比社区的家园。' } },
    { at: 'limon-cahuita-and-puerto-viejo', note: { en: 'Puerto Viejo and the Caribe Sur, the Sunday meal.', es: 'Puerto Viejo y el Caribe Sur, la comida del domingo.', zh: '老港与南加勒比，周日的家常菜。' } },
  ],
};

/** dish ids tied to a landmark */
export function dishesAt(landmarkId: string): string[] {
  return Object.entries(FOOD_PLACES).filter(([, places]) => places.some((p) => p.at === landmarkId)).map(([id]) => id);
}
