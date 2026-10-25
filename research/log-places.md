# Fetch log — seven places for the scroll-driven homepage

Retrieval date: 2026-10-23. Tool: WebFetch (WebSearch used only to discover URLs — 18 searches; no search-result snippet was used as a fact). Output: `research/places.json`.

Budget note: the brief allowed ~45 WebFetch calls; **46 attempts were made** (43 returned content, 2 failed, 1 was a redirect notice followed in the next row). The UNESCO ACG page was read twice (once for the description, once for the printed coordinates). Two place-level items planned for ≤ 4 extra fetches (routeFacts: country width and road distances) found nothing in the two geography articles read and were dropped.

Legend: OK = fetched and used · OK/partial = fetched, little or no usable content · FAIL = not retrieved (reason) · REDIRECT = server redirect, followed in the next row.

## A. Monteverde (monteverde)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 1 | https://iucn.org/es/noticias/202607/reserva-biologica-bosque-nuboso-monteverde-ingresa-la-lista-verde-de-la-uicn-como | OK | IUCN news 6–7 Jul 2026: CCT manages the reserve; founded 1972; '4.125 hectáreas de bosque nuboso'; Cordillera de Tilarán; first Costa Rican protected area on the Green List; 'una de las primeras reservas privadas del mundo'. Used for area, founding, protectedArea. |
| 2 | https://en.wikipedia.org/wiki/Monteverde_Cloud_Forest_Reserve | OK | Coordinates; 'founded in 1972' (infobox 1973); Powell/TSC; 328 ha (1973); **'over 10,500 hectares' (uncited — contradicted by CCT, IUCN and the reserve site: 10,193 acres = 4,125 ha)**; six life zones (tourism site); 400 birds etc.; Quakers 1951, 11 families (citing CCT); golden toad 1989; 70,000 visitors. Used as approximate / contrast. |
| 8 | https://cloudforestmonteverde.com/ | OK | Reserve's official site: 'since 1972'; '10,193 acres protected'; 'Around 120,000 visitors annually'; 22 research projects (2024); 'IUCN Green List (2025)' (IUCN itself dates it July 2026). Used for area and visitors. |
| 11 | https://cloudforestmonteverde.com/wp-content/uploads/2025/07/Plan-de-Contol-y-Proteccion-PCP_RBBNM_CCT2025_FINAL.pdf | OK | CCT Plan de Control y Protección 2025: 'Cubre aproximadamente 4,125 hectáreas' (p. 8); 'Fundada en 1972'; 'gestionada por el Centro Científico Tropical'; Cordillera de Tilarán; four cloud-forest life zones; rivers Guacimal (Pacific) and Chiquito, Caño Negro, Peñas Blancas (Caribbean) (p. 9); 'cerca de 450 especies de aves' (p. 12); quetzal; Guacimal Land Company donation. No altitude range, no provinces. Primary source for the place. |
| 13 | https://delfino.cr/2021/08/aprobado-el-cantonato-de-monteverde-y-la-exigencia-a-partidos-de-dar-informacion-sobre-sus-aspirantes-en-elecciones | OK | Second-debate approval of expediente 21.618 on Wed 4 Aug 2021; 'cantón 12° de la Provincia de Puntarenas y el 83° del país'; single district; seat Santa Elena. Used for cantonCreated. |
| 26 | https://www.ambientico.una.ac.cr/wp-content/uploads/tainacan-items/5/27721/263_26-32.pdf | OK | Hernández (CCT general manager), Ambientico 263, 2017: donation accepted 6 Oct 1972; 328 ha → 4,100 ha; George Powell; Quaker community early 1950s; Wolf Guindon with Holdridge and Tosi; visitors 471 (1975), 49,793 (1994), >200,000/yr to the region; Corredor Biológico Pájaro Campana. Used for founding, Quakers, visitors. |
| 31 | https://acmcr.org/en/who-we-are/ | OK | Monteverde Conservation League: Bosque Eterno de los Niños 22,600 ha, 'largest private reserve in Costa Rica'; Swedish students 'in the late 1980s'; 44 countries. Used for childrensRainforest. |
| 36 | https://www.friendsjournal.org/the-quaker-stewards-of-costa-ricas-monteverde-cloud-forest/ | OK | Friends Journal 2023-12-01: Fairhope (Alabama) Quakers jailed for refusing the draft; emigrated 'in 1950 and 1951'; army abolished after 1948; $50,000 for 3,500 acres; cheese factory; 1951 forest set-aside; reserve 'established in 1972 by the Tropical Science Center and Quakers'; 23,000 ha Children's Eternal Rainforest. Its '26,000 hectares' for the reserve is wrong and was not used. |
| 38 | https://www.ambientico.una.ac.cr/wp-content/uploads/tainacan-items/5/27821/263_45-50.pdf | OK | Méndez & Pounds, Ambientico 263, 2017: 'Las 4 100 hectáreas que constituyen la reserva' in a >50,000 ha protected complex; golden toad described 1966, endemic, local population extinct; tourism boom late 1980s. No altitude/life zones. |
| 39 | https://es.wikipedia.org/wiki/Reserva_Biol%C3%B3gica_Bosque_Nuboso_Monteverde | FAIL (url_not_found) | Intended for altitude range / continental divide; not retried. |
| 44 | https://en.wikipedia.org/wiki/Monteverde | OK | Elevation 1,330 m (infobox) / 'roughly 1,400 m'; Puntarenas, Cordillera de Tilarán; Law 10019 signed 29 Sep 2021, 12th canton of Puntarenas, seat Santa Elena; settlers mostly from Fairhope, Alabama; 18 °C, ~3,000 mm (Nadkarni 2000); 250,000 tourists/yr to the area, 70,000 to the reserve (uncited); repeats '10,500-hectare'. Used for elevation (approximate) and canton law. |

