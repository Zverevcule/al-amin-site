PAGES["Home"]={cls:(function(DCLogic){

class Component extends DCLogic {

  constructor(props){ super(props); this.state = Object.assign({ menuOpen: !!(props && props.menuOpen), cart: 3, bump: 0, added: {}, toast: null }, this.initState ? this.initState(props) : {}); }
  componentDidMount(){ this._off = this.aaBoot(); if (this.didMount) this.didMount(); }
  componentWillUnmount(){ if (this._off) this._off(); clearTimeout(this._tt); }
  aaBoot(){
    const doc = document, html = doc.documentElement, win = window, offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) html.classList.add('rm'); else html.classList.add('mo');
    /* reveal */
    let io = null;
    if ('IntersectionObserver' in win && !reduce) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    const scan = () => doc.querySelectorAll('[data-rv]:not([data-in]):not([data-obs])').forEach((el) => { el.setAttribute('data-obs', ''); if (io) io.observe(el); else el.setAttribute('data-in', ''); });
    scan();
    const mo = new MutationObserver(() => scan()); mo.observe(doc.body, { childList: true, subtree: true });
    offs.push(() => { mo.disconnect(); if (io) io.disconnect(); });
    /* header + progress + parallax */
    let last = 0, ticking = false;
    const frame = () => {
      ticking = false;
      const y = win.scrollY || html.scrollTop || 0;
      const hdr = doc.querySelector('.hdr');
      if (hdr) {
        hdr.setAttribute('data-solid', (y > 40 || hdr.hasAttribute('data-force')) ? '1' : '0');
        hdr.setAttribute('data-hide', (y > last && y > 640) ? '1' : '0');
        const max = Math.max(1, html.scrollHeight - win.innerHeight);
        hdr.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
      }
      last = y;
      if (!reduce) {
        const vh = win.innerHeight;
        doc.querySelectorAll('[data-px]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const k = parseFloat(el.getAttribute('data-px')) || 0.1;
          el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -k).toFixed(1) + 'px,0)';
        });
      }
      if (this.onScrollFrame) this.onScrollFrame(y);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    on(win, 'scroll', req, { passive: true }); on(win, 'resize', req); frame();
    /* cursor */
    const fine = win.matchMedia && win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = doc.querySelector('.cur .cur-dot'), ring = doc.querySelector('.cur .cur-ring');
    if (fine && dot && ring) {
      let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, run = true;
      on(win, 'mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!html.classList.contains('cc')) { html.classList.add('cc'); rx = mx; ry = my; }
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      }, { passive: true });
      const loop = () => { if (!run) return; rx += (mx - rx) * (reduce ? 1 : 0.2); ry += (my - ry) * (reduce ? 1 : 0.2); ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'; raf = requestAnimationFrame(loop); };
      loop(); offs.push(() => { run = false; cancelAnimationFrame(raf); html.classList.remove('cc'); });
      on(doc, 'mouseover', (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-cursor],a,button,input,textarea,select,label') : null;
        if (!t) { ring.removeAttribute('data-mode'); return; }
        if (t.matches('input,textarea')) { ring.setAttribute('data-mode', 'text'); return; }
        const l = t.getAttribute('data-cursor');
        if (l) { ring.setAttribute('data-mode', 'label'); ring.setAttribute('data-label', l); }
        else ring.setAttribute('data-mode', 'link');
      });
      on(doc.documentElement, 'mouseleave', () => ring.setAttribute('data-mode', 'hide'));
    }
    /* magnetic */
    let mag = null;
    const release = () => { if (mag) { mag.style.transform = ''; mag.removeAttribute('data-magon'); mag = null; } };
    if (fine && !reduce) {
      on(doc, 'mousemove', (e) => {
        const m = e.target && e.target.closest ? e.target.closest('[data-mag]') : null;
        if (m !== mag) release();
        if (!m) return;
        mag = m; m.setAttribute('data-magon', '');
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = 'translate3d(' + (dx * 0.28).toFixed(1) + 'px,' + (dy * 0.4).toFixed(1) + 'px,0)';
      }, { passive: true });
    }
    /* drag-to-scroll rails */
    let drag = null;
    on(doc, 'pointerdown', (e) => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-drag]'); if (!r) return; drag = { r, x: e.clientX, s: r.scrollLeft, moved: false }; });
    on(win, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - drag.x; if (Math.abs(d) > 4) drag.moved = true; drag.r.scrollLeft = drag.s - d; });
    on(win, 'pointerup', () => { if (drag && drag.moved) { const r = drag.r; const kill = (ev) => { ev.preventDefault(); ev.stopPropagation(); r.removeEventListener('click', kill, true); }; r.addEventListener('click', kill, true); setTimeout(() => r.removeEventListener('click', kill, true), 0); } drag = null; });
    return () => offs.forEach((f) => f());
  }
  addToCart(p, qty){
    const added = Object.assign({}, this.state.added); added[p.id] = true;
    this.setState({ cart: this.state.cart + (qty || 1), bump: this.state.bump + 1, added, toast: { name: p.name } });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { const a = Object.assign({}, this.state.added); delete a[p.id]; this.setState({ added: a, toast: null }); }, 2600);
  }
  baseVals(){
    const s = this.state;
    return {
      menuOpen: s.menuOpen,
      menuStr: s.menuOpen ? 'true' : 'false',
      toggleMenu: () => this.setState({ menuOpen: !this.state.menuOpen }),
      closeMenu: () => this.setState({ menuOpen: false }),
      cart: s.cart,
      bumpCls: s.bump === 0 ? '' : (s.bump % 2 ? 'bump1' : 'bump2'),
      toast: s.toast, hasToast: !!s.toast, toastName: s.toast ? s.toast.name : '',
      closeToast: () => this.setState({ toast: null })
    };
  }
  productList(lang){
    const P = [{"id": "whole", "pack": true, "img": "img:whole-chicken-01", "img2": "img:whole-chicken-02", "no": "01", "cat": "whole", "name": "Whole Fresh Chicken", "name_ar": "دجاجة كاملة طازجة", "weight": "≈ 1.2 kg", "weight_ar": "≈ ١٫٢ كجم", "price": 165, "tone": "ph--warm", "tone2": "ph--ice", "shot": "Whole bird on butcher paper, top-down, soft window light", "shot_ar": "دجاجة كاملة على ورق جزارة، لقطة علوية بإضاءة نافذة ناعمة", "desc": "Cleaned and ready for roasting, grilling or slow cooking.", "desc_ar": "منظفة وجاهزة للشوي أو التحمير أو الطهي البطيء."}, {"id": "breast", "img": "img:chicken-breast-01", "img2": "img:chicken-breast-02", "no": "02", "cat": "boneless", "name": "Chicken Breast Fillets", "name_ar": "فيليه صدور الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 245, "tone": "ph--clay", "tone2": "ph--warm", "shot": "Fillets on dark slate, herbs, 45° hero angle", "shot_ar": "فيليه على حجر داكن مع أعشاب، زاوية ٤٥°", "desc": "Lean, skinless fillets trimmed for everyday cooking.", "desc_ar": "فيليه منزوع الجلد ومُشذّب للطهي اليومي."}, {"id": "thigh", "img": "img:boneless-thighs-01", "img2": "img:boneless-thighs-02", "no": "03", "cat": "boneless", "name": "Boneless Thighs", "name_ar": "أفخاذ منزوعة العظم", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 210, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Thigh fillets in a ceramic dish, side light", "shot_ar": "أفخاذ في طبق خزفي بإضاءة جانبية", "desc": "Juicy and forgiving — made for grills and stews.", "desc_ar": "طرية وغنية — مثالية للشوي واليخنات."}, {"id": "wings", "img": "img:chicken-wings-01", "img2": "img:chicken-wings-02", "no": "04", "cat": "cuts", "name": "Chicken Wings", "name_ar": "أجنحة الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 120, "tone": "ph--night", "tone2": "ph--warm", "shot": "Glazed wings in cast iron, dramatic low key", "shot_ar": "أجنحة مُلمّعة في مقلاة حديد، إضاءة درامية", "desc": "Whole wings for oven, air-fryer or grill.", "desc_ar": "أجنحة كاملة للفرن أو القلاية الهوائية أو الشواية."}, {"id": "drum", "img": "img:drumsticks-01", "img2": "img:drumsticks-02", "no": "05", "cat": "cuts", "name": "Drumsticks", "name_ar": "دبابيس الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 135, "tone": "ph--clay", "tone2": "ph--ice", "shot": "Drumsticks fanned on parchment, warm tones", "shot_ar": "دبابيس مرتبة على ورق زبدة، ألوان دافئة", "desc": "A family favourite for roasting and frying.", "desc_ar": "المفضلة للعائلة للتحمير والقلي."}, {"id": "quarter", "img": "img:leg-quarters-01", "img2": "img:leg-quarters-02", "no": "06", "cat": "cuts", "name": "Leg Quarters", "name_ar": "أوراك الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 125, "tone": "ph--warm", "tone2": "ph--night", "shot": "Leg quarters on board, natural daylight", "shot_ar": "أوراك على لوح تقطيع بإضاءة طبيعية", "desc": "Thigh and drumstick together, bone-in for flavour.", "desc_ar": "الفخذ والدبوس معًا بالعظم لنكهة أغنى."}, {"id": "mince", "img": "img:minced-chicken-01", "img2": "img:minced-chicken-02", "no": "07", "cat": "boneless", "name": "Minced Chicken", "name_ar": "دجاج مفروم", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 115, "tone": "ph--ice", "tone2": "ph--warm", "shot": "Mince in sealed tray, clean pack shot on white", "shot_ar": "مفروم في صينية مغلقة، لقطة عبوة على أبيض", "desc": "Finely minced for kofta, burgers and sauces.", "desc_ar": "مفروم ناعم للكفتة والبرجر والصلصات."}, {"id": "tawook", "img": "img:shish-tawook-01", "img2": "img:shish-tawook-02", "no": "08", "cat": "ready", "name": "Shish Tawook Cubes", "name_ar": "مكعبات شيش طاووق", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 140, "tone": "ph--clay", "tone2": "ph--night", "shot": "Marinated cubes on skewers, charcoal glow", "shot_ar": "مكعبات متبلة على أسياخ، وهج الفحم", "desc": "Marinated and cubed, ready for the skewer.", "desc_ar": "متبلة ومقطعة، جاهزة للأسياخ."}, {"id": "pane", "no": "09", "cat": "ready", "name": "Breaded Escalope", "name_ar": "بانيه الدجاج", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 155, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Golden escalope sliced, lemon, shallow depth", "shot_ar": "بانيه ذهبي مقطع مع ليمون، عمق ميدان ضحل", "desc": "Crumb-coated fillets for a quick golden finish.", "desc_ar": "فيليه مغطى بالبقسماط لتحمير ذهبي سريع."}, {"id": "liver", "no": "10", "cat": "cuts", "name": "Liver & Gizzards", "name_ar": "كبد وقوانص", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 65, "tone": "ph--night", "tone2": "ph--warm", "shot": "Pan-seared livers, onions, overhead", "shot_ar": "كبدة مشوحة مع بصل، لقطة علوية", "desc": "Cleaned and packed for traditional recipes.", "desc_ar": "منظفة ومعبأة للوصفات التقليدية."}];
    const C = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const ar = lang === 'ar' || window.siteLang === 'ar';
    return P.map((p, i) => {
      const c = C.find((x) => x.id === p.cat) || {};
      const o = { id: p.id, no: p.no, cat: p.cat, i: i % 4, price: p.price, priceS: p.price.toFixed(2), tone: p.tone, tone2: p.tone2,
        name: ar ? p.name_ar : p.name, weight: ar ? p.weight_ar : p.weight, shot: ar ? p.shot_ar : p.shot, desc: ar ? p.desc_ar : p.desc, catName: ar ? c.name_ar : c.name };
      o.img2 = p.img2 || ''; o.hasImg2 = !!p.img2; o.noImg2 = !p.img2; o.showB = !p.img || !!p.img2; o.img2Cls = p.img2 ? 'has-img' : '';
      o.img = p.img || ''; o.hasImg = !!p.img; o.noImg = !p.img; o.imgCls = p.img ? (p.pack ? 'has-img ph--pack' : 'has-img') : '';
      o.add = () => this.addToCart(o);
      o.addCls = this.state.added[p.id] ? 'add is-added' : 'add';
      return o;
    });
  }


  initState(){ return { cat: 'all', q: '', sort: 'featured', loading: false, why: 0, stage: 0, tIdx: 0 }; }
  didMount(){
    const steps = document.querySelectorAll('.jr-step');
    if ('IntersectionObserver' in window && steps.length) {
      this._jio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const i = parseInt(e.target.getAttribute('data-step'), 10) || 0; if (i !== this.state.stage) this.setState({ stage: i }); } }), { rootMargin: '-45% 0px -50% 0px' });
      steps.forEach((s) => this._jio.observe(s));
    }
  }
  componentWillUnmount(){ if (this._off) this._off(); if (this._jio) this._jio.disconnect(); clearTimeout(this._tt); clearTimeout(this._lt); }
  filt(patch){ this.setState(Object.assign({ loading: true }, patch)); clearTimeout(this._lt); this._lt = setTimeout(() => this.setState({ loading: false }), 450); }
  rail(dir){ const r = document.getElementById('bsRail'); if (!r) return; const rtl = "en" === 'ar'; r.scrollBy({ left: dir * (rtl ? -1 : 1) * 364, behavior: 'smooth' }); }
  renderVals(){
    const s = this.state, L = "en", D = {"why": [["Commitment to quality", "The AL AMIN name is our promise — every product is handled as if it were going to our own table.", "ph--warm", "Hands presenting a whole bird, warm daylight", "img:why-quality"], ["Customer trust", "Trust is earned through consistency: the same standard on the hundredth order as on the first.", "ph--clay", "Family kitchen, dinner being plated", "img:why-trust"], ["Reliable supply", "Planning, packing and dispatch organised around keeping homes and kitchens stocked.", "ph--steel", "Loading bay at dawn, crates in motion", "img:why-supply"], ["Product selection", "From whole birds to ready-to-cook cuts — a range shaped around how people really cook.", "ph--ice", "Range of packs on white, grid layout", "img:eggs-why"], ["For homes and businesses", "One brand, two journeys: order for your family, or source for your business.", "ph--night", "Restaurant pass, plated chicken dish", "img:why-homes"]], "stages": [["Farm", "It begins with the flock — raised with attention to environment, feed and welfare.", "ph--field", "Flock in open barn, low morning light", "img:journey-farm"], ["Production", "Processing carried out in controlled conditions, with hygiene at every step.", "ph--steel", "Stainless processing line, motion blur", "img:journey-production"], ["Quality control", "Products are checked before they move forward. Only what meets the standard goes on.", "ph--ice", "Inspector with tablet, clean white room", "img:journey-quality-control"], ["Packaging", "Sealed, labelled and packed to protect freshness from facility to fridge.", "ph--warm", "Trays being sealed, macro detail", "img:journey-packaging"], ["Delivery", "Dispatched to homes and businesses with care for the cold chain.", "ph--night", "Refrigerated van at dusk, tail lights", "img:journey-delivery"]], "tst": [["[Verified customer quote — a home customer describing freshness and the ordering experience.]", "[Customer name]", "Home customer"], ["[Verified quote — a restaurant partner on consistency and service.]", "[Restaurant name]", "Restaurant partner"], ["[Verified quote — a distributor on supply and working with the sales team.]", "[Company name]", "Distributor"]]};
    const all = this.productList(L);
    const q = s.q.trim().toLowerCase();
    let list = all.filter((p) => (s.cat === 'all' || p.cat === s.cat) && (!q || (p.name + ' ' + p.catName + ' ' + p.desc).toLowerCase().indexOf(q) > -1));
    if (s.sort === 'low') list = list.slice().sort((a, b) => a.price - b.price);
    if (s.sort === 'high') list = list.slice().sort((a, b) => b.price - a.price);
    if (s.sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name, L));
    const shown = list.slice(0, 8).map((p, i) => Object.assign({}, p, { i: i }));
    const cats = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const chips = [{ id: 'all', name: "All" }].concat(cats.map((c) => ({ id: c.id, name: L === 'ar' ? c.name_ar : c.name }))).map((c) => ({
      name: c.name, count: c.id === 'all' ? all.length : all.filter((p) => p.cat === c.id).length,
      pressed: s.cat === c.id ? 'true' : 'false', pick: () => this.filt({ cat: c.id }) }));
    const bestIds = ['breast', 'whole', 'tawook', 'wings', 'thigh', 'drum'];
    const best = bestIds.map((id, i) => Object.assign({}, all.find((p) => p.id === id), { i: 0 }));
    const why = D.why.map((w, i) => ({ title: w[0], text: w[1], tone: w[2], shot: w[3], img: w[4] || '', hasImg: !!w[4], noImg: !w[4], imgCls: w[4] ? 'has-img' : '', n: '0' + (i + 1), on: s.why === i ? 'on' : '', exp: s.why === i ? 'true' : 'false', pick: () => { if (this.state.why !== i) this.setState({ why: i }); } }));
    const stages = D.stages.map((w, i) => ({ title: w[0], text: w[1], tone: w[2], shot: w[3], img: w[4] || '', hasImg: !!w[4], noImg: !w[4], imgCls: w[4] ? 'has-img' : '', n: '0' + (i + 1), idx: String(i),
      cls: s.stage === i ? 'on' : (i < s.stage ? 'done' : ''),
      pick: () => { this.setState({ stage: i }); const el = document.querySelector('.jr-step[data-step="' + i + '"]'); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }));
    const tst = D.tst.map((x, i) => ({ quote: x[0], who: x[1], role: x[2], cls: s.tIdx === i ? 'on' : '', hidden: s.tIdx === i ? 'false' : 'true' }));
    return Object.assign(this.baseVals(), {
      best, chips, q: s.q, sort: s.sort, loading: s.loading,
      shown, shownN: shown.length, totalN: list.length,
      showGrid: !s.loading && list.length > 0, isEmpty: !s.loading && list.length === 0,
      setQ: (e) => this.filt({ q: e.target.value }), setSort: (e) => this.filt({ sort: e.target.value }),
      clearAll: () => this.filt({ q: '', cat: 'all', sort: 'featured' }),
      bsPrev: () => this.rail(-1), bsNext: () => this.rail(1),
      why, stages, stageN: '0' + (s.stage + 1), stageP: ((s.stage + 1) / 5).toFixed(2), stageName: D.stages[s.stage][0], fillH: (s.stage / 4 * 100).toFixed(1) + '%',
      tst, tN: s.tIdx + 1, tP: ((s.tIdx + 1) / 3).toFixed(3),
      tPrev: () => this.setState({ tIdx: (this.state.tIdx + 2) % 3 }), tNext: () => this.setState({ tIdx: (this.state.tIdx + 1) % 3 })
    });
  }

}

