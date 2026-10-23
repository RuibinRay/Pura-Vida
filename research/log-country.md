# Fetch log — country facts, national symbols, peaks, protected areas

Retrieval date: 2026-10-23. Tool: WebFetch (WebSearch used only to locate URLs; search-result snippets were never used as facts).
Budget: 25–45 fetches planned; 63 WebFetch attempts made (several were retries against failed sites). Research stopped at that point; gaps are recorded in `country.json` → `unverified`.

Legend: OK = fetched and used · OK/partial = fetched, little usable content · FAIL = not retrieved (reason).

## A. National symbols

| # | URL | Result | Use |
|---|-----|--------|-----|
| 1 | https://www.presidencia.go.cr/simbolos-nacionales/ | OK | Primary list of 15 symbols with years (page submitted 2023-10-30; stops at Café 2020). Only Ley 9815 numbered. Names used verbatim. |
| 2 | https://observador.cr/el-colibri-ya-es-simbolo-nacional-el-numero-19-de-costa-rica/ | FAIL (robots_disallowed) | — |
| 3 | https://bufetedecostarica.com/declaratoria-de-las-mascaradas-como-simbolo-nacional-en-costa-rica-10239/ | OK | Ley 10239 text: art. 1, Gaceta 156 (2022-08-18). |
| 4 | https://crhoy.com/nacionales/44-diputados-establecen-al-colibri-como-nuevo-simbolo-nacional/ | OK | Colibrí first debate 2024-02-19; list of 19 symbol names (no years). |
| 5 | https://www.nacion.com/el-pais/mariposa-morpho-se-convierte-en-nuevo-simbolo/DVGA36OU7RBEZJBYUTZSCBIJWA/story/ | OK | Morpho second debate 2022-04-28, expediente 22.733, 18th symbol. |
| 6 | https://delfino.cr/2021/08/desde-hoy-el-perezoso-es-oficialmente-simbolo-nacional-que-cambios-deberan-aplicar-la-instituciones-para-su-defensa | OK | Ley 10007 signing; numbers for yigüirro (6031), venado (7497), manatí (9264). |
| 7 | https://bufetedecostarica.com/declaratoria-colibri-amazilia-boucardi-y-microchera-cupreiceps-simbolo-nacional-en-costa-rica-10457/ | OK | Ley 10457 text: species, art. 1, Gaceta 188 (2024-10-09). |
| 8 | https://bufetedecostarica.com/perezoso-de-dos-dedos-y-perezoso-de-tres-dedos-simbolos-nacionales-en-costa-rica-10007/ | OK | Ley 10007 text: sanction 2021-08-24, Gaceta 176 (2021-09-14). |
| 9 | https://delfino.cr/2025/10/aprobada-en-segundo-debate-ley-que-restringe-creacion-de-nuevos-simbolos-nacionales | OK | Ley 10824 (requisitos) approval, exp. 24.129; count "21 símbolos"; boyeo counted as 2022 symbol; Duelo de la Patria bill 24.812. |
| 10 | https://bufetedecostarica.com/declaracion-mariposa-morpho-helenor-simbolo-nacional-fauna-lepidoptera-en-costa-rica-10261/ | OK | Ley 10261 text: art. 1, Gaceta 100 (2022-05-31). |
| 11 | https://bufetedecostarica.com/declaratoria-de-la-casa-de-adobes-y-bahareque-como-simbolo-nacional-en-costa-rica-10693/ | OK | Ley 10693 text: art. 1, Alcance 69 to Gaceta 98 (2025-05-30). |
| 12 | https://bufetedecostarica.com/ley-protectora-boyeo-carreta-costarricense-10204/ | OK | Ley 10204 art. 1 (carreta + boyeo "símbolo nacional de la cultura, la paz y el trabajo"); given 2022-05-05. |
| 13 | https://bufetedecostarica.com/wp-content/uploads/2026/04/ley-para-establecer-los-requisitos-para-la-declaratoria-de-simbolos-nacionales_10824.pdf | OK | Ley 10824 articles (criteria, MEP registry). No list of symbols. |
| 14 | https://delfino.cr/2026/08/pgr-asamblea-y-cultura-coinciden-ley-que-declaro-simbolo-nacional-el-duelo-de-la-patria-se-aprobo-sin-requisito-obligatorio | OK | Ley 10940 (Duelo de la Patria), constitutional challenge 2026-06-27, Ley 10824 in force 2026-01-09. |
| 15 | https://www.mep.go.cr/sites/default/files/2026-08/Anexos%20Unidad%20Did%C3%A1ctica%202026VF.pdf | OK | MEP 2026 annex: full symbol list with decree/law numbers and dates (1848–2026). Main source for legal instruments of pre-2020 symbols. |
| — | pgrweb.go.cr/scij (SCIJ) | FAIL (robots_disallowed on nrm_texto_completo; site: search returned no SCIJ URLs) | Primary law texts not fetchable; law repository bufetedecostarica.com used instead. |
| — | imprentanacional.go.cr / La Gaceta | not attempted (budget) | Gaceta numbers taken from law texts above. |