## B. Río Celeste / Tenorio (rio-celeste)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 3 | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3776737/ | REDIRECT (302) | Followed to #7. |
| 7 | https://pmc.ncbi.nlm.nih.gov/articles/PMC3776737 | OK | Castellón et al., PLoS ONE 8(9): e75165, 18 Sep 2013 (UCR + UNA/OVSICORI): physical origin, suspended aluminosilicate particles, Mie scattering; ~566 nm after aggregation; 'Teñidero'; pH 3.1 / 6.8 / 5.0; zeta potential −27 → −1.3 mV; no Cu/Fe/Co; colour fades after ~14 km. Primary source for the colour facts. |
| 9 | https://es.wikipedia.org/wiki/Parque_nacional_Volc%C3%A1n_Tenorio | OK | Created 1995, decreto 24240-MIRENEM; Área de Conservación Arenal-Tempisque; Alajuela/Guanacaste, cantons Upala, Guatuso, Bagaces, Cañas, Tilarán; Tenorio 1,916 m; Teñideros = confluence of Buena Vista and Quebrada Agria; waterfall 'unos 20 metros'; Laguna Azul; Los Hervideros; area printed as a garbled '18.402.51 hectáreas'. |
| 16 | https://en.wikipedia.org/wiki/Tenorio_Volcano_National_Park | OK | Coordinates 10°40′23″N 85°0′54″W; 129 km² (uncited); 'established 1976', volcano added 1995; Guanacaste; Mie-scattering explanation citing Castellón et al. 2013. Used for coords and as the dissenting founding date. |
| 32 | https://www.sinac.go.cr/ES/ac/acat/pnvt/Paginas/default.aspx | FAIL (robots_disallowed) | One attempt as instructed; same failure as in log-central.md. |
| 33 | https://www.nacion.com/ciencia/medio-ambiente/por-que-el-rio-celeste-se-ve-de-ese-color/LJMJKEC47JHU3NTVSZVJIPUXNA/story/ | OK | La Nación 2013-08-27 (Ruiz Vega): UCR + UNA team led by Max Chavarría; optical not chemical; 566 nm vs 184 nm; acidic Quebrada Agria; Buena Vista. Used as press confirmation. |

## C. Irazú (irazu)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 5 | https://www.sinac.go.cr/ES/ac/accvc/pnvi/Paginas/default.aspx | OK | SINAC: 3,432 m, 'el volcán más alto de Costa Rica'; Ley 1917 of 30 Jul 1955; decree 26945-MINAE → 2,000 ha; five craters; 'En días despejados se pueden apreciar desde su cima tanto el océano Pacífico como el Atlántico'; 1723 (Diego de la Haya Fernández), 1963 Taras avalanche (~300 houses), 1994 north-wall explosion; 31 km from Cartago; hours/fees. Primary source. |
| 6 | https://volcano.si.edu/volcano.cfm?vn=345060 | OK | Smithsonian GVP: 3,436 m; 9.979°N 83.852°W; composite stratovolcano; main crater 'contains a small lake'; Diego de la Haya 'just to the SE'; 1963–65 ashfall; 1994 phreatic/landslide; last known eruption 1977. Used for coords, elevation contrast, lake. |
| 12 | https://www.kerwa.ucr.ac.cr/items/283b0174-e35d-4f6b-816b-d712a21c0d38/full | OK | Ramírez, Cordero & Alvarado, Rev. Geol. Amér. Central 48 (2011): lake colour 'verde, turquesa azulado a amarillo'; 31 m in 1995 and 2001; dry 1977, 1979, 1982–83, 1987, 1990; cracks drain and reseal; not tied directly to rainfall. Primary source for the lake. |
| 28 | https://www.teletica.com/nacional/lago-del-volcan-irazu-se-esta-secando-nuevamente_247141 | OK | Teletica 2020-01-29: lake ~3 m, expected to vanish in ~3 weeks; 30 m in 2001; internal movement and cracks; rangers quoted. |

