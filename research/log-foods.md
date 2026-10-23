# Fetch log — traditional dishes research for "Pura Vida: The Living Country"

Retrieval date: 2026-10-23. Tool: WebFetch (plus WebSearch for discovery only; search results were never used as sources). Output: `/home/claude/pura-vida/research/foods.json` (five dishes: gallo-pinto, casado, tamal, olla-de-carne, rice-and-beans).

Budget note: the brief allowed 30–45 fetches. 44 WebFetch calls were made: 38 returned usable content, 1 returned only a redirect (re-fetched at the redirect target), 5 failed. 26 WebSearch calls were used for discovery. Every successful fetch is listed below with how it was used.

## Blocked / failed fetches (5) and the redirect (1)

| # | URL | Result | Note |
|---|-----|--------|------|
| F1 | https://muse.jhu.edu/article/256967 | FAILED — Project MUSE "Verification required" challenge page | Intended for "Gallo Pinto: Tradition, Memory, and Identity in Costa Rican Foodways" (academic). Not used; the Vega Jiménez 2012 abstract (Kímuk) and the 2008 Herencia article cover the academic side. |
| F2 | https://crhoy.com/nacionales/rice-and-beans-coco-y-plátano-los-beneficios-nutricionales-de-la-comida-afrocostarricense/ | FAILED — client_error | CRHoy nutrition piece on Afro-Costa Rican food; replaced by La Teja (2026-09-08) and the CRHoy "Sabores de Limón" article, which fetched fine on the www host. |
| F3 | https://ticotimes.net/?p=113670 | FETCHED but UNUSABLE — garbled/binary content | Should have been "A lunchtime classic: the Costa Rican casado" (Tico Times, 2018, cited by Wikipedia). Not used. |
| F4 | https://sicultura.go.cr/ | FAILED — robots_disallowed | SICultura (MCJ cultural information system). Could not check an official registry of declarations. |
| F5 | https://mcj.go.cr/?s=cocina+tradicional | FAILED — robots_disallowed | MCJ site search for traditional-cuisine pages. Same consequence as F4. |
| R1 | https://revistas.ucr.ac.cr/index.php/herencia/article/viewFile/10051/9453 | 302 redirect only | Re-fetched at https://archivo.revistas.ucr.ac.cr/index.php/herencia/article/download/10051/9453/0 (fetch 11). |

Not attempted: pgrweb.go.cr (SCIJ / La Gaceta) — no candidate decree or law number for any dish ever surfaced, so there was nothing to look up; the brief's "try once" would have been a blind fetch.

## Successful fetches and their use (38)

