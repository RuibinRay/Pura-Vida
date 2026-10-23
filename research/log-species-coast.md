# Fetch log — coastal-scene species research for "Pura Vida: The Living Country"

Retrieval date: 2026-10-23. Tool: WebFetch for every fetch (an attempt to read api.gbif.org with curl was refused by the egress proxy, `CONNECT tunnel failed, response 403`, so the GBIF API was also read through WebFetch). WebSearch was used 3 times for discovery only; no search result is cited as a source. Output: `/home/claude/pura-vida/research/species-coast.json` (5 species: white-faced-capuchin, scarlet-macaw, red-eyed-tree-frog, central-american-agouti, green-iguana).

Budget note: the brief allowed 30–45 WebFetch calls. **49 WebFetch calls were made: 45 returned usable content, 3 failed, 1 returned a disambiguation page that was not used.** The overrun (4 calls) came from (a) AmphibiaWeb failing twice before the correct species ID (616) was found by search, (b) one GBIF query whose repeated `taxonKey` parameters were collapsed to the first key and therefore had to be repeated for the agouti, and (c) two extra Costa Rica-specific checks (Manuel Antonio National Park article; GBIF counts restricted to Puntarenas province) made so that the website-critical `habitatFit` field would rest on evidence rather than general knowledge.

Workaround for IUCN (as in `log-species.md`): iucnredlist.org blocks automated fetching, so `api.gbif.org/v1/species/{backboneKey}/iucnRedListCategory` gave the category, IUCN taxon ID and the IUCN-checklist usageKey, and `api.gbif.org/v1/species/{iucnUsageKey}/distributions` gave the assessment citation (assessors, year, DOI). The DOI strings are recorded as `iucn.url`. No fetch of iucnredlist.org or BirdLife DataZone was attempted.

## Failed or unusable fetches (4)

| # | URL | Result | Note |
|---|-----|--------|------|
| F1 | https://neotropical.birds.cornell.edu/Species-Account/nb/species/scamac1/overview | FAILED — robots_disallowed | Cornell Neotropical Birds (scarlet macaw) refuses automated fetching; macaw record rests on ADW and Wikipedia en/es. |
| F2 | https://amphibiaweb.org/species/632 | FAILED — server error | Species ID guessed wrongly (632 is not A. callidryas); AmphibiaWeb also returned an error. |
| F3 | https://amphibiaweb.org/cgi/amphib_query?where-genus=Agalychnis&where-species=callidryas | FAILED — server error | Second AmphibiaWeb attempt via the query endpoint. Replaced by fetch 45 (species/616, found through WebSearch). |
| F4 | https://en.wikipedia.org/wiki/Red-eyed_tree_frog | FETCHED but a disambiguation page (A. callidryas / A. taylori / Ranoidea chloris) | Not used as a source; the species article is `Agalychnis_callidryas` (fetch 43). |

## Successful fetches and their use (45)

### Taxonomy (GBIF Backbone, species/match)
| # | URL | Used for |
|---|-----|----------|
| 1 | https://api.gbif.org/v1/species/match?name=Cebus%20imitator | ACCEPTED: Cebus imitator Thomas, 1903; Primates; Cebidae; usageKey 8028197 |
| 2 | https://api.gbif.org/v1/species/match?name=Cebus%20capucinus | ACCEPTED as a separate species: Cebus capucinus (Linnaeus, 1758); usageKey 2436637 |
| 3 | https://api.gbif.org/v1/species/match?name=Ara%20macao | ACCEPTED: Ara macao (Linnaeus, 1758); Psittaciformes; Psittacidae; usageKey 5959227 |
| 4 | https://api.gbif.org/v1/species/match?name=Agalychnis%20callidryas | ACCEPTED: Agalychnis callidryas (Cope, 1862); Anura; Phyllomedusidae; usageKey 2428197 |
| 5 | https://api.gbif.org/v1/species/match?name=Dasyprocta%20punctata | ACCEPTED: Dasyprocta punctata Gray, 1842; Rodentia; Dasyproctidae; usageKey 2437576 |
| 6 | https://api.gbif.org/v1/species/match?name=Iguana%20iguana | ACCEPTED: Iguana iguana (Linnaeus, 1758); Iguanidae; GBIF ranks Squamata as class and gives no order; usageKey 2459658 |
| 7 | https://api.gbif.org/v1/species/match?name=Iguana%20rhinolopha | ACCEPTED as a separate species in the Backbone: Iguana rhinolopha Wiegmann, 1834; usageKey 2459663 (the 2020s Central American split) |

