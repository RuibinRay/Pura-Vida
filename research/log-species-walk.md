# Fetch log — homepage-walk species research for "Pura Vida: The Living Country"

Retrieval date: 2026-10-23. Tool: WebFetch for every fetch (the GBIF API was read through WebFetch, as in `log-species-coast.md`). WebSearch was used 4 times for URL discovery only; no search result is cited as a source. Output: `/home/claude/pura-vida/research/species-walk.json` (6 new species: resplendent-quetzal, bairds-tapir, white-tailed-deer, great-blue-heron, volcano-hummingbird, purple-throated-mountain-gem; plus `fitChecks` for scarlet-macaw, keel-billed-toucan, brown-throated-three-toed-sloth, blue-morpho and clay-colored-thrush).

Budget note: the brief allowed about 50 WebFetch calls. **63 WebFetch calls were made: 60 returned content that was used (one of them, the Cornell thrush page, only for its habitat sentence), 1 failed outright, 2 returned the wrong eBird hotspot and were not used.** The overrun came from (a) the GBIF three-call method (match → category → distributions) applied to seven taxa instead of six because both Irazú hummingbird candidates were checked, plus a fourth call for the tapir whose accepted Backbone name (Tapirella bairdii) returns NOT_EVALUATED, (b) one heron distributions call that had to be repeated because the DOI was not returned, (c) two wrong eBird hotspots found by search while looking for an Irazú bird list, and (d) one extra Spanish Wikipedia fetch for the heron's Spanish names, which are a visible field on a trilingual site.

Workaround for IUCN (as in the earlier logs): iucnredlist.org blocks automated fetching, so `api.gbif.org/v1/species/{backboneKey}/iucnRedListCategory` gave the category, IUCN taxon ID and the IUCN-checklist usageKey, and `api.gbif.org/v1/species/{iucnUsageKey}/distributions` gave the assessment citation (assessors, year, DOI). The DOI strings are recorded as `iucn.url`. New this time: GBIF occurrence searches filtered by `stateProvince` and by recorded `elevation=min,max`, with `facet=month`, `facet=scientificName` or `facet=stateProvince`, were used as Costa Rica-specific evidence for seasonality (heron), altitude (hummingbirds, thrush) and which Morpho species occur in the cloud-forest band. Caveat written into the records: only a minority of GBIF records carry an elevation value, so elevation-band counts are small and were never used alone.

## Failed or unusable fetches (3)

| # | URL | Result | Note |
|---|-----|--------|------|
| 31 | https://leap.unep.org/en/countries/cr/national-legislation/ley-no-7497-declara-al-venado-cola-blanca-odocoileus-virginianus | FAILED — client_error | UNEP LEAP record of Ley 7497 (would have given the Gaceta date). Replaced by fetch 34, the FAOLEX PDF of the law itself. |
| 59 | https://ebird.org/region/L4557823/bird-list | FETCHED but wrong hotspot (Cordoncillo de Volcán, Puntarenas; 69 species, no highland hummingbirds) | Found by WebSearch for an Irazú hotspot; not used. |
| 60 | https://ebird.org/region/L1246818/bird-list | FETCHED but wrong hotspot (Reserva Natural Volcán Cosigüina, Chinandega, Nicaragua) | Same search; not used. No Irazú bird list was obtained — recorded in `unverified`. |

## Successful fetches and their use (60)