### Costa Rican institutions (MCJ, Museo Nacional, UCR, UNA, ICT, INA)
| # | URL | Used for |
|---|-----|----------|
| 1 | https://www.dircultura.go.cr/sites/default/files/2025-10/Acuerdo%20Ejecutivo%20No.%20109-C%2C%20Ra%C3%ADces%20y%20Tradiciones%20Costarricenses.pdf | Acuerdo Ejecutivo 109-C (2025-07-02) declares the event "Raíces y Tradiciones de Guanacaste" of cultural interest; no food. Checked for the heritage question; recorded in `notes` only, not cited in any dish. |
| 2 | https://www.museocostarica.go.cr/wp-content/uploads/Publicaciones/antropologia/Recetario-Casa-del-Boyero.pdf | Museo Nacional 2022 San Carlos cookbook: pinto found "en todo el país", African and indigenous influences (p. 66); olla de carne "muy frecuente y cotidiano" (pp. 17, 38); tamal asado "platillo nacional" (p. 88). gallo-pinto, olla-de-carne, tamal. |
| 3 | https://piam.ucr.ac.cr/sites/default/files/documentos/Tradiciones%20culinarias%20navide%C3%B1as%20en%20Costa%20Rica.pdf | Sedó Masís (UCR Escuela de Nutrición, Nov 2020): tamalli etymology, pre-Hispanic origin, fillings, pork "insustituible", corn husk → plantain leaf, immersion in hot water, "piña: dos tamales amarrados", tamaleada roles, December dates, regional variants. Core tamal source. |
| 5 | https://kimuk.conare.ac.cr/Record/KUCR_42a101e6e2185bd697a93699cf2aabee?lng=es | Kímuk record + abstract of Vega Jiménez 2012 (DOI 10.2752/175174412X13233545145228): rice/bean history, Afro-Caribbean railroad workers, Great Depression. gallo-pinto history. |
| 7 | https://ict.go.cr/flipbook/guias/PDF/MINIGUIA%20DE%20LIMON.pdf | ICT mini-guide to Limón: rice and beans with coconut milk, thyme, onion, celery; served with fried fish or chicken in sauce; Antillean origins of the population. rice-and-beans. |
| 11 | https://archivo.revistas.ucr.ac.cr/index.php/herencia/article/download/10051/9453/0 | Revista Herencia 21(1): 69–80, 2008 (Miguel Rojas; title not returned by the fetch): gallo pinto origins c. 1870–1875, base ingredients, Lizano from 1920, name, "plato democrático", "patrimonio intangible" (academic framing). gallo-pinto. |
| 18 | https://revistas.una.ac.cr/index.php/nuevohumanismo/article/download/13902/19408/53629 | Hutchinson Miller, Revista Nuevo Humanismo 8(1) 2020 (UNA): rice and beans every Sunday after church, still the Sunday dish; identity; Jamaica's national dish is ackee and saltfish; railway migration under Tomás Guardia. rice-and-beans. |
| 25 | https://www.patrimonio.go.cr/ | Centro de Patrimonio Cultural home page: PCI section and declaration forms, no cuisine pages. Heritage (all dishes). |
| 26 | https://kimuk.conare.ac.cr/Record/PUCR_c1d488574e157e83933b80ac4c298042 | Kímuk record + abstract of "The tamale and the 'tamalera' tradition in Costa Rica" (Revista Herencia, UCR, 2021): 50 interviews 2014–2019, threats to the tradition. tamal. |
| 34 | https://piam.ucr.ac.cr/sites/default/files/documentos/Comidas%20tradicionales%2C%20picadillos.pdf | Sedó Masís (UCR, Nov 2016) on picadillos: casado composition "arroz, frijoles, ensalada, carne o huevo y picadillo". casado. |
| 40 | https://www.inavirtual.ed.cr/mod/resource/view.php?id=1004538 | MCJ/CICPC book "Cocinas del Bicentenario de Costa Rica del Siglo XX al Siglo XXI" (Paola Salazar Arce, 2020) hosted by INA Virtual; only pp. 1–34 legible; no entry for gallo pinto, casado or olla de carne in that excerpt. Heritage note (MCJ promotion of traditional cuisine). |
| 41 | https://archivo.revistas.ucr.ac.cr/index.php/herencia/article/download/24736/24952/0 | Sedó Masís, "Un acercamiento a la esencia de la cocina patrimonial de Costa Rica", Revista Herencia 28(2) 2015: gallo pinto as everyday food; tamales and olla de carne "sale sumamente caro"; cuisine as PCI in the UNESCO 2003 sense, no official declaration. gallo-pinto, tamal, olla-de-carne. |

