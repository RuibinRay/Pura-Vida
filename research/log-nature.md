# Fetch log — geography & biodiversity facts ("A small country, extraordinary nature")

Retrieval date: 2026-10-23. Tool: WebFetch (WebSearch used only to discover URLs — 20 searches; no search-result snippet was used as a fact). Output: `research/nature-facts.json`.

Budget note: the brief allowed 30–45 WebFetch calls; **57 attempts were made** (46 returned content, 8 of those with little or no usable content; 9 failed outright, 2 were redirect notices that were then followed). The overrun came from blocked official sites (sinac.go.cr, repositorio.una.ac.cr, ovsicori.una.ac.cr, amphibiaweb.org, worldbank.org) that forced one or two fallbacks per fact. Research stopped at that point; the remaining gaps are in `nature-facts.json` → `unverified`.

Legend: OK = fetched and used · OK/partial = fetched, little or no usable content · FAIL = not retrieved (reason) · REDIRECT = server redirect, followed in the next row.

## A. Biodiversity share, known species (biodiversityShare, speciesKnown)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 1 | https://www.cbd.int/countries/profile?country=cr | OK | CBD draft country profile: 'Since 2010, forest cover has been maintained at 52%'; terrestrial ecosystems 28,419.32 km² (55.6 %). No biodiversity-share wording. Used for forestCover. |
| 2 | https://www.teletica.com/nacional/las-cifras-que-destacan-a-costa-rica-en-el-dia-mundial-de-la-diversidad-biologica_335285 | OK | Press version of the claim (2023-05-22): ~6 % of world biodiversity, 0.03 % of surface, ~500,000 species, '32 parques nacionales' (unsourced). Used for biodiversityShare, nationalParksCount. |
| 3 | https://www.undp.org/es/node/41101 | OK | UNDP CR 2019-05-27: 'Costa Rica alberga 6,5% de la biodiversidad mundial'; 'más de 120 mil especies conocidas'; 26.51 % land / 2.75 % marine protected. |
| 4 | https://www.undp.org/sites/g/files/zskgke326/files/migration/cr/undp_cr_EstadodelaBiodiversidad_19.pdf | REDIRECT (302) | Followed to #5. |
| 5 | https://files.acquia.undp.org/public/migration/cr/undp_cr_EstadodelaBiodiversidad_19.pdf | OK | Resumen del Sexto Informe Nacional (MINAE–SINAC–CONAGEBIO–FONAFIFO 2018): 'más del 6% de la biodiversidad a nivel mundial (SINAC, 2014)'; Table 3: 121,693 species known (2015) of 1,853,299 worldwide; >27 % territory protected; forest cover >50 % since 2010. Per-group table garbled. Used for biodiversityShare, speciesKnown, forestCover. |
| 6 | https://embcr-uae.org/environment/ | OK/partial | Embassy of Costa Rica (UAE) site under maintenance; nothing usable. |
| 7 | https://www.sinac.go.cr/EN-US/Pages/default.aspx | FAIL (robots_disallowed) | Tried once as instructed; recorded as negative source under nationalParksCount. |
| 8 | https://www.untourism.int/es/archive/press-release/2017-05-08/la-omt-nombra-al-presidente-de-costa-rica-embajador-especial-del-ano-intern | OK | OMT/UN Tourism PR 17057 (2017-05-10): 'Costa Rica alberga el 5% de la biodiversidad mundial'; >25 % protected. |
| 9 | https://revistas.uned.ac.cr/index.php/biocenosis/article/download/1203/1239/2667 | OK | UNED Biocenosis 24(1-2) 2011 (Roldán Chacón), citing SINAC 2009: ~95,000 species ≈ 4.7 %; 51,100 km² = 0.03 % of world land; marine 568,000 km² = 0.16 % of oceans; plants 96 % / vertebrates 87 % described. |
| 10 | https://www.cbd.int/doc/world/cr/cr-nr-05-es.pdf | OK | SINAC 2014 V Informe: 'aproximadamente el 5% de la biodiversidad que se conoce en todo el mundo'; '0,03% de la superficie terrestre mundial'; 94,753 known species (2013); 'poco más de medio millón'; 28 national parks + 8 biological reserves; 26 % land / 3 % marine; forest cover 52.3 % (2010) → 52.4 % (2013); global rank 17 plants, 13 amphibians, 20 reptiles, 24 birds, 32 mammals. Primary source for biodiversityShare, speciesKnown, nationalParksCount, forestCover. |
| 27 | https://www.cbd.int/doc/world/cr/cr-nr-04-es.pdf | OK | SINAC-MINAET 2009 IV Informe: 4.75 % / 4.7 %; 0.03 %; known species by group (plants 11,467; vertebrates 2,664; mammals 237; birds 854; reptiles 234; amphibians 189; fishes 1,150; insects 68,494 of 365,000; fungi 3,820); orchids ~1,416; trees ~2,000; 26.2 % land protected. Used for biodiversityShare, speciesKnown, plantSpecies, mammal/amphibian/reptile/butterfly context. |

