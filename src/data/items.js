// Каталог предметов.
// Ярус 1 — предметы с картинкой (пока эмодзи). id предмета = слово.
// Ярус 2 — карточки-слова (id 'card:СЛОВО'), ярус 3 — эссенции (id 'ess:СЛОВО'), см. words.js.

import { CARD_WORDS, ESSENCE_WORDS } from './words.js';
import { normWord } from './letters.js';
import { dictCat } from './dict.js';

// place: куда можно поставить в квартире (floor — на пол/поверхность, wall — на стену)
// use: что можно сделать (eat — съесть, wear — надеть, boost — бустер в мини-играх, collect — коллекция)
export const CATEGORIES = {
  furniture:  { name: 'Мебель',        icon: '🛋️', place: 'floor' },
  light:      { name: 'Свет',          icon: '💡', place: 'floor' },
  walldecor:  { name: 'На стену',      icon: '🖼️', place: 'wall' },
  decor:      { name: 'Декор',         icon: '🏺', place: 'floor' },
  plants:     { name: 'Растения',      icon: '🪴', place: 'floor' },
  tech:       { name: 'Техника',       icon: '📺', place: 'floor' },
  dishes:     { name: 'Посуда',        icon: '🍽️', place: 'floor' },
  music:      { name: 'Музыка',        icon: '🎸', place: 'floor' },
  pets:       { name: 'Питомцы',       icon: '🐈', place: 'floor' },
  bath:       { name: 'Ванная',        icon: '🛁', place: 'floor' },
  food:       { name: 'Еда',           icon: '🍎', use: 'eat' },
  drinks:     { name: 'Напитки',       icon: '☕', use: 'eat' },
  clothes:    { name: 'Одежда',        icon: '👗', use: 'wear' },
  accessory:  { name: 'Аксессуары',    icon: '👜', use: 'wear' },
  tools:      { name: 'Инструменты',   icon: '🔨', use: 'boost' },
  stationery: { name: 'Канцелярия',    icon: '✏️', use: 'collect' },
  nature:     { name: 'Природа',       icon: '🌙', use: 'collect' },
  transport:  { name: 'Транспорт',     icon: '🚲', use: 'collect' },
  sport:      { name: 'Спорт',         icon: '⚽', use: 'collect' },
  fantasy:    { name: 'Сказка',        icon: '🦄', use: 'collect' },
  animals:    { name: 'Животные',      icon: '🐾', use: 'collect' },
  city:       { name: 'Город',         icon: '🏙️', use: 'collect' },
  holiday:    { name: 'Праздник',      icon: '🎉', use: 'collect' },
  toys:       { name: 'Игрушки',       icon: '🧸', use: 'collect' },
  // Только для ярусов 2–3
  misc:       { name: 'Разное',        icon: '📦', use: 'collect' },
  essence:    { name: 'Эссенции',      icon: '✨', use: 'burn' },
};

export const RARITY = {
  c: { name: 'Обычный', color: '#7bc96f', burn: 1 },
  r: { name: 'Редкий',  color: '#4aa8ff', burn: 3 },
  e: { name: 'Эпик',    color: '#b46bff', burn: 6 },
  l: { name: 'Легенда', color: '#ffb000', burn: 12 },
};
export const RARITY_ORDER = ['c', 'r', 'e', 'l'];

/** Редкость слова-карточки по длине: длинные слова круче */
export function wordRarity(word) {
  const n = word.length;
  return n >= 9 ? 'l' : n >= 7 ? 'e' : n >= 5 ? 'r' : 'c';
}