### Taxonomy (GBIF Backbone, species/match)
| # | URL | Used for |
|---|-----|----------|
| 1 | https://api.gbif.org/v1/species/match?name=Pharomachrus%20mocinno | ACCEPTED: Pharomachrus mocinno La Llave, 1832; Trogoniformes; Trogonidae; usageKey 2496723 |
| 2 | https://api.gbif.org/v1/species/match?name=Tapirus%20bairdii | SYNONYM of Tapirella bairdii (Gill, 1865), accepted usageKey 8395500 (synonym key 2440897); Perissodactyla; Tapiridae — nomenclature note in the record |
| 3 | https://api.gbif.org/v1/species/match?name=Odocoileus%20virginianus | ACCEPTED: Odocoileus virginianus (Zimmermann, 1780); Artiodactyla; Cervidae; usageKey 2440965 |
| 4 | https://api.gbif.org/v1/species/match?name=Ardea%20herodias | ACCEPTED: Ardea herodias Linnaeus, 1758; Pelecaniformes; Ardeidae; usageKey 9630752 |
| 5 | https://api.gbif.org/v1/species/match?name=Selasphorus%20flammula | ACCEPTED: Selasphorus flammula Salvin, 1865; Apodiformes; Trochilidae; usageKey 2476847 |
| 6 | https://api.gbif.org/v1/species/match?name=Panterpe%20insignis | ACCEPTED: Panterpe insignis Cabanis & Heine, 1860; Trochilidae; usageKey 2476164 (Irazú alternative, recorded as related species) |
| 47 | https://api.gbif.org/v1/species/match?name=Lampornis%20calolaemus | ACCEPTED: Lampornis calolaemus (Salvin, 1865); Apodiformes; Trochilidae; usageKey 2476738 |
| 52 | https://api.gbif.org/v1/species/match?name=Morpho%20helenor | ACCEPTED: Morpho helenor Cramer, 1782; Nymphalidae; usageKey 5133265; genusKey 1909888 (needed for fetch 55) |

### IUCN category (GBIF mirror of the IUCN Red List)
| # | URL | Used for |
|---|-----|----------|
| 7 | https://api.gbif.org/v1/species/2496723/iucnRedListCategory | Quetzal: NEAR_THREATENED (NT), iucnTaxonID 22682727, IUCN usageKey 176610208; authority written 'de la Llave, 1832' |
| 8 | https://api.gbif.org/v1/species/8395500/iucnRedListCategory | Tapirella bairdii (accepted Backbone name): NOT_EVALUATED — the assessment is filed under Tapirus; recorded in the nomenclature note |
| 9 | https://api.gbif.org/v1/species/2440965/iucnRedListCategory | Deer: LEAST_CONCERN (LC), iucnTaxonID 42394, IUCN usageKey 176669171 |
| 10 | https://api.gbif.org/v1/species/9630752/iucnRedListCategory | Heron: LEAST_CONCERN (LC), iucnTaxonID 181500967, IUCN usageKey 176611616 |
| 11 | https://api.gbif.org/v1/species/2476847/iucnRedListCategory | Volcano hummingbird: LEAST_CONCERN (LC), iucnTaxonID 22688302, IUCN usageKey 176625519; authority written 'Salvin, 1864' |
| 12 | https://api.gbif.org/v1/species/2476164/iucnRedListCategory | Fiery-throated hummingbird: LEAST_CONCERN (LC), iucnTaxonID 22687408 (related species only) |
| 13 | https://api.gbif.org/v1/species/2440897/iucnRedListCategory | Tapirus bairdii (synonym key): ENDANGERED (EN), iucnTaxonID 21471, IUCN usageKey 176661008 |
| 48 | https://api.gbif.org/v1/species/2476738/iucnRedListCategory | Mountain-gem: LEAST_CONCERN (LC), iucnTaxonID 22729036, IUCN usageKey 176625893 |

### IUCN assessment citation (year, assessors, DOI)
| # | URL | Used for |
|---|-----|----------|
| 14 | https://api.gbif.org/v1/species/176610208/distributions | Quetzal: BirdLife International 2023; DOI 10.2305/IUCN.UK.2023-1.RLTS.T22682727A221577625.en |
| 15 | https://api.gbif.org/v1/species/176669171/distributions | Deer: Gallina, S. and Lopez Arevalo, H. 2016; DOI 10.2305/IUCN.UK.2016-2.RLTS.T42394A22162580.en |
| 16 | https://api.gbif.org/v1/species/176611616/distributions | Heron: BirdLife International 2020 — the tool paraphrased the citation and did not return the DOI (quotation limit) |
| 17 | https://api.gbif.org/v1/species/176611616/distributions | Heron, repeated with a DOI-only prompt: 10.2305/IUCN.UK.2020-3.RLTS.T181500967A181565357.en |
| 18 | https://api.gbif.org/v1/species/176661008/distributions | Tapir: García, Jordan, O'Farril, Poot, Meyer, Estrada, Leonardo, Naranjo, Simons, Herrera, Urgilés, Schank, Boshoff & Ruiz-Galeano 2016 (first author rendered 'Garcìa' by the tool); DOI 10.2305/IUCN.UK.2016-1.RLTS.T21471A45173340.en |
| 49 | https://api.gbif.org/v1/species/176625519/distributions | Volcano hummingbird: BirdLife International 2021; DOI 10.2305/IUCN.UK.2021-3.RLTS.T22688302A167031365.en |
| 51 | https://api.gbif.org/v1/species/176625893/distributions | Mountain-gem: BirdLife International 2021; DOI 10.2305/IUCN.UK.2021-3.RLTS.T22729036A167019920.en |