## B. Birds (birdSpecies)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 11 | https://uniondeornitologos.com/ | OK/partial | Domain-for-sale page (NamePros); no list hosted. Recorded as negative source. |
| 12 | https://repositorio.una.ac.cr/items/1b618432-be28-4f4f-827d-585e063395cd | FAIL ('Request Rejected', bot filter BOT-CGT) | Lista Oficial 2019 record not readable. |
| 13 | https://www.ultimahora.com/ornitologos-anuncian-una-nueva-especie-ave-endemica-costa-rica-n1097180 | OK | EFE via Última Hora 2017-07-18: Unión de Ornitólogos — '920 especies de aves, de las cuales siete son endémicas'. |
| 14 | https://ornneo.journals.publicknowledgeproject.org/index.php/ornneo/article/download/877/583/5435 | OK/partial | Only supplementary tables; confirms citation 'Garrigues et al. 2019, Lista Oficial de las Aves de Costa Rica actualización 2019, Zeledonia 23:2'. Not cited in JSON. |
| 15 | https://repositorio.una.ac.cr/bitstreams/18dd0a9f-27b3-4deb-97b6-3ef4837ee937/download | FAIL ('Request Rejected', bot filter) | Second and last attempt at the UNA repository. |
| 16 | https://avibase.bsc-eoc.org/checklist.jsp?region=CR | OK | Avibase: 956 species, 8 endemics, 38 threatened, 5 introduced; Clements 2025; last modified 2026-02-17. |
| 17 | https://nicoyapeninsula.com/img/wildlife/costa-rica-bird-list-2025.pdf | OK | Copy of 'Lista Oficial de las Aves de Costa Rica 2025–2026' (October 2025; Comité de Especies Raras y Registros Ornitológicos, Comité Científico – AOCR; Garrigues et al.): 'Official Species (942)'. Host is a tour operator → status approximate. |

## C. Mammals, amphibians, reptiles, plants, butterflies

| # | URL | Result | Use |
|---|-----|--------|-----|
| 18 | https://reptile-database.reptarium.cz/advanced_search?location=Costa+Rica&submit=Search | OK | 'Species found: 254' (distribution: Costa Rica). |
| 19 | https://therya.mastozoologiamexicana.com/index.php/THERYA/article/view/233 | OK | Ramírez-Fernández et al. 2023, Therya 14(2): '256 mammals are now confirmed for Costa Rica'; 30 endemics. |
| 20 | https://amphibiaweb.org/cgi/amphib_query?where-isocc=Costa%20Rica&rel-isocc=like | FAIL (server error) | — |
| 21 | https://delfino.cr/2025/07/mas-de-5000-anfibios-y-reptiles-fueron-registrados-en-segundo-conteo-nacional | OK/partial | National herp count 2025 (171 species = >36 % of known herpetofauna); no national totals. Not cited. |
| 22 | https://revistas.ucr.ac.cr/index.php/rbt/article/view/64536 | REDIRECT (302) | Followed to #23. |
| 23 | https://archivo.revistas.ucr.ac.cr//index.php/rbt/article/view/64536 | OK | Sasa, Arias & Chaves 2025, Rev. Biol. Trop. 73(S2): '221 species of amphibians and 257 species of reptiles in Costa Rica'. |
| 24 | https://revistas.una.ac.cr/index.php/ambientales/article/download/11378/14684/40583 | OK/partial | Ossenbach 2018 on Lankester (history); no national plant totals. Not cited. |
| 25 | https://jbl.ucr.ac.cr/ | OK/partial | Jardín Botánico Lankester home; no orchid total on the page. Not cited. |
| 26 | https://archivo.revistas.ucr.ac.cr/index.php/lankesteriana/article/view/58145 | OK | Pupulin, Bogarín & Karremans 2023, Lankesteriana 23 Suppl.: 1,684 orchid species, 201 genera, ~30 % endemic. |
| 28 | https://www.nacion.com/ciencia/mariposas-ticas-generan-1-millon-al-ano/O2D6S66TCVGWTNWCBCN26C4EQE/story/ | OK | La Nación 2007-01-29 quoting INBio's José Montero: 150,000 Lepidoptera worldwide, 12,000–14,000 in Costa Rica, ~8 % exclusive. |
| 29 | https://www.scielo.sa.cr/pdf/rbt/v56n2/art45v56n2.pdf | OK/partial | RBT 56(2) 2008 review of 'Mariposas de Costa Rica' (Chacón & Montero 2007, INBio); no species total. Cited as bibliographic support only. |
| 30 | https://elmundo.cr/economia-y-negocios/mariposarios-del-pais-se-daran-cita-en-la-ucr/ | OK | El Mundo CR 2019-02-14: 'más de 12 000 especies de mariposas nocturnas y 1500 especies diurnas' (unsourced). |