// СЛОВО эмодзи категория редкость
const TABLE = `
ДИВАН 🛋️ furniture r
СТУЛ 🪑 furniture c
КРОВАТЬ 🛏️ furniture r
ШКАФ 🗄️ furniture c
ДВЕРЬ 🚪 furniture c
ЛЕСТНИЦА 🪜 furniture c
ЧЕМОДАН 🧳 furniture c
КОРЗИНА 🧺 furniture c
ЛАМПА 💡 light c
СВЕЧА 🕯️ light c
ФОНАРЬ 🏮 light r
ЛАМПАДА 🪔 light r
КАРТИНА 🖼️ walldecor r
ЗЕРКАЛО 🪞 walldecor r
ОКНО 🪟 walldecor c
ЧАСЫ 🕰️ walldecor r
КАЛЕНДАРЬ 📅 walldecor c
КАРТА 🗺️ walldecor c
ВАЗА 🏺 decor r
МИШКА 🧸 decor c
МАТРЕШКА 🪆 decor r
ГЛОБУС 🌍 decor r
ПОДАРОК 🎁 decor c
ШАРИК 🎈 decor c
БУДИЛЬНИК ⏰ decor c
КНИГА 📕 decor c
ТЕЛЕСКОП 🔭 decor e
СТАТУЯ 🗿 decor e
ФИКУС 🪴 plants c
КАКТУС 🌵 plants c
РОЗА 🌹 plants r
ТЮЛЬПАН 🌷 plants c
ПОДСОЛНУХ 🌻 plants c
БУКЕТ 💐 plants r
ПАЛЬМА 🌴 plants r
ЕЛКА 🌲 plants r
САКУРА 🌸 plants e
ДЕРЕВО 🌳 plants r
ТЕЛЕВИЗОР 📺 tech r
РАДИО 📻 tech c
ТЕЛЕФОН ☎️ tech c
НОУТБУК 💻 tech r
КОМПЬЮТЕР 🖥️ tech r
ФОТОАППАРАТ 📷 tech r
НАУШНИКИ 🎧 tech c
МИКРОФОН 🎙️ tech c
ПРИНТЕР 🖨️ tech c
ЧАШКА ☕ dishes c
ЧАЙНИК 🫖 dishes c
ТАРЕЛКА 🍽️ dishes c
ЛОЖКА 🥄 dishes c
ВИЛКА 🍴 dishes c
НОЖ 🔪 dishes c
СКОВОРОДА 🍳 dishes c
МИСКА 🥣 dishes c
БАНКА 🫙 dishes c
БОКАЛ 🥂 dishes r
СОЛОНКА 🧂 dishes c
ГИТАРА 🎸 music r
ПИАНИНО 🎹 music l
СКРИПКА 🎻 music r
БАРАБАН 🥁 music c
ТРУБА 🎺 music c
САКСОФОН 🎷 music r
АККОРДЕОН 🪗 music r
КОТ 🐈 pets r
СОБАКА 🐕 pets r
РЫБКА 🐠 pets c
ХОМЯК 🐹 pets c
КРОЛИК 🐇 pets c
ПОПУГАЙ 🦜 pets r
ЧЕРЕПАХА 🐢 pets c
ВАННА 🛁 bath r
ДУШ 🚿 bath c
МЫЛО 🧼 bath c
КРЕМ 🧴 bath c
ЩЕТКА 🪥 bath c
ГУБКА 🧽 bath c
ЯБЛОКО 🍎 food c
ГРУША 🍐 food c
АПЕЛЬСИН 🍊 food c
ЛИМОН 🍋 food c
БАНАН 🍌 food c
АРБУЗ 🍉 food r
ВИНОГРАД 🍇 food c
КЛУБНИКА 🍓 food c
ВИШНЯ 🍒 food c
ПЕРСИК 🍑 food c
МАНГО 🥭 food r
АНАНАС 🍍 food r
КОКОС 🥥 food r
КИВИ 🥝 food c
ПОМИДОР 🍅 food c
МОРКОВЬ 🥕 food c
КУКУРУЗА 🌽 food c
ОГУРЕЦ 🥒 food c
БРОККОЛИ 🥦 food c
ЧЕСНОК 🧄 food c
ЛУК 🧅 food c
КАРТОФЕЛЬ 🥔 food c
ХЛЕБ 🍞 food c
КРУАССАН 🥐 food r
СЫР 🧀 food c
ЯЙЦО 🥚 food c
БЛИН 🥞 food c
ПИЦЦА 🍕 food r
БУРГЕР 🍔 food r
ТОРТ 🍰 food r
КЕКС 🧁 food c
ПОНЧИК 🍩 food c
ПЕЧЕНЬЕ 🍪 food c
ШОКОЛАД 🍫 food r
КОНФЕТА 🍬 food c
МЕД 🍯 food r
МОРОЖЕНОЕ 🍦 food r
ПЕЛЬМЕНЬ 🥟 food c
СУШИ 🍣 food r
САЛАТ 🥗 food c
ПОПКОРН 🍿 food c
КОФЕ ☕ drinks c
ЧАЙ 🍵 drinks c
СОК 🧃 drinks c
ЛИМОНАД 🥤 drinks c
МОЛОКО 🥛 drinks c
ВИНО 🍷 drinks r
ШАМПАНСКОЕ 🍾 drinks e
ПЛАТЬЕ 👗 clothes r
ФУТБОЛКА 👕 clothes c
РУБАШКА 👔 clothes c
ДЖИНСЫ 👖 clothes c
ПАЛЬТО 🧥 clothes r
ШАРФ 🧣 clothes c
НОСКИ 🧦 clothes c
КРОССОВКИ 👟 clothes c
ТУФЛИ 👠 clothes r
САПОГИ 👢 clothes r
КИМОНО 👘 clothes e
КУПАЛЬНИК 🩱 clothes r
ШЛЯПА 👒 accessory r
ЦИЛИНДР 🎩 accessory e
КЕПКА 🧢 accessory c
ОЧКИ 👓 accessory c
КОЛЬЦО 💍 accessory e
БУСЫ 📿 accessory r
СУМКА 👜 accessory r
РЮКЗАК 🎒 accessory c
ПОМАДА 💄 accessory c
ЗОНТ 🌂 accessory c
МОЛОТОК 🔨 tools c
ЛУПА 🔍 tools c
МАГНИТ 🧲 tools r
БОМБА 💣 tools r
ТОПОР 🪓 tools c
ОТВЕРТКА 🪛 tools c
НОЖНИЦЫ ✂️ tools c
КОМПАС 🧭 tools r
КАРАНДАШ ✏️ stationery c
РУЧКА 🖊️ stationery c
ЛИНЕЙКА 📏 stationery c
СКРЕПКА 📎 stationery c
КНОПКА 📌 stationery c
МЕЛОК 🖍️ stationery c
ТЕТРАДЬ 📓 stationery c
КОНВЕРТ ✉️ stationery c
РАКУШКА 🐚 nature c
КАМЕНЬ 🪨 nature c
ЛУНА 🌙 nature r
ЗВЕЗДА ⭐ nature r
СОЛНЦЕ ☀️ nature r
РАДУГА 🌈 nature l
СНЕЖИНКА ❄️ nature c
ЛИСТ 🍁 nature c
ПЕРО 🪶 nature c
АЛМАЗ 💎 nature l
БАБОЧКА 🦋 nature r
ПЧЕЛА 🐝 nature c
ЖУК 🐞 nature c
ГРИБ 🍄 nature c
ВЕЛОСИПЕД 🚲 transport r
САМОКАТ 🛴 transport c
МАШИНА 🚗 transport r
ЯХТА ⛵ transport e
САМОЛЕТ ✈️ transport r
ПОЕЗД 🚂 transport r
ЛОДКА 🛶 transport c
РАКЕТА 🚀 transport e
МОПЕД 🛵 transport r
МЯЧ ⚽ sport c
РАКЕТКА 🏓 sport c
КЕГЛЯ 🎳 sport c
СКЕЙТ 🛹 sport c
МИШЕНЬ 🎯 sport c
КОНЬКИ ⛸️ sport r
ЛЫЖИ 🎿 sport r
КУБОК 🏆 sport e
МЕДАЛЬ 🏅 sport r
ЕДИНОРОГ 🦄 fantasy l
ДРАКОН 🐉 fantasy l
ФЕЯ 🧚 fantasy e
КОРОНА 👑 fantasy l
КРИСТАЛЛ 🔮 fantasy r
ПАЛОЧКА 🪄 fantasy r
ЗАМОК 🏰 fantasy e
ОБЕЗЬЯНА 🐒 animals e
ГОРИЛЛА 🦍 animals r
ОРАНГУТАН 🦧 animals e
ПУДЕЛЬ 🐩 animals r
ТИГР 🐅 animals c
ЛЕОПАРД 🐆 animals r
ЛОШАДЬ 🐎 animals r
ЗЕБРА 🦓 animals c
ОЛЕНЬ 🦌 animals c
БИЗОН 🦬 animals c
БЫК 🐂 animals c
БУЙВОЛ 🐃 animals r
КОРОВА 🐄 animals r
СВИНЬЯ 🐖 animals r
КАБАН 🐗 animals c
ПЯТАЧОК 🐽 animals r
БАРАН 🐏 animals c
ОВЦА 🐑 animals c
КОЗА 🐐 animals c
ВЕРБЛЮД 🐪 animals r
ЛАМА 🦙 animals c
ЖИРАФ 🦒 animals c
СЛОН 🐘 animals c
МАМОНТ 🦣 animals r
НОСОРОГ 🦏 animals r
ГИППОПОТАМ 🦛 animals l
МЫШЬ 🐁 animals c
КРЫСА 🐀 animals c
БУРУНДУК 🐿️ animals e
БОБР 🦫 animals c
ЛЕНИВЕЦ 🦥 animals r
ВЫДРА 🦦 animals c
СКУНС 🦨 animals c
КЕНГУРУ 🦘 animals r
БАРСУК 🦡 animals r
ИНДЕЙКА 🦃 animals r
КУРИЦА 🐔 animals r
ПЕТУХ 🐓 animals c
ЦЫПЛЕНОК 🐥 animals e
ПТИЦА 🐦 animals c
ПИНГВИН 🐧 animals r
ГОЛУБЬ 🕊️ animals r
ОРЕЛ 🦅 animals c
УТКА 🦆 animals c
ЛЕБЕДЬ 🦢 animals r
СОВА 🦉 animals c
ФЛАМИНГО 🦩 animals e
ПАВЛИН 🦚 animals r
КРОКОДИЛ 🐊 animals e
ЯЩЕРИЦА 🦎 animals r
ЗМЕЯ 🐍 animals c
КИТ 🐋 animals c
ДЕЛЬФИН 🐬 animals r
ТЮЛЕНЬ 🦭 animals r
РЫБА 🐟 animals c
АКУЛА 🦈 animals c
ОСЬМИНОГ 🐙 animals e
КОРАЛЛ 🪸 animals r
КРАБ 🦀 animals c
ОМАР 🦞 animals c
КРЕВЕТКА 🦐 animals e
КАЛЬМАР 🦑 animals r
УСТРИЦА 🦪 animals r
УЛИТКА 🐌 animals r
ГУСЕНИЦА 🐛 animals e
МУРАВЕЙ 🐜 animals r
СВЕРЧОК 🦗 animals r
ПАУК 🕷️ animals c
ПАУТИНА 🕸️ animals r
СКОРПИОН 🦂 animals e
КОМАР 🦟 animals c
МУХА 🪰 animals c
ЧЕРВЯК 🪱 animals r
ЦВЕТОК 💮 plants r
ЛОТОС 🪷 plants c
РОСТОК 🌱 plants r
КОЛОС 🌾 plants c
ВЕТОЧКА 🌿 plants r
ТРИЛИСТНИК ☘️ plants l
КЛЕВЕР 🍀 plants r
ГНЕЗДО 🪹 plants r
ДЫНЯ 🍈 food c
ГОЛУБИКА 🫐 food e
ОЛИВКА 🫒 food r
АВОКАДО 🥑 food r
БАКЛАЖАН 🍆 food e
ПЕРЕЦ 🌶️ food c
АРАХИС 🥜 food r
ФАСОЛЬ 🫘 food r
КАШТАН 🌰 food r
БАГЕТ 🥖 food c
ЛЕПЕШКА 🫓 food r
КРЕНДЕЛЬ 🥨 food e
БУБЛИК 🥯 food r
ВАФЛЯ 🧇 food c
НОЖКА 🍗 food c
БЕКОН 🥓 food c
СЭНДВИЧ 🥪 food r
МАСЛО 🧈 food c
КОНСЕРВЫ 🥫 food e
КРЕКЕР 🍘 food r
РИС 🍚 food c
ЛАПША 🍜 food c
СПАГЕТТИ 🍝 food e
ПИРОГ 🥮 food c
ЛЕДЕНЕЦ 🍭 food r
ПУДИНГ 🍮 food r
ГОРА ⛰️ nature c
ВУЛКАН 🌋 nature r
КЕМПИНГ 🏕️ nature r
ПЛЯЖ 🏖️ nature c
ПУСТЫНЯ 🏜️ nature r
ОСТРОВ 🏝️ nature r
ПАРК 🏞️ nature c
СТАДИОН 🏟️ city r
СТРОЙКА 🏗️ city r
ДРЕВЕСИНА 🪵 city e
ХИЖИНА 🛖 city r
ПОЧТА 🏣 city c
БАНК 🏦 city c
ГОСТИНИЦА 🏨 city e
МАГАЗИН 🏪 city r
ШКОЛА 🏫 city c
УНИВЕРМАГ 🏬 city e
ЗАВОД 🏭 city c
БАШНЯ 🗼 city c
ФОНТАН ⛲ city r
ПАЛАТКА ⛺ city r
ТУМАН 🌁 city c
НОЧЬ 🌃 city c
ВОСХОД 🌅 city r
ЗАКАТ 🌇 city c
ГОРКА 🛝 city c
ШАТЕР 🎪 city c
ВАГОН 🚃 transport c
МЕТРО 🚇 transport c
ВОКЗАЛ 🚉 transport r
ТРАМВАЙ 🚊 transport r
АВТОБУС 🚌 transport r
ТРОЛЛЕЙБУС 🚎 transport l
ТАКСИ 🚕 transport c
ДЖИП 🚙 transport c
ПИКАП 🛻 transport c
ГРУЗОВИК 🚚 transport e
ФУРА 🚛 transport c
ТРАКТОР 🚜 transport r
АВТОМОБИЛЬ 🏎️ transport l
МОТОЦИКЛ 🏍️ transport e
ОСТАНОВКА 🚏 transport e
ШОССЕ 🛣️ transport c
ДОРОГА 🛤️ transport r
БОЧКА 🛢️ transport c
ЗАПРАВКА ⛽ transport e
КОЛЕСО 🛞 transport r
СВЕТОФОР 🚥 transport e
ЯКОРЬ ⚓ transport c
КАТЕР 🚤 transport c
ЛАЙНЕР 🛳️ transport r
ПАРОМ ⛴️ transport c
КОРАБЛЬ 🚢 transport r
ПАРАШЮТ 🪂 transport r
КРЕСЛО 💺 transport r
ВЕРТОЛЕТ 🚁 transport e
СПУТНИК 🛰️ transport r
ЗВОНОК 🛎️ furniture r
СЕКУНДОМЕР ⏱️ tech l
ТАЙМЕР ⏲️ tech r
ТЕРМОМЕТР 🌡️ nature e
ОБЛАКО ☁️ nature r
ГРОЗА ⛈️ nature c
ДОЖДЬ 🌦️ nature c
СНЕГ 🌨️ nature c
МОЛНИЯ 🌩️ nature r
ТОРНАДО 🌪️ nature r
ЦИКЛОН 🌀 nature r
КОМЕТА ☄️ nature r
ОГОНЬ 🔥 nature c
КАПЛЯ 💧 nature c
ВОЛНА 🌊 nature c
ХЛОПУШКА 🎉 holiday e
КОНФЕТТИ 🎊 holiday e
БАМБУК 🎍 holiday r
БАНТИК 🎀 holiday r
ЛЕНТА 🎗️ holiday c
БИЛЕТ 🎫 holiday c
БЕЙСБОЛ ⚾ sport r
БАСКЕТБОЛ 🏀 sport e
ВОЛЕЙБОЛ 🏐 sport e
РЕГБИ 🏉 sport c
ТЕННИС 🎾 sport r
ДИСК 🥏 sport c
КРИКЕТ 🏏 sport r
ХОККЕЙ 🏒 sport r
БАДМИНТОН 🏸 sport e
ПЕРЧАТКА 🥊 sport e
ГОЛЬФ ⛳ sport c
САНКИ 🛷 sport c
ЗМЕЙ 🪁 toys c
БИЛЬЯРД 🎱 toys r
ПЕШКА ♟️ toys c
ДЖОКЕР 🃏 toys r
ИГЛА 🪡 stationery c
КЛУБОК 🧶 stationery r
УЗЕЛ 🪢 stationery c
ХАЛАТ 🥼 clothes c
ЖИЛЕТ 🦺 clothes c
САРИ 🥻 clothes c
БИКИНИ 👙 clothes r
БЛУЗКА 👚 clothes r
КОШЕЛЕК 👛 accessory r
БОТИНОК 👞 clothes r
КАСКА 🪖 accessory c
МЕГАФОН 📣 music r
РОЖОК 📯 music c
НОТА 🎵 music c
БАНДЖО 🪕 music r
ТРУБКА 📞 tech r
БАТАРЕЙКА 🔋 tech e
КЛАВИАТУРА ⌨️ tech l
МЫШКА 🖱️ tech c
КИНОКАМЕРА 🎥 tech l
КИНОПЛЕНКА 🎞️ tech l
ФОНАРИК 🔦 light r
КНИЖКА 📔 stationery r
БЛОКНОТ 📒 stationery r
СВИТОК 📜 stationery r
СТРАНИЦА 📄 stationery e
ГАЗЕТА 📰 stationery r
ЗАКЛАДКА 🔖 stationery e
БИРКА 🏷️ stationery c
ПИСЬМО 📨 stationery r
ПОСЫЛКА 📦 stationery r
ЯЩИК 📮 stationery c
КИСТОЧКА 🖌️ stationery e
ЗАМЕТКА 📝 stationery r
ПОРТФЕЛЬ 💼 accessory e
ПАПКА 📁 stationery c
КАРТОТЕКА 🗃️ stationery e
КЛЮЧ 🔑 tools c
КИРКА ⛏️ tools c
БУМЕРАНГ 🪃 tools e
ШЕСТЕРЕНКА ⚙️ tools l
СОСУД ⚗️ tech c
ПРОБИРКА 🧪 tech e
МИКРОСКОП 🔬 tech e
АНТЕННА 📡 tech r
ПЛАСТЫРЬ 🩹 bath e
СТЕТОСКОП 🩺 bath e
ЛИФТ 🛗 furniture c
УНИТАЗ 🚽 bath r
БРИТВА 🪒 bath r
БУЛАВКА 🧷 bath r
МЕТЛА 🧹 furniture c
ВЕДРО 🪣 bath c
ПЛАКАТ 🪧 decor r
`;

