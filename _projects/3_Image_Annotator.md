---
name: Semi-automatic Image Annotator
tools: [Python]
image: assets/imgs/project/image_annotator.png
description: Image Annotation Tool with YOLO Bounding Box Suggestions.
custom_js:
---

# Semi-automatic Image Annotator

<p align="justify">For labeling data to train object detection models, I could have used a tool like LabelImg, but I decided to write my own tool. First, I wanted to lean how to develop such a tool and second, I wanted to integrate a pre-trained model to suggest bounding boxes. This way, I can speed up the labeling process. As a pre-trained model, I use the YOLOv8 model from the <a href="https://docs.ultralytics.com/">ultralytics</a> framework. In the following video, I show a demonstration of the tool on some images from the <a href="https://www.kaggle.com/c/dogs-vs-cats">Dogs vs. Cats</a> dataset. The tool is written in Python.</p>

<div class="ratio ratio-16x9 mb-3">
  <iframe src="https://www.youtube.com/embed/lKTVJk_RYt0?autoplay=1&mute=1&loop=1&playlist=lKTVJk_RYt0" allowfullscreen></iframe>
</div>


The code for this project can be found in my [GitHub repository](https://github.com/CptK/semi-automatic-image-annotation/tree/main).