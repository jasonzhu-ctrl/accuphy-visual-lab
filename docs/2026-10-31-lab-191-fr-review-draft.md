# 草稿：#191 定稿英文，请网站核法文（营销和外部系统对接，2026-10-31）

Lab HQ 转发用。转进 `accuphy-website/handoffs/2026-10-30-lab-subscribe-unlock.md` 第 2 条，或另开一张交接单，由 HQ 定。
英文以 `src/experiments/2026-09-23-sonar-lake-3d/i18n.js`（main a2cad89）为准，这里抄出来。法文一栏是 Lab 的草稿，请改，不用照着它改。

---

状态：TODO
From：accuphy-visual-lab HQ   To：accuphy-website HQ   创建：2026-10-31   期限：#191 上线前（11-02 之前最好）

背景：#191 订阅解锁（Live Combo 等视图模糊带锁，填邮箱订阅后打开）。英文已定稿，下面这些字的法文还是 Lab 的草稿。
任务：核每一行的法文。用词按 `docs/glossary.csv`，语气和店铺 /fr 一致。可以直接改“法文草稿”那一栏，或者另写一栏“定稿”。
不要做：英文不改；同意文字的意思不改（见 B 组说明）。

`{view}` 是视图名（Live Combo、Live Panoramic、Ice Fishing、Live Ice Fishing），法文按 i18n 里已核过的格子名代入，比如 “Combinée en direct”。`{device}` 是 PingLive 或 PingLive Mini，不翻译。

## A 组：可以直接核

| 键 | 出现在哪 | 英文（定稿） | 法文草稿 |
|---|---|---|---|
| s1_title | 第 1 步标题 | The {device} sonar beam | Le faisceau du sonar {device} |
| s1_text | 第 1 步正文 | Drag the boat — anything inside the beam appears on your phone. | Faites glisser le bateau : tout ce qui entre dans le faisceau apparaît sur votre téléphone. |
| s2_text | 第 2 步正文 | This is what {device} sees, live on your phone in the Accuphy Sonar app: the bottom, timber and fish. | Voici ce que voit le {device}, en direct sur votre téléphone dans l’application Accuphy Sonar : le fond, les arbres immergés et les poissons. |
| s3_text_locked | Mini 第 3 步，没订阅时 | Forward to cast at fish ahead; Down to fish straight below. Combo shows both side by side: subscribe to unlock it. | La vue avant pour lancer sur les poissons devant vous, la vue vers le bas pour pêcher à la verticale. La vue combinée montre les deux côte à côte : abonnez-vous pour la débloquer. |
| not_available | 冰钓页的 Live Panoramic 提示 | Not available in this simulation yet. | Pas encore disponible dans cette simulation. |
| na_moving | Down Scan / Chirp 的提示 | {view} needs the boat moving slowly, so it isn’t available in this simulation yet. | {view} exige que le bateau avance lentement : cette vue n’est donc pas encore disponible dans cette simulation. |
| unlock_title | 卡片标题 | Unlock {view} | Débloquez : {view} |
| unlock_locked | 锁住的按钮（读屏用） | {view}, locked: subscribe to unlock | {view}, verrouillée : abonnez-vous pour débloquer |
| unlock_text | 卡片正文 | Subscribe with your email first, and {view} opens right away. | Abonnez-vous d’abord avec votre courriel, et {view} s’ouvre aussitôt. |
| unlock_email | 输入框标签 | Email | Courriel |
| unlock_cta | 按钮 | Subscribe and unlock | M’abonner et débloquer |
| unlock_sending | 按钮，发送中 | Subscribing… | Abonnement en cours… |
| unlock_privacy | 隐私链接 | Privacy Policy | Politique de confidentialité |
| unlock_err_email | 错误：邮箱不对 | Please enter a valid email address. | Veuillez entrer une adresse courriel valide. |
| unlock_err_send | 错误：发送失败 | Something went wrong. Please try again. | Une erreur est survenue. Veuillez réessayer. |
| unlock_err_closed | 错误：订阅还没开 | Subscribing isn’t open yet. Please try again later. | L’abonnement n’est pas encore ouvert. Veuillez réessayer plus tard. |
| back_to_lake | 冰钓页左上，从湖过来时 | Back to the lake（前面的 ← 是图标） | Retour au lac |

注意：
- `{view}` 代进去以后，有的法文要配阴阳性，比如 “verrouillée”“débloquée”跟 “vue”。代入 “Pêche sur glace”这种名字时，请看是否还通顺；不通顺就告诉 Lab 换写法。
- `s2_text` 里 “le {device}”：代入 PingLive Mini 是 “le PingLive Mini”。

## B 组：英文还在等 Jason，先看，定了再核

| 键 | 出现在哪 | 英文（Klaviyo HQ 草稿，Jason 没看过） | 法文草稿 |
|---|---|---|---|
| unlock_consent | 按钮下的同意小字 | By subscribing, you agree to receive marketing emails from Accuphy Trading Ltd. about sonar tips, products and offers. Unsubscribe anytime. | En vous abonnant, vous acceptez de recevoir des courriels de marketing d’Accuphy Trading Ltd. sur des conseils sonar, des produits et des offres. Désabonnement possible à tout moment. |
| unlock_done | 订阅成功（显示约 1.5 秒） | You’re in. {view} is unlocked. | C’est fait. {view} est débloquée. |

同意文字要和 Klaviyo 的同意设置对得上，意思不能改。只改法文措辞；要改意思，先告诉 Lab HQ。

## 不在这张单里

- 分享预览卡那句（`share_title` / `share_line`）：等 Jason 从两句英文里选，选完另发。
- 卡片上 “Test mode: nothing is sent.”：只在测试链接上出现，访客看不到，不翻译。

完成标准：每行都有定稿法文，回 Lab HQ。Lab 照着改 `i18n.js`，然后去掉“待核”标记。
证据：
结果：
