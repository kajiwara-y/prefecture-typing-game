import { createRoute } from 'honox/factory'
import JapanMap from '../islands/JapanMap'
import TypingInput from '../islands/TypingInput'
import GameHeader from '../islands/GameHeader'      
import GameProgress from '../islands/GameProgress'
import GameControls from '../islands/GameControls'
import RegionSelector from '../islands/RegionSelector'

export default createRoute((c) => {
  return c.render(
    <div className="game-container max-w-7xl mx-auto bg-white rounded-2xl p-8 shadow-xl">
      <GameHeader />
      
      {/* 全県モード表示 */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
          🗾 全47都道府県モード
        </div>
          <RegionSelector />
          {/* エキスパートモードへのリンクを追加 */}
          <a
            href="/expert"
            className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold hover:bg-purple-200 transition-colors"
          >
            🎓 エキスパートモード
          </a>
      </div>
      
      {/* PC・タブレット用レイアウト (1024px以上) */}
      <div className="hidden lg:block">
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
        <GameControls />
      </div>

      {/* スマホ・小さなタブレット用レイアウト (1023px以下) */}
      <div className="block lg:hidden">
        {/* コントロールボタン */}
        <div className="mb-6">
          <GameControls />
        </div>
        
        {/* 地図エリア（最初に表示） */}
        <div className="mb-6">
          <JapanMap />
        </div>
        
        {/* タイピング入力エリア（2番目に表示） */}
        <div className="mb-6">
          <TypingInput />
        </div>
        
        {/* ゲーム進捗（最後に表示） */}
        <div>
          <GameProgress />
        </div>
      </div>
    </div>
  )
})