return Component;})(window.DCLogic)};
PAGES["Home-AR"]={cls:(function(DCLogic){

class Component extends DCLogic {

  constructor(props){ super(props); this.state = Object.assign({ menuOpen: !!(props && props.menuOpen), cart: 3, bump: 0, added: {}, toast: null }, this.initState ? this.initState(props) : {}); }
  componentDidMount(){ this._off = this.aaBoot(); if (this.didMount) this.didMount(); }
  componentWillUnmount(){ if (this._off) this._off(); clearTimeout(this._tt); }
  aaBoot(){
    const doc = document, html = doc.documentElement, win = window, offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) html.classList.add('rm'); else html.classList.add('mo');
    /* reveal */
    let io = null;
    if ('IntersectionObserver' in win && !reduce) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    const scan = () => doc.querySelectorAll('[data-rv]:not([data-in]):not([data-obs])').forEach((el) => { el.setAttribute('data-obs', ''); if (io) io.observe(el); else el.setAttribute('data-in', ''); });
    scan();
    const mo = new MutationObserver(() => scan()); mo.observe(doc.body, { childList: true, subtree: true });
    offs.push(() => { mo.disconnect(); if (io) io.disconnect(); });
    /* header + progress + parallax */
    let last = 0, ticking = false;
    const frame = () => {
      ticking = false;
      const y = win.scrollY || html.scrollTop || 0;
      const hdr = doc.querySelector('.hdr');
      if (hdr) {
        hdr.setAttribute('data-solid', (y > 40 || hdr.hasAttribute('data-force')) ? '1' : '0');
        hdr.setAttribute('data-hide', (y > last && y > 640) ? '1' : '0');
        const max = Math.max(1, html.scrollHeight - win.innerHeight);
        hdr.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
      }
      last = y;
      if (!reduce) {
        const vh = win.innerHeight;
        doc.querySelectorAll('[data-px]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const k = parseFloat(el.getAttribute('data-px')) || 0.1;
          el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -k).toFixed(1) + 'px,0)';
        });
      }
      if (this.onScrollFrame) this.onScrollFrame(y);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    on(win, 'scroll', req, { passive: true }); on(win, 'resize', req); frame();
    /* cursor */
    const fine = win.matchMedia && win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = doc.querySelector('.cur .cur-dot'), ring = doc.querySelector('.cur .cur-ring');
    if (fine && dot && ring) {
      let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, run = true;
      on(win, 'mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!html.classList.contains('cc')) { html.classList.add('cc'); rx = mx; ry = my; }
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      }, { passive: true });
      const loop = () => { if (!run) return; rx += (mx - rx) * (reduce ? 1 : 0.2); ry += (my - ry) * (reduce ? 1 : 0.2); ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'; raf = requestAnimationFrame(loop); };
      loop(); offs.push(() => { run = false; cancelAnimationFrame(raf); html.classList.remove('cc'); });
      on(doc, 'mouseover', (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-cursor],a,button,input,textarea,select,label') : null;
        if (!t) { ring.removeAttribute('data-mode'); return; }
        if (t.matches('input,textarea')) { ring.setAttribute('data-mode', 'text'); return; }
        const l = t.getAttribute('data-cursor');
        if (l) { ring.setAttribute('data-mode', 'label'); ring.setAttribute('data-label', l); }
        else ring.setAttribute('data-mode', 'link');
      });
      on(doc.documentElement, 'mouseleave', () => ring.setAttribute('data-mode', 'hide'));
    }
    /* magnetic */
    let mag = null;
    const release = () => { if (mag) { mag.style.transform = ''; mag.removeAttribute('data-magon'); mag = null; } };
    if (fine && !reduce) {
      on(doc, 'mousemove', (e) => {
        const m = e.target && e.target.closest ? e.target.closest('[data-mag]') : null;
        if (m !== mag) release();
        if (!m) return;
        mag = m; m.setAttribute('data-magon', '');
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = 'translate3d(' + (dx * 0.28).toFixed(1) + 'px,' + (dy * 0.4).toFixed(1) + 'px,0)';
      }, { passive: true });
    }
    /* drag-to-scroll rails */
    let drag = null;
    on(doc, 'pointerdown', (e) => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-drag]'); if (!r) return; drag = { r, x: e.clientX, s: r.scrollLeft, moved: false }; });
    on(win, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - drag.x; if (Math.abs(d) > 4) drag.moved = true; drag.r.scrollLeft = drag.s - d; });
    on(win, 'pointerup', () => { if (drag && drag.moved) { const r = drag.r; const kill = (ev) => { ev.preventDefault(); ev.stopPropagation(); r.removeEventListener('click', kill, true); }; r.addEventListener('click', kill, true); setTimeout(() => r.removeEventListener('click', kill, true), 0); } drag = null; });
    return () => offs.forEach((f) => f());
  }
  addToCart(p, qty){
    const added = Object.assign({}, this.state.added); added[p.id] = true;
    this.setState({ cart: this.state.cart + (qty || 1), bump: this.state.bump + 1, added, toast: { name: p.name } });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { const a = Object.assign({}, this.state.added); delete a[p.id]; this.setState({ added: a, toast: null }); }, 2600);
  }
  baseVals(){
    const s = this.state;
    return {
      menuOpen: s.menuOpen,
      menuStr: s.menuOpen ? 'true' : 'false',
      toggleMenu: () => this.setState({ menuOpen: !this.state.menuOpen }),
      closeMenu: () => this.setState({ menuOpen: false }),
      cart: s.cart,
      bumpCls: s.bump === 0 ? '' : (s.bump % 2 ? 'bump1' : 'bump2'),
      toast: s.toast, hasToast: !!s.toast, toastName: s.toast ? s.toast.name : '',
      closeToast: () => this.setState({ toast: null })
    };
  }
  productList(lang){
    const P = [{"id": "whole", "pack": true, "img": "img:whole-chicken-01", "img2": "img:whole-chicken-02", "no": "01", "cat": "whole", "name": "Whole Fresh Chicken", "name_ar": "دجاجة كاملة طازجة", "weight": "≈ 1.2 kg", "weight_ar": "≈ ١٫٢ كجم", "price": 165, "tone": "ph--warm", "tone2": "ph--ice", "shot": "Whole bird on butcher paper, top-down, soft window light", "shot_ar": "دجاجة كاملة على ورق جزارة، لقطة علوية بإضاءة نافذة ناعمة", "desc": "Cleaned and ready for roasting, grilling or slow cooking.", "desc_ar": "منظفة وجاهزة للشوي أو التحمير أو الطهي البطيء."}, {"id": "breast", "img": "img:chicken-breast-01", "img2": "img:chicken-breast-02", "no": "02", "cat": "boneless", "name": "Chicken Breast Fillets", "name_ar": "فيليه صدور الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 245, "tone": "ph--clay", "tone2": "ph--warm", "shot": "Fillets on dark slate, herbs, 45° hero angle", "shot_ar": "فيليه على حجر داكن مع أعشاب، زاوية ٤٥°", "desc": "Lean, skinless fillets trimmed for everyday cooking.", "desc_ar": "فيليه منزوع الجلد ومُشذّب للطهي اليومي."}, {"id": "thigh", "img": "img:boneless-thighs-01", "img2": "img:boneless-thighs-02", "no": "03", "cat": "boneless", "name": "Boneless Thighs", "name_ar": "أفخاذ منزوعة العظم", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 210, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Thigh fillets in a ceramic dish, side light", "shot_ar": "أفخاذ في طبق خزفي بإضاءة جانبية", "desc": "Juicy and forgiving — made for grills and stews.", "desc_ar": "طرية وغنية — مثالية للشوي واليخنات."}, {"id": "wings", "img": "img:chicken-wings-01", "img2": "img:chicken-wings-02", "no": "04", "cat": "cuts", "name": "Chicken Wings", "name_ar": "أجنحة الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 120, "tone": "ph--night", "tone2": "ph--warm", "shot": "Glazed wings in cast iron, dramatic low key", "shot_ar": "أجنحة مُلمّعة في مقلاة حديد، إضاءة درامية", "desc": "Whole wings for oven, air-fryer or grill.", "desc_ar": "أجنحة كاملة للفرن أو القلاية الهوائية أو الشواية."}, {"id": "drum", "img": "img:drumsticks-01", "img2": "img:drumsticks-02", "no": "05", "cat": "cuts", "name": "Drumsticks", "name_ar": "دبابيس الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 135, "tone": "ph--clay", "tone2": "ph--ice", "shot": "Drumsticks fanned on parchment, warm tones", "shot_ar": "دبابيس مرتبة على ورق زبدة، ألوان دافئة", "desc": "A family favourite for roasting and frying.", "desc_ar": "المفضلة للعائلة للتحمير والقلي."}, {"id": "quarter", "img": "img:leg-quarters-01", "img2": "img:leg-quarters-02", "no": "06", "cat": "cuts", "name": "Leg Quarters", "name_ar": "أوراك الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 125, "tone": "ph--warm", "tone2": "ph--night", "shot": "Leg quarters on board, natural daylight", "shot_ar": "أوراك على لوح تقطيع بإضاءة طبيعية", "desc": "Thigh and drumstick together, bone-in for flavour.", "desc_ar": "الفخذ والدبوس معًا بالعظم لنكهة أغنى."}, {"id": "mince", "img": "img:minced-chicken-01", "img2": "img:minced-chicken-02", "no": "07", "cat": "boneless", "name": "Minced Chicken", "name_ar": "دجاج مفروم", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 115, "tone": "ph--ice", "tone2": "ph--warm", "shot": "Mince in sealed tray, clean pack shot on white", "shot_ar": "مفروم في صينية مغلقة، لقطة عبوة على أبيض", "desc": "Finely minced for kofta, burgers and sauces.", "desc_ar": "مفروم ناعم للكفتة والبرجر والصلصات."}, {"id": "tawook", "img": "img:shish-tawook-01", "img2": "img:shish-tawook-02", "no": "08", "cat": "ready", "name": "Shish Tawook Cubes", "name_ar": "مكعبات شيش طاووق", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 140, "tone": "ph--clay", "tone2": "ph--night", "shot": "Marinated cubes on skewers, charcoal glow", "shot_ar": "مكعبات متبلة على أسياخ، وهج الفحم", "desc": "Marinated and cubed, ready for the skewer.", "desc_ar": "متبلة ومقطعة، جاهزة للأسياخ."}, {"id": "pane", "no": "09", "cat": "ready", "name": "Breaded Escalope", "name_ar": "بانيه الدجاج", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 155, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Golden escalope sliced, lemon, shallow depth", "shot_ar": "بانيه ذهبي مقطع مع ليمون، عمق ميدان ضحل", "desc": "Crumb-coated fillets for a quick golden finish.", "desc_ar": "فيليه مغطى بالبقسماط لتحمير ذهبي سريع."}, {"id": "liver", "no": "10", "cat": "cuts", "name": "Liver & Gizzards", "name_ar": "كبد وقوانص", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 65, "tone": "ph--night", "tone2": "ph--warm", "shot": "Pan-seared livers, onions, overhead", "shot_ar": "كبدة مشوحة مع بصل، لقطة علوية", "desc": "Cleaned and packed for traditional recipes.", "desc_ar": "منظفة ومعبأة للوصفات التقليدية."}];
    const C = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const ar = lang === 'ar' || window.siteLang === 'ar';
    return P.map((p, i) => {
      const c = C.find((x) => x.id === p.cat) || {};
      const o = { id: p.id, no: p.no, cat: p.cat, i: i % 4, price: p.price, priceS: p.price.toFixed(2), tone: p.tone, tone2: p.tone2,
        name: ar ? p.name_ar : p.name, weight: ar ? p.weight_ar : p.weight, shot: ar ? p.shot_ar : p.shot, desc: ar ? p.desc_ar : p.desc, catName: ar ? c.name_ar : c.name };
      o.img2 = p.img2 || ''; o.hasImg2 = !!p.img2; o.noImg2 = !p.img2; o.showB = !p.img || !!p.img2; o.img2Cls = p.img2 ? 'has-img' : '';
      o.img = p.img || ''; o.hasImg = !!p.img; o.noImg = !p.img; o.imgCls = p.img ? (p.pack ? 'has-img ph--pack' : 'has-img') : '';
      o.add = () => this.addToCart(o);
      o.addCls = this.state.added[p.id] ? 'add is-added' : 'add';
      return o;
    });
  }


  initState(){ return { cat: 'all', q: '', sort: 'featured', loading: false, why: 0, stage: 0, tIdx: 0 }; }
  didMount(){
    const steps = document.querySelectorAll('.jr-step');
    if ('IntersectionObserver' in window && steps.length) {
      this._jio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const i = parseInt(e.target.getAttribute('data-step'), 10) || 0; if (i !== this.state.stage) this.setState({ stage: i }); } }), { rootMargin: '-45% 0px -50% 0px' });
      steps.forEach((s) => this._jio.observe(s));
    }
  }
  componentWillUnmount(){ if (this._off) this._off(); if (this._jio) this._jio.disconnect(); clearTimeout(this._tt); clearTimeout(this._lt); }
  filt(patch){ this.setState(Object.assign({ loading: true }, patch)); clearTimeout(this._lt); this._lt = setTimeout(() => this.setState({ loading: false }), 450); }
  rail(dir){ const r = document.getElementById('bsRail'); if (!r) return; const rtl = "ar" === 'ar'; r.scrollBy({ left: dir * (rtl ? -1 : 1) * 364, behavior: 'smooth' }); }
  renderVals(){
    const s = this.state, L = "ar", D = {"why": [["الالتزام بالجودة", "اسم الأمين هو وعدنا — نتعامل مع كل منتج وكأنه ذاهب إلى مائدتنا.", "ph--warm", "يدان تقدّمان دجاجة كاملة، ضوء نهار دافئ", "img:why-quality"], ["ثقة العملاء", "تُكتسب الثقة بالثبات: المعيار نفسه في الطلب المئة كما في الطلب الأول.", "ph--clay", "مطبخ عائلي وتجهيز العشاء", "img:why-trust"], ["إمداد يُعتمد عليه", "تخطيط وتعبئة وشحن منظّم لتبقى البيوت والمطابخ مزوّدة دائمًا.", "ph--steel", "رصيف التحميل فجرًا وصناديق في الحركة", "img:why-supply"], ["تنوّع المنتجات", "من الدجاج الكامل إلى القطعيات الجاهزة — تشكيلة تناسب طريقة الطهي الحقيقية.", "ph--ice", "تشكيلة عبوات على خلفية بيضاء", "img:eggs-why"], ["للبيوت والشركات", "علامة واحدة ورحلتان: اطلب لعائلتك، أو ورّد لعملك.", "ph--night", "طبق دجاج في مطبخ مطعم", "img:why-homes"]], "stages": [["المزرعة", "تبدأ الرحلة من القطيع — رعاية بالبيئة والتغذية والرفق بالحيوان.", "ph--field", "قطيع في حظيرة مفتوحة، ضوء الصباح", "img:journey-farm"], ["الإنتاج", "تجهيز في ظروف مضبوطة مع الالتزام بالنظافة في كل خطوة.", "ph--steel", "خط تجهيز من الستانلس", "img:journey-production"], ["مراقبة الجودة", "تُفحص المنتجات قبل انتقالها، ولا يمر إلا ما يطابق المعيار.", "ph--ice", "مفتش جودة في غرفة بيضاء نظيفة", "img:journey-quality-control"], ["التعبئة", "غلق محكم وملصقات واضحة للحفاظ على الطزاجة حتى ثلاجتك.", "ph--warm", "غلق الصواني، تفاصيل مقرّبة", "img:journey-packaging"], ["التوصيل", "شحن إلى البيوت والشركات مع الحفاظ على سلسلة التبريد.", "ph--night", "شاحنة مبرّدة عند الغروب", "img:journey-delivery"]], "tst": [["[رأي عميل موثّق — عميل منزلي يتحدث عن الطزاجة وتجربة الطلب.]", "[اسم العميل]", "عميل منزلي"], ["[رأي موثّق — مطعم شريك يتحدث عن الثبات والخدمة.]", "[اسم المطعم]", "مطعم شريك"], ["[رأي موثّق — موزّع يتحدث عن الإمداد والتعامل مع فريق المبيعات.]", "[اسم الشركة]", "موزّع"]]};
    const all = this.productList(L);
    const q = s.q.trim().toLowerCase();
    let list = all.filter((p) => (s.cat === 'all' || p.cat === s.cat) && (!q || (p.name + ' ' + p.catName + ' ' + p.desc).toLowerCase().indexOf(q) > -1));
    if (s.sort === 'low') list = list.slice().sort((a, b) => a.price - b.price);
    if (s.sort === 'high') list = list.slice().sort((a, b) => b.price - a.price);
    if (s.sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name, L));
    const shown = list.slice(0, 8).map((p, i) => Object.assign({}, p, { i: i }));
    const cats = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const chips = [{ id: 'all', name: "الكل" }].concat(cats.map((c) => ({ id: c.id, name: L === 'ar' ? c.name_ar : c.name }))).map((c) => ({
      name: c.name, count: c.id === 'all' ? all.length : all.filter((p) => p.cat === c.id).length,
      pressed: s.cat === c.id ? 'true' : 'false', pick: () => this.filt({ cat: c.id }) }));
    const bestIds = ['breast', 'whole', 'tawook', 'wings', 'thigh', 'drum'];
    const best = bestIds.map((id, i) => Object.assign({}, all.find((p) => p.id === id), { i: 0 }));
    const why = D.why.map((w, i) => ({ title: w[0], text: w[1], tone: w[2], shot: w[3], img: w[4] || '', hasImg: !!w[4], noImg: !w[4], imgCls: w[4] ? 'has-img' : '', n: '0' + (i + 1), on: s.why === i ? 'on' : '', exp: s.why === i ? 'true' : 'false', pick: () => { if (this.state.why !== i) this.setState({ why: i }); } }));
    const stages = D.stages.map((w, i) => ({ title: w[0], text: w[1], tone: w[2], shot: w[3], img: w[4] || '', hasImg: !!w[4], noImg: !w[4], imgCls: w[4] ? 'has-img' : '', n: '0' + (i + 1), idx: String(i),
      cls: s.stage === i ? 'on' : (i < s.stage ? 'done' : ''),
      pick: () => { this.setState({ stage: i }); const el = document.querySelector('.jr-step[data-step="' + i + '"]'); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }));
    const tst = D.tst.map((x, i) => ({ quote: x[0], who: x[1], role: x[2], cls: s.tIdx === i ? 'on' : '', hidden: s.tIdx === i ? 'false' : 'true' }));
    return Object.assign(this.baseVals(), {
      best, chips, q: s.q, sort: s.sort, loading: s.loading,
      shown, shownN: shown.length, totalN: list.length,
      showGrid: !s.loading && list.length > 0, isEmpty: !s.loading && list.length === 0,
      setQ: (e) => this.filt({ q: e.target.value }), setSort: (e) => this.filt({ sort: e.target.value }),
      clearAll: () => this.filt({ q: '', cat: 'all', sort: 'featured' }),
      bsPrev: () => this.rail(-1), bsNext: () => this.rail(1),
      why, stages, stageN: '0' + (s.stage + 1), stageP: ((s.stage + 1) / 5).toFixed(2), stageName: D.stages[s.stage][0], fillH: (s.stage / 4 * 100).toFixed(1) + '%',
      tst, tN: s.tIdx + 1, tP: ((s.tIdx + 1) / 3).toFixed(3),
      tPrev: () => this.setState({ tIdx: (this.state.tIdx + 2) % 3 }), tNext: () => this.setState({ tIdx: (this.state.tIdx + 1) % 3 })
    });
  }

}