### Costa Rica-specific GBIF occurrence queries
| # | URL | Used for |
|---|-----|----------|
| 39 | https://api.gbif.org/v1/occurrence/search?taxonKey=2476164&country=CR&stateProvince=Cartago&elevation=2800,3400&limit=0 | Fiery-throated hummingbird: 17 records with elevation 2,800–3,400 m in Cartago (Irazú band) |
| 40 | https://api.gbif.org/v1/occurrence/search?taxonKey=2476847&country=CR&stateProvince=Cartago&elevation=2800,3400&limit=0 | Volcano hummingbird: 3 records in the same band — both counts recorded honestly in the Irazú record |
| 41 | https://api.gbif.org/v1/occurrence/search?taxonKey=9630752&country=CR&stateProvince=Lim%C3%B3n&facet=month&facetLimit=12&limit=0 | Great blue heron: 3,745 records in Limón; month counts Jan 635, Feb 650, Mar 532, Apr 214, May 81, Jun 88, Jul 92, Aug 94, Sep 96, Oct 584, Nov 324, Dec 355 → mainly a non-breeding visitor Oct–Apr |
| 53 | https://api.gbif.org/v1/occurrence/search?taxonKey=2490716&country=CR&stateProvince=Cartago&elevation=2000,3000&facet=scientificName&facetLimit=3&limit=0 | Clay-colored thrush: 0 records with elevation 2,000–3,000 m in Cartago (thrush fit check; inconclusive) |
| 55 | https://api.gbif.org/v1/occurrence/search?taxonKey=1909888&country=CR&elevation=1300,1700&facet=scientificName&facetLimit=20&limit=0 | Genus Morpho at 1,300–1,700 m in CR: 52 records — M. helenor 22, M. theseus justitiae 13, genus-only 9, M. peleides 2, BOLD barcodes 6 (Monteverde fit check) |
| 57 | https://api.gbif.org/v1/occurrence/search?taxonKey=2490716&country=CR&elevation=2000,3000&facet=stateProvince&facetLimit=10&limit=0 | Clay-colored thrush: 5 CR records with elevation 2,000–3,000 m — Pérez Zeledón 3 (name garbled by encoding), 'Cart' 1, San José 1 |
| 62 | https://api.gbif.org/v1/occurrence/search?taxonKey=5133265&country=CR&facet=stateProvince&facetLimit=10&limit=0 | Morpho helenor: 2,438 CR records; Puntarenas 713, Alajuela 326, Limón 302, Guanacaste 250 (+118 'Guanacaste Province'), Heredia 211, Cartago 129, San José 103 (+58 mis-encoded), Alajuela Province 29 (Corcovado and Tortuguero fit checks) |

