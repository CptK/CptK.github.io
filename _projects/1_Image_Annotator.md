---
name: Semi-automatic Image Annotator
tools: [Python]
image: assets/imgs/project/image_annotator.jpg
description: Image Annotation Tool with YOLO Bounding Box Suggestions.
custom_js:
---

# Semi-automatic Image Annotator

<p align="justify">For a future project, I need labeled data for object detection in images. To label this data, I could have
used a tool like LabelImg, but I decided to write my own tool. First, I wanted to lean how to develop such a
tool and second, I wanted to integrate a pre-trained model to suggest bounding boxes. This way, I could
speed up the labeling process. As a pre-trained model, I used the YOLOv8 model from the
<a href="https://docs.ultralytics.com/">ultralytics</a> framework. In the following video, I show a demonstration of the
tool on some images from the <a href="https://www.kaggle.com/c/dogs-vs-cats">Dogs vs. Cats</a> dataset. The tool is
written in Python.</p>

<div class="embed-responsive embed-responsive-16by9 mb-3">
  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/qjmqN7N2nf4?autoplay=1&mute=1&loop=1&playlist=qjmqN7N2nf4" allowfullscreen></iframe>
</div>


The code for this project can be found in my [GitHub repository](https://github.com/CptK/semi-automatic-image-annotation/tree/main).