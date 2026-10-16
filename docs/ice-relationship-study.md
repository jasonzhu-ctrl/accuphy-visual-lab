# 冰和水的关系：底层逻辑、别人的做法、我们的三条路（2026-10-16 晚）

Jason 看了黑冰版四版（决策 #95–#99）都说"水里的部分和冰的关系很奇怪"，并要求："多到网上找类似关系或者可以平移过来
策略的案例啥的 把底层思考逻辑过一遍"。这份就是那次思考。先给 Jason 的中文版，后面是给下一个 chat 的英文技术笔记。

## 一、我们到底要让人一眼读出什么

一张静止的画面要同时交代三件事：

1. 最上面是一层**固体的冰**（不是水面、不是雾）。
2. 冰下面是**有深度的水**（一个湖，不是黑幕）。
3. **波束从吊在冰下面的设备出发，向下在水里展开**，照亮它碰到的东西。

三件事缺一件，画面就"奇怪"。

## 二、人眼在一张静止画面里靠什么判断"谁在谁下面"

视觉科学和图形学的结论（出处见文末）：

- **遮挡**：近的东西挡住远的东西，是最强的层次线索。半透明 + 部分遮挡的深度判断效果不输立体视觉（Zhai、Buxton、Milgram 1996）。
- **接触阴影**：放在面上的东西要有一小块接触的暗影，否则它"浮"着，那个面也就不成立。
- **剖切面 / 边缘**：一层东西有可见的边或切口（厚度），眼睛立刻知道它是"一层"。
- **透视和大小**：下面的东西按距离变小、被上面的东西遮住。
- **雾化**：越深越被水染色、越暗，给出"深"。
- **透明表面本身几乎不带信息**：完全透明的面只有**高光、反射、折射和轮廓线**能告诉你它在哪里（Fleming 等，MIT）；在透明面上加**稀疏的不透明纹理**，既保住视线又能表达层次（Interrante 等 1996/97）。
- **运动视差**：只有动起来才有；静帧没有。

## 三、我们的画面为什么读不出来（逐条对照夏天版）

夏天版成立，是因为它恰好有全套线索：水面有波浪和闪烁高光（表面在哪）；船压着白沫（接触）；湖底的树桩、石头、鱼按透视
排开（深度）；水按深度把湖底染成青色（雾化）；波束在这些东西上面点亮一块（它在水里）。

冰版把这些一件件拿掉了：

| 线索 | 夏天版 | 冰版现状 |
|---|---|---|
| 表面在哪 | 波浪 + 闪烁高光 | 一层暗玻璃，没有锐利的高光和边缘 |
| 接触 | 船 + 白沫 | 帐篷、雪橇、水桶都没有接触阴影，像浮着 |
| 深度参照 | 湖底结构清楚、按深度染色 | 湖底被压黑（#99），下面成了黑幕 |
| 遮挡 | 水面本身半透明 | 雪块在波束上方被挖掉（#98）——恰恰删掉了最强的线索 |
| 投影歧义 | 船在水面上，锥体从船下来 | 40° 俯视下，锥体底部投影落在**比洞更靠近镜头**的冰面上，大脑最省力的解释是"冰面上画了个三角形" |

所以不是参数没调好，是这个取景（俯视 + 透明面）本身只剩下最弱的一组线索。

## 四、别人怎么表达"透过一层看下面"

1. **冰下摄影**（案例 1，`uwphotographyguide.com/diving-under-the-ice`）：镜头在冰下面。冰是发亮的天花板（黑冰处透光亮、
   有雪处暗），洞口是一束光柱直射下去、照亮湖底的沉船。物理上这和我们的"波束照亮湖底"是同一个画面。
2. **半上半下**（案例 2，Alamy 的冰洞潜水照）：镜头贴着分界面，上面一半是冰面和天空，下面一半是水，分界线本身就是答案。
3. **行业惯例：侧剖面示意图**（Vexilar、Humminbird、MarCum 讲锥角时都这么画）：冰是一条有厚度的带子，人坐在上面，
   设备吊在带子下面，锥体向下张开，鱼在锥体里。建筑剖面把剖切面涂黑，是同一个逻辑。
4. **测绘声纳的可视化**（Hypack、Norbit 等）：水面画成**有轮廓线的半透明平面**，船在平面上，波束是有边线的半透明实体，
   覆盖范围再在底面上画一圈。要点是：平面有线、波束有边、覆盖另画。
5. **产品爆炸图**（Apple 风格）：层与层之间拉开空隙，关系靠"分开"来讲。
6. **游戏**：Subnautica: Below Zero 的冰下场景（冰是天花板，洞口透光）；模拟人生的切墙、Fallout Shelter 的剖面（剖切）。

## 五、可以平移过来的三条路

**A. 冰下视角（我推荐）**
相机放到冰下面 3–4 米，带一点侧下方的 3/4 角度。冰变成**不透明的发亮天花板**（黑冰处亮、雪块处暗、裂纹透光），
洞口是一个亮盘加一束光柱，Mini 吊下来，锥体从它向下展开，鱼群游进来；湖底、结构、鱼都是现成的夏天世界。
换洞 = 头顶传来冰钻钻穿的动画、冰屑落下、光射进来、Mini 放下。
- 好处：物理上没有任何歧义，不需要"透明冰"这种本来就弱的技巧；画面最震撼；正好是冰钓买家想看的"看鱼进洞"。
- 代价：看不到冰面上的营地（帐篷、雪橇）；Forward 远处的覆盖会被透视压缩，用侧下方角度缓解。