### Resplendent quetzal (Monteverde)
| # | URL | Used for |
|---|-----|----------|
| 19 | https://en.wikipedia.org/wiki/Resplendent_quetzal | Approximate: de la Llave 1832, Mociño eponym; subspecies mocinno and costaricensis (Costa Rica, W Panama); 36–40 cm, ~210 g, tail coverts 31–100.5 cm (median 75); 900–3,200 m (other sources 1,000–3,000 / 1,300–3,000); cloud-forest canopy; altitudinal migration (Pacific slope Jul–Oct then Atlantic slope; Bjork & Powell 1994, Monteverde; Children's Eternal Rainforest); diet (Lauraceae >50 %, 41–43 fruit species, wild avocados, Symplococarpon purpusii, 32 tree species dispersed, insects, frogs, lizards, snails); breeding (cavities, 1–3 eggs, 17–19 d, male by day/female by night, 67–78 % nest failure, two clutches, ~1 month to fledge, 3 years for plumes); NT, 20,000–49,999, 11 patches in 2001; Guatemalan flag, coat of arms, currency, Tecún Umán legend; symbol of liberty; 2004 captive breeding, iron/tannic acid; largest trogon. |
| 20 | https://es.wikipedia.org/wiki/Pharomachrus_mocinno | Approximate: names 'quetzal guatemalteco', 'quetzal resplandeciente', 'quetzal centroamericano', 'quetzalí' (female); 36–40 cm, tail to 65 cm, ~210 g; costaricensis slightly smaller; range incl. central Costa Rica; 1,000–3,000 m cloud forest; diet (laurels, aguacates, seed regurgitation); monogamous, territory 6–10 ha in Guatemala; 1–3 (or 2) eggs, 17–19 d; NT, CITES I, NOM-059; Guatemalan national bird since 1871, decree 8-70, currency Q; Kukulcán/Quetzalcóatl, headdresses, plucked and released. |
| 21 | https://animaldiversity.org/accounts/Pharomachrus_mocinno/ | ADW (primary): range S Mexico to Panama, legally protected in Mexico, Guatemala, Costa Rica, Panama; cloud and montane forest, 4,000–10,000 ft; 35 cm bill to tail base, tail to 90 cm; breeding Mar–Jun, usually two eggs, 17–18 d, nests 15–45 ft up, three years for plumes; territorial calls every 8–10 min; 'relatively inactive'; Lauraceae/aguacatillo, insects, frogs, lizards; seed-dispersal mutualism; NT; threats; Guatemalan national bird and tourism captivity. |
| 22 | https://en.wikipedia.org/wiki/Monteverde_Cloud_Forest_Reserve | Approximate: Puntarenas and Alajuela; founded 1972 (infobox 1973), George Powell, Adelaida Chaverri, Tropical Science Center; ~10,500 ha; six life zones; ~400 birds, ~100 mammals, >2,500 plants, >500 orchids; quetzal moves seasonally from high nesting sites on both sides of the divide; bellbird; golden toad 1989; no hummingbird, gallery or Morpho mention; elevation and rainfall NOT stated (→ unverified). |
| 44 | https://ebird.org/region/L2160384/bird-list | eBird hotspot 'Monteverde Cloud Forest Reserve--Entrance road', Puntarenas: 39 species on the list shown; Resplendent Quetzal (5 on 16 May 2024); hummingbirds Lesser Violetear, Green-crowned Brilliant, Violet Sabrewing, Stripe-tailed Hummingbird, Purple-throated Mountain-gem. Used for the quetzal and mountain-gem fits and the related-species list. |

### Baird's tapir (Corcovado)
| # | URL | Used for |
|---|-----|----------|
| 23 | https://animaldiversity.org/accounts/Tapirus_bairdii/ | ADW (primary): range SE Mexico to Gulf of Guayaquil, extinct in El Salvador; sea level to 3,600 m, marshes, mangroves, rainforest, cloud forest, páramo, prefers secondary forest; 150–300 kg, 180–250 cm, shoulder 73–120 cm; largest native Neotropical land mammal; gestation 390–400 d, one 9.4 kg calf, weaning ~12 months, 0.7 litters/yr; 29.6 yr captive; nocturnal, solitary, densities 0.05–0.8/km², home range 1.25–1.70 km², swimmer; diet leaves/fruit/twigs to 1.5 m; seed disperser, indicator; EN, <5,000 mature, US Endangered, CITES I; threats; tenth rarest. |
| 24 | https://en.wikipedia.org/wiki/Baird%27s_tapir | Approximate: Gill 1865, Baird eponym, Tapirella synonym; 1.8–2.5 m, 73–120 cm, 150–300 kg; habitats to 3,600 m; diet; nocturnal, solitary, rests in water; >30 yr; ~400 d gestation, 9.4 kg calf; EN; threats; Belize national animal 'mountain cow'; 'danta'; Corcovado claw marks and 2006 attack on Carlos Manuel Rodríguez Echandi. |
| 25 | https://es.wikipedia.org/wiki/Tapirus_bairdii | Approximate: names by country ('anteburro' Costa Rica); 2–2.2 m, 1 m, 300 kg; Costa Rica ~1,000 (IUCN), Osa 250–300, Corcovado 249 ± 51, Tilarán 31–155, both slopes to 3,000 m, most areas >10,000 ha; near water; Corcovado diet 65.4 % leaves, 25.2 % fibre, 9.4 % fruit; Enterolobium, Raphia; 400 d gestation, ~10 kg calf walks after 15 min; EN assessed 2014/published 2016; CITES I; country estimates; jaguars; leaf-cutter ants on wounds. |
| 26 | https://en.wikipedia.org/wiki/Corcovado_National_Park | Approximate: Osa Peninsula, Osa canton (Puntarenas not named), established 24 Oct 1975, 424 km² (text also '41,800 hectares'); 'home to the endangered Baird's tapir and a small harpy eagle population'; coast sightings incl. 'scarlet macaws (the largest population in the country)'; two- and three-toed sloths; five felines; 220 butterfly species (no Morpho); 2.5 % of world biodiversity claim. Used for tapir, macaw and morpho fits. |

