(function () {
  var S = window.SITE || {};

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  (function () {
    var ld = document.querySelector(".loader");
    if (!ld) return;
    var kill = function () { if (ld && ld.parentNode) ld.parentNode.removeChild(ld); ld = null; };

    setTimeout(kill, 2400);
    var bot = ld.querySelector(".loader__bot");
    if (bot) bot.addEventListener("animationend", function () { setTimeout(kill, 60); });
  })();

  ready(function () {

    var body = document.body;
    function closeNav() { body.classList.remove("nav-open"); var b = document.querySelector(".burger"); if (b) b.setAttribute("aria-expanded", "false"); }
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-theme-toggle]")) {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("avk-theme", next); } catch (err) {}
      }

      var megaBtn = e.target.closest('.nav__link[aria-haspopup="true"]');
      var openItems = document.querySelectorAll(".nav__item.open");
      if (megaBtn) {
        e.preventDefault();
        var parent = megaBtn.closest(".nav__item");
        var wasOpen = parent.classList.contains("open");
        openItems.forEach(function (n) { n.classList.remove("open"); });
        if (!wasOpen) parent.classList.add("open");
      } else if (!e.target.closest(".mega")) {
        openItems.forEach(function (n) { n.classList.remove("open"); });
      }

      var cToggle = e.target.closest("[data-connect-toggle]");
      var connect = document.querySelector(".connect");
      if (connect) {
        if (cToggle) {
          var willOpen = !connect.classList.contains("open");
          connect.classList.toggle("open", willOpen);
          cToggle.setAttribute("aria-expanded", willOpen);
        } else if (!e.target.closest(".connect__pop")) {
          connect.classList.remove("open");
          var ct = connect.querySelector("[data-connect-toggle]");
          if (ct) ct.setAttribute("aria-expanded", "false");
        }
      }

      if (e.target.closest(".burger")) {
        body.classList.toggle("nav-open");
        var b = document.querySelector(".burger");
        b.setAttribute("aria-expanded", body.classList.contains("nav-open"));
      }
      if (e.target.closest("[data-close-nav]")) closeNav();
      var grp = e.target.closest(".dgroup > button");
      if (grp) grp.parentElement.classList.toggle("open");

      var tabBtn = e.target.closest("[data-tab]");
      if (tabBtn) {
        var group = tabBtn.closest("[data-tabs]") || document;
        var id = tabBtn.getAttribute("data-tab");
        group.querySelectorAll("[data-tab]").forEach(function (b) {
          b.classList.toggle("is-active", b === tabBtn);
        });
        group.querySelectorAll("[data-panel]").forEach(function (p) {
          p.classList.toggle("is-active", p.getAttribute("data-panel") === id);
        });
      }

      var accHead = e.target.closest(".acc__head");
      if (accHead) {
        var item = accHead.parentElement;
        var openIt = !item.classList.contains("open");
        item.classList.toggle("open", openIt);
        accHead.setAttribute("aria-expanded", openIt);
      }

      if (e.target.closest("[data-to-top]")) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    var hd = document.querySelector("[data-header]");
    var para = document.querySelector("[data-parallax]");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (hd || para) {
      var ticking = false;
      var onHeadScroll = function () {
        var y = window.scrollY || 0;
        if (hd) hd.classList.toggle("is-stuck", y > 40);
        if (para && !reduceMotion) para.style.transform = "translate3d(0," + (y * 0.28).toFixed(1) + "px,0)";
        ticking = false;
      };
      window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onHeadScroll); }
      }, { passive: true });
      onHeadScroll();
    }

    var numEls = Array.prototype.slice.call(document.querySelectorAll(
      "[data-count], .statband .sb b, .stat .num, .featcard .fnum"));
    numEls = numEls.filter(function (el, i) { return numEls.indexOf(el) === i; });
    var jobs = [];
    numEls.forEach(function (el) {

      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), node, m = null;
      while ((node = walker.nextNode())) {
        m = node.nodeValue.match(/^([^\d]*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s);
        if (m) break;
      }
      if (!m) return;
      var raw = m[2], target = parseFloat(raw.replace(/,/g, ""));
      var dec = (raw.split(".")[1] || "").length, commas = raw.indexOf(",") > -1;
      var fmt = function (v) {
        var t = v.toFixed(dec);
        if (commas) t = Number(t).toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        return m[1] + t + m[3];
      };
      var job = { el: el, node: node, target: target, fmt: fmt, dec: dec, done: false };
      node.nodeValue = fmt(0);
      el.setAttribute("aria-label", fmt(target).trim());
      jobs.push(job);
    });
    var runCount = function (job) {
      if (job.done) return; job.done = true;

      var rv = job.el.closest(".reveal");
      var wait = 150 + (rv ? (parseFloat(rv.style.transitionDelay) || 0) : 0);
      setTimeout(function () { startCount(job); }, wait);
    };
    var startCount = function (job) {
      var dur = 2000, t0 = null;
      var tick = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        var v = job.target * eased;
        job.node.nodeValue = job.fmt(p < 1 ? (job.dec ? v : Math.floor(v)) : job.target);
        if (p < 1) requestAnimationFrame(tick);
        else { job.el.classList.add("is-counted"); }
      };
      requestAnimationFrame(tick);
    };
    if (jobs.length) {
      if ("IntersectionObserver" in window) {
        var cio = new IntersectionObserver(function (ents) {
          ents.forEach(function (en) {
            if (!en.isIntersecting) return;
            jobs.forEach(function (j) { if (j.el === en.target) runCount(j); });
            cio.unobserve(en.target);
          });
        }, { threshold: 0.35 });
        jobs.forEach(function (j) { cio.observe(j.el); });
      } else {
        jobs.forEach(runCount);
      }
    }

    var navEl = document.querySelector(".nav");
    var lamp = navEl && navEl.querySelector(".nav__ind");
    if (lamp) {
      var homeLink = navEl.querySelector('.nav__link[aria-current="page"], .nav__link.is-current');
      var placeLamp = function (link) {
        if (!link || !link.offsetWidth) { lamp.classList.add("is-off"); return; }
        var nr = navEl.getBoundingClientRect(), lr = link.getBoundingClientRect();
        lamp.classList.remove("is-off");
        lamp.style.width = lr.width + "px";
        lamp.style.transform = "translateX(" + (lr.left - nr.left) + "px)";
      };
      lamp.style.transition = "none";
      placeLamp(homeLink);
      navEl.classList.add("has-ind");
      requestAnimationFrame(function () { requestAnimationFrame(function () { lamp.style.transition = ""; }); });
      navEl.querySelectorAll(".nav__link").forEach(function (l) {
        l.addEventListener("mouseenter", function () { placeLamp(l); });
        l.addEventListener("focus", function () { placeLamp(l); });
      });
      navEl.addEventListener("mouseleave", function () {
        var open = navEl.querySelector(".nav__item.open > .nav__link");
        placeLamp(open || homeLink);
      });
      var relamp = function () { lamp.style.transition = "none"; placeLamp(homeLink);
        requestAnimationFrame(function () { lamp.style.transition = ""; }); };
      window.addEventListener("resize", relamp);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(relamp);
    }

    document.querySelectorAll(".card--reveal").forEach(function (card) {
      var link = card.querySelector(".card__panel a[href]");
      if (!link) { card.style.cursor = "default"; return; }
      card.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        window.location.href = link.getAttribute("href");
      });
    });

    document.querySelectorAll(".hero__quick .hql").forEach(function (t) {
      t.addEventListener("animationend", function () { t.classList.add("is-in"); });
    });

    var hv = document.querySelector(".hero__media video");
    if (hv) {
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (ents) {
          ents.forEach(function (en) {
            if (en.isIntersecting) { var pr = hv.play(); if (pr && pr.catch) pr.catch(function () {}); }
            else hv.pause();
          });
        }, { threshold: 0.05 }).observe(hv);
      }
    }

    var prog = document.createElement("div");
    prog.className = "scroll-progress"; prog.setAttribute("aria-hidden", "true");
    document.body.appendChild(prog);
    var progTick = false;
    var setProg = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = "scaleX(" + (h > 0 ? Math.min(window.scrollY / h, 1) : 0).toFixed(4) + ")";
      progTick = false;
    };
    window.addEventListener("scroll", function () { if (!progTick) { progTick = true; requestAnimationFrame(setProg); } }, { passive: true });
    setProg();

    var brows = document.querySelectorAll(".eyebrow");
    if ("IntersectionObserver" in window) {
      var bio = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); bio.unobserve(en.target); } });
      }, { threshold: 0.6 });
      brows.forEach(function (el) { bio.observe(el); });
    } else { brows.forEach(function (el) { el.classList.add("is-in"); }); }

    var toTop = document.querySelector(".to-top");
    if (toTop) {
      var onScroll = function () { toTop.classList.toggle("show", window.scrollY > 400); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeNav(); closeModal(); } });

    var reveals = document.querySelectorAll(".reveal");
    reveals.forEach(function (el) {
      var sibs = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); }) : [];
      var idx = sibs.indexOf(el);
      if (sibs.length > 1 && idx > 0) {
        el.style.transitionDelay = Math.min(idx * 110, 440) + "ms";

        el.addEventListener("transitionend", function clear() { el.style.transitionDelay = ""; el.removeEventListener("transitionend", clear); });
      }
    });
    function revealAll() { reveals.forEach(function (el) { el.classList.add("in"); }); }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.01, rootMargin: "0px 0px 12% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
      setTimeout(revealAll, 1500);
    } else {
      revealAll();
    }

    var modal = document.getElementById("quote-modal");
    function openModal() { if (modal) { modal.classList.add("open"); document.body.style.overflow = "hidden"; } }
    function closeModal() { if (modal) { modal.classList.remove("open"); document.body.style.overflow = ""; } }
    window.closeModal = closeModal;
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-open-quote]")) { e.preventDefault(); openModal(); }
      if (e.target.closest("[data-close-modal]") || e.target.classList.contains("modal__scrim")) closeModal();
    });

    initForms(closeModal);
  });

  function initForms(closeModal) {
    var key = S.formAccessKey;
    var demo = !key || key.indexOf("REPLACE_WITH") === 0;

    document.querySelectorAll("form[data-form]").forEach(function (form) {
      var status = form.querySelector(".form-status");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validate(form)) return;

        var btn = form.querySelector("[type=submit]");
        var label = btn ? btn.textContent : "";
        if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

        if (demo) {

          setTimeout(function () {
            done(true, "Demo mode: form is valid. Add a Web3Forms access key in assets/js/config.js to deliver emails.");
          }, 500);
          return;
        }

        var data = new FormData(form);
        data.append("access_key", key);
        data.append("subject", (form.getAttribute("data-subject") || "Website enquiry") + " — " + (S.brand && S.brand.name));
        fetch("https://api.web3forms.com/submit", { method: "POST", body: data })
          .then(function (r) { return r.json(); })
          .then(function (j) { done(j.success, j.success ? "Thanks — your message has been sent. We'll be in touch." : (j.message || "Something went wrong. Please try again.")); })
          .catch(function () { done(false, "Network error. Please try again or email us directly."); });

        function done(ok, msg) {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          if (status) { status.className = "form-status " + (ok ? "ok" : "bad"); status.textContent = msg; }
          if (ok) {
            form.reset();
            if (form.closest(".modal")) setTimeout(closeModal, 2200);
          }
        }
      });

      form.querySelectorAll("input,select,textarea").forEach(function (el) {
        el.addEventListener("input", function () {
          var f = el.closest(".field"); if (f) f.classList.remove("invalid");
        });
      });
    });
  }

  function validate(form) {
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (el) {
      var field = el.closest(".field") || el.closest(".consent");
      var valid = el.type === "checkbox" ? el.checked : String(el.value).trim() !== "";
      if (el.type === "email" && valid) valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value);
      if (field) field.classList.toggle("invalid", !valid);
      if (!valid && ok) { ok = false; (field || el).scrollIntoView({ behavior: "smooth", block: "center" }); }
    });
    return ok;
  }
})();