return Component;})(window.DCLogic)};
PAGES["About"]={cls:(function(DCLogic){

class Component extends DCLogic {

  constructor(props){ super(props); this.state = Object.assign({ menuOpen: !!(props && props.menuOpen), cart: 3, bump: 0, added: {}, toast: null }, this.initState ? this.initState(props) : {}); }
  componentDidMount(){ this._off = this.aaBoot(); if (this.didMount) this.didMount(); }
  componentWillUnmount(){ if (this._off) this._off(); clearTimeout(this._tt); }
  aaBoot(){
    const doc = document, html = doc.documentElement, win = window, offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) html.classList.add('rm'); else html.classList.add('mo');
    /* reveal */
    let io = null;
    if ('IntersectionObserver' in win && !reduce) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    const scan = () => doc.querySelectorAll('[data-rv]:not([data-in]):not([data-obs])').forEach((el) => { el.setAttribute('data-obs', ''); if (io) io.observe(el); else el.setAttribute('data-in', ''); });
    scan();
    const mo = new MutationObserver(() => scan()); mo.observe(doc.body, { childList: true, subtree: true });
    offs.push(() => { mo.disconnect(); if (io) io.disconnect(); });
    /* header + progress + parallax */
    let last = 0, ticking = false;
    const frame = () => {
      ticking = false;
      const y = win.scrollY || html.scrollTop || 0;
      const hdr = doc.querySelector('.hdr');
      if (hdr) {
        hdr.setAttribute('data-solid', (y > 40 || hdr.hasAttribute('data-force')) ? '1' : '0');
        hdr.setAttribute('data-hide', (y > last && y > 640) ? '1' : '0');
        const max = Math.max(1, html.scrollHeight - win.innerHeight);
        hdr.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
      }
      last = y;
      if (!reduce) {
        const vh = win.innerHeight;
        doc.querySelectorAll('[data-px]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const k = parseFloat(el.getAttribute('data-px')) || 0.1;
          el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -k).toFixed(1) + 'px,0)';
        });
      }
      if (this.onScrollFrame) this.onScrollFrame(y);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    on(win, 'scroll', req, { passive: true }); on(win, 'resize', req); frame();
    /* cursor */
    const fine = win.matchMedia && win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = doc.querySelector('.cur .cur-dot'), ring = doc.querySelector('.cur .cur-ring');
    if (fine && dot && ring) {
      let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, run = true;
      on(win, 'mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!html.classList.contains('cc')) { html.classList.add('cc'); rx = mx; ry = my; }
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      }, { passive: true });
      const loop = () => { if (!run) return; rx += (mx - rx) * (reduce ? 1 : 0.2); ry += (my - ry) * (reduce ? 1 : 0.2); ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'; raf = requestAnimationFrame(loop); };
      loop(); offs.push(() => { run = false; cancelAnimationFrame(raf); html.classList.remove('cc'); });
      on(doc, 'mouseover', (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-cursor],a,button,input,textarea,select,label') : null;
        if (!t) { ring.removeAttribute('data-mode'); return; }
        if (t.matches('input,textarea')) { ring.setAttribute('data-mode', 'text'); return; }
        const l = t.getAttribute('data-cursor');
        if (l) { ring.setAttribute('data-mode', 'label'); ring.setAttribute('data-label', l); }
        else ring.setAttribute('data-mode', 'link');
      });
      on(doc.documentElement, 'mouseleave', () => ring.setAttribute('data-mode', 'hide'));
    }
    /* magnetic */
    let mag = null;
    const release = () => { if (mag) { mag.style.transform = ''; mag.removeAttribute('data-magon'); mag = null; } };
    if (fine && !reduce) {
      on(doc, 'mousemove', (e) => {
        const m = e.target && e.target.closest ? e.target.closest('[data-mag]') : null;
        if (m !== mag) release();
        if (!m) return;
        mag = m; m.setAttribute('data-magon', '');
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = 'translate3d(' + (dx * 0.28).toFixed(1) + 'px,' + (dy * 0.4).toFixed(1) + 'px,0)';
      }, { passive: true });
    }
    /* drag-to-scroll rails */
    let drag = null;
    on(doc, 'pointerdown', (e) => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-drag]'); if (!r) return; drag = { r, x: e.clientX, s: r.scrollLeft, moved: false }; });
    on(win, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - drag.x; if (Math.abs(d) > 4) drag.moved = true; drag.r.scrollLeft = drag.s - d; });
    on(win, 'pointerup', () => { if (drag && drag.moved) { const r = drag.r; const kill = (ev) => { ev.preventDefault(); ev.stopPropagation(); r.removeEventListener('click', kill, true); }; r.addEventListener('click', kill, true); setTimeout(() => r.removeEventListener('click', kill, true), 0); } drag = null; });
    return () => offs.forEach((f) => f());
  }
  addToCart(p, qty){
    const added = Object.assign({}, this.state.added); added[p.id] = true;
    this.setState({ cart: this.state.cart + (qty || 1), bump: this.state.bump + 1, added, toast: { name: p.name } });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { const a = Object.assign({}, this.state.added); delete a[p.id]; this.setState({ added: a, toast: null }); }, 2600);
  }
  baseVals(){
    const s = this.state;
    return {
      menuOpen: s.menuOpen,
      menuStr: s.menuOpen ? 'true' : 'false',
      toggleMenu: () => this.setState({ menuOpen: !this.state.menuOpen }),
      closeMenu: () => this.setState({ menuOpen: false }),
      cart: s.cart,
      bumpCls: s.bump === 0 ? '' : (s.bump % 2 ? 'bump1' : 'bump2'),
      toast: s.toast, hasToast: !!s.toast, toastName: s.toast ? s.toast.name : '',
      closeToast: () => this.setState({ toast: null })
    };
  }
  productList(lang){
    const P = [{"id": "whole", "img": "img:pack-card", "no": "01", "cat": "whole", "name": "Whole Fresh Chicken", "name_ar": "دجاجة كاملة طازجة", "weight": "≈ 1.2 kg", "weight_ar": "≈ ١٫٢ كجم", "price": 165, "tone": "ph--warm", "tone2": "ph--ice", "shot": "Whole bird on butcher paper, top-down, soft window light", "shot_ar": "دجاجة كاملة على ورق جزارة، لقطة علوية بإضاءة نافذة ناعمة", "desc": "Cleaned and ready for roasting, grilling or slow cooking.", "desc_ar": "منظفة وجاهزة للشوي أو التحمير أو الطهي البطيء."}, {"id": "breast", "no": "02", "cat": "boneless", "name": "Chicken Breast Fillets", "name_ar": "فيليه صدور الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 245, "tone": "ph--clay", "tone2": "ph--warm", "shot": "Fillets on dark slate, herbs, 45° hero angle", "shot_ar": "فيليه على حجر داكن مع أعشاب، زاوية ٤٥°", "desc": "Lean, skinless fillets trimmed for everyday cooking.", "desc_ar": "فيليه منزوع الجلد ومُشذّب للطهي اليومي."}, {"id": "thigh", "no": "03", "cat": "boneless", "name": "Boneless Thighs", "name_ar": "أفخاذ منزوعة العظم", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 210, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Thigh fillets in a ceramic dish, side light", "shot_ar": "أفخاذ في طبق خزفي بإضاءة جانبية", "desc": "Juicy and forgiving — made for grills and stews.", "desc_ar": "طرية وغنية — مثالية للشوي واليخنات."}, {"id": "wings", "no": "04", "cat": "cuts", "name": "Chicken Wings", "name_ar": "أجنحة الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 120, "tone": "ph--night", "tone2": "ph--warm", "shot": "Glazed wings in cast iron, dramatic low key", "shot_ar": "أجنحة مُلمّعة في مقلاة حديد، إضاءة درامية", "desc": "Whole wings for oven, air-fryer or grill.", "desc_ar": "أجنحة كاملة للفرن أو القلاية الهوائية أو الشواية."}, {"id": "drum", "no": "05", "cat": "cuts", "name": "Drumsticks", "name_ar": "دبابيس الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 135, "tone": "ph--clay", "tone2": "ph--ice", "shot": "Drumsticks fanned on parchment, warm tones", "shot_ar": "دبابيس مرتبة على ورق زبدة، ألوان دافئة", "desc": "A family favourite for roasting and frying.", "desc_ar": "المفضلة للعائلة للتحمير والقلي."}, {"id": "quarter", "no": "06", "cat": "cuts", "name": "Leg Quarters", "name_ar": "أوراك الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 125, "tone": "ph--warm", "tone2": "ph--night", "shot": "Leg quarters on board, natural daylight", "shot_ar": "أوراك على لوح تقطيع بإضاءة طبيعية", "desc": "Thigh and drumstick together, bone-in for flavour.", "desc_ar": "الفخذ والدبوس معًا بالعظم لنكهة أغنى."}, {"id": "mince", "no": "07", "cat": "boneless", "name": "Minced Chicken", "name_ar": "دجاج مفروم", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 115, "tone": "ph--ice", "tone2": "ph--warm", "shot": "Mince in sealed tray, clean pack shot on white", "shot_ar": "مفروم في صينية مغلقة، لقطة عبوة على أبيض", "desc": "Finely minced for kofta, burgers and sauces.", "desc_ar": "مفروم ناعم للكفتة والبرجر والصلصات."}, {"id": "tawook", "no": "08", "cat": "ready", "name": "Shish Tawook Cubes", "name_ar": "مكعبات شيش طاووق", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 140, "tone": "ph--clay", "tone2": "ph--night", "shot": "Marinated cubes on skewers, charcoal glow", "shot_ar": "مكعبات متبلة على أسياخ، وهج الفحم", "desc": "Marinated and cubed, ready for the skewer.", "desc_ar": "متبلة ومقطعة، جاهزة للأسياخ."}, {"id": "pane", "no": "09", "cat": "ready", "name": "Breaded Escalope", "name_ar": "بانيه الدجاج", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 155, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Golden escalope sliced, lemon, shallow depth", "shot_ar": "بانيه ذهبي مقطع مع ليمون، عمق ميدان ضحل", "desc": "Crumb-coated fillets for a quick golden finish.", "desc_ar": "فيليه مغطى بالبقسماط لتحمير ذهبي سريع."}, {"id": "liver", "no": "10", "cat": "cuts", "name": "Liver & Gizzards", "name_ar": "كبد وقوانص", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 65, "tone": "ph--night", "tone2": "ph--warm", "shot": "Pan-seared livers, onions, overhead", "shot_ar": "كبدة مشوحة مع بصل، لقطة علوية", "desc": "Cleaned and packed for traditional recipes.", "desc_ar": "منظفة ومعبأة للوصفات التقليدية."}];
    const C = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const ar = lang === 'ar' || window.siteLang === 'ar';
    return P.map((p, i) => {
      const c = C.find((x) => x.id === p.cat) || {};
      const o = { id: p.id, no: p.no, cat: p.cat, i: i % 4, price: p.price, priceS: p.price.toFixed(2), tone: p.tone, tone2: p.tone2,
        name: ar ? p.name_ar : p.name, weight: ar ? p.weight_ar : p.weight, shot: ar ? p.shot_ar : p.shot, desc: ar ? p.desc_ar : p.desc, catName: ar ? c.name_ar : c.name };
      o.img = p.img || ''; o.hasImg = !!p.img; o.noImg = !p.img; o.imgCls = p.img ? 'has-img ph--pack' : '';
      o.add = () => this.addToCart(o);
      o.addCls = this.state.added[p.id] ? 'add is-added' : 'add';
      return o;
    });
  }

  renderVals(){ return this.baseVals(); }
}

return Component;})(window.DCLogic)};
PAGES["Products"]={cls:(function(DCLogic){

class Component extends DCLogic {

  constructor(props){ super(props); this.state = Object.assign({ menuOpen: !!(props && props.menuOpen), cart: 3, bump: 0, added: {}, toast: null }, this.initState ? this.initState(props) : {}); }
  componentDidMount(){ this._off = this.aaBoot(); if (this.didMount) this.didMount(); }
  componentWillUnmount(){ if (this._off) this._off(); clearTimeout(this._tt); }
  aaBoot(){
    const doc = document, html = doc.documentElement, win = window, offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) html.classList.add('rm'); else html.classList.add('mo');
    /* reveal */
    let io = null;
    if ('IntersectionObserver' in win && !reduce) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    const scan = () => doc.querySelectorAll('[data-rv]:not([data-in]):not([data-obs])').forEach((el) => { el.setAttribute('data-obs', ''); if (io) io.observe(el); else el.setAttribute('data-in', ''); });
    scan();
    const mo = new MutationObserver(() => scan()); mo.observe(doc.body, { childList: true, subtree: true });
    offs.push(() => { mo.disconnect(); if (io) io.disconnect(); });
    /* header + progress + parallax */
    let last = 0, ticking = false;
    const frame = () => {
      ticking = false;
      const y = win.scrollY || html.scrollTop || 0;
      const hdr = doc.querySelector('.hdr');
      if (hdr) {
        hdr.setAttribute('data-solid', (y > 40 || hdr.hasAttribute('data-force')) ? '1' : '0');
        hdr.setAttribute('data-hide', (y > last && y > 640) ? '1' : '0');
        const max = Math.max(1, html.scrollHeight - win.innerHeight);
        hdr.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
      }
      last = y;
      if (!reduce) {
        const vh = win.innerHeight;
        doc.querySelectorAll('[data-px]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const k = parseFloat(el.getAttribute('data-px')) || 0.1;
          el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -k).toFixed(1) + 'px,0)';
        });
      }
      if (this.onScrollFrame) this.onScrollFrame(y);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    on(win, 'scroll', req, { passive: true }); on(win, 'resize', req); frame();
    /* cursor */
    const fine = win.matchMedia && win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = doc.querySelector('.cur .cur-dot'), ring = doc.querySelector('.cur .cur-ring');
    if (fine && dot && ring) {
      let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, run = true;
      on(win, 'mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!html.classList.contains('cc')) { html.classList.add('cc'); rx = mx; ry = my; }
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      }, { passive: true });
      const loop = () => { if (!run) return; rx += (mx - rx) * (reduce ? 1 : 0.2); ry += (my - ry) * (reduce ? 1 : 0.2); ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'; raf = requestAnimationFrame(loop); };
      loop(); offs.push(() => { run = false; cancelAnimationFrame(raf); html.classList.remove('cc'); });
      on(doc, 'mouseover', (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-cursor],a,button,input,textarea,select,label') : null;
        if (!t) { ring.removeAttribute('data-mode'); return; }
        if (t.matches('input,textarea')) { ring.setAttribute('data-mode', 'text'); return; }
        const l = t.getAttribute('data-cursor');
        if (l) { ring.setAttribute('data-mode', 'label'); ring.setAttribute('data-label', l); }
        else ring.setAttribute('data-mode', 'link');
      });
      on(doc.documentElement, 'mouseleave', () => ring.setAttribute('data-mode', 'hide'));
    }
    /* magnetic */
    let mag = null;
    const release = () => { if (mag) { mag.style.transform = ''; mag.removeAttribute('data-magon'); mag = null; } };
    if (fine && !reduce) {
      on(doc, 'mousemove', (e) => {
        const m = e.target && e.target.closest ? e.target.closest('[data-mag]') : null;
        if (m !== mag) release();
        if (!m) return;
        mag = m; m.setAttribute('data-magon', '');
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = 'translate3d(' + (dx * 0.28).toFixed(1) + 'px,' + (dy * 0.4).toFixed(1) + 'px,0)';
      }, { passive: true });
    }
    /* drag-to-scroll rails */
    let drag = null;
    on(doc, 'pointerdown', (e) => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-drag]'); if (!r) return; drag = { r, x: e.clientX, s: r.scrollLeft, moved: false }; });
    on(win, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - drag.x; if (Math.abs(d) > 4) drag.moved = true; drag.r.scrollLeft = drag.s - d; });
    on(win, 'pointerup', () => { if (drag && drag.moved) { const r = drag.r; const kill = (ev) => { ev.preventDefault(); ev.stopPropagation(); r.removeEventListener('click', kill, true); }; r.addEventListener('click', kill, true); setTimeout(() => r.removeEventListener('click', kill, true), 0); } drag = null; });
    return () => offs.forEach((f) => f());
  }
  addToCart(p, qty){
    const added = Object.assign({}, this.state.added); added[p.id] = true;
    this.setState({ cart: this.state.cart + (qty || 1), bump: this.state.bump + 1, added, toast: { name: p.name } });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { const a = Object.assign({}, this.state.added); delete a[p.id]; this.setState({ added: a, toast: null }); }, 2600);
  }
  baseVals(){
    const s = this.state;
    return {
      menuOpen: s.menuOpen,
      menuStr: s.menuOpen ? 'true' : 'false',
      toggleMenu: () => this.setState({ menuOpen: !this.state.menuOpen }),
      closeMenu: () => this.setState({ menuOpen: false }),
      cart: s.cart,
      bumpCls: s.bump === 0 ? '' : (s.bump % 2 ? 'bump1' : 'bump2'),
      toast: s.toast, hasToast: !!s.toast, toastName: s.toast ? s.toast.name : '',
      closeToast: () => this.setState({ toast: null })
    };
  }
  productList(lang){
    const P = [{"id": "whole", "pack": true, "img": "img:whole-chicken-01", "img2": "img:whole-chicken-02", "no": "01", "cat": "whole", "name": "Whole Fresh Chicken", "name_ar": "دجاجة كاملة طازجة", "weight": "≈ 1.2 kg", "weight_ar": "≈ ١٫٢ كجم", "price": 165, "tone": "ph--warm", "tone2": "ph--ice", "shot": "Whole bird on butcher paper, top-down, soft window light", "shot_ar": "دجاجة كاملة على ورق جزارة، لقطة علوية بإضاءة نافذة ناعمة", "desc": "Cleaned and ready for roasting, grilling or slow cooking.", "desc_ar": "منظفة وجاهزة للشوي أو التحمير أو الطهي البطيء."}, {"id": "breast", "img": "img:chicken-breast-01", "img2": "img:chicken-breast-02", "no": "02", "cat": "boneless", "name": "Chicken Breast Fillets", "name_ar": "فيليه صدور الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 245, "tone": "ph--clay", "tone2": "ph--warm", "shot": "Fillets on dark slate, herbs, 45° hero angle", "shot_ar": "فيليه على حجر داكن مع أعشاب، زاوية ٤٥°", "desc": "Lean, skinless fillets trimmed for everyday cooking.", "desc_ar": "فيليه منزوع الجلد ومُشذّب للطهي اليومي."}, {"id": "thigh", "img": "img:boneless-thighs-01", "img2": "img:boneless-thighs-02", "no": "03", "cat": "boneless", "name": "Boneless Thighs", "name_ar": "أفخاذ منزوعة العظم", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 210, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Thigh fillets in a ceramic dish, side light", "shot_ar": "أفخاذ في طبق خزفي بإضاءة جانبية", "desc": "Juicy and forgiving — made for grills and stews.", "desc_ar": "طرية وغنية — مثالية للشوي واليخنات."}, {"id": "wings", "img": "img:chicken-wings-01", "img2": "img:chicken-wings-02", "no": "04", "cat": "cuts", "name": "Chicken Wings", "name_ar": "أجنحة الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 120, "tone": "ph--night", "tone2": "ph--warm", "shot": "Glazed wings in cast iron, dramatic low key", "shot_ar": "أجنحة مُلمّعة في مقلاة حديد، إضاءة درامية", "desc": "Whole wings for oven, air-fryer or grill.", "desc_ar": "أجنحة كاملة للفرن أو القلاية الهوائية أو الشواية."}, {"id": "drum", "img": "img:drumsticks-01", "img2": "img:drumsticks-02", "no": "05", "cat": "cuts", "name": "Drumsticks", "name_ar": "دبابيس الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 135, "tone": "ph--clay", "tone2": "ph--ice", "shot": "Drumsticks fanned on parchment, warm tones", "shot_ar": "دبابيس مرتبة على ورق زبدة، ألوان دافئة", "desc": "A family favourite for roasting and frying.", "desc_ar": "المفضلة للعائلة للتحمير والقلي."}, {"id": "quarter", "img": "img:leg-quarters-01", "img2": "img:leg-quarters-02", "no": "06", "cat": "cuts", "name": "Leg Quarters", "name_ar": "أوراك الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 125, "tone": "ph--warm", "tone2": "ph--night", "shot": "Leg quarters on board, natural daylight", "shot_ar": "أوراك على لوح تقطيع بإضاءة طبيعية", "desc": "Thigh and drumstick together, bone-in for flavour.", "desc_ar": "الفخذ والدبوس معًا بالعظم لنكهة أغنى."}, {"id": "mince", "img": "img:minced-chicken-01", "img2": "img:minced-chicken-02", "no": "07", "cat": "boneless", "name": "Minced Chicken", "name_ar": "دجاج مفروم", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 115, "tone": "ph--ice", "tone2": "ph--warm", "shot": "Mince in sealed tray, clean pack shot on white", "shot_ar": "مفروم في صينية مغلقة، لقطة عبوة على أبيض", "desc": "Finely minced for kofta, burgers and sauces.", "desc_ar": "مفروم ناعم للكفتة والبرجر والصلصات."}, {"id": "tawook", "img": "img:shish-tawook-01", "img2": "img:shish-tawook-02", "no": "08", "cat": "ready", "name": "Shish Tawook Cubes", "name_ar": "مكعبات شيش طاووق", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 140, "tone": "ph--clay", "tone2": "ph--night", "shot": "Marinated cubes on skewers, charcoal glow", "shot_ar": "مكعبات متبلة على أسياخ، وهج الفحم", "desc": "Marinated and cubed, ready for the skewer.", "desc_ar": "متبلة ومقطعة، جاهزة للأسياخ."}, {"id": "pane", "no": "09", "cat": "ready", "name": "Breaded Escalope", "name_ar": "بانيه الدجاج", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 155, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Golden escalope sliced, lemon, shallow depth", "shot_ar": "بانيه ذهبي مقطع مع ليمون، عمق ميدان ضحل", "desc": "Crumb-coated fillets for a quick golden finish.", "desc_ar": "فيليه مغطى بالبقسماط لتحمير ذهبي سريع."}, {"id": "liver", "no": "10", "cat": "cuts", "name": "Liver & Gizzards", "name_ar": "كبد وقوانص", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 65, "tone": "ph--night", "tone2": "ph--warm", "shot": "Pan-seared livers, onions, overhead", "shot_ar": "كبدة مشوحة مع بصل، لقطة علوية", "desc": "Cleaned and packed for traditional recipes.", "desc_ar": "منظفة ومعبأة للوصفات التقليدية."}];
    const C = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const ar = lang === 'ar' || window.siteLang === 'ar';
    return P.map((p, i) => {
      const c = C.find((x) => x.id === p.cat) || {};
      const o = { id: p.id, no: p.no, cat: p.cat, i: i % 4, price: p.price, priceS: p.price.toFixed(2), tone: p.tone, tone2: p.tone2,
        name: ar ? p.name_ar : p.name, weight: ar ? p.weight_ar : p.weight, shot: ar ? p.shot_ar : p.shot, desc: ar ? p.desc_ar : p.desc, catName: ar ? c.name_ar : c.name };
      o.img2 = p.img2 || ''; o.hasImg2 = !!p.img2; o.noImg2 = !p.img2; o.showB = !p.img || !!p.img2; o.img2Cls = p.img2 ? 'has-img' : '';
      o.img = p.img || ''; o.hasImg = !!p.img; o.noImg = !p.img; o.imgCls = p.img ? (p.pack ? 'has-img ph--pack' : 'has-img') : '';
      o.add = () => this.addToCart(o);
      o.addCls = this.state.added[p.id] ? 'add is-added' : 'add';
      return o;
    });
  }


  initState(props){ return { cat: 'all', cats: {}, sizes: {}, pr: 'any', q: '', sort: 'featured', loading: false, page: 1, moreBusy: false, fOpen: !!(props && props.filtersOpen) }; }
  filt(patch){ this.setState(Object.assign({ loading: true, page: 1 }, patch)); clearTimeout(this._lt); this._lt = setTimeout(() => this.setState({ loading: false }), 450); }
  renderVals(){
    const s = this.state, all = this.productList(window.siteLang || 'en');
    const sizeOf = (p) => p.id === 'whole' ? 'whole' : (p.weight.indexOf('500') > -1 ? '500' : '1kg');
    const catOn = Object.keys(s.cats).filter((k) => s.cats[k]);
    const sizeOn = Object.keys(s.sizes).filter((k) => s.sizes[k]);
    const q = s.q.trim().toLowerCase();
    let list = all.filter((p) => (s.cat === 'all' || p.cat === s.cat) && (!catOn.length || catOn.indexOf(p.cat) > -1) && (!sizeOn.length || sizeOn.indexOf(sizeOf(p)) > -1)
      && (s.pr === 'any' || (s.pr === 'lt150' && p.price < 150) || (s.pr === '150' && p.price >= 150 && p.price <= 200) || (s.pr === 'gt200' && p.price > 200))
      && (!q || (p.name + ' ' + p.catName + ' ' + p.desc).toLowerCase().indexOf(q) > -1));
    if (s.sort === 'low') list = list.slice().sort((a, b) => a.price - b.price);
    if (s.sort === 'high') list = list.slice().sort((a, b) => b.price - a.price);
    if (s.sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    const per = 6, shown = list.slice(0, per * s.page).map((p, i) => Object.assign({}, p, { i: i % per }));
    const v = this.baseVals();
    const C = [{"id": "whole", "name": "Whole Birds", "name_ar": "\u062f\u062c\u0627\u062c \u0643\u0627\u0645\u0644"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "\u0642\u0637\u0639\u064a\u0627\u062a \u0637\u0627\u0632\u062c\u0629"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "\u0645\u0646\u0632\u0648\u0639 \u0627\u0644\u0639\u0638\u0645 \u0648\u0641\u064a\u0644\u064a\u0647"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "\u062c\u0627\u0647\u0632 \u0644\u0644\u0637\u0647\u064a"}];
    const tabs = [{ id: 'all', name: 'All products' }].concat(C).map((c) => ({ name: c.name, sel: s.cat === c.id ? 'true' : 'false', pick: () => this.filt({ cat: c.id }) }));
    C.forEach((c) => { v['fc_' + c.id] = !!s.cats[c.id]; v['n_' + c.id] = all.filter((p) => p.cat === c.id).length; v['tc_' + c.id] = () => { const o = Object.assign({}, this.state.cats); o[c.id] = !o[c.id]; this.filt({ cats: o }); }; });
    ['500', '1kg', 'whole'].forEach((k) => { v['fs_' + k] = !!s.sizes[k]; v['ts_' + k] = () => { const o = Object.assign({}, this.state.sizes); o[k] = !o[k]; this.filt({ sizes: o }); }; });
    ['any', 'lt150', '150', 'gt200'].forEach((k) => { v['fp_' + k] = s.pr === k; v['tp_' + k] = () => this.filt({ pr: k }); });
    return Object.assign(v, {
      tabs, q: s.q, sort: s.sort, loading: s.loading, shown, shownN: shown.length, totalN: list.length,
      showGrid: !s.loading && list.length > 0, isEmpty: !s.loading && list.length === 0,
      hasMore: !s.loading && shown.length < list.length, moreP: (shown.length / Math.max(1, list.length)).toFixed(3), moreState: s.moreBusy ? 'loading' : 'idle',
      loadMore: () => { this.setState({ moreBusy: true }); setTimeout(() => this.setState({ moreBusy: false, page: this.state.page + 1 }), 700); },
      activeN: catOn.length + sizeOn.length + (s.pr !== 'any' ? 1 : 0),
      setQ: (e) => this.filt({ q: e.target.value }), setSort: (e) => this.filt({ sort: e.target.value }),
      clearAll: () => this.filt({ cat: 'all', cats: {}, sizes: {}, pr: 'any', q: '' }),
      fOpen: s.fOpen, openF: () => this.setState({ fOpen: true }), closeF: () => this.setState({ fOpen: false })
    });
  }

}