## D. Coastlines (coastlines)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 31 | https://www.ambientico.una.ac.cr/wp-content/uploads/tainacan-items/5/21637/209_3-4.pdf | OK | Arroyo (UNA) 2011: Caribbean coast 'existen solamente 212 km', a fifth of the Pacific coast. |
| 32 | https://es.wikipedia.org/wiki/Geograf%C3%ADa_de_Costa_Rica | OK | 1,228 km total (1,016 Pacific / 212 Caribbean; another section 1,236 / 220, unreferenced); cordilleras with peaks; 'cerca de 200 volcanes, 5 activos' (unsourced). Used for coastlines, mountainRanges, volcanoes (as unsourced contrast), arenalLake (1,670 m). |
| 33 | https://dialnet.unirioja.es/descarga/articulo/4796486.pdf | OK | Rojas León 2008, Revista Reflexiones 87(1) (UCR): Pacific 1,254 km (MINAE-PNUMA 2002), Caribbean 212 km. |
| 34 | https://www.rnpdigital.com/Estado%20Limites%20Maritimos%20de%20CR-IGN.pdf | OK/partial | IGN maritime-limits presentation: Pacific EEZ ~530,903.60 km²; no coastline lengths. Not cited. |
| 45 | https://en.wikipedia.org/wiki/Geography_of_Costa_Rica | OK | '212 km of Caribbean Sea coastline and 1,016 on the North Pacific'; infobox 1,290 km; cordilleras; '29 national parks' (garbled); >25 % protected. Used for coastlines, mountainRanges, nationalParksCount. |

## E. Volcanoes, Arenal, Lake Arenal (volcanoes, arenalLake)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 35 | https://www.ovsicori.una.ac.cr/index.php/vulcanologia/volcanes-de-costa-rica | FAIL (server error) | Same failure as in the earlier country task; not retried. |
| 36 | https://jvolcanica.org/ojs/index.php/volcanica/article/view/65 | OK | Avard et al. 2021 abstract page: 'Costa Rica hosts ten volcanic complexes'; 'five historically active volcanoes'; author affiliations OVSICORI-UNA, RSN, CNE. |
| 37 | https://jvolcanica.org/ojs/index.php/volcanica/article/download/65/122/3233 | OK | Full text: names the five (Rincón de la Vieja, Arenal, Poás, Irazú, Turrialba, 'actividad histórica (desde 1700)'); 10 complexes; Barva, Platanar-Porvenir dormant; Arenal 29 Jul 1968 Pelean eruption, 78 deaths, activity 'finalizó en octubre del 2010'; cordilleras Guanacaste/Central volcanic, Talamanca non-volcanic; OVSICORI 1985, RSN 1982. |
| 38 | https://rsn.ucr.ac.cr/index.php/component/content/article/arenal?catid=22 | OK | RSN Arenal: '~1750 m.s.n.m'; Alajuela, ~7 km WSW of La Fortuna, cordillera de Tilarán; 29 Jul 1968; repose 'a partir de enero del 2011'; 81 deaths overall. |
| 39 | https://volcano.si.edu/volcano.cfm?vn=345033 | OK | Smithsonian GVP: 1,670 m; stratovolcano; 10.463°N 84.703°W; eruptive period 1968 – December 2010; 1968 'kills 65'. |
| 40 | https://www.nacion.com/el-pais/servicios/arenal-el-mayor-complejo-energetico-de-costa-rica/QE33IK6XNFFTDESYFQXL3UCMOA/story/ | OK | La Nación 2019-12-04: reservoir 87 km²; works from 1974; Arenal plant inaugurated 1979-12-09; Dengo 1982, Sandillal 1992; 363.37 MW; Arenal–Tempisque irrigation. |