## B. Country facts

| # | URL | Result | Use |
|---|-----|--------|-----|
| 16 | https://inec.cr/ | FAIL (client_error) | — |
| 17 | https://delfino.cr/2023/07/censo-2022-costa-rica-tiene-5-044-197-habitantes-dice-el-inec | OK | Census total 5,044,197; by province; dwellings 1,836,291; 61% coverage; fieldwork dates. |
| 18 | https://inec.cr/censos/censo-2022 | FAIL (client_error) | — |
| 19 | https://www.teletica.com/nacional/en-costa-rica-somos-5044197-personas_339083 | OK | Corroborates total; dwellings visited/enumerated. |
| 20 | https://unstats.un.org/unsd/demographic-social/products/dyb/documents/metadata/2025/Costa-Rica-2022-2020round-PC-Metadata.pdf | OK | Reference date June 2022; partial coverage; estimate. |
| 21 | https://www.elfinancierocr.com/economia-y-politica/costa-rica-tendra-canton-numero-84-puerto-jimenez/DA2TNQTYBVB7VBWWP7HBS5FBMU/story/ | OK | Puerto Jiménez 84th canton, first debate 2022-03-24, Puntarenas. |
| 22 | https://observador.cr/puerto-jimenez-es-oficialmente-el-canton-84-de-costa-rica/ | FAIL (robots_disallowed) | — |
| 23 | https://whc.unesco.org/en/statesparties/cr | OK | 4 World Heritage properties with years; ratification 1977-08-23. |
| 24 | https://whc.unesco.org/en/list/205/ | OK | La Amistad: 1983/1990, 570,045 ha, coordinates, transboundary. |
| 25 | https://www.britannica.com/place/Costa-Rica | OK/partial | Capital; "República de Costa Rica" alias. Facts box not returned. |
| 26 | http://www.pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?param1=NRTC&nValor1=1&nValor2=871&nValor3=0&strTipM=TC | FAIL (robots_disallowed) | — |
| 27 | https://es.wikipedia.org/wiki/Organizaci%C3%B3n_territorial_de_Costa_Rica | OK | 7 provinces, 84 cantons, 488 districts (Decreto 41548-MGP 2019); Liberia capital of Guanacaste. |
| 28 | https://www.tse.go.cr/pdf/normativa/constitucion.pdf | OK | Constitution 1949-11-07: art. 12 (ejército), art. 76 (español). |
| 29 | https://apps.grupoice.com/CenceWeb/documentos/3/3008/27/R01-PDOCSE-07%20Informe_Atenci%C3%B3n%20demanda%20y%20producci%C3%B3n_2025_v2_firmado.pdf | OK | ICE 2025 report: 98.6% renewable production, 97.3% demand; MWh by source. |
| 30 | https://delfino.cr/2026/08/puntarenas-sera-sede-de-la-celebracion-nacional-por-el-dia-de-los-parques-nacionales | OK | ~26% land / >30% marine protected; 11 conservation areas. |
| 31 | https://www.nacion.com/el-pais/servicios/instituto-geografico-hizo-nuevas-mediciones-de/SS5CP5RCL5HETNQCO5G4UG5QSE/story/ | OK | IGN 2021 recalculation: 51,085.63 + 83.29 = 51,179.92 km². |
| 32 | https://www.rnpdigital.com/IGN-DTA.pdf | OK/partial | IGN presentation: 7 provinces, 82 cantons (older), 488 districts. No area. |
| 33 | https://en.wikipedia.org/wiki/Costa_Rica | OK | Infobox: area 51,179.92 km², pop 2022 census 5,044,197, UTC−6, independence 1821-09-15, army abolished 1948-12-01, Chirripó 3,819 m. |
| — | ign.go.cr / snitcr.go.cr | not fetched (no usable URL found in budget) | — |

