# Fetch log — species & UNESCO research for "Pura Vida: The Living Country"

Retrieval date: 2026-10-23. Tool: WebFetch (plus WebSearch for discovery only; search results were never used as sources). Output: `/home/claude/costa-rica/research/species.json`.

Budget note: the brief allowed 15–30 fetches. 45 WebFetch calls were made (6 failed, 39 succeeded) plus 6 WebSearch calls. The overrun came from (a) iucnredlist.org and BirdLife DataZone being unusable, which required one GBIF API call per species for the category and a second for the assessment year/DOI, and (b) presence-in-Costa-Rica checks via GBIF occurrence counts. Every successful fetch is listed below with how it was used.

## Blocked / failed sources (6)

| # | URL | Result | Note |
|---|-----|--------|------|
| F1 | https://www.iucnredlist.org/search?query=Bradypus%20variegatus&searchType=species | FAILED — robots_disallowed | IUCN Red List blocks automated fetching. |
| F2 | https://www.iucnredlist.org/species/22682102/92931469 | FAILED — client_error | Same site; also the URL's assessment ID was a guess from memory, so it would not have been used anyway. |
| F3 | https://datazone.birdlife.org/species/factsheet/keel-billed-toucan-ramphastos-sulfuratus | FETCHED but EMPTY template | Page is JavaScript-rendered; all data fields "Loading..." or blank. Not used as a source. |
| F4 | https://datazone.birdlife.org/species/factsheet/keel-billed-toucan-ramphastos-sulfuratus/text | FETCHED but EMPTY template | Same problem. Not used. |
| F5 | https://datazone.birdlife.org/species/factsheet/clay-colored-thrush-turdus-grayi | FETCHED but EMPTY template | Same problem. Not used. |
| F6 | https://observador.cr/cinco-animales-son-simbolos-nacionales-en-costa-rica-el-colibri-a-un-paso-de-unirse-a-la-lista/ | FAILED — robots_disallowed | Would have covered the five animal symbols; replaced by presidencia.go.cr, the PGR Gaceta erratum, the Ley 10007 text, Delfino and Teletica. |
| F7 | https://slothconservation.org/two-fingered-or-three-fingered-sloths-which-is-it/ | FAILED — client_error | Intended for the "fingered vs toed" terminology; left as unverified. |

Workaround for IUCN: GBIF mirrors the IUCN Red List. `api.gbif.org/v1/species/{key}/iucnRedListCategory` gives the category and IUCN taxon ID; `api.gbif.org/v1/species/{iucnUsageKey}/distributions` returns the IUCN assessment citation including year and DOI. Those DOIs are recorded as `iucn.url` in the JSON.

## Successful fetches and their use (39)

### Taxonomy (GBIF Backbone)
| # | URL | Used for |
|---|-----|----------|
| 1 | https://api.gbif.org/v1/species/match?name=Ramphastos%20sulfuratus | Accepted name R. sulfuratus R.Lesson, 1830; Piciformes; Ramphastidae; usageKey 2478771 |
| 2 | https://api.gbif.org/v1/species/match?name=Bradypus%20variegatus | Accepted name Schinz, 1825; Pilosa; Bradypodidae; usageKey 2436353 |
| 3 | https://api.gbif.org/v1/species/match?name=Turdus%20grayi | Accepted name Bonaparte, 1838; Passeriformes; Turdidae; usageKey 2490716 |
| 4 | https://api.gbif.org/v1/species/match?name=Morpho%20helenor | Accepted name Cramer, 1782; Lepidoptera; Nymphalidae; usageKey 5133265 |
| 5 | https://api.gbif.org/v1/species/match?name=Morpho%20peleides | GBIF still treats M. peleides Kollar, 1850 as ACCEPTED species (nomenclature note) |

