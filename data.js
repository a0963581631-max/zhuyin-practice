const groups={
 initials:["ㄅ","ㄆ","ㄇ","ㄈ","ㄉ","ㄊ","ㄋ","ㄌ","ㄍ","ㄎ","ㄏ","ㄐ","ㄑ","ㄒ","ㄓ","ㄔ","ㄕ","ㄖ","ㄗ","ㄘ","ㄙ"],
 finals:["ㄧ","ㄨ","ㄩ","ㄚ","ㄛ","ㄜ","ㄝ","ㄞ","ㄟ","ㄠ","ㄡ","ㄢ","ㄣ","ㄤ","ㄥ","ㄦ"],
 compound:["ㄧㄚ","ㄧㄛ","ㄧㄝ","ㄧㄞ","ㄧㄠ","ㄧㄡ","ㄧㄢ","ㄧㄣ","ㄧㄤ","ㄧㄥ","ㄨㄚ","ㄨㄛ","ㄨㄞ","ㄨㄟ","ㄨㄢ","ㄨㄣ","ㄨㄤ","ㄨㄥ","ㄩㄝ","ㄩㄢ","ㄩㄣ","ㄩㄥ"]
};
const navigationOrder=[...groups.initials,...groups.finals,...groups.compound];

const vocabularyBank = {
  "ㄅ":[
    {word:"包子", emoji:"🥟", bopomofo:["ㄅㄠ","ㄗ˙"]},
    {word:"杯子", emoji:"🥤", bopomofo:["ㄅㄟ","ㄗ˙"]}
  ],
  "ㄆ":[
    {word:"泡泡", emoji:"🫧", bopomofo:["ㄆㄠˋ","ㄆㄠ˙"]},
    {word:"葡萄", emoji:"🍇", bopomofo:["ㄆㄨˊ","ㄊㄠˊ"]}
  ],
  "ㄇ":[
    {word:"帽子", emoji:"🧢", bopomofo:["ㄇㄠˋ","ㄗ˙"]},
    {word:"貓咪", emoji:"🐱", bopomofo:["ㄇㄠ","ㄇㄧ"]}
  ],
  "ㄈ":[
    {word:"風箏", emoji:"🪁", bopomofo:["ㄈㄥ","ㄓㄥ"]},
    {word:"飛機", emoji:"✈️", bopomofo:["ㄈㄟ","ㄐㄧ"]}
  ],
  "ㄉ":[
    {word:"蛋糕", emoji:"🎂", bopomofo:["ㄉㄢˋ","ㄍㄠ"]},
    {word:"電燈", emoji:"💡", bopomofo:["ㄉㄧㄢˋ","ㄉㄥ"]}
  ],
  "ㄊ":[
    {word:"兔子", emoji:"🐰", bopomofo:["ㄊㄨˋ","ㄗ˙"]},
    {word:"太陽", emoji:"☀️", bopomofo:["ㄊㄞˋ","ㄧㄤˊ"]}
  ],
  "ㄋ":[
    {word:"牛奶", emoji:"🥛", bopomofo:["ㄋㄧㄡˊ","ㄋㄞˇ"]},
    {word:"南瓜", emoji:"🎃", bopomofo:["ㄋㄢˊ","ㄍㄨㄚ"]}
  ],
  "ㄌ":[
    {word:"老虎", emoji:"🐯", bopomofo:["ㄌㄠˇ","ㄏㄨˇ"]},
    {word:"梨子", emoji:"🍐", bopomofo:["ㄌㄧˊ","ㄗ˙"]}
  ],
  "ㄍ":[
    {word:"狗狗", emoji:"🐶", bopomofo:["ㄍㄡˇ","ㄍㄡ˙"]},
    {word:"公車", emoji:"🚌", bopomofo:["ㄍㄨㄥ","ㄔㄜ"]}
  ],
  "ㄎ":[
    {word:"口罩", emoji:"😷", bopomofo:["ㄎㄡˇ","ㄓㄠˋ"]},
    {word:"恐龍", emoji:"🦖", bopomofo:["ㄎㄨㄥˇ","ㄌㄨㄥˊ"]}
  ],
  "ㄏ":[
    {word:"河馬", emoji:"🦛", bopomofo:["ㄏㄜˊ","ㄇㄚˇ"]},
    {word:"火車", emoji:"🚂", bopomofo:["ㄏㄨㄛˇ","ㄔㄜ"]}
  ],
  "ㄐ":[
    {word:"積木", emoji:"🧱", bopomofo:["ㄐㄧ","ㄇㄨˋ"]},
    {word:"剪刀", emoji:"✂️", bopomofo:["ㄐㄧㄢˇ","ㄉㄠ"]}
  ],
  "ㄑ":[
    {word:"氣球", emoji:"🎈", bopomofo:["ㄑㄧˋ","ㄑㄧㄡˊ"]},
    {word:"汽車", emoji:"🚗", bopomofo:["ㄑㄧˋ","ㄔㄜ"]}
  ],
  "ㄒ":[
    {word:"香蕉", emoji:"🍌", bopomofo:["ㄒㄧㄤ","ㄐㄧㄠ"]},
    {word:"西瓜", emoji:"🍉", bopomofo:["ㄒㄧ","ㄍㄨㄚ"]}
  ],
  "ㄓ":[
    {word:"蜘蛛", emoji:"🕷️", bopomofo:["ㄓ","ㄓㄨ"]},
    {word:"指甲", emoji:"💅", bopomofo:["ㄓˇ","ㄐㄧㄚˇ"]}
  ],
  "ㄔ":[
    {word:"車子", emoji:"🚗", bopomofo:["ㄔㄜ","ㄗ˙"]},
    {word:"尺子", emoji:"📏", bopomofo:["ㄔˇ","ㄗ˙"]}
  ],
  "ㄕ":[
    {word:"獅子", emoji:"🦁", bopomofo:["ㄕ","ㄗ˙"]},
    {word:"書包", emoji:"🎒", bopomofo:["ㄕㄨ","ㄅㄠ"]}
  ],
  "ㄖ":[
    {word:"日曆", emoji:"📅", bopomofo:["ㄖˋ","ㄌㄧˋ"]},
    {word:"熱狗", emoji:"🌭", bopomofo:["ㄖㄜˋ","ㄍㄡˇ"]}
  ],
  "ㄗ":[
    {word:"自行車", emoji:"🚲", bopomofo:["ㄗˋ","ㄒㄧㄥˊ","ㄔㄜ"]},
    {word:"足球", emoji:"⚽", bopomofo:["ㄗㄨˊ","ㄑㄧㄡˊ"]}
  ],
  "ㄘ":[
    {word:"刺蝟", emoji:"🦔", bopomofo:["ㄘˋ","ㄨㄟˋ"]},
    {word:"草莓", emoji:"🍓", bopomofo:["ㄘㄠˇ","ㄇㄟˊ"]}
  ],
  "ㄙ":[
    {word:"三明治", emoji:"🥪", bopomofo:["ㄙㄢ","ㄇㄧㄥˊ","ㄓˋ"]},
    {word:"掃把", emoji:"🧹", bopomofo:["ㄙㄠˋ","ㄅㄚˇ"]}
  ],
  "ㄚ":[
    {word:"沙發", emoji:"🛋️", bopomofo:["ㄕㄚ","ㄈㄚ"]},
    {word:"喇叭", emoji:"📣", bopomofo:["ㄌㄚˇ","ㄅㄚ"]}
  ],
  "ㄛ":[
    {word:"火鍋", emoji:"🍲", bopomofo:["ㄏㄨㄛˇ","ㄍㄨㄛ"]},
    {word:"蘿蔔", emoji:"🥕", bopomofo:["ㄌㄨㄛˊ","ㄅㄛ˙"]}
  ],
  "ㄜ":[
    {word:"鵝", emoji:"🪿", bopomofo:["ㄜˊ"]},
    {word:"可樂", emoji:"🥤", bopomofo:["ㄎㄜˇ","ㄌㄜˋ"]}
  ],
  "ㄝ":[
    {word:"爺爺", emoji:"👴", bopomofo:["ㄧㄝˊ","ㄧㄝ˙"]},
    {word:"椰子", emoji:"🥥", bopomofo:["ㄧㄝˊ","ㄗ˙"]}
  ],
  "ㄞ":[
    {word:"白菜", emoji:"🥬", bopomofo:["ㄅㄞˊ","ㄘㄞˋ"]},
    {word:"海豚", emoji:"🐬", bopomofo:["ㄏㄞˇ","ㄊㄨㄣˊ"]}
  ],
  "ㄟ":[
    {word:"飛機", emoji:"✈️", bopomofo:["ㄈㄟ","ㄐㄧ"]},
    {word:"杯子", emoji:"🥤", bopomofo:["ㄅㄟ","ㄗ˙"]}
  ],
  "ㄠ":[
    {word:"貓咪", emoji:"🐱", bopomofo:["ㄇㄠ","ㄇㄧ"]},
    {word:"桃子", emoji:"🍑", bopomofo:["ㄊㄠˊ","ㄗ˙"]}
  ],
  "ㄡ":[
    {word:"口罩", emoji:"😷", bopomofo:["ㄎㄡˇ","ㄓㄠˋ"]},
    {word:"豆子", emoji:"🫘", bopomofo:["ㄉㄡˋ","ㄗ˙"]}
  ],
  "ㄢ":[
    {word:"饅頭", emoji:"🍞", bopomofo:["ㄇㄢˊ","ㄊㄡ˙"]},
    {word:"番茄", emoji:"🍅", bopomofo:["ㄈㄢ","ㄑㄧㄝˊ"]}
  ],
  "ㄣ":[
    {word:"門", emoji:"🚪", bopomofo:["ㄇㄣˊ"]},
    {word:"枕頭", emoji:"🛏️", bopomofo:["ㄓㄣˇ","ㄊㄡ˙"]}
  ],
  "ㄤ":[
    {word:"羊", emoji:"🐑", bopomofo:["ㄧㄤˊ"]},
    {word:"房子", emoji:"🏠", bopomofo:["ㄈㄤˊ","ㄗ˙"]}
  ],
  "ㄥ":[
    {word:"燈籠", emoji:"🏮", bopomofo:["ㄉㄥ","ㄌㄨㄥˊ"]},
    {word:"風箏", emoji:"🪁", bopomofo:["ㄈㄥ","ㄓㄥ"]}
  ],
  "ㄦ":[
    {word:"耳朵", emoji:"👂", bopomofo:["ㄦˇ","ㄉㄨㄛ˙"]},
    {word:"兒童車", emoji:"🚲", bopomofo:["ㄦˊ","ㄊㄨㄥˊ","ㄔㄜ"]}
  ],
  "ㄧ":[
    {word:"衣服", emoji:"👕", bopomofo:["ㄧ","ㄈㄨˊ"]},
    {word:"椅子", emoji:"🪑", bopomofo:["ㄧˇ","ㄗ˙"]}
  ],
  "ㄨ":[
    {word:"烏龜", emoji:"🐢", bopomofo:["ㄨ","ㄍㄨㄟ"]},
    {word:"屋子", emoji:"🏠", bopomofo:["ㄨ","ㄗ˙"]}
  ],
  "ㄩ":[
    {word:"魚", emoji:"🐟", bopomofo:["ㄩˊ"]},
    {word:"雨傘", emoji:"☂️", bopomofo:["ㄩˇ","ㄙㄢˇ"]}
  ]
};
