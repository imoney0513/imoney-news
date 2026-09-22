# IMONEY 뉴스 — 사용 설명서

정적 HTML 뉴스 사이트입니다. 서버 없이 `index.html` 을 더블클릭하면 바로 열립니다.

## 폴더 구조

```
News/
├─ index.html        홈
├─ article.html      기사 보기 (article.html?id=기사아이디)
├─ category.html     카테고리 목록 (category.html?cat=politics)
├─ search.html       검색 결과
├─ assets/
│  ├─ style.css      디자인 (색상은 맨 위 :root 에서 변경)
│  └─ site.js        화면 그리는 스크립트 (건드릴 일 거의 없음)
└─ data/
   └─ articles.js    ★ 기사 데이터 — 여기만 편집하면 됩니다
```

## 기사 추가하는 법

`data/articles.js` 를 메모장·VS Code 등으로 열고, `window.ARTICLES = [` **바로 아래**에
아래 블록을 붙여넣은 뒤 내용을 채우면 됩니다. (맨 위에 넣든 아래 넣든 **날짜 최신순으로 자동 정렬**됩니다.)

```js
  {
    id: "2026-09-23-my-first",
    title: "제목을 여기에",
    summary: "목록에 보이는 한 줄 요약",
    category: "society",
    author: "홍길동 기자",
    date: "2026-09-23 10:00",
    image: "",
    featured: false,
    tags: ["키워드1", "키워드2"],
    body: `
<p>첫 번째 문단입니다.</p>

<h2>소제목</h2>
<p>두 번째 문단입니다.</p>

<blockquote>인용문은 이렇게.</blockquote>
`
  },
```

### 각 항목 설명

| 항목 | 설명 |
|---|---|
| `id` | 주소에 쓰이는 고유값. **중복되면 안 됩니다.** 영문·숫자·하이픈만 사용 |
| `title` | 제목 |
| `summary` | 홈·목록에 보이는 요약 (2줄까지 표시) |
| `category` | `politics` `economy` `society` `world` `tech` `culture` `sports` 중 하나 |
| `author` | 기자 이름 |
| `date` | `"YYYY-MM-DD HH:MM"` 형식. 이 값 기준으로 최신순 정렬 |
| `image` | 대표 사진 주소. **빈칸("")이면 카테고리 색 썸네일이 자동 생성** |
| `featured` | `true` 면 홈 상단 대표기사 후보. 그중 가장 최신 1건이 톱기사가 됩니다 |
| `tags` | 기사 하단 해시태그. 누르면 그 단어로 검색됩니다 |
| `body` | 본문. 백틱(`` ` ``) 사이에 HTML 로 작성 |

### 본문에 쓸 수 있는 태그

```html
<p>일반 문단</p>
<h2>소제목</h2>
<blockquote>인용문</blockquote>
<figure><img src="사진주소" alt="설명"><figcaption>사진 설명</figcaption></figure>
<ul><li>목록</li></ul>
<a href="https://example.com">링크</a>
```

> ⚠️ 본문은 백틱( ` ) 으로 감싸므로, **본문 안에 백틱이나 `${` 를 쓰면 안 됩니다.**

### 사진 넣기

1. `assets/` 안에 `images` 폴더를 만들어 사진을 넣고
2. `image: "assets/images/사진이름.jpg"` 처럼 적으면 됩니다.

## 기사 삭제

`data/articles.js` 에서 해당 `{ ... },` 블록을 통째로 지우면 됩니다.

## 사이트 이름·카테고리 바꾸기

`data/articles.js` 맨 위 `window.SITE` 부분에서 이름, 문구, 카테고리 목록을 수정합니다.
카테고리를 추가했다면 기사의 `category` 값에 그 `id` 를 쓰면 됩니다.

## 색상 바꾸기

`assets/style.css` 맨 위 `:root` 의 `--accent` 값을 바꾸면 포인트 색(파랑)이 전체적으로 바뀝니다.

## 인터넷에 올리기

폴더 전체를 GitHub Pages, Netlify, Cloudflare Pages 등에 그대로 올리면 됩니다. 별도 빌드 과정이 필요 없습니다.

---

현재 들어있는 기사 12건은 **화면 확인용 샘플**이며, 등장하는 인물·기관은 모두 가상입니다.
실제 기사를 채울 때 통째로 지우고 쓰시면 됩니다.
