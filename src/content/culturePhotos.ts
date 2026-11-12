// The culture chapter's photographs (Wikimedia Commons; credits from tools/culture/sources.json) and what each shows.
import photos from './culturePhotos.generated.json';
import type { Localized } from '../i18n';

export interface CulturePhoto { widths: number[]; aspect: number; title: string; author: string; licence: string; licenceUrl: string; page: string }
export const CULTURE_PHOTOS = photos as Record<string, CulturePhoto>;
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'culture/';
export const culturePhotoSrc = (id: string, w: number) => `${BASE}${id}-${w}.webp`;
export const culturePhotoSrcSet = (id: string) => (CULTURE_PHOTOS[id]?.widths ?? []).map((w) => `${culturePhotoSrc(id, w)} ${w}w`).join(', ');

/** What the photograph shows, in the photographer's terms — not more than that. */
export const CULTURE_ALT: Record<string, Localized> = {
  'boyeo-carreta': { en: 'The painted wheel of a traditional ox-cart: a solid wheel covered in pointed stars and flowers in orange, blue, green and white.', es: 'La rueda pintada de una carreta típica: una rueda maciza cubierta de puntas de estrella y flores en naranja, azul, verde y blanco.', zh: '传统牛车的彩绘车轮：实心车轮上绘满橙、蓝、绿、白色的星芒与花朵。' },
  mascaradas: { en: 'The Giantess, a masquerade figure with a large painted head and a flowered dress, in Aserrí in 2013.', es: 'La Giganta, figura de la mascarada con una gran cabeza pintada y vestido de flores, en Aserrí en 2013.', zh: '“女巨人”——面具游行中的角色，硕大的彩绘头像配花裙，2013 年摄于阿塞里。' },
  'calypso-limonense': { en: 'A calypso group from Limón playing: four musicians in flowered shirts with a banjo and hand drums.', es: 'Un grupo de calipso limonense tocando: cuatro músicos con camisas floreadas, un banjo y tambores.', zh: '一支利蒙卡利普索乐队在演奏：四位身穿花衬衫的乐手，配班卓琴和手鼓。' },
  romeria: { en: 'Pilgrims in the square before the basilica of Our Lady of the Angels in Cartago, during the romería of 2011.', es: 'Romeros en la plaza frente a la basílica de Nuestra Señora de los Ángeles, en Cartago, durante la romería de 2011.', zh: '2011 年朝圣期间，卡塔戈天使圣母大教堂前广场上的朝圣者。' },
  'punto-guanacasteco': { en: 'Girls in folk dress — white blouses and wide coloured skirts — dancing in a street on 15 September, Independence Day.', es: 'Niñas con traje típico —blusas blancas y faldas amplias de colores— bailando en la calle un 15 de setiembre, Día de la Independencia.', zh: '9 月 15 日独立日，身穿民族服装（白上衣与宽大彩裙）的女孩在街头跳舞。' },
  'coffee-history': { en: 'Ripe red coffee cherries beside pale green coffee beans, drying in the sun in San Marcos de Tarrazú.', es: 'Cerezas rojas de café junto a granos de café verde, secándose al sol en San Marcos de Tarrazú.', zh: '塔拉苏圣马科斯：成熟的红色咖啡果与浅色生豆并排在阳光下晾晒。' },
  'coffee-growing': { en: 'A coffee picker with a basket at his waist among the coffee bushes of a farm near San Marcos de Tarrazú.', es: 'Un cogedor de café con el canasto a la cintura entre los cafetos de una finca cerca de San Marcos de Tarrazú.', zh: '塔拉苏圣马科斯附近的农场里，一名腰系篮子的采摘工在咖啡树间劳作。' },
  'coffee-cup': { en: 'Coffee beans spread out to dry in the sun on a patio, raked into rows, at the Doka plantation.', es: 'Granos de café tendidos a secar al sol en un patio, rastrillados en hileras, en la finca Doka.', zh: '多卡庄园：咖啡豆摊在晒场上日晒，被耙成一行行。' },
};
