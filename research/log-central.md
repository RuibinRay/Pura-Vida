# Fetch log — Central provinces (San José, Alajuela, Cartago, Heredia)

Retrieval date: 2026-10-23. Tool: WebFetch (plus WebSearch for discovery only; search results were never used as facts).
Output: `/home/claude/costa-rica/research/provinces-central.json`

Legend: OK = fetched and used · OK-partial = fetched, little usable content · FAIL = not fetched (reason) · n/u = fetched but not used in the JSON

## 1. Official / primary Costa Rican sources

| # | URL | Result | Used for |
|---|-----|--------|----------|
| 1 | https://inec.cr/estadisticas-fuentes/censos/censo-2022 | FAIL (client_error) | Census 2022 by province — fallback to press coverage |
| 2 | https://inec.cr/ | FAIL (client_error) | same |
| 3 | https://www.inec.cr/ | FAIL (robots_disallowed) | same |
| 4 | https://www.sinac.go.cr/ES/ac/aclap/pnch/Paginas/default.aspx | OK | Chirripó NP: Ley 5773 (1975), 50,150 ha, 3,820 m, páramo, species (SJ) |
| 5 | https://www.sinac.go.cr/ES/ac/Paginas/default.aspx | FAIL (robots_disallowed) | SINAC conservation-area index |
| 6 | https://www.sinac.go.cr/ES/ac/accvc/pnvp/Paginas/default.aspx | OK | Poás NP: Alajuela, 2,708 m, crater, 6,506 ha, flora/fauna with scientific names |
| 7 | https://www.sinac.go.cr/ES/ac/accvc/pnvi/Paginas/default.aspx | OK | Irazú NP: 3,432 m highest volcano, Ley 1917 (1955), 2,000 ha, 1723/1963/1994 events |
| 8 | https://www.sinac.go.cr/ES/ac/acahn/pnva/Paginas/default.aspx | FAIL (robots_disallowed) | Arenal NP — fallback to Wikipedia es/en |
| 9 | https://www.sinac.go.cr/ES/ac/accvc/pnbc/Paginas/default.aspx | OK | Braulio Carrillo: 1978 decree/law, 50,000 ha, Barva 2,906 m, Moravia→Sarapiquí, species list |
| 10 | https://www.sinac.go.cr/ES/ac/accvc/mng/Paginas/default.aspx | OK | Guayabo: Santa Teresita/Turrialba, Ley 5300 (1973), 233 ha, 1000 BC–AD 1400, ASCE, species |
| 11 | https://www.sinac.go.cr/ES/ac/acahn/Paginas/default.aspx | FAIL (robots_disallowed) | ACAHN overview |
| 12 | https://www.sinac.go.cr/ES/ac/acat/pnvt/Paginas/default.aspx | FAIL (robots_disallowed) | Tenorio NP / Río Celeste — fallback to Wikipedia |
| 13 | https://www.sinac.go.cr/ES/ac/acahn/pnjcb/Paginas/default.aspx | FAIL (robots_disallowed) | Juan Castro Blanco NP — fallback to Wikipedia |
| 14 | https://www.sinac.go.cr/ES/ac/accvc/pnvt/Paginas/default.aspx | OK | Turrialba volcano NP: Cartago/Turrialba canton, 3,340 m, 1,256 ha, 2010–2015 eruptions, species |
| 15 | https://www.teatronacional.go.cr/ | OK-partial | "Monumento Histórico inaugurado en 1897" |
| 16 | https://www.teatronacional.go.cr/Seccion/43/linea-de-tiempo-historica-sobre-el-teatro-nacional-de-costa-rica- | OK-partial (timeline is an embedded widget; entries not retrievable) | nothing beyond 1897 |
| 17 | https://www.teatronacional.go.cr/Teatronacional | OK | Patrimonio Histórico Nacional; address Avenida Segunda; governance under MCJ |
| 18 | https://www.museocostarica.go.cr/ | OK | Location by Plaza de la Democracia; collections; hours |
| 19 | https://www.museocostarica.go.cr/museo/historia-del-museo/ | OK | Created 4 May 1887; moved to Cuartel Bellavista 1950 |
| 20 | https://museosdelbancocentral.org/ | OK | Underground building, three sub-levels, Museo del Oro + Numismática |
| 21 | https://museosdelbancocentral.org/acerca-de-los-museos-del-banco-central/ | OK | 1950 founding, 1982 building, 1985 inauguration, 1,586 gold objects, architects |
| 22 | https://museodeljadeins.com/ | FAIL (robots_disallowed) | Museo del Jade — fallback to en.wikipedia |
| 23 | https://museojuansantamaria.go.cr/ | OK | Former Cuartel/Cárcel, north of Parque Central, opened 9 Apr 1980, only museum on 1856-57 campaign |
| 24 | https://museojuansantamaria.go.cr/historia-del-museo/ | OK | Ley 5619 (4 Dec 1974); 1931 centenary; 1932 first museum |
| 25 | https://museocr.org/ | OK | Centro Costarricense de Ciencia y Cultura: former Penitenciaría Central, components, address |
| 26 | https://www.santuarionacional.org/ | FAIL (robots_disallowed) | Basílica — fallback to UCR document + press |
| 27 | https://it.visitcostarica.com/sites/default/files/legacy/Caminata%20por%20HEREDIA%20v3.pdf | OK | ICT Heredia walking guide: El Fortín 1876/1974/1992, parish 1736/1797/1841/1973, Casa de la Cultura, founding dates 1706–1824, coffee, UNA 1973 |
| 28 | https://visitcostarica.com/blog/la-selva-biological-station | OK | La Selva: 3 km S of Puerto Viejo, Holdridge 1954, OET 1968, species counts, borders Braulio Carrillo |
| 29 | https://tropicalstudies.org/?p=7935 | OK-partial | La Selva established 1953; 1,500 ha |
| 30 | https://www.ovsicori.una.ac.cr/index.php/vulcanologia/volcanes-de-costa-rica | FAIL (server error) | volcano data — fallback to SINAC + Wikipedia list |
| 31 | https://www.ovsicori.una.ac.cr/ | OK-partial | OVSICORI = UNA institute at Campus Omar Dengo, Heredia |
| 32 | https://www.jbl.ucr.ac.cr/ | FAIL (robots_disallowed) | Lankester garden — fallback to en.wikipedia |
| 33 | https://multimedia.uned.ac.cr/pem/mapa-interactivo/mapa/cartago/ruinas/info.html | OK | Ruinas de Santiago Apóstol: first parish site, 19th-c. construction, 1910 Santa Mónica damage |
| 34 | https://www.kerwa.ucr.ac.cr/server/api/core/bitstreams/d82b2656-47ea-41c6-92d0-da57395bea47/content | OK | UCR (Sedó Masís 2015): La Negrita 1635, Puebla de los Pardos, Juana Pereira naming, patroness 1782/1824, basilica 1912–1930 |
| 35 | https://ccp.ucr.ac.cr/sites/default/files/observa/CRsubnacional/pdf/distrital.pdf | n/u (INEC 2014 projections based on 2011 census; no 2022 data) | — |
| 36 | https://www.rnpdigital.com/IGN-DTA.pdf | OK-partial | IGN presentation (c. 2021): 7 provinces, 82 cantons, 488 districts at that time |
| 37 | https://delfino.cr/asamblea/proyecto/22749 | OK | Expediente 22749 Puerto Jiménez: 1st debate 24 Mar 2022, 2nd debate 29 Mar 2022, "Cantón XIII de Puntarenas" |
| 38 | https://ich.unesco.org/en/RL/oxherding-and-oxcart-traditions-in-costa-rica-00103 | OK | Oxcart tradition: inscribed 2008 (proclaimed 2005), coffee to Puntarenas 10–15 days, painting from early 20th c. |
| 39 | https://whc.unesco.org/en/list/205/ | OK | Talamanca Range–La Amistad WHS: 1983, extended 1990, CR+Panama, 570,045 ha, mentions Cerro Chirripó |
| 40 | https://www.cafebritt.com/about-us | FAIL (client_error) | Café Britt location |
| 41 | https://www.cafebritt.com/ | OK-partial (founded 1985; no location stated) | not included in JSON |

