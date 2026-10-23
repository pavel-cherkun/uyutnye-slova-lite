// Каталог предметов.
// Ярус 1 — предметы с картинкой (пока эмодзи). id предмета = слово.
// Ярус 2 — карточки-слова (id 'card:СЛОВО'), ярус 3 — эссенции (id 'ess:СЛОВО'), см. words.js.

import { CARD_WORDS, ESSENCE_WORDS } from './words.js';
import { normWord } from './letters.js';
import { dictCat } from './dict.js';
import { ALIASES } from './aliases.js';

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
  feelings:   { name: 'Чувства',       icon: '💗', use: 'collect' },
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
ОБЕЗЬЯНА 🐒 animals r
ГОРИЛЛА 🦍 animals e
ОРАНГУТАН 🦧 animals e
ПУДЕЛЬ 🐩 animals r
ТИГР 🐅 animals e
ЛЕОПАРД 🐆 animals e
ЛОШАДЬ 🐎 animals r
ЗЕБРА 🦓 animals e
ОЛЕНЬ 🦌 animals r
БИЗОН 🦬 animals e
БЫК 🐂 animals r
БУЙВОЛ 🐃 animals r
КОРОВА 🐄 animals r
СВИНЬЯ 🐖 animals r
КАБАН 🐗 animals r
ПЯТАЧОК 🐽 animals r
БАРАН 🐏 animals r
ОВЦА 🐑 animals r
КОЗА 🐐 animals r
ВЕРБЛЮД 🐪 animals r
ЛАМА 🦙 animals r
ЖИРАФ 🦒 animals e
СЛОН 🐘 animals e
МАМОНТ 🦣 animals l
НОСОРОГ 🦏 animals e
ГИППОПОТАМ 🦛 animals e
МЫШЬ 🐁 animals r
КРЫСА 🐀 animals r
БУРУНДУК 🐿️ animals r
БОБР 🦫 animals r
ЛЕНИВЕЦ 🦥 animals e
ВЫДРА 🦦 animals e
СКУНС 🦨 animals r
КЕНГУРУ 🦘 animals e
БАРСУК 🦡 animals r
ИНДЕЙКА 🦃 animals r
КУРИЦА 🐔 animals r
ПЕТУХ 🐓 animals r
ЦЫПЛЕНОК 🐥 animals r
ПТИЦА 🐦 animals r
ПИНГВИН 🐧 animals e
ГОЛУБЬ 🕊️ animals r
ОРЕЛ 🦅 animals e
УТКА 🦆 animals r
ЛЕБЕДЬ 🦢 animals e
СОВА 🦉 animals e
ФЛАМИНГО 🦩 animals e
ПАВЛИН 🦚 animals e
КРОКОДИЛ 🐊 animals e
ЯЩЕРИЦА 🦎 animals r
ЗМЕЯ 🐍 animals r
КИТ 🐋 animals e
ДЕЛЬФИН 🐬 animals e
ТЮЛЕНЬ 🦭 animals r
РЫБА 🐟 animals r
АКУЛА 🦈 animals e
ОСЬМИНОГ 🐙 animals e
КОРАЛЛ 🪸 animals e
КРАБ 🦀 animals r
ОМАР 🦞 animals r
КРЕВЕТКА 🦐 animals r
КАЛЬМАР 🦑 animals r
УСТРИЦА 🦪 animals r
УЛИТКА 🐌 animals r
ГУСЕНИЦА 🐛 animals r
МУРАВЕЙ 🐜 animals r
СВЕРЧОК 🦗 animals r
ПАУК 🕷️ animals r
ПАУТИНА 🕸️ animals r
СКОРПИОН 🦂 animals r
КОМАР 🦟 animals r
МУХА 🪰 animals r
ЧЕРВЯК 🪱 animals r
ЦВЕТОК 💮 plants c
ЛОТОС 🪷 plants e
РОСТОК 🌱 plants c
КОЛОС 🌾 plants c
ВЕТОЧКА 🌿 plants c
ТРИЛИСТНИК ☘️ plants c
КЛЕВЕР 🍀 plants c
ГНЕЗДО 🪹 plants c
ДЫНЯ 🍈 food c
ГОЛУБИКА 🫐 food c
ОЛИВКА 🫒 food c
АВОКАДО 🥑 food c
БАКЛАЖАН 🍆 food c
ПЕРЕЦ 🌶️ food c
АРАХИС 🥜 food c
ФАСОЛЬ 🫘 food c
КАШТАН 🌰 food c
БАГЕТ 🥖 food c
ЛЕПЕШКА 🫓 food c
КРЕНДЕЛЬ 🥨 food c
БУБЛИК 🥯 food c
ВАФЛЯ 🧇 food c
НОЖКА 🍗 food c
БЕКОН 🥓 food c
СЭНДВИЧ 🥪 food c
МАСЛО 🧈 food c
КОНСЕРВЫ 🥫 food c
КРЕКЕР 🍘 food c
РИС 🍚 food c
ЛАПША 🍜 food c
СПАГЕТТИ 🍝 food c
ПИРОГ 🥮 food c
ЛЕДЕНЕЦ 🍭 food c
ПУДИНГ 🍮 food c
ГОРА ⛰️ nature r
ВУЛКАН 🌋 nature e
КЕМПИНГ 🏕️ nature r
ПЛЯЖ 🏖️ nature r
ПУСТЫНЯ 🏜️ nature r
ОСТРОВ 🏝️ nature e
ПАРК 🏞️ nature r
СТАДИОН 🏟️ city r
СТРОЙКА 🏗️ city r
ДРЕВЕСИНА 🪵 city r
ХИЖИНА 🛖 city r
ПОЧТА 🏣 city r
БАНК 🏦 city r
ГОСТИНИЦА 🏨 city r
МАГАЗИН 🏪 city r
ШКОЛА 🏫 city r
УНИВЕРМАГ 🏬 city r
ЗАВОД 🏭 city r
БАШНЯ 🗼 city e
ФОНТАН ⛲ city e
ПАЛАТКА ⛺ city r
ТУМАН 🌁 city r
НОЧЬ 🌃 city r
ВОСХОД 🌅 city r
ЗАКАТ 🌇 city r
ГОРКА 🛝 city r
ШАТЕР 🎪 city e
ВАГОН 🚃 transport r
МЕТРО 🚇 transport r
ВОКЗАЛ 🚉 transport r
ТРАМВАЙ 🚊 transport r
АВТОБУС 🚌 transport r
ТРОЛЛЕЙБУС 🚎 transport r
ТАКСИ 🚕 transport r
ДЖИП 🚙 transport r
ПИКАП 🛻 transport r
ГРУЗОВИК 🚚 transport r
ФУРА 🚛 transport r
ТРАКТОР 🚜 transport r
АВТОМОБИЛЬ 🏎️ transport r
МОТОЦИКЛ 🏍️ transport r
ОСТАНОВКА 🚏 transport r
ШОССЕ 🛣️ transport r
ДОРОГА 🛤️ transport r
БОЧКА 🛢️ transport r
ЗАПРАВКА ⛽ transport r
КОЛЕСО 🛞 transport r
СВЕТОФОР 🚥 transport r
ЯКОРЬ ⚓ transport r
КАТЕР 🚤 transport r
ЛАЙНЕР 🛳️ transport e
ПАРОМ ⛴️ transport r
КОРАБЛЬ 🚢 transport e
ПАРАШЮТ 🪂 transport e
КРЕСЛО 💺 transport r
ВЕРТОЛЕТ 🚁 transport e
СПУТНИК 🛰️ transport l
ЗВОНОК 🛎️ furniture c
СЕКУНДОМЕР ⏱️ tech r
ТАЙМЕР ⏲️ tech r
ТЕРМОМЕТР 🌡️ nature r
ОБЛАКО ☁️ nature r
ГРОЗА ⛈️ nature r
ДОЖДЬ 🌦️ nature r
СНЕГ 🌨️ nature r
МОЛНИЯ 🌩️ nature r
ТОРНАДО 🌪️ nature e
ЦИКЛОН 🌀 nature r
КОМЕТА ☄️ nature l
ОГОНЬ 🔥 nature r
КАПЛЯ 💧 nature r
ВОЛНА 🌊 nature r
ХЛОПУШКА 🎉 holiday r
КОНФЕТТИ 🎊 holiday r
БАМБУК 🎍 holiday r
БАНТИК 🎀 holiday r
ЛЕНТА 🎗️ holiday r
БИЛЕТ 🎫 holiday r
БЕЙСБОЛ ⚾ sport r
БАСКЕТБОЛ 🏀 sport r
ВОЛЕЙБОЛ 🏐 sport r
РЕГБИ 🏉 sport r
ТЕННИС 🎾 sport r
ДИСК 🥏 sport r
КРИКЕТ 🏏 sport r
ХОККЕЙ 🏒 sport r
БАДМИНТОН 🏸 sport r
ПЕРЧАТКА 🥊 sport r
ГОЛЬФ ⛳ sport r
САНКИ 🛷 sport r
ЗМЕЙ 🪁 toys r
БИЛЬЯРД 🎱 toys r
ПЕШКА ♟️ toys r
ДЖОКЕР 🃏 toys r
ИГЛА 🪡 stationery c
КЛУБОК 🧶 stationery c
УЗЕЛ 🪢 stationery c
ХАЛАТ 🥼 clothes c
ЖИЛЕТ 🦺 clothes c
САРИ 🥻 clothes c
БИКИНИ 👙 clothes c
БЛУЗКА 👚 clothes c
КОШЕЛЕК 👛 accessory c
БОТИНОК 👞 clothes c
КАСКА 🪖 accessory c
МЕГАФОН 📣 music r
РОЖОК 📯 music r
НОТА 🎵 music r
БАНДЖО 🪕 music r
ТРУБКА 📞 tech r
БАТАРЕЙКА 🔋 tech r
КЛАВИАТУРА ⌨️ tech r
МЫШКА 🖱️ tech r
КИНОКАМЕРА 🎥 tech r
КИНОПЛЕНКА 🎞️ tech r
ФОНАРИК 🔦 light c
КНИЖКА 📔 stationery c
БЛОКНОТ 📒 stationery c
СВИТОК 📜 stationery c
СТРАНИЦА 📄 stationery c
ГАЗЕТА 📰 stationery c
ЗАКЛАДКА 🔖 stationery c
БИРКА 🏷️ stationery c
ПИСЬМО 📨 stationery c
ПОСЫЛКА 📦 stationery c
ЯЩИК 📮 stationery c
КИСТОЧКА 🖌️ stationery c
ЗАМЕТКА 📝 stationery c
ПОРТФЕЛЬ 💼 accessory c
ПАПКА 📁 stationery c
КАРТОТЕКА 🗃️ stationery c
КЛЮЧ 🔑 tools c
КИРКА ⛏️ tools c
БУМЕРАНГ 🪃 tools c
ШЕСТЕРЕНКА ⚙️ tools c
СОСУД ⚗️ tech r
ПРОБИРКА 🧪 tech r
МИКРОСКОП 🔬 tech e
АНТЕННА 📡 tech r
ПЛАСТЫРЬ 🩹 bath c
СТЕТОСКОП 🩺 bath c
ЛИФТ 🛗 furniture c
УНИТАЗ 🚽 bath c
БРИТВА 🪒 bath c
БУЛАВКА 🧷 bath c
МЕТЛА 🧹 furniture c
ВЕДРО 🪣 bath c
ПЛАКАТ 🪧 decor c
СЕРДЦЕ ❤️ feelings r
ПОЦЕЛУЙ 💋 feelings e
ВЗРЫВ 💥 feelings r
СОН 💤 feelings c
МЫСЛЬ 💭 feelings c
БРЫЗГИ 💦 feelings c
ЗЛОСТЬ 💢 feelings c
СОТНЯ 💯 feelings r
РАЗЛУКА 💔 feelings r
АМУР 💘 feelings e
ИСКРА ✨ feelings r
ЗВЕЗДОЧКА 🌟 nature r
УЛЫБКА 😊 feelings c
СМЕХ 😂 feelings c
СЛЕЗА 😢 feelings c
ПРИВИДЕНИЕ 👻 fantasy e
ИНОПЛАНЕТЯНИН 👽 fantasy l
РОБОТ 🤖 fantasy r
КЛОУН 🤡 fantasy r
ТЫКВА 🎃 holiday r
ГЛАЗ 👁️ feelings c
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
  // синоним: другое слово для того же эмодзи (ЛЮБОВЬ → ❤️ сердце)
  if (ALIASES[word] && BY_ID[ALIASES[word]]) return { kind: 'item', id: ALIASES[word], word, alias: true };
  if (CARD_WORDS[word]) return { kind: 'card', id: 'card:' + word, word };
  if (ESSENCE_WORDS.has(word)) return { kind: 'essence', id: 'ess:' + word, word };
  const dc = dictCat(word);
  if (dc === 'ess') return { kind: 'essence', id: 'ess:' + word, word };
  if (dc) return { kind: 'card', id: 'card:' + word, word };
  return { kind: 'invalid', word };
}

/**
 * Что даёт слово: своё эмодзи (вещь) — или карточку-слово в «Словарь» (id 'card:СЛОВО').
 * Случайных «похожих» вещей не выдаём: слово и картинка всегда совпадают.
 */
export function wordToItem(raw) {
  const c = classifyWord(raw);
  if (c.kind === 'invalid') return null;
  if (c.kind === 'item') return c.id;
  return 'card:' + c.word;
}
