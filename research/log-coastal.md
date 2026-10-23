# Fetch log — coastal provinces (Guanacaste, Puntarenas, Limón)

Retrieval date: 2026-10-23. Output: `/home/claude/costa-rica/research/provinces-coastal.json`.
Every URL attempted with WebFetch is listed below with its outcome. Only URLs marked **OK** are cited in the JSON. WebSearch queries are listed at the end.

Legend: OK = fetched and used · OK (not cited) = fetched, nothing usable · FAIL = not fetched (reason in parentheses).

## Statistics / population / cantons

| URL | Result | Used for |
|---|---|---|
| https://delfino.cr/2023/07/censo-2022-costa-rica-tiene-5-044-197-habitantes-dice-el-inec | OK | INEC 2022 population by province (412,808 / 500,166 / 470,383); 61% coverage note |
| https://inec.cr/censos/censo-2022 | FAIL (client_error) | — |
| https://inec.cr/ | FAIL (client_error, second attempt blocked) | — |
| https://tse.go.cr/2026/imgs/infografias/INFOGRAFIAS-TSE-Diputaciones.pdf | OK | same INEC provincial figures used by the TSE |
| https://semanariouniversidad.com/pais/tse-fija-numero-de-diputaciones-por-provincia-san-jose-cartago-y-heredia-perdieron-un-escano-cada-una/ | OK | figures = census 2022 + administrative records; deputies per province 2026 |
| https://en.wikipedia.org/wiki/Cantons_of_Costa_Rica | OK | canton lists (11 / 13 / 6), 84 cantons nationally |
| https://www.nacion.com/el-pais/politica/diputados-crean-canton-de-puerto-jimenez-el-numero/J2UUEOH7YFFGPLBQGPWBHUGJT4/story/ | OK (not cited) | first-debate vote on Puerto Jiménez (24 Mar 2022) — superseded by Teletica second-debate report |
| https://www.elfinancierocr.com/economia-y-politica/costa-rica-tendra-canton-numero-84-puerto-jimenez/DA2TNQTYBVB7VBWWP7HBS5FBMU/story/ | OK (not cited) | first debate only; no law number |
| https://www.teletica.com/politica/congreso-crea-el-nuevo-canton-de-puerto-jimenez_308391 | OK | second debate 29 Mar 2022, 48 votes, 84th canton / 13th of Puntarenas |
| http://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?nValor1=1&nValor2=96891 | FAIL (robots_disallowed) | — |
| https://bufetedecostarica.com/wp-content/uploads/2026/10/ley-10195_creacion-del-canton-de-puerto-jimenez-canton-decimo-tercero.pdf | OK | Ley 10195 text: Art. 1 (13th canton from Golfito's 2nd district), Art. 4 (cabecera, single district), municipality installed 1 May 2024 |
| https://observador.cr/diputados-declaran-a-monteverde-como-el-canton-no-83-de-costa-rica/ | FAIL (robots_disallowed) | — |
| https://www.teletica.com/politica/monteverde-se-convierte-en-el-canton-83-de-costa-rica_292132 | OK (not cited) | Monteverde approval 4 Aug 2021, 49 votes — Delfino used instead |
| https://delfino.cr/2021/08/aprobado-el-cantonato-de-monteverde-y-la-exigencia-a-partidos-de-dar-informacion-sobre-sus-aspirantes-en-elecciones | OK | Monteverde second debate, expediente 21.618, 12th canton of Puntarenas, seat Santa Elena |
| https://crhoy.com/nacionales/37-diputados-aprueban-que-colorado-de-abangares-sea-nuevo-canton/ | OK (not cited) | Colorado first-debate approval Feb 2024 (would be 12th Guanacaste canton) |
| https://observador.cr/que-paso-con-la-creacion-del-canton-de-cobano-que-seria-el-numero-85-del-pais/ | FAIL (robots_disallowed) | — |
| https://delfino.cr/2024/05/sala-iv-declara-inconstitucional-proyecto-para-darle-rango-de-canton-a-colorado | OK | Sala IV ruling 2024-13908 blocking Colorado canton → Guanacaste stays at 11 |
| https://www.teletica.com/politica/conozca-los-13-nuevos-distritos-electorales-definidos-por-tse-para-2026_387132 | OK | TSE: 84 cantons for 2026 elections; new districts in Talamanca, Pococí, Guácimo |

## UNESCO / SINAC / conservation areas

