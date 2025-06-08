export interface Prefecture {
  id: number
  name: string
  kana: string
  region: string
  code: string
  area: number // 面積（km²）
  areaRank: number // 面積順位
}

export const prefectures: Prefecture[] = [
  { id: 1, name: "北海道", kana: "ほっかいどう", region: "北海道", code: "1", area: 83424.31, areaRank: 1 },
  { id: 2, name: "青森県", kana: "あおもりけん", region: "東北", code: "2", area: 9645.64, areaRank: 8 },
  { id: 3, name: "岩手県", kana: "いわてけん", region: "東北", code: "3", area: 15275.01, areaRank: 2 },
  { id: 4, name: "宮城県", kana: "みやぎけん", region: "東北", code: "4", area: 7282.22, areaRank: 16 },
  { id: 5, name: "秋田県", kana: "あきたけん", region: "東北", code: "5", area: 11637.54, areaRank: 6 },
  { id: 6, name: "山形県", kana: "やまがたけん", region: "東北", code: "6", area: 9323.15, areaRank: 9 },
  { id: 7, name: "福島県", kana: "ふくしまけん", region: "東北", code: "7", area: 13784.14, areaRank: 3 },
  { id: 8, name: "茨城県", kana: "いばらきけん", region: "関東", code: "8", area: 6097.39, areaRank: 24 },
  { id: 9, name: "栃木県", kana: "とちぎけん", region: "関東", code: "9", area: 6408.09, areaRank: 20 },
  { id: 10, name: "群馬県", kana: "ぐんまけん", region: "関東", code: "10", area: 6362.28, areaRank: 21 },
  { id: 11, name: "埼玉県", kana: "さいたまけん", region: "関東", code: "11", area: 3797.75, areaRank: 39 },
  { id: 12, name: "千葉県", kana: "ちばけん", region: "関東", code: "12", area: 5157.61, areaRank: 28 },
  { id: 13, name: "東京都", kana: "とうきょうと", region: "関東", code: "13", area: 2194.07, areaRank: 45 },
  { id: 14, name: "神奈川県", kana: "かながわけん", region: "関東", code: "14", area: 2416.17, areaRank: 43 },
  { id: 15, name: "新潟県", kana: "にいがたけん", region: "中部", code: "15", area: 12584.10, areaRank: 5 },
  { id: 16, name: "富山県", kana: "とやまけん", region: "中部", code: "16", area: 4247.61, areaRank: 33 },
  { id: 17, name: "石川県", kana: "いしかわけん", region: "中部", code: "17", area: 4186.09, areaRank: 35 },
  { id: 18, name: "福井県", kana: "ふくいけん", region: "中部", code: "18", area: 4190.52, areaRank: 34 },
  { id: 19, name: "山梨県", kana: "やまなしけん", region: "中部", code: "19", area: 4465.27, areaRank: 32 },
  { id: 20, name: "長野県", kana: "ながのけん", region: "中部", code: "20", area: 13561.56, areaRank: 4 },
  { id: 21, name: "岐阜県", kana: "ぎふけん", region: "中部", code: "21", area: 10621.29, areaRank: 7 },
  { id: 22, name: "静岡県", kana: "しずおかけん", region: "中部", code: "22", area: 7777.42, areaRank: 13 },
  { id: 23, name: "愛知県", kana: "あいちけん", region: "中部", code: "23", area: 5173.26, areaRank: 27 },
  { id: 24, name: "三重県", kana: "みえけん", region: "近畿", code: "24", area: 5774.40, areaRank: 25 },
  { id: 25, name: "滋賀県", kana: "しがけん", region: "近畿", code: "25", area: 4017.38, areaRank: 38 },
  { id: 26, name: "京都府", kana: "きょうとふ", region: "近畿", code: "26", area: 4612.19, areaRank: 31 },
  { id: 27, name: "大阪府", kana: "おおさかふ", region: "近畿", code: "27", area: 1905.14, areaRank: 46 },
  { id: 28, name: "兵庫県", kana: "ひょうごけん", region: "近畿", code: "28", area: 8401.02, areaRank: 12 },
  { id: 29, name: "奈良県", kana: "ならけん", region: "近畿", code: "29", area: 3691.09, areaRank: 40 },
  { id: 30, name: "和歌山県", kana: "わかやまけん", region: "近畿", code: "30", area: 4724.68, areaRank: 30 },
  { id: 31, name: "鳥取県", kana: "とっとりけん", region: "中国", code: "31", area: 3507.13, areaRank: 41 },
  { id: 32, name: "島根県", kana: "しまねけん", region: "中国", code: "32", area: 6708.26, areaRank: 19 },
  { id: 33, name: "岡山県", kana: "おかやまけん", region: "中国", code: "33", area: 7114.50, areaRank: 17 },
  { id: 34, name: "広島県", kana: "ひろしまけん", region: "中国", code: "34", area: 8479.38, areaRank: 11 },
  { id: 35, name: "山口県", kana: "やまぐちけん", region: "中国", code: "35", area: 6112.30, areaRank: 23 },
  { id: 36, name: "徳島県", kana: "とくしまけん", region: "四国", code: "36", area: 4146.93, areaRank: 36 },
  { id: 37, name: "香川県", kana: "かがわけん", region: "四国", code: "37", area: 1876.77, areaRank: 47 },
  { id: 38, name: "愛媛県", kana: "えひめけん", region: "四国", code: "38", area: 5676.11, areaRank: 26 },
  { id: 39, name: "高知県", kana: "こうちけん", region: "四国", code: "39", area: 7103.93, areaRank: 18 },
  { id: 40, name: "福岡県", kana: "ふくおかけん", region: "九州", code: "40", area: 4986.40, areaRank: 29 },
  { id: 41, name: "佐賀県", kana: "さがけん", region: "九州", code: "41", area: 2440.69, areaRank: 42 },
  { id: 42, name: "長崎県", kana: "ながさきけん", region: "九州", code: "42", area: 4130.98, areaRank: 37 },
  { id: 43, name: "熊本県", kana: "くまもとけん", region: "九州", code: "43", area: 7409.35, areaRank: 15 },
  { id: 44, name: "大分県", kana: "おおいたけん", region: "九州", code: "44", area: 6340.76, areaRank: 22 },
  { id: 45, name: "宮崎県", kana: "みやざきけん", region: "九州", code: "45", area: 7735.31, areaRank: 14 },
  { id: 46, name: "鹿児島県", kana: "かごしまけん", region: "九州", code: "46", area: 9187.06, areaRank: 10 },
  { id: 47, name: "沖縄県", kana: "おきなわけん", region: "九州", code: "47", area: 2281.00, areaRank: 44 }
]