## F. Life zones, mountain ranges (lifeZones, mountainRanges)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 41 | https://www.ambientico.una.ac.cr/wp-content/uploads/tainacan-items/5/27642/263_7-13.pdf | OK/partial | Jiménez-Saa 2017 on Holdridge (biography); no Costa Rica life-zone count. Not cited. |
| 42 | https://meetingorganizer.copernicus.org/EGU2019/EGU2019-12725.pdf?pdf | OK/partial | EGU 2019 abstract (Dehaspe, Birkel UCR, Capell): 'reduction from 11 to only 6 life zones' → baseline 11. Cited as a dissenting count. |
| 43 | https://restoration.elti.yale.edu/node/89079 | OK/partial | Reference entry for Kohlmann et al. 2010: 'across 12 Holdridge Life Zones in Costa Rica'. |
| 44 | https://d9.cientec.or.cr/exploraciones/ponencias2007/RupertoQuesada.pdf | OK | Quesada Monge (TEC) 2007: '12 zonas de vida y 12 zonas de transición'; CCT map Bolaños, Watson & Tosi 2005 (1:750,000); forest 2,315,400 ha (45.4 %) per the 2005 study. Primary source for lifeZones. |
| 46 | https://www.inavirtual.ed.cr/pluginfile.php/2861737/mod_resource/content/1/Vegetacion%20de%20Costa%20Rica%20%28v-asec%29.pdf | OK | INA course chapter: '17 zonas de vida' (incl. transitions); names cordilleras Tilarán, Guanacaste, Talamanca, Volcánica Central. Used for lifeZones (dissent) and mountainRanges. |

## G. Forest cover and PSA (forestCover)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 47 | https://www.fonafifo.go.cr/ | OK/partial | Home page; no figures ('Más de 25 años de experiencia en el negocio de carbono'); links to PSA statistics. Not cited. |
| 48 | https://www.fonafifo.go.cr/es/servicios/estadisticas-de-psa/ | OK/partial | Statistics index (datasets to Aug 2026) but figures only in linked .docx/.pdf files; no totals on the page. Not cited. |
| 49 | https://delfino.cr/2023/09/el-positivo-aumento-de-cobertura-forestal-en-costa-rica | OK | Delfino/MOXIE 2023-09-11: alternative series citing Sánchez 2015 (59.5 % 1960 → 40 % 1986 → 50.4 % 2010); 52.4 % in 2013; Ley 7575 art. 19. |
| 50 | https://www.worldbank.org/en/results/2015/12/16/costa-rica-improves-the-efficiency-of-its-payment-for-environmental-services-program.print | FAIL (client_error) | — |
| 51 | https://unfccc.int/es/node/256478 | OK | UNFCCC Momentum for Change (2020 award): forests >50 % in 1950, 25 % by 1995; FONAFIFO; fuel tax + water charge; >1.3 million ha; USD 524 million; 18,000+ families 1997–2019. |
| 52 | https://unfccc.int/files/land_use_and_climate_change/lulucf/application/pdf/060830_ulate.pdf | OK | Government of Costa Rica slides, UNFCCC Rome workshop 2006: PSA under Forestry Law 7575 with fuel-tax funding; 1997–2005 ~500,000 ha, ~USD 120 million, ~7,000 families; deforestation ~55,000 ha/yr 1960s–80s. Chart values unlabeled. |
| 53 | https://www.sirefor.go.cr/pdfs/publicaciones/FRA-FAO_2020-COSTA_RICA.pdf | OK | FAO FRA 2020 Costa Rica (prepared by SINAC): forest 3,034.87 thousand ha in 2020 = 59.44 % of land; 55.96 % (2000), 56.23 % (2010), 57.83 % (2015); includes secondary forest. Primary source for forestCover value. |
| 54 | https://www.cbd.int/doc/meetings/ecr/cbwecr-2014-09/other/cbwecr-2014-09-presentation-10-es.pdf | OK | FONAFIFO (Oscar Sánchez) 2014 CBD workshop slides: cover 75 % (1950), 53 % (1961), 31 % (1977), 21 % (1987), 42 % (1997), 51 % (2005); Ley Forestal 7575 (1996) arts. 3 k, 69. |