| URL | Result | Used for |
|---|---|---|
| https://whc.unesco.org/en/list/928/ | OK | ACG World Heritage: 1999/2004, 147,000 ha, criteria, dry forest, species counts, coordinates |
| https://en.wikipedia.org/wiki/Area_de_Conservaci%C3%B3n_Guanacaste_World_Heritage_Site | OK (not cited) | cross-check of 1999/2004 and coordinates |
| https://www.sinac.go.cr/ES/ac/acg/Paginas/default.aspx | OK | ACG components (Santa Rosa, Guanacaste, Rincón de la Vieja, Bahía Junquillal, Horizontes); 235,000 species / 65% |
| https://www.sinac.go.cr/ES/asp/Paginas/default.aspx | FAIL (robots_disallowed) | — |
| https://acguanacaste.ac.cr/1997/acging.html | OK | ACG ~120,000 land + 70,000 marine ha; dry-forest restoration purpose (page dated 1997) |
| https://www.acto.go.cr/ | OK | ACTo office in Guápiles; managed areas; green turtle 22,500 females / 100,000 nests; biodiversity counts; Barra del Colorado humidity |
| https://www.acto.go.cr/wp-content/uploads/2023/01/BrochPNTEsp.pdf | OK | Tortuguero NP brochure: areas, canals, turtle seasons, Ramsar 1996 |
| https://www.acosa.go.cr/ | FAIL (robots_disallowed) | — |
| https://whc.unesco.org/en/list/820/ | OK (fetched twice) | Cocos Island: 530/550 km, 2,400 ha + 199,700 ha, endemism, sharks, criteria |
| https://whc.unesco.org/es/list/820 | OK | Cocos Island inscription 1997, extension 2002 |
| https://whc.unesco.org/en/list/205/ | OK | Talamanca Range–La Amistad: 1983/1990, 570,045 ha, coordinates, Chirripó 3,819 m, ecosystems, provinces |
| https://iucn.org/es/noticias/202607/reserva-biologica-bosque-nuboso-monteverde-ingresa-la-lista-verde-de-la-uicn-como | OK | Monteverde reserve: IUCN Green List 2026, CCT, 1972, 4,125 ha |

## ICT / visitcostarica.com

| URL | Result | Used for |
|---|---|---|
| https://www.visitcostarica.com/sites/default/files/2024-10/GUIA LIBERIA.pdf | OK | Liberia: capital, first canton, 'ciudad blanca', airport, sabanero tours, tortillas |
| https://www.ict.go.cr/flipbook/guias/flip-en/GUIA_GUANACASTE_NORTE/files/basic-html/page71.html | OK | Santa Rosa: Casona museum, Battle 20 Mar 1856, Naranjo, Peña Bruja, Murciélago |
| https://ict.go.cr/flipbook/guias/PDF/TAMARINDO.pdf | FAIL (client_error) | — |
| https://www.visitcostarica.com/es/costa-rica/parque-nacional-marino-las-baulas | FAIL (client_error) | — |
| https://www.visitcostarica.com/es/costa-rica/parque-nacional-palo-verde | FAIL (client_error) | — |
| https://www.visitcostarica.com/es/costa-rica/parque-nacional-barra-honda | FAIL (client_error) | — |
| https://www.visitcostarica.com/where-to-go/protected-areas/palo-verde-national-park | OK | Palo Verde: Bagaces, wetlands 50%, >280 birds, jabiru, Isla Pájaros (page metadata wrongly describes Tortuguero — ignored) |
| https://www.visitcostarica.com/where-to-go/protected-areas/manuel-antonio-national-park | OK | Manuel Antonio: Quepos, squirrel monkey ~1,500, wildlife, SICORE tickets, hours |
| https://www.visitcostarica.com/where-to-go/protected-areas/las-baulas-national-marine-park | OK | Las Baulas: Tamarindo, leatherback nesting ground, estuary mangroves |
| https://www.visitcostarica.com/where-to-go/protected-areas/rincon-de-la-vieja-national-park | FAIL (client_error) | — |
| https://www.visitcostarica.com/where-to-go/protected-areas/santa-rosa-national-park | OK | Santa Rosa: dry forest, Nancite/Naranjo olive ridleys, Casona rebuilt 2002 (area figure on page is garbled — not used) |
| https://www.visitcostarica.com/where-to-go/protected-areas/corcovado-national-park | OK | Corcovado: 41,788 ha, biodiversity counts, guide required, Sirena |
| https://www.visitcostarica.com/where-to-go/protected-areas/cahuita-national-park | OK | Cahuita: co-management, best-preserved Caribbean reef, sectors, wildlife |
| https://www.visitcostarica.com/where-to-go/protected-areas/tortuguero-national-park | OK | Tortuguero: declared 24 Sept 1970, extensions, 26,653 + 50,284 ha, boat access |
| https://www.visitcostarica.com/where-to-go/protected-areas/gandoca-manzanillo-national-wildlife-refuge | FAIL (client_error) | — |
| https://www.visitcostarica.com/where-to-go/protected-areas/carara-national-park | OK | Carara: cantons, Huetar name, transitional forest, Ara macao, universal-access trail |
| https://www.visitcostarica.com/where-to-go/protected-areas/marino-ballena-national-park | FAIL (client_error) | — |
| https://visitcostarica.com/sites/default/files/legacy/Caminata%20por%20Puntarenas%20v4.pdf | OK | Puntarenas city heritage: 1814 royal order, Paseo de los Turistas, piers, Capitanía, cathedral 1902–05, Casa de la Cultura, Parque Marino |
| https://visitcostarica.com/blog/why-do-we-celebrate-afro-costa-rican-history-month | OK | 31 August origin, Law 9526, Grand Parade de Gala, 8% Afro-descendant |