### Established press (La Nación, Teletica, CRHoy, Delfino, La Teja, Tico Times)
| # | URL | Used for |
|---|-----|----------|
| 4 | https://www.nacion.com/revista-dominical/pozol-almuercitos-picadillo-rondon-200-anos-de/7U6FZ342BJFUJNIUVDUZDJYK3A/story/ | La Nación 2021-04-10: MCJ's PCI unit produced "Cocinas del Bicentenario"; typical-dish list incl. olla de carne and tamal de cerdo; olla de carne leftovers in almuercitos. olla-de-carne. |
| 8 | https://www.nacion.com/viva/el-casado-asi-crecimos-en-esta-tierra/N2T7CWKLMNF6JPQ47RFFI7RPGI/story/ | La Nación 2012-09-14: casado components, 1960s consolidation, two name stories (Marjorie Ross), Sedó quotes; gallo pinto as traditional breakfast. casado, gallo-pinto. |
| 14 | https://delfino.cr/2021/11/plato-principal-tamal-con-sabor-a-tradicion | Delfino 2021-11-24 (opinion): "unas cien preparaciones", tamaleada, seasonal income, plantain leaf tied with thread. tamal. |
| 15 | https://www.nacion.com/el-pais/patrimonio/la-navidad-tambien-trae-bocados-de-historia/JLLF2GWDF5CFJBE6RX4N2LTOGE/story/ | La Nación 2015-12-24: pork, rice, garbanzos came with the Spanish; Aztec and Chorotega tamales; experts Sedó, Ross, González. tamal history. |
| 17 | https://www.teletica.com/cultura/el-rabo-se-cocina-aparte-el-truco-detras-del-rice-and-beans-mas-buscado-de-limon_416409 | Teletica 2026-08-31: ingredient list, cooking order, oxtail cooked separately, ~1.5 h. rice-and-beans. |
| 19 | https://www.teletica.com/nacional/guapiles-se-prepara-para-cocinar-la-olla-de-carne-mas-grande-de-costa-rica_315304 | Teletica 2022-07-11: Guápiles giant olla de carne (El Gusto Rural fair, ~1,000 people, malanga/ñame/yuca), "platillo típico", no record body. olla-de-carne. |
| 20 | https://delfino.cr/asamblea/proyecto/22662 | Asamblea expediente 22662 = Grand Gala Parade declaration (2021–2022); confirms the file that surfaced in "olla de carne + patrimonio" searches is unrelated to food. olla-de-carne heritage. |
| 21 | https://www.nacion.com/viva/el-patrimonio-que-costa-rica-mantiene-vivo-esta-es/GWIFFDUMQNHA5AHKQJFK27WTL4/story/ | La Nación 2026-09-15: the eleven national PCI declarations with years/instruments; none is a dish. Heritage (all dishes). |
| 27 | https://www.nacion.com/ciencia/patrimonio/gastronomia-navidena-tica-que-ha-cambiado-y-que/ENGIPINIHFCYJKC4GC2KJCS7AI/story/ | La Nación 2021-12-08: tamal ingredients and variants, Hispanic contribution of pork/lard, tamaleada quotes from CICPC archaeologist Paola Salazar and Dayana Morales, Sedó. tamal. |
| 29 | https://www.teletica.com/calle-7/cuanto-saben-los-costarricenses-sobre-su-propia-gastronomia_382599 | Teletica 2025-04-11: casado "época colonial"/1960s (via RecetasCostaRica.com); olla de carne Cartago/adafina (via Ticopedia); rice and beans from Caribe Sur. casado, olla-de-carne, rice-and-beans (claims flagged as folklore/unverified). |
| 30 | https://www.lateja.cr/nacional/rice-and-beans-rondon-y-coco-la-cocina/DXCTPSQMWJCXHDE4BYY2BKWUHY/story/ | La Teja 2026-09-08: rice and beans as Limón identity, thyme/chile panameño, nutritionist José Coto Fonseca. rice-and-beans. |
| 31 | https://delfino.cr/2022/09/celebremos-la-independencia-preservando-nuestras-tradiciones-alimentarias | Delfino 2022-09-13 (opinion, nutritionist Nancy Solano): regional tamales; olla de carne under the Central Valley. tamal, olla-de-carne. |
| 33 | https://ticotimes.net/?p=14763 | Tico Times 2004-03-05 "Tico Omelette Sets Record": Costa Rica "ultimately lost out to Nicaragua" in the 2003 largest-gallo-pinto competition. gallo-pinto. |
| 35 | https://www.delfino.cr/2026/06/ministerio-de-cultura-abre-inscripciones-para-certamen-de-cocina-tradicional-dedicado-a-region-huetar-norte | Delfino 2026-06-19: Certamen Nacional de Cocina Tradicional (XVIII edition, since 2001, MCJ Dirección de Patrimonio Cultural); no declaration. Heritage note. |
| 36 | https://delfino.cr/2024/12/sabores-navidenos-el-cerdo-como-protagonista-de-las-tradiciones-costarricenses | Delfino 2024-12-21: tamales "el platillo más representativo de las fiestas"; CAPORC on pork demand in Nov–Dec. tamal. |
| 38 | https://www.teletica.com/recetas/prepare-un-delicioso-rice-and-beans-con-esta-receta_366162 | Teletica 2024-08-30: Lidia Palmer Lewis recipe (red beans, coconut milk, chile panameño, thyme, bay leaf), method, "platillo de domingo", diaspora context. rice-and-beans. |
| 39 | https://www.crhoy.com/nacionales/sabores-de-limon-buscan-recuperar-su-lugar-en-los-menus/ | CRHoy 2026-08-31: rice and beans most recognised Limón dish, best-seller in the GAM with chicken, oxtail in Limón, "bochinche casado" with spaghetti. rice-and-beans, casado. |