export const ITEMS = TABLE.trim().split('\n').map((line) => {
  const [word, emoji, cat, rarity] = line.trim().split(/\s+/);
  return { id: word, word, emoji, cat, rarity, tier: 1 };
});

const BY_ID = Object.fromEntries(ITEMS.map((it) => [it.id, it]));

/** Описание предмета по id: работает для всех трёх ярусов. */
export function getItem(id) {
  if (BY_ID[id]) return BY_ID[id];
  if (id.startsWith('card:')) {
    const word = id.slice(5);
    let cat = CARD_WORDS[word] || dictCat(word) || 'misc';
    if (!CATEGORIES[cat] || cat === 'essence') cat = 'misc';
    return { id, word, emoji: CATEGORIES[cat].icon, cat, rarity: wordRarity(word), tier: 2 };
  }
  if (id.startsWith('ess:')) {
    const word = id.slice(4);
    return { id, word, emoji: '✨', cat: 'essence', rarity: wordRarity(word), tier: 3 };
  }
  return { id, word: id, emoji: '❓', cat: 'misc', rarity: 'c', tier: 2 };
}

export function itemsByCat(cat) { return ITEMS.filter((it) => it.cat === cat); }

/** Сколько энергии даёт предмет, если сжечь его в печи (без учёта уровня печи). */
export function burnValue(id) {
  const it = getItem(id);
  if (it.tier === 3) return 1 + RARITY_ORDER.indexOf(it.rarity);
  if (it.tier === 2) return 1 + Math.floor(it.word.length / 4);
  return RARITY[it.rarity].burn;
}