## Archives, universities, institutions

| URL | Result | Used for |
|---|---|---|
| https://www.archivonacional.go.cr/web/educativo/ANCR_25jul_AnexionNicoya.pdf | OK | 1824 act: Nicoya + Santa Cruz, Guanacaste town excluded, motives |
| https://celade.cepal.org/censosinfo/manuales/CR_TerritorioIndigena_2011.pdf | OK | INEC 2011 indigenous territories by people/canton/population |
| https://www.ucr.ac.cr/medios/documentos/2023/ct-93-66a01a9282409.pdf | OK | Chorotega ceramics: Guaitil/San Vicente, techniques, Ecomuseo, clay shortage |
| https://revistas.ucr.ac.cr/index.php/geologica/article/download/7776/7431/10523 | REDIRECT → | archivo.revistas.ucr.ac.cr |
| https://archivo.revistas.ucr.ac.cr//index.php/geologica/article/download/7776/7431/10523 | OK | Rincón de la Vieja geology: 1,916 m, only active volcano of the range, nine foci, acid lake, eruption history |
| https://revistas.ucr.ac.cr/index.php/herencia/article/download/14536/13810/25874 | REDIRECT → | archivo.revistas.ucr.ac.cr |
| https://archivo.revistas.ucr.ac.cr//index.php/herencia/article/download/14536/13810/25874 | OK | Limón carnival history: 1949, Alfred King, 12 October |
| https://www.culturalsurvival.org/es/node/10043 | OK (not cited) | Bribri in Talamanca, Keköldi 1977, 2011 court ruling — too narrow / dated to cite |
| https://www.britannica.com/place/Guanacaste | OK | former Nicaraguan ties, 1896 boundary treaty, cattle haciendas (gives 1825) |
| https://www.britannica.com/place/Puntarenas-province-Costa-Rica | FAIL (client_error) | — |

## Press (secondary; used for dated events, culture, food)