### Wikipedia (approximate tier)
| # | URL | Used for |
|---|-----|----------|
| 10 | https://en.wikipedia.org/wiki/Cultural_Properties_of_Costa_Rica | Intangible items listed; no food. Heritage. |
| 12 | https://en.wikipedia.org/wiki/Gallo_pinto | Versions, breakfast, origin dispute, San Sebastián story, "Gallo Pinto War", 2003 cook-offs. gallo-pinto. |
| 13 | https://es.wikipedia.org/wiki/Gallo_pinto | Central Valley/Guanacaste/Limón versions, Lizano as identity, name origin unclear, 1870s Antillean workers. gallo-pinto, rice-and-beans. |
| 22 | https://en.wikipedia.org/wiki/Casado | Components, two name theories, cited books. casado. |
| 23 | https://en.wikipedia.org/wiki/Rice_and_peas | Jamaican rice and peas ingredients, Sunday dinner, link to Limón. rice-and-beans, gallo-pinto. |
| 24 | https://en.wikipedia.org/wiki/Costa_Rican_cuisine | Olla de carne (Spanish influence), casado, gallo pinto, tamales ("steamed"), Caribbean rice and beans, Salsa Lizano 1920. All dishes. |
| 28 | https://es.wikipedia.org/wiki/Olla_de_carne | Cuts, vegetables, method, "a los tres vuelcos", weekends, olla podrida/Quijote, "poderida". olla-de-carne. |
| 37 | https://es.wikipedia.org/wiki/Gastronom%C3%ADa_de_Costa_Rica | Olla de carne (lunch; colonial last meal of the day), casado, gallo pinto breakfast, tamal additions, rice and beans "frijoles rojos, leche de coco y chile panameño". All dishes. |
| 42 | https://en.wikipedia.org/wiki/Olla_podrida | Spanish stew definition, Scappi 1570, "poderida". olla-de-carne history. |

Fetch numbers 6, 9, 16, 32, 43 and 44 are the failures and redirect listed in the first table.

