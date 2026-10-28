本目录的图片用于比较界面布局，不用于证明鱼群、命中或回波逐像素一致。最终截图来自真实 source-before/source-after release 构建，使用真实时钟，没有 QA 参数或 QA 钩子。鱼、波浪和模拟时刻彼此独立；严格模型一致性证据另见 lockstep-grid。

可移植的机器证据摘要见 [validation-summary.json](validation-summary.json)，核心保留文件清单及规范化 hash 见 [core-files-final.json](core-files-final.json)。完整采样边界见 [优化报告](../lab-optimization-report.md)。

桌面两版实际视口及截图均为 1440×900。手机请求视口为 390×844，本次实际 innerHeight 与截图像素均为 845，两版一致。合图只等比缩小并添加 BEFORE / AFTER 标签，完整保留画面，不裁切或修改页面内容。桌面每幅缩为 1080×675，手机每幅为 360×780。

拍摄条件、页面 URL、DOM 读数与图片加载状态见 [layout-comparison-final.json](/D:/shopify/output/accuphy-baseline/layout-comparison-final.json)。两版桌面面板入场动画均已完成（opacity=1）；所有截图中加载遮罩已移除，品牌图和 Home 缩略图 complete=true 且 naturalWidth>0。

| 配对 | 船位与取景条件 | 产品 / 模式 | Range / Gain | 拍摄时的深度读数 |
|---|---|---|---|---|
| 桌面 | URL显式请求 boat=-6,4 | PL / Forward | 80 ft / 40% | 等待 AUTO 45 ft 稳定后拍摄 |
| 手机 ACTIVE | 无URL覆盖，默认 PHONE_START [16,11]、frameX=15 | PL / Forward | 80 ft / 40% | 选择模式后等待 AUTO 25 ft 可见再拍摄 |
| 手机 HOME | 无URL覆盖，默认 PHONE_START [16,11]、frameX=15 | 首次 Home 选模式入口 | 后方默认 80 ft / 40% | 遮罩移除后立即拍入口；背景 DOM 均为 AUTO 70 ft |

手机使用默认取景，避免显式 boat 参数改变原有 frameX 分支。HOME 截图没有等候后方场景 AUTO 收敛到 25 ft；它比较的是首次入口，不能与 ACTIVE 的稳定读数混称。生产构建没有导出逐帧内部状态，因此不要据这些图推断固定种子、相同鱼位或像素级回波一致。

源截图目录：D:/shopify/output/accuphy-baseline。源条件记录 SHA-256：`184ca077c9656e1f5aa10c41ea296b9811e10e7044639597f7b9303aec9fc20e`。

| 源文件 | 文件像素 | SHA-256 |
|---|---:|---|
| desktop-before-final.jpg | 1440×900 | `858d5cae9f411c322ff8594d28162cc9f6a355ac716b8cfc6cc7aa23e4bc6910` |
| desktop-after-final.jpg | 1440×900 | `968c89a5a716098059aa5d95f0be8b17b6d9c4306bd24d1bd14554e976edf9e4` |
| mobile-home-before-final.jpg | 390×845 | `30e27ed54b1c5e3229a7d35b86ba51e39706d71287e4a649cdb6e12831016e70` |
| mobile-home-after-final.jpg | 390×845 | `290b0dd845d6525e60c8db876d7d6be7a9c61821852431f71c12c00985768ba5` |
| mobile-active-before-final.jpg | 390×845 | `cec22f78a102cb935628d2424a42b3f599351a0d4e9d6ba17a2159fb04023e24` |
| mobile-active-after-final.jpg | 390×845 | `adb5fdf234c34cbf227b69b3557a42d7d3f0448ac980396fb13026c09e431feb` |

| 合图 | 文件像素 | SHA-256 |
|---|---:|---|
| [desktop-before-after.jpg](desktop-before-after.jpg) | 2216×773 | `21ab0bc9d6fa3467efea571d72d1f3988fd86dd4e78df9129a400c844690011e` |
| [mobile-before-after.jpg](mobile-before-after.jpg) | 1528×878 | `5b834ee570910b52083642374daaa9d80c877d29e788612a4c0b35a275614add` |

本组 release 截图替换了先前不适合公平布局对照的 QA 图。旧 QA 的 Tailwind 候选收集范围和静态资源根路径不用于判断正式布局。
