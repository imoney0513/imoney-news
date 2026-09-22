/* ============================================================
   데일리 뉴스 - 페이지 렌더링 스크립트
   (보통은 이 파일을 건드릴 일이 없습니다. 기사 추가는 data/articles.js 에서)
   ============================================================ */
(function () {
  "use strict";

  var SITE = window.SITE || {};
  var ARTICLES = window.ARTICLES || [];
  var CATS = SITE.categories || [];

  /* ---------- 작은 도구들 ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
  }

  function catName(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].name;
    return "뉴스";
  }

  function toDate(s) {
    if (!s) return new Date(0);
    var d = new Date(String(s).replace(" ", "T"));
    return isNaN(d.getTime()) ? new Date(0) : d;
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function fmtDate(s) {
    var d = toDate(s);
    if (!d.getTime()) return "";
    return d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate()) +
           " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function fmtRelative(s) {
    var d = toDate(s);
    if (!d.getTime()) return "";
    var diff = Date.now() - d.getTime();
    if (diff < 0) return fmtDate(s);
    var min = Math.floor(diff / 60000);
    if (min < 1) return "방금 전";
    if (min < 60) return min + "분 전";
    var hr = Math.floor(min / 60);
    if (hr < 24) return hr + "시간 전";
    var day = Math.floor(hr / 24);
    if (day < 7) return day + "일 전";
    return fmtDate(s);
  }

  function todayLabel() {
    var d = new Date();
    var w = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + w + "요일";
  }

  function hash(str) {
    var h = 0;
    for (var i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) % 100000;
    return h;
  }

  var url = {
    article: function (a) { return "article.html?id=" + encodeURIComponent(a.id); },
    category: function (id) { return "category.html?cat=" + encodeURIComponent(id); },
    search: function (q) { return "search.html?q=" + encodeURIComponent(q); }
  };

  /* ---------- 데이터 조회 ---------- */

  function sorted() {
    return ARTICLES.slice().sort(function (a, b) { return toDate(b.date) - toDate(a.date); });
  }

  function byCategory(cat) {
    return sorted().filter(function (a) { return a.category === cat; });
  }

  function byId(id) {
    for (var i = 0; i < ARTICLES.length; i++) if (ARTICLES[i].id === id) return ARTICLES[i];
    return null;
  }

  /* ---------- 조각 만들기 ---------- */

  // 사진이 없을 때 쓰는 자동 썸네일 (기사 id 로 색이 정해짐)
  function thumb(a) {
    if (a.image) {
      return '<span class="thumb"><img src="' + esc(a.image) + '" alt="' + esc(a.title) + '" loading="lazy"></span>';
    }
    var hue = hash(a.id) % 360;
    var style = "background:linear-gradient(135deg,hsl(" + hue + ",42%,46%),hsl(" + ((hue + 38) % 360) + ",46%,32%))";
    return '<span class="thumb"><span class="thumb-ph" style="' + style + '">' + esc(catName(a.category)) + "</span></span>";
  }

  function card(a) {
    return '<a class="card" href="' + url.article(a) + '">' +
      thumb(a) +
      '<span class="cat-tag">' + esc(catName(a.category)) + "</span>" +
      "<h3>" + esc(a.title) + "</h3>" +
      "<p>" + esc(a.summary) + "</p>" +
      '<span class="meta">' + esc(a.author || "") + '<span class="dot"></span>' + fmtRelative(a.date) + "</span>" +
      "</a>";
  }

  function listItem(a) {
    return '<a class="list-item" href="' + url.article(a) + '">' +
      "<span>" + thumb(a) + "</span>" +
      "<span>" +
        '<span class="cat-tag">' + esc(catName(a.category)) + "</span>" +
        "<h3>" + esc(a.title) + "</h3>" +
        "<p>" + esc(a.summary) + "</p>" +
        '<span class="meta">' + esc(a.author || "") + '<span class="dot"></span>' + fmtDate(a.date) + "</span>" +
      "</span></a>";
  }

  function headlineItem(a) {
    return "<li><a href='" + url.article(a) + "'>" +
      '<span class="t">' + esc(a.title) + "</span>" +
      '<span class="meta"><span class="cat-tag">' + esc(catName(a.category)) + "</span>" + fmtRelative(a.date) + "</span>" +
      "</a></li>";
  }

  function rankItem(a, i) {
    return "<li><span class='rank-num'>" + (i + 1) + "</span>" +
      "<a href='" + url.article(a) + "' class='t'>" + esc(a.title) + "</a></li>";
  }

  function setHTML(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  /* ---------- 머리말 / 꼬리말 ---------- */

  function renderChrome(activeCat) {
    var navLinks = '<a href="index.html"' + (activeCat === "home" ? ' class="is-active"' : "") + ">홈</a>" +
      CATS.map(function (c) {
        return '<a href="' + url.category(c.id) + '"' + (activeCat === c.id ? ' class="is-active"' : "") + ">" + esc(c.name) + "</a>";
      }).join("");

    setHTML("site-header",
      '<div class="topbar"><div class="wrap">' +
        "<span>" + todayLabel() + "</span>" +
        '<span class="topbar-links"><a href="index.html">홈</a><a href="#footer">회사소개</a><a href="#footer">제보하기</a></span>' +
      "</div></div>" +

      '<header class="masthead"><div class="wrap">' +
        '<a class="logo" href="index.html">' +
          '<span class="logo-mark">' + esc(SITE.name || "NEWS") + "</span>" +
          '<span class="logo-tagline">' + esc(SITE.tagline || "") + "</span>" +
        "</a>" +
        '<form class="searchbox" id="search-form">' +
          '<input type="search" id="search-input" placeholder="검색어를 입력하세요" aria-label="검색">' +
          '<button type="submit">검색</button>' +
        "</form>" +
      "</div></header>" +

      '<nav class="nav"><div class="wrap">' + navLinks + "</div></nav>"
    );

    var form = document.getElementById("search-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = document.getElementById("search-input").value.trim();
        if (q) location.href = url.search(q);
      });
    }

    setHTML("site-footer",
      '<div class="wrap">' +
        '<div class="footer-top">' +
          "<div>" +
            '<div class="footer-logo">' + esc(SITE.name || "NEWS") + "</div>" +
            '<div style="font-size:13px;color:var(--muted)">' + esc(SITE.tagline || "") + "</div>" +
          "</div>" +
          '<div class="footer-nav">' +
            CATS.map(function (c) { return '<a href="' + url.category(c.id) + '">' + esc(c.name) + "</a>"; }).join("") +
          "</div>" +
        "</div>" +
        '<div class="footer-info">' +
          "발행인 · 편집인 000 &nbsp;|&nbsp; 청소년보호책임자 000<br>" +
          "본 사이트의 모든 콘텐츠는 저작권의 보호를 받습니다.<br>" +
          esc(SITE.copyright || "") +
        "</div>" +
      "</div>"
    );
  }

  /* ---------- 홈 ---------- */

  function renderHome() {
    var all = sorted();
    if (!all.length) {
      setHTML("home-main", '<div class="empty"><strong>등록된 기사가 없습니다.</strong>data/articles.js 에 기사를 추가해 주세요.</div>');
      return;
    }

    var featured = all.filter(function (a) { return a.featured; });
    var pool = featured.length ? featured : all;
    var top = pool[0];
    var sides = pool.slice(1, 5);
    if (sides.length < 4) {
      sides = sides.concat(all.filter(function (a) {
        return a.id !== top.id && sides.indexOf(a) === -1;
      }).slice(0, 4 - sides.length));
    }

    // 속보 띠 : 가장 최신 기사
    setHTML("ticker",
      '<div class="ticker"><span class="ticker-label">속보</span>' +
      '<a class="ticker-item" href="' + url.article(all[0]) + '">' + esc(all[0].title) + "</a></div>"
    );

    // 톱기사
    setHTML("hero",
      '<a class="hero-main" href="' + url.article(top) + '">' +
        thumb(top) +
        '<span class="cat-tag">' + esc(catName(top.category)) + "</span>" +
        "<h1>" + esc(top.title) + "</h1>" +
        "<p>" + esc(top.summary) + "</p>" +
        '<span class="meta">' + esc(top.author || "") + '<span class="dot"></span>' + fmtRelative(top.date) + "</span>" +
      "</a>" +
      '<div class="hero-side"><h3>주요 헤드라인</h3><ul class="headline-list">' +
        sides.map(headlineItem).join("") +
      "</ul></div>"
    );

    // 최신 뉴스 (톱기사 제외)
    var latest = all.filter(function (a) { return a.id !== top.id; }).slice(0, 6);
    setHTML("latest", '<div class="grid grid-3">' + latest.map(card).join("") + "</div>");

    // 사이드바 - 실시간 주요뉴스
    setHTML("rank", '<ul class="rank-list">' + all.slice(0, 8).map(rankItem).join("") + "</ul>");

    // 사이드바 - 카테고리 바로가기
    setHTML("side-cats",
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
      CATS.map(function (c) {
        return '<a class="tag" href="' + url.category(c.id) + '">' + esc(c.name) + "</a>";
      }).join("") + "</div>"
    );

    // 카테고리별 섹션
    var sections = CATS.map(function (c) {
      var items = byCategory(c.id).slice(0, 3);
      if (!items.length) return "";
      return '<section class="section">' +
        '<div class="section-head"><h2>' + esc(c.name) + "</h2>" +
        '<a href="' + url.category(c.id) + '">더보기 &rsaquo;</a></div>' +
        '<div class="grid grid-3">' + items.map(card).join("") + "</div>" +
      "</section>";
    }).join("");
    setHTML("cat-sections", sections);
  }

  /* ---------- 기사 상세 ---------- */

  function renderArticle() {
    var a = byId(param("id"));
    var box = document.getElementById("article-root");
    if (!box) return;

    if (!a) {
      box.innerHTML = '<div class="empty"><strong>기사를 찾을 수 없습니다.</strong>' +
        '주소가 잘못되었거나 삭제된 기사입니다. <a href="index.html" style="color:var(--accent)">홈으로 가기</a></div>';
      return;
    }

    document.title = a.title + " - " + (SITE.name || "");
    var order = sorted();
    var idx = order.findIndex(function (x) { return x.id === a.id; });
    var newer = idx > 0 ? order[idx - 1] : null;
    var older = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;

    var related = byCategory(a.category).filter(function (x) { return x.id !== a.id; }).slice(0, 3);
    if (related.length < 3) {
      related = related.concat(order.filter(function (x) {
        return x.id !== a.id && related.indexOf(x) === -1;
      }).slice(0, 3 - related.length));
    }

    box.innerHTML =
      '<div class="crumb"><a href="index.html">홈</a> &rsaquo; ' +
        '<a href="' + url.category(a.category) + '">' + esc(catName(a.category)) + "</a></div>" +

      '<div class="with-side"><article class="article">' +
        '<header class="article-head">' +
          '<span class="cat-tag">' + esc(catName(a.category)) + "</span>" +
          "<h1>" + esc(a.title) + "</h1>" +
          '<p class="lead">' + esc(a.summary) + "</p>" +
          '<div class="byline"><span>' + esc(a.author || "") + "</span>" +
          "<span>입력 " + fmtDate(a.date) + "</span></div>" +
        "</header>" +

        '<figure class="article-hero">' + thumb(a) +
          "<figcaption>" + esc(catName(a.category)) + " · " + esc(a.title) + "</figcaption></figure>" +

        '<div class="article-body">' + (a.body || "<p>본문이 없습니다.</p>") + "</div>" +

        (a.tags && a.tags.length
          ? '<div class="tag-row">' + a.tags.map(function (t) {
              return '<a class="tag" href="' + url.search(t) + '">#' + esc(t) + "</a>";
            }).join("") + "</div>"
          : "") +

        '<div class="prevnext">' +
          (newer ? '<a href="' + url.article(newer) + '"><span class="lbl">이전 기사</span><span class="t">' + esc(newer.title) + "</span></a>" : "<span></span>") +
          (older ? '<a class="next" href="' + url.article(older) + '"><span class="lbl">다음 기사</span><span class="t">' + esc(older.title) + "</span></a>" : "<span></span>") +
        "</div>" +

        '<section class="section"><div class="section-head"><h2>관련 기사</h2></div>' +
          '<div class="grid grid-3">' + related.map(card).join("") + "</div></section>" +
      "</article>" +

      "<aside>" +
        '<div class="side-box"><h3>실시간 주요뉴스</h3><ul class="rank-list">' +
          order.slice(0, 7).map(rankItem).join("") + "</ul></div>" +
        '<div class="side-box"><h3>카테고리</h3><div style="display:flex;flex-wrap:wrap;gap:8px">' +
          CATS.map(function (c) { return '<a class="tag" href="' + url.category(c.id) + '">' + esc(c.name) + "</a>"; }).join("") +
        "</div></div>" +
      "</aside></div>";

    renderChrome(a.category);
  }

  /* ---------- 카테고리 ---------- */

  function renderCategory() {
    var cat = param("cat");
    var name = catName(cat);
    var items = byCategory(cat);

    document.title = name + " - " + (SITE.name || "");
    setHTML("cat-title", esc(name));
    setHTML("cat-count", items.length ? "전체 " + items.length + "건" : "");

    setHTML("cat-list", items.length
      ? items.map(listItem).join("")
      : '<div class="empty"><strong>등록된 기사가 없습니다.</strong>이 카테고리에 곧 기사가 추가됩니다.</div>');

    setHTML("rank", '<ul class="rank-list">' + sorted().slice(0, 7).map(rankItem).join("") + "</ul>");
    return cat;
  }

  /* ---------- 검색 ---------- */

  function renderSearch() {
    var q = param("q").trim();
    var needle = q.toLowerCase();
    var hits = !q ? [] : sorted().filter(function (a) {
      var hay = [a.title, a.summary, a.body, (a.tags || []).join(" "), catName(a.category)].join(" ").toLowerCase();
      return hay.indexOf(needle) !== -1;
    });

    document.title = (q ? q + " 검색 결과" : "검색") + " - " + (SITE.name || "");
    setHTML("search-title", q ? "‘" + esc(q) + "’ 검색 결과" : "검색");
    setHTML("search-count", q ? "총 " + hits.length + "건" : "");

    setHTML("search-list",
      !q ? '<div class="empty"><strong>검색어를 입력해 주세요.</strong>상단 검색창을 이용하세요.</div>'
      : hits.length ? hits.map(listItem).join("")
      : '<div class="empty"><strong>검색 결과가 없습니다.</strong>다른 검색어로 시도해 보세요.</div>');

    setHTML("rank", '<ul class="rank-list">' + sorted().slice(0, 7).map(rankItem).join("") + "</ul>");

    var input = document.getElementById("search-input");
    if (input) input.value = q;
  }

  /* ---------- 시작 ---------- */

  function start() {
    var page = document.body.getAttribute("data-page");

    if (page === "home") { renderChrome("home"); renderHome(); }
    else if (page === "article") { renderChrome(""); renderArticle(); }
    else if (page === "category") { renderChrome(renderCategory()); }
    else if (page === "search") { renderChrome(""); renderSearch(); }
    else { renderChrome(""); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
