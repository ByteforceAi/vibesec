const m=`# Checkout Flow Copy\r
\r
---\r
\r
## cart\r
\r
- **cart_empty**: 아직 담은 처방이 없어요. 건강검진표에서 필요한 처방을 골라보세요.\r
- **cart_summary**: 총 {count}개 처방을 담으셨어요.\r
- **delete_confirmation**: 이 처방을 빼시겠어요?\r
\r
---\r
\r
## package_selection_confirmation\r
\r
- **selection_confirmation**: 선택하신 처방을 확인해주세요.\r
- **warranty_info**: 모든 처방에는 수리 후 보증이 포함돼요. 보증 기간 안에 같은 증상이 나타나면 무료로 다시 봐드려요.\r
- **bundle_discount_info**: 여러 처방을 함께 접수하시면 더 효율적이에요.\r
\r
---\r
\r
## payment_method\r
\r
- **payment_method_selection**: 접수 방법을 선택해주세요.\r
- **card_payment**: 카드로 접수하기\r
- **kakao_consultation**: 카톡으로 상담 후 접수하기\r
\r
---\r
\r
## payment_complete\r
\r
- **complete_title**: 접수 완료!\r
- **complete_body**: 접수가 완료됐어요. 저희가 확인 후 바로 시작할게요.\r
- **estimated_duration**: 예상 소요 시간은 {duration}이에요.\r
- **warranty_start**: 수리 완료 후 {warranty}일간 보증이 시작돼요.\r
\r
---\r
\r
## receipt\r
\r
- **receipt_title**: 접수 확인서\r
- **order_number**: 접수번호 {orderNumber}\r
- **order_date**: {date}\r
- **order_item**: {packageName} ({price}원)\r
- **total**: 총 {total}원\r
- **warranty**: {warranty}일 보증 포함\r
`,y=`# Diagnosis Flow Copy\r
\r
---\r
\r
## url_input_prompt\r
\r
- **default**: 프로젝트 주소를 붙여넣어 주세요\r
- **hint**: 깃허브 주소나 배포된 사이트 주소 모두 가능해요\r
\r
---\r
\r
## error_copy\r
\r
- **empty_value**: 주소를 넣어주셔야 진단을 시작할 수 있어요\r
- **invalid_url**: 주소 형식이 맞지 않는 것 같아요. 다시 확인해주세요\r
\r
---\r
\r
## scanning_progress_copy_10_variations\r
\r
1. 비밀 보관함을 살펴보고 있어요...\r
2. 출입문이 잘 잠겨있는지 확인 중이에요...\r
3. 금고 상태를 점검하고 있어요...\r
4. 울타리에 구멍이 없는지 보고 있어요...\r
5. 입력란을 하나하나 확인하는 중이에요...\r
6. 건물 기초가 튼튼한지 살펴보고 있어요...\r
7. 감시 카메라가 켜져있는지 확인 중이에요...\r
8. 비상 대피로가 있는지 보고 있어요...\r
9. 거의 다 됐어요. 마지막으로 한번 더 확인 중...\r
10. 건강검진표를 정리하고 있어요...\r
\r
---\r
\r
## report_summary_copy.summary_phrases\r
\r
- **template**: 진단이 끝났어요. 총 {total}개 항목을 살펴봤어요.\r
\r
---\r
\r
## severity_comments\r
\r
- **urgent_count**: 지금 고치는 게 좋아요. 급한 것부터 하나씩 안내해드릴게요.\r
- **careful_count**: 당장 급하진 않지만 시간 될 때 봐두면 좋아요.\r
- **ok_count**: 잘 돼있어요! 이 부분은 안심하셔도 돼요.\r
\r
---\r
\r
## overall_grade_summary\r
\r
- **all_ok**: 축하해요! 전반적으로 잘 관리되고 있어요.\r
- **has_urgent**: 급한 것 {critical}개가 있어요. 이것부터 고치면 훨씬 안심이 돼요.\r
- **all_urgent**: 급한 게 좀 많아요. 걱정 마세요, 저희가 하나씩 도와드릴게요.\r
`,d=`# 빈 상태 카피\r
\r
---\r
\r
## 진단 기록 없음\r
\r
- **제목**: 아직 진단 기록이 없어요\r
- **본문**: 프로젝트 주소를 넣어주시면 무료로 건강검진 해드려요.\r
- **CTA**: 첫 진단 받기\r
\r
---\r
\r
## 검색 결과 없음\r
\r
- **제목**: 찾으시는 게 없어요\r
- **본문**: 다른 검색어로 다시 찾아보시겠어요?\r
- **CTA**: 전체 보기\r
\r
---\r
\r
## 장바구니 비어있음\r
\r
- **제목**: 아직 담은 처방이 없어요\r
- **본문**: 건강검진표에서 필요한 처방을 골라보세요.\r
- **CTA**: 처방 둘러보기\r
\r
---\r
\r
## 오프라인 상태\r
\r
- **제목**: 인터넷 연결이 끊겼어요\r
- **본문**: 지난 검진 기록은 볼 수 있어요. 새 진단은 연결 후 가능해요.\r
- **CTA**: 지난 기록 보기\r
\r
---\r
\r
## 알림 없음\r
\r
- **제목**: 새로운 알림이 없어요\r
- **본문**: 진단을 받으시면 알림으로 결과를 알려드려요.\r
`,u=`# Empty States Copy\r
\r
---\r
\r
## no_diagnosis_records\r
\r
- **title**: 아직 진단 기록이 없어요\r
- **body**: 프로젝트 주소를 넣어주시면 무료로 건강검진 해드려요.\r
- **cta**: 첫 진단 받기\r
\r
---\r
\r
## no_search_results\r
\r
- **title**: 찾으시는 게 없어요\r
- **body**: 다른 검색어로 다시 찾아보시겠어요?\r
- **cta**: 전체 보기\r
\r
---\r
\r
## cart_empty\r
\r
- **title**: 아직 담은 처방이 없어요\r
- **body**: 건강검진표에서 필요한 처방을 골라보세요.\r
- **cta**: 처방 둘러보기\r
\r
---\r
\r
## offline\r
\r
- **title**: 인터넷 연결이 끊겼어요\r
- **body**: 지난 검진 기록은 볼 수 있어요. 새 진단은 연결 후 가능해요.\r
- **cta**: 지난 기록 보기\r
\r
---\r
\r
## no_notifications\r
\r
- **title**: 새로운 알림이 없어요\r
- **body**: 진단을 받으시면 알림으로 결과를 알려드려요.\r
`,b=`# Error Messages Copy\r
\r
---\r
\r
## network_error\r
\r
- **title**: 연결이 안 되고 있어요\r
- **body**: 인터넷이 잠깐 끊긴 것 같아요. 잠시 후 다시 시도해주세요.\r
- **cta**: 다시 시도\r
\r
---\r
\r
## server_error_500\r
\r
- **title**: 저희 쪽에 문제가 생겼어요\r
- **body**: 저희 가게가 지금 잠깐 분주해요. 잠시 후 다시 와주세요.\r
- **cta**: 다시 시도\r
\r
---\r
\r
## permission_error_403\r
\r
- **title**: 접근할 수 없는 페이지예요\r
- **body**: 이 페이지를 볼 수 있는 권한이 필요해요. 로그인을 확인해주세요.\r
- **cta**: 로그인 확인\r
\r
---\r
\r
## page_not_found_404\r
\r
- **title**: 찾으시는 페이지가 없어요\r
- **body**: 주소가 맞는지 다시 확인해주세요. 홈에서 다시 찾아보실 수도 있어요.\r
- **cta**: 홈으로 가기\r
\r
---\r
\r
## url_format_error\r
\r
- **title**: 주소 형식이 맞지 않아요\r
- **body**: https://로 시작하는 전체 주소를 넣어주세요.\r
- **cta**: 다시 입력\r
\r
---\r
\r
## diagnosis_failure\r
\r
- **title**: 진단을 완료하지 못했어요\r
- **body**: 주소를 다시 확인하시거나 다른 주소로 시도해주세요. 같은 문제가 반복되면 카톡으로 문의 주세요.\r
- **cta**: 다시 시도\r
\r
---\r
\r
## timeout\r
\r
- **title**: 시간이 좀 오래 걸리고 있어요\r
- **body**: 서비스 상태에 따라 시간이 더 필요할 수 있어요. 잠시만 기다려주세요.\r
- **cta**: 계속 기다리기\r
\r
---\r
\r
## general_error\r
\r
- **title**: 뭔가 잘못됐어요\r
- **body**: 예상치 못한 문제가 생겼어요. 잠시 후 다시 시도해주세요.\r
- **cta**: 다시 시도\r
`,g=`# home\r
\r
## hero\r
\r
- **title**: 바이브코딩 보안센터\r
- **subtitle**: 프로젝트 하나만 보여주시면 무료로 건강검진 해드려요.\r
- **cta**: 무료 진단 받기\r
- **emergency_cta**: 긴급 도움이 필요해요\r
\r
## tabs\r
\r
- **home**: 홈\r
- **diagnose**: 진단\r
- **report**: 리포트\r
- **packages**: 패키지\r
\r
## recent\r
\r
- **title**: 최근 진단 기록\r
- **empty_title**: 아직 진단 기록이 없어요\r
- **empty_body**: 프로젝트 주소를 넣어주시면 무료로 건강검진 해드려요.\r
- **empty_cta**: 첫 진단 받기\r
`,h=`# incident\r
\r
## page\r
\r
- **title**: 지금 도움이 필요하신가요?\r
- **subtitle**: 괜찮아요, 저희가 도와드릴게요. 증상을 골라주시면 빠르게 연결해드립니다.\r
\r
## symptoms\r
\r
- **billing**: 갑자기 요금이 이상해요\r
- **data**: 데이터가 사라졌어요\r
- **site**: 사이트가 이상하게 바뀌었어요\r
- **account**: 계정에 접근이 안 돼요\r
- **other**: 다른 문제가 있어요\r
\r
## contact\r
\r
- **kakao**: 카카오톡으로 바로 상담하기\r
- **call**: 전화로 긴급 상담하기\r
- **complete_title**: 접수 완료\r
- **complete_body**: 전문가가 곧 연락드릴게요. 잠시만 기다려주세요.\r
\r
## tip\r
\r
- **emergency**: 지금 당장 할 수 있는 것: 의심스러운 API 키가 있다면, 해당 서비스 대시보드에서 키를 비활성화해주세요.\r
\r
## nav\r
\r
- **back_to_home**: 홈으로 돌아가기\r
`,f=`# Onboarding Copy\r
\r
---\r
\r
## step_1_welcome\r
\r
- **title**: 반갑습니다!\r
- **body**: 바이브코딩 보안센터예요. 프로젝트 하나만 보여주시면 무료로 건강검진 해드려요.\r
- **cta**: 시작하기\r
\r
---\r
\r
## step_2_connect_project\r
\r
- **title**: 프로젝트 연결\r
- **body**: 깃허브 주소나 배포된 사이트 주소를 붙여넣어 주세요. 저희가 알아서 살펴볼게요.\r
- **cta**: 주소 넣기\r
\r
---\r
\r
## step_3_free_diagnose\r
\r
- **title**: 무료 진단\r
- **body**: 처음 한 번은 무료예요. 지금 바로 진단 받으시면 어디가 급한지 알려드려요.\r
- **cta**: 무료 진단 받기\r
\r
---\r
\r
## step_4_check_results\r
\r
- **title**: 건강검진표\r
- **body**: 진단이 끝나면 한눈에 보이는 건강검진표를 드려요. 급한 것부터 알려드릴게요.\r
- **cta**: 결과 보기\r
`,v=Object.assign({"../content/copy/checkout.md":m,"../content/copy/diagnosis.md":y,"../content/copy/empty-states.md":d,"../content/copy/empty_states.md":u,"../content/copy/errors.md":b,"../content/copy/home.md":g,"../content/copy/incident.md":h,"../content/copy/onboarding.md":f});function C(n){const e={};let r="";for(const o of n.split(`
`)){const t=o.trim(),a=t.match(/^#{1,3}\s+(.+)/);if(a){r=a[1].trim().toLowerCase().replace(/[^a-z0-9.\uAC00-\uD7A3\u3131-\u3163]+/g,"_").replace(/^_|_$/g,"");continue}const _=t.match(/^-\s+\*\*(.+?)\*\*:\s*(.+)/);if(_&&r){const s=_[1].trim().toLowerCase().replace(/[^a-z0-9\uAC00-\uD7A3\u3131-\u3163]+/g,"_").replace(/^_|_$/g,""),p=_[2].trim();e[`${r}.${s}`]=p;continue}const i=t.match(/^(\d+)\.\s+(.+)/);if(i&&r){const s=i[1];e[`${r}.${s}`]=i[2].trim();continue}}return e}const c={};function l(n){var e;if(c[n])return c[n];for(const[r,o]of Object.entries(v))if((((e=r.split("/").pop())==null?void 0:e.replace(".md",""))??"")===n)return c[n]=C(o),c[n];return c[n]={},c[n]}function k(n,e=""){const r=n.split(".");if(r.length<3)return e;const o=r[0],t=r.slice(1).join(".");return l(o)[t]??e}function w(n,e){const r=l(n),o=e+".";return Object.entries(r).filter(([t])=>t.startsWith(o)).sort(([t],[a])=>t.localeCompare(a,void 0,{numeric:!0})).map(([,t])=>t)}export{w as g,k as t};
