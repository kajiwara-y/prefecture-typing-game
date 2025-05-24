export interface Prefecture {
  id: number
  name: string
  kana: string
  region: string
  code: string // JIS都道府県コード（2桁）
}

export const prefectures: Prefecture[] = [
  { id: 1, name: "北海道", kana: "ほっかいどう", region: "北海道", code: "1" },
  { id: 2, name: "青森県", kana: "あおもりけん", region: "東北", code: "2" },
  { id: 3, name: "岩手県", kana: "いわてけん", region: "東北", code: "3" },
  { id: 4, name: "宮城県", kana: "みやぎけん", region: "東北", code: "4" },
  { id: 5, name: "秋田県", kana: "あきたけん", region: "東北", code: "5" },
  { id: 6, name: "山形県", kana: "やまがたけん", region: "東北", code: "6" },
  { id: 7, name: "福島県", kana: "ふくしまけん", region: "東北", code: "7" },
  { id: 8, name: "茨城県", kana: "いばらきけん", region: "関東", code: "8" },
  { id: 9, name: "栃木県", kana: "とちぎけん", region: "関東", code: "9" },
  { id: 10, name: "群馬県", kana: "ぐんまけん", region: "関東", code: "10" },
  { id: 11, name: "埼玉県", kana: "さいたまけん", region: "関東", code: "11" },
  { id: 12, name: "千葉県", kana: "ちばけん", region: "関東", code: "12" },
  { id: 13, name: "東京都", kana: "とうきょうと", region: "関東", code: "13" },
  { id: 14, name: "神奈川県", kana: "かながわけん", region: "関東", code: "14" },
  { id: 15, name: "新潟県", kana: "にいがたけん", region: "中部", code: "15" },
  { id: 16, name: "富山県", kana: "とやまけん", region: "中部", code: "16" },
  { id: 17, name: "石川県", kana: "いしかわけん", region: "中部", code: "17" },
  { id: 18, name: "福井県", kana: "ふくいけん", region: "中部", code: "18" },
  { id: 19, name: "山梨県", kana: "やまなしけん", region: "中部", code: "19" },
  { id: 20, name: "長野県", kana: "ながのけん", region: "中部", code: "20" },
  { id: 21, name: "岐阜県", kana: "ぎふけん", region: "中部", code: "21" },
  { id: 22, name: "静岡県", kana: "しずおかけん", region: "中部", code: "22" },
  { id: 23, name: "愛知県", kana: "あいちけん", region: "中部", code: "23" },
  { id: 24, name: "三重県", kana: "みえけん", region: "近畿", code: "24" },
  { id: 25, name: "滋賀県", kana: "しがけん", region: "近畿", code: "25" },
  { id: 26, name: "京都府", kana: "きょうとふ", region: "近畿", code: "26" },
  { id: 27, name: "大阪府", kana: "おおさかふ", region: "近畿", code: "27" },
  { id: 28, name: "兵庫県", kana: "ひょうごけん", region: "近畿", code: "28" },
  { id: 29, name: "奈良県", kana: "ならけん", region: "近畿", code: "29" },
  { id: 30, name: "和歌山県", kana: "わかやまけん", region: "近畿", code: "30" },
  { id: 31, name: "鳥取県", kana: "とっとりけん", region: "中国", code: "31" },
  { id: 32, name: "島根県", kana: "しまねけん", region: "中国", code: "32" },
  { id: 33, name: "岡山県", kana: "おかやまけん", region: "中国", code: "33" },
  { id: 34, name: "広島県", kana: "ひろしまけん", region: "中国", code: "34" },
  { id: 35, name: "山口県", kana: "やまぐちけん", region: "中国", code: "35" },
  { id: 36, name: "徳島県", kana: "とくしまけん", region: "四国", code: "36" },
  { id: 37, name: "香川県", kana: "かがわけん", region: "四国", code: "37" },
  { id: 38, name: "愛媛県", kana: "えひめけん", region: "四国", code: "38" },
  { id: 39, name: "高知県", kana: "こうちけん", region: "四国", code: "39" },
  { id: 40, name: "福岡県", kana: "ふくおかけん", region: "九州", code: "40" },
  { id: 41, name: "佐賀県", kana: "さがけん", region: "九州", code: "41" },
  { id: 42, name: "長崎県", kana: "ながさきけん", region: "九州", code: "42" },
  { id: 43, name: "熊本県", kana: "くまもとけん", region: "九州", code: "43" },
  { id: 44, name: "大分県", kana: "おおいたけん", region: "九州", code: "44" },
  { id: 45, name: "宮崎県", kana: "みやざきけん", region: "九州", code: "45" },
  { id: 46, name: "鹿児島県", kana: "かごしまけん", region: "九州", code: "46" },
  { id: 47, name: "沖縄県", kana: "おきなわけん", region: "九州", code: "47" }
]

export const getRandomPrefecture = (): Prefecture => {
  return prefectures[Math.floor(Math.random() * prefectures.length)]
}