### White-tailed deer (Guanacaste)
| # | URL | Used for |
|---|-----|----------|
| 27 | https://animaldiversity.org/accounts/Odocoileus_virginianus/ | ADW (primary): range to Bolivia (CR not named); habitats; 150–200 cm, tail 10–28 cm, shoulder 80–100 cm, 57–137 kg, fawns 1.5–2.5 kg; gestation 6.5 months (198 d), 1–3 fawns avg 2, weaning 8–10 wk, maturity ~2 yr; lifespans; tail flagging, 30 mph, swimming, crepuscular, social units; diet; browsing impact and predators incl. jaguars; LC, 8–15 million. |
| 28 | https://es.wikipedia.org/wiki/Odocoileus_virginianus | Approximate: names venado cola blanca, capasurí, ciervo de Virginia, venado gris…; N American weights, tropical ≤60 kg; Canada to N Peru; subspecies truei (Centroamérica), nelsoni, chiriquensis; habitats; diet incl. frutos, semillas, bellotas, hongos; 7-month gestation, 1–3 young; declared 'símbolo patrio' of Costa Rica 2 May 1995; ₡1,000 note since 2011; Honduras symbol of fauna 28 Jun 1993; not at risk. |
| 29 | https://www.presidencia.go.cr/simbolos-nacionales/ | 15 symbols (page dated 2023-10-30): 'Venado Cola Blanca (1995): Fue declarado símbolo de la fauna de Costa Rica en 1995'; 'En 1977 se decreta el Yigüirro como Ave Nacional…'; no quetzal, tapir, heron, hummingbird, sloth or Morpho. Used in every record's nationalSymbol block. |
| 30 | https://en.wikipedia.org/wiki/Santa_Rosa_National_Park | Approximate: Guanacaste, 36 km N of Liberia; created 1966 by decree 3694; ~495 km² (infobox 389.71 terrestrial + 425.60 marine); Battle of Santa Rosa 20 Mar 1856 (14 minutes), La Casona; Central American dry forests, savannas, deciduous forest, marshes, mangroves; ACG World Heritage; coyotes, peccaries, coatis, Baird's tapirs, turtles, three monkeys, four cats; deer and macaws NOT mentioned (negative evidence recorded). |
| 32 | https://www.acguanacaste.ac.cr/manejo-de-recursos/594-deutsch/biodesarrollo/tecnologias-de-informacion-y-comunicacion/venado | ACG (primary, Costa Rican): 'Las sabanas de Guanacaste han sido su hogar, especialmente el Parque Nacional de Santa Rosa'; description, antlers only in males, spotted juveniles; active day and night, alone or small groups; velvet rubbing Feb–Jun in Santa Rosa; shed antlers rot; calcium-poor diet → smaller antlers; declared National Symbol 2 May 1995 under José María Figueres Olsen; 'cada vez es más difícil verlo' (habitat loss, illegal hunting). |
| 33 | https://doaj.org/article/d1e699b572bc4ce9a2e6e71df0e54588 | DOAJ record of Sáenz & Vaughan 1998, Revista de Biología Tropical 46(4): 1185–1197: eight deer released 1987–88 at La Emilia farm, Guanacaste (from San Lucas Island and Palo Verde NP), radio-tracked 13 months, daily home ranges ~18 ha, habitat use (pasture, Pithecellobium saman, crops, riparian, forest, chaparral, jaraguá, guácimo). Santa Rosa not mentioned. |
| 34 | https://faolex.fao.org/docs/pdf/cos3894.pdf | FAOLEX copy of Ley N° 7497 'Declaratoria del venado cola blanca como símbolo de la fauna silvestre de Costa Rica': Art. 1 'Se declara símbolo de la fauna silvestre de Costa Rica el venado cola blanca (Odocoileus virginianus)'; Arts. 2–5 (population studies, vedas, zoocriaderos, reform of Ley 7317, vigencia); commission 5 Apr 1995, Assembly 24 Apr 1995, signed San José 2 May 1995 by José María Figueres Olsen and René Castro Salazar; Gaceta date not in the text. Primary source for the national-symbol block. |

