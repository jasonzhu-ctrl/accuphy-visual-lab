# 给英杰：网站嵌入版（免费版）在哪、怎么看（Lab HQ，2026-11-06）

Jason 11-06："嵌入版分享给英杰"（给代码，走 GitHub）。

## 仓库

- GitHub：**accuphy-marketing/accuphy-visual-lab**（公司组织的那一份；jasonzhu-ctrl 下面有一份一样的）。
- 用 ChatGPT 读代码：在 ChatGPT 的 GitHub 连接器里，授权组织 `accuphy-marketing`，选 “Only select repositories”，勾 `accuphy-visual-lab`。要组织管理员批，就批一下。

## 网站嵌入版是哪一份

Lab 有三份代码，互不覆盖（决定 #233）：

| 版本 | 文件夹 | 线上 |
|---|---|---|
| Base（本体，无锁） | `src/experiments/2026-09-23-sonar-lake-3d/` | 只在测试链接 |
| **网站嵌入版（免费版，无锁）** | **`src/experiments/2026-11-03-sonar-lake-web/`** | 店铺每个市场的 `/pages/lab`，框里是 lab.accuphy.ca/、/mini/、/ice/ |
| 带锁版 MKT | `src/experiments/2026-11-03-sonar-lake-bf/` | 店铺 `/pages/sonarlab-mktbf2026`，框里是 lab.accuphy.ca/mktbf2026/ |

- 线上的免费版现在还是 **96fdc22** 那次打的包（只有英文、法文）。嵌入版文件夹里已经放进了五种语言等改动（到 ee7b8d0），**还没上线**。
- 改动记录：`docs/2026-11-03-web-embed-checklist.md`；各版本链接：`docs/lab-links-sheet.md`；版本历史：`docs/versions.md`。

## 本机跑起来

1. 装 Node.js（LTS），在仓库里先运行一次 `npm install`，再运行 `npm run dev`。
2. 打开 http://localhost:5173/#2026-11-03-sonar-lake-web 看嵌入版。
3. 打包和线上一样的页面：`LAB_ENTRY=web npx vite build --config vite.share.config.js`。

## 规矩（决定 #176、#183）

- 在**自己的分支**上改，开 pull request，Jason 看过才合进 main。
- 湖的场景可以优化，也可以挑场景和声纳画面拍视频；**声纳成像引擎和它的逻辑不能动**（`sonarShader.js`、`SonarScreen.jsx`、range/depth 那部分）。
- 店铺页（shop.accuphy.com）不归这个仓库，Lab 代码也不放进 Shopify。客人和广告只拿店铺链接，不给 lab.accuphy.ca 的地址（#232）。
- 上线 lab.accuphy.ca 要 Jason 在 Lab HQ 说“动”。

## 主线保护（2026-11-06，Jason 同意）

GitHub 上 accuphy-marketing/accuphy-visual-lab 的 `main` 加了规则 “protect main”：
- 改 main 必须开 pull request，要 1 个批准；不能删 main，也不能强推。
- 组织管理员（Jason）可以直接推，所以 Lab 各窗口用 Jason 的账号推照常。
- ChatGPT Codex Connector：英杰申请了，要装就只装在这一个仓库上；11-06 还在等 Jason 点批准。