## D. Guanacaste (guanacaste)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 4 | https://ich.unesco.org/en/RL/oxherding-and-oxcart-traditions-in-costa-rica-00103 | OK | UNESCO ICH: inscribed 2008 (3.COM), 'originally proclaimed in 2005'; coffee to Puntarenas 10–15 days; spokeless wheels; painting from the early 20th century, regional designs; chime of the hubnut; parades today; artisans declining. 'Sarchí' and 'boyeros' not in the description. |
| 10 | https://whc.unesco.org/en/list/928/ | OK | UNESCO WHC: inscribed 1999, modified 2004 (St Elena 15,000 ha); (ix)(x); 147,000 ha = 104,000 land + 43,000 marine; 'best dry forest habitats from Central America to northern Mexico'; Pacific-to-Caribbean gradient; species counts; Olive Ridley; natural restoration. |
| 14 | https://www.sinac.go.cr/ES/ac/acg/Paginas/default.aspx | OK | SINAC ACG: components (Santa Rosa, Guanacaste, Rincón de la Vieja, Horizontes, Bahía Junquillal); 'aproximadamente 235,000 especies (65% del estimado de las especies en Costa Rica)'; 2.6 % of world biodiversity; Biodesarrollo. No area, no dates. |
| 15 | https://www.gdfcf.org/content/history-how-acg-came-be-acg | OK/partial | GDFCF history: Santa Rosa inaugurated 1971 (Álvaro Ugalde); ~30,000 ha then, ~169,000 ha now; Janzen & Hallwachs BioTropica history; 1985 conversion to ACG. |
| 17 | https://www.archivonacional.go.cr/web/educativo/ANCR_25jul_AnexionNicoya.pdf | OK | Archivo Nacional transcript of the 25 Jul 1824 act (Nicoya; Santa Cruz; 'a ecepción del Guanacaste'; 26 useless rifles; fear of Nicaragua). |
| 18 | https://www.crhoy.com/estos-son-los-3-simbolos-nacionales-que-representan-a-guanacaste/ | OK | CR Hoy 2024-07-25: guanacaste tree 'Decreto Ejecutivo N°7 del 24 de agosto de 1959'; Pinaud's motive (Anexión); marimba 3 Sep 1996 (25114-C); white-tailed deer 1995. |
| 21 | https://www.gdfcf.org/sites/default/files/publications/Janzen%2CD.H.%202000.%20Long%20march%20to%20survival%20of%20ACG.pdf | OK | Janzen 2000: 1966 monument (Law 3694, 1,000 ha around the Casona); 'Parque Nacional Santa Rosa (Executive Decree 1562-A in 1971)'; Sept 1985 plan, restore ~700 km²; fire control; 40,000 ha of pasture regenerating; ≥20,000 ha bought; 2 % of the country; parataxonomists; citation 'Tropical dry forests: the most endangered major tropical ecosystem' (Janzen 1988b). Primary source for restoration. |
| 34 | https://www.nacion.com/archivo/desfile-de-boyeros-y-carretas-brillo-tras-declaratoria-de-unesco/I2ENUPO47JGVTFD5TXEQ73QSDM/story/ | OK | La Nación 2005-11-28 (ACAN-EFE): UNESCO declared the carreta 'Obra Maestra del Patrimonio Oral e Inmaterial de la Humanidad'; ~350 boyeros paraded in San José; carts since the mid-19th century; Sarchí 'la cuna de la artesanía en madera de las carretas'; mainly red designs. |
| 37 | https://acguanacaste.ac.cr/1997/acging.html | OK | ACG page last modified 5 Aug 1997: 120,000 terrestrial + 70,000 marine ha; 'express purpose of restoring an entire ecosystem of dry forest'; ~230,000 species (65 %). |
| 41 | https://www.teletica.com/nacional/asi-es-un-dia-en-la-vida-del-verdadero-sabanero-guanacasteco_389227 | OK | Teletica 2025-07-25: sabanero 'personaje emblemático de la cultura guanacasteca'; hat 'símbolo de su envestidura'; horse; 'burra' lunch; 'experto lazador'. Used for sabanero culture. |
| 45 | https://whc.unesco.org/en/list/928/ (second read) | OK | Printed coordinates 'N10 50 60 W85 37 0' (= 10.85, −85.6167); 'Guanacaste and Alajuela provinces'; Santa Rosa 1971. Used for coords and provinceNote. |

