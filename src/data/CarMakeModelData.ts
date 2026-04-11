export type CarBrand =
  | 'Kia' | 'Ford' | 'Fiat' | 'Chevrolet' | 'Citroen' | 'Peugeot'
  | 'Porsche' | 'Toyota' | 'Hyundai' | 'Honda' | 'Mercedes-Benz'
  | 'Mitsubishi' | 'Mazda' | 'Audi' | 'УАЗ' | 'Volvo' | 'Infiniti'
  | 'Nissan' | 'BMW' | 'Lexus' | 'Land Rover' | 'Lifan' | 'DATSUN'
  | 'Jeep' | 'Renault' | 'Lada' | 'Skoda' | 'Suzuki' | 'Subaru'
  | 'SsangYong' | 'Opel'

export interface CarData {
  models: readonly string[]  // readonly для неизменяемости
}

// export type CarBrandType = keyof typeof dataCars
// export type CarModelType<T extends CarBrandType> = typeof dataCars[T]['models'][number]

export const dataCars = {
  Kia: {
    models: [
      "Ceed", "Cerato", "Clarus", "K3", "K5", "K7", "K8", "K9", "Cadenza", "Carnival", "Carens", "Carstar",
      "Elan", "Forte", "K900", "Mohave", "Niro", "Opirus", "Optima", "Picanto", "Pegas", "Potentia", "Pride",
      "ProCee’d", "Quoris", "Ray", "Rio", "Seltos", "Sepia", "Sephia", "Shuma", "Sorento", "Soul", "Spectra",
      "Sportage", "Stinger", "Stonic", "Venga", "XCeed"
    ]
  },

  Ford: {
    models: [
      "EcoSport", "Edge", "Endura", "Equator", "Everest", "Excursion", "Expedition", "Explorer", "F-150", "F-250",
      "F-350", "F-450", "F-550", "F-650", "F-750", "Fairlane", "Falcon", "Fiesta", "Flex", "Focus", "Fusion", "Galaxy",
      "GT", "Ka", "Kuga", "Maverick", "Mercury", "Mondeo", "Mustang", "Mustang Mach-E", "Orion", "Probe", "Puma", "Ranger",
      "S-Max", "Scorpio", "Sierra", "Taunus", "Taurus", "Tempo", "Territory", "Thunderbird", "Tourneo Connect", "Tourneo Courier",
      "Tourneo Custom", "Transit", "Transit Connect", "Transit Courier", "Transit Custom"
    ]
  },

  Fiat: {
    models: [
      "124 Spider", "500", "500L", "500X", "600", "850", "1100", "1200", "1300", "1400", "1500", "2300", "Albea", "Argenta", "Barchetta",
      "Brava", "Bravo", "Cinquecento", "Coupe", "Croma", "Dino", "Doblo", "Ducato", "Fiorino", "Freemont", "Fullback", "Grande Punto",
      "Idea", "Linea", "Marea", "Marengo", "Multipla", "Palio", "Panda", "Punto", "Qubo", "Regata", "Ritmo", "Scudo", "Sedici", "Seicento",
      "Siena", "Stilo", "Strada", "Tempra", "Tipo", "Toro", "Ulysse", "Uno", "X1/9"
    ]
  },

  Chevrolet: {
    models: [
      "Avalanche", "Aveo", "Blazer", "Camaro", "Captiva", "Celta", "Chevelle", "Chevy Van", "Cobalt", "Colorado", "Commodore",
      "Corsa", "Corvette", "Cruze", "Damas", "Equinox", "Express", "Groove", "HHR", "Impala", "Kalos", "Lacetti", "Lanos", "Luv",
      "Malibu", "Matiz", "Monte Carlo", "Monza", "Nexia", "Niva", "Onix", "Optra", "Orlando", "Prisma", "Rezzo", "Sail", "Silverado",
      "Sonic", "Spark", "Spin", "SS", "Suburban", "Tacuma", " Tahoe", "TrailBlazer", "Traverse", "Trax", "Uplander", "Vectra", "Viva",
      "Volt", "Zafira"
    ]
  },

  Citroen: {
    models: [
      "2CV", "Berlingo", "BX", "C-Elysee", "C-Zero", "C1", "C2", "C3", "C3 Aircross", "C3 Picasso", "C4", "C4 Cactus", "C4 Picasso",
      "C4 SpaceTourer", "C5", "C5 Aircross", "C6", "C8", "CX", "DS", "DS3", "DS4", "DS5", "Dyane", "E-Mehari", "Evasion", "Grand C4 Picasso",
      "GS", "Jumpy", "Nemo", "Saxo", "SM", "SpaceTourer", "Spacetourer", "Visa", "XM", "Xsara", "Xsara Picasso", "ZX"
    ]
  },

  Peugeot: {
    models: [
      "1007", "104", "106", "107", "108", "2008", "201", "202", "203", "204", "205", "206", "207", "208", "3008", "301", "304", "305", "306",
      "307", "308", "309", "4007", "4008", "405", "406", "407", "408", "5008", "504", "505", "508", "601", "604", "605", "607", "806", "807",
      "Bipper", "Boxer", "Expert", "Ion", "Partner", "RCZ", "Rifter", "Traveller"
    ]
  },

  Porsche: {
    models: [
      "356", "356 A", "356 B", "356 C", "356 Speedster", "356 Pre-A", "550 Spyder", "718 Boxster", "718 Cayman", "904 Carrera GTS", "906",
      "908", "910", "911", "911 (930)", "911 (964)", "911 (993)", "911 (996)", "911 (997)", "911 (991)", "911 (992)", "912", "914",
      "918 Spyder", "924", "928", "944", "959", "962", "968", "Carrera GT", "Cayenne", "Cayman", "Macan", "Panamera", "Taycan"
    ]
  },

  Toyota: {
    models: [
      "4Runner", "Alphard", "Aristo", "Aurion", "Avalon", "Avensis", "Avensis Verso", "Aygo", "Belta", "Blizzard", "Caldina", "Cami", "Camry",
      "Carina", "Celica", "Celsior", "Century", "Chaser", "Coaster", "Corolla", "Corona", "Cressida", "Cresta", "Crown", "Crown Majesta",
      "Curren", "Cynos", "Duet", "Echo", "Estima", "FJ Cruiser", "Fortuner", "FunCargo", "GR Supra", "GR Yaris", "Grand HiAce", "Granvia",
      "GT86", "Harrier", "HiAce", "Highlander", "Hilux", "Hilux Surf", "Innovation", "IQ", "ISis", "Ist", "Land Cruiser", "Land Cruiser Prado",
      "LiteAce", "Mark II", "Mark X", "Matrix", "Mega Cruiser", "Mirai", "MR2", "MR-S", "Nadia", "Noah", "Paseo", "Passo", "Picnic", "Prado",
      "Premio", "Prius", "Prius C", "Prius Plug-in", "Prius Prime", "Prius V", "ProAce", "Probox", "Progres", "Ractis", "Raum", "Rav4", "Regius",
      "Rush", "Scepter", "Sequoia", "Sera", "Sienna", "Sienta", "Soarer", "Sparky", "Sports 800", "Sprinter", "Starlet", "Succeed", "Supra", "Tacoma",
      "Tercel", "TownAce", "Tundra", "Urban Cruiser", "Vellfire", "Venza", "Verossa", "Verso", "Verso S", "Vios", "Vista", "Vitz", "Voltz", "Voxy",
      "WiLL", "Windom", "Wish", "Yaris", "Yaris Cross"
    ]
  },

  Hyundai: {
    models: [
      "Accent", "Atos", "Azera", "Bayon", "Centennial", "Click", "Coupe", "Creta", "Elantra", "Equus", "Excel", "Galloper", "Genesis", "Getz",
      "Grand Santa Fe", "Grand Starex", "Grandeur", "H-1", "H100", "H200", "HB20", "i10", "i20", "i30", "i40", "i800", "IONIQ", "IONIQ 5",
      "IONIQ 6", "IONIQ 9", "Kona", "Lantra", "Matrix", "Maxcruz", "Palisade", "Pony", "Santa Fe", "Santamo", "Scoupe", "Solaris", "Sonata",
      "Starex", "Staria", "Terracan", "Tiburon", "Trajet", "Tucson", "Veloster", "Venue", "Veracruz", "Verna", "XG"
    ]
  },

  Honda: {
    models: [
      "Accord", "Acty", "Airwave", "Amaze", "Ascot", "Beat", "Brio", "Capa", "City", "Civic", "Civic Ferio", "Civic Shuttle", "Concerto",
      "Cr-Z", "Crosstour", "CR-V", "CR-X", "CR-Z", "Domani", "E", "Edix", "Element", "Elevate", "FCX Clarity", "Fit", "Fit Aria", "Fit Shuttle",
      "FR-V", "Freed", "Grace", "HR-V", "Insight", "Inspire", "Integra", "Jazz", "Lagreat", "Lego", "Life", "Logo", "Mobilio", "Mobilio Spike",
      "N-Box", "N-One", "N-Van", "N-Wgn", "N360", "NSX", "Odyssey", "Orthia", "Partner", "Passport", "Pilot", "Prelude", "Quint", "Rafaga",
      "Ridgeline", "S-MX", "S2000", "Saber", "Shuttle", "Stepwagon", "Stream", "Street", "Torneo", "That's", "Vamos", "Vezel", "Vigor", "Z",
      "ZR-V", "Zest"
    ]
  },

  'Mercedes-Benz': {
    models: [
      "190 (W201)", "200-300 (W123)", "A-Class (W168)", "A-Class (W169)", "A-Class (W176)", "A-Class (W177)", "AMG GT", "AMG GT 4-Door",
      "B-Class (W245)", "B-Class (W246)", "B-Class (W247)", "C-Class (W202)", "C-Class (W203)", "C-Class (W204)", "C-Class (W205)",
      "C-Class (W206)", "CL-Class (C215)", "CL-Class (C216)", "CLA (C117)", "CLA (C118)", "CLC (CL203)", "CLK (C208)", "CLK (C209)",
      "CLS (C219)", "CLS (C218)", "CLS (C257)", "E-Class (W124)", "E-Class (W210)", "E-Class (W211)", "E-Class (W212)", "E-Class (W213)",
      "E-Class (W214)", "EQA", "EQB", "EQC", "EQE", "EQE SUV", "EQS", "EQS SUV", "EQV", "G-Class (W460)", "G-Class (W461)", "G-Class (W463)",
      "G-Class (W464)", "GL-Class (X164)", "GL-Class (X166)", "GLA (H247)", "GLB (X247)", "GLC (X253)", "GLC (X254)", "GLE (W166)", "GLE (V167)",
      "GLK (X204)", "GLS (X166)", "GLS (X167)", "M-Class (W163)", "M-Class (W164)", "M-Class (W166)", "Maybach", "Metris", "R-Class (W251)",
      "S-Class (W116)", "S-Class (W126)", "S-Class (W140)", "S-Class (W220)", "S-Class (W221)", "S-Class (W222)", "S-Class (W223)", "SLA (R172)",
      "SLC (R172)", "SLK (R170)", "SLK (R171)", "SLK (R172)", "SLS AMG", "Sprinter", "T-Class", "V-Class", "Vaneo", "Viano", "Vito", "X-Class"
    ]
  },

  Mitsubishi: {
    models: [
      "3000GT", "ASX", "Attrage", "Carisma", "Colt", "Cordia", "Delica", "Diamante", "Dignity", "Eclipse", "Eclipse Cross", "eK", "Endeavor",
      "Forte", "Freeca", "FTO", "Galant", "Galloper", "Grandis", "GTO", "i-MiEV", "Jeep J", "L200", "L300", "L400", "Lancer", "Lancer Cargo",
      "Lancer Evolution", "Lancer Ralliart", "Legnum", "Libero", "Mighty Max", "Minica", "Mirage", "Montero", "Montero Sport", "Outlander",
      "Pajero", "Pajero iO", "Pajero Junior", "Pajero Mini", "Pajero Pinin", "Pajero Sport", "Précis", "Proudia", "RVR", "Sapporo", "Sigma",
      "Space Gear", "Space Runner", "Space Star", "Space Wagon", "Starion", "Strada", "Super 4x4", "Town Box", "Tredia", "Triton", "Xpander"
    ]
  },

  Mazda: {
    models: [
      "2", "3", "5", "6", "121", "323", "626", "929", "AZ-1", "AZ-3", "AZ-Wagon", "B-Series", "Biante", "Bongo", "BT-50", "Carol", "Cosmo",
      "CX-3", "CX-30", "CX-5", "CX-50", "CX-60", "CX-70", "CX-80", "CX-90", "Demio", "E-Series", "Etude", "Familia", "Flair", "Flair Crossover",
      "Flair Wagon", "Lantis", "Laputa", "Luce", "Millenia", "MPV", "MX-3", "MX-5", "MX-6", "MX-30", "Navajo", "Persona", "Premacy", "Proceed",
      "Protege", "R360", "R100", "R130", "Revue", "Roadster", "RX-7", "RX-8", "Scrum", "Sentia", "Spiano", "Tribute", "Verisa", "Xedos 6", "Xedos 9"
    ]
  },

  Audi: {
    models: [
      "A1", "A2", "A3", "A4", "A4 Allroad", "A5", "A5 Sportback", "A6", "A6 Allroad", "A7", "A7 Sportback", "A8", "A8L", "e-tron", "e-tron GT",
      "e-tron Sportback", "Q2", "Q2L", "Q3", "Q3 Sportback", "Q4 e-tron", "Q4 Sportback e-tron", "Q5", "Q5 Sportback", "Q6", "Q6 e-tron", "Q7",
      "Q8", "Q8 e-tron", "Q8 Sportback e-tron", "R8", "RS Q3", "RS Q8", "RS e-tron GT", "RS3", "RS4", "RS5", "RS6", "RS7", "S1", "S3", "S4",
      "S5", "S6", "S7", "S8", "SQ2", "SQ5", "SQ6 e-tron", "SQ7", "SQ8", "TT", "TT RS", "TTS", "V8"
    ]
  },

  УАЗ: {
    models: [
      "3151", "3153", "3159", "3160", "3162", "Атаман", "Буханка (3303)", "Карго", "Патриот", "Пикап", "Профи", "Симбир", "Хантер", "Циклон"
    ]
  },

  Volvo: {
    models: [
      "120 Series (Amazon)", "140 Series", "164", "240 Series", "260 Series", "340 Series", "360 Series", "440 Series", "460 Series", "480 Series",
      "740 Series", "760 Series", "780 Series", "850 Series", "940 Series", "960 Series", "C30", "C70", "EX30", "EX90", "P1800", "S40", "S60",
      "S70", "S80", "S90", "V40", "V50", "V60", "V70", "V90", "XC40", "XC60", "XC70", "XC90"
    ]
  },

  Infiniti: {
    models: [
      "EX", "FX", "G", "G Sedan", "G Coupe", "G Convertible", "I", "J30", "JX", "M", "Q30", "Q40", "Q45", "Q50", "Q60", "Q70", "Q70L", "QX",
      "QX30", "QX50", "QX55", "QX56", "QX60", "QX70", "QX80", "QX4", "QX4"
    ]
  },

  Nissan: {
    models: [
      "100NX", "200SX", "240SX", "280ZX", "300ZX", "350Z", "350Z Roadster", "370Z", "370Z Nismo", "AD", "Almera", "Almera Classic", "Almera Tino",
      "Altima", "Armada", "Avenir", "Bassara", "Bluebird", "Bluebird Sylphy", "Caravan", "Cefiro", "Cherry", "Cima", "Civilian", "Clube", "Cube",
      "Datsun", "Dualis", "Elgrand", "Envoy", "Evalia", "Expert", "Fairlady Z", "Figaro", "Fuga", "Gloria", "GT-R", "Homy", "Hypermini", "Juke",
      "Juke Nismo", "Kicks", "Lafesta", "Langley", "Largo", "Latio", "Laurel", "Leaf", "Leopard", "Liberta Villa", "Liberty", "Livina", "Lucino",
      "March", "Maxima", "Micra", "Mistral", "Moco", "Murano", "Navara", "Note", "NP300", "NPT", "NX", "Otti", "Pao", "Pathfinder", "Patrol",
      "Pino", "Pixo", "Prairie", "Presage", "President", "Primastar", "Primera", "Pulsar", "Pulsar GTI-R", "Qashqai", "Qashqai+2", "Qazana",
      "Quest", "Rasheen", "Rogue", "Rogue Sport", "S-Cargo", "S15", "Sakura", "Santana", "Sentra", "Serena", "Silvia", "Skyline", "Skyline Crossover",
      "Skyline GT-R", "Stagea", "Stanza", "Sunny", "Sylphy", "Teana", "Terrano", "Tiida", "Tino", "Titan", "Townstar", "Urvan", "Vanette", "Versa",
      "Wingroad", "X-Trail", "Xterra"
    ]
  },

  BMW: {
    models: [
      "1 Series (E81/E82/E87/E88)", "1 Series (F20/F21)", "1 Series (F40)", "2 Series (F22/F23)", "2 Series (F44)", "2 Series (F45/F46)",
      "2 Series (G42)", "2 Series (G43)", "3 Series (E21)", "3 Series (E30)", "3 Series (E36)", "3 Series (E46)", "3 Series (E90/E91/E92/E93)",
      "3 Series (F30/F31/F34)", "3 Series (G20/G21)", "4 Series (F32/F33/F36)", "4 Series (G22/G23/G26)", "5 Series (E12)", "5 Series (E28)",
      "5 Series (E34)", "5 Series (E39)", "5 Series (E60/E61)", "5 Series (F07)", "5 Series (F10/F11)", "5 Series (G30/G31)", "5 Series (G60/G61)",
      "6 Series (E24)", "6 Series (E63/E64)", "6 Series (F06/F12/F13)", "6 Series (G32)", "7 Series (E23)", "7 Series (E32)", "7 Series (E38)",
      "7 Series (E65/E66/E68)", "7 Series (F01/F02)", "7 Series (F03)", "7 Series (G11/G12)", "7 Series (G70)", "8 Series (E31)",
      "8 Series (G14/G15/G16)", "i3", "i4", "i5", "i7", "i8", "iX", "iX1", "iX2", "iX3", "M1", "M2 (F87)", "M2 (G87)", "M3 (E30)", "M3 (E36)",
      "M3 (E46)", "M3 (E90/E92/E93)", "M3 (F80)", "M3 (G80)", "M4 (F82/F83)", "M4 (G82/G83)", "M5 (E28)", "M5 (E34)", "M5 (E39)", "M5 (E60/E61)",
      "M5 (F10)", "M5 (F90)", "M5 (G90)", "M6 (E24)", "M6 (E63/E64)", "M6 (F06/F12/F13)", "M8 (F91/F92/F93)", "X1 (E84)", "X1 (F48)", "X1 (U11)",
      "X2 (F39)", "X2 (U10)", "X3 (E83)", "X3 (F25)", "X3 (G01)", "X3 (G45)", "X4 (F26)", "X4 (G02)", "X5 (E53)", "X5 (E70)", "X5 (F15)", "X5 (G05)",
      "X6 (E71/E72)", "X6 (F16)", "X6 (G06)", "X7 (G07)", "XM (G09)", "Z1", "Z3 (E36/7)", "Z4 (E85/E86)", "Z4 (E89)", "Z4 (G29)", "Z8 (E52)"
    ]
  },

  Lexus: {
    models: [
      "CT", "ES", "GS", "GS F", "GX", "HS", "IS", "IS F", "LC", "LFA", "LM", "LS", "LX", "NX", "RC", "RC F", "RX", "RZ", "TX", "UX"
    ]
  },

  'Land Rover': {
    models: [
      "101 FC", "Defender (90)", "Defender (110)", "Defender (130)", "Discovery (L316)", "Discovery (L319)", "Discovery (L462)",
      "Discovery Sport (L550)", "Freelander (L314)", "Freelander 2 (L359)", "LR2", "LR3", "LR4", "Range Rover (Classic)", "Range Rover (L322)",
      "Range Rover (L405)", "Range Rover (L460)", "Range Rover Evoque (L538)", "Range Rover Evoque (L551)", "Range Rover Sport (L320)",
      "Range Rover Sport (L494)", "Range Rover Sport (L461)", "Range Rover Velar (L560)", "Series I", "Series II", "Series IIA", "Series III"
    ]
  },

  Lifan: {
    models: [
      "Breez", "Cebrium", "Celliya", "Cio", "Murman", "Myway", "Smily", "Solano", "X60", "X70"
    ]
  },

  DATSUN: {
    models: [
      "GO", "GO+", "mi-DO", "on-DO", "redi-GO"
    ]
  },

  Jeep: {
    models: [
      "Avenger", "Cherokee", "Chief", "CJ", "Comanche", "Commander", "Compass", "DJ", "FJ", "Gladiator", "Grand Cherokee", "Grand Wagoneer",
      "J10", "J20", "Liberty", "Patriot", "Renegade", "Scrambler", "Wagoneer", "Willys", "Willys Knight", "Willys-Overland", "Wrangler"
    ]
  },

  Renault: {
    models: [
      "Alaskan", "Arkana", "Austral", "Captur", "Caravelle", "Clio", "Dokker", "Duster", "Espace", "Express", "Fluence", "Grand Scenic",
      "Kadjar", "Kangoo", "Kaptur", "Koleos", "Laguna", "Latitude", "Lodgy", "Logan", "Master", "Megane", "Modus", "Rodeo", "Safrane",
      "Sandero", "Sandero Stepway", "Scenic", "Talisman", "Tondar", "Trafic", "Triber", "Twingo", "Twizy", "Vel Satis", "Wind", "Zoe"
    ]
  },

  Lada: {
    models: [
      "2101", "2102", "2103", "2104", "2105", "2106", "2107", "2108", "2109", "21099", "2110", "2111", "2112", "2113", "2114", "2115",
      "2120", "2121 (Нива)", "21213", "21214", "21218", "2123", "2129", "2131", "2170 (Priora)", "2190 (Granta)", "2191 (Granta)",
      "2192 (Kalina)", "2194 (Kalina)", "2328", "2329", "2344", "2345", "Ваз 1111 (Ока)", "Веста", "Веста Cross", "Веста SW",
      "Веста SW Cross", "Гранта", "Гранта Cross", "Гранта Флэш", "Икс-рей", "Калина", "Калина Кросс", "Калина Универсал", "Ларгус",
      "Ларгус Кросс", "Ларгус Фургон", "Нива", "Нива Бронто", "Нива Тревел", "Ока", "Приора", "Приора Купе", "Приора Лифтбек",
      "Приора Седан", "Приора Универсал", "Самара", "Спутник"
    ]
  },

  Skoda: {
    models: [
      "Citigo", "Enyaq", "Enyaq Coupe", "Fabia", "Favorit", "Felicia", "Forman", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Praktik",
      "Rapid", "Roomster", "Scala", "Superb", "Yeti"
    ]
  },

  Suzuki: {
    models: [
      "Alto", "Baleno", "Carry", "Celerio", "Cultus", "Equator", "Ertiga", "Every", "Grand Vitara", "Hustler", "Ignis", "Jimny", "Jimny Sierra",
      "Kizashi", "Landy", "Lapin", "Liana", "MR Wagon", "Palette", "Reno", "Samurai", "Sidekick", "Solio", "Spacia", "Splash", "Swift",
      "SX4", "SX4 S-Cross", "Twin", "Vitara", "Wagon R", "X-90", "XL6", "XL7"
    ]
  },

  Subaru: {
    models: [
      "Alcyone", "Ascent", "Baja", "Bighorn", "Brat", "BRZ", "Crosstrek", "Dex", "Dias Wagon", "Exiga", "Forester", "Impreza", "Justy", "Legacy",
      "Leone", "Levorg", "Libero", "Lucra", "Outback", "Pleo", "R1", "R2", "Sambar", "Solterra", "Stella", "SVX", "Traviq", "Trezia", "Tribeca",
      "Vivio", "WRX"
    ]
  },

  SsangYong: {
    models: [
      "Actyon", "Chairman", "Kairan", "Korando", "Korando Sports", "Kyron", "Musso", "Nomad", "Rexton", "Rodius", "Stavic", "Tivoli", "XLV"
    ]
  },

  Opel: {
    models: [
      "Adam", "Admiral", "Agila", "Ampera", "Antara", "Arena", "Ascona", "Astra", "Calibra", "Campo", "Cascada", "Cavalier", "Combo", "Commodore",
      "Corsa", "Crossland", "Diplomat", "Frontera", "Grandland", "GT", "Insignia", "Kadett", "Karl", "Manta", "Meriva", "Mokka", "Monterey",
      "Monza", "Movano", "Omega", "P4", "Rekord", "Senator", "Signum", "Simca", "Speedster", "Tigra", "Vectra", "Vita", "Vivaro", "Zafira"
    ]
  }
} satisfies Record<CarBrand, CarData>

export const dataCarsKeys = Object.keys(dataCars)
