# Layout Verification Report

> Generated: 2026-04-11T05:15:06.538Z
> Tool: verify-layout.ts (heuristic estimation, fontSize * 1.0 per Korean char)
> Viewports: iPhone SE (3rd) (375px), iPhone 16 (393px), iPhone 16 Pro Max (430px), iPad Mini (744px), Desktop (Tauri) (1024px)
> Texts checked: 3386
> Issues found: RED 0 / YELLOW 5 / INFO 132

## Measurement Method

This report uses **heuristic estimation** for text width:
- Korean (Hangul): fontSize x 1.0 per character (conservative)
- ASCII: fontSize x 0.55 per character
- Spaces: fontSize x 0.3 per character

For pixel-accurate results, install `@chenglou/pretext` with a Node canvas polyfill.
The heuristic intentionally over-estimates to minimize false negatives.

---

## RED Critical Issues

None. All single-line components have sufficient width.

---

## YELLOW Warning Issues

### 1. Card.subtitle overflow

- **Source**: `content/packages/secrets/secrets-001.json#description_kr`
- **Text**: `코드 안에 비밀번호나 중요한 키가 그대로 드러나 있는지 빠르게 확인해드려요. 무료니까 부담 없이 한번 받아보세요.`
- **Component**: Card.subtitle (maxLines: 3)
- **Viewport**: iPhone SE (3rd)
- **Container width**: 295px
- **Estimated text width**: 889px
- **Estimated lines**: 4
- **Severity**: WARNING
- **Note**: Text exceeds 3-line limit. May cause layout shift or overflow.

---

### 2. Card.subtitle overflow

- **Source**: `content/packages/secrets/secrets-005.json#description_kr`
- **Text**: `프로젝트 코드 전체를 꼼꼼히 훑어서 숨어있는 비밀번호와 키를 찾아드려요. 어디에 뭐가 있는지 목록으로 정리해드려요.`
- **Component**: Card.subtitle (maxLines: 3)
- **Viewport**: iPhone SE (3rd)
- **Container width**: 295px
- **Estimated text width**: 918px
- **Estimated lines**: 4
- **Severity**: WARNING
- **Note**: Text exceeds 3-line limit. May cause layout shift or overflow.

---

### 3. Card.subtitle overflow

- **Source**: `content/packages/data/data-002.json#description_kr`
- **Text**: `금고(데이터베이스) 문이 열려있어서 아무나 들어올 수 있는 상태예요. 잠금장치를 달아서 주인만 열 수 있게 해드려요.`
- **Component**: Card.subtitle (maxLines: 3)
- **Viewport**: iPhone SE (3rd)
- **Container width**: 295px
- **Estimated text width**: 908px
- **Estimated lines**: 4
- **Severity**: WARNING
- **Note**: Text exceeds 3-line limit. May cause layout shift or overflow.

---

### 4. Card.subtitle overflow

- **Source**: `content/security/vulnerabilities.json#VULN-003.example_damage_kr`
- **Text**: `비밀번호 파일이 인터넷에 공개되어 있으면 자동 봇이 몇 분 안에 찾아가요. 키를 가져가서 내 이름으로 쓸 수 있어요.`
- **Component**: Card.subtitle (maxLines: 3)
- **Viewport**: iPhone SE (3rd)
- **Container width**: 295px
- **Estimated text width**: 887px
- **Estimated lines**: 4
- **Severity**: WARNING
- **Note**: Text exceeds 3-line limit. May cause layout shift or overflow.

---

### 5. Card.subtitle overflow

- **Source**: `content/security/vulnerabilities.json#VULN-036.example_damage_kr`
- **Text**: `AI에게 시스템 프롬프트를 알려달라고 하면 내부 설정이 노출될 수 있어요. AI가 엉뚱한 답변을 하게 될 수도 있어요.`
- **Component**: Card.subtitle (maxLines: 3)
- **Viewport**: iPhone SE (3rd)
- **Container width**: 295px
- **Estimated text width**: 886px
- **Estimated lines**: 4
- **Severity**: WARNING
- **Note**: Text exceeds 3-line limit. May cause layout shift or overflow.

---

## INFO Informational (ellipsis truncation)

These texts are truncated with "..." by the component CSS. Not a layout break,
but users may miss information on smaller viewports.

Total: 132 texts truncated on small viewports.

1. `AI 서비스 비밀번호가 화면 코드에 그대로 보여요` in ListRow.title on iPhone SE (3rd) (372px > 215px)
2. `가게 금고 비밀번호를 쇼윈도에 붙여놓은 상태` in ListRow.subtitle on iPhone SE (3rd) (308px > 215px)
3. `데이터베이스 관리자 비밀번호가 코드에 들어있어요` in ListRow.title on iPhone SE (3rd) (394px > 215px)
4. `금고 마스터키를 카운터 위에 올려놓은 상태` in ListRow.subtitle on iPhone SE (3rd) (293px > 215px)
5. `비밀번호 파일이 누구나 볼 수 있는 곳에 올라갔어요` in ListRow.title on iPhone SE (3rd) (393px > 215px)
6. `집 열쇠를 현관 매트 밑에 두고 매트에 '열쇠 여기' 써놓은 상태` in ListRow.subtitle on iPhone SE (3rd) (422px > 215px)
7. `결제 시스템 비밀번호가 노출돼 있어요` in ListRow.title on iPhone SE (3rd) (292px > 215px)
8. `카드 결제기 비밀번호를 손님이 볼 수 있는 곳에 적어둔 상태` in ListRow.subtitle on iPhone SE (3rd) (401px > 215px)
9. `비밀번호가 코드 안에 직접 적혀있어요` in ListRow.title on iPhone SE (3rd) (292px > 215px)
10. `사무실 비밀번호를 포스트잇에 써서 모니터에 붙여놓은 상태` in ListRow.subtitle on iPhone SE (3rd) (402px > 215px)

...and 122 more.

---

## Summary by Category

| Category | Texts | Issues |
|----------|-------|--------|
| Packages (name_kr) | 312 | 0 |
| Packages (subtitle_kr) | 312 | 0 |
| Packages (symptoms) | ~440 | 0 |
| Vulnerabilities (title_kr) | 67 | 65 |
| Copy texts | ~60 | 0 |
| Hardcoded Korean in .svelte | 0 | 0 |

## Key Findings

1. **All `name_kr` values are 7 characters or fewer** -- verified. At 17px font size, 7 Korean chars = ~119px, well within any ListRow title width.

2. **Buttons use `white-space: nowrap`** -- text is never wrapped to multiple lines. On very narrow viewports, text could be clipped if it exceeds the button width, but this is a CSS-safe truncation, not a layout-breaking overflow.

3. **ListRow uses `text-overflow: ellipsis` with `white-space: nowrap`** -- long titles and subtitles are safely truncated. This is acceptable for list views but means information loss on smaller viewports for longer vulnerability titles.

4. **No hardcoded Korean text found in Svelte routes or stores.** All text comes from `content/` via the i18n loader. This is compliant with Rule 7 (CLAUDE.md).

5. **Copy CTA buttons** are all short (2-7 chars), easily fitting within button constraints.

6. **Vulnerability `title_kr` texts** can be long (up to 31 chars) but are displayed in ListRow which truncates with ellipsis. On Sheet detail view they get full-width body text, so no issue.