### IUCN category (GBIF mirror of the IUCN Red List)
| # | URL | Used for |
|---|-----|----------|
| 8 | https://api.gbif.org/v1/species/8028197/iucnRedListCategory | Cebus imitator: VULNERABLE (VU), iucnTaxonID 81265980, IUCN usageKey 176662707 |
| 9 | https://api.gbif.org/v1/species/2436637/iucnRedListCategory | Cebus capucinus: VULNERABLE (VU), iucnTaxonID 81257277 (nomenclature note only) |
| 10 | https://api.gbif.org/v1/species/5959227/iucnRedListCategory | Ara macao: LEAST_CONCERN (LC), iucnTaxonID 22685563, IUCN usageKey 176622827 |
| 11 | https://api.gbif.org/v1/species/2428197/iucnRedListCategory | Agalychnis callidryas: LEAST_CONCERN (LC), iucnTaxonID 55290, IUCN usageKey 176685486 |
| 12 | https://api.gbif.org/v1/species/2437576/iucnRedListCategory | Dasyprocta punctata: LEAST_CONCERN (LC), iucnTaxonID 89497686, IUCN usageKey 176670177 |
| 13 | https://api.gbif.org/v1/species/2459658/iucnRedListCategory | Iguana iguana: LEAST_CONCERN (LC), iucnTaxonID 174481, IUCN usageKey 176738894 |

### IUCN assessment citation (year, assessors, DOI)
| # | URL | Used for |
|---|-----|----------|
| 14 | https://api.gbif.org/v1/species/176662707/distributions | Capuchin: Williams-Guillén, Rosales-Meda, Méndez-Carvajal, Solano-Rojas, Urbani & Lynch Alfaro 2021; DOI 10.2305/IUCN.UK.2021-1.RLTS.T81265980A191708420.en |
| 15 | https://api.gbif.org/v1/species/176622827/distributions | Macaw: BirdLife International 2022; DOI 10.2305/IUCN.UK.2022-2.RLTS.T22685563A163778999.en |
| 16 | https://api.gbif.org/v1/species/176685486/distributions | Frog: IUCN SSC Amphibian Specialist Group 2020; DOI 10.2305/IUCN.UK.2020-1.RLTS.T55290A3028059.en |
| 17 | https://api.gbif.org/v1/species/176670177/distributions | Agouti: Emmons, L. 2016; DOI 10.2305/IUCN.UK.2016-2.RLTS.T89497686A78319610.en |
| 18 | https://api.gbif.org/v1/species/176738894/distributions | Iguana: Bock, B. et al. (about 17 co-authors) 2022; DOI 10.2305/IUCN.UK.2022-2.RLTS.T174481A218317281.en. Full author list not reproduced by the tool (quotation limit); recorded as "Bock, B. et al." |

### Presence in Costa Rica (GBIF occurrence counts)
| # | URL | Used for |
|---|-----|----------|
| 19 | https://api.gbif.org/v1/occurrence/search?taxonKey=8028197&country=CR&limit=0 | 8,155 Cebus imitator records in CR |
| 20 | https://api.gbif.org/v1/occurrence/search?taxonKey=2436637&country=CR&limit=0 | 632 records in CR still filed under Cebus capucinus |
| 21 | https://api.gbif.org/v1/occurrence/search?taxonKey=5959227&country=CR&limit=0 | 102,348 Ara macao records in CR |
| 22 | https://api.gbif.org/v1/occurrence/search?taxonKey=2428197&country=CR&limit=0 | 7,493 Agalychnis callidryas records in CR |
| 23 | https://api.gbif.org/v1/occurrence/search?taxonKey=2437576&country=CR&limit=0 | 18,103 Dasyprocta punctata records in CR |
| 24 | https://api.gbif.org/v1/occurrence/search?taxonKey=2459658&country=CR&limit=0 | 8,309 Iguana iguana records in CR |
| 25 | https://api.gbif.org/v1/occurrence/search?taxonKey=2459663&country=CR&limit=0 | 8 records in CR filed under Iguana rhinolopha |
| 48 | https://api.gbif.org/v1/occurrence/search?taxonKey=8028197&taxonKey=5959227&taxonKey=2428197&taxonKey=2437576&taxonKey=2459658&country=CR&stateProvince=Puntarenas&facet=speciesKey&facetLimit=20&limit=0 | Intended as one query for all five species in Puntarenas province (Pacific side); the repeated `taxonKey` parameters were collapsed to the first, so the result covers the capuchin only: 4,787 records (facet speciesKey 8028197 = total count). Used for the capuchin's Pacific presence. |
| 49 | https://api.gbif.org/v1/occurrence/search?taxonKey=2437576&country=CR&stateProvince=Puntarenas&limit=0 | 2,897 agouti records in Puntarenas province — the only Pacific-side evidence found for the agouti |

