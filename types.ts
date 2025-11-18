
export enum GameStage {
  LANDING = 'LANDING',
  LOBBY = 'LOBBY',
  REVEAL = 'REVEAL',
  GAME_LOOP = 'GAME_LOOP',
  VOTING = 'VOTING',
  RESULTS = 'RESULTS'
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  voteTargetId: string | null; // ID of player they voted for
  score: number;
}

export interface RoomState {
  code: string;
  stage: GameStage;
  players: Player[];
  roundsTotal: number;
  currentRound: number;
  turnCount: number; // Total turns taken in the game so far
  category: string;
  secretWord: string;
  imposterId: string; // The ID of the imposter
  currentTurnPlayerId: string; // ID of player whose turn it is
  turnDeadline: number; // Timestamp (ms) when turn ends
  winner: 'CREW' | 'IMPOSTER' | null;
}

export const INITIAL_ROOM_STATE: RoomState = {
  code: '',
  stage: GameStage.LANDING,
  players: [],
  roundsTotal: 1,
  currentRound: 1,
  turnCount: 0,
  category: '',
  secretWord: '',
  imposterId: '',
  currentTurnPlayerId: '',
  turnDeadline: 0,
  winner: null,
};

export const WORD_PACKS: Record<string, string[]> = {
  'Dyr': [
    'Løve', 'Pingvin', 'Giraf', 'Elefant', 'Haj', 'Ørn', 'Delfin', 'Panda', 
    'Kænguru', 'Blæksprutte', 'Ulv', 'Bjørn', 'Slange', 'Frø', 'Sommerfugl', 'Flagermus', 
    'Kamel', 'Zebra', 'Næsehorn', 'Gorilla', 'Koala', 'Tiger', 'Krokodille', 'Ugle',
    'Ræv', 'Kanin', 'Hjort', 'Gepard', 'Flodhest', 'Sæl', 'Hval', 'Påfugl',
    'Næbdyr', 'Odder', 'Bæver', 'Vaskebjørn', 'Stinkdyr', 'Pindsvin', 'Bæltedyr', 
    'Dovendyr', 'Myresluger', 'Surikat', 'Lemur', 'Elg', 'Bison', 'Hyæne'
  ],
  'Mad': [
    'Pizza', 'Sushi', 'Burger', 'Tacos', 'Salat', 'Pandekager', 'Spaghetti', 
    'Bøf', 'Sandwich', 'Suppe', 'Karry', 'Brød', 'Pomfritter', 'Hotdog', 
    'Lasagne', 'Burrito', 'Omelet', 'Ramen', 'Stegt Kylling', 'Kebab', 'Paella',
    'Dumplings', 'Nudler', 'Kødboller', 'Bacon', 'Pølse', 'Toast', 'Morgenmad',
    'Popcorn', 'Kringle', 'Yoghurt', 'Ost', 'Smør', 'Honning', 'Marmelade', 
    'Peanutbutter', 'Havregryn', 'Mysli', 'Hummus', 'Falafel', 'Nachos'
  ],
  'Frugt': [
    'Æble', 'Banan', 'Appelsin', 'Vindrue', 'Jordbær', 'Ananas', 'Vandmelon', 
    'Mango', 'Fersken', 'Kirsebær', 'Citron', 'Kokosnød', 'Pære', 'Kiwi', 'Blomme',
    'Blåbær', 'Hindbær', 'Avocado', 'Lime', 'Papaya', 'Figen', 'Granatæble',
    'Abrikos', 'Grapefrugt', 'Melon', 'Brombær', 'Tranebær', 'Daddel', 'Guava', 
    'Litchi', 'Passionsfrugt', 'Dragefrugt', 'Mandarin'
  ],
  'Grøntsager': [
    'Gulerod', 'Broccoli', 'Kartoffel', 'Tomat', 'Løg', 'Hvidløg', 'Spinat', 'Majs',
    'Peberfrugt', 'Agurk', 'Græskar', 'Svamp', 'Salat', 'Ærter', 'Aubergine',
    'Kål', 'Blomkål', 'Squash', 'Radise', 'Rødbede', 'Selleri', 'Asparges',
    'Porre', 'Artiskok', 'Ingefær', 'Søde Kartofler', 'Chili', 'Bønner', 'Grønkål',
    'Okra', 'Roer', 'Yams', 'Rosenkål', 'Pastinak'
  ],
  'Dessert': [
    'Kage', 'Småkage', 'Is', 'Donut', 'Chokolade', 'Tærte', 'Brownie', 'Budding', 
    'Cupcake', 'Muffin', 'Vaffel', 'Pandekage', 'Slik', 'Slikkepind', 'Cheesecake',
    'Gelato', 'Croissant', 'Makron', 'Tiramisu', 'Eclair', 'Fudge', 'Skumfidus',
    'Churros', 'Baklava', 'Mousse', 'Lagkage', 'Sorbet', 'Scones'
  ],
  'Drikkevarer': [
    'Kaffe', 'Te', 'Vand', 'Juice', 'Sodavand', 'Mælk', 'Øl', 'Vin', 
    'Limonade', 'Smoothie', 'Milkshake', 'Varm Kakao', 'Cocktail', 'Whisky', 
    'Champagne', 'Vodka', 'Cider', 'Energidrik', 'Iste', 'Kokosvand',
    'Matcha', 'Espresso', 'Latte', 'Cappuccino', 'Mokka', 'Martini', 'Margarita'
  ],
  'Steder': [
    'Skole', 'Hospital', 'Strand', 'Rumstation', 'Bibliotek', 'Fitnesscenter', 'Biograf', 'Lufthavn', 
    'Zoo', 'Museum', 'Park', 'Hotel', 'Gård', 'Restaurant', 'Bank', 'Stadion', 
    'Kasino', 'Fængsel', 'Supermarked', 'Kirke', 'Cirkus', 'Bowlinghal', 'Bar', 'Fabrik',
    'Universitet', 'Brandstation', 'Posthus', 'Indkøbscenter', 'Slot', 'Akvarium',
    'Bageri', 'Apotek', 'Frisør', 'Legeplads', 'Busstation', 'Togstation', 
    'Tankstation', 'Politistation', 'Spa', 'Havn', 'Fyrtårn'
  ],
  'Job': [
    'Læge', 'Lærer', 'Astronaut', 'Kok', 'Brandmand', 'Kunstner', 'Programmør', 
    'Politibetjent', 'Tandlæge', 'Landmand', 'Pilot', 'Advokat', 'Tømrer', 'Videnskabsmand', 
    'Skuespiller', 'Klovn', 'Soldat', 'Detektiv', 'VVS\'er', 'Tryllekunstner', 'Dyrlæge', 'Arkitekt', 'Spion',
    'Sygeplejerske', 'Dommer', 'Mekaniker', 'Forfatter', 'Sanger', 'Tjener', 'Frisør',
    'Elektriker', 'Fotograf', 'Journalist', 'Bibliotekar', 'Slagter', 'Bager'
  ],
  'Husholdning': [
    'Stol', 'Bærbar', 'Paraply', 'Tandbørste', 'Krus', 'Nøgler', 'Guitar', 'Pude', 
    'Spejl', 'Ur', 'Saks', 'Lampe', 'Toilet', 'Køleskab', 'Mikroovn', 'Sofa', 
    'Håndklæde', 'Sæbe', 'Kost', 'Fjernbetjening', 'Seng', 'Brødrister', 'Støvsuger', 'Stearinlys',
    'Vaskemaskine', 'Elkedel', 'Ventilator', 'Strygejern', 'Svamp', 'Spand', 'Stige',
    'Gardiner', 'Gulvtæppe', 'Vase', 'Plante', 'Ramme', 'Kurv', 'Bøjle'
  ],
  'Skole': [
    'Kuglepen', 'Blyant', 'Viskelæder', 'Lineal', 'Notesbog', 'Rygsæk', 'Tavle', 
    'Lommeregner', 'Saks', 'Lim', 'Hæftemaskine', 'Skrivebord', 'Lærer', 'Elev', 
    'Eksamen', 'Lektier', 'Lærebog', 'Globus', 'Computer', 'Madkasse', 'Frikvarter',
    'Whiteboard', 'Tus', 'Kridt', 'Projektor', 'Skab', 'Eksamensbevis'
  ],
  'Transport': [
    'Bil', 'Fly', 'Tog', 'Båd', 'Cykel', 'Helikopter', 'Bus', 'Motorcykel', 
    'Ubåd', 'Skateboard', 'Traktor', 'Lastbil', 'Taxa', 'Raket', 'Luftballon', 
    'Løbehjul', 'Yacht', 'Ambulance', 'Brandbil', 'Metro', 'Færge', 'Jeep', 'Varevogn',
    'Segway', 'Sporvogn', 'Gondol', 'Slæde', 'Hestevogn', 'Kampvogn', 'Rickshaw'
  ],
  'Sport': [
    'Fodbold', 'Basketball', 'Tennis', 'Svømning', 'Golf', 'Baseball', 'Boksning', 
    'Volleyball', 'Skiløb', 'Surfing', 'Yoga', 'Cykling', 'Løb', 'Rugby', 
    'Hockey', 'Cricket', 'Badminton', 'Skøjteløb', 'Brydning', 'Gymnastik',
    'Bueskydning', 'Bowling', 'Karate', 'Snowboarding', 'Bordtennis', 'Klatring',
    'Fægtning', 'Udspring', 'Roning', 'Sejlsport', 'Maraton', 'Triatlon'
  ],
  'Karakterer': [
    'Batman', 'Harry Potter', 'Spider-Man', 'Mickey Mouse', 'James Bond', 'Darth Vader', 
    'Superman', 'Mario', 'Pikachu', 'Sherlock Holmes', 'Elsa', 'Shrek', 'SpongeBob', 
    'Barbie', 'Joker', 'Wonder Woman', 'Iron Man', 'Yoda', 'Hulk', 'Sonic',
    'Tarzan', 'Askepot', 'Goku', 'Thor', 'Captain America', 'Dracula',
    'Frankenstein', 'Gandalf', 'Frodo', 'Voldemort', 'Simba', 'Aladdin', 'Mulan'
  ],
  'Lande': [
    'USA', 'Japan', 'Frankrig', 'Brasilien', 'Italien', 'Kina', 'Australien', 'Egypten', 
    'Indien', 'Canada', 'Mexico', 'Tyskland', 'Rusland', 'Storbritannien', 'Spanien', 'Argentina', 
    'Grækenland', 'Thailand', 'Tyrkiet', 'Sydkorea', 'Vietnam', 'Sverige', 'Norge',
    'Irland', 'Polen', 'Portugal', 'Schweiz', 'Holland', 'New Zealand',
    'Danmark', 'Finland', 'Belgien', 'Østrig', 'Peru', 'Chile', 'Colombia', 'Marokko'
  ],
  'Byer': [
    'New York', 'London', 'Paris', 'Tokyo', 'Dubai', 'Rom', 'Sydney', 'Berlin', 
    'Moskva', 'Beijing', 'Kairo', 'Rio de Janeiro', 'Toronto', 'Los Angeles', 
    'Mumbai', 'Shanghai', 'Istanbul', 'Bangkok', 'Amsterdam', 'Barcelona', 
    'Venedig', 'Las Vegas', 'San Francisco', 'Chicago', 'Hong Kong', 'Singapore', 
    'København', 'Aarhus'
  ],
  'Tøj': [
    'T-shirt', 'Jeans', 'Kjole', 'Jakke', 'Hat', 'Strømper', 'Sko', 'Tørklæde', 
    'Handsker', 'Jakkesæt', 'Pyjamas', 'Badetøj', 'Bælte', 'Slips', 'Solbriller', 
    'Nederdel', 'Frakke', 'Støvler', 'Hættetrøje', 'Ur', 'Shorts', 'Sweater', 'Kasket',
    'Vest', 'Sandaler', 'Højhælede', 'Undertøj', 'Regnjakke', 'Uniform',
    'Sneakers', 'Hjemmesko', 'Klipklappere', 'Hue', 'Øreringe', 'Halskæde'
  ],
  'Natur': [
    'Træ', 'Blomst', 'Sol', 'Måne', 'Regn', 'Sne', 'Bjerg', 'Flod', 
    'Hav', 'Sky', 'Vulkan', 'Ørken', 'Skov', 'Regnbue', 'Ild', 
    'Hule', 'Vandfald', 'Lyn', 'Stjerne', 'Ø', 'Sø', 'Jungle',
    'Dal', 'Kløft', 'Gletsjer', 'Strand', 'Klippe', 'Sump', 'Koralrev',
    'Eng', 'Dam', 'Bæk', 'Bakke', 'Sten', 'Sand', 'Græs'
  ],
  'Vejr': [
    'Regn', 'Sol', 'Sne', 'Sky', 'Vind', 'Storm', 'Torden', 'Lyn', 
    'Tåge', 'Regnbue', 'Tornado', 'Orkan', 'Hagl', 'Frost', 'Varme',
    'Fugtighed', 'Snestorm', 'Tørke', 'Brise', 'Dis', 'Monsun',
    'Tyfon', 'Cyklon', 'Slud', 'Dug', 'Temperatur', 'Vejrudsigt'
  ],
  'Rummet': [
    'Solen', 'Månen', 'Jorden', 'Mars', 'Stjerne', 'Planet', 'Galakse', 'Universet', 
    'Astronaut', 'Raket', 'Satellit', 'Komet', 'Asteroide', 'Sort Hul', 
    'Alien', 'Rumstation', 'Meteor', 'Teleskop', 'Solformørkelse', 'Stjernebillede',
    'Jupiter', 'Saturn', 'Venus', 'Merkur', 'Neptun', 'Uranus', 'Pluto', 'Mælkevejen',
    'Supernova', 'Tåge', 'Kredsløb', 'Tyngdekraft'
  ],
  'Hobbyer': [
    'Læsning', 'Maling', 'Gaming', 'Fiskeri', 'Havearbejde', 'Madlavning', 'Dans', 
    'Sang', 'Fotografering', 'Vandring', 'Strikning', 'Skak', 'Camping', 'Tegning', 
    'Skrivning', 'Origami', 'Meditation', 'Samleobjekter', 'Magi', 'Programmering',
    'Syning', 'Keramik', 'Surfing', 'Skatere', 'Rejser', 'Skuespil',
    'Bagning', 'Yoga', 'Fuglekiggeri', 'Scrapbog', 'Kalligrafi'
  ],
  'Instrumenter': [
    'Klaver', 'Violin', 'Trommer', 'Fløjte', 'Trompet', 'Saxofon', 'Harpe', 'Cello', 
    'Harmonika', 'Klarinet', 'Banjo', 'Mundharmonika', 'Xylofon', 'Elguitar', 
    'Trekant', 'Ukulele', 'Synthesizer', 'Bongo', 'Sækkepibe', 'Orgel',
    'Tuba', 'Trækbasun', 'Obo', 'Gong', 'Maracas', 'Tamburin', 'Bækkener'
  ],
  'Teknologi': [
    'Smartphone', 'Robot', 'Fjernsyn', 'Kamera', 'Drone', 'Tablet', 'Høretelefoner', 
    'Smartwatch', 'Konsol', 'VR-headset', 'Printer', 'Satellit', 'Tastatur', 
    'Mus', 'Batteri', 'Oplader', 'Router', 'Mikrofon', 'Projektor', 'Server',
    'Bærbar', 'Skærm', 'Højttaler', 'Kabel', 'USB', 'Wifi', 'Antenne',
    'Harddisk', 'Scanner', 'Webcam', 'GPS', 'Bluetooth', 'App', 'Hjemmeside'
  ],
  'Våben': [
    'Sværd', 'Bue', 'Skjold', 'Pistol', 'Kniv', 'Bombe', 'Spyd', 'Økse', 'Kanon',
    'Kampvogn', 'Missil', 'Laser', 'Dolk', 'Pisk', 'Hammer', 'Granat', 'Riffel',
    'Snigskytte', 'Revolver', 'Haglgevær', 'Katana', 'Atombombe', 'Armbrøst', 'Kølle', 'Slynge',
    'Torpedo', 'Landmine', 'Bazooka', 'Flammekaster', 'Strømpistol'
  ],
  'Fantasy': [
    'Drage', 'Enhjørning', 'Troldmand', 'Heks', 'Spøgelse', 'Vampyr', 'Zombie', 
    'Havfrue', 'Fe', 'Monster', 'Kæmpe', 'Elver', 'Nisse', 'Varulv', 
    'Føniks', 'Trold', 'Ogre', 'Drik', 'Besværgelse', 'Tryllestav', 'Slot', 'Konge',
    'Dværg', 'Ork', 'Kentaur', 'Grif', 'Hydra', 'Pegasus', 'Kraken'
  ],
  'Legetøj': [
    'Dukke', 'Bold', 'Drage', 'Yoyo', 'Puslespil', 'Lego', 'Bamse', 'Ballon', 
    'Actionfigur', 'Robot', 'Bil', 'Tog', 'Klodser', 'Frisbee', 'Skateboard',
    'Slim', 'Terninger', 'Kort', 'Glaskugler', 'Modellervoks', 'Rubiks Cube',
    'Slinky', 'Vandpistol', 'Hulahopring', 'Sjippetov', 'Snurretop', 'Domino'
  ],
  'Insekter': [
    'Myre', 'Bi', 'Sommerfugl', 'Edderkop', 'Flue', 'Myg', 'Bille', 
    'Græshoppe', 'Guldsmed', 'Mariehøne', 'Orm', 'Snegl', 'Larve', 
    'Møl', 'Hveps', 'Kakerlak', 'Fårekylling', 'Skorpion', 'Tusindben', 'Loppe',
    'Termit', 'Knæler', 'Gedehams', 'Dræbersnegl', 'Flåt', 'Lus'
  ],
  'Farver': [
    'Rød', 'Blå', 'Grøn', 'Gul', 'Orange', 'Lilla', 'Pink', 'Sort', 
    'Hvid', 'Brun', 'Grå', 'Guld', 'Sølv', 'Violet', 'Indigo', 'Turkis',
    'Bordeaux', 'Beige', 'Cyan', 'Magenta', 'Marineblå', 'Petrol', 'Lime', 'Oliven', 'Koral'
  ],
  'Former': [
    'Cirkel', 'Kvadrat', 'Trekant', 'Rektangel', 'Stjerne', 'Hjerte', 'Oval', 
    'Diamant', 'Sekskant', 'Terning', 'Kugle', 'Pyramide', 'Kegle', 'Cylinder', 
    'Linje', 'Femkant', 'Ottekant', 'Spiral', 'Kors', 'Pil', 'Halvmåne'
  ],
  'Følelser': [
    'Glad', 'Ked af det', 'Vred', 'Bange', 'Spændt', 'Kedsomhed', 'Træt', 'Overrasket', 
    'Nervøs', 'Forvirret', 'Stolt', 'Genert', 'Jaloux', 'Elsket', 'Skyldig',
    'Ensom', 'Chokeret', 'Irriteret', 'Rolig', 'Modig', 'Væmmet', 'Håbefuld'
  ],
  'Mærker': [
    'Nike', 'Adidas', 'Apple', 'Samsung', 'McDonalds', 'Coca-Cola', 'Pepsi', 
    'Google', 'Amazon', 'Disney', 'Netflix', 'Microsoft', 'Tesla', 'Facebook', 
    'Starbucks', 'IKEA', 'Sony', 'Toyota', 'Honda', 'Lego', 'Nintendo', 'Gucci',
    'Rolex', 'BMW', 'Mercedes', 'Ferrari', 'Ford', 'Burger King', 'KFC'
  ],
  'Spil': [
    'Skak', 'Matador', 'Poker', 'Scrabble', 'Uno', 'Dam', 'Domino', 
    'Banko', 'Jenga', 'Tetris', 'Minecraft', 'Fortnite', 'Mario', 'Zelda', 
    'Pac-Man', 'Kabale', 'Sudoku', 'Krydsord', 'Gemmeleg', 'Tagfat',
    'Risk', 'Cluedo', 'Sænke Slagskibe', 'Twister', 'Operation', 'Catan'
  ],
  'Havet': [
    'Hav', 'Sø', 'Bølge', 'Strand', 'Sand', 'Muslingeskal', 'Koral', 'Fisk', 
    'Haj', 'Hval', 'Delfin', 'Krabbe', 'Vandmand', 'Søstjerne', 'Blæksprutte', 
    'Tang', 'Båd', 'Skib', 'Ubåd', 'Ø', 'Måge', 'Hummer',
    'Søhest', 'Rokke', 'Ål', 'Musling', 'Østers', 'Perle', 'Tsunami'
  ],
  'Bygninger': [
    'Hus', 'Lejlighed', 'Slot', 'Palads', 'Skyskraber', 'Tårn', 'Bro', 
    'Skole', 'Hospital', 'Butik', 'Bibliotek', 'Museum', 'Stadion', 'Hotel', 
    'Kirke', 'Moské', 'Tempel', 'Hytte', 'Telt', 'Iglo', 'Lade', 'Fyrtårn',
    'Fabrik', 'Pakhus', 'Garage', 'Skur', 'Bungalow', 'Palæ'
  ],
  'Blomster': [
    'Rose', 'Tulipan', 'Tusindfryd', 'Solsikke', 'Lilje', 'Orkidé', 'Lotus', 'Kaktus', 
    'Viol', 'Lavendel', 'Jasmin', 'Valmue', 'Kirsebærblomst', 'Mælkebøtte', 
    'Hibiscus', 'Morgenfrue', 'Påskelilje', 'Iris', 'Pæon', 'Nellike', 'Krysantemum'
  ],
  'Værktøj': [
    'Hammer', 'Skruetrækker', 'Svensknøgle', 'Sav', 'Boremaskine', 'Tang', 'Målebånd', 
    'Stige', 'Pensel', 'Skovl', 'Økse', 'Søm', 'Skrue', 'Bolt', 'Møtrik',
    'Rive', 'Hakke', 'Mejsel', 'Vaterpas', 'Lommelygte', 'Trillebør',
    'Motorsav', 'Slibemaskine', 'Murske', 'Spade', 'Koben'
  ],
  'Kropsdele': [
    'Øje', 'Øre', 'Næse', 'Mund', 'Hånd', 'Fod', 'Ben', 'Arm', 'Hjerte', 
    'Hjerne', 'Mave', 'Finger', 'Tå', 'Knæ', 'Albue', 'Skulder', 
    'Tænder', 'Tunge', 'Hår', 'Knogle', 'Hals', 'Ryg', 'Hud', 'Muskel',
    'Tommelfinger', 'Håndled', 'Ankel', 'Hæl', 'Hage', 'Kind', 'Pande', 'Læbe'
  ],
  'Film': [
    'Titanic', 'Avatar', 'Star Wars', 'Jurassic Park', 'Frost', 'Shrek', 'Toy Story', 
    'Løvernes Konge', 'Harry Potter', 'The Matrix', 'Avengers', 'Joker', 'Inception', 
    'Dødens Gab', 'Alene Hjemme', 'Find Nemo', 'Aladdin', 'Spiderman', 'Batman',
    'Forrest Gump', 'The Godfather', 'Rocky', 'Terminator', 'Tilbage til Fremtiden'
  ],
  'Musik': [
    'Pop', 'Rock', 'Jazz', 'Hip Hop', 'Klassisk', 'Rap', 'Country', 'Metal', 
    'Blues', 'Reggae', 'Disco', 'Techno', 'K-Pop', 'Opera', 'Folk', 'Punk',
    'Elektronisk', 'Soul', 'R&B', 'Gospel', 'Funk', 'Ska', 'House', 'Dubstep'
  ],
  'Højtider': [
    'Jul', 'Halloween', 'Påske', 'Thanksgiving', 'Valentinsdag', 'Nytår', 
    'Fødselsdag', 'Eid', 'Diwali', 'Hanukkah', 'Aprilsnar', 'Mors Dag',
    'Fars Dag', 'Uafhængighedsdag', 'Ramadan', 'Kinesisk Nytår', 'Sankt Patrick\'s Dag',
    'Grundlovsdag', 'Fastelavn'
  ],
  'Køkken': [
    'Gaffel', 'Ske', 'Kniv', 'Pande', 'Gryde', 'Skål', 'Tallerken', 'Kop', 'Glas', 
    'Blender', 'Røremaskine', 'Ovn', 'Komfur', 'Køleskab', 'Vask', 'Serviet', 'Forklæde', 
    'Piskeris', 'Rivejern', 'Skræller', 'Opvaskemaskine', 'Brødrister', 'Elkedel', 'Paletkniv', 'Øse'
  ],
  'Badeværelse': [
    'Sæbe', 'Shampoo', 'Håndklæde', 'Tandbørste', 'Tandpasta', 'Spejl', 'Bruser', 
    'Badekar', 'Toilet', 'Vask', 'Skraber', 'Kam', 'Børste', 'Papirlommetørklæder', 'Tandtråd',
    'Svamp', 'Creme', 'Deodorant', 'Badekåbe', 'Svupper', 'Bademåtte'
  ],
  'Camping': [
    'Telt', 'Sovepose', 'Bål', 'Skumfidus', 'Lommelygte', 'Kompas', 'Kort', 
    'Rygsæk', 'Kniv', 'Reb', 'Feltflaske', 'Støvler', 'Myggespray', 'Køletaske', 'Lanterne',
    'Bålsted', 'Skov', 'Stjerner', 'Vandring', 'Sti', 'Bjørn', 'Myg'
  ],
  'Pirater': [
    'Skib', 'Skat', 'Kort', 'Papegøje', 'Sværd', 'Øjklap', 'Krog', 'Kranie', 
    'Flag', 'Kaptajn', 'Ø', 'Guld', 'Mønt', 'Kanon', 'Rom', 'Sejl',
    'Anker', 'Kompas', 'Kikkert', 'Træben', 'Bandana', 'Spøgelse', 'Kraken'
  ],
  'Familie': [
    'Mor', 'Far', 'Bror', 'Søster', 'Baby', 'Bedstemor', 'Bedstefar', 
    'Onkel', 'Tante', 'Fætter/Kusine', 'Tvilling', 'Søn', 'Datter', 'Nevø', 'Niece', 
    'Mand', 'Kone', 'Forælder', 'Barn', 'Tumling', 'Teenager', 'Voksen'
  ],
  'Tid': [
    'Sekund', 'Minut', 'Time', 'Dag', 'Uge', 'Måned', 'År', 'Årti', 'Århundrede', 
    'Morgen', 'Middag', 'Eftermiddag', 'Aften', 'Nat', 'Midnat', 'Daggry', 'Skumring',
    'Ur', 'Armbåndsur', 'Kalender', 'Fremtid', 'Fortid', 'Nutid', 'Øjeblik'
  ],
  'Videnskab': [
    'Atom', 'Molekyle', 'Celle', 'Gen', 'DNA', 'Tyngdekraft', 'Magnet', 'Energi', 
    'Lys', 'Lyd', 'Varme', 'Kraft', 'Masse', 'Hastighed', 'Laboratorium', 'Mikroskop', 
    'Teleskop', 'Eksperiment', 'Kemikalie', 'Bægerglas', 'Videnskabsmand', 'Fysik', 'Biologi'
  ],
  'Kunst': [
    'Maling', 'Pensel', 'Lærred', 'Blyant', 'Skitse', 'Farve', 'Ler', 'Skulptur', 
    'Portræt', 'Landskab', 'Galleri', 'Museum', 'Udstilling', 'Mosaik', 'Origami',
    'Staffeli', 'Palet', 'Blæk', 'Farvekridt', 'Tus', 'Kul', 'Mesterværk'
  ],
  'Smykker': [
    'Ring', 'Halskæde', 'Ørering', 'Armbånd', 'Ur', 'Diamant', 'Guld', 'Sølv', 
    'Perle', 'Rubin', 'Smaragd', 'Krone', 'Tiara', 'Broche', 'Kæde',
    'Ædelsten', 'Safir', 'Krystal', 'Vedhæng', 'Medaljon', 'Ankelkæde'
  ],
  'Fugle': [
    'Ørn', 'Ugle', 'Papegøje', 'Pingvin', 'Flamingo', 'Svane', 'And', 'Kylling', 
    'Hane', 'Kalkun', 'Påfugl', 'Due', 'Krage', 'Spurv', 'Struds', 'Høg',
    'Falk', 'Måge', 'Pelikan', 'Kolibri', 'Spætte', 'Tukan', 'Grib'
  ],
  'Gård': [
    'Ko', 'Gris', 'Hest', 'Får', 'Ged', 'Kylling', 'And', 'Landmand', 'Lade', 
    'Traktor', 'Hø', 'Mark', 'Majs', 'Hvede', 'Mælk', 'Æg', 'Hegn',
    'Tyr', 'Æsel', 'Muldyr', 'Plov', 'Fugleskræmsel', 'Silo', 'Høst'
  ],
  'Middelalder': [
    'Konge', 'Dronning', 'Prins', 'Prinsesse', 'Ridder', 'Slot', 'Sværd', 'Skjold', 
    'Rustning', 'Drage', 'Hest', 'Dyst', 'Fangekælder', 'Trone', 'Krone',
    'Bueskytte', 'Bue', 'Pil', 'Voldgrav', 'Vindebro', 'Tårn', 'Bonde'
  ],
  'Superhelte': [
    'Batman', 'Superman', 'Spiderman', 'Wonder Woman', 'Iron Man', 'Hulk', 'Thor', 
    'Captain America', 'Flash', 'Wolverine', 'Joker', 'Thanos', 'Deadpool',
    'Black Panther', 'Aquaman', 'Doctor Strange', 'Black Widow', 'Hawkeye'
  ],
  'Slik': [
    'Chokolade', 'Vingummi', 'Slikkepind', 'Tyggegummi', 'Skumfidus', 'Lakrids', 
    'Jelly Bean', 'Karameller', 'Fudge', 'Pebermynte', 'Karamel', 'Nougat', 'Toffee',
    'Skittles', 'M&Ms', 'Snickers', 'KitKat', 'Twix', 'Oreo'
  ],
  'Kontor': [
    'Skrivebord', 'Stol', 'Computer', 'Printer', 'Hæftemaskine', 'Papir', 'Kuglepen', 'Blyant',
    'Telefon', 'Møde', 'Chef', 'Kollega', 'Kaffe', 'Tastatur', 'Mus',
    'Mappe', 'Fil', 'Clips', 'Tape', 'Saks', 'Note', 'Email'
  ]
};