# NileCart — معمل التدريب على GTM / Pixel / GA4

موقع تجريبي حقيقي (مش Demo Data)، Homepage → Product → Cart → Checkout → Purchase، جاهز إنك تركب عليه GTM حقيقي وتشغّل Events حقيقية.

## 1. إزاي تستضيفه (مجانًا، من غير Domain ولا حساب دفع)

أسهل طريقة: **Netlify Drop**
1. روح https://app.netlify.com/drop
2. اسحب الفولدر (nilecart-lab) كله وارميه في الصفحة
3. هيديك رابط شغال فورًا (زي `https://random-name.netlify.app`)

ده أهم من إنك تفتح الملفات locally (file://) لأن GTM Preview Mode وبعض الـ Pixels بتشتغل صح بس على رابط حقيقي (http/https) مش على ملف من جهازك.

## 2. إزاي تركب GTM

1. اعمل حساب على tagmanager.google.com واعمل Container جديد (Web)
2. هياخدلك كود جزئين: واحد لـ `<head>` وواحد لـ `<body>`
3. افتح كل ملف HTML (index, product, cart, checkout, thank-you) هتلاقي فيهم تعليقات مكتوب فيها بالظبط فين تحط كل جزء:
   - `GTM STEP 1` جوه `<head>`
   - `GTM STEP 2` بعد `<body>` مباشرة
4. ارفع الملفات تاني على Netlify (أو اعمل Deploy جديد)

## 3. الأحداث (Events) الموجودة في الموقع

الموقع بيعمل `dataLayer.push()` في 4 لحظات، وده بالظبط اللي GTM هيسمعه:

| الصفحة | الـ Event | بيحصل إمتى |
|---|---|---|
| product.html | `view_item` | أول ما صفحة المنتج تفتح |
| product.html | `add_to_cart` | لما تدوس "Add to cart" |
| cart.html | `view_cart` | أول ما صفحة الكارت تفتح (لو فيها حاجة) |
| checkout.html | `begin_checkout` | أول ما صفحة الـ Checkout تفتح |
| checkout.html → thank-you.html | `purchase` | لما تدوس "Place order" — قبل التحويل لصفحة الشكر |

كل event شكله متسق مع GA4 Ecommerce standard (`ecommerce.items[]`, `currency`, `value`) — يعني لو ربطته بـ GA4 Tag في GTM، الـ Ecommerce reports هتشتغل صح من غير تعديل.

## 4. لوحة الـ Debug اللي تحت كل صفحة

فيه شريط أسود تحت كل صفحة اسمه "Data Layer Log" — بيوريك كل push بيحصل لحظة بلحظة. ده تدريب بس، مش جزء من موقع حقيقي. الهدف إنك تتأكد إن الكود شغال صح قبل ما تدخل GTM في الصورة، عشان متبقاش بتصحّح مشكلتين (الكود + GTM) في نفس الوقت.

بعد ما GTM يشتغل صح، استخدم أدوات حقيقية بدل اللوحة دي:
- **GTM Preview Mode** (Tag Assistant) — عشان تشوف الـ Tags اتفعلت ولا لأ
- **GA4 DebugView** — عشان تشوف الـ Events وصلت لـ GA4 صح
- **Meta Pixel Helper** (Chrome extension) — عشان الـ Pixel

## 5. تجربة UTM

الموقع بيلقط أي `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `utm_term` في الرابط ويحتفظ بيها طول الـ Session، وهتظهر في صفحة "Thank you" تحت "Campaign context captured this session".

جرب مثلًا:
`https://your-site.netlify.app/?utm_source=meta&utm_medium=paid_social&utm_campaign=summer_test`

وكمّل الشراء، وشوف الـ UTM ظهرت في الآخر ولا لأ.

## 6. الترتيب المقترح للتمرين عليه

1. افتح الموقع locally الأول وشوف الـ Debug Panel بيسجل الـ Events صح
2. ارفعه Netlify
3. ركب GTM بس من غير أي Tag لسه — تأكد الـ Container بيشتغل (Preview Mode شغال)
4. اعمل Tag واحد بس: GA4 Configuration Tag على كل الصفحات
5. اعمل Trigger مبني على Custom Event `purchase` وابني عليه GA4 Tag يبعت الـ Ecommerce data
6. كرر نفس الفكرة لباقي الـ Events (view_item, add_to_cart, begin_checkout)
7. لما ده يظبط، ابدأ Meta Pixel بنفس الطريقة
