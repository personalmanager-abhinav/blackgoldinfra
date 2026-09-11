(function () {
  var S = window.SITE;
  if (!S) { console.error("config.js must load before components.js"); return; }

  var ROOT = document.documentElement.getAttribute("data-root") || "";
  var EXTERNAL = /^(?:[a-z]+:|#)/i;

  function withRoot(node) {
    if (Array.isArray(node)) { node.forEach(withRoot); return; }
    if (!node || typeof node !== "object") return;
    Object.keys(node).forEach(function (k) {
      if (k === "href" && typeof node[k] === "string" && !EXTERNAL.test(node[k])) node[k] = ROOT + node[k];
      else withRoot(node[k]);
    });
  }
  withRoot(S.nav); withRoot(S.quickLinks); withRoot(S.footerLinks);

  function normPath(p) { return p.replace(/\/index\.html$/, "/").replace(/\/$/, "/"); }
  var here = normPath(location.pathname);
  function isCurrent(href) {
    if (!href || EXTERNAL.test(href)) return false;
    return normPath(new URL(href.split("#")[0], location.href).pathname) === here;
  }

  var ICONS = {
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.5 9.5c0 3 2 5 5 5.5"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="3.5"/><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.49 2.49 0 1 1 0 3.5a2.49 2.49 0 0 1 4.98 0ZM.4 8.2h4.16V24H.4V8.2Zm6.84 0h3.99v2.16h.06c.56-1.05 1.92-2.16 3.95-2.16 4.22 0 5 2.78 5 6.4V24h-4.16v-7c0-1.67-.03-3.82-2.33-3.82-2.33 0-2.69 1.82-2.69 3.7V24H7.24V8.2Z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>'
  };
  function icon(label) { return ICONS[(label || "").toLowerCase()] || ""; }

  function logoDark() {
    return '<img class="brand-logo" src="' + ROOT + 'assets/images/brand/logo.png" alt="AVK Blackgold Infra">';
  }
  function logoLight() {
    return '<img class="brand-logo" src="' + ROOT + 'assets/images/brand/logo-light.png" alt="AVK Blackgold Infra">';
  }

  var TOGGLE =
    '<svg class="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>' +
    '<svg class="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/></svg>';

  function social() {
    return S.social.map(function (s) {
      return '<a href="' + s.href + '" aria-label="' + s.label + '">' + icon(s.label) + '<span>' + s.label + '</span></a>';
    }).join("");
  }

  function megaAbout(item) {
    return '<div class="mega"><div class="mega-grid is-3">' + item.columns.map(function (c) {
      return '<a class="mega-card" href="' + c.href + '"><span class="t">' + c.title + '</span><span class="n">' + c.note + '</span></a>';
    }).join("") + '</div></div>';
  }
  function megaDo(item) {
    var p = item.products.map(function (x) { return '<a class="mega-link" href="' + x.href + '">' + x.title + '</a>'; }).join("");
    var s = item.services.map(function (x) { return '<a class="mega-link" href="' + x.href + '">' + x.title + '</a>'; }).join("");
    return '<div class="mega"><div class="mega-tabs"><div><h4>Products</h4>' + p + '</div><div><h4>Services</h4>' + s + '</div></div></div>';
  }
  function navItems() {
    return S.nav.map(function (item) {
      if (item.mega) {
        var kids = (item.columns || []).concat(item.products || [], item.services || []);
        var inSec = kids.some(function (k) { return isCurrent(k.href); }) ? " is-current" : "";
        return '<li class="nav__item"><button class="nav__link' + inSec + '" aria-haspopup="true">' + item.label +
          '<span class="nav__caret"></span></button>' + (item.mega === "about" ? megaAbout(item) : megaDo(item)) + '</li>';
      }
      var cur = isCurrent(item.href) ? ' aria-current="page"' : "";
      return '<li class="nav__item"><a class="nav__link" href="' + item.href + '"' + cur + '>' + item.label + '</a></li>';
    }).join("");
  }
  function drawerItems() {
    return S.nav.map(function (item) {
      if (item.mega) {
        var subs = item.mega === "about"
          ? item.columns.map(function (c) { return '<a href="' + c.href + '">' + c.title + '</a>'; }).join("")
          : item.products.concat(item.services).map(function (x) { return '<a href="' + x.href + '">' + x.title + '</a>'; }).join("");
        return '<div class="dgroup"><button>' + item.label + '<span class="nav__caret"></span></button><div class="dsub">' + subs + '</div></div>';
      }
      return '<a href="' + item.href + '">' + item.label + '</a>';
    }).join("");
  }

  var IC_CONNECT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/>' +
    '<path d="M8.3 10.8 15.7 6.4M8.3 13.2l7.4 4.4"/></svg>';

  var headerHTML =
    '<header class="header" data-header>' +
      '<div class="wrap header__bar">' +
        '<a class="logo logo--glass" href="' + ROOT + 'index.html" aria-label="AVK Blackgold Infra home">' + logoLight() + '</a>' +
        '<div class="hpill">' +
        '<nav class="navwrap" aria-label="Primary"><ul class="nav"><li class="nav__ind" aria-hidden="true"></li>' + navItems() + '</ul></nav>' +
        '<div class="header__cta">' +
          '<div class="connect">' +
            '<button class="icon-btn" data-connect-toggle aria-label="Contact and social links" aria-expanded="false">' + IC_CONNECT + '</button>' +
            '<div class="connect__pop">' +
              '<span class="connect__title">Connect with us</span>' +
              '<div class="connect__links">' + social() + '</div>' +
            '</div>' +
          '</div>' +
          '<button class="icon-btn theme-toggle" data-theme-toggle aria-label="Toggle dark mode">' + TOGGLE + '</button>' +
          '<button class="burger" aria-label="Open menu" aria-expanded="false"><span></span></button>' +
        '</div>' +
        '</div>' +
      '</div>' +
    '</header>' +
    '<div class="scrim" data-close-nav></div>' +
    '<aside class="drawer" aria-label="Mobile menu">' +
      '<div class="drawer__top">' +
        '<a class="logo" href="' + ROOT + 'index.html" aria-label="AVK Blackgold Infra home">' + logoDark() + '</a>' +
        '<div class="drawer__tools">' +
          '<button class="icon-btn theme-toggle" data-theme-toggle aria-label="Toggle dark mode">' + TOGGLE + '</button>' +
          '<button class="icon-btn" data-close-nav aria-label="Close menu">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="drawer__nav">' + drawerItems() + '</div>' +
      '<a class="btn btn--primary btn--pill drawer__cta" href="#" data-open-quote>Request a Quote <span class="btn__ic">&rarr;</span></a>' +
      '<div class="drawer__social"><span class="connect__title">Connect with us</span><div class="connect__links">' + social() + '</div></div>' +
    '</aside>';

  var c = S.contact;
  var footerHTML =
    '<footer class="footer">' +
      '<div class="footer__top"><div class="wrap">' +
        S.footerLinks.map(function (l) { return '<a href="' + l.href + '">' + l.label + '</a>'; }).join("") +
      '</div></div>' +
      '<div class="footer__main"><div class="wrap">' +
        '<div class="footer__brand">' +
          '<a class="logo logo--footer" href="' + ROOT + 'index.html" aria-label="AVK Blackgold Infra home">' + logoLight() + '</a>' +
          '<h4>Registered Office</h4>' +
          '<address>' + c.addressLines.join("<br>") + '<br><br>CIN: ' + c.cin +
            '<br>Working Hours: ' + c.workingHours + '<br>Working Days: ' + c.workingDays +
            '<br><br>Email: <a href="mailto:' + c.corporateEmail + '">' + c.corporateEmail + '</a>' +
            '<br>Tel: <a href="tel:' + c.phone.replace(/\s/g, "") + '">' + c.phone + '</a>' +
            (c.phoneAlt ? ' / <a href="tel:' + c.phoneAlt.replace(/\s/g, "") + '">' + c.phoneAlt + '</a>' : "") + '</address>' +
          '<div class="footer__social">' + social() + '</div>' +
        '</div>' +
        '<div><h4>Quick Links</h4><div class="qlinks">' +
          S.quickLinks.map(function (l) { return '<a href="' + l.href + '">' + l.label + '</a>'; }).join("") +
        '</div></div>' +
        '<div><h4>Our Location</h4>' +
          '<div class="mapbox"><iframe title="AVK Blackgold Infra, Magdalla, Surat" ' +
            'src="https://www.google.com/maps?q=Rajhans%20Montessa%2C%20Magdalla%2C%20Surat%20395007&output=embed" ' +
            'loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>' +
          '<p style="margin-top:12px;font-size:.85rem">714, Rajhans Montessa, Magdalla, Surat &ndash; 395 007</p>' +
        '</div>' +
      '</div></div>' +
      '<div class="footer__bottom"><div class="wrap">' +
        '<span>&copy; ' + new Date().getFullYear() + ' ' + S.brand.legalName + '. All Rights Reserved.</span>' +
      '</div></div>' +
    '</footer>';

  var h = document.getElementById("site-header");
  var f = document.getElementById("site-footer");
  if (h) h.innerHTML = headerHTML;
  if (f) f.innerHTML = footerHTML;

  if (!document.querySelector(".to-top")) {
    var top = document.createElement("button");
    top.className = "to-top";
    top.setAttribute("data-to-top", "");
    top.setAttribute("aria-label", "Back to top");
    top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>';
    document.body.appendChild(top);
  }
})();