return Component;})(window.DCLogic)};
PAGES["Product"]={cls:(function(DCLogic){

class Component extends DCLogic {

  constructor(props){ super(props); this.state = Object.assign({ menuOpen: !!(props && props.menuOpen), cart: 3, bump: 0, added: {}, toast: null }, this.initState ? this.initState(props) : {}); }
  componentDidMount(){ this._off = this.aaBoot(); if (this.didMount) this.didMount(); }
  componentWillUnmount(){ if (this._off) this._off(); clearTimeout(this._tt); }
  aaBoot(){
    const doc = document, html = doc.documentElement, win = window, offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) html.classList.add('rm'); else html.classList.add('mo');
    /* reveal */
    let io = null;
    if ('IntersectionObserver' in win && !reduce) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    const scan = () => doc.querySelectorAll('[data-rv]:not([data-in]):not([data-obs])').forEach((el) => { el.setAttribute('data-obs', ''); if (io) io.observe(el); else el.setAttribute('data-in', ''); });
    scan();
    const mo = new MutationObserver(() => scan()); mo.observe(doc.body, { childList: true, subtree: true });
    offs.push(() => { mo.disconnect(); if (io) io.disconnect(); });
    /* header + progress + parallax */
    let last = 0, ticking = false;
    const frame = () => {
      ticking = false;
      const y = win.scrollY || html.scrollTop || 0;
      const hdr = doc.querySelector('.hdr');
      if (hdr) {
        hdr.setAttribute('data-solid', (y > 40 || hdr.hasAttribute('data-force')) ? '1' : '0');
        hdr.setAttribute('data-hide', (y > last && y > 640) ? '1' : '0');
        const max = Math.max(1, html.scrollHeight - win.innerHeight);
        hdr.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
      }
      last = y;
      if (!reduce) {
        const vh = win.innerHeight;
        doc.querySelectorAll('[data-px]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const k = parseFloat(el.getAttribute('data-px')) || 0.1;
          el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -k).toFixed(1) + 'px,0)';
        });
      }
      if (this.onScrollFrame) this.onScrollFrame(y);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    on(win, 'scroll', req, { passive: true }); on(win, 'resize', req); frame();
    /* cursor */
    const fine = win.matchMedia && win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = doc.querySelector('.cur .cur-dot'), ring = doc.querySelector('.cur .cur-ring');
    if (fine && dot && ring) {
      let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, run = true;
      on(win, 'mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!html.classList.contains('cc')) { html.classList.add('cc'); rx = mx; ry = my; }
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      }, { passive: true });
      const loop = () => { if (!run) return; rx += (mx - rx) * (reduce ? 1 : 0.2); ry += (my - ry) * (reduce ? 1 : 0.2); ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'; raf = requestAnimationFrame(loop); };
      loop(); offs.push(() => { run = false; cancelAnimationFrame(raf); html.classList.remove('cc'); });
      on(doc, 'mouseover', (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-cursor],a,button,input,textarea,select,label') : null;
        if (!t) { ring.removeAttribute('data-mode'); return; }
        if (t.matches('input,textarea')) { ring.setAttribute('data-mode', 'text'); return; }
        const l = t.getAttribute('data-cursor');
        if (l) { ring.setAttribute('data-mode', 'label'); ring.setAttribute('data-label', l); }
        else ring.setAttribute('data-mode', 'link');
      });
      on(doc.documentElement, 'mouseleave', () => ring.setAttribute('data-mode', 'hide'));
    }
    /* magnetic */
    let mag = null;
    const release = () => { if (mag) { mag.style.transform = ''; mag.removeAttribute('data-magon'); mag = null; } };
    if (fine && !reduce) {
      on(doc, 'mousemove', (e) => {
        const m = e.target && e.target.closest ? e.target.closest('[data-mag]') : null;
        if (m !== mag) release();
        if (!m) return;
        mag = m; m.setAttribute('data-magon', '');
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = 'translate3d(' + (dx * 0.28).toFixed(1) + 'px,' + (dy * 0.4).toFixed(1) + 'px,0)';
      }, { passive: true });
    }
    /* drag-to-scroll rails */
    let drag = null;
    on(doc, 'pointerdown', (e) => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-drag]'); if (!r) return; drag = { r, x: e.clientX, s: r.scrollLeft, moved: false }; });
    on(win, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - drag.x; if (Math.abs(d) > 4) drag.moved = true; drag.r.scrollLeft = drag.s - d; });
    on(win, 'pointerup', () => { if (drag && drag.moved) { const r = drag.r; const kill = (ev) => { ev.preventDefault(); ev.stopPropagation(); r.removeEventListener('click', kill, true); }; r.addEventListener('click', kill, true); setTimeout(() => r.removeEventListener('click', kill, true), 0); } drag = null; });
    return () => offs.forEach((f) => f());
  }
  addToCart(p, qty){
    const added = Object.assign({}, this.state.added); added[p.id] = true;
    this.setState({ cart: this.state.cart + (qty || 1), bump: this.state.bump + 1, added, toast: { name: p.name } });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { const a = Object.assign({}, this.state.added); delete a[p.id]; this.setState({ added: a, toast: null }); }, 2600);
  }
  baseVals(){
    const s = this.state;
    return {
      menuOpen: s.menuOpen,
      menuStr: s.menuOpen ? 'true' : 'false',
      toggleMenu: () => this.setState({ menuOpen: !this.state.menuOpen }),
      closeMenu: () => this.setState({ menuOpen: false }),
      cart: s.cart,
      bumpCls: s.bump === 0 ? '' : (s.bump % 2 ? 'bump1' : 'bump2'),
      toast: s.toast, hasToast: !!s.toast, toastName: s.toast ? s.toast.name : '',
      closeToast: () => this.setState({ toast: null })
    };
  }
  productList(lang){
    const P = [{"id": "whole", "pack": true, "img": "img:whole-chicken-01", "img2": "img:whole-chicken-02", "no": "01", "cat": "whole", "name": "Whole Fresh Chicken", "name_ar": "دجاجة كاملة طازجة", "weight": "≈ 1.2 kg", "weight_ar": "≈ ١٫٢ كجم", "price": 165, "tone": "ph--warm", "tone2": "ph--ice", "shot": "Whole bird on butcher paper, top-down, soft window light", "shot_ar": "دجاجة كاملة على ورق جزارة، لقطة علوية بإضاءة نافذة ناعمة", "desc": "Cleaned and ready for roasting, grilling or slow cooking.", "desc_ar": "منظفة وجاهزة للشوي أو التحمير أو الطهي البطيء."}, {"id": "breast", "img": "img:chicken-breast-01", "img2": "img:chicken-breast-02", "no": "02", "cat": "boneless", "name": "Chicken Breast Fillets", "name_ar": "فيليه صدور الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 245, "tone": "ph--clay", "tone2": "ph--warm", "shot": "Fillets on dark slate, herbs, 45° hero angle", "shot_ar": "فيليه على حجر داكن مع أعشاب، زاوية ٤٥°", "desc": "Lean, skinless fillets trimmed for everyday cooking.", "desc_ar": "فيليه منزوع الجلد ومُشذّب للطهي اليومي."}, {"id": "thigh", "img": "img:boneless-thighs-01", "img2": "img:boneless-thighs-02", "no": "03", "cat": "boneless", "name": "Boneless Thighs", "name_ar": "أفخاذ منزوعة العظم", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 210, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Thigh fillets in a ceramic dish, side light", "shot_ar": "أفخاذ في طبق خزفي بإضاءة جانبية", "desc": "Juicy and forgiving — made for grills and stews.", "desc_ar": "طرية وغنية — مثالية للشوي واليخنات."}, {"id": "wings", "img": "img:chicken-wings-01", "img2": "img:chicken-wings-02", "no": "04", "cat": "cuts", "name": "Chicken Wings", "name_ar": "أجنحة الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 120, "tone": "ph--night", "tone2": "ph--warm", "shot": "Glazed wings in cast iron, dramatic low key", "shot_ar": "أجنحة مُلمّعة في مقلاة حديد، إضاءة درامية", "desc": "Whole wings for oven, air-fryer or grill.", "desc_ar": "أجنحة كاملة للفرن أو القلاية الهوائية أو الشواية."}, {"id": "drum", "img": "img:drumsticks-01", "img2": "img:drumsticks-02", "no": "05", "cat": "cuts", "name": "Drumsticks", "name_ar": "دبابيس الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 135, "tone": "ph--clay", "tone2": "ph--ice", "shot": "Drumsticks fanned on parchment, warm tones", "shot_ar": "دبابيس مرتبة على ورق زبدة، ألوان دافئة", "desc": "A family favourite for roasting and frying.", "desc_ar": "المفضلة للعائلة للتحمير والقلي."}, {"id": "quarter", "img": "img:leg-quarters-01", "img2": "img:leg-quarters-02", "no": "06", "cat": "cuts", "name": "Leg Quarters", "name_ar": "أوراك الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 125, "tone": "ph--warm", "tone2": "ph--night", "shot": "Leg quarters on board, natural daylight", "shot_ar": "أوراك على لوح تقطيع بإضاءة طبيعية", "desc": "Thigh and drumstick together, bone-in for flavour.", "desc_ar": "الفخذ والدبوس معًا بالعظم لنكهة أغنى."}, {"id": "mince", "img": "img:minced-chicken-01", "img2": "img:minced-chicken-02", "no": "07", "cat": "boneless", "name": "Minced Chicken", "name_ar": "دجاج مفروم", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 115, "tone": "ph--ice", "tone2": "ph--warm", "shot": "Mince in sealed tray, clean pack shot on white", "shot_ar": "مفروم في صينية مغلقة، لقطة عبوة على أبيض", "desc": "Finely minced for kofta, burgers and sauces.", "desc_ar": "مفروم ناعم للكفتة والبرجر والصلصات."}, {"id": "tawook", "img": "img:shish-tawook-01", "img2": "img:shish-tawook-02", "no": "08", "cat": "ready", "name": "Shish Tawook Cubes", "name_ar": "مكعبات شيش طاووق", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 140, "tone": "ph--clay", "tone2": "ph--night", "shot": "Marinated cubes on skewers, charcoal glow", "shot_ar": "مكعبات متبلة على أسياخ، وهج الفحم", "desc": "Marinated and cubed, ready for the skewer.", "desc_ar": "متبلة ومقطعة، جاهزة للأسياخ."}, {"id": "pane", "no": "09", "cat": "ready", "name": "Breaded Escalope", "name_ar": "بانيه الدجاج", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 155, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Golden escalope sliced, lemon, shallow depth", "shot_ar": "بانيه ذهبي مقطع مع ليمون، عمق ميدان ضحل", "desc": "Crumb-coated fillets for a quick golden finish.", "desc_ar": "فيليه مغطى بالبقسماط لتحمير ذهبي سريع."}, {"id": "liver", "no": "10", "cat": "cuts", "name": "Liver & Gizzards", "name_ar": "كبد وقوانص", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 65, "tone": "ph--night", "tone2": "ph--warm", "shot": "Pan-seared livers, onions, overhead", "shot_ar": "كبدة مشوحة مع بصل، لقطة علوية", "desc": "Cleaned and packed for traditional recipes.", "desc_ar": "منظفة ومعبأة للوصفات التقليدية."}];
    const C = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const ar = lang === 'ar' || window.siteLang === 'ar';
    return P.map((p, i) => {
      const c = C.find((x) => x.id === p.cat) || {};
      const o = { id: p.id, no: p.no, cat: p.cat, i: i % 4, price: p.price, priceS: p.price.toFixed(2), tone: p.tone, tone2: p.tone2,
        name: ar ? p.name_ar : p.name, weight: ar ? p.weight_ar : p.weight, shot: ar ? p.shot_ar : p.shot, desc: ar ? p.desc_ar : p.desc, catName: ar ? c.name_ar : c.name };
      o.img2 = p.img2 || ''; o.hasImg2 = !!p.img2; o.noImg2 = !p.img2; o.showB = !p.img || !!p.img2; o.img2Cls = p.img2 ? 'has-img' : '';
      o.img = p.img || ''; o.hasImg = !!p.img; o.noImg = !p.img; o.imgCls = p.img ? (p.pack ? 'has-img ph--pack' : 'has-img') : '';
      o.add = () => this.addToCart(o);
      o.addCls = this.state.added[p.id] ? 'add is-added' : 'add';
      return o;
    });
  }


  initState(){ return { img: 0, prevImg: -1, size: 1, qty: 1, qb: 0, add: 'idle', acc: { 0: true } }; }
  renderVals(){
    const s = this.state, SH = [["ph--clay", "Hero: fillets on dark slate, herbs, 45\u00b0", "img:chicken-breast-01"], ["ph--warm", "Raw fillet macro, texture detail", "img:chicken-breast-02"], ["ph--ice", "Pack shot \u2014 sealed 1 kg tray, front label", "img:chicken-breast-03"], ["ph--night", "Serving suggestion \u2014 grilled & sliced", "img:chicken-breast-04"]];
    const S = [{ label: '500 g', p: 130 }, { label: '1 kg tray', p: 245 }, { label: '2 kg tray', p: 480 }];
    const go = (i) => this.setState({ prevImg: this.state.img, img: (i + 4) % 4 });
    const imgs = SH.map((g, i) => ({ tone: g[0], shot: g[1], img: g[2] || '', hasImg: !!g[2], noImg: !g[2], imgCls: g[2] ? 'has-img' : '', n: i + 1, pressed: s.img === i ? 'true' : 'false', cls: s.img === i ? 'on' : (s.prevImg === i ? 'prev' : ''), pick: () => go(i) }));
    const sizes = S.map((z, i) => ({ label: z.label, pressed: s.size === i ? 'true' : 'false', pick: () => this.setState({ size: i }) }));
    const all = this.productList(window.siteLang || 'en');
    const related = ['thigh', 'mince', 'tawook', 'pane'].map((id) => Object.assign({}, all.find((p) => p.id === id)));
    const v = this.baseVals();
    for (let n = 0; n < 4; n++) { v['a' + n] = s.acc[n] ? 'true' : 'false'; v['t' + n] = () => { const a = Object.assign({}, this.state.acc); a[n] = !a[n]; this.setState({ acc: a }); }; }
    return Object.assign(v, {
      imgs, imgN: s.img + 1, gPrev: () => go(s.img - 1), gNext: () => go(s.img + 1),
      sizes, sizeLabel: S[s.size].label, priceS: S[s.size].p.toFixed(2), lineS: (S[s.size].p * s.qty).toFixed(2),
      qty: s.qty, qCls: s.qb % 2 ? 'q1' : 'q2', decDis: s.qty <= 1,
      inc: () => this.setState({ qty: this.state.qty + 1, qb: this.state.qb + 1 }), dec: () => this.setState({ qty: Math.max(1, this.state.qty - 1), qb: this.state.qb + 1 }),
      addState: s.add === 'busy' ? 'loading' : (s.add === 'done' ? 'done' : 'idle'), addLabel: s.add === 'done' ? 'Added to cart' : 'Add to cart',
      addNow: () => { if (this.state.add !== 'idle') return; this.setState({ add: 'busy' }); setTimeout(() => { this.setState({ add: 'done' }); this.addToCart({ id: 'breast', name: 'Chicken Breast Fillets · ' + S[this.state.size].label }, this.state.qty); setTimeout(() => this.setState({ add: 'idle' }), 1800); }, 650); },
      related
    });
  }

}