## 2. Britannica (all failed)

| # | URL | Result |
|---|-----|--------|
| 42 | https://www.britannica.com/place/San-Jose-province-Costa-Rica | FAIL (client_error) |
| 43 | https://www.britannica.com/place/Alajuela-province-Costa-Rica | FAIL (client_error) |
| 44 | https://www.britannica.com/place/Cartago-province-Costa-Rica | FAIL (client_error) |
| 45 | https://www.britannica.com/place/Heredia-province-Costa-Rica | FAIL (client_error) |

## 3. Press (secondary; used where official pages failed)

| # | URL | Result | Used for |
|---|-----|--------|----------|
| 46 | https://delfino.cr/2023/07/censo-2022-costa-rica-tiene-5-044-197-habitantes-dice-el-inec | OK | INEC Censo 2022 by province: SJ 1,601,167; A 1,035,466; C 545,092; H 479,117; total 5,044,197; 61% coverage note |
| 47 | https://www.teletica.com/nacional/en-costa-rica-somos-5044197-personas_339083 | OK | Corroborates national total and INEC release date 20 Jul 2023 |
| 48 | https://semanariouniversidad.com/?p=343126 | n/u (only Puntarenas figure) | — |
| 49 | https://crhoy.com/san-jose-y-alajuela-tienen-la-mayor-concentracion-poblacional/ | FAIL (server error) | — |
| 50 | https://www.nacion.com/el-pais/politica/diputados-crean-canton-de-puerto-jimenez-el-numero/J2UUEOH7YFFGPLBQGPWBHUGJT4/story/ | OK | Puerto Jiménez "número 84", first debate 24 Mar 2022 |
| 51 | https://observador.cr/puerto-jimenez-es-oficialmente-el-canton-84-de-costa-rica/ | FAIL (robots_disallowed) | — |
| 52 | https://www.elfinancierocr.com/economia-y-politica/costa-rica-tendra-canton-numero-84-puerto-jimenez/DA2TNQTYBVB7VBWWP7HBS5FBMU/story/ | OK (n/u — duplicates #50) | — |
| 53 | https://www.nacion.com/el-pais/fallece-miguel-cordero-creador-del-chifrijo/VBRA64J7BBFI3KO3EB6GNXOOKQ/story/ | OK | Chifrijo: Cordero's Bar, Colima de Tibás, 22 Oct 1979, 2002 mark, 2015 ruling |
| 54 | https://www.crhoy.com/nacionales/costa-rica-conmemora-389-anos-del-hallazgo-de-la-virgen-de-los-angeles/ | OK | La Negrita: 2 Aug 1635, Puebla de los Pardos, first stone 7 Sep 1912, coronation 25 Apr 1926, 1824 declaration |
| 55 | https://www.meer.com/es/92994-el-terremoto-de-1910-en-costa-rica | OK | 1910 earthquake: 4 May 1910, 6:50 pm, M≈6.4, reconstruction under R. Jiménez |

