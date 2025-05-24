import { createRoute } from 'honox/factory'
import Counter from '../islands/counter'
import TypingInput from '../islands/typingInput'
import JapanMap from '../islands/japanMap'
import { getRandomPrefecture } from '../data/prefectures'

export default createRoute((c) => {
  const targetPrefecture = getRandomPrefecture()
  const name = c.req.query('name') ?? 'Hono'
  return c.render(
    <div className="game-container max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        都道府県タイピングゲーム
      </h1>
      <div className="game-content flex gap-10 items-start">
        <JapanMap targetPrefecture={targetPrefecture} />
        <TypingInput targetPrefecture={targetPrefecture} />
      </div>
    </div>
  )
})