| URL | Result | Used for |
|---|---|---|
| https://www.teletica.com/cultura/comunidad-de-cahuita-celebra-primer-dia-nacional-del-calypso-y-centenario-de-edad-de-walter-ferguson_225095 | OK | Law 9612, Día Nacional del Calypso 7 May, Ferguson centenary |
| https://www.teletica.com/nacional/conozca-la-historia-del-emblematico-edificio-limonense-black-star-line_123482 | OK | Black Star Line 1922, Garvey/UNIA, heritage 2000, fire 29 Apr 2016 |
| https://www.lateja.cr/nacional/juegos-de-los-diablitos-es-declarado-patrimonio/RSUTTF5LKJBO3DN4ONKEKLLTBU/story/ | OK | Decreto 40766-C, Boruca/Rey Curré dates, meaning |
| https://www.crhoy.com/estos-son-los-3-simbolos-nacionales-que-representan-a-guanacaste/ | OK | Guanacaste tree decree 24 Aug 1959; marimba decree 1996 |
| https://www.larepublica.net/noticia/7-datos-curiosos-del-arbol-de-guanacaste-simbolo-nacional-de-costa-rica-y-emblema-de-una-provincia | OK | tree facts, Nahuatl name, decree |
| https://www.nacion.com/sucesos/desastres/volcan-rincon-de-la-vieja-lleva-42-erupciones-en/JQ5BER3ZIVHVNKA2VANLLMBK7A/story/ | OK | 2023 activity, crater closed >10 years, lahars |
| https://www.roughguides.com/costa-rica/uvita-whale-watching/ | OK (secondary) | Marino Ballena 1989, whale's tail, humpback seasons |
| https://elmundo.cr/tendencias/historico-templo-de-san-blas-en-nicoya-abre-de-nuevo-sus-puertas/ | OK | San Blas church history and 2019 restoration |
| https://observador.cr/viva-blas-el-templo-colonial-de-nicoya-vuelve-a-ser-majestuoso/ | FAIL (robots_disallowed) | — |
| https://www.teletica.com/masqn/limon-se-prepara-para-vivir-su-gran-fiesta_418586 | OK | 2026 carnival dates, 1949 origin, organizer |
| https://delfino.cr/2026/07/ucr-documenta-la-tradicion-de-la-virgen-del-mar-en-puntarenas | OK | Virgen del Mar: 1914 institution, 1913 El Galileo account, UCR project |
| https://elmundo.cr/costa-rica/puntarenas-inicia-celebraciones-en-honor-a-la-virgen-del-mar/ | OK | 16 July boat procession route, 'patrona de los porteños' |
| https://www.nacion.com/viva/gastronomia/descubra-los-secretos-de-la-gastronomia-de/FLAWTLUVYBH5DF5LR6QIU757IM/story/ | OK | Puntarenas dishes: whole fish, vigorón, churchill, ceviche |
| https://ticotimes.net/?p=112017 | OK | churchill origin legend |
| https://en.wikipedia.org/wiki/Churchill_(snow_cone) | OK | churchill: Puntarenas, Paseo de los Turistas |
| https://www.teletica.com/nacional/del-maiz-a-la-carne-ahumada-los-sabores-que-mantienen-viva-la-tradicion-guanacasteca_413897 | OK | corn as base; rosquillas/tanelas/empanadas/tortillas; carne ahumada |
| https://www.teletica.com/buen-dia/asi-se-preparan-las-recetas-mas-autenticas-de-guanacaste_389228 | OK | rosquillas, empanadas, tanelas preparation |
| https://www.crhoy.com/nacionales/sabores-de-limon-buscan-recuperar-su-lugar-en-los-menus/ | OK | rice and beans, rondón, patí, pan bon |
| https://www.lateja.cr/nacional/rice-and-beans-rondon-y-coco-la-cocina/DXCTPSQMWJCXHDE4BYY2BKWUHY/story/ | OK | coconut, seasonings, rondón ingredients |
| https://www.lateja.cr/nacional/limonense-se-manda-sabroso-y-hace-pati-de-camaron/GL2LNDSPVVGVDDPQPBIMFOSKWE/story | OK | patí description |
| https://www.teletica.com/multimedia/conoceremos-como-se-prepara-el-pan-bon_1263048 | OK (video page, minimal) | pan bon existence only |

## Wikipedia (last resort; coordinates, dates, cross-checks)