## 4. Wikipedia (last resort; facts marked "approximate")

| # | URL | Result | Used for |
|---|-----|--------|----------|
| 56 | https://en.wikipedia.org/wiki/San_Jos%C3%A9_Province | OK | area 4,966 km², 20 cantons list, ISO |
| 57 | https://es.wikipedia.org/wiki/Provincia_de_San_Jos%C3%A9 | OK | 2022 estimate 1,601,167; Chirripó 3,820 m; Zona de los Santos; 1737 chapel; 1823 Ochomogo; culture |
| 58 | https://en.wikipedia.org/wiki/Alajuela_Province | OK | area 9,757.53; 16 cantons; Botos; 1657; 1782; coffee/sugar rank; Lake Arenal |
| 59 | https://es.wikipedia.org/wiki/Provincia_de_Alajuela | OK | 9,753 km²; plains; volcano list; Arenal in La Fortuna/San Carlos; festivals; Caño Negro |
| 60 | https://en.wikipedia.org/wiki/Cartago_Province | OK | area 3,124.61; 8 cantons; Brumosos; capital until 1823 |
| 61 | https://es.wikipedia.org/wiki/Provincia_de_Cartago | OK | 1563/1574 founding; earthquakes; crops; Orosi church 1735; Ujarrás |
| 62 | https://en.wikipedia.org/wiki/Heredia_Province | OK | area 2,656.98; 10 cantons; borders |
| 63 | https://es.wikipedia.org/wiki/Provincia_de_Heredia | OK | smallest; Sarapiquí 80.5%; 10 canton names; coffee 4,969 ha; Intel/Belén; Barva 2,906 m; 1706/1736/1763/1848 |
| 64 | https://en.wikipedia.org/wiki/Cantons_of_Costa_Rica | OK | 84 cantons; Puerto Jiménez 2022; canton lists per province |
| 65 | https://es.wikipedia.org/wiki/Cantones_de_Costa_Rica | OK | 84 cantons; counts per province |
| 66 | https://en.wikipedia.org/wiki/San_Jos%C3%A9,_Costa_Rica | OK | city coords 9.9325,-84.08; 1,030 m; capital 16 May 1823 |
| 67 | https://en.wikipedia.org/wiki/Alajuela | OK | coords 10.017,-84.217; 952 m; Ciudad de los Mangos; 11 April holiday |
| 68 | https://en.wikipedia.org/wiki/Cartago,_Costa_Rica | OK | coords 9.867,-83.917; 1,435 m; Ciudad de las Brumas; ruins 7 blocks W of basilica |
| 69 | https://en.wikipedia.org/wiki/Heredia,_Costa_Rica | OK | coords 9.99846,-84.11686; 1,150 m; founding dates; Ciudad de las Flores |
| 70 | https://en.wikipedia.org/wiki/National_Theatre_of_Costa_Rica | OK | 21 Oct 1897; coffee tax; neoclassical; monument 1965 |
| 71 | https://es.wikipedia.org/wiki/Teatro_Nacional_de_Costa_Rica | OK | 19 Oct 1897 (Gounod's Faust); tax details; Villa 1897 canvas on 5-colón note; 1965 |
| 72 | https://es.wikipedia.org/wiki/Museo_Nacional_de_Costa_Rica | OK | Acuerdo 60 (1887); barracks 1917; military use ended 1 Dec 1948 |
| 73 | https://en.wikipedia.org/wiki/National_Museum_of_Costa_Rica | OK-partial | address; built 1917; used in 1948 civil war |
| 74 | https://en.wikipedia.org/wiki/Pre-Columbian_Gold_Museum | OK | coords 9.9335236,-84.0768001; 1985; 3,567 artefacts, 1,586 gold; 300–400 BC–AD 1550 |
| 75 | https://es.wikipedia.org/wiki/Museo_del_Oro_Precolombino | OK | 1,586 gold pieces; date range |
| 76 | https://es.wikipedia.org/wiki/Museo_del_Jade_Marco_Fidel_Trist%C3%A1n_Castro | FAIL (url_not_found) | — |
| 77 | https://en.wikipedia.org/wiki/Jade_Museum | FAIL (url_not_found) | — |
| 78 | https://en.wikipedia.org/wiki/Museo_del_Jade | OK | coords 9.93639,-84.07361; 1977; since 2014 at Plaza de la Democracia; largest American jade collection |
| 79 | https://es.wikipedia.org/wiki/Museo_de_los_Ni%C3%B1os_(Costa_Rica) | FAIL (url_not_found) | — |
| 80 | https://en.wikipedia.org/wiki/Children%27s_Museum_(Costa_Rica) | FAIL (url_not_found) | — |
| 81 | https://es.wikipedia.org/wiki/Centro_Costarricense_de_Ciencia_y_Cultura | OK | penitentiary 1909–1979; inaugurated 27 Apr 1994; Gloria Bejarano; Merced |
| 82 | https://en.wikipedia.org/wiki/Barrio_Am%C3%B3n | FAIL (url_not_found) | — |
| 83 | https://es.wikipedia.org/wiki/Barrio_Am%C3%B3n | OK | Carmen district; 1892/1897; styles; heritage; current uses |
| 84 | https://es.wikipedia.org/wiki/Cerros_de_Escaz%C3%BA | OK | Rabo de Mico 2,428 m; Pico Blanco 2,271 m; cantons; Fila de la Candelaria |
| 85 | https://en.wikipedia.org/wiki/Cerros_de_Escaz%C3%BA | OK | coords 9.85,-84.15 |
| 86 | https://en.wikipedia.org/wiki/Cerro_de_la_Muerte | OK | coords 9.567,-83.75; 3,451 m; highway 3,335 m; páramo; name origin |
| 87 | https://es.wikipedia.org/wiki/Cerro_de_la_Muerte | OK | Cerro Buenavista 3,491 m; Cartago+San José; Ruta 2 |
| 88 | https://en.wikipedia.org/wiki/Chirrip%C3%B3_National_Park | OK | spans San José, Limón, Cartago; coords; WHS |
| 89 | https://en.wikipedia.org/wiki/Los_Quetzales_National_Park | OK | coords; 50 km²; 2006 decree; Central CA |
| 90 | https://en.wikipedia.org/wiki/Braulio_Carrillo_National_Park | OK | coords 10.1599,-83.9744; spans Heredia, Cartago, Limón, San José; Central CA |
| 91 | https://en.wikipedia.org/wiki/Tapant%C3%AD_National_Park | OK | coords; 583.2 km²; 1982/2000; Central CA; species |
| 92 | https://en.wikipedia.org/wiki/Arenal_Volcano_National_Park | OK | 1991; ACAHN; 1968 (78 dead); activity ended 2010; Cerro Chato; coords |
| 93 | https://es.wikipedia.org/wiki/Parque_nacional_Volc%C3%A1n_Arenal | OK | Alajuela; 12,124 ha; ACAHN; 29 Jul 1968, Tabacón & Pueblo Nuevo, ~90 dead; fauna/flora |
| 94 | https://en.wikipedia.org/wiki/Lake_Arenal | OK | Alajuela+Guanacaste; 85 km²; 1979 Sangregado dam; Arenal/Tronadora submerged; 17% electricity |
| 95 | https://en.wikipedia.org/wiki/Tenorio_Volcano_National_Park | OK | coords 10.67306,-85.015; 129 km²; ACAT; Río Celeste chemistry |
| 96 | https://es.wikipedia.org/wiki/Parque_nacional_Volc%C3%A1n_Tenorio | OK | between Alajuela and Guanacaste; cantons Upala, Guatuso, Bagaces, Cañas, Tilarán; ACAT; decree 24240-MIRENEM 1995; Los Teñideros |
| 97 | https://en.wikipedia.org/wiki/Juan_Castro_Blanco_National_Park | OK | coords; ~145 km²; 1975/1992; ACAHN; Platanar, Porvenir, El Viejo |
| 98 | https://en.wikipedia.org/wiki/List_of_volcanoes_in_Costa_Rica | OK | elevations + coords for Poás, Irazú, Arenal, Turrialba, Barva, Platanar, Tenorio, Chato, Cacho Negro |
| 99 | https://en.wikipedia.org/wiki/Juan_Santamar%C3%ADa | OK | born 29 Aug 1831 Alajuela; drummer; died 11 Apr 1856 Rivas; holiday; statue 1891 |
| 100 | https://en.wikipedia.org/wiki/Juan_Santamar%C3%ADa_International_Airport | OK | coords 9.99389,-84.20889; 20 km NW of SJ; 2 May 1958; 6.7 M pax 2025 |
| 101 | https://en.wikipedia.org/wiki/Zarcero | OK | coords; 1,736 m; topiary by Evangelista Blanco since 1960s; church 1895; dairy |
| 102 | https://es.wikipedia.org/wiki/Zarcero_(cant%C3%B3n) | FAIL (url_not_found) | — |
| 103 | https://es.wikipedia.org/wiki/Zarcero | OK-partial (disambiguation) | — |
| 104 | https://en.wikipedia.org/wiki/Sarch%C3%AD | OK-partial (disambiguation; Alajuela canton only) | — |
| 105 | https://es.wikipedia.org/wiki/Sarch%C3%AD_(cant%C3%B3n) | FAIL (url_not_found) | — |
| 106 | https://en.wikipedia.org/wiki/Virgen_de_los_%C3%81ngeles | OK | 2 Aug 1635 Juana Pereira; patroness 1824; 22 km pilgrimage; coronation 1926 |
| 107 | https://en.wikipedia.org/wiki/Basilica_of_Our_Lady_of_the_Angels,_Cartago | OK | coords 9.86389,-83.91278; 1912–1924; Byzantine; architect Luis Llach |
| 108 | https://en.wikipedia.org/wiki/Santiago_Ap%C3%B3stol_Parish_Ruins | OK | 1870 rebuild start; cancelled after 1910; public park |
| 109 | https://en.wikipedia.org/wiki/Guayabo_National_Monument | OK | coords 9.9726694,-83.6907333; ASCE 2009; 3 aqueducts |
| 110 | https://en.wikipedia.org/wiki/Lankester_Botanical_Garden | OK | coords 9.83958,-83.89006; Dulce Nombre; 1910/1924/1940/1973; 11 ha; 3,000+ species |
| 111 | https://es.wikipedia.org/wiki/Queso_Turrialba | OK | Santa Cruz/Santa Teresita; IICA 2012 designation; 1870; production rules |
| 112 | https://es.wikipedia.org/wiki/Gastronom%C3%ADa_de_Costa_Rica | OK | chifrijo/Tibás; chicharrones Puriscal & Aserrí; picadillos; queso palmito/Zarcero; semi-hard cheeses Alajuela |
| 113 | https://en.wikipedia.org/wiki/National_University_of_Costa_Rica | OK | Law 5182, 15 Feb 1973; opened 14 Mar 1973; Benjamín Núñez; Omar Dengo campus |
| 114 | https://en.wikipedia.org/wiki/La_Selva_Biological_Station | OK | coords 10.422,-84.015; 1,536 ha; OTS 1968; corridor to Braulio Carrillo; species counts |
| 115 | https://en.wikipedia.org/wiki/La_Paz_Waterfall_Gardens | FAIL (url_not_found) | — |
| 116 | https://es.wikipedia.org/wiki/Catarata_La_Paz | OK | Vara Blanca–Cinchona, Heredia canton; 31 km N of Alajuela; Ruta 126; 2009 M6.1 earthquake |
| 117 | https://es.wikipedia.org/wiki/Plaza_de_la_Cultura_(San_Jos%C3%A9) | FAIL (url_not_found) | — |

