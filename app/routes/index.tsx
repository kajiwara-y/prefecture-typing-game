import { createRoute } from 'honox/factory'
import JapanMap from '../islands/JapanMap'
import TypingInput from '../islands/TypingInput'
import GameProgress from '../islands/GameProgress'
import GameControls from '../islands/GameControls'

export default createRoute((c) => {
  return c.render(
    <div className="game-container max-w-7xl mx-auto bg-white rounded-2xl p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        都道府県タイピングゲーム
      </h1>
      
      <GameControls />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 地図エリア */}
        <div className="lg:col-span-2">
          <JapanMap />
        </div>
        
        {/* 右サイドバー */}
        <div className="space-y-6">
          {/* 進捗表示 */}
          <GameProgress />
          
          {/* タイピング入力 */}
          <TypingInput />
        </div>
      </div>
    </div>
  )
})