return Component;})(window.DCLogic)};
PAGES["Cart"]={cls:(function(DCLogic){

class Component extends DCLogic {

  constructor(props){ super(props); this.state = Object.assign({ menuOpen: !!(props && props.menuOpen), cart: 3, bump: 0, added: {}, toast: null }, this.initState ? this.initState(props) : {}); }
  componentDidMount(){ this._off = this.aaBoot(); if (this.didMount) this.didMount(); }
  componentWillUnmount(){ if (this._off) this._off(); clearTimeout(this._tt); }
  aaBoot(){
    const doc = document, html = doc.documentElement, win = window, offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) html.classList.add('rm'); else html.classList.add('mo');
    /* reveal */
    let io = null;
    if ('IntersectionObserver' in win && !reduce) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    const scan = () => doc.querySelectorAll('[data-rv]:not([data-in]):not([data-obs])').forEach((el) => { el.setAttribute('data-obs', ''); if (io) io.observe(el); else el.setAttribute('data-in', ''); });
    scan();
    const mo = new MutationObserver(() => scan()); mo.observe(doc.body, { childList: true, subtree: true });
    offs.push(() => { mo.disconnect(); if (io) io.disconnect(); });
    /* header + progress + parallax */
    let last = 0, ticking = false;
    const frame = () => {
      ticking = false;
      const y = win.scrollY || html.scrollTop || 0;
      const hdr = doc.querySelector('.hdr');
      if (hdr) {
        hdr.setAttribute('data-solid', (y > 40 || hdr.hasAttribute('data-force')) ? '1' : '0');
        hdr.setAttribute('data-hide', (y > last && y > 640) ? '1' : '0');
        const max = Math.max(1, html.scrollHeight - win.innerHeight);
        hdr.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
      }
      last = y;
      if (!reduce) {
        const vh = win.innerHeight;
        doc.querySelectorAll('[data-px]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const k = parseFloat(el.getAttribute('data-px')) || 0.1;
          el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -k).toFixed(1) + 'px,0)';
        });
      }
      if (this.onScrollFrame) this.onScrollFrame(y);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    on(win, 'scroll', req, { passive: true }); on(win, 'resize', req); frame();
    /* cursor */
    const fine = win.matchMedia && win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = doc.querySelector('.cur .cur-dot'), ring = doc.querySelector('.cur .cur-ring');
    if (fine && dot && ring) {
      let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, run = true;
      on(win, 'mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!html.classList.contains('cc')) { html.classList.add('cc'); rx = mx; ry = my; }
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      }, { passive: true });
      const loop = () => { if (!run) return; rx += (mx - rx) * (reduce ? 1 : 0.2); ry += (my - ry) * (reduce ? 1 : 0.2); ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'; raf = requestAnimationFrame(loop); };
      loop(); offs.push(() => { run = false; cancelAnimationFrame(raf); html.classList.remove('cc'); });
      on(doc, 'mouseover', (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-cursor],a,button,input,textarea,select,label') : null;
        if (!t) { ring.removeAttribute('data-mode'); return; }
        if (t.matches('input,textarea')) { ring.setAttribute('data-mode', 'text'); return; }
        const l = t.getAttribute('data-cursor');
        if (l) { ring.setAttribute('data-mode', 'label'); ring.setAttribute('data-label', l); }
        else ring.setAttribute('data-mode', 'link');
      });
      on(doc.documentElement, 'mouseleave', () => ring.setAttribute('data-mode', 'hide'));
    }
    /* magnetic */
    let mag = null;
    const release = () => { if (mag) { mag.style.transform = ''; mag.removeAttribute('data-magon'); mag = null; } };
    if (fine && !reduce) {
      on(doc, 'mousemove', (e) => {
        const m = e.target && e.target.closest ? e.target.closest('[data-mag]') : null;
        if (m !== mag) release();
        if (!m) return;
        mag = m; m.setAttribute('data-magon', '');
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = 'translate3d(' + (dx * 0.28).toFixed(1) + 'px,' + (dy * 0.4).toFixed(1) + 'px,0)';
      }, { passive: true });
    }
    /* drag-to-scroll rails */
    let drag = null;
    on(doc, 'pointerdown', (e) => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-drag]'); if (!r) return; drag = { r, x: e.clientX, s: r.scrollLeft, moved: false }; });
    on(win, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - drag.x; if (Math.abs(d) > 4) drag.moved = true; drag.r.scrollLeft = drag.s - d; });
    on(win, 'pointerup', () => { if (drag && drag.moved) { const r = drag.r; const kill = (ev) => { ev.preventDefault(); ev.stopPropagation(); r.removeEventListener('click', kill, true); }; r.addEventListener('click', kill, true); setTimeout(() => r.removeEventListener('click', kill, true), 0); } drag = null; });
    return () => offs.forEach((f) => f());
  }
  addToCart(p, qty){
    const added = Object.assign({}, this.state.added); added[p.id] = true;
    this.setState({ cart: this.state.cart + (qty || 1), bump: this.state.bump + 1, added, toast: { name: p.name } });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { const a = Object.assign({}, this.state.added); delete a[p.id]; this.setState({ added: a, toast: null }); }, 2600);
  }
  baseVals(){
    const s = this.state;
    return {
      menuOpen: s.menuOpen,
      menuStr: s.menuOpen ? 'true' : 'false',
      toggleMenu: () => this.setState({ menuOpen: !this.state.menuOpen }),
      closeMenu: () => this.setState({ menuOpen: false }),
      cart: s.cart,
      bumpCls: s.bump === 0 ? '' : (s.bump % 2 ? 'bump1' : 'bump2'),
      toast: s.toast, hasToast: !!s.toast, toastName: s.toast ? s.toast.name : '',
      closeToast: () => this.setState({ toast: null })
    };
  }
  productList(lang){
    const P = [{"id": "whole", "pack": true, "img": "img:whole-chicken-01", "img2": "img:whole-chicken-02", "no": "01", "cat": "whole", "name": "Whole Fresh Chicken", "name_ar": "دجاجة كاملة طازجة", "weight": "≈ 1.2 kg", "weight_ar": "≈ ١٫٢ كجم", "price": 165, "tone": "ph--warm", "tone2": "ph--ice", "shot": "Whole bird on butcher paper, top-down, soft window light", "shot_ar": "دجاجة كاملة على ورق جزارة، لقطة علوية بإضاءة نافذة ناعمة", "desc": "Cleaned and ready for roasting, grilling or slow cooking.", "desc_ar": "منظفة وجاهزة للشوي أو التحمير أو الطهي البطيء."}, {"id": "breast", "img": "img:chicken-breast-01", "img2": "img:chicken-breast-02", "no": "02", "cat": "boneless", "name": "Chicken Breast Fillets", "name_ar": "فيليه صدور الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 245, "tone": "ph--clay", "tone2": "ph--warm", "shot": "Fillets on dark slate, herbs, 45° hero angle", "shot_ar": "فيليه على حجر داكن مع أعشاب، زاوية ٤٥°", "desc": "Lean, skinless fillets trimmed for everyday cooking.", "desc_ar": "فيليه منزوع الجلد ومُشذّب للطهي اليومي."}, {"id": "thigh", "img": "img:boneless-thighs-01", "img2": "img:boneless-thighs-02", "no": "03", "cat": "boneless", "name": "Boneless Thighs", "name_ar": "أفخاذ منزوعة العظم", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 210, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Thigh fillets in a ceramic dish, side light", "shot_ar": "أفخاذ في طبق خزفي بإضاءة جانبية", "desc": "Juicy and forgiving — made for grills and stews.", "desc_ar": "طرية وغنية — مثالية للشوي واليخنات."}, {"id": "wings", "img": "img:chicken-wings-01", "img2": "img:chicken-wings-02", "no": "04", "cat": "cuts", "name": "Chicken Wings", "name_ar": "أجنحة الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 120, "tone": "ph--night", "tone2": "ph--warm", "shot": "Glazed wings in cast iron, dramatic low key", "shot_ar": "أجنحة مُلمّعة في مقلاة حديد، إضاءة درامية", "desc": "Whole wings for oven, air-fryer or grill.", "desc_ar": "أجنحة كاملة للفرن أو القلاية الهوائية أو الشواية."}, {"id": "drum", "img": "img:drumsticks-01", "img2": "img:drumsticks-02", "no": "05", "cat": "cuts", "name": "Drumsticks", "name_ar": "دبابيس الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 135, "tone": "ph--clay", "tone2": "ph--ice", "shot": "Drumsticks fanned on parchment, warm tones", "shot_ar": "دبابيس مرتبة على ورق زبدة، ألوان دافئة", "desc": "A family favourite for roasting and frying.", "desc_ar": "المفضلة للعائلة للتحمير والقلي."}, {"id": "quarter", "img": "img:leg-quarters-01", "img2": "img:leg-quarters-02", "no": "06", "cat": "cuts", "name": "Leg Quarters", "name_ar": "أوراك الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 125, "tone": "ph--warm", "tone2": "ph--night", "shot": "Leg quarters on board, natural daylight", "shot_ar": "أوراك على لوح تقطيع بإضاءة طبيعية", "desc": "Thigh and drumstick together, bone-in for flavour.", "desc_ar": "الفخذ والدبوس معًا بالعظم لنكهة أغنى."}, {"id": "mince", "img": "img:minced-chicken-01", "img2": "img:minced-chicken-02", "no": "07", "cat": "boneless", "name": "Minced Chicken", "name_ar": "دجاج مفروم", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 115, "tone": "ph--ice", "tone2": "ph--warm", "shot": "Mince in sealed tray, clean pack shot on white", "shot_ar": "مفروم في صينية مغلقة، لقطة عبوة على أبيض", "desc": "Finely minced for kofta, burgers and sauces.", "desc_ar": "مفروم ناعم للكفتة والبرجر والصلصات."}, {"id": "tawook", "img": "img:shish-tawook-01", "img2": "img:shish-tawook-02", "no": "08", "cat": "ready", "name": "Shish Tawook Cubes", "name_ar": "مكعبات شيش طاووق", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 140, "tone": "ph--clay", "tone2": "ph--night", "shot": "Marinated cubes on skewers, charcoal glow", "shot_ar": "مكعبات متبلة على أسياخ، وهج الفحم", "desc": "Marinated and cubed, ready for the skewer.", "desc_ar": "متبلة ومقطعة، جاهزة للأسياخ."}, {"id": "pane", "no": "09", "cat": "ready", "name": "Breaded Escalope", "name_ar": "بانيه الدجاج", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 155, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Golden escalope sliced, lemon, shallow depth", "shot_ar": "بانيه ذهبي مقطع مع ليمون، عمق ميدان ضحل", "desc": "Crumb-coated fillets for a quick golden finish.", "desc_ar": "فيليه مغطى بالبقسماط لتحمير ذهبي سريع."}, {"id": "liver", "no": "10", "cat": "cuts", "name": "Liver & Gizzards", "name_ar": "كبد وقوانص", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 65, "tone": "ph--night", "tone2": "ph--warm", "shot": "Pan-seared livers, onions, overhead", "shot_ar": "كبدة مشوحة مع بصل، لقطة علوية", "desc": "Cleaned and packed for traditional recipes.", "desc_ar": "منظفة ومعبأة للوصفات التقليدية."}];
    const C = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const ar = lang === 'ar' || window.siteLang === 'ar';
    return P.map((p, i) => {
      const c = C.find((x) => x.id === p.cat) || {};
      const o = { id: p.id, no: p.no, cat: p.cat, i: i % 4, price: p.price, priceS: p.price.toFixed(2), tone: p.tone, tone2: p.tone2,
        name: ar ? p.name_ar : p.name, weight: ar ? p.weight_ar : p.weight, shot: ar ? p.shot_ar : p.shot, desc: ar ? p.desc_ar : p.desc, catName: ar ? c.name_ar : c.name };
      o.img2 = p.img2 || ''; o.hasImg2 = !!p.img2; o.noImg2 = !p.img2; o.showB = !p.img || !!p.img2; o.img2Cls = p.img2 ? 'has-img' : '';
      o.img = p.img || ''; o.hasImg = !!p.img; o.noImg = !p.img; o.imgCls = p.img ? (p.pack ? 'has-img ph--pack' : 'has-img') : '';
      o.add = () => this.addToCart(o);
      o.addCls = this.state.added[p.id] ? 'add is-added' : 'add';
      return o;
    });
  }


  initState(props){ return { lines: (props && props.empty) ? [] : [{ id: 'breast', q: 2, v: '1 kg tray' }, { id: 'whole', q: 1, v: '≈ 1.2 kg' }, { id: 'tawook', q: 1, v: '500 g pack' }], undo: null }; }
  didMount(){ this.setState({ cart: this.state.lines.reduce((a, l) => a + l.q, 0) }); }
  setQ(i, d){ const L = this.state.lines.map((l, j) => j === i ? Object.assign({}, l, { q: Math.max(1, l.q + d) }) : l); this.setState({ lines: L, cart: L.reduce((a, l) => a + l.q, 0) }); }
  renderVals(){
    const s = this.state, all = this.productList(window.siteLang || 'en');
    const items = s.lines.map((l, i) => { const p = all.find((x) => x.id === l.id); return { name: p.name, tone: p.tone, img: p.img, hasImg: p.hasImg, imgCls: p.imgCls, variant: l.v, qty: l.q, unitS: p.price.toFixed(2), lineS: (p.price * l.q).toFixed(2), decDis: l.q <= 1,
      inc: () => this.setQ(i, 1), dec: () => this.setQ(i, -1),
      remove: () => { const L = this.state.lines.filter((_, j) => j !== i); this.setState({ lines: L, undo: { line: l, i, name: p.name }, cart: L.reduce((a, x) => a + x.q, 0) }); } }; });
    const sub = s.lines.reduce((a, l) => a + all.find((x) => x.id === l.id).price * l.q, 0);
    const full = [{ id: 'breast', q: 2, v: '1 kg tray' }, { id: 'whole', q: 1, v: '≈ 1.2 kg' }, { id: 'tawook', q: 1, v: '500 g pack' }];
    return Object.assign(this.baseVals(), {
      items, hasItems: items.length > 0, isEmpty: items.length === 0, lineN: items.length, unitN: s.lines.reduce((a, l) => a + l.q, 0), subS: sub.toFixed(2),
      hasUndo: !!s.undo, undoName: s.undo ? s.undo.name : '',
      undo: () => { const u = this.state.undo; if (!u) return; const L = this.state.lines.slice(); L.splice(u.i, 0, u.line); this.setState({ lines: L, undo: null, cart: L.reduce((a, x) => a + x.q, 0) }); },
      full: items.length ? 'true' : 'false', emptyP: items.length ? 'false' : 'true',
      showFull: () => this.setState({ lines: full, undo: null, cart: 4 }), showEmpty: () => this.setState({ lines: [], undo: null, cart: 0 }),
      sugg: ['breast', 'whole', 'wings', 'pane'].map((id) => Object.assign({}, all.find((p) => p.id === id)))
    });
  }

}