### White-faced capuchin
| # | URL | Used for |
|---|-----|----------|
| 26 | https://en.wikipedia.org/wiki/Panamanian_white-faced_capuchin | Approximate: C. imitator (Thomas, 1903); treated as C. capucinus imitator until the 21st century; Boubli et al. 2012 split; range Honduras, Nicaragua, Costa Rica, Panama; very common in CR (Manuel Antonio, Corcovado, Santa Rosa; Guanacaste; Carara); 335–453 mm, tail to 551 mm, up to 3.9 kg; habitats; diet; troops mean 16 (4–40); tool use; fur-rubbing; seed/pollen dispersal; >54 yr captive; IUCN VU; 5,000-colón note; Jicarón howler-infant carrying. |
| 27 | https://animaldiversity.org/accounts/Cebus_capucinus/ | ADW (under C. capucinus): range incl. Costa Rica; forest types, coastal plains, 0–2,100 m; mass 2–4 kg, max length 435 mm (unlabelled); diet 50–80 % fruit, 63 plant spp. at Santa Rosa; groups 18–20, home range ~80 ha, female philopatry, males leave ~4 yr; seed dispersal; predators; lifespan 55 max captive / ~30 wild; gestation ~160 d; older IUCN LC; CITES II. |
| 28 | https://es.wikipedia.org/wiki/Cebus_imitator | Redirected to "Capuchino cariblanco" (C. capucinus): Spanish names (mono carablanca, maicero cariblanco, capuchino, tanque, machín, carita blanca…); countries Honduras–Panamá; mixed troops with Saimiri oerstedii in Manuel Antonio; on the 5,000-colón bill since 2011; 33.5–45.3 cm, tail to 55.1 cm, 1.5–4 kg; home range 32–86 ha, 1–3 km/day; IUCN LC (outdated). |

### Scarlet macaw
| # | URL | Used for |
|---|-----|----------|
| 30 | https://animaldiversity.org/accounts/Ara_macao/ | ADW: Psittaciformes/Psittacidae; range S Mexico to NE Argentina (CR not named); rainforest canopy below 1,000 m; 89 cm, 1,200 g (1,040 g AnAge); diet fruit/nuts/nectar/clay (tannins); pairs, roosting flocks; clutch 2–4, incubation 24–25 d, maturity 3–4 yr; lifespan avg 64 yr captive; seed predator; IUCN LC; CITES I; threats incl. scarce nest trees. No wingspan. |
| 31 | https://en.wikipedia.org/wiki/Scarlet_macaw | Approximate: ~84 cm (C. American ssp. 89 cm), ~1 kg; subspecies A. m. macao / A. m. cyanopterus; habitats and elevations; CR populations near Nicoya, Carara, Osa; canopy >10 m; teak/beach-almond planting Tárcoles–Esterillos; clay licks; lifelong pairs; 2–3 eggs, ~5 wk, fledge ~90 d; 40–50 yr typical, 75+ captive; LC (2022), 50,000–499,999 birds; CITES I; USFWS-endangered subspecies (2,000–3,000); national bird of Honduras. |
| 32 | https://es.wikipedia.org/wiki/Ara_macao | Approximate: Spanish names incl. 'lapa roja', 'guara roja' (Central America), guacamaya roja/bandera, lapa colorada…; up to 90.7 cm, tail ~53 cm, ~1 kg; CR once common on both coasts, now "casi no existe del lado del Caribe"; main populations Corcovado, Carara, ACG; isolated Palo Verde, La Amistad; range to ~20 % of CR by 1993; seeds ~3/4 of diet; clay vs Hura crepitans; breeding Nov–May, 1–4 eggs, ~25 d, fledge 65–75 d; CITES I since 1985-08-01; subspecies ranges (A. m. macao from Costa Rica southward). |

