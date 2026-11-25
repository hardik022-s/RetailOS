/* ==========================================================================
   RetailOS - Language Switcher (English <-> Hindi)
   --------------------------------------------------------------------------
   - Non-invasive: existing UI/UX, styles, and files remain completely untouched.
   - Adds a clean toggle button in the active header (Intro, Upload, Dashboard).
   - Remembers user choice in localStorage ("retailos-lang").
   - Translates all UI text, placeholders, aria-labels, toasts, modals,
     Chart.js labels/tooltips, printed receipts, and AI chat responses.
   ========================================================================== */

(function () {
  'use strict';

  var KEY = 'retailos-lang';
  var LANG = 'en';
  try {
    LANG = localStorage.getItem(KEY) === 'hi' ? 'hi' : 'en';
  } catch (e) {
    /* ignore */
  }
  var isHi = function () {
    return LANG === 'hi';
  };

  /* ------------------------------------------------------------------------
     1. EXACT TRANSLATIONS (English -> Hindi)
     ------------------------------------------------------------------------ */
  var DICT = {
    /* ---- Intro page ---- */
    'What if your shelves restocked themselves… before you opened?': 'क्या हो अगर आपकी शेल्फ़ें दुकान खुलने से पहले ही खुद भर जाएँ?',
    'Problem': 'समस्या',
    'Solution': 'समाधान',
    'Modules': 'मॉड्यूल',
    'Workflow': 'काम करने का तरीका',
    'Technology': 'तकनीक',
    'About us': 'हमारे बारे में',
    'Login': 'लॉगिन',
    'Retail intelligence': 'रिटेल इंटेलिजेंस',
    'Built for retailers who are done with guesswork': 'आधुनिक और आसान दुकानदारी के लिए बना प्लेटफ़ॉर्म',
    'A comprehensive billing, automated inventory, and predictive restocking platform for small-to-mid-sized retailers, engineered to optimise profit margins and reduce waste.':
      'छोटे और मध्यम दुकानदारों के लिए बिलिंग, ऑटोमैटिक इन्वेंटरी और अनुमान-आधारित रीस्टॉकिंग का पूरा प्लेटफ़ॉर्म, जो मुनाफ़ा बढ़ाने और माल को एक्सपायर होने से बचाने के लिए बना है।',
    'Smart POS billing': 'स्मार्ट POS बिलिंग',
    'Demand forecasting': 'आगे की मांग का हिसाब',
    'AI assistant': 'AI सहायक',
    "Today's restock tasks": 'आज के रीस्टॉक काम',
    '1 of 4 approved': '4 में से 1 मंज़ूर',
    'Approve PO: White Eggs × 12 crates': 'ऑर्डर मंज़ूर करें: सफ़ेद अंडे × 12 क्रेट',
    'Reorder Amul Milk × 45 pkts': 'अमूल दूध दोबारा मँगाएँ × 45 पैकेट',
    'Discount Masti Dahi before expiry': 'एक्सपायरी से पहले मस्ती दही पर छूट दें',
    'Log tomato wastage': 'बचे टमाटर का हिसाब लिखें',
    '/ask': '/पूछें',
    'How much milk is left?': 'कितना दूध बचा है?',
    'Sales by category': 'श्रेणी के अनुसार बिक्री',
    'Dairy': 'डेयरी',
    'Produce': 'सब्ज़ी-फल',
    'Amul Taaza Milk — expiring': 'अमूल ताज़ा दूध — जल्द एक्सपायर',
    'Stock left': 'बचा स्टॉक',
    'Run-out': 'खत्म होने का समय',
    'Today, 5:30 PM': 'आज, शाम 5:30',
    'Approve PO (45 pkts)': 'ऑर्डर मंज़ूर करें (45 पैकेट)',
    'Retailers using RetailOS': 'RetailOS इस्तेमाल करने वाले दुकानदार',
    'Designed for margins, shelves, and speed': 'मुनाफ़े, शेल्फ़ और रफ़्तार के लिए बना',
    'Retailers lose money every day to three problems that enterprise software never solved for the corner store.':
      'दुकानदार हर दिन तीन ऐसी समस्याओं से नुकसान उठाते हैं, जिन्हें बड़े सॉफ़्टवेयर ने मोहल्ले की दुकान के लिए कभी हल नहीं किया।',
    'Intuition-based restocking': 'अंदाज़े पर आधारित रीस्टॉकिंग',
    'Reliance on guesswork for stock ordering leads to spoilage on slow days and stockouts on busy ones.':
      'केवल अनुमान से स्टॉक मँगाने पर कभी सामान बच जाता है और कभी व्यस्त दिनों में कम पड़ जाता है।',
    'Manual data entry & disconnected billing': 'हाथ से डेटा एंट्री और अलग-थलग बिलिंग',
    'Inefficient billing processes with no link between the counter and any predictive tools.':
      'धीमी बिलिंग प्रक्रिया, जिसमें काउंटर और किसी भी अनुमान-टूल के बीच कोई कड़ी नहीं है।',
    'Inaccessible analytics': 'पहुँच से बाहर एनालिटिक्स',
    'The cost and complexity of enterprise tools keep actionable insights away from small shops.':
      'बड़े टूल की कीमत और जटिलता के कारण काम की जानकारी छोटी दुकानों तक नहीं पहुँच पाती।',
    'Fresh vegetables and produce': 'ताज़ी सब्ज़ियाँ और फल',
    'Proposed solution': 'हमारा समाधान',
    'A closed-loop AI retail ecosystem': 'एक पूरी तरह जुड़ा AI रिटेल सिस्टम',
    'POS billing, machine-learning demand forecasting and a conversational assistant, working together so data capture and restocking decisions happen on their own.':
      'POS बिलिंग, मशीन-लर्निंग से मांग का अनुमान और बातचीत वाला सहायक, तीनों मिलकर काम करते हैं ताकि डेटा जमा करना और रीस्टॉक के फ़ैसले अपने-आप हों।',
    'Zero-friction data capture': 'आसानी से अपने-आप डेटा सेव होना',
    'Every transaction deducts stock and logs sales velocity automatically.': 'हर लेन-देन अपने-आप स्टॉक घटाता है और बिक्री की रफ़्तार दर्ज करता है।',
    'Predictive intelligence': 'अनुमान-आधारित समझ',
    'An ML engine studies your sales patterns to recommend what, when and how much to restock.':
      'ML इंजन आपकी बिक्री का पैटर्न देखकर बताता है कि क्या, कब और कितना मँगाना है।',
    'Conversational decision support': 'बातचीत से फ़ैसलों में मदद',
    'An AI assistant answers in plain language with visual charts and concrete next steps.': 'AI सहायक सरल भाषा में, चार्ट और अगले कदमों के साथ जवाब देता है।',
    'Key features': 'मुख्य विशेषताएँ',
    'Three modules, one store brain': 'तीन मॉड्यूल, एक स्मार्ट स्टोर सिस्टम',
    'Packaged goods on store shelves': 'दुकान की शेल्फ़ पर पैकेट वाला सामान',
    'Module 01': 'मॉड्यूल 01',
    'Module 02': 'मॉड्यूल 02',
    'Module 03': 'मॉड्यूल 03',
    'Smart POS billing & hardware integration': 'स्मार्ट POS बिलिंग और हार्डवेयर इंटीग्रेशन',
    'Dual-mode checkout': 'दो तरीकों से चेकआउट',
    'Dual-mode checkout.': 'दो तरीकों से चेकआउट।',
    'Manual item selection or barcode scanning.': 'हाथ से आइटम चुनें या बारकोड स्कैन करें।',
    'Automated inventory deduction': 'अपने-आप इन्वेंटरी घटना',
    'Automated inventory deduction.': 'अपने-आप इन्वेंटरी घटना।',
    'Stock updates in real time on every bill.': 'हर बिल पर स्टॉक तुरंत अपडेट होता है।',
    'Digital balance sheet & ledger': 'डिजिटल बैलेंस शीट और बही-खाता',
    'Digital balance sheet & ledger.': 'डिजिटल बैलेंस शीट और बही-खाता।',
    'UPI, cash, khata and GST tracked for you.': 'UPI, नकद, खाता और GST का हिसाब आपके लिए।',
    'Stock-in & wastage logging': 'नया माल और एक्सपायर माल लिखना',
    'Stock-in & wastage logging.': 'नया माल और एक्सपायर माल लिखना।',
    'One-tap quick actions keep inventory honest.': 'एक टैप की क्विक एक्शन से इन्वेंटरी सही रहती है।',
    'Fresh vegetables at a market stall': 'बाज़ार के ठेले पर ताज़ी सब्ज़ियाँ',
    'Predictive restocking & profit engine': 'अनुमान-आधारित रीस्टॉकिंग और मुनाफ़ा इंजन',
    'Seasonal & monthly rate analysis': 'मौसमी और मासिक दर का विश्लेषण',
    'Seasonal & monthly rate analysis.': 'मौसमी और मासिक दर का विश्लेषण।',
    'Forecasts built from historical and live data.': 'पुराने और ताज़ा डेटा से बने पूर्वानुमान।',
    'Quantity & shelf-life optimisation': 'मात्रा और शेल्फ़-लाइफ़ का सही संतुलन',
    'Quantity & shelf-life optimisation.': 'मात्रा और शेल्फ़-लाइफ़ का सही संतुलन।',
    'Reorder quantities that minimise spoilage.': 'ऐसी मात्रा में ऑर्डर, जिससे सामान सुरक्षित और ताज़ा रहे।',
    'Low-stock & dead-stock alerts': 'कम स्टॉक और धीमी बिक्री के अलर्ट',
    'Low-stock & dead-stock alerts.': 'कम स्टॉक और धीमी बिक्री के अलर्ट।',
    'Timely nudges before it costs you money.': 'नुकसान होने से पहले समय पर याद दिलाना।',
    'Citrus fruit displayed in a grocery store': 'किराना दुकान में सजे नींबू-जाति के फल',
    'Visual AI retail assistant': 'चित्रों वाला AI रिटेल सहायक',
    'Natural language querying': 'आम भाषा में सवाल पूछना',
    'Natural language querying.': 'आम भाषा में सवाल पूछना।',
    'Ask "How much milk is left?" and get an answer.': 'पूछें "कितना दूध बचा है?" और जवाब पाएँ।',
    'On-demand graphs & numbers': 'ज़रूरत पर ग्राफ़ और आँकड़े',
    'On-demand graphs & numbers.': 'ज़रूरत पर ग्राफ़ और आँकड़े।',
    'Interactive charts right inside the chat.': 'चैट के अंदर ही इंटरैक्टिव चार्ट।',
    'Actionable recommendations': 'काम के सुझाव',
    'Actionable recommendations.': 'काम के सुझाव।',
    'Approve the suggested order in one tap.': 'सुझाया गया ऑर्डर एक टैप में मंज़ूर करें।',
    'End-to-end workflow': 'काम करने का पूरा तरीका',
    'From the counter to the supplier, automatically': 'काउंटर से सप्लायर तक, अपने-आप',
    'Checkout': 'चेकआउट',
    'Seamless billing with automatic stock and sales updates.': 'आसान बिलिंग, स्टॉक और बिक्री अपने-आप अपडेट।',
    'Sync': 'सिंक',
    'Secure transaction recording and inventory adjustment.': 'सुरक्षित लेन-देन रिकॉर्ड और इन्वेंटरी में बदलाव।',
    'Analyze': 'विश्लेषण',
    'The ML service processes sales trends for informed decisions.': 'ML सेवा बिक्री के रुझान परखकर सही फ़ैसलों में मदद करती है।',
    'Act': 'कार्रवाई',
    'Approve restocks from the dashboard or the AI assistant.': 'डैशबोर्ड या AI सहायक से रीस्टॉक मंज़ूर करें।',
    'Tech stack': 'तकनीकी ढाँचा',
    'Fast at the counter. Smart behind it.': 'काउंटर पर तेज़। पीछे से समझदार।',
    'A fast POS front end, backed by a forecasting service and a conversational AI layer, all connected to your barcode hardware.':
      'तेज़ POS स्क्रीन, जिसके पीछे पूर्वानुमान सेवा और बातचीत वाला AI है, सब आपके बारकोड हार्डवेयर से जुड़ा।',
    'POS & barcode hardware': 'POS और बारकोड हार्डवेयर',
    'ML demand forecasting': 'ML से मांग का पूर्वानुमान',
    'Conversational AI': 'बातचीत वाला AI',
    'Digital ledger & GST': 'डिजिटल बही-खाता और GST',
    'Secure sync': 'सुरक्षित सिंक',
    'We build retail intelligence for the stores on every street corner': 'हम हर गली-नुक्कड़ की दुकान के लिए रिटेल इंटेलिजेंस बनाते हैं',
    'RetailOS started with a simple observation: small and mid-sized retailers make hundreds of stocking decisions a week, mostly on instinct. We combine POS billing, machine learning and a conversational assistant so every shopkeeper can order with confidence, waste less and earn more.':
      'RetailOS एक सीधी-सी बात से शुरू हुआ: छोटे और मध्यम दुकानदार हफ़्ते में सैकड़ों स्टॉक फ़ैसले लेते हैं, ज़्यादातर अंदाज़े से। हम POS बिलिंग, मशीन लर्निंग और बातचीत वाले सहायक को जोड़ते हैं, ताकि हर दुकानदार भरोसे से ऑर्डर दे, स्टॉक सुरक्षित रखे और अधिक कमाए।',
    'Built for the counter': 'काउंटर के लिए बना',
    'Built for the counter.': 'काउंटर के लिए बना।',
    'Every screen is designed for a shop owner with a queue in front of them.': 'हर स्क्रीन ऐसे दुकानदार के लिए बनी है, जिसके सामने ग्राहकों की लाइन लगी हो।',
    'Affordable by default': 'शुरू से किफ़ायती',
    'Affordable by default.': 'शुरू से किफ़ायती।',
    'Enterprise-grade insight without enterprise cost or complexity.': 'बड़ी कंपनियों जैसी सुविधा, कम लागत और पूरी सरलता के साथ।',
    'Less waste, more margin': 'माल सुरक्षित, ज़्यादा मुनाफ़ा',
    'Less waste, more margin.': 'माल सुरक्षित, ज़्यादा मुनाफ़ा।',
    'Our success is measured in spoilage avoided and profit protected.': 'हमारी सफलता इससे नापी जाती है कि कितना स्टॉक सुरक्षित रहा और कितना मुनाफ़ा बढ़ा।',
    'Shopkeeper in his well-stocked store': 'अपनी भरी-पूरी दुकान में दुकानदार',
    'Our mission': 'हमारा मिशन',
    'Smarter shelves for every independent store.': 'हर स्वतंत्र दुकान के लिए समझदार शेल्फ़।',
    'The team behind RetailOS': 'RetailOS के पीछे की टीम',
    'Frontend & POS UI': 'फ्रंटएंड और POS UI',
    'Counter software that keeps billing fast, touch-friendly, and simple.': 'काउंटर का सॉफ़्टवेयर, जो बिलिंग को तेज़, टच-फ्रेंडली और सरल रखता है।',
    'ML & forecasting': 'ML और पूर्वानुमान',
    'Demand models that learn seasonality, trends and shelf life from every sale.': 'ऐसे मॉडल जो हर बिक्री से मौसम, रुझान और शेल्फ़-लाइफ़ सीखते हैं।',
    'Plain-language answers with charts and one-tap actions for busy shopkeepers.': 'व्यस्त दुकानदारों के लिए सरल भाषा में जवाब, चार्ट और एक टैप की कार्रवाइयाँ।',
    'Backend & sync': 'बैकएंड और सिंक',
    'Secure transaction recording, atomic billing, and real-time inventory adjustment.': 'सुरक्षित लेन-देन रिकॉर्ड, पक्की बिलिंग और तुरंत इन्वेंटरी अपडेट।',
    '© 2026 RetailOS · Retail Intelligence Framework': '© 2026 RetailOS · रिटेल इंटेलिजेंस फ्रेमवर्क',
    'RetailOS · Retail Intelligence Framework': 'RetailOS · रिटेल इंटेलिजेंस फ्रेमवर्क',

    /* ---- Network banner / toasts ---- */
    'Backend not connected · showing demo data': 'बैकएंड जुड़ा नहीं है · डेमो डेटा दिख रहा है',
    'Backend not connected': 'बैकएंड जुड़ा नहीं है',
    'Retry': 'फिर कोशिश करें',
    'Checking backend connection...': 'बैकएंड कनेक्शन जाँचा जा रहा है...',
    'Connected to backend API!': 'बैकएंड API से जुड़ गया!',
    'Backend sync failed, saved locally.': 'बैकएंड से नहीं जुड़ा, आपके कंप्यूटर में सेव हो गया।',
    'Voice input is not supported in this browser': 'इस ब्राउज़र में आवाज़ से इनपुट उपलब्ध नहीं है',
    'Could not read that CSV. A "name" column is required.': 'वह CSV पढ़ी नहीं जा सकी। "name" कॉलम ज़रूरी है।',
    'Session expired. Please sign in again.': 'सेशन खत्म हो गया। कृपया फिर से साइन इन करें।',
    'POS Scanner Ready': 'POS स्कैनर तैयार',
    'Enter the customer name for a khata bill': 'खाता बिल के लिए ग्राहक का नाम लिखें',

    /* ---- Login ---- */
    'Close': 'बंद करें',
    'Sign in to manage your retail operations.': 'अपनी दुकान का काम संभालने के लिए साइन इन करें।',
    'Create your store account.': 'अपनी दुकान का खाता बनाएँ।',
    'Reset your password.': 'अपना पासवर्ड रीसेट करें।',
    'Email Address': 'ईमेल पता',
    'Phone Number': 'फ़ोन नंबर',
    'Your name': 'आपका नाम',
    'Store name': 'दुकान का नाम',
    'e.g., Rajesh': 'जैसे, राजेश',
    'e.g., alex@retailos.com': 'जैसे, alex@retailos.com',
    'e.g., Sharma General Store': 'जैसे, शर्मा जनरल स्टोर',
    'e.g., 98765 43210': 'जैसे, 98765 43210',
    'Password': 'पासवर्ड',
    'Forgot password?': 'पासवर्ड भूल गए?',
    'Sign In': 'साइन इन',
    'Sign in': 'साइन इन',
    'Sign up': 'साइन अप',
    'or': 'या',
    'Continue with Google': 'Google से जारी रखें',
    "Don't have an account?": 'खाता नहीं है?',
    'Already have an account?': 'पहले से खाता है?',
    'Create Account': 'खाता बनाएँ',
    'Send Reset Link': 'रीसेट लिंक भेजें',
    'RetailOS predictive demand, restock alerts, POS status and AI assistant': 'RetailOS का मांग पूर्वानुमान, रीस्टॉक अलर्ट, POS स्थिति और AI सहायक',
    'Please tell us your name.': 'कृपया अपना नाम बताएँ।',
    'Enter a valid email address.': 'सही ईमेल पता लिखें।',
    'Enter a valid 10-digit phone number.': 'सही 10 अंकों का फ़ोन नंबर लिखें।',
    'Password must be at least 6 characters.': 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
    'Enter your store name.': 'अपनी दुकान का नाम लिखें।',
    'Could not sign in.': 'साइन इन नहीं हो सका।',
    'Could not load Google Sign-In script.': 'Google साइन-इन स्क्रिप्ट लोड नहीं हो सकी।',
    'Google Sign-In is not configured. Set GOOGLE_CLIENT_ID in js/config.js.': 'Google साइन-इन सेट नहीं है। js/config.js में GOOGLE_CLIENT_ID डालें।',
    'Google Sign-In was cancelled.': 'Google साइन-इन रद्द हुआ।',
    'Google Sign-In failed.': 'Google साइन-इन विफल रहा।',

    /* ---- Upload page ---- */
    'RetailAI OS': 'RetailAI OS',
    'Upload data': 'डेटा अपलोड',
    'Dashboard': 'डैशबोर्ड',
    'Sign out': 'साइन आउट',
    'Set up your store data': 'अपनी दुकान का डेटा सेट करें',
    'Upload past sales or stock, scan a delivery, and confirm your store details.': 'पुरानी बिक्री या स्टॉक अपलोड करें, डिलीवरी स्कैन करें और दुकान की जानकारी पक्की करें।',
    'Continue to dashboard': 'डैशबोर्ड पर जाएँ',
    'Upload sales & inventory data': 'बिक्री और इन्वेंटरी का डेटा अपलोड करें',
    'CSV template': 'CSV टेम्पलेट',
    'Drag & drop your CSV file here': 'अपनी CSV फ़ाइल यहाँ खींचकर छोड़ें',
    "Sales history or inventory export from your POS or Excel. We'll match items by barcode or name.": 'POS या Excel से बिक्री का इतिहास या इन्वेंटरी की फ़ाइल। हम बारकोड या नाम से आइटम मिला लेंगे।',
    'Browse files': 'फ़ाइलें चुनें',
    'CSV up to 10 MB': '10 MB तक की CSV',
    'Upload dataset from a photo': 'फ़ोटो से डेटा अपलोड करें',
    "Snap a stock register, handwritten list or supplier bill. We'll read the items for you.": 'स्टॉक रजिस्टर, हाथ से लिखी सूची या सप्लायर का बिल खींचें। आइटम हम पढ़ लेंगे।',
    'Drop a photo or browse': 'फ़ोटो छोड़ें या चुनें',
    'JPG or PNG · clear, well-lit, one item per line works best': 'JPG या PNG · साफ़, रोशनी वाली, हर लाइन में एक आइटम हो तो सबसे अच्छा',
    'Take photo': 'फ़ोटो लें',
    'Start over': 'फिर से शुरू करें',
    'Recently added': 'हाल में जोड़े गए',
    'Uploads, photos and manual entries will appear here.': 'अपलोड, फ़ोटो और हाथ से की गई एंट्री यहाँ दिखेंगी।',
    'Manual upload': 'हाथ से अपलोड',
    'Add stock for an existing item or create a new one': 'मौजूदा आइटम में स्टॉक जोड़ें या नया आइटम बनाएँ',
    'More details': 'और जानकारी',
    'Fewer details': 'कम जानकारी',
    'Item name or barcode': 'आइटम का नाम या बारकोड',
    'e.g., Amul Butter 100g': 'जैसे, अमूल मक्खन 100g',
    'Quantity': 'मात्रा',
    'Selling price (₹)': 'बेचने का दाम (₹)',
    'Actual price (₹)': 'खरीद का दाम (₹)',
    'Selling price': 'बेचने का दाम',
    'Actual price': 'खरीद का दाम',
    'Profit': 'मुनाफ़ा',
    'Cost price (₹)': 'खरीद का दाम (₹)',
    'Add item': 'आइटम जोड़ें',
    'Add stock': 'स्टॉक जोड़ें',
    'Category': 'श्रेणी',
    'Shelf life (days)': 'शेल्फ़ लाइफ़ (दिन)',
    'Uploaded stock list': 'अपलोड की गई स्टॉक सूची',
    'Item name': 'आइटम का नाम',
    'Remove row': 'लाइन हटाएँ',
    'Remove': 'हटाएँ',
    'Auto': 'अपने-आप',
    'Item': 'आइटम',
    'Stock': 'स्टॉक',
    'Price': 'कीमत',
    'Cost': 'लागत',
    'Status': 'स्थिति',
    'Update': 'अपडेट',
    'New': 'नया',
    'Qty': 'मात्रा',
    'Price ₹': 'कीमत ₹',
    'Add row': 'नई लाइन जोड़ें',
    'existing': 'मौजूदा',
    'new': 'नया',
    'Matches an existing item': 'मौजूदा आइटम से मेल खाता है',
    'New item': 'नया आइटम',
    'New item will be created': 'नया आइटम बनाया जाएगा',
    'recognizing text': 'टेक्स्ट पहचाना जा रहा है',
    '% · runs privately in your browser': '% · आपके ब्राउज़र में ही निजी तौर पर चलता है',
    'Loading text recognition…': 'टेक्स्ट पहचान लोड हो रही है…',
    'Reading items from photo…': 'फ़ोटो से आइटम पढ़े जा रहे हैं…',
    'Please upload a .csv file (export from Excel with "Save as CSV").': 'कृपया .csv फ़ाइल अपलोड करें (Excel से "Save as CSV" करके)।',
    'That file is larger than 10 MB.': 'यह फ़ाइल 10 MB से बड़ी है।',
    'No rows found. Make sure the first row has a "name" column.': 'कोई डेटा नहीं मिला। पहली लाइन में "name" कॉलम होना चाहिए।',
    'OCR engine script could not be loaded': 'OCR स्क्रिप्ट लोड नहीं हो सकी',
    'Please choose an image (JPG, PNG or a phone photo).': 'कृपया एक फ़ोटो चुनें (JPG, PNG या फ़ोन की फ़ोटो)।',
    'We could not find item lines. Add them below or try a sharper photo.': 'आइटम की लाइनें नहीं मिलीं। नीचे खुद जोड़ें या साफ़ फ़ोटो आज़माएँ।',
    'Text recognition could not start. Check your connection or try entering items below.': 'टेक्स्ट पहचान शुरू नहीं हुई। कनेक्शन जाँचें या नीचे आइटम खुद लिखें।',
    'Add at least one item with a quantity.': 'मात्रा के साथ कम से कम एक आइटम जोड़ें।',
    'Photo dataset': 'फ़ोटो डेटासेट',
    'Enter an item name or barcode.': 'आइटम का नाम या बारकोड लिखें।',
    'Enter a quantity greater than 0.': '0 से ज़्यादा मात्रा लिखें।',
    'Enter a selling price for the new item.': 'नए आइटम की बिक्री कीमत लिखें।',

    /* ---- Dashboard shell ---- */
    'Open menu': 'मेन्यू खोलें',
    'Scan barcode or search item': 'बारकोड स्कैन करें या आइटम खोजें',
    'Upload CSV': 'CSV अपलोड करें',
    'Toggle POS status': 'POS स्थिति बदलें',
    'POS Ready': 'POS तैयार',
    'POS Paused': 'POS रुका हुआ',
    'Overview': 'होम (डैशबोर्ड)',
    'Data upload': 'डेटा अपलोड',
    'POS billing': 'POS बिलिंग',
    'Inventory': 'इन्वेंटरी',
    'Forecasts': 'आगे की मांग',
    'Ledger': 'बही-खाता',
    'Wastage': 'एक्सपायर / बचा माल',
    'Quick actions': 'क्विक एक्शन',
    'Scan Delivery': 'डिलीवरी स्कैन करें',
    'Log Wastage': 'एक्सपायर माल लिखें',
    'Last Receipt': 'आखिरी रसीद',
    'Owner': 'मालिक',
    'Store owner': 'दुकान मालिक',
    'Your store at a glance': 'एक नज़र में आपकी दुकान',
    'Upload CSVs, scan deliveries and update store details': 'CSV अपलोड करें, डिलीवरी स्कैन करें और दुकान की जानकारी अपडेट करें',
    'Scan or select items. Stock updates automatically.': 'आइटम स्कैन करें या चुनें। स्टॉक अपने-आप अपडेट होता है।',
    'Stock levels, shelf life and quick adjustments': 'स्टॉक की मात्रा, शेल्फ़ लाइफ़ और जल्दी बदलाव',
    'Demand predictions and restock recommendations': 'आगे की मांग और नया माल मँगाने के सुझाव',
    'Bills, collections, khata and GST': 'बिल, वसूली, खाता और GST',
    'Expiring stock, markdowns and the wastage log': 'एक्सपायर होने वाला माल, छूट और हटाए गए माल की लिस्ट',
    'Good morning': 'सुप्रभात',
    'Good afternoon': 'नमस्कार',
    'Good evening': 'शुभ संध्या',
    'Hello,': 'नमस्ते,',
    'what should we call you?': 'हम आपको क्या कहकर बुलाएँ?',
    'Change your name': 'अपना नाम बदलें',
    'Save': 'सेव करें',
    'Cancel': 'रद्द करें',
    'Ask AI assistant': 'AI सहायक से पूछें',
    'Your shelves, sales and smart suggestions are ready whenever you are.': 'आपकी शेल्फ़, बिक्री और स्मार्ट सुझाव, जब भी आप चाहें, तैयार हैं।',
    'Morning briefing': 'सुबह की ब्रीफ़िंग',

    /* ---- Overview ---- */
    'View forecasts': 'आगे की मांग देखें',
    "Today's sales": 'आज की बिक्री',
    'Est. profit': 'मुनाफ़ा',
    'Low stock': 'कम स्टॉक',
    'Wastage risk': 'जल्द एक्सपायर',
    'All stocked': 'सब कुछ स्टॉक में है',
    'Nothing expiring': 'कुछ भी एक्सपायर नहीं हो रहा',
    'Restock recommendations': 'रीस्टॉक सुझाव',
    'See all': 'सभी देखें',
    'Show less': 'कम दिखाएँ',
    'All caught up. No restocks needed.': 'सब ठीक है। किसी रीस्टॉक की ज़रूरत नहीं।',
    'Order': 'ऑर्डर',
    'Ignore': 'अभी छोड़ें',
    'Approve': 'मंज़ूर करें',
    'Mark received': 'माल मिल गया',
    'Received': 'मिल गया',
    'Actual vs AI predicted': 'असली बिक्री और AI अनुमान',
    'Actual': 'असली',
    'AI': 'AI',
    "Today's collections": 'आज का कलेक्शन',
    'Open AI Assistant': 'AI सहायक खोलें',
    'UPI': 'UPI',
    'Cash': 'नकद',
    'Khata': 'खाता',
    'Walk-in': 'नया ग्राहक',
    'Today': 'आज',
    'Tomorrow': 'कल',

    /* ---- POS ---- */
    'Barcode scan': 'बारकोड स्कैन',
    'Manual select': 'हाथ से चुनें',
    'Scanner connected': 'स्कैनर जुड़ा है',
    'POS paused. Turn on POS Ready to bill.': 'POS रुका है। बिल बनाने के लिए POS तैयार चालू करें।',
    'Scan barcode or type name, then press Enter': 'बारकोड स्कैन करें या नाम लिखें, फिर Enter दबाएँ',
    'Try:': 'आज़माएँ:',
    'All': 'सभी',
    'Dairy & Eggs': 'डेयरी और अंडे',
    'Bakery': 'बेकरी',
    'Fresh Produce': 'ताज़ा सब्ज़ी-फल',
    'Staples': 'राशन का सामान',
    'Snacks': 'नाश्ता',
    'Beverages': 'पेय पदार्थ',
    'Household': 'घरेलू सामान',
    'Personal Care': 'पर्सनल केयर',
    'General': 'सामान्य',
    'Current bill': 'मौजूदा बिल',
    'Clear': 'साफ़ करें',
    'Scan or tap items to start a bill': 'बिल शुरू करने के लिए आइटम स्कैन करें या टैप करें',
    'Customer name (required)': 'ग्राहक का नाम (ज़रूरी)',
    'Customer name (required)': 'ग्राहक का नाम (ज़रूरी)',
    'Subtotal': 'जोड़',
    'GST': 'GST',
    'Total': 'कुल',
    'Decrease': 'घटाएँ',
    'Increase': 'बढ़ाएँ',
    'No matching item': 'कोई आइटम नहीं मिला',

    /* ---- Inventory ---- */
    'Stock value (cost)': 'कुल स्टॉक की कीमत',
    'Expiring ≤ 2 days': '2 दिन में एक्सपायर',
    'Expiring': 'एक्सपायर होने वाला',
    'Dead stock': 'धीमी बिक्री वाला स्टॉक',
    'Healthy': 'ठीक',
    'Out of stock': 'स्टॉक खत्म',
    'Filter items': 'आइटम छाँटें',
    'Export': 'एक्सपोर्ट',
    'Cover': 'कवर',
    'No sales': 'कोई बिक्री नहीं',
    'Stock in': 'स्टॉक-इन',
    'Log wastage': 'एक्सपायर माल लिखें',
    'Add to bill': 'बिल में जोड़ें',
    'Edit': 'बदलें',
    'No items match.': 'कोई आइटम नहीं मिला।',
    'No recent sales': 'हाल में कोई बिक्री नहीं',
    'Tomorrow morning': 'कल सुबह',

    /* ---- Forecast ---- */
    'Items · sorted by urgency': 'आइटम · ज़रूरत के हिसाब से',
    'No order needed': 'ऑर्डर की ज़रूरत नहीं',
    'In stock': 'स्टॉक में',
    '7-day forecast': '7 दिन का अनुमान',
    'Seasonal & monthly rate': 'मौसमी और मासिक दर',
    'Expected monthly units based on historical seasonality': 'पुराने मौसमी रुझान के आधार पर अनुमानित मासिक बिक्री',
    'Shelf life': 'शेल्फ़ लाइफ़',
    'Optimal cover': 'सही कवर',
    'Suggested batch': 'सुझाई गई मात्रा',
    'Order now': 'अभी ऑर्डर करें',
    'Expected profit': 'संभावित मुनाफ़ा',
    'Purchase orders': 'खरीद ऑर्डर',
    'No purchase orders yet. Approve a recommendation to create one.': 'अभी कोई खरीद ऑर्डर नहीं। ऑर्डर बनाने के लिए कोई सुझाव मंज़ूर करें।',

    /* ---- Ledger ---- */
    'Total sales': 'कुल बिक्री',
    'Items sold today': 'आज बिके आइटम',
    'Cash & UPI collected': 'नकद और UPI से मिले',
    'Total selling price': 'कुल बेचने का दाम',
    'Total actual price': 'कुल खरीद का दाम',
    'Total profit': 'कुल मुनाफ़ा',
    'Payment breakdown': 'पेमेंट का हिसाब',
    'Bills, collections and khata': 'बिल, वसूली और खाता',
    'UPI, cash and khata tracked for you.': 'UPI, नकद और खाते का हिसाब आपके लिए।',
    'Digital ledger & khata': 'डिजिटल बही-खाता और उधार',
    'Gross sales (incl. GST)': 'कुल बिक्री (GST सहित)',
    'GST collected': 'वसूला गया GST',
    'Gross profit': 'सकल मुनाफ़ा',
    'Khata outstanding': 'खाते में बकाया',
    'Last 24 auto-bills': 'आखिरी 24 ऑटो-बिल',
    'Wastage log': 'हटाए गए माल की लिस्ट',
    'Export CSV': 'CSV एक्सपोर्ट',
    'Bill': 'बिल',
    'Time': 'समय',
    'Items': 'आइटम',
    'Payment': 'भुगतान',
    'Receipt': 'रसीद',
    'Settle': 'जमा करें',
    'Settled': 'जमा हो गया',
    'No khata bills.': 'कोई खाता बिल नहीं।',
    'Pending': 'बाकी',
    "Today's balance sheet": 'आज की बैलेंस शीट',
    'Net sales (ex-GST)': 'शुद्ध बिक्री (GST के बिना)',
    'Cost of goods sold': 'बेचे गए माल की लागत',
    'Wastage loss': 'एक्सपायर माल की कीमत',
    'Net profit': 'शुद्ध मुनाफ़ा',
    'GST summary by slab': 'स्लैब के अनुसार GST सार',
    'Rate': 'दर',
    'Taxable': 'कर योग्य',
    'Tax': 'कर',
    'No bills yet.': 'अभी कोई बिल नहीं।',

    /* ---- Wastage ---- */
    'Value at risk': 'जल्द एक्सपायर माल',
    'Wasted today': 'आज हटाया गया माल',
    'Waste rate': 'एक्सपायरी दर',
    'Healthy · target under 3%': 'ठीक · लक्ष्य 3% से कम',
    'Above 3% target': '3% लक्ष्य से ऊपर',
    'Expiring soon': 'जल्द एक्सपायर',
    'Clear it with a markdown, or write it off': 'छूट देकर बेचें, या स्टॉक से हटाएँ',
    'Nothing is close to expiry. Nice work.': 'कुछ भी एक्सपायरी के करीब नहीं। बढ़िया काम।',
    '<24h': '<24 घंटे',
    'Write off': 'स्टॉक से हटाएँ',
    'Remove discount': 'छूट हटाएँ',
    '15% off': '15% छूट',
    'Loss by reason (₹)': 'कारण के हिसाब से विवरण (₹)',
    'Log wastage to see the breakdown.': 'विवरण देखने के लिए हटाया गया माल दर्ज करें।',
    'Shelf-life order tuning': 'शेल्फ़-लाइफ़ के हिसाब से ऑर्डर',
    'Order sizes that keep perishables fresh': 'ऐसी ऑर्डर मात्रा, जिससे ताज़ा सामान हमेशा उपलब्ध रहे',
    'No wastage logged yet.': 'अभी कोई एक्सपायर माल दर्ज नहीं है।',
    'No wastage logged. ': 'कोई एक्सपायर माल दर्ज नहीं है। ',
    'Expired': 'एक्सपायर',
    'Damaged': 'टूटा / खुला पैकेट',
    'Spoiled': 'पुराना माल',
    'Theft / missing': 'कम मिला स्टॉक',
    'Theft': 'कम मिला',
    'Other': 'अन्य',
    'Reason': 'कारण',

    /* ---- Notifications / search ---- */
    'Notifications': 'सूचनाएँ',
    'Mark all read': 'सब पढ़ लिया',
    'Ctrl+F': 'Ctrl+F',
    'Amul Taaza Milk will run out today. 14 pkts left.': 'अमूल ताज़ा दूध आज खत्म हो जाएगा। 14 पैकेट बचे हैं।',
    '14 pkts of milk and 6 loaves of bread expire within 24h.': '14 पैकेट दूध और 6 ब्रेड 24 घंटे में एक्सपायर हो जाएँगे।',
    'Canned Chickpeas: no sales in 14 days. Consider a discount.': 'डिब्बाबंद छोले: 14 दिन से कोई बिक्री नहीं। छूट देने पर विचार करें।',

    /* ---- Modals ---- */
    'Scan delivery': 'डिलीवरी स्कैन करें',
    'Receive purchase orders or scan items to stock in': 'खरीद ऑर्डर प्राप्त करें या स्टॉक-इन के लिए आइटम स्कैन करें',
    'Pending purchase orders': 'आने वाले ऑर्डर',
    'No pending POs. Approve one from the dashboard.': 'कोई ऑर्डर बाकी नहीं है। डैशबोर्ड से ऑर्डर मंज़ूर करें।',
    'Receive': 'माल लें',
    'Scan or enter barcode': 'बारकोड स्कैन करें या लिखें',
    'Barcode or item name': 'बारकोड या आइटम का नाम',
    'Removes stock and records the loss in the ledger': 'स्टॉक अपडेट करता है और विवरण बही-खाते में दर्ज करता है',
    'Estimated loss:': 'कुल कीमत:',
    'at cost price': 'खरीद दाम पर',
    'New stock:': 'नया स्टॉक:',
    'Edit item': 'आइटम बदलें',
    'e.g., Fortune Sunflower Oil 1L': 'जैसे, फ़ॉर्च्यून सूरजमुखी तेल 1L',
    'Unit': 'इकाई',
    'Barcode': 'बारकोड',
    'GST %': 'GST %',
    'Print': 'प्रिंट करें',
    'GSTIN 27AABCS1429B1Z5': 'GSTIN 27AABCS1429B1Z5',
    'CGST + SGST': 'CGST + SGST',
    'Thank you, visit again!': 'धन्यवाद, फिर पधारें!',

    /* ---- Chat ---- */
    'AI Assistant': 'AI सहायक',
    'Local AI engine (demo)': 'लोकल AI इंजन (डेमो)',
    'Backend LLM connected': 'बैकएंड LLM जुड़ा है',
    'Close assistant': 'सहायक बंद करें',
    'Voice input': 'आवाज़ से इनपुट',
    'You': 'आप',
    'RetailAI': 'RetailAI',
    'Action:': 'कार्रवाई:',
    'Done': 'हो गया',
    'Ask anything about your store.': 'अपनी दुकान के बारे में कुछ भी पूछें।',
    'Ask AI anything…': 'AI से कुछ भी पूछें…',
    'Listening…': 'सुन रहा हूँ…',
    'Send': 'भेजें',
    'Tell me the stock of milk left & what I should do': 'बताइए कितना दूध बचा है और मुझे क्या करना चाहिए',
    'What should I restock?': 'मुझे क्या रीस्टॉक करना चाहिए?',
    'Which items are expiring?': 'कौन-से आइटम एक्सपायर हो रहे हैं?',
    'Top sellers this week': 'इस हफ़्ते सबसे ज़्यादा बिकने वाले',
    'dead stock': 'धीमी बिक्री वाला स्टॉक',
    'khata': 'खाता',
    'hello': 'नमस्ते',
    'Open AI Forecast': 'आगे की मांग देखें',
    'Review in AI Forecast': 'आगे की मांग में देखें',
    'View expiring items': 'एक्सपायर होने वाले आइटम देखें',
    'Open inventory': 'इन्वेंटरी खोलें',
    'Open Ledger': 'बही-खाता खोलें',
    'View ledger': 'बही-खाता देखें',
    'Days of stock left': 'बचे स्टॉक के दिन',
    'Value at risk (₹)': 'जल्द एक्सपायर माल (₹)',
    'Avg revenue / day (₹)': 'रोज़ की औसत बिक्री (₹)',
    'Sales by time of day (₹)': 'दिन के समय के अनुसार बिक्री (₹)',
    'All items are covered for now. No open restock recommendations.': 'फ़िलहाल सभी आइटम पर्याप्त हैं। कोई रीस्टॉक सुझाव बाकी नहीं।',
    'No dead stock. Everything sold in the last 14 days.': 'कोई रुका हुआ स्टॉक नहीं। पिछले 14 दिनों में सभी सामान की बिक्री हुई है।',
    'Bundle it with a fast mover or offer 20% off. Stop reordering until it clears.': 'इसे तेज़ बिकने वाले सामान के साथ जोड़ें या 20% छूट दें। खत्म होने तक दोबारा ऑर्डर न करें।',
    'No outstanding khata. All credit is settled.': 'खाते में कोई बकाया नहीं है। सारा हिसाब पूरा है।',
    'I can look up stock, forecasts, sales, wastage and khata. Try asking:': 'मैं स्टॉक, आगे की मांग, बिक्री, एक्सपायर माल और खाता देख सकता हूँ। ये पूछकर देखें:',
    '• "How much milk is left?"': '• "कितना दूध बचा है?"',
    '• "What should I restock today?"': '• "आज मुझे क्या रीस्टॉक करना चाहिए?"',
    '• "Which items are expiring?"': '• "कौन-से आइटम एक्सपायर हो रहे हैं?"',
    '• "What are my top sellers?"': '• "मेरे सबसे ज़्यादा बिकने वाले आइटम कौन-से हैं?"'
  };

  
  /* ---- Added: multi-format upload, Daily sales, POS bill ---- */
  Object.assign(DICT, {
    'Drag & drop your file here': 'अपनी फ़ाइल यहाँ खींचकर छोड़ें',
    'Sales history or inventory from your POS, Excel, Word or PDF. We convert it to our template automatically and match items by barcode or name.': 'आपके POS, Excel, Word या PDF से बिक्री का इतिहास या इन्वेंटरी। हम इसे अपने आप हमारे टेम्पलेट में बदल देते हैं और बारकोड या नाम से आइटम मिलाते हैं।',
    'Or paste a Google Sheet link (shared as Anyone with the link)': 'या Google Sheet का लिंक पेस्ट करें (शेयरिंग: लिंक वाला कोई भी)',
    'Fetch sheet': 'शीट लाएँ',
    'Converted to template format': 'टेम्पलेट फ़ॉर्मेट में बदल दिया गया',
    'Download converted CSV': 'बदली हुई CSV डाउनलोड करें',
    'Barcode (optional)': 'बारकोड (वैकल्पिक)',
    'Reading Excel file…': 'Excel फ़ाइल पढ़ी जा रही है…',
    'Reading Word file…': 'Word फ़ाइल पढ़ी जा रही है…',
    'Reading PDF…': 'PDF पढ़ी जा रही है…',
    'Reading Google Sheet…': 'Google Sheet पढ़ी जा रही है…',
    'Reading file…': 'फ़ाइल पढ़ी जा रही है…',
    'Could not open this Google Sheet. Set sharing to "Anyone with the link can view" and try again.': 'यह Google Sheet नहीं खुल पाई। शेयरिंग को "लिंक वाला कोई भी देख सकता है" पर सेट करें और फिर कोशिश करें।',
    'Could not load the file reader. Check your internet connection and try again.': 'फ़ाइल रीडर लोड नहीं हो सका। इंटरनेट कनेक्शन जाँचें और फिर कोशिश करें।',
    'Could not find any item names in this file. Each row needs an item name (any column order is fine).': 'इस फ़ाइल में कोई आइटम का नाम नहीं मिला। हर लाइन में आइटम का नाम होना चाहिए (कॉलम किसी भी क्रम में हो सकते हैं)।',
    'Old .doc files are not supported. In Word use File > Save As > .docx and upload that.': 'पुरानी .doc फ़ाइलें सपोर्ट नहीं होतीं। Word में File > Save As > .docx चुनकर वह फ़ाइल अपलोड करें।',
    'Photos go in "Upload dataset from a photo" below. Zip files are not supported.': 'फ़ोटो नीचे "फ़ोटो से डेटासेट अपलोड करें" में डालें। Zip फ़ाइलें सपोर्ट नहीं होतीं।',
    'Paste the full Google Sheet link, starting with https://': 'Google Sheet का पूरा लिंक पेस्ट करें, जो https:// से शुरू हो',
    'Daily sales': 'दैनिक बिक्री',
    'Sales for today, yesterday and every day before': 'आज, कल और उससे पहले हर दिन की बिक्री',
    'Today so far': 'आज अब तक',
    'Yesterday': 'कल',
    'Day before yesterday': 'परसों',
    'Last 7 days (excl. today)': 'पिछले 7 दिन (आज को छोड़कर)',
    'Day': 'दिन',
    'Date': 'तारीख़',
    'Items sold': 'बिके आइटम',
    'Units sold': 'बिकी इकाइयाँ',
    'Sales': 'बिक्री',
    'vs previous day': 'पिछले दिन के मुकाबले',
    'Show': 'दिखाएँ',
    'All items': 'सभी आइटम',
    'View items sold': 'बिके आइटम देखें',
    'Items sold on this day': 'इस दिन बिके आइटम',
    'What the stock cost you': 'स्टॉक पर आपकी लागत',
    'No sales recorded for this day.': 'इस दिन की कोई बिक्री दर्ज नहीं है।',
    'Retail invoice': 'खुदरा बिल',
    'Bill No': 'बिल नं.',
    'Customer': 'ग्राहक',
    'Amount': 'राशि',
    'Total items': 'कुल आइटम',
    'Total qty': 'कुल मात्रा',
    'Grand total': 'कुल योग',
    'Payment mode': 'भुगतान का तरीका'
  });

  Object.assign(DICT, {
    /* ---- Upload menu, delete entry, customer name ---- */
    'Upload file': 'फ़ाइल अपलोड करें',
    'Any layout works, we convert it to the template': 'कोई भी फ़ॉर्मेट चलेगा, हम उसे टेम्पलेट में बदल देते हैं',
    'Paste the sheet link': 'शीट का लिंक पेस्ट करें',
    'Delete this entry and the data it added': 'यह एंट्री और इससे जुड़ा डेटा हटाएँ',
    'Delete entry': 'एंट्री हटाएँ',
    'Delete this entry and the items it added? This cannot be undone.': 'यह एंट्री और इससे जुड़े आइटम हटाएँ? इसे वापस नहीं किया जा सकता।',
    'Customer name (optional)': 'ग्राहक का नाम (वैकल्पिक)',
    'Customer name (required)': 'ग्राहक का नाम (ज़रूरी)',
    'Customer name is required to complete checkout': 'बिल पूरा करने के लिए ग्राहक का नाम ज़रूरी है',
    'Time': 'समय',
    'None': 'कोई नहीं',
    /* ---- Chat suggestions ---- */
    'Which items need urgent restocking today?': 'आज किन आइटम को तुरंत रीस्टॉक करना है?',
    'Which items are low on stock?': 'कौन से आइटम स्टॉक में कम हैं?',
    'What are our top margin items?': 'सबसे ज़्यादा मार्जिन वाले आइटम कौन से हैं?',
    'Show me expiring stock risk': 'एक्सपायरी का जोखिम दिखाओ',
    "Summarize today's sales": 'आज की बिक्री का सारांश दें',
    /* ---- Dataset categories ---- */
    'M5 Dataset': 'M5 डेटासेट'
  });

/* ------------------------------------------------------------------------
     2. PRODUCT NAMES, UNITS, WORDS (used inside longer sentences)
     ------------------------------------------------------------------------ */
  var PRODUCTS = {
    'White Eggs (Crate of 30)': 'सफ़ेद अंडे (30 का क्रेट)',
    'Amul Taaza Milk (500ml)': 'अमूल ताज़ा दूध (500ml)',
    'Britannia Brown Bread': 'ब्रिटानिया ब्राउन ब्रेड',
    'Amul Paneer 200g': 'अमूल पनीर 200g',
    'Amul Masti Dahi 400g': 'अमूल मस्ती दही 400g',
    'Amul Butter 100g': 'अमूल मक्खन 100g',
    'Tomatoes (1kg)': 'टमाटर (1kg)',
    'Onions (1kg)': 'प्याज़ (1kg)',
    'Aashirvaad Atta 5kg': 'आशीर्वाद आटा 5kg',
    'India Gate Basmati 1kg': 'इंडिया गेट बासमती 1kg',
    'Sugar (1kg)': 'चीनी (1kg)',
    'Tata Salt 1kg': 'टाटा नमक 1kg',
    'Maggi Noodles 70g': 'मैगी नूडल्स 70g',
    'Parle-G Biscuits 250g': 'पारले-जी बिस्कुट 250g',
    'Tata Tea Gold 250g': 'टाटा टी गोल्ड 250g',
    'Coca-Cola 750ml': 'कोका-कोला 750ml',
    'Surf Excel 1kg': 'सर्फ़ एक्सेल 1kg',
    'Colgate Toothpaste 200g': 'कोलगेट टूथपेस्ट 200g',
    'Canned Chickpeas 400g': 'डिब्बाबंद छोले 400g',
    'White Eggs': 'सफ़ेद अंडे',
    'Amul Taaza Milk': 'अमूल ताज़ा दूध',
    'Amul Milk': 'अमूल दूध',
    'Masti Dahi': 'मस्ती दही',
    'Tomatoes': 'टमाटर',
    'Onions': 'प्याज़',
    'Sugar': 'चीनी',
    'Amul': 'अमूल',
    'Britannia': 'ब्रिटानिया',
    'Aashirvaad': 'आशीर्वाद',
    'India': 'इंडिया',
    'Tata': 'टाटा',
    'Maggi': 'मैगी',
    'Parle-G': 'पारले-जी',
    'Coca-Cola': 'कोका-कोला',
    'Surf': 'सर्फ़',
    'Colgate': 'कोलगेट',
    'Canned': 'डिब्बाबंद',
    'White': 'सफ़ेद',
    'Egg': 'अंडा',
    'Milk': 'दूध',
    'Bread': 'ब्रेड',
    'Paneer': 'पनीर',
    'Curd': 'दही',
    'Butter': 'मक्खन',
    'Tomato': 'टमाटर',
    'Onion': 'प्याज़',
    'Atta': 'आटा',
    'Rice': 'चावल',
    'Salt': 'नमक',
    'Noodle': 'नूडल्स',
    'Biscuit': 'बिस्कुट',
    'Tea': 'चाय',
    'Coke': 'कोक',
    'Detergent': 'डिटर्जेंट',
    'Toothpaste': 'टूथपेस्ट',
    'Chickpea': 'छोले',
    'tomato': 'टमाटर',
    'milk': 'दूध',
    'loaves of bread': 'ब्रेड'
  };

  var UNITS = {
    pkts: 'पैकेट', pkt: 'पैकेट',
    loafs: 'ब्रेड', loaf: 'ब्रेड', loaves: 'ब्रेड',
    crates: 'क्रेट', crate: 'क्रेट',
    packs: 'पैक', pack: 'पैक',
    cups: 'कप', cup: 'कप',
    bags: 'बैग', bag: 'बैग',
    bottles: 'बोतल', bottle: 'बोतल',
    tubes: 'ट्यूब', tube: 'ट्यूब',
    cans: 'कैन', can: 'कैन',
    kg: 'किग्रा',
    units: 'यूनिट', unit: 'यूनिट',
    days: 'दिन', day: 'दिन',
    pcs: 'पीस', pc: 'पीस'
  };

  var PHRASES = {
    'Household': 'घरेलू सामान',
    'Hobbies': 'हॉबीज़',
    'Foods': 'फ़ूड्स',
    'Morning briefing': 'सुबह की ब्रीफ़िंग',
    'Last bill': 'आखिरी बिल',
    'Bill #': 'बिल #',
    'PO #': 'ऑर्डर #',
    'Receipt · ': 'रसीद · ',
    'Stock in · ': 'स्टॉक-इन · ',
    'Paid via': 'भुगतान का तरीका:',
    'in stock': 'स्टॉक में',
    'left': 'बचे',
    'runs out': 'खत्म होगा',
    'sold today': 'आज बिके',
    'shelf life': 'शेल्फ़ लाइफ़',
    'Shelf life': 'शेल्फ़ लाइफ़',
    'expiring': 'एक्सपायर होने वाले',
    'expiring of': 'एक्सपायर होने वाले, कुल',
    'at cost': 'लागत पर',
    'now': 'अभी',
    'sells': 'बिक्री',
    'every': 'हर',
    'pending': 'बाकी',
    'sent': 'भेजा गया',
    'approved': 'मंज़ूर',
    'awaiting approval': 'मंज़ूरी के इंतज़ार में',
    'AI engine': 'AI इंजन',
    'Currently': 'अभी',
    'Quantity received': 'मिली मात्रा',
    'cost': 'लागत',
    'Today': 'आज',
    'today': 'आज',
    'Tomorrow': 'कल',
    'tomorrow': 'कल',
    'morning': 'सुबह',
    'Expired': 'एक्सपायर',
    'PO approved': 'ऑर्डर मंज़ूर',
    'of': 'का',
    'vs yesterday': 'कल के मुकाबले',
    'margin': 'मार्जिन',
    'at risk': 'ध्यान देने योग्य',
    'open accounts': 'खुले खाते',
    'open account': 'खुला खाता',
    'bills today': 'आज के बिल',
    'bill today': 'आज का बिल',
    'entries logged': 'एंट्री दर्ज',
    'entries': 'एंट्री',
    'entry': 'एंट्री',
    'items': 'आइटम',
    'item': 'आइटम',
    'CGST': 'CGST',
    'SGST': 'SGST',
    'Actual': 'असली',
    'Delivery received': 'डिलीवरी प्राप्त',
    'Stocked in': 'स्टॉक-इन किया',
    'Logged': 'दर्ज किया',
    'as': 'के रूप में',
    'saved': 'सेव हो गया',
    'settled': 'जमा हो गया',
    'Applied': 'लगाई गई',
    'discount on': 'छूट,',
    'Removed markdown from': 'छूट हटाई गई:',
    'Ignored': 'अभी के लिए छोड़ा:',
    'for today': 'आज के लिए',
    'Added': 'जोड़ा गया:',
    'to bill': 'बिल में',
    'Only': 'सिर्फ़',
    'in stock.': 'स्टॉक में है।',
    'Nice to meet you': 'आपसे मिलकर खुशी हुई',
    'Imported': 'इम्पोर्ट हुए',
    'Photo imported': 'फ़ोटो इम्पोर्ट हुई',
    'restocked': 'रीस्टॉक',
    'new': 'नए',
    'updated': 'अपडेट',
    'stock updated': 'स्टॉक अपडेट हुआ',
    'Backend not reachable at': 'बैकएंड यहाँ नहीं मिला:',
    'Last import': 'आखिरी इम्पोर्ट',
    'rows': 'लाइनें',
    'Import': 'इम्पोर्ट करें',
    'Charge': 'बिल बनाएँ',
    'No items match': 'कोई आइटम नहीं मिला:',
    'minimises': 'घटाता है'
  };

  /* ------------------------------------------------------------------------
     3. PATTERNS: dynamic sentences containing numbers / product names
     ------------------------------------------------------------------------ */
  var P = [
    [/^(.+) left · (.+) needed this week$/, '$1 बचे · इस हफ़्ते $2 चाहिए'],
    [/^· (₹[\d,.]+) profit$/, '· $1 मुनाफ़ा'],
    [/^HOBBIES_(\d+)$/, 'हॉबीज़ $1'],
    [/^HOUSEHOLD_(\d+)$/, 'घरेलू सामान $1'],
    [/^FOODS_(\d+)$/, 'फ़ूड्स $1'],
    [/^M5 Category: (.+) \/ Department: (.+)$/, 'M5 श्रेणी: $1 / विभाग: $2'],
    [/^(.+) · (\d{6,})$/, '$1 · $2'],
    [/^(.+) at (\d{1,2}:\d{2}.*)$/, '$1 · $2'],
    [/^Deleted (.+)$/, '$1 हटाया गया'],
    [/^(.+) is running low \((\d+) pcs? left\)\.$/, '$1 का स्टॉक कम है ($2 पीस बचे)।'],
    [/^Synced (\d+) M5 items and (\d+) ledger bills\.$/, '$1 M5 आइटम और $2 लेजर बिल सिंक हो गए।'],
    [/^(\d+) days ago$/, '$1 दिन पहले'],
    [/^Avg (₹[\d,]+) per day$/, 'औसत $1 प्रति दिन'],
    [/^(\d+) items? sold$/, '$1 आइटम बिके'],
    [/^([\d.]+) (.+) sold$/, '$1 $2 बिके'],
    [/^([+-]?\d+)% vs day before$/, '$1% पिछले दिन के मुकाबले'],
    [/^(\d+)% margin$/, '$1% मार्जिन'],
    [/^([\d.]+) (.+) × (₹[\d,]+)$/, '$1 $2 × $3'],
    [/^(Today|Yesterday|Day before yesterday|\d+ days ago) · (.+)$/, '$1 · $2'],
    [/^(₹[\d,.]+) each$/, '$1 प्रति'],
    [/^Hello, (.+)$/, 'नमस्ते, $1'],
    [/^(Good morning|Good afternoon|Good evening) · (.+)$/, '$1 · $2'],
    [/^Morning briefing · (.+)$/, 'सुबह की ब्रीफ़िंग · $1'],
    [/^Sales are up (\d+)% on yesterday\. Nice going, let's keep the shelves full\.$/, 'कल के मुकाबले बिक्री $1% बढ़ी है। बढ़िया, शेल्फ़ भरी रखिए।'],
    [/^(\d+) bills done so far\. Here's everything you need for a smooth day at the counter\.$/, 'अब तक $1 बिल बन चुके हैं। काउंटर पर आसान दिन के लिए सब कुछ यहाँ है।'],
    [/^(.+) demand is up$/, '$1 की मांग बढ़ी है'],
    [/^this week\. (\d+) items? need restocking before 6 PM\.$/, 'इस हफ़्ते। शाम 6 बजे से पहले $1 आइटम रीस्टॉक करने हैं।'],
    [/^this week\. All items are stocked for today\.$/, 'इस हफ़्ते। आज के लिए सारे आइटम स्टॉक में हैं।'],
    [/^Approve all (\d+) orders$/, 'सभी $1 ऑर्डर मंज़ूर करें'],
    [/^Approve all (\d+) POs$/, 'सभी $1 ऑर्डर मंज़ूर करें'],
    [/^Add (\d+) to Order$/, 'ऑर्डर में $1 जोड़ें'],
    [/^Show (\d+) more$/, '$1 और दिखाएँ'],
    [/^([▲▼] [+\-]?\d+%) vs yesterday$/, '$1 कल के मुकाबले'],
    [/^([\d.]+)% margin$/, '$1% मार्जिन'],
    [/^(\d+) items? · (\d+) low stock$/, '$1 आइटम · $2 कम स्टॉक'],
    [/^(\d+) items?$/, '$1 आइटम'],
    [/^Expiring <24h · (₹[\d,]+) at risk$/, '<24 घंटे में एक्सपायर · $1 का माल'],
    [/^Expiring ([<≤]?\s?[\d]+h?) · (₹[\d,]+) at risk$/, '$1 में एक्सपायर · $2 का माल'],
    [/^AI engine · (\d+) awaiting approval$/, 'AI इंजन · $1 मंज़ूरी के इंतज़ार में'],
    [/^(.+) left · runs out$/, '$1 बचे · खत्म होगा'],
    [/^(\d+)-day shelf life$/, '$1 दिन की शेल्फ़ लाइफ़'],
    [/^· every (\d+) days?$/, '· हर $1 दिन'],
    [/^Last bill #(\d+) · (.+)$/, 'आखिरी बिल #$1 · $2'],
    [/^(\d+) bills today$/, 'आज $1 बिल'],
    [/^Selling price (₹[\d,]+) · Actual price (₹[\d,]+)$/, 'बेचने का दाम $1 · खरीद का दाम $2'],
    [/^Across (\d+) bills today$/, 'आज के $1 बिलों में'],
    [/^UPI (₹[\d,]+) · Cash (₹[\d,]+)$/, 'UPI $1 · नकद $2'],
    [/^CGST ₹(\d+) · SGST ₹(\d+)$/, 'CGST ₹$1 · SGST ₹$2'],
    [/^(\d+) open accounts?$/, '$1 खुले खाते'],
    [/^(\d+) pending$/, '$1 बाकी'],
    [/^(\d+) entr(?:y|ies)(?: logged)?$/, '$1 एंट्री दर्ज'],
    [/^(\d+) items expire within 3 days$/, '$1 आइटम 3 दिन में एक्सपायर होंगे'],
    [/^Shelf life (\d+)d · sells (\d+)\/day$/, 'शेल्फ़ लाइफ़ $1 दिन · रोज़ $2 बिकते हैं'],
    [/^(.+) every (\d+)d$/, '$1 हर $2 दिन'],
    [/^(\d+) days?$/, '$1 दिन'],
    [/^(\d+) loafs?$/, '$1 ब्रेड'],
    [/^(.+) expiring of (.+) · (₹[\d,]+) at cost · now (₹[\d,.]+)$/, '$2 में से $1 एक्सपायर होने वाले · लागत पर $3 · अभी $4'],
    [/^(.+) expiring · (₹[\d,]+) at cost · now (₹[\d,.]+)$/, '$1 एक्सपायर · लागत पर $2 · अभी $3'],
    [/^(\d+) expiring$/, '$1 एक्सपायर होने वाले'],
    [/^(\d+)d$/, '$1 दिन'],
    [/^Order smaller batches every (\d+) days? to keep spoilage under 5%\.$/, 'स्टॉक ताज़ा रखने के लिए हर $1 दिन में छोटी मात्रा मँगाएँ।'],
    [/^Long shelf life: one weekly order of (.+) minimises delivery costs\.$/, 'लंबी शेल्फ़ लाइफ़: हफ़्ते में एक बार $1 का ऑर्डर डिलीवरी खर्च घटाता है।'],
    [/^Order now$/, 'अभी ऑर्डर करें'],
    [/^Approve PO \((.+)\)$/, 'ऑर्डर मंज़ूर करें ($1)'],
    [/^([\d.]+) days?$/, '$1 दिन'],
    [/^Today (.+)$/i, 'आज $1'],
    [/^In (\d+) days$/, '$1 दिन में'],
    [/^(.+) · (.+) \((\d+) expiring\)$/, '$1 · $2 ($3 एक्सपायर होने वाले)'],
    [/^Notifications \((\d+) unread\)$/, 'सूचनाएँ ($1 नई)'],
    [/^Log (.+) wastage$/, '$1 को एक्सपायर लिस्ट में जोड़ें'],
    [/^PO approved: (.+) of (.+)$/, 'ऑर्डर मंज़ूर: $2 का $1'],
    [/^PO approved: (.+) of (.+)\.$/, 'ऑर्डर मंज़ूर: $2 का $1।'],
    [/^PO #(\d+) (pending|sent)$/, 'ऑर्डर #$1 $2'],
    [/^PO #(\d+)$/, 'ऑर्डर #$1'],
    [/^Bill #(\d+)$/, 'बिल #$1'],
    [/^Receipt · Bill #(\d+)$/, 'रसीद · बिल #$1'],
    [/^Stock in · (.+)$/, 'स्टॉक-इन · $1'],
    [/^Currently (.+)$/, 'अभी $1'],
    [/^Quantity received \((.+)\)$/, 'मिली मात्रा ($1)'],
    [/^Existing item · (.+) in stock$/, 'मौजूदा आइटम · स्टॉक में $1'],
    [/^· cost (₹[\d,]+)$/, '· लागत $1'],
    [/^(.+) · (.+) in stock$/, '$1 · स्टॉक में $2'],
    [/^Charge (₹[\d,.]+) · (.+)$/, '$1 का बिल बनाएँ · $2'],
    [/^Paid via (.+)$/, 'भुगतान: $1'],
    [/^Bill #(\d+) · (.+)$/, 'बिल #$1 · $2'],
    [/^No items match [“"](.*)[”"]\.$/, '“$1” से कोई आइटम नहीं मिला।'],
    [/^(.+) · units\/day \(dashed = AI prediction\)$/, '$1 · यूनिट/दिन (बिंदीदार = AI अनुमान)'],
    [/^Added (.+) to bill$/, '$1 बिल में जोड़ा गया'],
    [/^Only (.+) of (.+) in stock$/, 'स्टॉक में सिर्फ़ $2 का $1 है'],
    [/^Ignored (.+) for today$/, 'आज के लिए $1 को छोड़ दिया गया'],
    [/^Delivery received: \+(.+)$/, 'डिलीवरी प्राप्त: +$1'],
    [/^Stocked in (.+) of (.+)$/, '$2 का $1 स्टॉक-इन किया'],
    [/^Logged (.+) of (.+) as (.+)$/, '$2 का $1 दर्ज किया ($3)'],
    [/^(.+) saved$/, '$1 सेव हो गया'],
    [/^Bill #(\d+) settled$/, 'बिल #$1 जमा हो गया'],
    [/^Bill #(\d+) saved · (.+) · stock updated$/, 'बिल #$1 सेव हो गया · $2 · स्टॉक अपडेट हुआ'],
    [/^Applied (\d+)% discount on (.+)$/, '$2 पर $1% छूट लगाई गई'],
    [/^Removed markdown from (.+)$/, '$1 से छूट हटाई गई'],
    [/^Nice to meet you, (.+)!$/, 'आपसे मिलकर खुशी हुई, $1!'],
    [/^Backend not reachable at (.+)$/, 'बैकएंड यहाँ नहीं मिला: $1'],
    [/^Imported (\d+) items · (\d+) new, (\d+) updated$/, '$1 आइटम इम्पोर्ट हुए · $2 नए, $3 अपडेट'],
    [/^Photo imported · (\d+) restocked, (\d+) new$/, 'फ़ोटो इम्पोर्ट हुई · $1 रीस्टॉक, $2 नए'],
    [/^(.+): (\d+) new, (\d+) updated$/, '$1: $2 नए, $3 अपडेट'],
    [/^Last import: (\d+) new · (\d+) updated$/, 'आखिरी इम्पोर्ट: $1 नए · $2 अपडेट'],
    [/^· (\d+) rows$/, '· $1 लाइनें'],
    [/^Import (\d+) items$/, '$1 आइटम इम्पोर्ट करें'],
    [/^(\d+)% · runs privately in your browser$/, '$1% · आपके ब्राउज़र में ही निजी तौर पर चलता है'],
    [/^(\d+) × ₹([\d,.]+)$/, '$1 × ₹$2'],
    [/^(\d+) × ₹([\d,.]+) · GST (\d+)%$/, '$1 × ₹$2 · GST $3%'],
    [/^(.+) · (\d+) loafs? \((\d+) expiring\)$/, '$1 · $2 ब्रेड ($3 एक्सपायर होने वाले)'],
    [/^GSTIN (.+)$/, 'GSTIN $1']
  ];

  /* Chat answers (preserves **bold** markdown) */
  var C = [
    [/^You have \*\*(.+?)\*\* of (.+?) left \((\d+) sold today\)\. At the current pace it runs out \*\*(.+?)\*\*\. Tomorrow's forecast is \*\*(.+?)\*\*, trend (▲ \+|▼ )(-?\d+)% this week\.(?: Note: \*\*(.+?)\*\* expire within (.+?)\.)?$/,
      function (m) {
        return 'आपके पास **' + T(m[1]) + '** ' + T(m[2]) + ' बचा है (आज ' + m[3] + ' बिका)। इसी रफ़्तार से यह **' + T(m[4]) + '** तक खत्म हो जाएगा। कल का अनुमान **' + T(m[5]) + '** है, इस हफ़्ते रुझान ' + m[6] + m[7] + '%।' + (m[8] ? ' ध्यान दें: **' + T(m[8]) + '** ' + T(m[9]) + ' के भीतर एक्सपायर होंगे।' : '');
      }],
    [/^Order \*\*(.+?)\*\* (today|every (\d+) days? to avoid spoilage), enough for (\d+) days? of demand\. Est\. profit (₹[\d,]+)\.$/,
      function (m) {
        return '**' + T(m[1]) + '** का ऑर्डर दें ' + (m[3] ? 'हर ' + m[3] + ' दिन में, ताकि सामान ताज़ा रहे' : 'आज') + ', ' + m[4] + ' दिन की मांग के लिए काफ़ी। अनुमानित मुनाफ़ा ' + m[5] + '।';
      }],
    [/^Stock covers about (\d+) days\. No order needed yet\.$/, function (m) { return 'स्टॉक लगभग ' + m[1] + ' दिन चलेगा। अभी ऑर्डर की ज़रूरत नहीं।'; }],
    [/^(\d+) items? need restocking:$/, function (m) { return m[1] + ' आइटम रीस्टॉक करने हैं:'; }],
    [/^• \*\*(.+?)\*\*: order (.+?) \(runs out (.+)\)$/, function (m) { return '• **' + T(m[1]) + '**: ' + T(m[2]) + ' ऑर्डर करें (' + T(m[3]) + ' तक खत्म)'; }],
    [/^Approving all costs about (₹[\d,]+) and protects (₹[\d,]+) in sales\.$/, function (m) { return 'सबको मंज़ूर करने में लगभग ' + m[1] + ' खर्च होंगे और ' + m[2] + ' की बिक्री सुरक्षित रहेगी।'; }],
    [/^\*\*(₹[\d,]+)\*\* of stock is at risk of expiring:$/, function (m) { return '**' + m[1] + '** का स्टॉक एक्सपायर होने के जोखिम में है:'; }],
    [/^• (.+?): (.+?) within (24h|\d+ days)$/, function (m) { return '• ' + T(m[1]) + ': ' + T(m[2]) + ' ' + (m[3] === '24h' ? '24 घंटे' : m[3].replace(' days', ' दिन')) + ' में'; }],
    [/^Wastage logged so far: (₹[\d,]+)\.$/, function (m) { return 'अब तक हटाया गया माल: ' + m[1] + '।'; }],
    [/^Nothing is close to expiry\. Wastage logged so far: (₹[\d,]+)\.$/, function (m) { return 'कुछ भी एक्सपायरी के करीब नहीं है। अब तक हटाया गया माल: ' + m[1] + '।'; }],
    [/^Put (.+?) on a 15% discount near the counter\. It usually clears in 3 to 4 hours\.$/, function (m) { return T(m[1]) + ' पर 15% छूट लगाकर इसे काउंटर के पास रखें। यह आमतौर पर 3 से 4 घंटे में बिक जाता है।'; }],
    [/^Your top sellers by revenue this week: (.+)\.$/, function (m) { return 'इस हफ़्ते आय के हिसाब से आपके सबसे ज़्यादा बिकने वाले आइटम: ' + T(m[1]) + '।'; }],
    [/^Keep (.+?) at eye level near billing and never below (\d+) units\.$/, function (m) { return T(m[1]) + ' को बिलिंग के पास नज़र की ऊँचाई पर रखें और स्टॉक कभी ' + m[2] + ' यूनिट से कम न होने दें।'; }],
    [/^(\d+) dead-stock items?: (.+)\.$/, function (m) { return m[1] + ' धीमी बिक्री वाले आइटम: ' + T(m[2]).replace(/ locked\)/g, ' स्टॉक में)') + '।'; }],
    [/^Outstanding khata: \*\*(₹[\d,]+)\*\* across (\d+) bills? \((.+)\)\.$/, function (m) { return 'बकाया खाता: **' + m[1] + '**, कुल ' + m[2] + ' बिल (' + m[3] + ')।'; }],
    [/^Today so far: \*\*(₹[\d,]+)\*\* in sales from (\d+) bills, estimated profit \*\*(₹[\d,]+)\*\*\. UPI makes up (\d+)% of collections\.$/,
      function (m) {
        return 'आज अब तक: ' + m[2] + ' बिलों से **' + m[1] + '** की बिक्री, अनुमानित मुनाफ़ा **' + m[3] + '**। वसूली में UPI का हिस्सा ' + m[4] + '% है।';
      }]
  ];

  /* ------------------------------------------------------------------------
     4. TRANSLATION ENGINE
     ------------------------------------------------------------------------ */
  function escRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  var LOWER = {};
  var keys = [];
  [PRODUCTS, PHRASES].forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      if (!LOWER[k.toLowerCase()]) {
        LOWER[k.toLowerCase()] = src[k];
        keys.push(k);
      }
    });
  });
  keys.sort(function (a, b) {
    return b.length - a.length;
  });

  var FALLBACK_RE = new RegExp('(?<![A-Za-z])(?:' + keys.map(escRe).join('|') + ')(?![A-Za-z])', 'gi');
  var UNIT_RE = new RegExp('(\\d+(?:\\.\\d+)?)\\s+(' + Object.keys(UNITS).filter(function (u) { return u !== 'day' && u !== 'days'; }).join('|') + ')(?![A-Za-z])', 'g');
  var hasEnglish = function (s) {
    return /[A-Za-z]{2}/.test(s);
  };

  function T(s) {
    return tr(s, true);
  }

  function tr(s) {
    if (!isHi() || typeof s !== 'string') return s;
    var m0 = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
    var lead = m0[1], core = m0[2].replace(/\s+/g, ' '), tail = m0[3];
    if (!core || !hasEnglish(core)) return s;

    var out = core;
    var i, m;
    if (DICT.hasOwnProperty(out)) return lead + DICT[out] + tail;
    if (PRODUCTS.hasOwnProperty(out)) return lead + PRODUCTS[out] + tail;
    if (UNITS.hasOwnProperty(out)) return lead + UNITS[out] + tail;
    for (i = 0; i < P.length; i++) {
      m = out.match(P[i][0]);
      if (m) {
        out = P[i][1].replace(/\$(\d)/g, function (_, n) {
          return T(m[+n] || '');
        });
        return lead + fallback(out) + tail;
      }
    }
    return lead + fallback(out) + tail;
  }

  function fallback(s) {
    if (!hasEnglish(s)) return s;
    return s
      .replace(UNIT_RE, function (_, n, u) {
        return n + ' ' + UNITS[u];
      })
      .replace(FALLBACK_RE, function (w) {
        return LOWER[w.toLowerCase()] || w;
      });
  }

  function trChat(text) {
    if (!isHi() || typeof text !== 'string') return text;
    return text.split('\n').map(function (line) {
      var plain = line.trim();
      if (DICT.hasOwnProperty(plain)) return DICT[plain];
      for (var i = 0; i < C.length; i++) {
        var m = plain.match(C[i][0]);
        if (m) return C[i][1](m);
      }
      return tr(line);
    }).join('\n');
  }

  /* ------------------------------------------------------------------------
     5. DOM TRANSLATOR (runs automatically via MutationObserver)
     ------------------------------------------------------------------------ */
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  var observer = null;
  var SKIP_TAG = /^(SCRIPT|STYLE|CANVAS|TEXTAREA|NOSCRIPT)$/;

  function inUserBubble(node) {
    var el = node.parentElement;
    return !!(el && el.closest && el.closest('.rounded-br-sm'));
  }

  function fixOption(el) {
    if (el.tagName === 'OPTION' && !el.hasAttribute('value')) {
      el.setAttribute('value', el.textContent);
    }
  }

  function translateNode(root) {
    if (!isHi() || !root) return;
    if (root.nodeType === 3) {
      var p = root.parentElement;
      if (p && (SKIP_TAG.test(p.tagName) || p.closest('[data-i18n-skip]'))) return;
      var v = root.nodeValue;
      if (!hasEnglish(v)) return;
      var nv = inUserBubble(root) ? (DICT[v.trim()] ? tr(v) : v) : tr(v);
      if (nv !== v) {
        if (p) fixOption(p);
        root.nodeValue = nv;
      }
      return;
    }
    if (root.nodeType !== 1) return;
    if (SKIP_TAG.test(root.tagName) || (root.closest && root.closest('[data-i18n-skip]'))) return;

    var els = [root].concat([].slice.call(root.querySelectorAll('*')));
    els.forEach(function (el) {
      if (SKIP_TAG.test(el.tagName) || el.hasAttribute('data-i18n-skip')) return;
      ATTRS.forEach(function (a) {
        var val = el.getAttribute(a);
        if (val && hasEnglish(val)) {
          var t = tr(val);
          if (t !== val) el.setAttribute(a, t);
        }
      });
    });

    var w = document.createTreeWalker(root, 4, null);
    var n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(translateNode);
  }

  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(function (records) {
      observer.disconnect();
      try {
        records.forEach(function (r) {
          if (r.type === 'childList') r.addedNodes.forEach(translateNode);
          else if (r.type === 'characterData') translateNode(r.target);
          else if (r.type === 'attributes') {
            var val = r.target.getAttribute(r.attributeName);
            if (val && hasEnglish(val)) {
              var t = tr(val);
              if (t !== val) r.target.setAttribute(r.attributeName, t);
            }
          }
        });
        ensureToggle();
      } finally {
        connect();
      }
    });
    connect();
  }

  function connect() {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  }

  /* ------------------------------------------------------------------------
     6. LANGUAGE TOGGLE BUTTON (injected cleanly into active header)
     ------------------------------------------------------------------------ */
  function buttonHtml() {
    return (
      '<button type="button" data-act="lang-toggle" data-i18n-skip="1" title="' +
      (isHi() ? 'Switch to English' : 'हिंदी में बदलें') +
      '" aria-label="Language" ' +
      'class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand/40 hover:text-brand">' +
      '<svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/></svg>' +
      '<span>' +
      (isHi() ? 'English' : 'हिन्दी') +
      '</span></button>'
    );
  }

  function ensureToggle() {
    var existing = document.querySelector('[data-act="lang-toggle"]');
    if (existing) {
      var label = existing.querySelector('span');
      var want = isHi() ? 'English' : 'हिन्दी';
      if (label && label.textContent !== want) {
        label.textContent = want;
        existing.title = isHi() ? 'Switch to English' : 'हिंदी में बदलें';
      }
      return;
    }
    var wrap;
    var login = document.querySelector('button[data-act="open-login"]');
    var logout = document.querySelector('header button[data-act="logout"]');
    var pos = document.querySelector('button[data-act="tb-pos"]');
    if (login) {
      wrap = document.createElement('span');
      wrap.className = 'flex items-center gap-3';
      login.parentNode.insertBefore(wrap, login);
      wrap.insertAdjacentHTML('beforeend', buttonHtml());
      wrap.appendChild(login);
    } else if (logout) {
      logout.parentNode.insertAdjacentHTML('afterbegin', buttonHtml());
    } else if (pos) {
      pos.insertAdjacentHTML('beforebegin', buttonHtml());
    }
  }

  /* ------------------------------------------------------------------------
     7. HOOKS INTO EXISTING FUNCTIONS
     ------------------------------------------------------------------------ */
  function wrap(name, make) {
    try {
      var orig = window[name];
      if (typeof orig === 'function') window[name] = make(orig);
    } catch (e) {
      /* ignore */
    }
  }

  ['toLocaleDateString', 'toLocaleTimeString', 'toLocaleString'].forEach(function (fn) {
    var orig = Date.prototype[fn];
    Date.prototype[fn] = function (loc) {
      var a = [].slice.call(arguments);
      if (isHi() && (loc === 'en-IN' || loc === 'en-US' || loc === undefined)) a[0] = 'hi-IN';
      return orig.apply(this, a);
    };
  });

  wrap('renderRich', function (orig) {
    return function (t) {
      return orig(trChat(t));
    };
  });

  var HIKEYS = [
    ['स्टॉक में कम', 'low stock'], ['मार्जिन', 'margin'],
    ['दूध', 'milk'], ['अंडा', 'egg'], ['अंडे', 'egg'], ['ब्रेड', 'bread'], ['पनीर', 'paneer'],
    ['दही', 'curd'], ['मक्खन', 'butter'], ['टमाटर', 'tomato'], ['प्याज', 'onion'], ['प्याज़', 'onion'],
    ['आटा', 'atta'], ['चावल', 'rice'], ['चीनी', 'sugar'], ['नमक', 'salt'], ['मैगी', 'maggi'],
    ['बिस्कुट', 'biscuit'], ['चाय', 'tea'], ['रीस्टॉक', 'restock'], ['ऑर्डर', 'order'],
    ['एक्सपायर', 'expiring'], ['बर्बादी', 'wastage'], ['क्षति', 'wastage'], ['खराब', 'spoil'], ['छूट', 'discount'],
    ['सबसे ज़्यादा बिक', 'top selling'], ['सबसे ज्यादा बिक', 'top selling'], ['बेस्ट', 'best'],
    ['डेड स्टॉक', 'dead stock'], ['नहीं बिक', 'not selling'], ['खाता', 'khata'], ['उधार', 'udhar'],
    ['बकाया', 'owe'], ['बिक्री', 'sales'], ['मुनाफ', 'profit'], ['आज', 'today'],
    ['कितना', 'how much'], ['कितनी', 'how much']
  ];

  wrap('answer', function (orig) {
    return function (q, c) {
      var extra = [];
      HIKEYS.forEach(function (k) {
        if (q.indexOf(k[0]) !== -1) extra.push(k[1]);
      });
      return orig(extra.length ? q + ' ' + extra.join(' ') : q, c);
    };
  });

  wrap('buildConfig', function (orig) {
    return function (s, animate) {
      var cfg = orig(s, animate);
      if (isHi() && cfg && cfg.data && Array.isArray(cfg.data.labels)) {
        cfg.data.labels = cfg.data.labels.map(function (l) {
          return typeof l === 'string' ? tr(l) : l;
        });
        try {
          var cb = cfg.options.plugins.tooltip.callbacks;
          if (cb && cb.label) {
            var ol = cb.label;
            cb.label = function (c) {
              var r = ol(c);
              return typeof r === 'string' ? tr(r) : r;
            };
          }
        } catch (e) {
          /* ignore */
        }
      }
      return cfg;
    };
  });

  wrap('printReceipt', function (orig) {
    return function (b) {
      var ow = window.open;
      window.open = function () {
        var w = ow.apply(window, arguments);
        try {
          var dw = w.document.write.bind(w.document);
          w.document.write = function (html) {
            return dw(
              isHi()
                ? String(html).replace(/>([^<]+)</g, function (_, t) {
                    return '>' + tr(t) + '<';
                  })
                : html
            );
          };
        } catch (e) {
          /* ignore */
        }
        return w;
      };
      try {
        return orig(b);
      } finally {
        window.open = ow;
      }
    };
  });

  ['SpeechRecognition', 'webkitSpeechRecognition'].forEach(function (name) {
    var Orig = window[name];
    if (!Orig) return;
    window[name] = function () {
      var rec = new Orig();
      var desc = {
        configurable: true,
        get: function () {
          return isHi() ? 'hi-IN' : 'en-IN';
        },
        set: function () {
          /* ignore */
        }
      };
      try {
        Object.defineProperty(rec, 'lang', desc);
      } catch (e) {
        /* ignore */
      }
      return rec;
    };
  });

  /* ------------------------------------------------------------------------
     8. DEVANAGARI FONT SUPPORT
     ------------------------------------------------------------------------ */
  function applyFont() {
    document.documentElement.lang = isHi() ? 'hi' : 'en';
    var st = document.getElementById('i18n-style');
    if (!st) {
      st = document.createElement('style');
      st.id = 'i18n-style';
      document.head.appendChild(st);
    }
    st.textContent = isHi()
      ? 'html[lang="hi"] body,html[lang="hi"] .font-sans{font-family:"Inter","Noto Sans Devanagari",ui-sans-serif,system-ui,sans-serif}' +
        'html[lang="hi"] .font-serif{font-family:"Instrument Serif","Noto Serif Devanagari",ui-serif,Georgia,serif}' +
        'html[lang="hi"] h1.font-serif,html[lang="hi"] h2.font-serif,html[lang="hi"] h3.font-serif{line-height:1.25}'
      : '';
    if (isHi() && !document.getElementById('i18n-font')) {
      var l = document.createElement('link');
      l.id = 'i18n-font';
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@400;500&display=swap';
      document.head.appendChild(l);
    }
    if (!window.__i18nTitle) window.__i18nTitle = document.title;
    document.title = isHi() ? tr(window.__i18nTitle) : window.__i18nTitle;
  }

  /* ------------------------------------------------------------------------
     9. LANGUAGE SWITCH HANDLER
     ------------------------------------------------------------------------ */
  function setLang(l) {
    LANG = l === 'hi' ? 'hi' : 'en';
    try {
      localStorage.setItem(KEY, LANG);
    } catch (e) {
      /* ignore */
    }
    applyFont();
    try {
      if (UI.page === 'dashboard') {
        renderApp();
        renderChat();
      } else {
        renderPage();
      }
      renderLogin();
      renderNet();
      renderToasts();
    } catch (e) {
      console.warn('i18n re-render failed', e);
    }
    if (isHi()) translateNode(document.body);
    ensureToggle();
    window.dispatchEvent(new CustomEvent('language-changed', { detail: LANG }));
  }

  ACT['lang-toggle'] = function () {
    setLang(isHi() ? 'en' : 'hi');
  };

  window.i18n = {
    tr: tr,
    setLang: setLang,
    getLang: function () {
      return LANG;
    }
  };

  applyFont();
  startObserver();
  if (isHi()) translateNode(document.body);
  ensureToggle();
})();