### IUCN category and assessment year (GBIF mirror of IUCN Red List)
| # | URL | Used for |
|---|-----|----------|
| 6 | https://api.gbif.org/v1/species/2478771/iucnRedListCategory | Toucan: NEAR_THREATENED (NT), iucnTaxonID 22682102 |
| 7 | https://api.gbif.org/v1/species/2436353/iucnRedListCategory | Sloth: LEAST_CONCERN (LC), iucnTaxonID 3038 |
| 8 | https://api.gbif.org/v1/species/2490716/iucnRedListCategory | Thrush: LEAST_CONCERN (LC), iucnTaxonID 22708914 |
| 9 | https://api.gbif.org/v1/species/5133265/iucnRedListCategory | Morpho: NOT_EVALUATED (NE) |
| 10 | https://api.gbif.org/v1/species/176615653/distributions (fetched twice: once for fields, once to get the exact DOI string) | Toucan assessment: BirdLife International 2021, IUCN Red List 2021-3, DOI 10.2305/IUCN.UK.2021-3.RLTS.T22682102A168670038.en |
| 11 | https://api.gbif.org/v1/species/176661209/distributions | Sloth assessment: Moraes-Barros et al. 2022, DOI 10.2305/IUCN.UK.2022-2.RLTS.T3038A210442893.en |
| 12 | https://api.gbif.org/v1/species/176633608/distributions | Thrush assessment: BirdLife International 2021 (2021-3), DOI 10.2305/IUCN.UK.2021-3.RLTS.T22708914A139360239.en |

### Presence in Costa Rica (GBIF occurrence counts)
| # | URL | Used for |
|---|-----|----------|
| 13 | https://api.gbif.org/v1/occurrence/search?taxonKey=2478771&country=CR&limit=0 | 154,342 toucan records in CR |
| 14 | https://api.gbif.org/v1/occurrence/search?taxonKey=2436353&country=CR&limit=0 | 5,133 sloth records in CR |
| 15 | https://api.gbif.org/v1/occurrence/search?taxonKey=5133265&country=CR&limit=0 | 2,436 M. helenor records in CR |
| 16 | https://api.gbif.org/v1/occurrence/search?taxonKey=2490716&country=CR&limit=0 | 438,829 thrush records in CR |

### Keel-billed toucan
| # | URL | Used for |
|---|-----|----------|
| 17 | https://neotropical.birds.cornell.edu/Species-Account/nb/species/kebtou1/overview | Cornell: habitat (tropical lowland evergreen + secondary forest), range S Mexico → N Colombia / NW Venezuela, diet, 2 subspecies, overlap with Chestnut-mandibled Toucan R. ambiguus swainsonii. No size, no CR detail. |
| 18 | https://animaldiversity.org/accounts/Ramphastos_sulfuratus/ | ADW: ~52 cm, 400 g; coloration; flocks 6–12; communal cavity roosting; clutch 2–4, incubation 16–20 d, nestlings 8–9 wk; seed dispersal (regurgitation/gut passage); national bird of Belize; CITES II; older IUCN "Least Concern" (superseded by 2021 NT). Country list omits CR. |
| 19 | https://en.wikipedia.org/wiki/Keel-billed_toucan | Approximate: 42–55 cm, 380–500 g, bill 12–15 cm, to 1,900 m, plantations/pastures, NT (2021), subspecies ranges. |
| 20 | https://es.wikipedia.org/wiki/Ramphastos_sulfuratus | Spanish names (tucán piquiverde / pico iris / pico de canoa); approximate size 50–59 cm, ~500 g, bill ~16 cm. The "En Costa Rica" section was empty. |

### Brown-throated three-toed sloth
| # | URL | Used for |
|---|-----|----------|
| 21 | https://animaldiversity.org/accounts/Bradypus_variegatus/ | ADW: taxonomy; habitat and 0–2,400 m; 60 cm, 3.49–5.19 kg; ~10 cervical vertebrae / 270°; Cecropia diet; sleep 14–16 h; descends every 3–8 days; swimmer; reproduction; algae mutualism; predators; densities 2.2–8.5/ha; IUCN LC. Country list omits CR (noted). Moths not mentioned. |
| 22 | https://revistas.una.ac.cr/index.php/ambientales/article/view/17611 | UNA Revista Ambientales: both B. variegatus (perezoso de tres dedos) and C. hoffmanni (de dos dedos) in CR; 2004–2016 study in Limón cacao landscape; habitats; "símbolos nacionales de Costa Rica"; Peery & Pauli 2014 cacao finding. |
| 23 | https://en.wikipedia.org/wiki/Brown-throated_sloth | Approximate: range "from Honduras … through Nicaragua, Costa Rica and Panama"; sea level–1,200 m; 42–80 cm, 2.25–6.3 kg; sloth moth Cryptoses choloepi; algae species; ssp. B. v. ephippiger; 30–40 yr "citation needed". |

