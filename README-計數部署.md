# 遊戲累計次數與排序（待上線）

這批修改為待審草稿，尚未合併到正式分支或部署。前端、SQLite儲存層與隔離WSGI API已完成；公開HTTPS計數API尚未部署。

## 計數定義
- AI出氣拳：按開始真正轉入遊戲時記一局。刷新/選形象本身不記；重新開始才記。
- HDMI：新遊戲或三關完畢後再玩一次記一局，下一關不記。
- 子遊戲唯一送POST。入口卡片、嵌入父頁只讀總數，不重複上報。
- 每局隨機UUID4去重。不是獨立玩家數，不能防止有意偽造新UUID刷數。
- 無API時顯示尚未啟用，失敗不顯示假0；不阻斷遊戲。

## UI
每個遊戲卡片左上、遊戲頁左上顯示次數。下拉選單：發布日期新到舊／遊玩次數多到少。使用CSS order避免排序搬動iframe造成遊戲重載。
原始發布日期尚未核實；目前保留原順序，不能用提交日冒充。需要核定日期後填入index內dates對照。

## 待部署API合約
GET /counts -> {"counts":{"hdmi":number,"aii":number}}
POST /plays JSON {"gameId":"aii","eventId":"UUID4"} -> 相同counts格式
只接受已知遊戲ID、有效UUID4；伺服器原子累加。跨遊戲重用同event拒絕。
backend/count_store.py提供持久化儲存層，backend/app.py提供WSGI API；需受控啟動後才提供服務。
正式服務應加request大小限制、rate limiting、HTTPS、只允許指定Origin的CORS，且不暴露其他私人API。CORS不是防偽造/認證。
不含金鑰；不得把管理憑證放公開JavaScript。資料庫僅counts與隨機事件，不存IP或個人profile。基礎設施存取日誌另需檢查其保留政策。
未部署前game-stats-config.js endpoint保持空字串。

## 已測
node語法檢查通過。test_stats.cjs 10項通過，SQLite與WSGI API共13項通過（重送、並行、錯誤ID、持久化）。
瀏覽器測試檔test_ui.cjs已準備，但本環境無頭Chromium啟動因socket Operation not permitted失敗；不能列為已通過視覺測試。