**B. 侧剖面 / 半上半下**
相机降到接近冰面高度，把靠镜头的一半湖切掉：露出冰层的剖切面（一条有厚度的淡蓝带）和下面的水柱；上面是营地和天空，
下面是锥体和湖底。
- 好处：业界通用、绝对清楚，上下两个世界都在。
- 代价：风格从"照片"变成"示意图 / 模型"。

**C. 保持俯视透明，把线索全补回来**
不透明的雪块允许**部分遮挡**锥体（不再挖缺口）；所有道具加接触阴影；冰面加锐利的太阳 / 晚霞镜面高光；湖底恢复可见并按
深度染色；锥体做成带悬浮颗粒的"光柱"；洞口的冰壁厚度（已有）。
- 好处：改动最小，延续现在的风格。
- 风险：这就是我已经试了四版的方向；即使线索全补齐，俯视透明面仍是三种里最弱的表达。

推荐顺序：**A > B > C**。选 A 我会先做一个最小版本（相机 + 冰顶 + 洞口光柱 + 现有水下世界）给你看，再决定细节。

## 参考

- Diving Under the Ice — Underwater Photography Guide（冰下光柱照片）: https://www.uwphotographyguide.com/diving-under-the-ice/
- Diver looking into an ice hole, split level（Alamy，只看不用）: https://www.alamy.com/stock-photo-diver-looking-into-an-ice-hole-subglacial-diving-ice-diving-in-the-48082253.html
- NOAA Arctic 2005: ice diver's view of the underside of the ice / shooting up through the hole: https://noaa.gov/media/63945
- Zhai, Buxton, Milgram (1996) The partial-occlusion effect: utilizing semitransparency in 3D: https://www.dgp.toronto.edu/OTP/papers/bill.buxton/silk.html
- Interrante, Fuchs, Pizer (1996/97) Conveying the 3D shape of transparent surfaces via texture: https://www-users.cse.umn.edu/~interran/papers/tvcg97.pdf
- Fleming et al., shape and depth from transparent surfaces (MIT SIGGRAPH course notes): https://people.csail.mit.edu/fredo/SIG02_ArtScience/shapeAndDepth.pdf
- Kanizsa / Frontiers 2012: transparency and occlusion share the same perceptual machinery: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2012.00351/full
- HYSWEEP brochure (3D seafloor + beam pattern + coverage map drawn separately): https://www.uniquegroup.com/wp-content/uploads/2022/10/HYSWEEP-Brochure.pdf
- MarCum, The Beginner's Guide to using an Ice Fishing Sonar (the cone forms at the transducer and fans out; drop the ducer just below the ice): https://marcumtech.com/the-beginners-guide-to-using-an-ice-fishing-sonar/

---

## English notes for the next chat

**Why the aerial transparent-ice view fails.** A single frame has to establish (1) a solid sheet on top, (2) deep water under
it, (3) a beam from a device hanging under the sheet. The cues a still image offers are occlusion, contact shadows, visible
edges/cut faces, perspective, depth fog, consistent lighting and familiar objects. Transparent surfaces carry almost no
shape information of their own (only highlights, reflections, refraction, contours); sparse opaque texture on them and
partial occlusion are what convey layering. The summer lake has the full set (waves, the boat's foam, visible terrain,
depth-tinted water). The ice versions removed them one by one: no crisp surface highlight, no contact shadows under the
camp, the lakebed darkened to black (#99), the snow thinned over the beam (#98) — deleting the occlusion cue — and, from a
40° aerial camera, the cone's base projects onto ice nearer the camera than the hole, so the cheapest reading is "a
triangle painted on the surface".

**Transferable idioms seen in the wild.** Under-ice photography (the sheet as a lit ceiling, the hole as a light shaft to
the bottom — the exact analogue of our beam); split-level (over/under) shots at the ice hole; the industry's side
cross-section diagrams for ice sonar cone angles (ice as a band with thickness); survey-sonar visualizations (water as an
outlined translucent plane, the beam as an edged solid, coverage drawn separately on the floor); exploded views; game
cutaways (Subnautica Below Zero's under-ice, The Sims' cut walls).

**Options.** A — camera under the ice (recommended): the sheet becomes an opaque lit ceiling (bright where black ice,
dark under snow), the hole a bright disc with a light shaft, the Mini hanging, the cone below, fish arriving; hole-hopping
= the auger breaks through overhead. Loses the camp above; Forward's far reach is foreshortened (use a 3/4 under-ice
angle). B — side cross-section / over-under: camera near ice level, the near half cut away, the slab's cut face visible;
clearest, more diagrammatic. C — keep the aerial transparent view and restore every cue (opaque snow may cross the cone,
contact shadows, sharp specular, visible depth-tinted lakebed, a volumetric cone with particles): smallest change,
weakest idiom, already tried four times.

**Status:** nothing built for A/B/C yet; waiting for Jason's choice. The current default page is #99 (black ice, aerial).