/** Сколько энергии даёт еда (если съесть). null — несъедобно. */
export function eatValue(id) {
  const it = getItem(id);
  if (it.tier !== 1 || CATEGORIES[it.cat].use !== 'eat') return null;
  return { c: 4, r: 7, e: 12, l: 20 }[it.rarity];
}

export function isPlaceable(id) {
  const it = getItem(id);
  return it.tier === 1 && !!CATEGORIES[it.cat].place;
}

export function placeOf(id) {
  return CATEGORIES[getItem(id).cat].place || null;
}

// ---------- Слова ----------
// Комнаты, которые открываются составлением слова в Эрудите
export const ROOMS = [
  { id: 'studio',   word: 'СТУДИЯ',     name: 'Студия',     bg: '#ffe3ec', floor: '#f3c7a5' },
  { id: 'kitchen',  word: 'КУХНЯ',      name: 'Кухня',      bg: '#fff3c4', floor: '#d9b48a' },
  { id: 'bath',     word: 'ВАННАЯ',     name: 'Ванная',     bg: '#d6f4ff', floor: '#b8dce8' },
  { id: 'bedroom',  word: 'СПАЛЬНЯ',    name: 'Спальня',    bg: '#e9dcff', floor: '#c9a98b' },
  { id: 'balcony',  word: 'БАЛКОН',     name: 'Балкон',     bg: '#d8ffd9', floor: '#bfa58a' },
  { id: 'living',   word: 'ГОСТИНАЯ',   name: 'Гостиная',   bg: '#ffe0cc', floor: '#b88a64' },
  { id: 'study',    word: 'КАБИНЕТ',    name: 'Кабинет',    bg: '#dfe7ff', floor: '#9b7a5c' },
  { id: 'garden',   word: 'ОРАНЖЕРЕЯ',  name: 'Оранжерея',  bg: '#ccf7e0', floor: '#a9c48a' },
];