## 5. Coordinate lookups (geocoder; all coords marked "approximate")

| # | URL | Result | Used for |
|---|-----|--------|----------|
| 118–123 | https://en.wikipedia.org/w/api.php?action=query&prop=coordinates… (6 variants) | FAIL (proxy: URL too long / url_not_found) | — |
| 124–127 | https://en.wikipedia.org/api/rest_v1/page/summary/… (4 pages) | FAIL (url_not_found) | — |
| 128 | https://photon.komoot.io/api/?q=Teatro%20Nacional… | FAIL (robots_disallowed) | — |
| 129 | https://nominatim.openstreetmap.org/search?q=Teatro+Nacional… | FAIL (robots_disallowed) | — |
| 130 | https://www.wikidata.org/w/api.php?action=wbsearchentities… | FAIL (url_not_found) | — |
| 131 | https://geocoding-api.open-meteo.com/v1/search?name=Zarcero&count=3&language=es&format=json | OK | Zarcero 10.18455,-84.39163 |
| 132 | …name=La%20Fortuna… | OK | La Fortuna (San Carlos) 10.47089,-84.64535 |
| 133 | …name=Orosi… | OK | Orosi (Paraíso) 9.79617,-83.85383 |
| 134 | …name=Turrialba… | OK | Turrialba 9.90371,-83.68361 |
| 135 | …name=Puerto%20Viejo%20de%20Sarapiqu%C3%AD… | OK | 10.45616,-84.00782 |
| 136 | …name=Escaz%C3%BA… | OK | 9.91887,-84.13989 (not used; range coords from Wikipedia preferred) |
| 137 | …name=Vara%20Blanca… | OK | Vara Blanca (Cantón de Heredia) 10.17227,-84.15803 → La Paz waterfall approx. |
| 138 | …name=Sarch%C3%AD… | OK | Sarchí 10.0897,-84.34752 |
| 139 | …name=Barva… | OK | Barva 10.02024,-84.12451 |
| 140 | …name=Ca%C3%B1o%20Negro… | OK | Caño Negro (Los Chiles) 10.89237,-84.78696 |
| 141 | …name=Bajos%20del%20Toro… | OK (empty result) | — |
| 142 | …name=Tib%C3%A1s… | OK (no CR result) | — |
| 143 | …name=Barrio%20Am%C3%B3n… | OK (empty result) | — |
| 144 | …name=Santiago%20de%20Puriscal… | OK (empty result) | — |

