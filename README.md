# [星空漫遊 Cosmic Voyage](https://chat-room.robbieliu.com/)
**一個參考自 yahoo 即時通的即時通訊平台**
![index-overview](https://github.com/Robbie84625/chat-room/blob/develop/static/images/README/%E6%93%B7%E5%8F%96.PNG?raw=true)
## 技術概述
#### 前端
- HTML
- CSS
- JavaScript
- AJAX
#### 後端
- 使用 Node.js(Express) 框架
- 即時傳輸使用 Socket.IO 實現
- AWS 雲端服務 
  - EC2：使用EC2實例運行應用程式
  - S3：用於存儲和檢索應用程式中使用的圖片、影片和 GIF 檔案
  - RDS (MySQL)：作為資料庫
  - CloudFront：加快全球用戶的訪問速度
- Docker 部屬
- 網頁設計遵循 MVC 架構
- 使用 JSON Web Token(JWT) 進行身分驗證，存到 localstorage 當中
- RESTful APIs 串聯前端與後端
- Nginx 進行反向代理並配置SSL證書
## 專案主功能
#### 一對一聊天
![send message and ring](https://github.com/Robbie84625/chat-room/blob/develop/static/images/README/snedMessage_and_ring.gif?raw=true)
#### 群組聊天
![send message to group and ring](https://github.com/Robbie84625/chat-room/blob/develop/static/images/README/sendMessageToGroup_and_ring.gif)
## 附加功能
#### 更改個人檔案
![Change profile](https://github.com/Robbie84625/chat-room/blob/develop/static/images/README/edit_member_data.gif?raw=true)
## 架構圖
![Architecture diagram](https://github.com/Robbie84625/chat-room/blob/develop/static/images/README/%E5%B0%88%E6%A1%88%E6%9E%B6%E6%A7%8B%E5%9C%96.png?raw=true)
