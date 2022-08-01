# Pill-Lense Tools (Deploy, Train, Test, Dataset)

필렌즈 관련 모든 Tool을 모았음. 👁

## 구성 언어 및 라이브러리와 런타임

### Test (Web 요청 보내서 응답을 받음)

-   Javascript
-   Node.js
-   Axios

### Train (Yolov5 모델 학습 및 Export)

-   Yolov5
-   Python
-   Tensorflow

### Deploy (API Gateway + Lambda 배포 자동)

-   @Tensorflow/tfjs-node
-   Typescript
-   Serverless
-   Docker

### Dataset (영양제 관련 데이터 및 Pill-Lense 훈련용 데이터)

-   Javascript
-   Axios (fetch)
-   Cheerio (HTML DOM parser)
-   Puppeteer (Headless-Browser Crawler)

## 주의 사항

-   Dataset은 Raw 데이터들이므로, `roboflow`등의 사이트에서 데이터 라벨링 필요
-   Train시에, label은 따로 포함되지 않으므로 임의로 저장해두어야함.
-   Train 결과로 나온 `web_model`은 `Deploy/models`로 옮겨두고, `env` 설정해주어야함.

## 설치 방법

```sh
$ # 각 기능별로 내부 README.md에 적어두었음.
```

## 진행 사항

-   [x] 개발 디렉토리 및 Git Repo 커밋.
-   [x] 기존 데이터 수집 함수 및 기능 정리
-   [x] yolov5m, yolov5s, yolov5n 모델 전부 Web_model로 Export 테스트
-   [x] yolov5 model의 `Train.py`, `detect.py`, `export.py` 옮겨두고 `README.md` 정리
-   [x] Endpoint 테스트용 코드 정리 후 `README.md` 정리
-   [x] deploy 로직 테스트 후 사용 방식 `README.md` 정리

## 기타 사항

-   Contact : KAKAO (dksu40)