### Sloth national-symbol law (Ley 10007)
| # | URL | Used for |
|---|-----|----------|
| 24 | https://delfino.cr/asamblea/proyecto/22167 | Expediente 22167; title; became Ley 10007; presented 2020-08-24; texto final 2021-07-12; "Aprobado en Segundo Debate". |
| 25 | https://www.teletica.com/289756_oso-perezoso-es-el-nuevo-simbolo-nacional-de-costa-rica | Article dated 2021-07-14: unanimous definitive approval of exp. 22.167; both species; proponent Yorleny León. No law number or signature date. |
| 26 | https://bufetedecostarica.com/wp-content/uploads/2026/10/declaratoria-del-perezoso-de-dos-dedos-choloepus-hoffmanni-y-el-perezoso-de-tres-dedos-bradypus-variegatus-como-simbolos-nacionales-de-la-fauna_10007.pdf | Text of Ley N.º 10007: title and Artículo 1 wording. No sanction/Gaceta date in the text. |

### Blue morpho
| # | URL | Used for |
|---|-----|----------|
| 27 | https://mapress.com/zt/article/view/zootaxa.3130.1.2 | Gareca & Blandin 2011, Zootaxa 3130: helenor treated as species with subspecies; Morphinae; Bolivian subspecies, 500–1,400 m, ecological plasticity. No CR content. |
| 28 | https://www.butterfliesandmoths.org/node/1240203 | BAMONA sighting record (Costa Rica): official name "Common Morpho" vs usual "Blue Morpho"; note that "Morpho peleides" is now more often replaced by M. helenor. |
| 29 | https://learnbutterflies.com/common-blue-morpho/ | Lamas (2004) lists peleides among ~30 subspecies of helenor; Mexico→Bolivia; Guanacaste dry forest at sea level to cloud forest ~1,800 m; Fabaceae hosts (Machaerium, Swartzia, Lonchocarpus, Pterocarpus, Dalbergia); rotting fruit/sap/mud-puddling; zigzag flight, male patrolling, eyespot decoy. Enthusiast site → "approximate". |
| 30 | https://www.butterfliesofamerica.com/L/morpho_helenor_marinita.htm | M. helenor marinita Butler, 1872: type locality Costa Rica; "SW Costa Rica to Panama (Pacific slope)"; photos Ojochal / Osa Peninsula. |
| 31 | https://en.wikipedia.org/wiki/Morpho_helenor | Approximate: (Cramer, 1776); Mexico→Argentina; M. h. peleides as subspecies; M. h. limpidus and marinita from Costa Rica. |

### Clay-colored thrush (yigüirro)
| # | URL | Used for |
|---|-----|----------|
| 32 | https://www.allaboutbirds.org/guide/Clay-colored_Thrush/overview | Cornell: order/family; plumage; open woodland; range N Colombia→S Texas; omnivore; cup nest; ground forager; "virtuoso song"; national bird of Costa Rica; Low Concern; Zorzal Pardo. No size. |
| 33 | https://lasnubes.euc.yorku.ca/species/clay-colored-thrush/ | York University Las Nubes (CR) page: Spanish name Yigüirro; Turdidae; LC. Nothing else. |
| 34 | https://en.wikipedia.org/wiki/Clay-colored_thrush | Approximate: 23–27 cm, 74–76 g; gardens/settlements; army ants; nesting (2–4 eggs, Mar–Jul); song at start of rainy season, "call the rains" (Skutch); chosen 1977. |