## E. Manuel Antonio (manuel-antonio)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 19 | https://www.visitcostarica.com/where-to-go/protected-areas/manuel-antonio-national-park | OK | ICT: '683 hectares' (body) vs '1953 land hectares' + '25634 marine hectares' (directions); beaches Espadilla Sur, Manuel Antonio, Puerto Escondido; Cathedral point; squirrel monkey ~1,500; 12 islands, 14-ha lagoon; SICORE; 'Tuesday to Sunday'; ~104 km to Quepos. Meta description describes Tortuguero (ignored). |
| 23 | https://en.wikipedia.org/wiki/Manuel_Antonio_National_Park | OK | 'established in 1972' (citing SINAC); 1,983 ha + 25,634 ha (uncited); coords; 'one of the smaller'; closed Tuesdays; 4,388,460 visitors 2012–22 (El Financiero); tombolo; 109 mammals, 184 birds; IUCN Endangered squirrel monkey; Forbes 2011; Central Pacific Conservation Area. |
| 27 | https://www.larepublica.net/noticia/parque-manuel-antonio-podra-recibir-hasta-tres-mil-turistas-diariamente | OK | La República 2023-03-02: cap 'pasó de 2 mil a 3 mil por día' (SINAC); treatment-plant rationale; 329,000 (2021) → 366,000 (2022); 'uno de los Parques Nacionales más visitados del país'. |

## F. Corcovado (corcovado)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 20 | https://www.visitcostarica.com/where-to-go/protected-areas/corcovado-national-park | OK | ICT: 41,788 ha; 46 km of beach; habitats; 6,000 insects, 500 trees, 367 birds, 140 mammals, 117 amphibians+reptiles, 40 fish; guide mandatory; Sirena by plane; access points. Meta description describes Tortuguero (ignored). |
| 22 | https://en.wikipedia.org/wiki/Corcovado_National_Park | OK | 24 Oct 1975 (uncited); 424 km²; coords; ACOSA; 'largest primary forest on the American Pacific coastline' (uncited); tapir endangered; macaw largest population (uncited); 2.5 % (BBC/SINAC); guides since 2014. **No 'most biologically intense' phrase.** |
| 35 | https://www.meteored.com.ar/noticias/actualidad/el-lugar-mas-intenso-biologicamente-del-planeta-national-geographic.html | OK | Meteored 2024-10-07: phrase attributed to National Geographic without citing an article; 41,788 ha; 2.5 %; 50 % of CR species. |
| 42 | https://www.teletica.com/masqn/lo-llevamos-a-recorrer-corcovado-el-parque-nacional-mas-importante-del-planeta_330020 | OK | Teletica 2023-03-02: declared 1975; >42,000 ha + 3,354 ha sea (also an inconsistent '560 km²'); 'según la revista National Geographic'; species counts; 'la población más alta de lapas rojas de Costa Rica'; jaguars; all monkey species; sectors; 10 rangers. |

## G. Tortuguero (tortuguero)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 24 | https://www.acto.go.cr/wp-content/uploads/2023/01/BrochPNTEsp.pdf | OK | SINAC/ACTo brochure: 26,653 ha land, 50,284 ha marine; Ramsar 1996; 442 birds, 138 mammals, 118 reptiles; 'Tortuga verde: julio a octubre'; baula March–May; hatchlings Sept–Dec; six named caños; rules. No creation date, no rainfall. |
| 25 | https://www.visitcostarica.com/where-to-go/protected-areas/tortuguero-national-park | OK | ICT: declared 24 Sep 1970; extensions 1980/1995/1998; 64,701.45 → 76,937 ha; 26,653 + 50,284 ha; 'largest green turtle nesting beach in the Western Hemisphere'; boats only; villages; bicycles; access routes. |
| 29 | https://conserveturtles.org/?p=237 | OK | Sea Turtle Conservancy history: 1955 tagging programme under Carr; 1959 CCC incorporated; Carr scientific director to 1987; 1970 park with CCC; 1994 Phipps station. |
| 30 | https://en.wikipedia.org/wiki/Tortuguero_National_Park | OK | Infobox 1975, 312 km²; coords; 'up to 250 inches (6,400 mm)'; 'reachable only by airplane or boat'; canals/lagoons; 'second-largest green sea turtle nesting beach in the world'; species; ACTo; nesting 'February to July' (contradicts the brochure). |