## C. Peaks and volcanoes

| # | URL | Result | Use |
|---|-----|--------|-----|
| 34 | https://www.ovsicori.una.ac.cr/index.php/vulcanologia/volcanes-de-costa-rica | FAIL (server error) | — |
| 35 | https://www.ovsicori.una.ac.cr/ | OK/partial | Links only; evidence of active monitoring of Poás, Turrialba, Irazú, Rincón de la Vieja. No elevations/coords. |
| 36 | https://rsn.ucr.ac.cr/vulcanologia/volcanes-de-costa-rica | FAIL (client_error, wrong path) | — |
| 37 | https://www.ovsicori.una.ac.cr/index.php/vulcanologia/nivel-de-actividad-volcanica | OK/partial | Activity levels are images; not extractable. |
| 38 | https://rsn.ucr.ac.cr/ | OK/partial | Found correct volcano-list path. |
| 39 | https://rsn.ucr.ac.cr/index.php/actividad-volcanica/volcanes-de-costa-rica | OK | RSN list of 20 volcanoes with subpage URLs (no numeric data). |
| 40 | https://www.ovsicori.una.ac.cr/index.php/extension/estado-de-los-volcanes | OK/partial | Navigation only. |
| 41 | https://rsn.ucr.ac.cr/map/volcanes/ | FAIL (robots_disallowed) | — |
| 42 | https://en.wikipedia.org/wiki/List_of_volcanoes_in_Costa_Rica | OK | Elevations, decimal coords, last eruptions for all volcanoes (marked approximate). |
| 43 | https://es.wikipedia.org/wiki/Cordillera_de_Talamanca | OK | Talamanca peak elevations (Chirripó 3820, Ventisqueros 3812, Kamuk 3554, Durika 3280, Cerro de la Muerte 3491, Echandi 3162). |
| 44 | https://en.wikipedia.org/wiki/Cerro_Chirrip%C3%B3 | OK | 3,821 m; coords 9.484083, -83.488667. |
| 45 | https://www.geonames.org/CR/highest-mountains-in-costa-rica.html | OK | 10 peaks with elevation, coords, province (Chirripó 3820, Kámuk 3549, Cerro de la Muerte 3451, Irazú, Turrialba, Echandi, Barva, Poás, Rabo de Mico). |
| 46 | https://en.wikipedia.org/wiki/Cerro_Kamuk | OK | 3,549 m; 9.283, -83.033; La Amistad. |
| 47 | https://en.wikipedia.org/wiki/Cerro_de_la_Muerte | OK | 3,451 m; 9.567, -83.750; Route 2 KM 89. |
| 48 | https://en.wikipedia.org/wiki/Cerros_de_Escaz%C3%BA | OK | Rabo de Mico 2,428 m; Pico Blanco 2,271 m; 9.850, -84.150; San José. |
| 49 | https://rsn.ucr.ac.cr/index.php/component/content/article/poas?catid=20 | OK | Poás 2708 m; 2017 eruptive sequence (RSN primary). No coords. |
| 50 | https://rsn.ucr.ac.cr/index.php/component/content/article/arenal?catid=22 | OK | Arenal ~1750 m; Alajuela; eruption 1968-07-29; repose from Jan 2011 (RSN primary). No coords. |
| — | Cerro Amigos, Cerro Azul (Nicoya), Fila Costeña, Osa highlands | not fetched (budget) | Omitted; listed in unverified. |

