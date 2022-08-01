# Pill-Lense Deploy Tool

필렌즈 배포 관련 Tool 👁

## 구성 언어 및 라이브러리와 런타임

-   @Tensorflow/tfjs-node
-   Typescript
-   Serverless
-   Docker

## 주의 사항

-   Train 결과로 나온 `web_model`은 `Deploy/models`로 옮겨두고, `env` 설정해주어야함.

## 사용 방법

### 필수 - 종속성 라이브러리 설치

```sh
$ npm ci
```

### Local Dev server 실행

```sh
$ # 종속성 파일 설치 이후,
$ npm install -g serverless
$ npm run offline
```

### 배포 방법

1. 먼저 Docker Image 생성. (초기 생성시에만)

```sh
$ # AWS Lambda Layer로 올라갈 Docker Image 생성
$ docker build -t pilllense .
$ # Local에서 Docker 관련 디버깅시
$ docker run --rm -p 9000:8080 --env MODEL_PATH=/usr/models/m/model.json pilllense
```

2. Webpack Update And Deploy

```sh
$ npx sls webpack
$ npx sls deploy --config=serverless.deploy.ts --stage=dev
```

## 기타 사항

-   Contact : KAKAO (dksu40)