## H. routeFacts (dropped)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 40 | https://en.wikipedia.org/wiki/Geography_of_Costa_Rica | OK/partial | Area 51,179.92 km² (IGN 2021); coastline 212 / 1,016 km (infobox 1,290); **no width between the oceans, no distances**. Not cited in JSON. |
| 43 | https://es.wikipedia.org/wiki/Geograf%C3%ADa_de_Costa_Rica | OK/partial | Valle Central 'altitud promedio de 1.000 m', 18–24 °C, 'donde vive la mayoría de la población'; **no width, no road distances**. Not cited in JSON. |

## WebSearch calls (discovery only, 18)

Queries: CCT Monteverde reserve (×2); Castellón 2013 PLoS ONE; UNESCO oxcart ICH; Corcovado 'most biologically intense' (×2); RSN Irazú lake (×2); visitcostarica Tenorio; ACG/Santa Rosa 1971 Janzen; Manuel Antonio visitor cap; Sea Turtle Conservancy Tortuguero; Bosque Eterno de los Niños; La Nación Río Celeste 2013; Sarchí carretas; Monteverde Quakers 1951; SINAC Corcovado; sabanero guanacasteco. No search result was cited as a source.

## Notes on source quality

- **Official Costa Rican sources actually read:** SINAC (Irazú page; ACG page), SINAC/ACTo Tortuguero brochure (acto.go.cr), ICT visitcostarica.com (Manuel Antonio, Corcovado, Tortuguero), Archivo Nacional (1824 act), ACG's own site (1997 page), Centro Científico Tropical (reserve site and 2025 management plan), UCR (Kérwa repository record of Revista Geológica de América Central), UNA (Ambientico ×2).
- **International / peer-reviewed:** PLoS ONE via PMC (Castellón et al. 2013), UNESCO WHC (ACG) and ICH (oxcart), Smithsonian GVP (Irazú), IUCN news (Monteverde Green List), Sea Turtle Conservancy, Janzen 2000 (hosted by GDFCF), Monteverde Conservation League.
- **Blocked / missing:** sinac.go.cr Tenorio page (robots); es.wikipedia Monteverde reserve page (url_not_found); SINAC pages for Manuel Antonio, Corcovado and Tortuguero were not found by search and not attempted blind.
- **Press only:** Manuel Antonio 3,000/day cap (La República 2023), Irazú lake 2020 (Teletica), oxcart 2005 proclamation wording (La Nación), Sarchí (La Nación 2005), sabanero (Teletica 2025), Corcovado 'National Geographic' attribution (Teletica 2023, Meteored 2024), national-tree decree (CR Hoy 2024).
- **Wikipedia only:** coordinates of five places; Manuel Antonio 1972 and 1,983 ha; Corcovado 24 Oct 1975; Tortuguero rainfall 6,400 mm and plane access; Tenorio 129 km² / 1976; Monteverde elevation 1,330–1,400 m, 3,000 mm rain.
- **Key corrections for the site:** (1) Monteverde reserve ≈ 4,125 ha (= 10,193 acres), not 10,500 ha — Wikipedia's figure is the acre count mislabelled. (2) Both oceans from Irazú is an official SINAC statement, not folklore. (3) The oxcart tradition was proclaimed a Masterpiece in 2005 and inscribed in 2008 — both confirmed. (4) Manuel Antonio's daily cap is 3,000 (since March 2023), not 600 or 1,200. (5) Tortuguero green-turtle season July–October is official (SINAC brochure); Wikipedia's 'February to July' is wrong for the green turtle. (6) 'Most biologically intense place on Earth' is attributed to National Geographic only second-hand; the original article was not found.
- **Discrepancies recorded in the JSON:** Monteverde area 4,100 / 4,125 ha vs 10,500 'ha'; Monteverde founding 1972 vs 1973; life zones 4 vs 6; visitors 70,000 / 120,000 / 200,000+; Tenorio park 1976 vs 1995, 129 km² vs '18,402.51 ha'; Irazú 3,432 vs 3,436 m; ACG 147,000 (UNESCO) / 190,000 (1997) / 169,000 ha (GDFCF); species 230,000 vs 235,000; Manuel Antonio land 683 / 1,953 / 1,983 ha, closing day Monday vs Tuesday; Corcovado 41,788 ha / 424 km² / '560 km²'; Tortuguero 1970 vs 1975, 76,937 ha vs 312 km².
- **Arithmetic checks** (`python3`): 10,193 acres × 0.40468564 = 4,125.0 ha; 'N10 50 60 W85 37 0' = 10.85°N, 85.6167°W.