export const getRandomPrefecture = (): Prefecture => {
  return prefectures[Math.floor(Math.random() * prefectures.length)]
}

export const regions = [
  { name: '北海道', prefectures: [1] },
  { name: '東北', prefectures: [2, 3, 4, 5, 6, 7] },
  { name: '関東', prefectures: [8, 9, 10, 11, 12, 13, 14] },
  { name: '中部', prefectures: [15, 16, 17, 18, 19, 20, 21, 22, 23] },
  { name: '近畿', prefectures: [24, 25, 26, 27, 28, 29, 30] },
  { name: '中国', prefectures: [31, 32, 33, 34, 35] },
  { name: '四国', prefectures: [36, 37, 38, 39] },
  { name: '九州', prefectures: [40, 41, 42, 43, 44, 45, 46, 47] }
]

// ランダムに地方を選択する関数
export const getRandomRegions = (count: number): number[] => {
  if (count <= 0 || count > regions.length) {
    // 無効な数の場合は全都道府県を返す
    return Array.from({length: 47}, (_, i) => i + 1)
  }
  
  // 1地方選択の場合は北海道を除外
  const availableRegions = count === 1 
    ? regions.filter(region => region.name !== '北海道')
    : regions
  
  // 地方をランダムに選択
  const shuffledRegions = [...availableRegions].sort(() => Math.random() - 0.5)
  const selectedRegions = shuffledRegions.slice(0, count)
  
  // 選択された地方の都道府県IDを結合
  const selectedPrefectures = selectedRegions.flatMap(region => region.prefectures)
  
  return selectedPrefectures
}