### Red-eyed tree frog
| # | URL | Used for |
|---|-----|----------|
| 35 | https://es.wikipedia.org/wiki/Agalychnis_callidryas | Approximate: 'rana verde de ojos rojos' / 'rana de ojos rojos'; 56 mm males, 71 mm females; E Honduras to NW Colombia; 2019 A. taylori split; humid lowland rainforest near water; eggs on leaves over water; mainly insects; weak skin toxins; environmental indicator; Kölbi (ICE) logo in Costa Rica. |
| 43 | https://en.wikipedia.org/wiki/Agalychnis_callidryas | Approximate: (Cope, 1862), Phyllomedusidae; ~51 mm / ~76 mm; Honduras–Colombia; CR/Panama flank-colour variants; humid lowlands, ≥80 % humidity; camouflage and startle display; vibration signalling; breeding Oct–Mar, ~40 eggs, 6–8 (6–10) d, early hatching vs Polybia rejecta / Leptodeira septentrionalis; diet; LC (2020); pet trade in CR, Nicaragua, Panama; predators; nictitating membrane; ~5 yr wild lifespan. |
| 45 | https://amphibiaweb.org/species/616 | AmphibiaWeb (primary): Hylidae: Phyllomedusinae as used there; SVL to 77 mm females / 59 mm males (Savage 2002); coloration; countries incl. Costa Rica; Caribbean-side CR populations with yellowish stripe; lowlands, premontane to 1,250 m; humid forest, breeding pools, leaf roosting; wet-season breeding late May–Nov (peaks Jun, Oct); clutches ~40, up to 5/night; hatching 6–10 d (~7), early hatching 4–5 d (snakes whole clutch, wasps individual, fungus); tadpoles survive 20 h out of water; vibrational signalling; lab diet crickets/moths; IUCN LC; CITES II since 2010-03-21; 221,960 US imports; predators; Spanish names 'Rana Arborícola', 'Rana Calzonudo'; froglets' yellow eyes. |
| 46 | https://amphibiansoftheworld.amnh.org/Amphibia/Anura/Phyllomedusidae/Agalychnis/Agalychnis-callidryas | ASW (primary catalogue): Hyla callidryas Cope, 1862; names incl. 'Rana de Ojos Rojos Común'; distribution "Caribbean lowlands … to central Panama; Pacific lowlands of southern Costa Rica and eastern Panama to the Chocó …, sea level to 1325 m"; 2019 recognition of A. taylori; A. helenae available for E Honduras/N Costa Rica populations (no action taken). |

### Central American agouti
| # | URL | Used for |
|---|-----|----------|
| 36 | https://animaldiversity.org/accounts/Dasyprocta_punctata/ | ADW: Rodentia/Dasyproctidae; S Mexico to N Argentina, introduced Cayman Is.; forests, brush, savanna, cultivated land, near water, to 2,000 m; dens; 415–620 mm, tail 10–35 mm, 1.3–4.0 kg; diet (fruit, hears fruit fall, buries seeds, follows monkeys, crabs); diurnal→nocturnal if hunted; lifelong pairs, 1–2 ha; displays, freeze with forefoot raised, 2 m jump; gestation 104–120 d, litters ~2, births Mar–Jul; wild lifespan ~10 yr; seed caching regenerates trees; predators; LC, CITES III; hunting declines. CR not named. |
| 37 | https://en.wikipedia.org/wiki/Central_American_agouti | Approximate: J. E. Gray, 1842; D. variegata note; 3–4.2 kg; range incl. Central America, disjunct S population, introduced Cuba/Cayman; "Atlantic slope of Costa Rica and Panama" coat note; diet, seed storing; diurnal, monogamous; important seed disperser; LC; smell ranked 4th of 240 species. |
| 38 | https://es.wikipedia.org/wiki/Dasyprocta_punctata | Approximate: Spanish names (agutí centroamericano, guatusa [Ecuador], cherenga, ñeque, guatín, cotuza…; CR not named); 42–62 cm, 2–3 kg; introduced Puerto Rico; forests below 2,000 m, burrows; buries seeds; gestation 93–104 d, 1–3 young, 2–3 litters/yr; lifespan >13 yr; LC. |

