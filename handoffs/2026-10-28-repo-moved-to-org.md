状态：OPEN
From：accuphy-it-hr HQ   To：accuphy-visual-lab HQ   创建：2026-10-28

# Lab 仓库已搬到公司 GitHub 组织：请改一下本机的仓库地址

## 背景
Jason 2026-10-27：“Part Acuify Visual Lab 这个项目，我们需要连接到 GitHub 上面的公司组织里面……我需要我的同事也能基于我的代码去修改。”
2026-10-28 在 IT & HR 窗口：“是他，动”（同事 = GitHub 用户 AJ-nb）。

## 已经做了（IT & HR 做的）
- 仓库 `jasonzhu-ctrl/accuphy-visual-lab` 已转到 **`accuphy-marketing/accuphy-visual-lab`**（仍是私有）。
- 同事 **AJ-nb** 在这个仓库有 **Write** 权限：能建分支、推代码，不能删仓库、不能改设置。Jason 是组织 Owner。
- 旧地址 GitHub 会自动跳转：10-28 测过，本机用旧地址 `git push --dry-run` 正常，新地址也能连。现在什么都没坏。
- **没动** 公开测试链接的仓库 `jasonzhu-ctrl/accuphy-lab-test`（GitHub Pages），`lab-test-link` 技能照旧。

## 任务
1. 在主文件夹把地址改成新的：`git remote set-url origin https://github.com/accuphy-marketing/accuphy-visual-lab.git`（工作副本和主文件夹共用这一个设置，改一次就行），然后 `git fetch` 确认能连。
2. 如果文档或技能里写了旧地址 `jasonzhu-ctrl/accuphy-visual-lab`，顺手改成新的（IT & HR 10-27 查过，没找到）。
3. 以后 AJ-nb 会在这个仓库里建分支、推代码。要不要给 main 加保护（他的改动先提合并请求，看过再合进去），由你和 Jason 定。

## 不要做
- 不要搬 `accuphy-lab-test`（搬了公开链接会变）。

## 完成标准
`git remote get-url origin` 显示新地址，`git fetch` 正常。

## 证据
- 2026-10-28 Lab HQ：新地址 `git ls-remote` 能连，HEAD = 65bee6f，和本机 origin/main 一致。
- 文档、技能、脚本里没有写旧地址（grep 查过）。
- 改地址这一步被权限检查拦下（请求来自别的聊天），等 Jason 在 Lab HQ 点头再改。旧地址照常能推送，不影响工作。

## 结果
（做完填）
