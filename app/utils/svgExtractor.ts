import { prefectures } from '../data/prefectures'

export interface PrefectureShape {
  id: number
  name: string
  pathElements: string[]
  transform: string
  className: string
}

// SVGから都道府県データを抽出する関数
export async function extractPrefectureShapes(): Promise<PrefectureShape[]> {
  try {
    const response = await fetch('/map-full.svg')
    const svgText = await response.text()
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
    
    const prefectureGroups = svgDoc.querySelectorAll('.prefecture')
    const shapes: PrefectureShape[] = []
    
    prefectureGroups.forEach(group => {
      const dataCode = group.getAttribute('data-code')
      const transform = group.getAttribute('transform') || ''
      const className = group.getAttribute('class') || ''
      
      if (dataCode) {
        const id = parseInt(dataCode)
        const prefecture = prefectures.find(p => p.id === id)
        
        if (prefecture) {
          // polygon/path要素を抽出
          const pathElements: string[] = []
          
          // polygon要素を処理
          const polygons = group.querySelectorAll('polygon')
          polygons.forEach(polygon => {
            const points = polygon.getAttribute('points')
            if (points) {
              pathElements.push(`<polygon points="${points}" fill="inherit" stroke="inherit" stroke-width="inherit"/>`)
            }
          })
          
          // path要素を処理
          const paths = group.querySelectorAll('path')
          paths.forEach(path => {
            const d = path.getAttribute('d')
            if (d) {
              pathElements.push(`<path d="${d}" fill="inherit" stroke="inherit" stroke-width="inherit"/>`)
            }
          })
          
          if (pathElements.length > 0) {
            shapes.push({
              id,
              name: prefecture.name,
              pathElements,
              transform,
              className
            })
          }
        }
      }
    })
    
    return shapes.sort((a, b) => a.id - b.id)
  } catch (error) {
    console.error('SVG抽出エラー:', error)
    return []
  }
}

// 都道府県の境界ボックスを計算する関数（簡易版）
export function calculateNormalizedTransform(transform: string, targetSize: number = 200): string {
  // transform="translate(x, y)"からx, yを抽出
  const translateMatch = transform.match(/translate\(([^)]+)\)/)
  
  if (translateMatch) {
    const coords = translateMatch[1].split(',').map(n => parseFloat(n.trim()))
    const translateX = coords[0] || 0
    const translateY = coords[1] || 0
    
    // 正規化された位置に変換（中央寄せ）
    const normalizedX = (targetSize - 100) / 2  // 仮の調整値
    const normalizedY = (targetSize - 100) / 2  // 仮の調整値
    
    return `translate(${normalizedX}, ${normalizedY}) scale(0.8)`
  }
  
  return `translate(${targetSize/2}, ${targetSize/2}) scale(0.8)`
}
