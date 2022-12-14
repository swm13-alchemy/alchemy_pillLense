# Data를 모으기 위한 각 영양사 대상 크롤러

Crawler with Puppeteer and Cheerio 🦓

---

## 구성 언어 및 라이브러리

-   Javascript
-   Axios (fetch)
-   Cheerio (HTML DOM parser)
-   Puppeteer (Headless-Browser Crawler)

---

## 사용방법

```shell
$ # 추후 업데이트 예정
```

---

## 작업 진행정도

-   [x] 수집 범위 조사
-   [x] 필라이즈

    -   [x] 수집 방식(API call, 혹은 정적 크롤링 등) 조사
    -   [x] 성분 카테고리 전체 JSON 파일화
    -   [x] `getPillData(idx)` 함수 작성 (idx에 대해 PillData를 가져오는 함수)

-   [ ] 쿠팡

    -   [x] 수집 방식(API call, 혹은 정적 크롤링 등) 조사
    -   [x] 영양제 상세정보 크롤링 함수 코드 작성
        -   [x] 이미지 관련 다운로드 방법 마련
        -   [x] Puppeteer 라이브러리 활용 - 코드 작성
        -   [x] Html 파일 전체 수집
    -   [ ] 데이터 후처리

-   [ ] Aimee

    -   [x] 수집 방식(API call, 혹은 정적 크롤링 등) 조사
    -   [x] 카테고리 전부 JSON화
    -   [x] Puppeteer로 동적 크롤링 코드 작성

-   [ ] iHerb

    -   [x] 수집 방식(API call, 혹은 정적 크롤링 등) 조사
    -   [x] 수집범위 및 약 상세 동적 크롤링 코드 작성
    -   [x] 전체 영양제 정보 있는 Html 파일 수집
    -   [ ] 데이터 가공

-   [x] immcoach

    -   [x] 수집 방식(API call, 혹은 정적 크롤링 등) 조사
    -   [x] 정적 크롤링 코드 작성
    -   [ ] 데이터 수집 및 가공

-   [x] 건강비밀
    -   [x] 수집 방식(API call, 혹은 정적 크롤링 등) 조사
    -   [x] API call을 통한 크롤링 코드 작성

---

## 수집 범위

### 필라이즈

-   성분 카테고리별 검색결과
    -   ex) 비타민B1, 비타민C 등 총 39개에 대한 검색 결과.
-   필라이즈에 등록되어있는 모든 약의 Detail
    -   16,534개의 약 모든 정보
    -   제조사, 약이름
    -   영양성분 함량, 주/부 효능(관련 키워드), 섭취 팁 및 적정섭취시간

### 쿠팡

-   건강기능식품 > 판매량순(120개씩 보기) 1 ~ 9(마지막) 페이지
-   해당 약통 상세 정보
    -   제품명, 제조업소, 유통기한
    -   상세이미지들 (제품 성분 등을 스캔해둔 사진이 있음)
    -   비교하면 좋을 제품, 다른 고객이 함께 본 상품 리스트
    -   약통 이미지 (사람이 약통 정면을 찍은 이미지 분류 학습용 Data)

### Aimee

-   카테고리
    -   약 이름 리스트 및, 제조사 리스트
-   카테고리별 검색 결과로 확인한 각 약 상세 정보
    -   약 이름, 제조사, 분석횟수
    -   기능성, 제형, 영양성분
    -   섭취정보, 섭취시 유의사항

### iHerb

-   보충제 전체 수집(판매량 많은 순 기준 정렬) > 리뷰가 적어도 1000개 이상인 제품.
-   약 상세 정보
    -   약 이름, 제조사, 포장 수량(몇 정 있는지)
    -   다른 고객들이 함께 본 제품들 리스트
    -   제품설명 (효능, 누구에게 적합한지, 뭐를 포함하는지)
    -   제품 사용법 (섭취 방법)
    -   포함된 성분들 (Plain Text)
    -   주의사항 (먹지 말아야할 사람들)
    -   영양 성분 정보
    -   1회 제공량, 용기당 제공 횟수, 영양소별 1회 제공량당 함량

### immcoach

-   5,874개의 영양제에 대해 가져올 수 있는 정보
    -   영양제 이름
    -   설명 (1회 섭취 적정량, 제형, 보관유의사항, 주의사항
    -   영양성분 정보 (1회 제공량)

### 건강비밀

-   리뷰순 정렬 해서 가져오는 모든 영양제 상세정보
    -   영양제 이름, 제조사, 몇일분인지, 영양제 이미지
    -   기능성 (설명방식임), 성분 함량 및 설명, 적정 섭취 시간, 섭취 추천 대상
