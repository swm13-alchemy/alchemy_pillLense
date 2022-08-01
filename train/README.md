# Pill-Lense Model Training Tool

필렌즈 모델 훈련/내보내기 관련 Tool 👁

## 구성 언어 및 라이브러리와 런타임

-   Yolov5
-   Python
-   Tensorflow

## 주의 사항

-   Dataset은 Raw 데이터들이므로, `roboflow`등의 사이트에서 데이터 라벨링 필요

## 사용 방법

### Train

```sh
$ # dataset 폴더에 데이터를 넣어두고, model 폴더에 Pre-trained(.pt) 모델 넣어두기
$ python train.py --data ./dataset/data.yaml --weights ./models/yolov5s.pt
                  --img 416 --batch-size 4 --epochs 100 --name yolov5s_pilllense
$ # 페이징 파일 크기 문제 발생시 Batch size 조절.
$ # 이미지 크기 416px 아닌 경우 수정.
```

### Export

```sh
$ python export.py --weights ./pillLense_yv5s.pt --include tfjs --data ./dataset/data.yaml --imgsz 640
$ # web_model 방식의 파일이 나오게 됨.
$ # 타 형식은 export.py 코드 참조.
```

## 기타 사항

-   Contact : KAKAO (dksu40)