### Great blue heron (Tortuguero)
| # | URL | Used for |
|---|-----|----------|
| 35 | https://animaldiversity.org/accounts/Ardea_herodias/ | ADW (primary): breeds N and C America, some populations winter in C and S America without breeding; habitats, breeding to 1,500 m; 97–137 cm, 2.1–2.5 kg (height '~60 cm' not used); plumage incl. white crown/throat/cheeks and blackish face stripe, white morph +10 %, Wurdemann's; monogamous, rookeries, nests 9–21 m, 2–7 eggs (avg 3–5), 26–30 d, fledging 56–60 d, maturity ~22 months; lifespans (avg 15 yr wild, 69 % first-year mortality); solitary forager, roosts >100; diet; predators; ecosystem roles; LC, threats. |
| 36 | https://en.wikipedia.org/wiki/Great_blue_heron | Approximate: Linnaeus 1758; 91–137 cm, wingspan 167–201 cm, height 115–138 cm, 1.82–3.6 kg, largest N American heron; plumage; range and migration (winters C America / N S America; southern populations resident); habitats incl. mangrove swamps; fish 10–20 cm, water <50 cm; heronries 5–500 (avg ~160), 3–6 eggs, ~27 d, fledging 55–80 d; five subspecies incl. occidentalis (great white heron), Würdemann's; grey heron and cocoi heron comparisons. |
| 37 | https://en.wikipedia.org/wiki/Tortuguero_National_Park | Approximate: Limón, Caribbean coast, boat/plane only; established 1975; ~312 km² (text 31,174 ha); up to 6,400 mm rain; canals, lagoons, Raphia taedigera and Manicaria saccifera swamps; mangrove a minor element; four turtle species, 2nd-largest green-turtle beach; 442 birds (134 migratory) incl. kingfishers, toucans, great blue herons, parrots; great green macaw (Ara ambiguus) the only macaw named; three-toed sloths (Bradypus variegatus), three monkeys; manatees, caimans, crocodiles, gar; jaguar, ocelot, jaguarundi, puma; no butterflies. Used for heron, macaw, toucan, sloth and morpho fits. |
| 38 | https://www.allaboutbirds.org/guide/Great_Blue_Heron/overview | Cornell (primary): 5–6 lb, hollow bones; shorelines, marshes, estuaries, meadows, fields; fish and gophers; sick fish at hatcheries; motionless/belly-deep hunting; neck vertebrae; day and night hunting (rods); great white heron off S Florida, Yucatán, Caribbean; Wurdemann's; powder down and fringed claw; oldest 24 yr 6 mo (Texas); neck tucked in flight; Low Concern. No size or range text. |
| 63 | https://es.wikipedia.org/wiki/Ardea_herodias | Approximate: Spanish names garza morena, garza azul, garzón azulado, garzón cenizo, garza azulada, garza ceniza (no countries); 'su altura puede superar los 110 cm'; range incl. Central America (CR not named); LC 2019. |