return Component;})(window.DCLogic)};
PAGES["Checkout"]={cls:(function(DCLogic){

class Component extends DCLogic {

  constructor(props){ super(props); this.state = Object.assign({ menuOpen: !!(props && props.menuOpen), cart: 3, bump: 0, added: {}, toast: null }, this.initState ? this.initState(props) : {}); }
  componentDidMount(){ this._off = this.aaBoot(); if (this.didMount) this.didMount(); }
  componentWillUnmount(){ if (this._off) this._off(); clearTimeout(this._tt); }
  aaBoot(){
    const doc = document, html = doc.documentElement, win = window, offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) html.classList.add('rm'); else html.classList.add('mo');
    /* reveal */
    let io = null;
    if ('IntersectionObserver' in win && !reduce) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    const scan = () => doc.querySelectorAll('[data-rv]:not([data-in]):not([data-obs])').forEach((el) => { el.setAttribute('data-obs', ''); if (io) io.observe(el); else el.setAttribute('data-in', ''); });
    scan();
    const mo = new MutationObserver(() => scan()); mo.observe(doc.body, { childList: true, subtree: true });
    offs.push(() => { mo.disconnect(); if (io) io.disconnect(); });
    /* header + progress + parallax */
    let last = 0, ticking = false;
    const frame = () => {
      ticking = false;
      const y = win.scrollY || html.scrollTop || 0;
      const hdr = doc.querySelector('.hdr');
      if (hdr) {
        hdr.setAttribute('data-solid', (y > 40 || hdr.hasAttribute('data-force')) ? '1' : '0');
        hdr.setAttribute('data-hide', (y > last && y > 640) ? '1' : '0');
        const max = Math.max(1, html.scrollHeight - win.innerHeight);
        hdr.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
      }
      last = y;
      if (!reduce) {
        const vh = win.innerHeight;
        doc.querySelectorAll('[data-px]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const k = parseFloat(el.getAttribute('data-px')) || 0.1;
          el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -k).toFixed(1) + 'px,0)';
        });
      }
      if (this.onScrollFrame) this.onScrollFrame(y);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    on(win, 'scroll', req, { passive: true }); on(win, 'resize', req); frame();
    /* cursor */
    const fine = win.matchMedia && win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = doc.querySelector('.cur .cur-dot'), ring = doc.querySelector('.cur .cur-ring');
    if (fine && dot && ring) {
      let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, run = true;
      on(win, 'mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!html.classList.contains('cc')) { html.classList.add('cc'); rx = mx; ry = my; }
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      }, { passive: true });
      const loop = () => { if (!run) return; rx += (mx - rx) * (reduce ? 1 : 0.2); ry += (my - ry) * (reduce ? 1 : 0.2); ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'; raf = requestAnimationFrame(loop); };
      loop(); offs.push(() => { run = false; cancelAnimationFrame(raf); html.classList.remove('cc'); });
      on(doc, 'mouseover', (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-cursor],a,button,input,textarea,select,label') : null;
        if (!t) { ring.removeAttribute('data-mode'); return; }
        if (t.matches('input,textarea')) { ring.setAttribute('data-mode', 'text'); return; }
        const l = t.getAttribute('data-cursor');
        if (l) { ring.setAttribute('data-mode', 'label'); ring.setAttribute('data-label', l); }
        else ring.setAttribute('data-mode', 'link');
      });
      on(doc.documentElement, 'mouseleave', () => ring.setAttribute('data-mode', 'hide'));
    }
    /* magnetic */
    let mag = null;
    const release = () => { if (mag) { mag.style.transform = ''; mag.removeAttribute('data-magon'); mag = null; } };
    if (fine && !reduce) {
      on(doc, 'mousemove', (e) => {
        const m = e.target && e.target.closest ? e.target.closest('[data-mag]') : null;
        if (m !== mag) release();
        if (!m) return;
        mag = m; m.setAttribute('data-magon', '');
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = 'translate3d(' + (dx * 0.28).toFixed(1) + 'px,' + (dy * 0.4).toFixed(1) + 'px,0)';
      }, { passive: true });
    }
    /* drag-to-scroll rails */
    let drag = null;
    on(doc, 'pointerdown', (e) => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-drag]'); if (!r) return; drag = { r, x: e.clientX, s: r.scrollLeft, moved: false }; });
    on(win, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - drag.x; if (Math.abs(d) > 4) drag.moved = true; drag.r.scrollLeft = drag.s - d; });
    on(win, 'pointerup', () => { if (drag && drag.moved) { const r = drag.r; const kill = (ev) => { ev.preventDefault(); ev.stopPropagation(); r.removeEventListener('click', kill, true); }; r.addEventListener('click', kill, true); setTimeout(() => r.removeEventListener('click', kill, true), 0); } drag = null; });
    return () => offs.forEach((f) => f());
  }
  addToCart(p, qty){
    const added = Object.assign({}, this.state.added); added[p.id] = true;
    this.setState({ cart: this.state.cart + (qty || 1), bump: this.state.bump + 1, added, toast: { name: p.name } });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { const a = Object.assign({}, this.state.added); delete a[p.id]; this.setState({ added: a, toast: null }); }, 2600);
  }
  baseVals(){
    const s = this.state;
    return {
      menuOpen: s.menuOpen,
      menuStr: s.menuOpen ? 'true' : 'false',
      toggleMenu: () => this.setState({ menuOpen: !this.state.menuOpen }),
      closeMenu: () => this.setState({ menuOpen: false }),
      cart: s.cart,
      bumpCls: s.bump === 0 ? '' : (s.bump % 2 ? 'bump1' : 'bump2'),
      toast: s.toast, hasToast: !!s.toast, toastName: s.toast ? s.toast.name : '',
      closeToast: () => this.setState({ toast: null })
    };
  }
  productList(lang){
    const P = [{"id": "whole", "pack": true, "img": "img:whole-chicken-01", "img2": "img:whole-chicken-02", "no": "01", "cat": "whole", "name": "Whole Fresh Chicken", "name_ar": "دجاجة كاملة طازجة", "weight": "≈ 1.2 kg", "weight_ar": "≈ ١٫٢ كجم", "price": 165, "tone": "ph--warm", "tone2": "ph--ice", "shot": "Whole bird on butcher paper, top-down, soft window light", "shot_ar": "دجاجة كاملة على ورق جزارة، لقطة علوية بإضاءة نافذة ناعمة", "desc": "Cleaned and ready for roasting, grilling or slow cooking.", "desc_ar": "منظفة وجاهزة للشوي أو التحمير أو الطهي البطيء."}, {"id": "breast", "img": "img:chicken-breast-01", "img2": "img:chicken-breast-02", "no": "02", "cat": "boneless", "name": "Chicken Breast Fillets", "name_ar": "فيليه صدور الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 245, "tone": "ph--clay", "tone2": "ph--warm", "shot": "Fillets on dark slate, herbs, 45° hero angle", "shot_ar": "فيليه على حجر داكن مع أعشاب، زاوية ٤٥°", "desc": "Lean, skinless fillets trimmed for everyday cooking.", "desc_ar": "فيليه منزوع الجلد ومُشذّب للطهي اليومي."}, {"id": "thigh", "img": "img:boneless-thighs-01", "img2": "img:boneless-thighs-02", "no": "03", "cat": "boneless", "name": "Boneless Thighs", "name_ar": "أفخاذ منزوعة العظم", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 210, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Thigh fillets in a ceramic dish, side light", "shot_ar": "أفخاذ في طبق خزفي بإضاءة جانبية", "desc": "Juicy and forgiving — made for grills and stews.", "desc_ar": "طرية وغنية — مثالية للشوي واليخنات."}, {"id": "wings", "img": "img:chicken-wings-01", "img2": "img:chicken-wings-02", "no": "04", "cat": "cuts", "name": "Chicken Wings", "name_ar": "أجنحة الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 120, "tone": "ph--night", "tone2": "ph--warm", "shot": "Glazed wings in cast iron, dramatic low key", "shot_ar": "أجنحة مُلمّعة في مقلاة حديد، إضاءة درامية", "desc": "Whole wings for oven, air-fryer or grill.", "desc_ar": "أجنحة كاملة للفرن أو القلاية الهوائية أو الشواية."}, {"id": "drum", "img": "img:drumsticks-01", "img2": "img:drumsticks-02", "no": "05", "cat": "cuts", "name": "Drumsticks", "name_ar": "دبابيس الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 135, "tone": "ph--clay", "tone2": "ph--ice", "shot": "Drumsticks fanned on parchment, warm tones", "shot_ar": "دبابيس مرتبة على ورق زبدة، ألوان دافئة", "desc": "A family favourite for roasting and frying.", "desc_ar": "المفضلة للعائلة للتحمير والقلي."}, {"id": "quarter", "img": "img:leg-quarters-01", "img2": "img:leg-quarters-02", "no": "06", "cat": "cuts", "name": "Leg Quarters", "name_ar": "أوراك الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 125, "tone": "ph--warm", "tone2": "ph--night", "shot": "Leg quarters on board, natural daylight", "shot_ar": "أوراك على لوح تقطيع بإضاءة طبيعية", "desc": "Thigh and drumstick together, bone-in for flavour.", "desc_ar": "الفخذ والدبوس معًا بالعظم لنكهة أغنى."}, {"id": "mince", "img": "img:minced-chicken-01", "img2": "img:minced-chicken-02", "no": "07", "cat": "boneless", "name": "Minced Chicken", "name_ar": "دجاج مفروم", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 115, "tone": "ph--ice", "tone2": "ph--warm", "shot": "Mince in sealed tray, clean pack shot on white", "shot_ar": "مفروم في صينية مغلقة، لقطة عبوة على أبيض", "desc": "Finely minced for kofta, burgers and sauces.", "desc_ar": "مفروم ناعم للكفتة والبرجر والصلصات."}, {"id": "tawook", "img": "img:shish-tawook-01", "img2": "img:shish-tawook-02", "no": "08", "cat": "ready", "name": "Shish Tawook Cubes", "name_ar": "مكعبات شيش طاووق", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 140, "tone": "ph--clay", "tone2": "ph--night", "shot": "Marinated cubes on skewers, charcoal glow", "shot_ar": "مكعبات متبلة على أسياخ، وهج الفحم", "desc": "Marinated and cubed, ready for the skewer.", "desc_ar": "متبلة ومقطعة، جاهزة للأسياخ."}, {"id": "pane", "no": "09", "cat": "ready", "name": "Breaded Escalope", "name_ar": "بانيه الدجاج", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 155, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Golden escalope sliced, lemon, shallow depth", "shot_ar": "بانيه ذهبي مقطع مع ليمون، عمق ميدان ضحل", "desc": "Crumb-coated fillets for a quick golden finish.", "desc_ar": "فيليه مغطى بالبقسماط لتحمير ذهبي سريع."}, {"id": "liver", "no": "10", "cat": "cuts", "name": "Liver & Gizzards", "name_ar": "كبد وقوانص", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 65, "tone": "ph--night", "tone2": "ph--warm", "shot": "Pan-seared livers, onions, overhead", "shot_ar": "كبدة مشوحة مع بصل، لقطة علوية", "desc": "Cleaned and packed for traditional recipes.", "desc_ar": "منظفة ومعبأة للوصفات التقليدية."}];
    const C = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const ar = lang === 'ar' || window.siteLang === 'ar';
    return P.map((p, i) => {
      const c = C.find((x) => x.id === p.cat) || {};
      const o = { id: p.id, no: p.no, cat: p.cat, i: i % 4, price: p.price, priceS: p.price.toFixed(2), tone: p.tone, tone2: p.tone2,
        name: ar ? p.name_ar : p.name, weight: ar ? p.weight_ar : p.weight, shot: ar ? p.shot_ar : p.shot, desc: ar ? p.desc_ar : p.desc, catName: ar ? c.name_ar : c.name };
      o.img2 = p.img2 || ''; o.hasImg2 = !!p.img2; o.noImg2 = !p.img2; o.showB = !p.img || !!p.img2; o.img2Cls = p.img2 ? 'has-img' : '';
      o.img = p.img || ''; o.hasImg = !!p.img; o.noImg = !p.img; o.imgCls = p.img ? (p.pack ? 'has-img ph--pack' : 'has-img') : '';
      o.add = () => this.addToCart(o);
      o.addCls = this.state.added[p.id] ? 'add is-added' : 'add';
      return o;
    });
  }


  setF(k){ return (e) => { const f = Object.assign({}, this.state.f); f[k] = (e.target.type === 'checkbox') ? e.target.checked : e.target.value; const er = Object.assign({}, this.state.er); delete er[k]; this.setState({ f, er }); }; }
  errVals(keys){ const o = {}; const er = this.state.er || {}; keys.forEach((k) => { o['e_' + k] = !!er[k]; o['e_' + k + 'Msg'] = er[k] || ''; o['i_' + k] = er[k] ? 'true' : 'false'; o['v_' + k] = (this.state.f || {})[k] || ''; o['c_' + k] = this.setF(k); }); return o; }
  submitWith(rules, done){ const er = {}; const f = this.state.f || {}; Object.keys(rules).forEach((k) => { const m = rules[k](f[k], f); if (m) er[k] = m; }); if (Object.keys(er).length) { this.setState({ er, tried: true }); const first = document.getElementById(Object.keys(er)[0]); if (first && first.focus) first.focus(); return; } this.setState({ er: {}, busy: true }); setTimeout(() => { this.setState({ busy: false }); done(); }, 1000); }

  initState(){ return { f: { pay: 'cod' }, er: {}, done: false, busy: false, cart: 4 }; }
  renderVals(){
    const s = this.state, f = s.f, all = this.productList(window.siteLang || 'en');
    const lines = [['breast', 2, '1 kg tray'], ['whole', 1, '≈ 1.2 kg'], ['tawook', 1, '500 g pack']];
    const items = lines.map((l) => { const p = all.find((x) => x.id === l[0]); return { name: p.name, tone: p.tone, img: p.img, hasImg: p.hasImg, imgCls: p.imgCls, q: l[1], v: l[2], lineS: (p.price * l[1]).toFixed(2) }; });
    const tot = lines.reduce((a, l) => a + all.find((x) => x.id === l[0]).price * l[1], 0);
    const g1 = !!(f.name && f.phone), g2 = !!(f.area && f.street), g3 = !!f.pay, g4 = !!f.terms;
    const cur = !g1 ? 0 : (!g2 ? 1 : (!g4 ? 3 : 4));
    const steps = ['Details', 'Delivery', 'Payment', 'Confirm'].map((label, i) => ({ label, n: [g1, g2, g3, g4][i] ? '✓' : String(i + 1), cls: [g1, g2, g3, g4][i] ? 'done' : (i === cur ? 'cur' : '') }));
    const rules = {
      name: (v) => !v || v.trim().length < 3 ? 'Please enter your full name.' : '',
      phone: (v) => !v || v.replace(/\D/g, '').length < 8 ? 'Enter a valid phone number so we can confirm delivery.' : '',
      email: (v) => v && !/^\S+@\S+\.\S+$/.test(v) ? 'This email address doesn’t look right.' : '',
      area: (v) => !v ? 'Choose a delivery area.' : '',
      street: (v) => !v ? 'Enter the street address for delivery.' : '',
      terms: (v) => !v ? 'Please accept the terms to place your order.' : ''
    };
    return Object.assign(this.baseVals(), this.errVals(['name', 'phone', 'email', 'area', 'street', 'bldg', 'notes', 'terms']), {
      steps, items, totS: tot.toFixed(2), itemN: 4,
      ok1: g1 ? 'ok' : '', ok2: g2 ? 'ok' : '', ok3: g3 ? 'ok' : '', ok4: g4 ? 'ok' : '',
      payA: f.pay === 'cod', payB: f.pay === 'card', setPayA: () => this.setState({ f: Object.assign({}, this.state.f, { pay: 'cod' }) }), setPayB: () => this.setState({ f: Object.assign({}, this.state.f, { pay: 'card' }) }),
      payLabel: f.pay === 'card' ? 'Card payment' : 'Cash on delivery',
      hasErr: Object.keys(s.er).length > 0, errN: Object.keys(s.er).length,
      busyState: s.busy ? 'loading' : 'idle',
      submit: (e) => { e.preventDefault(); this.submitWith(rules, () => this.setState({ done: true, cart: 0 })); },
      done: s.done, notDone: !s.done, firstName: (f.name || '').split(' ')[0], ref: '000124'
    });
  }

}