## H. National parks (nationalParksCount)

| # | URL | Result | Use |
|---|-----|--------|-----|
| 55 | https://delfino.cr/2026/08/puntarenas-sera-sede-de-la-celebracion-nacional-por-el-dia-de-los-parques-nacionales | OK/partial | 2026-08-19: ~26 % land / >30 % marine protected; 11 conservation areas; no park count. Not cited in JSON (already used in country.json). |
| 56 | https://www.teletica.com/nacional/tesoros-escondidos-estos-parques-nacionales-estan-fuera-del-radar-turistico_409873 | OK/partial | 2026-06-03: SINAC visitation 2,970,516 (2025); no park count. Not cited. |
| 57 | https://www.nacion.com/el-pais/la-paradoja-ambiental-de-costa-rica-cada/YZYHUMK7MRCDLN2SYBRGBFGMHY/story/ | OK/partial | 2026-07-11: state natural heritage 9,703 km² (SINAC); no park count. Not cited. |
| — | https://es.wikipedia.org/wiki/Parques_nacionales_de_Costa_Rica | not fetched in this task | Cited in JSON for '30 national parks' on the strength of the earlier country-facts task (log-country.md #56); should be re-read if an exact count is ever needed. |

## WebSearch calls (discovery only, 20)

Queries covered: CBD country profile / 0.03 % claim; Sexto Informe Nacional; '5% world biodiversity' embassy; uniondeornitologos list (×3); mammals checklist; amphibian counts; Manual de Plantas / vascular plants (×2); Lankesteriana orchid checklist; butterflies (×1); coastline lengths (×2); volcano counts; OVSICORI Arenal; Lake Arenal/ICE; Holdridge life zones (×2); FONAFIFO forest cover; World Bank forest cover; FAO FRA 2020; SINAC national parks. No search result was cited as a source.

## Notes on source quality

- **Official Costa Rican sources actually read:** SINAC's IV (2009) and V (2014) national reports and the VI report summary (MINAE–SINAC–CONAGEBIO–FONAFIFO 2018) via the CBD and UNDP mirrors; FAO FRA 2020 country report prepared by SINAC (via SIREFOR, a SINAC site); FONAFIFO slides (via the CBD); Government of Costa Rica slides (via UNFCCC); RSN-UCR Arenal page; UCR journals (Revista de Biología Tropical, Lankesteriana, Revista Reflexiones); UNA journals (Ambientico, Biocenosis via UNED); TEC conference paper; INA course material.
- **Blocked official sites:** sinac.go.cr (robots), repositorio.una.ac.cr (bot filter ×2), ovsicori.una.ac.cr volcano list (server error), fonafifo.go.cr (reachable but figures only in downloadable files), worldbank.org results page (client error), amphibiaweb.org (server error). uniondeornitologos.com is a domain-for-sale page.
- **International/peer-reviewed:** Volcanica (Avard et al. 2021, OVSICORI/RSN authors), Therya (mammals 2023), Smithsonian GVP, Avibase, Reptile Database, UN Tourism, UNFCCC, UNDP, CBD.
- **Press only:** butterflies (El Mundo CR 2019, La Nación 2007), Lake Arenal area (La Nación 2019), the '32 national parks' figure (Teletica 2023).
- **Wikipedia only:** Pacific coast 1,016 km / total 1,228–1,290 km; 'cerca de 200 volcanes' (unsourced, recorded only as contrast); 30 national parks (es), 29 (en).
- **Discrepancies recorded in the JSON:** biodiversity share 4.7 % / 5 % / 6 % / 6.5 %; known species 94,753 (2013) vs 121,693 (2015); birds 920 (2017) / 942 (official list 2025) / 956 (Avibase); reptiles 254 / 257; Arenal 1,670 m (GVP) vs ~1,750 m (RSN); end of Arenal activity Oct 2010 / Dec 2010 / Jan 2011; 1968 deaths 65 / 78 / 81 (overall); Pacific coast 1,016 vs 1,254 km; life zones 11 / 12 / 17; forest cover 1987 21 % vs 1986 40 %; 2013 52.4 % (national map) vs 2020 59.44 % (FAO definition); national parks 28 (2014) to 32 (press 2023).
- **Arithmetic check** (`python3`): 51,179.92 km² ÷ 510,072,000 km² = 0.0100 % of the Earth's total surface; ÷ 148,940,000 km² = 0.0344 % of land area. The '0.03 %' claim is a land-surface ratio.