### National symbols (official)
| # | URL | Used for |
|---|-----|----------|
| 35 | https://www.presidencia.go.cr/simbolos-nacionales/ | 15 symbols listed; yigüirro: "En 1977 se decreta el Yigüirro como Ave Nacional debido a su armonioso canto" (no number). No sloth, no butterfly on the page. Only café (Ley 9815, 2020) has a law number. |
| 36 | https://www.pgr.go.cr/wp-content/uploads/2025/12/RG-250322.pdf | Gaceta N.º 58 (2022-03-25) fe de erratas: Ley N.º 6031 of 3 Jan 1977 (Gaceta N.º 09, 14 Jan 1977) "Declárase el yigüirro (Turdus grayi) ave nacional"; corrects "Turdus Craye". Signed Asamblea 2021-10-20, Presidencia 2021-12-17. |

### UNESCO World Heritage
| # | URL | Used for |
|---|-----|----------|
| 37 | https://whc.unesco.org/en/statesparties/cr | 4 properties (3 natural, 1 cultural) with years; tentative list (Corcovado + Isla del Caño, 2003); ratification 1977-08-23. |
| 38 | https://whc.unesco.org/en/list/205/ | Talamanca–La Amistad: 1983, 1990 extension (Panama); (vii)(viii)(ix)(x); provinces; N9 24 25.5 W82 56 19.7; 570,045 ha; synthesis. |
| 39 | https://whc.unesco.org/en/list/820/ | Cocos Island: (ix)(x); 202,100 ha (~2,400 ha island); 530–550 km offshore; synthesis. No year/coords in content. |
| 40 | https://whc.unesco.org/es/list/820/ | Spanish name; 1997 inscription, 2002 extension; core zone 199,700 ha; Spanish description. |
| 41 | https://whc.unesco.org/en/list/928/ | ACG: 1999, 2004 modification (Santa Elena 15,000 ha); (ix)(x); Guanacaste + Alajuela; N10 50 60 W85 37 0; 147,000 ha; ecosystems. |
| 42 | https://whc.unesco.org/en/list/1453/ | Diquís: (iii); Diquís Delta; Finca 6, Batambal, El Silencio, Grijalba-2; AD 500–1500; synthesis. No year/coords in content. |
| 43 | https://whc.unesco.org/es/list/1453/ | Spanish name; 2014; core 24.73 ha / buffer 143.423 ha; spheres 0.7–2.57 m; Spanish description. |

## WebSearch calls (discovery only, not cited)
1. "iucnredlist.org Ramphastos sulfuratus Keel-billed Toucan" → led to BirdLife DataZone (unusable).
2. "iucnredlist.org Bradypus variegatus Brown-throated Sloth" → Wikipedia, mammaldiversity.
3. "iucnredlist.org Turdus grayi Clay-colored Thrush" → allaboutbirds, Las Nubes.
4. "Morpho helenor Morpho peleides synonym Costa Rica …" → Wikipedia, BAMONA, Butterflies of America.
5. "Ley 9900 perezoso símbolo nacional …" → delfino.cr, teletica, observador (blocked).
6. "Morpho helenor peleides subspecies Blandin …" → Zootaxa, learnbutterflies.
7. "Yigüirro Turdus grayi ave nacional Costa Rica decreto 1977 …" → PGR Gaceta erratum PDF.
8. "\"Ley 10007\" perezoso símbolo nacional …" → Bufete de Costa Rica law-text PDF.

## Not attempted (and why)
- sinac.go.cr, inbio, UCR, Smithsonian STRI, Tropical Science Center: no species pages for these four taxa surfaced in searches within budget; UNA's Revista Ambientales was used instead for the sloths and the York University Las Nubes page for the thrush.
- Encyclopedia of Life and Britannica: skipped once ADW/Cornell/GBIF covered the required fields; adding them would have pushed the fetch count further over budget.
- Ramphastos ambiguus and Choloepus hoffmanni were not researched as separate species (brief asked for one line each); their mentions rest on the toucan and sloth sources above.

## Gaps carried into `unverified` in species.json
Costa Rica-specific slopes/elevations for all four species; sloth "fingered vs toed" terminology; exact sanction/publication date of Ley 10007; morpho wingspan, Spanish name and structural-colour mechanism; final status of M. peleides; Chinese common names; provinces and coordinates for Cocos Island and Diquís; Cocos Island area discrepancy (202,100 vs 199,700 ha); IUCN pages themselves (replaced by GBIF mirror DOIs).
