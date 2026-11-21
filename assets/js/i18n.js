(function () {
  'use strict';
  var translations = {
    Home:'الرئيسية', About:'من نحن', 'About Us':'من نحن', Products:'المنتجات', Shop:'تسوّق',
    Wholesale:'الجملة', 'Wholesale & business':'الجملة والشركات', Contact:'تواصل معنا', Account:'حسابي',
    'My Account':'حسابي', Cart:'السلة', 'Business inquiry':'استفسار للشركات', 'Request a quotation':'اطلب عرض سعر',
    'Talk to sales':'تواصل مع المبيعات', 'Explore Our Products':'تصفّح منتجاتنا', 'Business Solutions':'حلول الشركات',
    'View all products':'عرض كل المنتجات', Add:'أضف', Added:'تمت الإضافة', 'Continue shopping':'متابعة التسوق',
    'Proceed to checkout':'إتمام الطلب', 'Clear all filters':'مسح كل عوامل التصفية', 'Search products':'ابحث عن المنتجات',
    'Filter by category':'تصفية حسب الفئة', 'Sort products':'ترتيب المنتجات', Category:'الفئة', 'Pack size':'حجم العبوة',
    Price:'السعر', 'Any price':'كل الأسعار', 'Under 150 EGP':'أقل من ١٥٠ ج.م', '150 – 200 EGP':'١٥٠ – ٢٠٠ ج.م',
    'Over 200 EGP':'أكثر من ٢٠٠ ج.م', 'Sort: Featured':'الترتيب: المميزة', 'Price: low to high':'السعر: من الأقل للأعلى',
    'Price: high to low':'السعر: من الأعلى للأقل', 'Name: A–Z':'الاسم: أ–ي', All:'الكل',
    'Whole Birds':'دجاج كامل', 'Fresh Cuts':'قطعيات طازجة', 'Boneless & Fillets':'منزوع العظم وفيليه',
    'Ready to Cook':'جاهز للطهي', '500 g pack':'عبوة ٥٠٠ جم', '1 kg tray':'صينية ١ كجم', 'Whole bird':'دجاجة كاملة',
    'Your order':'طلبك', 'Your cart.':'سلتك.', 'Your cart is empty.':'سلتك فارغة.',
    'Nothing here yet — explore the range and add your favourites.':'لا توجد منتجات بعد — تصفّح التشكيلة وأضف ما تفضله.',
    'Explore products':'تصفّح المنتجات', 'Order summary':'ملخص الطلب', Subtotal:'المجموع الفرعي', Delivery:'التوصيل',
    Total:'الإجمالي', 'Edit cart':'تعديل السلة', Undo:'تراجع', 'Prototype state':'حالة تجريبية',
    'With items':'تحتوي على منتجات', Empty:'فارغة', 'Sample prices':'أسعار تجريبية', 'Sample price':'سعر تجريبي',
    'Sample prices & specs':'أسعار ومواصفات تجريبية',
    'Delivery fee and final total confirmed at checkout. Prices shown are sample values.':'يُؤكَّد سعر التوصيل والإجمالي النهائي عند إتمام الطلب. الأسعار المعروضة تجريبية.',
    Checkout:'إتمام الطلب', 'Secure checkout · payment options to be confirmed':'إتمام آمن للطلب · خيارات الدفع قيد التأكيد',
    'Your details':'بياناتك', 'Full name':'الاسم بالكامل', 'Phone number':'رقم الهاتف', Email:'البريد الإلكتروني',
    'Email (optional)':'البريد الإلكتروني (اختياري)', 'Delivery area':'منطقة التوصيل', 'Select delivery area':'اختر منطقة التوصيل',
    'Street address':'عنوان الشارع', 'Building, floor, apartment':'المبنى، الطابق، الشقة', 'Delivery notes':'ملاحظات التوصيل',
    Payment:'الدفع', 'Cash on delivery':'الدفع عند الاستلام', 'To be confirmed':'قيد التأكيد', 'Card payment':'الدفع بالبطاقة',
    'Provider to be confirmed':'سيتم تأكيد مزود الخدمة', Confirm:'تأكيد', 'I agree to the terms of sale and delivery':'أوافق على شروط البيع والتوصيل',
    'I agree to the terms and privacy policy':'أوافق على الشروط وسياسة الخصوصية', Quantity:'الكمية', Weight:'الوزن',
    Packaging:'التعبئة', Description:'الوصف', Specifications:'المواصفات', Storage:'التخزين', 'Shelf life':'مدة الصلاحية',
    'Product code':'رمز المنتج', 'Storage & handling':'التخزين والتداول', 'Related products':'منتجات ذات صلة',
    'You may also like':'قد يعجبك أيضًا', 'View all':'عرض الكل',
    'Buying in bulk? Request wholesale pricing':'تشتري بكميات كبيرة؟ اطلب أسعار الجملة', 'Built for':'مصمم لـ',
    'business.':'الشركات.', Ready:'إمداد', 'reliable supply.':'موثوق.', Retail:'تجزئة', 'Partnering with business':'شراكتنا مع الشركات',
    'Who we work with':'الجهات التي نخدمها', 'Business customers.':'عملاؤنا من الشركات.', Traders:'التجار', Distributors:'الموزعون',
    'Restaurants & catering':'المطاعم والضيافة', 'Food businesses':'شركات الأغذية', 'Wholesale range':'تشكيلة الجملة',
    'Build your':'جهّز', 'quotation.':'طلب عرض السعر.', 'Go to form':'انتقل إلى النموذج', Product:'المنتج',
    'products in your quote':'منتجات في عرض السعر', 'Let’s':'لنتحدث', 'talk.':'معًا.', '/ Get in touch':'/ تواصل معنا',
    '/ Send a message':'/ أرسل رسالة', Topic:'الموضوع', 'Select a topic':'اختر موضوعًا', 'General enquiry':'استفسار عام',
    'Order support':'مساعدة بخصوص الطلب', 'Business / wholesale':'الشركات / الجملة', Feedback:'ملاحظات', Message:'الرسالة',
    'Send message':'إرسال الرسالة', 'Message sent.':'تم إرسال الرسالة.', 'Send another':'إرسال رسالة أخرى', Phone:'الهاتف',
    Address:'العنوان', 'Working hours':'ساعات العمل', Follow:'تابعنا',
    'Logged out':'تم تسجيل الخروج', 'Logged in':'تم تسجيل الدخول', 'Sign in':'تسجيل الدخول', 'Create account':'إنشاء حساب',
    'Welcome back.':'أهلًا بعودتك.', 'Email or phone':'البريد الإلكتروني أو الهاتف', Password:'كلمة المرور',
    'Keep me signed in':'إبقائي مسجلًا', 'Forgot password?':'هل نسيت كلمة المرور؟', 'New to AL AMIN?':'هل أنت جديد لدى الأمين؟',
    'Create an account':'أنشئ حسابًا', 'Create your account.':'أنشئ حسابك.', 'Confirm password':'تأكيد كلمة المرور',
    'Latest order':'أحدث طلب', 'Out for delivery':'خرج للتوصيل', 'Track order':'تتبّع الطلب', 'Default address':'العنوان الافتراضي',
    Manage:'إدارة', 'Quick reorder':'إعادة الطلب بسرعة', Reorder:'اطلب مجددًا', Farm:'المزرعة', Production:'الإنتاج',
    'Quality control':'مراقبة الجودة', 'Campaign still · placeholder for commissioned photography':'صورة الحملة · بانتظار صور احترافية',
    'Quality-Focused Production':'إنتاج يركّز على الجودة', 'Reliable Supply':'إمداد يُعتمد عليه',
    'Products for Every Need':'منتجات لكل احتياج', 'Individual & Business Solutions':'حلول للأفراد والشركات',
    'Cut for':'تشكيلة لكل', 'every kitchen.':'مطبخ.',
    'From whole birds to ready-to-cook favourites — explore the range by the way you cook.':'من الدجاج الكامل إلى الأصناف الجاهزة للطهي — تصفّح التشكيلة حسب طريقة طهيك.',
    'Whole Fresh Chicken':'دجاجة كاملة طازجة', 'Chicken Breast Fillets':'فيليه صدور الدجاج', 'Boneless Thighs':'أفخاذ منزوعة العظم',
    'Chicken Wings':'أجنحة الدجاج', Drumsticks:'دبابيس الدجاج', 'Leg Quarters':'أوراك الدجاج', 'Minced Chicken':'دجاج مفروم',
    'Shish Tawook Cubes':'مكعبات شيش طاووق', 'Breaded Escalope':'بانيه الدجاج', 'Liver & Gizzards':'كبد وقوانص',
    Explore:'استكشف', Scroll:'مرّر', 'Show password':'إظهار كلمة المرور', 'Hide password':'إخفاء كلمة المرور',
    'Open menu':'فتح القائمة', 'Close menu':'إغلاق القائمة', 'My account':'حسابي', Previous:'السابق', Next:'التالي',
    'Decrease quantity':'تقليل الكمية', 'Increase quantity':'زيادة الكمية', 'Switch to English':'التبديل إلى الإنجليزية'
  };

  var textState = new WeakMap(), attrState = new WeakMap();
  function translate(value) {
    var key = value.trim();
    if (Object.prototype.hasOwnProperty.call(translations, key)) return value.replace(key, translations[key]);
    var match = key.match(/^View (.+)$/); if (match) return value.replace(key, 'عرض ' + match[1]);
    match = key.match(/^Add: (.+)$/); if (match) return value.replace(key, 'أضف: ' + match[1]);
    match = key.match(/^Image (\d+)$/); if (match) return value.replace(key, 'الصورة ' + match[1]);
    match = key.match(/^Stage (.+)$/); if (match) return value.replace(key, 'المرحلة ' + match[1]);
    return value;
  }
  function scan() {
    var app = document.getElementById('app'); if (!app) return;
    var lang = window.siteLang || 'en';
    var walker = document.createTreeWalker(app, NodeFilter.SHOW_TEXT), node;
    while ((node = walker.nextNode())) {
      var current = node.nodeValue, state = textState.get(node);
      var original = state && state.rendered === current ? state.original : current;
      var rendered = lang === 'ar' ? translate(original) : original;
      if (rendered !== current) node.nodeValue = rendered;
      textState.set(node, { original: original, rendered: rendered });
    }
    app.querySelectorAll('*').forEach(function (el) {
      var states = attrState.get(el) || {};
      ['aria-label', 'placeholder', 'title', 'alt'].forEach(function (name) {
        if (!el.hasAttribute(name)) return;
        var current = el.getAttribute(name), state = states[name];
        var original = state && state.rendered === current ? state.original : current;
        var rendered = lang === 'ar' ? translate(original) : original;
        if (rendered !== current) el.setAttribute(name, rendered);
        states[name] = { original: original, rendered: rendered };
      });
      attrState.set(el, states);
    });
    app.querySelectorAll('a.lang').forEach(function (link) {
      var label = lang === 'ar' ? 'EN' : 'عربي';
      if (link.textContent.trim() !== label) link.textContent = label;
      link.setAttribute('lang', lang === 'ar' ? 'en' : 'ar');
      link.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    });
  }
  window.siteLang = localStorage.getItem('alAminLanguage') || 'en';
  window.setSiteLanguage = function (lang, persist) {
    window.siteLang = lang === 'ar' ? 'ar' : 'en';
    if (persist !== false) localStorage.setItem('alAminLanguage', window.siteLang);
    document.documentElement.lang = window.siteLang;
    document.documentElement.dir = window.siteLang === 'ar' ? 'rtl' : 'ltr';
    var shell = document.querySelector('#app .aa');
    if (shell) shell.setAttribute('dir', window.siteLang === 'ar' ? 'rtl' : 'ltr');
    var titles = {
      'About AL AMIN':'من نحن — الأمين', 'Products — AL AMIN':'المنتجات — الأمين',
      'Chicken Breast Fillets — AL AMIN':'فيليه صدور الدجاج — الأمين', 'Cart — AL AMIN':'السلة — الأمين',
      'Checkout — AL AMIN':'إتمام الطلب — الأمين', 'Wholesale & Business — AL AMIN':'الجملة والشركات — الأمين',
      'Contact — AL AMIN':'تواصل معنا — الأمين', 'My Account — AL AMIN':'حسابي — الأمين'
    };
    if (window.siteLang === 'ar' && titles[document.title]) document.title = titles[document.title];
    if (window.siteLang === 'en') {
      Object.keys(titles).some(function (english) {
        if (titles[english] === document.title) { document.title = english; return true; }
        return false;
      });
    }
    scan();
  };
  new MutationObserver(scan).observe(document.documentElement, { childList:true, subtree:true, characterData:true });
})();