return Component;})(window.DCLogic)};
PAGES["Wholesale"]={cls:(function(DCLogic){

class Component extends DCLogic {

  constructor(props){ super(props); this.state = Object.assign({ menuOpen: !!(props && props.menuOpen), cart: 3, bump: 0, added: {}, toast: null }, this.initState ? this.initState(props) : {}); }
  componentDidMount(){ this._off = this.aaBoot(); if (this.didMount) this.didMount(); }
  componentWillUnmount(){ if (this._off) this._off(); clearTimeout(this._tt); }
  aaBoot(){
    const doc = document, html = doc.documentElement, win = window, offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) html.classList.add('rm'); else html.classList.add('mo');
    /* reveal */
    let io = null;
    if ('IntersectionObserver' in win && !reduce) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    const scan = () => doc.querySelectorAll('[data-rv]:not([data-in]):not([data-obs])').forEach((el) => { el.setAttribute('data-obs', ''); if (io) io.observe(el); else el.setAttribute('data-in', ''); });
    scan();
    const mo = new MutationObserver(() => scan()); mo.observe(doc.body, { childList: true, subtree: true });
    offs.push(() => { mo.disconnect(); if (io) io.disconnect(); });
    /* header + progress + parallax */
    let last = 0, ticking = false;
    const frame = () => {
      ticking = false;
      const y = win.scrollY || html.scrollTop || 0;
      const hdr = doc.querySelector('.hdr');
      if (hdr) {
        hdr.setAttribute('data-solid', (y > 40 || hdr.hasAttribute('data-force')) ? '1' : '0');
        hdr.setAttribute('data-hide', (y > last && y > 640) ? '1' : '0');
        const max = Math.max(1, html.scrollHeight - win.innerHeight);
        hdr.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
      }
      last = y;
      if (!reduce) {
        const vh = win.innerHeight;
        doc.querySelectorAll('[data-px]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const k = parseFloat(el.getAttribute('data-px')) || 0.1;
          el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -k).toFixed(1) + 'px,0)';
        });
      }
      if (this.onScrollFrame) this.onScrollFrame(y);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    on(win, 'scroll', req, { passive: true }); on(win, 'resize', req); frame();
    /* cursor */
    const fine = win.matchMedia && win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = doc.querySelector('.cur .cur-dot'), ring = doc.querySelector('.cur .cur-ring');
    if (fine && dot && ring) {
      let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, run = true;
      on(win, 'mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!html.classList.contains('cc')) { html.classList.add('cc'); rx = mx; ry = my; }
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      }, { passive: true });
      const loop = () => { if (!run) return; rx += (mx - rx) * (reduce ? 1 : 0.2); ry += (my - ry) * (reduce ? 1 : 0.2); ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'; raf = requestAnimationFrame(loop); };
      loop(); offs.push(() => { run = false; cancelAnimationFrame(raf); html.classList.remove('cc'); });
      on(doc, 'mouseover', (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-cursor],a,button,input,textarea,select,label') : null;
        if (!t) { ring.removeAttribute('data-mode'); return; }
        if (t.matches('input,textarea')) { ring.setAttribute('data-mode', 'text'); return; }
        const l = t.getAttribute('data-cursor');
        if (l) { ring.setAttribute('data-mode', 'label'); ring.setAttribute('data-label', l); }
        else ring.setAttribute('data-mode', 'link');
      });
      on(doc.documentElement, 'mouseleave', () => ring.setAttribute('data-mode', 'hide'));
    }
    /* magnetic */
    let mag = null;
    const release = () => { if (mag) { mag.style.transform = ''; mag.removeAttribute('data-magon'); mag = null; } };
    if (fine && !reduce) {
      on(doc, 'mousemove', (e) => {
        const m = e.target && e.target.closest ? e.target.closest('[data-mag]') : null;
        if (m !== mag) release();
        if (!m) return;
        mag = m; m.setAttribute('data-magon', '');
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = 'translate3d(' + (dx * 0.28).toFixed(1) + 'px,' + (dy * 0.4).toFixed(1) + 'px,0)';
      }, { passive: true });
    }
    /* drag-to-scroll rails */
    let drag = null;
    on(doc, 'pointerdown', (e) => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-drag]'); if (!r) return; drag = { r, x: e.clientX, s: r.scrollLeft, moved: false }; });
    on(win, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - drag.x; if (Math.abs(d) > 4) drag.moved = true; drag.r.scrollLeft = drag.s - d; });
    on(win, 'pointerup', () => { if (drag && drag.moved) { const r = drag.r; const kill = (ev) => { ev.preventDefault(); ev.stopPropagation(); r.removeEventListener('click', kill, true); }; r.addEventListener('click', kill, true); setTimeout(() => r.removeEventListener('click', kill, true), 0); } drag = null; });
    return () => offs.forEach((f) => f());
  }
  addToCart(p, qty){
    const added = Object.assign({}, this.state.added); added[p.id] = true;
    this.setState({ cart: this.state.cart + (qty || 1), bump: this.state.bump + 1, added, toast: { name: p.name } });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { const a = Object.assign({}, this.state.added); delete a[p.id]; this.setState({ added: a, toast: null }); }, 2600);
  }
  baseVals(){
    const s = this.state;
    return {
      menuOpen: s.menuOpen,
      menuStr: s.menuOpen ? 'true' : 'false',
      toggleMenu: () => this.setState({ menuOpen: !this.state.menuOpen }),
      closeMenu: () => this.setState({ menuOpen: false }),
      cart: s.cart,
      bumpCls: s.bump === 0 ? '' : (s.bump % 2 ? 'bump1' : 'bump2'),
      toast: s.toast, hasToast: !!s.toast, toastName: s.toast ? s.toast.name : '',
      closeToast: () => this.setState({ toast: null })
    };
  }
  productList(lang){
    const P = [{"id": "whole", "no": "01", "cat": "whole", "name": "Whole Fresh Chicken", "name_ar": "دجاجة كاملة طازجة", "weight": "≈ 1.2 kg", "weight_ar": "≈ ١٫٢ كجم", "price": 165, "tone": "ph--warm", "tone2": "ph--ice", "shot": "Whole bird on butcher paper, top-down, soft window light", "shot_ar": "دجاجة كاملة على ورق جزارة، لقطة علوية بإضاءة نافذة ناعمة", "desc": "Cleaned and ready for roasting, grilling or slow cooking.", "desc_ar": "منظفة وجاهزة للشوي أو التحمير أو الطهي البطيء."}, {"id": "breast", "no": "02", "cat": "boneless", "name": "Chicken Breast Fillets", "name_ar": "فيليه صدور الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 245, "tone": "ph--clay", "tone2": "ph--warm", "shot": "Fillets on dark slate, herbs, 45° hero angle", "shot_ar": "فيليه على حجر داكن مع أعشاب، زاوية ٤٥°", "desc": "Lean, skinless fillets trimmed for everyday cooking.", "desc_ar": "فيليه منزوع الجلد ومُشذّب للطهي اليومي."}, {"id": "thigh", "no": "03", "cat": "boneless", "name": "Boneless Thighs", "name_ar": "أفخاذ منزوعة العظم", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 210, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Thigh fillets in a ceramic dish, side light", "shot_ar": "أفخاذ في طبق خزفي بإضاءة جانبية", "desc": "Juicy and forgiving — made for grills and stews.", "desc_ar": "طرية وغنية — مثالية للشوي واليخنات."}, {"id": "wings", "no": "04", "cat": "cuts", "name": "Chicken Wings", "name_ar": "أجنحة الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 120, "tone": "ph--night", "tone2": "ph--warm", "shot": "Glazed wings in cast iron, dramatic low key", "shot_ar": "أجنحة مُلمّعة في مقلاة حديد، إضاءة درامية", "desc": "Whole wings for oven, air-fryer or grill.", "desc_ar": "أجنحة كاملة للفرن أو القلاية الهوائية أو الشواية."}, {"id": "drum", "no": "05", "cat": "cuts", "name": "Drumsticks", "name_ar": "دبابيس الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 135, "tone": "ph--clay", "tone2": "ph--ice", "shot": "Drumsticks fanned on parchment, warm tones", "shot_ar": "دبابيس مرتبة على ورق زبدة، ألوان دافئة", "desc": "A family favourite for roasting and frying.", "desc_ar": "المفضلة للعائلة للتحمير والقلي."}, {"id": "quarter", "no": "06", "cat": "cuts", "name": "Leg Quarters", "name_ar": "أوراك الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 125, "tone": "ph--warm", "tone2": "ph--night", "shot": "Leg quarters on board, natural daylight", "shot_ar": "أوراك على لوح تقطيع بإضاءة طبيعية", "desc": "Thigh and drumstick together, bone-in for flavour.", "desc_ar": "الفخذ والدبوس معًا بالعظم لنكهة أغنى."}, {"id": "mince", "no": "07", "cat": "boneless", "name": "Minced Chicken", "name_ar": "دجاج مفروم", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 115, "tone": "ph--ice", "tone2": "ph--warm", "shot": "Mince in sealed tray, clean pack shot on white", "shot_ar": "مفروم في صينية مغلقة، لقطة عبوة على أبيض", "desc": "Finely minced for kofta, burgers and sauces.", "desc_ar": "مفروم ناعم للكفتة والبرجر والصلصات."}, {"id": "tawook", "no": "08", "cat": "ready", "name": "Shish Tawook Cubes", "name_ar": "مكعبات شيش طاووق", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 140, "tone": "ph--clay", "tone2": "ph--night", "shot": "Marinated cubes on skewers, charcoal glow", "shot_ar": "مكعبات متبلة على أسياخ، وهج الفحم", "desc": "Marinated and cubed, ready for the skewer.", "desc_ar": "متبلة ومقطعة، جاهزة للأسياخ."}, {"id": "pane", "no": "09", "cat": "ready", "name": "Breaded Escalope", "name_ar": "بانيه الدجاج", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 155, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Golden escalope sliced, lemon, shallow depth", "shot_ar": "بانيه ذهبي مقطع مع ليمون، عمق ميدان ضحل", "desc": "Crumb-coated fillets for a quick golden finish.", "desc_ar": "فيليه مغطى بالبقسماط لتحمير ذهبي سريع."}, {"id": "liver", "no": "10", "cat": "cuts", "name": "Liver & Gizzards", "name_ar": "كبد وقوانص", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 65, "tone": "ph--night", "tone2": "ph--warm", "shot": "Pan-seared livers, onions, overhead", "shot_ar": "كبدة مشوحة مع بصل، لقطة علوية", "desc": "Cleaned and packed for traditional recipes.", "desc_ar": "منظفة ومعبأة للوصفات التقليدية."}];
    const C = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const ar = lang === 'ar' || window.siteLang === 'ar';
    return P.map((p, i) => {
      const c = C.find((x) => x.id === p.cat) || {};
      const o = { id: p.id, no: p.no, cat: p.cat, i: i % 4, price: p.price, priceS: p.price.toFixed(2), tone: p.tone, tone2: p.tone2,
        name: ar ? p.name_ar : p.name, weight: ar ? p.weight_ar : p.weight, shot: ar ? p.shot_ar : p.shot, desc: ar ? p.desc_ar : p.desc, catName: ar ? c.name_ar : c.name };
      o.add = () => this.addToCart(o);
      o.addCls = this.state.added[p.id] ? 'add is-added' : 'add';
      return o;
    });
  }


  setF(k){ return (e) => { const f = Object.assign({}, this.state.f); f[k] = (e.target.type === 'checkbox') ? e.target.checked : e.target.value; const er = Object.assign({}, this.state.er); delete er[k]; this.setState({ f, er }); }; }
  errVals(keys){ const o = {}; const er = this.state.er || {}; keys.forEach((k) => { o['e_' + k] = !!er[k]; o['e_' + k + 'Msg'] = er[k] || ''; o['i_' + k] = er[k] ? 'true' : 'false'; o['v_' + k] = (this.state.f || {})[k] || ''; o['c_' + k] = this.setF(k); }); return o; }
  submitWith(rules, done){ const er = {}; const f = this.state.f || {}; Object.keys(rules).forEach((k) => { const m = rules[k](f[k], f); if (m) er[k] = m; }); if (Object.keys(er).length) { this.setState({ er, tried: true }); const first = document.getElementById(Object.keys(er)[0]); if (first && first.focus) first.focus(); return; } this.setState({ er: {}, busy: true }); setTimeout(() => { this.setState({ busy: false }); done(); }, 1000); }

  initState(){ return { f: { unit: 'kg' }, er: {}, quote: { breast: true, whole: true }, sent: false, busy: false }; }
  renderVals(){
    const s = this.state, all = this.productList(window.siteLang || 'en');
    const range = all.map((p) => ({ name: p.name, catName: p.catName, inQ: s.quote[p.id] ? 'true' : 'false', label: s.quote[p.id] ? '✓ In quote' : '+ Add to quote',
      toggle: () => { const q = Object.assign({}, this.state.quote); q[p.id] = !q[p.id]; const er = Object.assign({}, this.state.er); delete er.prods; this.setState({ quote: q, er }); } }));
    const quoteN = Object.keys(s.quote).filter((k) => s.quote[k]).length;
    const rules = {
      biz: (v) => !v ? 'Enter your business name.' : '', person: (v) => !v ? 'Enter a contact name.' : '',
      phone: (v) => !v || v.replace(/\D/g, '').length < 8 ? 'Enter a valid phone number.' : '',
      email: (v) => !v || !/^\S+@\S+\.\S+$/.test(v) ? 'Enter a valid business email.' : '',
      btype: (v) => !v ? 'Select your business type.' : '', qty: (v) => !v ? 'Give an estimate so we can prepare pricing.' : '',
      loc: (v) => !v ? 'Where should we deliver?' : '', prods: () => quoteN === 0 ? 'Select at least one product.' : ''
    };
    return Object.assign(this.baseVals(), this.errVals(['biz', 'person', 'phone', 'email', 'btype', 'qty', 'unit', 'pack', 'loc', 'notes', 'prods']), {
      range, quoteN, hasErr: Object.keys(s.er).length > 0, errN: Object.keys(s.er).length, busyState: s.busy ? 'loading' : 'idle',
      submit: (e) => { e.preventDefault(); this.submitWith(rules, () => this.setState({ sent: true })); },
      sent: s.sent, notSent: !s.sent, reset: () => this.setState({ sent: false, f: { unit: 'kg' }, er: {} })
    });
  }

}

return Component;})(window.DCLogic)};
PAGES["Contact"]={cls:(function(DCLogic){

class Component extends DCLogic {

  constructor(props){ super(props); this.state = Object.assign({ menuOpen: !!(props && props.menuOpen), cart: 3, bump: 0, added: {}, toast: null }, this.initState ? this.initState(props) : {}); }
  componentDidMount(){ this._off = this.aaBoot(); if (this.didMount) this.didMount(); }
  componentWillUnmount(){ if (this._off) this._off(); clearTimeout(this._tt); }
  aaBoot(){
    const doc = document, html = doc.documentElement, win = window, offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) html.classList.add('rm'); else html.classList.add('mo');
    /* reveal */
    let io = null;
    if ('IntersectionObserver' in win && !reduce) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    const scan = () => doc.querySelectorAll('[data-rv]:not([data-in]):not([data-obs])').forEach((el) => { el.setAttribute('data-obs', ''); if (io) io.observe(el); else el.setAttribute('data-in', ''); });
    scan();
    const mo = new MutationObserver(() => scan()); mo.observe(doc.body, { childList: true, subtree: true });
    offs.push(() => { mo.disconnect(); if (io) io.disconnect(); });
    /* header + progress + parallax */
    let last = 0, ticking = false;
    const frame = () => {
      ticking = false;
      const y = win.scrollY || html.scrollTop || 0;
      const hdr = doc.querySelector('.hdr');
      if (hdr) {
        hdr.setAttribute('data-solid', (y > 40 || hdr.hasAttribute('data-force')) ? '1' : '0');
        hdr.setAttribute('data-hide', (y > last && y > 640) ? '1' : '0');
        const max = Math.max(1, html.scrollHeight - win.innerHeight);
        hdr.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
      }
      last = y;
      if (!reduce) {
        const vh = win.innerHeight;
        doc.querySelectorAll('[data-px]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const k = parseFloat(el.getAttribute('data-px')) || 0.1;
          el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -k).toFixed(1) + 'px,0)';
        });
      }
      if (this.onScrollFrame) this.onScrollFrame(y);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    on(win, 'scroll', req, { passive: true }); on(win, 'resize', req); frame();
    /* cursor */
    const fine = win.matchMedia && win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = doc.querySelector('.cur .cur-dot'), ring = doc.querySelector('.cur .cur-ring');
    if (fine && dot && ring) {
      let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, run = true;
      on(win, 'mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!html.classList.contains('cc')) { html.classList.add('cc'); rx = mx; ry = my; }
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      }, { passive: true });
      const loop = () => { if (!run) return; rx += (mx - rx) * (reduce ? 1 : 0.2); ry += (my - ry) * (reduce ? 1 : 0.2); ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'; raf = requestAnimationFrame(loop); };
      loop(); offs.push(() => { run = false; cancelAnimationFrame(raf); html.classList.remove('cc'); });
      on(doc, 'mouseover', (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-cursor],a,button,input,textarea,select,label') : null;
        if (!t) { ring.removeAttribute('data-mode'); return; }
        if (t.matches('input,textarea')) { ring.setAttribute('data-mode', 'text'); return; }
        const l = t.getAttribute('data-cursor');
        if (l) { ring.setAttribute('data-mode', 'label'); ring.setAttribute('data-label', l); }
        else ring.setAttribute('data-mode', 'link');
      });
      on(doc.documentElement, 'mouseleave', () => ring.setAttribute('data-mode', 'hide'));
    }
    /* magnetic */
    let mag = null;
    const release = () => { if (mag) { mag.style.transform = ''; mag.removeAttribute('data-magon'); mag = null; } };
    if (fine && !reduce) {
      on(doc, 'mousemove', (e) => {
        const m = e.target && e.target.closest ? e.target.closest('[data-mag]') : null;
        if (m !== mag) release();
        if (!m) return;
        mag = m; m.setAttribute('data-magon', '');
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = 'translate3d(' + (dx * 0.28).toFixed(1) + 'px,' + (dy * 0.4).toFixed(1) + 'px,0)';
      }, { passive: true });
    }
    /* drag-to-scroll rails */
    let drag = null;
    on(doc, 'pointerdown', (e) => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-drag]'); if (!r) return; drag = { r, x: e.clientX, s: r.scrollLeft, moved: false }; });
    on(win, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - drag.x; if (Math.abs(d) > 4) drag.moved = true; drag.r.scrollLeft = drag.s - d; });
    on(win, 'pointerup', () => { if (drag && drag.moved) { const r = drag.r; const kill = (ev) => { ev.preventDefault(); ev.stopPropagation(); r.removeEventListener('click', kill, true); }; r.addEventListener('click', kill, true); setTimeout(() => r.removeEventListener('click', kill, true), 0); } drag = null; });
    return () => offs.forEach((f) => f());
  }
  addToCart(p, qty){
    const added = Object.assign({}, this.state.added); added[p.id] = true;
    this.setState({ cart: this.state.cart + (qty || 1), bump: this.state.bump + 1, added, toast: { name: p.name } });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { const a = Object.assign({}, this.state.added); delete a[p.id]; this.setState({ added: a, toast: null }); }, 2600);
  }
  baseVals(){
    const s = this.state;
    return {
      menuOpen: s.menuOpen,
      menuStr: s.menuOpen ? 'true' : 'false',
      toggleMenu: () => this.setState({ menuOpen: !this.state.menuOpen }),
      closeMenu: () => this.setState({ menuOpen: false }),
      cart: s.cart,
      bumpCls: s.bump === 0 ? '' : (s.bump % 2 ? 'bump1' : 'bump2'),
      toast: s.toast, hasToast: !!s.toast, toastName: s.toast ? s.toast.name : '',
      closeToast: () => this.setState({ toast: null })
    };
  }
  productList(lang){
    const P = [{"id": "whole", "no": "01", "cat": "whole", "name": "Whole Fresh Chicken", "name_ar": "دجاجة كاملة طازجة", "weight": "≈ 1.2 kg", "weight_ar": "≈ ١٫٢ كجم", "price": 165, "tone": "ph--warm", "tone2": "ph--ice", "shot": "Whole bird on butcher paper, top-down, soft window light", "shot_ar": "دجاجة كاملة على ورق جزارة، لقطة علوية بإضاءة نافذة ناعمة", "desc": "Cleaned and ready for roasting, grilling or slow cooking.", "desc_ar": "منظفة وجاهزة للشوي أو التحمير أو الطهي البطيء."}, {"id": "breast", "no": "02", "cat": "boneless", "name": "Chicken Breast Fillets", "name_ar": "فيليه صدور الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 245, "tone": "ph--clay", "tone2": "ph--warm", "shot": "Fillets on dark slate, herbs, 45° hero angle", "shot_ar": "فيليه على حجر داكن مع أعشاب، زاوية ٤٥°", "desc": "Lean, skinless fillets trimmed for everyday cooking.", "desc_ar": "فيليه منزوع الجلد ومُشذّب للطهي اليومي."}, {"id": "thigh", "no": "03", "cat": "boneless", "name": "Boneless Thighs", "name_ar": "أفخاذ منزوعة العظم", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 210, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Thigh fillets in a ceramic dish, side light", "shot_ar": "أفخاذ في طبق خزفي بإضاءة جانبية", "desc": "Juicy and forgiving — made for grills and stews.", "desc_ar": "طرية وغنية — مثالية للشوي واليخنات."}, {"id": "wings", "no": "04", "cat": "cuts", "name": "Chicken Wings", "name_ar": "أجنحة الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 120, "tone": "ph--night", "tone2": "ph--warm", "shot": "Glazed wings in cast iron, dramatic low key", "shot_ar": "أجنحة مُلمّعة في مقلاة حديد، إضاءة درامية", "desc": "Whole wings for oven, air-fryer or grill.", "desc_ar": "أجنحة كاملة للفرن أو القلاية الهوائية أو الشواية."}, {"id": "drum", "no": "05", "cat": "cuts", "name": "Drumsticks", "name_ar": "دبابيس الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 135, "tone": "ph--clay", "tone2": "ph--ice", "shot": "Drumsticks fanned on parchment, warm tones", "shot_ar": "دبابيس مرتبة على ورق زبدة، ألوان دافئة", "desc": "A family favourite for roasting and frying.", "desc_ar": "المفضلة للعائلة للتحمير والقلي."}, {"id": "quarter", "no": "06", "cat": "cuts", "name": "Leg Quarters", "name_ar": "أوراك الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 125, "tone": "ph--warm", "tone2": "ph--night", "shot": "Leg quarters on board, natural daylight", "shot_ar": "أوراك على لوح تقطيع بإضاءة طبيعية", "desc": "Thigh and drumstick together, bone-in for flavour.", "desc_ar": "الفخذ والدبوس معًا بالعظم لنكهة أغنى."}, {"id": "mince", "no": "07", "cat": "boneless", "name": "Minced Chicken", "name_ar": "دجاج مفروم", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 115, "tone": "ph--ice", "tone2": "ph--warm", "shot": "Mince in sealed tray, clean pack shot on white", "shot_ar": "مفروم في صينية مغلقة، لقطة عبوة على أبيض", "desc": "Finely minced for kofta, burgers and sauces.", "desc_ar": "مفروم ناعم للكفتة والبرجر والصلصات."}, {"id": "tawook", "no": "08", "cat": "ready", "name": "Shish Tawook Cubes", "name_ar": "مكعبات شيش طاووق", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 140, "tone": "ph--clay", "tone2": "ph--night", "shot": "Marinated cubes on skewers, charcoal glow", "shot_ar": "مكعبات متبلة على أسياخ، وهج الفحم", "desc": "Marinated and cubed, ready for the skewer.", "desc_ar": "متبلة ومقطعة، جاهزة للأسياخ."}, {"id": "pane", "no": "09", "cat": "ready", "name": "Breaded Escalope", "name_ar": "بانيه الدجاج", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 155, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Golden escalope sliced, lemon, shallow depth", "shot_ar": "بانيه ذهبي مقطع مع ليمون، عمق ميدان ضحل", "desc": "Crumb-coated fillets for a quick golden finish.", "desc_ar": "فيليه مغطى بالبقسماط لتحمير ذهبي سريع."}, {"id": "liver", "no": "10", "cat": "cuts", "name": "Liver & Gizzards", "name_ar": "كبد وقوانص", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 65, "tone": "ph--night", "tone2": "ph--warm", "shot": "Pan-seared livers, onions, overhead", "shot_ar": "كبدة مشوحة مع بصل، لقطة علوية", "desc": "Cleaned and packed for traditional recipes.", "desc_ar": "منظفة ومعبأة للوصفات التقليدية."}];
    const C = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const ar = lang === 'ar' || window.siteLang === 'ar';
    return P.map((p, i) => {
      const c = C.find((x) => x.id === p.cat) || {};
      const o = { id: p.id, no: p.no, cat: p.cat, i: i % 4, price: p.price, priceS: p.price.toFixed(2), tone: p.tone, tone2: p.tone2,
        name: ar ? p.name_ar : p.name, weight: ar ? p.weight_ar : p.weight, shot: ar ? p.shot_ar : p.shot, desc: ar ? p.desc_ar : p.desc, catName: ar ? c.name_ar : c.name };
      o.add = () => this.addToCart(o);
      o.addCls = this.state.added[p.id] ? 'add is-added' : 'add';
      return o;
    });
  }


  setF(k){ return (e) => { const f = Object.assign({}, this.state.f); f[k] = (e.target.type === 'checkbox') ? e.target.checked : e.target.value; const er = Object.assign({}, this.state.er); delete er[k]; this.setState({ f, er }); }; }
  errVals(keys){ const o = {}; const er = this.state.er || {}; keys.forEach((k) => { o['e_' + k] = !!er[k]; o['e_' + k + 'Msg'] = er[k] || ''; o['i_' + k] = er[k] ? 'true' : 'false'; o['v_' + k] = (this.state.f || {})[k] || ''; o['c_' + k] = this.setF(k); }); return o; }
  submitWith(rules, done){ const er = {}; const f = this.state.f || {}; Object.keys(rules).forEach((k) => { const m = rules[k](f[k], f); if (m) er[k] = m; }); if (Object.keys(er).length) { this.setState({ er, tried: true }); const first = document.getElementById(Object.keys(er)[0]); if (first && first.focus) first.focus(); return; } this.setState({ er: {}, busy: true }); setTimeout(() => { this.setState({ busy: false }); done(); }, 1000); }

  initState(){ return { f: {}, er: {}, sent: false, busy: false }; }
  renderVals(){
    const s = this.state;
    const rules = { name: (v) => !v ? 'Please enter your name.' : '', email: (v) => !v || !/^\S+@\S+\.\S+$/.test(v) ? 'Enter a valid email so we can reply.' : '', topic: (v) => !v ? 'Choose a topic.' : '', msg: (v) => !v || v.length < 10 ? 'Tell us a little more (at least 10 characters).' : '' };
    return Object.assign(this.baseVals(), this.errVals(['name', 'phone', 'email', 'topic', 'msg']), {
      hasErr: Object.keys(s.er).length > 0, errN: Object.keys(s.er).length, busyState: s.busy ? 'loading' : 'idle',
      submit: (e) => { e.preventDefault(); this.submitWith(rules, () => this.setState({ sent: true })); },
      sent: s.sent, notSent: !s.sent, reset: () => this.setState({ sent: false, f: {}, er: {} })
    });
  }

}