### Irazú hummingbird (volcano hummingbird chosen; fiery-throated as related species)
| # | URL | Used for |
|---|-----|----------|
| 42 | https://en.wikipedia.org/wiki/Fiery-throated_hummingbird | Approximate: Cabanis & Heine 1860; 10.5–11 cm, 4.9–6.2 g; plumage (blue crown, fiery throat, violet-blue breast); nominate Cordillera de Tilarán to W Panama, eisenmanni Cordillera de Guanacaste; 1,600–2,000 m north, 2,200–3,200 m south, rarely below 1,400 m; montane/elfin forest, páramo edge; diet; aggressive and dominant; breeding Aug–Jan, two eggs; LC 2021, 50,000–500,000; Irazú, Poás, Cordillera Central NOT named. |
| 43 | https://en.wikipedia.org/wiki/Volcano_hummingbird | Approximate: Salvin 1865; 7.5–8 cm, 2.5/2.8 g; subspecies flammula (Irazú and Turrialba, mauve-purple gorget), torridus (Talamanca and Barú, purplish-grey), simoni (Poás and Barva, rose-red), sometimes morphs or species; 2,000–3,500 m, locally 1,800, seasonally 1,350; páramo, landslide/ashfall second growth, scrubby pastures, elfin-forest edges; diet incl. Diglossa-pierced flowers; dive display with tail-feather sound, calls; breeding Aug/Sep–Feb, nest 1–5 m, two eggs; post-breeding movements; LC, 20,000–50,000, benefits from open areas. |
| 50 | https://es.wikipedia.org/wiki/Selasphorus_flammula | Approximate: 'colibrí volcanero', 'estrella volcanera' (Panamá), 'chispita volcanera' (Costa Rica), 'colibrí volcán'; ~7.5 cm, 2.5/2.8 g; subspecies and volcanoes with gorget colours (flammula rosado-púrpura); 1,800–3,800 m, commonest ~2,400 m; páramo and open slopes; Salvia and Fuchsia nectar; nest 1–5 m, two eggs. |

### Monteverde hummingbird (purple-throated mountain-gem)
| # | URL | Used for |
|---|-----|----------|
| 45 | https://en.wikipedia.org/wiki/Purple-throated_mountaingem | Approximate: (Salvin, 1865), Trochilidae; lumping history, three subspecies (pectoralis SW Nicaragua–Cordillera de Guanacaste; calolaemus Cordillera Central and N Talamanca; homogenes W Panama and probably S Costa Rica; Tilarán/Monteverde not named); 10–11.5 cm, 4.5–6 g; plumage of both sexes; 1,200–2,500 m central CR, 800 m north, 300 m post-breeding; humid montane/cloud forest on steep slopes; nectar, primary pollinator of Psychotria elata and Palicourea lasiorrhachis, insects; territorial males, trap-lining females; breeding Oct–Apr, nest ~2 m, two eggs, 17–18 d, fledging 22–23 d; LC 2021, 50,000–500,000, decreasing, resilient. |
| 46 | https://es.wikipedia.org/wiki/Lampornis_calolaemus | Approximate: names 'colibrí montañés gorgimorado/gorguimorado', 'gema de garganta morada', 'colibrí gorjipúrpura'; discontinuous highland range with subspecies; 800–2,500 m (300 m post-breeding); steep humid montane forest; diet and pollination; nest 0.7–3.5 m, two eggs, incubation 15–19 d, fledging 20–26 d; no size, no Monteverde. |

### Fit checks for existing species
| # | URL | Used for |
|---|-----|----------|
| 54 | https://es.wikipedia.org/wiki/Ara_macao | Scarlet macaw: 'ahora casi no existe del lado del Caribe, y sus principales poblaciones persisten en los parques nacionales Corcovado y Carara … así como en el Área de conservación Guanacaste'; isolated groups Palo Verde and La Amistad; range 80 % → 20 % by 1993; release sites Isla Tiskita and Refugio Curú, ASOPROLAPA (1996), NATUWA (central Pacific since 1994); no Caribbean release site; Nicoya only as a link target. |
| 56 | https://neotropical.birds.cornell.edu/Species-Account/nb/species/clcrob/overview | Clay-colored thrush (Cornell Neotropical Birds): 'all manner of lightly wooded areas, often in close proximity to mankind'; range S Texas to NW Colombia; NO elevation range, no size, no Costa Rica note. |
| 58 | https://en.wikipedia.org/wiki/Clay-colored_thrush | Approximate: no elevation given; yards and gardens; range S Texas to N Colombia; 23–27 cm, 74–76 g; chosen as national symbol 1977; song, 'calls the rains'; nest and 2–4 eggs Mar–Jul; diet. |
| 61 | https://neotropical.birds.cornell.edu/Species-Account/nb/species/kebtou1/overview | Keel-billed toucan (Cornell Neotropical Birds): 'tropical lowland evergreen and secondary forests'; S Mexico through Central America to N Colombia and NW Venezuela; 'feeds largely on fruit, but also consumes arthropods and small vertebrates'; no elevation, no Costa Rica note. Used for the tortuguero and opening fits. |

(Fetch numbers 31, 59 and 60 are the failed/unusable fetches listed above; numbering follows the order in which the calls were made.)

