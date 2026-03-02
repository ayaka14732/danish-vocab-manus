# 丹麥語背單詞網站 — 設計構思

## 方案一：北歐極簡主義（Nordic Minimalism）

<response>
<text>
**Design Movement**: Scandinavian Minimalism + Swiss Typography
**Core Principles**:
- 大量留白，強調內容本身
- 幾何形狀作為視覺元素
- 單色系搭配一個強調色
- 清晰的資訊層次

**Color Philosophy**: 冷白底色（#FAFAFA）搭配深炭灰文字（#1A1A2E），以丹麥國旗紅（#C60C30）作為唯一強調色，傳遞北歐的冷靜與清晰。

**Layout Paradigm**: 非對稱左側固定導航，右側大面積內容區，卡片採用極細邊框而非陰影。

**Signature Elements**:
- 丹麥國旗十字紋路作為裝飾元素
- 細線分隔符
- 大號數字顯示學習進度

**Interaction Philosophy**: 極度克制，只有必要的動畫，hover 時輕微位移。

**Animation**: 頁面切換用 fade，卡片翻轉用 3D perspective flip（0.4s ease）。

**Typography System**: Playfair Display（標題）+ Source Sans 3（正文），強調對比。
</text>
<probability>0.08</probability>
</response>

## 方案二：活潑學習風格（Playful Learning）

<response>
<text>
**Design Movement**: Material Design 3 + Duolingo-inspired Gamification
**Core Principles**:
- 色彩豐富，充滿活力
- 遊戲化元素（積分、連勝）
- 圓潤的卡片與按鈕
- 即時反饋動畫

**Color Philosophy**: 以丹麥藍（#003F87）為主色，搭配暖黃（#FFD700）和珊瑚紅（#FF6B6B），傳遞學習的樂趣與活力。

**Layout Paradigm**: 居中卡片佈局，大量使用插圖和圖標，進度條貫穿整個學習流程。

**Signature Elements**:
- 連勝火焰動畫
- 正確/錯誤的彈跳動畫
- 彩色進度條

**Interaction Philosophy**: 每個操作都有即時視覺反饋，正確答案有慶祝動畫。

**Animation**: 彈跳（spring）動畫，confetti 慶祝效果，卡片搖晃表示錯誤。

**Typography System**: Nunito（圓潤友好）+ Nunito Sans（正文），統一圓潤感。
</text>
<probability>0.07</probability>
</response>

## 方案三：學術典雅風格（Academic Elegance）★ 選用

<response>
<text>
**Design Movement**: Editorial Design + Academic Notebook Aesthetic
**Core Principles**:
- 紙質感背景，彷彿在翻閱實體字典
- 排版嚴謹，模擬印刷品質感
- 深色主題，適合長時間學習
- 精緻的細節處理

**Color Philosophy**: 深墨綠（#1B3A2D）作為主背景，米白（#F5F0E8）作為卡片色，金色（#C9A84C）作為強調色，傳遞學術典雅與丹麥文化深度。

**Layout Paradigm**: 左側固定側邊欄（分類導航），右側主內容區採用雜誌式排版，卡片有紙質陰影效果。

**Signature Elements**:
- 紙質紋理背景
- 金色邊框與裝飾線
- 手寫風格的標注效果

**Interaction Philosophy**: 卡片翻轉模擬實體字卡，有翻頁音效選項，精緻的 hover 光暈效果。

**Animation**: 卡片 3D 翻轉（perspective 1000px），頁面切換用 slide，正確答案有金色光暈。

**Typography System**: Lora（標題，有學術感）+ Noto Sans（正文，支援特殊字符），搭配 Playfair Display 用於大標題。
</text>
<probability>0.09</probability>
</response>

## 選定方案：方案三 — 學術典雅風格

選擇理由：學習語言需要長時間專注，深色學術風格既護眼又有沉浸感。紙質卡片的視覺隱喻與「背單詞」的概念完美契合，金色強調色傳遞丹麥文化的高貴感。