### Green iguana
| # | URL | Used for |
|---|-----|----------|
| 39 | https://reptile-database.reptarium.cz/species?genus=Iguana&species=iguana | Reptile Database: Iguanidae, Iguania, Sauria, Squamata; synonymy incl. Iguana (Hypsilophus) rhinolophus Wiegmann 1834 and Iguana rhinolopha; recent uses of I. rhinolopha (Breuil et al. 2020; Alvarado et al. 2022; Peralta-García et al. 2023; Sunyer & Martínez-Fonseca 2023); "rhinolopha: Mexico (Yucatan peninsula), Nicaragua, south to Panama"; "Most recent authors don't seem to recognize rhinolopha any more"; Costa Rica in the I. iguana distribution; insularis/sanctaluciae/melanoderma comments (melanoderma synonymised by van den Burg et al. 2026); common names incl. Spanish 'Iguana de Ribera'. No size. |
| 40 | https://en.wikipedia.org/wiki/Green_iguana | Approximate: subspecies and 2019–2026 proposals incl. I. rhinolopha; 1.2–1.7 m, SVL 30–42 cm, male ~4 kg, female 1.2–3 kg, large males 8 kg+; native and introduced ranges; arboreal near water; diet (100+ plants, Spondias mombin, juveniles eat adult faeces); 15 m falls, submerged swimming, tail autotomy, dewlap, parietal eye; 20–71 eggs, burrows 0.3–2.4 m, hatch 10–15 wk; LC (2022), CITES II; hunting history (Nicaragua 1976, Panama 1960s); 'gallina de palo', 'garrobo'; red animals of western Costa Rica; Florida/Puerto Rico invasives. |
| 41 | https://es.wikipedia.org/wiki/Iguana_iguana | Approximate: 'iguana verde', 'iguana común'; up to 2 m, male SVL 30–40 cm, "más de 15 kg" (implausible); Mexico to Brazil/Paraguay + Caribbean (CR not named); tropical forest and mangroves, pastures, riverbanks, acahuales; sea level to ~1,000 m; strictly herbivorous; nesting tunnels, hatching 70–90 d; LC, CITES II; four subspecies; meat and eggs eaten. |

### Costa Rica-specific checks and national symbols
| # | URL | Used for |
|---|-----|----------|
| 44 | https://www.presidencia.go.cr/simbolos-nacionales/ | 15 symbols listed (published 2023-10-30); none of the five species appears; only bird: "En 1977 se decreta el Yigüirro como Ave Nacional debido a su armonioso canto". |
| 47 | https://en.wikipedia.org/wiki/Manuel_Antonio_National_Park | Pacific-coast park south of Quepos (Puntarenas), 1,983 ha, 1972; names 'Panamanian white-faced capuchin monkey', 'green iguana', 'black spiny-tailed iguana', 'Central American squirrel monkey' (Endangered); does not name the agouti, scarlet macaw or any amphibian. |

(Fetch numbers 29, 33, 34 and 42 are the failed/unusable fetches F1–F4 above; numbering follows the order in which the calls were made.)

## WebSearch calls (discovery only, not cited)
1. "Agalychnis callidryas Costa Rica distribution Pacific slope Caribbean lowlands elevation Savage" → revealed the correct AmphibiaWeb ID (species/616) and the Amphibian Species of the World entry.
2. "Manuel Antonio National Park fauna list white-faced capuchin green iguana agouti scarlet macaw red-eyed tree frog" → only tour-operator blogs; the Wikipedia park article was fetched instead.
3. "Dasyprocta punctata 'Costa Rica' Pacific Osa OR Corcovado OR 'Manuel Antonio' OR Carara mammals survey guatusa" → unspecific PDFs (Pacuare, Caribbean); replaced by the GBIF Puntarenas count (fetch 49).

## Not attempted (and why)
- iucnredlist.org and BirdLife DataZone: known to block or render empty (see `log-species.md`); GBIF mirror used instead.
- SINAC, Macaw Recovery Network, Smithsonian/STRI, UCR/UNA pages: none surfaced in the three searches within budget; Costa Rica-specific evidence therefore comes from GBIF province counts, ASW, AmphibiaWeb and Wikipedia.
- zh.wikipedia.org for the Chinese names: skipped to stay near budget; names recorded as uncertain.
- ADW for Iguana iguana and an IUCN check for Iguana rhinolopha: skipped for budget; iguana biology rests on Wikipedia (flagged approximate).

## Gaps carried into `unverified` in species-coast.json
Chinese names; Costa Rican usage of the Spanish names; explicit assignment of the Costa Rican capuchins to C. imitator and of the Costa Rican iguanas to I. iguana vs I. rhinolopha; Caribbean-slope presence and Costa Rican elevation ranges for the capuchin, agouti and iguana; macaw subspecies in Costa Rica, Costa Rican population figures, Caribbean reintroductions and wingspan; conflicting size/breeding figures (capuchin, macaw, agouti, iguana); frog family placement, breeding season, body mass and presence in Guanacaste/Manuel Antonio by name; agouti presence in named Pacific parks; full IUCN assessor list for the iguana; post-2023 national-symbol additions (cited from research/country.json, not re-fetched).