## WebSearch calls (discovery only, not cited)
1. "Ley 7497 1995 venado cola blanca símbolo nacional fauna silvestre Costa Rica" → UNEP LEAP record (failed) and the FAOLEX PDF of the law (fetch 34).
2. "Odocoileus virginianus Guanacaste Santa Rosa bosque seco venado cola blanca acguanacaste" → ACG deer page (fetch 32) and the Revista de Biología Tropical DOAJ record (fetch 33).
3. "Monteverde hummingbird gallery species violet sabrewing purple-throated mountain-gem green-crowned brilliant list reserve" → eBird region list L2160384 (fetch 44); blogs and photo galleries ignored.
4. "ebird hotspot 'Volcán Irazú' Parque Nacional bird list" → two eBird region URLs that proved to be other hotspots (fetches 59–60); no Irazú list obtained.

## Not attempted (and why)
- iucnredlist.org and BirdLife DataZone: known to block or render empty; GBIF mirror used instead.
- Birds of the World / Cornell Neotropical Birds for the quetzal, heron and hummingbirds: earlier logs show Cornell refusing some species pages; the two Cornell Neotropical pages that were fetched (toucan, thrush) carried no elevation data, so the budget was spent on Wikipedia en/es and eBird instead.
- The Monteverde reserve's own website (elevation, hummingbird gallery species) and SINAC pages: sinac.go.cr blocks fetching (earlier logs); the reserve site did not surface in the one search made.
- Macaw Recovery Network / Caribbean scarlet-macaw release pages: not found within budget; the Tortuguero fit rests on Spanish Wikipedia's Caribbean statement and the park article naming only Ara ambiguus.
- zh.wikipedia.org for the Chinese names: skipped to limit the overrun; names recorded as uncertain.
- GBIF national occurrence totals for the six new species: skipped; presence rests on eBird, GBIF province/elevation counts and the cited articles.

## Gaps carried into `unverified` in species-walk.json
Chinese names; Costa Rican usage of the Spanish names; Monteverde reserve elevation and rainfall; Gaceta publication date of Ley 7497; deer subspecies and Costa Rican measurements; deer presence in Santa Rosa per park documentation; heron subspecies, Costa Rican elevation and comparison with other Tortuguero herons; an Irazú bird list; mountain-gem subspecies at Monteverde; plumage match of the second Monteverde bird; park-specific Morpho presence (and which Morpho species occur at Monteverde itself); the thrush's altitudinal ceiling; Caribbean scarlet-macaw releases; GBIF national totals; verbatim tapir assessor list.

## Habitat mismatches found
1. **Scarlet macaw at Tortuguero — does not fit today.** Spanish Wikipedia: the species 'ahora casi no existe del lado del Caribe'; the Tortuguero article names only the great green macaw (Ara ambiguus). The website should say so beside the drawing and name the great green macaw as the Caribbean lowland macaw.
2. **Great blue heron at Tortuguero — fits, but as a seasonal visitor.** GBIF month counts for Limón (3,745 records) peak October–March with only ~80–100 records per month May–September; and the park's waterways are canals, lagoons and Raphia palm swamps rather than mangrove, so a canal-bank or palm-root perch is more typical than mangrove roots.
3. **Clay-colored thrush at Irazú — plausible on the farmed slopes, unproven near the crater.** No fetched source gives its altitudinal ceiling; only 5 GBIF records with elevation 2,000–3,000 m exist for Costa Rica (1 in Cartago). Keep the bird on the cultivated middle slopes (~2,000–2,400 m).
4. **Blue morpho at Monteverde — fits at the altitude, but two Morpho species are present.** GBIF records at 1,300–1,700 m in Costa Rica are split between M. helenor (22, plus 2 as M. peleides) and M. theseus justitiae (13); the counts are national, not Monteverde-specific.
5. **Hummingbirds — the drawings are generic.** Irazú: purple-throated bird ≈ volcano hummingbird (Irazú race, mauve-purple gorget); green-and-blue bird ≈ fiery-throated hummingbird. Monteverde: purple-throated bird ≈ purple-throated mountain-gem; green-and-blue bird ≈ green-crowned brilliant or violet sabrewing (both on the eBird reserve list; plumage not researched). Both records are marked representative, not identifications.