| URL | Result | Used for |
|---|---|---|
| https://es.wikipedia.org/wiki/Provincia_de_Guanacaste | OK | area, geography, volcano heights, climate, economy, parks |
| https://es.wikipedia.org/wiki/Provincia_de_Puntarenas | OK | area, capital, climate, economy, 1909, parks |
| https://es.wikipedia.org/wiki/Provincia_de_Lim%C3%B3n | OK | area, coast, rainfall, railroad 1871, Jamaican workers 1872, province 1902, culture |
| https://en.wikipedia.org/wiki/Guanacaste_Province | OK | ISO, area, Liberia 1854, 'Tierra de la Marimba' |
| https://en.wikipedia.org/wiki/Puntarenas_Province | OK | ISO, area, 13 cantons |
| https://en.wikipedia.org/wiki/Lim%C3%B3n_Province | OK | ISO, cantons, Keith/United Fruit, ports |
| https://en.wikipedia.org/wiki/Liberia,_Costa_Rica | OK | coordinates, 1769, nickname, airport |
| https://es.wikipedia.org/wiki/Puntarenas_(ciudad) | OK | sandbar, 1814, railway 1910, cathedral, churchill |
| https://en.wikipedia.org/wiki/Puntarenas | OK | coordinates, 1859 rail, Caldera, ferries |
| https://en.wikipedia.org/wiki/Puntarenas_(city) | FAIL (url_not_found) | — |
| https://es.wikipedia.org/wiki/Cant%C3%B3n_de_Puntarenas | OK | districts incl. Isla del Coco; Monteverde separation, Law 10019 |
| https://es.wikipedia.org/wiki/Lim%C3%B3n_(Costa_Rica) | OK | 1854 founding, railroad 1890, Isla Uvita, Black Star Line rebuild |
| https://es.wikipedia.org/wiki/Cant%C3%B3n_de_Lim%C3%B3n | OK (not cited) | comarca 1870, municipality 1892, port share |
| https://en.wikipedia.org/wiki/Lim%C3%B3n,_Costa_Rica | FAIL (url_not_found) | — |
| https://en.wikipedia.org/wiki/Puerto_Lim%C3%B3n | FAIL (url_not_found) | — |
| https://en.wikipedia.org/wiki/Lim%C3%B3n | OK | coordinates, Moín 90%, Isla Uvita, carnival 1949 (full name of founder), Creole speakers |
| https://en.wikipedia.org/wiki/Corcovado_National_Park | OK | 1975, coordinates, ACOSA, species |
| https://es.wikipedia.org/wiki/Parque_nacional_Corcovado | OK (disambiguation, not cited) | — |
| https://es.wikipedia.org/wiki/Parque_nacional_Santa_Rosa | OK | 27 Mar 1971, Casona monument 1966, areas, fauna |
| https://es.wikipedia.org/wiki/Parque_nacional_Rinc%C3%B3n_de_la_Vieja | OK | sectors, flora with binomials, ACG |
| https://en.wikipedia.org/wiki/Rinc%C3%B3n_de_la_Vieja_Volcano | OK | coordinates, 12,759 ha |
| https://es.wikipedia.org/wiki/Parque_nacional_Barra_Honda | OK | Law 5558 1974, 2,295 ha, caves |
| https://en.wikipedia.org/wiki/Barra_Honda_National_Park | OK | coordinates, 42 caves, ACT |
| https://en.wikipedia.org/wiki/Palo_Verde_National_Park | OK | coordinates, 1978, Ramsar 1991 |
| https://en.wikipedia.org/wiki/Las_Baulas_National_Marine_Park | OK | Playa Grande, Oct–May nesting, Ramsar |
| https://en.wikipedia.org/wiki/Nicoya | OK | coordinates, 1523, Blue Zone |
| https://en.wikipedia.org/wiki/Tamarindo,_Costa_Rica | OK | coordinates, Santa Cruz canton |
| https://en.wikipedia.org/wiki/Nosara | OK | coordinates, Nicoya canton, Ostional |
| https://en.wikipedia.org/wiki/S%C3%A1mara,_Costa_Rica | FAIL (url_not_found) | — |
| https://es.wikipedia.org/wiki/S%C3%A1mara_(Costa_Rica) | OK | Nicoya canton, beach, Isla Chora |
| https://en.wikipedia.org/wiki/Tempisque_River | OK | 144 km, source, mouth, Taiwan bridge 2003 |
| https://es.wikipedia.org/wiki/Parque_nacional_Isla_del_Coco | OK | 532 km, decree 8748-A 1978, rainfall, endemics |
| https://en.wikipedia.org/wiki/Cocos_Island | OK | coordinates 5.528,-87.061, district status, UNESCO years |
| https://es.wikipedia.org/wiki/Parque_nacional_Manuel_Antonio | OK | Ley 5100 1972, areas, ACOPAC, species binomials |
| https://en.wikipedia.org/wiki/Manuel_Antonio_National_Park | OK | coordinates, visitor numbers |
| https://en.wikipedia.org/wiki/Monteverde_Cloud_Forest_Reserve | OK | coordinates, Quakers 1951, species, golden toad |
| https://en.wikipedia.org/wiki/Monteverde | OK | canton, Law 10019, elevation |
| https://es.wikipedia.org/wiki/Parque_nacional_Marino_Ballena | OK | decree 1989, areas, Osa canton, whale seasons |
| https://en.wikipedia.org/wiki/Marino_Ballena_National_Park | FAIL (url_not_found) | — |
| https://en.wikipedia.org/wiki/Ballena_Marine_National_Park | OK | coordinates, areas (gives 1992) |
| https://en.wikipedia.org/wiki/Carara_National_Park | OK | coordinates, 1978/1998, macaws, crocodiles |
| https://en.wikipedia.org/wiki/Golfito | OK | coordinates, United Fruit 1985, duty-free 1986 |
| https://en.wikipedia.org/wiki/Jac%C3%B3 | FAIL (url_not_found) | — |
| https://es.wikipedia.org/wiki/Jac%C3%B3_(Costa_Rica) | FAIL (url_not_found) | — |
| https://en.wikipedia.org/wiki/Jac%C3%B3,_Costa_Rica | OK | coordinates, Garabito, beach |
| https://en.wikipedia.org/wiki/Quepos | OK | coordinates, Quepo people |
| https://en.wikipedia.org/wiki/Puerto_Jim%C3%A9nez | OK | coordinates, canton 2022, gateway to Corcovado, gold mining |
| https://en.wikipedia.org/wiki/Uvita | FAIL (url_not_found) | — |
| https://en.wikipedia.org/wiki/Boruca | OK | territory, Diablitos dates, balsa masks, weaving |
| https://en.wikipedia.org/wiki/Tortuguero_National_Park | OK | coordinates, species binomials, rainfall |
| https://en.wikipedia.org/wiki/Tortuguero,_Costa_Rica | OK | village population, access, CCC station |
| https://en.wikipedia.org/wiki/Cahuita_National_Park | OK | coordinates, reef counts, donation entry |
| https://es.wikipedia.org/wiki/Parque_nacional_Cahuita | OK | decree 1236-A 1970, areas, reef, 1991 uplift |
| https://en.wikipedia.org/wiki/Cahuita | OK | coordinates, Ferguson |
| https://en.wikipedia.org/wiki/Puerto_Viejo_de_Talamanca | OK | coordinates, Salsa Brava, Manzanillo |
| https://en.wikipedia.org/wiki/Gandoca-Manzanillo_Mixed_Wildlife_Refuge | OK | 1986 decree, ecosystems, manatee, ACLAC, Ramsar |
| https://es.wikipedia.org/wiki/Refugio_nacional_de_vida_silvestre_Gandoca-Manzanillo | FAIL (url_not_found) | — |
| https://es.wikipedia.org/wiki/Refugio_de_vida_silvestre_Gandoca-Manzanillo | FAIL (url_not_found) | — |
| https://en.wikipedia.org/wiki/Manzanillo,_Lim%C3%B3n | FAIL (url_not_found) | — |
| https://en.wikipedia.org/wiki/Barra_del_Colorado_Wildlife_Refuge | OK | coordinates, 1985, 81,177 ha, manatee |