## WebSearch calls (discovery only, not cited) — 26
1. MCJ declaratoria PCI cocina tradicional olla de carne gallo pinto tamal → dircultura Acuerdo 109-C, Museo Nacional recetario, Delfino certamen, La Nación 200 años.
2. sicultura.go.cr gallo pinto → Kímuk Vega Jiménez record, Observador (not fetched).
3. patrimonio.go.cr tamal navideño → UCR PIAM Sedó PDF, La Nación 2015 and tamal articles, Delfino 2021.
4. olla de carne declarada patrimonio decreto → Teletica Guápiles, Wikipedia Cultural Properties, Delfino 22662.
5. "gallo pinto" "patrimonio cultural" declaratoria → Revista Herencia 10051, Project MUSE (blocked).
6. gallo pinto origen disputa Nicaragua Guinness → en.wikipedia Gallo pinto.
7. casado origen del nombre → en.wikipedia Casado, La Nación casado, Teletica 2025.
8. rice and beans Limón leche de coco chile panameño → ICT miniguía, Teletica rabo, La Teja, CRHoy, UNA article.
9. olla de carne historia yuca ñampí tiquisque → en.wikipedia Costa Rican cuisine (rest were blogs).
10. patrimonio.go.cr PCI declaratorias lista → La Nación patrimonio vivo 2026, Delfino 22662/23231.
11. "olla de carne" patrimonio Asamblea proyecto de ley → Delfino 22662 again (Grand Gala Parade).
12. Sedó "El tamal y la tradición tamalera" → Kímuk/UCR records (article 47415), La Nación 2021.
13. "olla de carne" historia cocido español → en.wikipedia Olla podrida; Teletica 2025.
14. "Cocinas del Bicentenario" MCJ pdf → INA Virtual resource.
15. sicultura.go.cr olla de carne / tamal / rice and beans → Delfino 2022 Solano (no sicultura pages surfaced).
16. "olla de carne" Sedó UCR domingo → UCR PIAM picadillos PDF, Delfino 2024 cerdo.
17. Tico Times "A lunchtime classic: the Costa Rican casado" → ticotimes.net/?p=113670 (unusable).
18. gallo pinto más grande récord Guinness → ticotimes.net/?p=14763.
19. "olla de carne" nacion.com domingo tradición → nothing new (brand content, blogs).
20. "rice and beans" "frijoles rojos" "chile panameño" "pollo caribeño" → Teletica 2024 recipe, CRHoy Sabores de Limón.
21. "olla de carne" "los domingos" tradición → blogs only, none fetched.
22. mcj.go.cr cocina tradicional "patrimonio alimentario" → Revista Herencia 24736 (Sedó 2015), Delfino 2026-10 recetas navideñas (not fetched).
23. "olla de carne" costarricense domingo press → nothing new.
24. "olla de carne" origen cocido olla podrida → en.wikipedia Olla podrida (fetched), fundssociety (not Costa Rican, skipped).
25. "olla de carne" "tres vuelcos" → blogs only.
26. "Revista Herencia" Vol. 28 2015 81-92 → identified the Sedó 2015 article title before fetching.

## Decisions and gaps carried into `unverified` in foods.json
- Heritage: `declared: false` for all five dishes, status `approximate`, because the negative finding rests on La Nación's 2026 list, Wikipedia's list, the patrimonio.go.cr home page and press coverage of MCJ programmes; SICultura and the MCJ site blocked fetching, so no official registry was read.
- Gallo pinto origin and the Nicaragua–Costa Rica dispute are recorded as a dispute with each source's version; nothing is settled.
- The casado name stories are `folklore`; the "colonial" origin claim (Teletica via a recipe site) is flagged.
- Tamal: UCR describes immersion in hot water for modern tamales (the brief's "boiled, not steamed"); English Wikipedia says "steamed"; both are recorded.
- Olla de carne is the weakest dish for Costa Rican primary sources: its ingredient list, method and weekend pattern rest on Spanish Wikipedia (approximate), supported by Teletica 2022, the Museo Nacional cookbook, Sedó 2015 and La Nación 2021 for its traditional status.
- Rice and beans: bean type (red vs pigeon peas) and the "pollo caribeño" pairing are flagged; the Jamaican rice-and-peas link is Wikipedia-only, while the UNA article confirms the Sunday-after-church tradition.
- Chinese names are transliterations/descriptive and marked provisional in `notes`.