return Component;})(window.DCLogic)};
PAGES["Account"]={cls:(function(DCLogic){

class Component extends DCLogic {

  constructor(props){ super(props); this.state = Object.assign({ menuOpen: !!(props && props.menuOpen), cart: 3, bump: 0, added: {}, toast: null }, this.initState ? this.initState(props) : {}); }
  componentDidMount(){ this._off = this.aaBoot(); if (this.didMount) this.didMount(); }
  componentWillUnmount(){ if (this._off) this._off(); clearTimeout(this._tt); }
  aaBoot(){
    const doc = document, html = doc.documentElement, win = window, offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) html.classList.add('rm'); else html.classList.add('mo');
    /* reveal */
    let io = null;
    if ('IntersectionObserver' in win && !reduce) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    const scan = () => doc.querySelectorAll('[data-rv]:not([data-in]):not([data-obs])').forEach((el) => { el.setAttribute('data-obs', ''); if (io) io.observe(el); else el.setAttribute('data-in', ''); });
    scan();
    const mo = new MutationObserver(() => scan()); mo.observe(doc.body, { childList: true, subtree: true });
    offs.push(() => { mo.disconnect(); if (io) io.disconnect(); });
    /* header + progress + parallax */
    let last = 0, ticking = false;
    const frame = () => {
      ticking = false;
      const y = win.scrollY || html.scrollTop || 0;
      const hdr = doc.querySelector('.hdr');
      if (hdr) {
        hdr.setAttribute('data-solid', (y > 40 || hdr.hasAttribute('data-force')) ? '1' : '0');
        hdr.setAttribute('data-hide', (y > last && y > 640) ? '1' : '0');
        const max = Math.max(1, html.scrollHeight - win.innerHeight);
        hdr.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
      }
      last = y;
      if (!reduce) {
        const vh = win.innerHeight;
        doc.querySelectorAll('[data-px]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const k = parseFloat(el.getAttribute('data-px')) || 0.1;
          el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * -k).toFixed(1) + 'px,0)';
        });
      }
      if (this.onScrollFrame) this.onScrollFrame(y);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    on(win, 'scroll', req, { passive: true }); on(win, 'resize', req); frame();
    /* cursor */
    const fine = win.matchMedia && win.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const dot = doc.querySelector('.cur .cur-dot'), ring = doc.querySelector('.cur .cur-ring');
    if (fine && dot && ring) {
      let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, run = true;
      on(win, 'mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!html.classList.contains('cc')) { html.classList.add('cc'); rx = mx; ry = my; }
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      }, { passive: true });
      const loop = () => { if (!run) return; rx += (mx - rx) * (reduce ? 1 : 0.2); ry += (my - ry) * (reduce ? 1 : 0.2); ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'; raf = requestAnimationFrame(loop); };
      loop(); offs.push(() => { run = false; cancelAnimationFrame(raf); html.classList.remove('cc'); });
      on(doc, 'mouseover', (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-cursor],a,button,input,textarea,select,label') : null;
        if (!t) { ring.removeAttribute('data-mode'); return; }
        if (t.matches('input,textarea')) { ring.setAttribute('data-mode', 'text'); return; }
        const l = t.getAttribute('data-cursor');
        if (l) { ring.setAttribute('data-mode', 'label'); ring.setAttribute('data-label', l); }
        else ring.setAttribute('data-mode', 'link');
      });
      on(doc.documentElement, 'mouseleave', () => ring.setAttribute('data-mode', 'hide'));
    }
    /* magnetic */
    let mag = null;
    const release = () => { if (mag) { mag.style.transform = ''; mag.removeAttribute('data-magon'); mag = null; } };
    if (fine && !reduce) {
      on(doc, 'mousemove', (e) => {
        const m = e.target && e.target.closest ? e.target.closest('[data-mag]') : null;
        if (m !== mag) release();
        if (!m) return;
        mag = m; m.setAttribute('data-magon', '');
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = 'translate3d(' + (dx * 0.28).toFixed(1) + 'px,' + (dy * 0.4).toFixed(1) + 'px,0)';
      }, { passive: true });
    }
    /* drag-to-scroll rails */
    let drag = null;
    on(doc, 'pointerdown', (e) => { if (e.pointerType !== 'mouse') return; const r = e.target.closest && e.target.closest('[data-drag]'); if (!r) return; drag = { r, x: e.clientX, s: r.scrollLeft, moved: false }; });
    on(win, 'pointermove', (e) => { if (!drag) return; const d = e.clientX - drag.x; if (Math.abs(d) > 4) drag.moved = true; drag.r.scrollLeft = drag.s - d; });
    on(win, 'pointerup', () => { if (drag && drag.moved) { const r = drag.r; const kill = (ev) => { ev.preventDefault(); ev.stopPropagation(); r.removeEventListener('click', kill, true); }; r.addEventListener('click', kill, true); setTimeout(() => r.removeEventListener('click', kill, true), 0); } drag = null; });
    return () => offs.forEach((f) => f());
  }
  addToCart(p, qty){
    const added = Object.assign({}, this.state.added); added[p.id] = true;
    this.setState({ cart: this.state.cart + (qty || 1), bump: this.state.bump + 1, added, toast: { name: p.name } });
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { const a = Object.assign({}, this.state.added); delete a[p.id]; this.setState({ added: a, toast: null }); }, 2600);
  }
  baseVals(){
    const s = this.state;
    return {
      menuOpen: s.menuOpen,
      menuStr: s.menuOpen ? 'true' : 'false',
      toggleMenu: () => this.setState({ menuOpen: !this.state.menuOpen }),
      closeMenu: () => this.setState({ menuOpen: false }),
      cart: s.cart,
      bumpCls: s.bump === 0 ? '' : (s.bump % 2 ? 'bump1' : 'bump2'),
      toast: s.toast, hasToast: !!s.toast, toastName: s.toast ? s.toast.name : '',
      closeToast: () => this.setState({ toast: null })
    };
  }
  productList(lang){
    const P = [{"id": "whole", "no": "01", "cat": "whole", "name": "Whole Fresh Chicken", "name_ar": "دجاجة كاملة طازجة", "weight": "≈ 1.2 kg", "weight_ar": "≈ ١٫٢ كجم", "price": 165, "tone": "ph--warm", "tone2": "ph--ice", "shot": "Whole bird on butcher paper, top-down, soft window light", "shot_ar": "دجاجة كاملة على ورق جزارة، لقطة علوية بإضاءة نافذة ناعمة", "desc": "Cleaned and ready for roasting, grilling or slow cooking.", "desc_ar": "منظفة وجاهزة للشوي أو التحمير أو الطهي البطيء."}, {"id": "breast", "no": "02", "cat": "boneless", "name": "Chicken Breast Fillets", "name_ar": "فيليه صدور الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 245, "tone": "ph--clay", "tone2": "ph--warm", "shot": "Fillets on dark slate, herbs, 45° hero angle", "shot_ar": "فيليه على حجر داكن مع أعشاب، زاوية ٤٥°", "desc": "Lean, skinless fillets trimmed for everyday cooking.", "desc_ar": "فيليه منزوع الجلد ومُشذّب للطهي اليومي."}, {"id": "thigh", "no": "03", "cat": "boneless", "name": "Boneless Thighs", "name_ar": "أفخاذ منزوعة العظم", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 210, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Thigh fillets in a ceramic dish, side light", "shot_ar": "أفخاذ في طبق خزفي بإضاءة جانبية", "desc": "Juicy and forgiving — made for grills and stews.", "desc_ar": "طرية وغنية — مثالية للشوي واليخنات."}, {"id": "wings", "no": "04", "cat": "cuts", "name": "Chicken Wings", "name_ar": "أجنحة الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 120, "tone": "ph--night", "tone2": "ph--warm", "shot": "Glazed wings in cast iron, dramatic low key", "shot_ar": "أجنحة مُلمّعة في مقلاة حديد، إضاءة درامية", "desc": "Whole wings for oven, air-fryer or grill.", "desc_ar": "أجنحة كاملة للفرن أو القلاية الهوائية أو الشواية."}, {"id": "drum", "no": "05", "cat": "cuts", "name": "Drumsticks", "name_ar": "دبابيس الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 135, "tone": "ph--clay", "tone2": "ph--ice", "shot": "Drumsticks fanned on parchment, warm tones", "shot_ar": "دبابيس مرتبة على ورق زبدة، ألوان دافئة", "desc": "A family favourite for roasting and frying.", "desc_ar": "المفضلة للعائلة للتحمير والقلي."}, {"id": "quarter", "no": "06", "cat": "cuts", "name": "Leg Quarters", "name_ar": "أوراك الدجاج", "weight": "1 kg tray", "weight_ar": "صينية ١ كجم", "price": 125, "tone": "ph--warm", "tone2": "ph--night", "shot": "Leg quarters on board, natural daylight", "shot_ar": "أوراك على لوح تقطيع بإضاءة طبيعية", "desc": "Thigh and drumstick together, bone-in for flavour.", "desc_ar": "الفخذ والدبوس معًا بالعظم لنكهة أغنى."}, {"id": "mince", "no": "07", "cat": "boneless", "name": "Minced Chicken", "name_ar": "دجاج مفروم", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 115, "tone": "ph--ice", "tone2": "ph--warm", "shot": "Mince in sealed tray, clean pack shot on white", "shot_ar": "مفروم في صينية مغلقة، لقطة عبوة على أبيض", "desc": "Finely minced for kofta, burgers and sauces.", "desc_ar": "مفروم ناعم للكفتة والبرجر والصلصات."}, {"id": "tawook", "no": "08", "cat": "ready", "name": "Shish Tawook Cubes", "name_ar": "مكعبات شيش طاووق", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 140, "tone": "ph--clay", "tone2": "ph--night", "shot": "Marinated cubes on skewers, charcoal glow", "shot_ar": "مكعبات متبلة على أسياخ، وهج الفحم", "desc": "Marinated and cubed, ready for the skewer.", "desc_ar": "متبلة ومقطعة، جاهزة للأسياخ."}, {"id": "pane", "no": "09", "cat": "ready", "name": "Breaded Escalope", "name_ar": "بانيه الدجاج", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 155, "tone": "ph--warm", "tone2": "ph--clay", "shot": "Golden escalope sliced, lemon, shallow depth", "shot_ar": "بانيه ذهبي مقطع مع ليمون، عمق ميدان ضحل", "desc": "Crumb-coated fillets for a quick golden finish.", "desc_ar": "فيليه مغطى بالبقسماط لتحمير ذهبي سريع."}, {"id": "liver", "no": "10", "cat": "cuts", "name": "Liver & Gizzards", "name_ar": "كبد وقوانص", "weight": "500 g pack", "weight_ar": "عبوة ٥٠٠ جم", "price": 65, "tone": "ph--night", "tone2": "ph--warm", "shot": "Pan-seared livers, onions, overhead", "shot_ar": "كبدة مشوحة مع بصل، لقطة علوية", "desc": "Cleaned and packed for traditional recipes.", "desc_ar": "منظفة ومعبأة للوصفات التقليدية."}];
    const C = [{"id": "whole", "name": "Whole Birds", "name_ar": "دجاج كامل"}, {"id": "cuts", "name": "Fresh Cuts", "name_ar": "قطعيات طازجة"}, {"id": "boneless", "name": "Boneless & Fillets", "name_ar": "منزوع العظم وفيليه"}, {"id": "ready", "name": "Ready to Cook", "name_ar": "جاهز للطهي"}];
    const ar = lang === 'ar' || window.siteLang === 'ar';
    return P.map((p, i) => {
      const c = C.find((x) => x.id === p.cat) || {};
      const o = { id: p.id, no: p.no, cat: p.cat, i: i % 4, price: p.price, priceS: p.price.toFixed(2), tone: p.tone, tone2: p.tone2,
        name: ar ? p.name_ar : p.name, weight: ar ? p.weight_ar : p.weight, shot: ar ? p.shot_ar : p.shot, desc: ar ? p.desc_ar : p.desc, catName: ar ? c.name_ar : c.name };
      o.add = () => this.addToCart(o);
      o.addCls = this.state.added[p.id] ? 'add is-added' : 'add';
      return o;
    });
  }


  setF(k){ return (e) => { const f = Object.assign({}, this.state.f); f[k] = (e.target.type === 'checkbox') ? e.target.checked : e.target.value; const er = Object.assign({}, this.state.er); delete er[k]; this.setState({ f, er }); }; }
  errVals(keys){ const o = {}; const er = this.state.er || {}; keys.forEach((k) => { o['e_' + k] = !!er[k]; o['e_' + k + 'Msg'] = er[k] || ''; o['i_' + k] = er[k] ? 'true' : 'false'; o['v_' + k] = (this.state.f || {})[k] || ''; o['c_' + k] = this.setF(k); }); return o; }
  submitWith(rules, done){ const er = {}; const f = this.state.f || {}; Object.keys(rules).forEach((k) => { const m = rules[k](f[k], f); if (m) er[k] = m; }); if (Object.keys(er).length) { this.setState({ er, tried: true }); const first = document.getElementById(Object.keys(er)[0]); if (first && first.focus) first.focus(); return; } this.setState({ er: {}, busy: true }); setTimeout(() => { this.setState({ busy: false }); done(); }, 1000); }

  initState(props){ return { li: !!(props && props.loggedIn), tab: 'login', view: 'overview', f: { iname: '[Customer name]', iphone: '', iemail: '' }, er: {}, busy: false, pwShow: false, adding: false, saved: false, saving: false }; }
  renderVals(){
    const s = this.state;
    const go = (v) => () => this.setState({ view: v, saved: false });
    const nav = [['overview', 'Overview'], ['orders', 'Orders'], ['addr', 'Addresses'], ['info', 'Account details'], ['out', 'Sign out']].map((n) => ({ label: n[1], cur: (s.view === n[0] || (n[0] === 'orders' && s.view === 'detail')) ? 'page' : 'false', pick: n[0] === 'out' ? () => this.setState({ li: false }) : go(n[0]) }));
    const orders = [['AA-000124', '[Date]', '4', '795.00', 'Out for delivery', 'st-out'], ['AA-000117', '[Date]', '3', '520.00', 'Delivered', 'st-deliv'], ['AA-000103', '[Date]', '6', '1,140.00', 'Delivered', 'st-deliv']].map((o) => ({ id: o[0], date: o[1], items: o[2], total: o[3], status: o[4], cls: o[5], open: go('detail') }));
    const lr = { lid: (v) => !v ? 'Enter your email or phone number.' : '', lpw: (v) => !v ? 'Enter your password.' : '' };
    const rr = { rname: (v) => !v ? 'Enter your name.' : '', rphone: (v) => !v || v.replace(/\D/g, '').length < 8 ? 'Enter a valid phone number.' : '', remail: (v) => !v || !/^\S+@\S+\.\S+$/.test(v) ? 'Enter a valid email.' : '', rpw: (v) => !v || v.length < 8 ? 'Use at least 8 characters.' : '', rpw2: (v, f) => v !== f.rpw || !v ? 'Passwords don’t match.' : '', rterms: (v) => !v ? 'Please accept the terms.' : '' };
    return Object.assign(this.baseVals(), this.errVals(['lid', 'lpw', 'rname', 'rphone', 'remail', 'rpw', 'rpw2', 'rterms', 'iname', 'iphone', 'iemail']), {
      greet1: s.li ? 'Welcome' : 'My', greet2: s.li ? 'back.' : 'account.',
      out: !s.li, isIn: s.li, outP: s.li ? 'false' : 'true', inP: s.li ? 'true' : 'false',
      login: () => this.setState({ li: true, view: 'overview' }), logout: () => this.setState({ li: false }),
      tabLogin: s.tab === 'login' ? 'true' : 'false', tabReg: s.tab === 'reg' ? 'true' : 'false', isLogin: s.tab === 'login', isReg: s.tab === 'reg',
      toLogin: () => this.setState({ tab: 'login', er: {} }), toReg: () => this.setState({ tab: 'reg', er: {} }),
      pwType: s.pwShow ? 'text' : 'password', pwLabel: s.pwShow ? 'Hide' : 'Show', togglePw: () => this.setState({ pwShow: !this.state.pwShow }),
      busyState: s.busy ? 'loading' : 'idle',
      doLogin: (e) => { e.preventDefault(); this.submitWith(lr, () => this.setState({ li: true, view: 'overview' })); },
      doReg: (e) => { e.preventDefault(); this.submitWith(rr, () => this.setState({ li: true, view: 'overview' })); },
      nav, orders, vOverview: s.view === 'overview', vOrders: s.view === 'orders', vDetail: s.view === 'detail', vAddr: s.view === 'addr', vInfo: s.view === 'info',
      openOrder: go('detail'), goOrders: go('orders'), goAddr: go('addr'),
      reorder: () => this.addToCart({ id: 'reorder', name: 'Reorder · 3 products' }, 3),
      adding: s.adding, toggleAdd: () => this.setState({ adding: !this.state.adding }),
      saved: s.saved, saveState: s.saving ? 'loading' : 'idle', save: () => { this.setState({ saving: true }); setTimeout(() => this.setState({ saving: false, saved: true }), 800); }
    });
  }

}

return Component;})(window.DCLogic)};