/**
 * Что получится из слова.
 * { kind: 'room'|'item'|'card'|'essence'|'invalid', id?, room? }
 */
export function classifyWord(raw) {
  const word = normWord(raw);
  if (BY_ID[word]) return { kind: 'item', id: word, word };
  if (CARD_WORDS[word]) return { kind: 'card', id: 'card:' + word, word };
  if (ESSENCE_WORDS.has(word)) return { kind: 'essence', id: 'ess:' + word, word };
  const dc = dictCat(word);
  if (dc === 'ess') return { kind: 'essence', id: 'ess:' + word, word };
  if (dc) return { kind: 'card', id: 'card:' + word, word };
  return { kind: 'invalid', word };
}

/**
 * Любое слово → вещь-эмодзи. Есть своё эмодзи — оно; иначе вещь той же категории,
 * редкость по длине слова (длиннее — реже). Одно слово всегда даёт одну и ту же вещь.
 */
export function wordToItem(raw) {
  const c = classifyWord(raw);
  if (c.kind === 'invalid') return null;
  if (c.kind === 'item') return c.id;
  const word = c.word;
  const cat = c.kind === 'card' ? getItem(c.id).cat : null;
  let pool = ITEMS.filter((it) => (!cat || cat === 'misc' || it.cat === cat));
  if (!pool.length) pool = ITEMS;
  const want = wordRarity(word);
  // ближайшая доступная редкость: нужная, иначе ниже
  for (let i = RARITY_ORDER.indexOf(want); i >= 0; i--) {
    const p = pool.filter((it) => it.rarity === RARITY_ORDER[i]);
    if (p.length) { pool = p; break; }
  }
  let hsh = 0;
  for (const ch of word) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[hsh % pool.length].id;
}