## D. Protected areas

| # | URL | Result | Use |
|---|-----|--------|-----|
| 51 | https://www.sinac.go.cr/ES/asp/Paginas/default.aspx | FAIL (robots_disallowed) | — |
| 52 | https://en.wikipedia.org/wiki/List_of_national_parks_of_Costa_Rica | OK | 31 parks with area and DMS coords (3 longitude typos noted and corrected by inference: Cahuita, Irazú, Miravalles). No years. |
| 53 | https://es.wikipedia.org/wiki/Anexo:Parques_nacionales_de_Costa_Rica | FAIL (404) | — |
| 54 | https://en.wikipedia.org/wiki/National_System_of_Conservation_Areas_(Costa_Rica) | FAIL (404) | — |
| 55 | https://es.wikipedia.org/wiki/Sistema_Nacional_de_%C3%81reas_de_Conservaci%C3%B3n | OK | 11 conservation areas with acronyms; SINAC 1994; ~25% territory; ~160 areas / 28 NPs. |
| 56 | https://es.wikipedia.org/wiki/Parques_nacionales_de_Costa_Rica | OK/partial | Park system 1970; SINAC since 1994; 30 NPs; Manuel Antonio in ACOPAC. |
| 57 | https://www.parks.it/world/CR/Eindex.html | OK/partial | Only Ley 7788 art. 58 definition; no inventory. |
| 58 | https://de.wikipedia.org/wiki/Liste_der_Nationalparks_in_Costa_Rica | FAIL (404) | — |
| 59 | https://es.hispanopedia.com/wiki/Anexo:%C3%81reas_de_conservaci%C3%B3n_de_Costa_Rica | OK | Mapping of each protected area to its conservation area (no years). |
| 60 | https://en.wikipedia.org/wiki/Monteverde_Cloud_Forest_Reserve | OK | Founded 1972/1973; Tropical Science Center; 10,500 ha; coords. |
| 61 | https://en.wikipedia.org/wiki/Ca%C3%B1o_Negro_Wildlife_Refuge | OK | 1984; 102 km²; coords; Ramsar 1991; ACAHN. |
| 62 | https://en.wikipedia.org/wiki/Gandoca-Manzanillo_Mixed_Wildlife_Refuge | OK | 1986, Decreto 16614-MAG; ACLAC; Ramsar. |
| 63 | https://en.wikipedia.org/wiki/Guayabo_National_Monument | OK | 1973-08-13; 2.3 km²; coords; Cartago; ASCE 2009. |

## Notes on source quality

- **Primary/official fetched:** presidencia.go.cr (symbols), tse.go.cr (constitution), grupoice.com (ICE electricity report), whc.unesco.org, mep.go.cr (2026 annex), rnpdigital.com (IGN presentation), rsn.ucr.ac.cr (Poás, Arenal), unstats.un.org (census metadata).
- **Law texts:** pgrweb.go.cr and La Gaceta were not reachable; law texts (Leyes 10007, 10204, 10239, 10261, 10457, 10693, 10824) were read from bufetedecostarica.com, a private legal repository reproducing the Gaceta texts. Status for these is "confirmed" on the strength of the quoted article wording and Gaceta references, but they should be re-checked against SCIJ when it is reachable.
- **Blocked official sites:** inec.cr (client error ×2), sinac.go.cr (robots), pgrweb.go.cr (robots), rsn.ucr.ac.cr/map (robots), ovsicori volcano list (server error), observador.cr (robots).
- **Secondary only:** all peak/volcano coordinates (Wikipedia/GeoNames), most protected-area coordinates (Wikipedia), park creation years (not found; left null).
- Discrepancies recorded in the JSON: Chirripó elevation (3,819/3,820/3,821), Kamuk (3,549/3,554), Cerro de la Muerte (3,451/3,491), Arenal (1,670/~1,750), flag/shield year (1848 decree vs 1948 per Presidencia), symbol count (21 vs 22), Teatro Nacional completion year (fetched summary rendered 1987; 1897 is implied by the 1891 start).