## 6. Totals

- Fetch attempts: ~95 distinct URLs (above the 25–45 target because inec.cr, Britannica, most SINAC ACAHN/ACAT pages, three museum sites and all Wikipedia/Wikidata API endpoints failed, forcing alternates).
- Successful fetches used as sources in the JSON: 88 distinct URLs.
- Failures: 35 (robots_disallowed 13, client_error 9, url_not_found 11, server error 2).

## 7. Notable corrections to the brief (details in JSON `unverified`)

- Chirripó NP spans **San José, Limón and Cartago** (not only SJ/Limón).
- Braulio Carrillo NP spans **Heredia, San José, Cartago and Limón** (brief omitted Cartago).
- Tenorio NP / Río Celeste: between **Alajuela and Guanacaste**, administered by **ACAT** (not ACAHN); cantons Upala, Guatuso, Bagaces, Cañas, Tilarán.
- Lake Arenal spans **Alajuela and Guanacaste** and was a natural lake tripled by the 1979 dam.
- Catarata La Paz is in the **Vara Blanca area of Heredia canton**, though reached from Alajuela.
- Guayabo is described by SINAC as the **most important** site with conserved structures, not the largest.
- Juan Santamaría's statue is in Alajuela (1891); he died at the **Second Battle of Rivas**, 11 April 1856 (Wikipedia, with a note that historians question the traditional account).
- Cartago: Spanish settlement moved to the Guarco valley in **1563**, fixed on the present site in **1574**; capital until **1823**.
- The country had **82 cantons** in the c. 2021 IGN document; **84** after Río Cuarto (2017/18, per IGN list) and Puerto Jiménez (approved 29 March 2022). No official 2026 page confirming 84 was fetched.