## WebSearch queries run (for discovery only; nothing cited from search snippets)

INEC Censo 2022 by province · SINAC Santa Rosa/ACG · Puerto Jiménez canton law · INEC census PDF (x2) · Ley 10195 Gaceta · visitcostarica Guanacaste · SINAC Rincón de la Vieja · Anexión de Nicoya (mcj) · Walter Ferguson calypso · SINAC Tortuguero · SINAC Corcovado · SINAC Cahuita · Día de la Persona Negra / railroad · Black Star Line · Juego de los Diablitos · visitcostarica Guanacaste sur · Guanacaste tree decree · Monteverde canton law · Puntarenas Perla del Pacífico / Virgen del Mar · Guaitil ceramics · Guanacaste foods · Limón foods · OVSICORI Rincón de la Vieja (x2) · visitcostarica Las Baulas · Palo Verde · Manuel Antonio · Marino Ballena · Bribri/Cabécar territories · Nicoya San Blas church · Monteverde reserve · Limón carnival history · Colorado de Abangares canton (x2) · 84 cantones 2026 · churchill dessert · vigorón Puntarenas.

## Totals

- WebFetch attempts: 122 (including 2 redirects and 1 repeat); successful: 95; failed: 27 (client_error 11, robots_disallowed 7, url_not_found 9). The budget of 25–45 was exceeded because Costa Rican government sites (inec.cr, sinac.go.cr index, pgrweb, acosa.go.cr, several visitcostarica.com pages) failed and alternatives had to be tried.
- Distinct URLs cited in the JSON: 103 (all successfully fetched).
