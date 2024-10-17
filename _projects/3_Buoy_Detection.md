---
name: Buoy Detection and Localization
tools: [Python]
image: assets/imgs/project/buoy_detect_localize/buoy_detected_1.png
description: Building a model that can detect and locate buoys using YOLO and triangulation
custom_js:
---

# Buoy Detection and Localization

<p align="justify">This project aims to develop a two-step system for buoy detection and localization. The first step is to detect buoys in images using a custom fine-tuned YOLOv8 model. The second step is to localize, i.e. get the coordinates of, the detected buoys using triangulation. This model is implemented in a ROS2 node to be used on an autonomous surface vehicle (ASV) for navigation.</p>

<div class="embed-responsive embed-responsive-16by9 mb-3">
  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/u8CjYIhvZoY?si=1xyfrDQ-2PDqW_jA&autoplay=1&mute=1&loop=1&playlist=u8CjYIhvZoY" allowfullscreen allow="autoplay"></iframe>
</div>
<p class="text-center">First version of our buoy detection and localization approach. While this initial model laid the groundwork, it wasn't yet consistently confident in detecting buoys in images.</p>


## Buoy Detection
<p align="justify">For buoy detection the YOLOv8 model from the <a href="https://docs.ultralytics.com/">ultralytics</a> framework is fine-tunded on <a href="https://universe.roboflow.com/sailbot-5c9lp/buoy-op5wz">this</a> dataset and on images I collected whenever I saw buoys somewhere. As the model is required to run on a Raspberry Pi 4, the YOLO Nano version has been chosen. It's small size also allows for easy training on a normal computer. The precessing time for one image on the Pi is around 2 seconds.</p>

<p align="justify">To reduce the number of false positives, only detections with a confidence score of 0.5 or higher are considered. Using the horizontal center of each bounding box, we get the angle of the corresponding buoy relative to the boat. This angle is then combined with the heading of the boat to get the absolute angle of the buoy.</p>

<div class="row flex-md-row flex-column align-center">
  <div class="col-md-6">
    <img src="{{site.baseurl}}/assets/imgs/project/buoy_detect_localize/buoy_detected_1.png" class="mb-1">
  </div>
  <div class="col-md-6">
    <img src="{{site.baseurl}}/assets/imgs/project/buoy_detect_localize/buoy_detected_2.png" class="mb-1">
  </div>
</div>

## Buoy Localization
<p align="justify">Using the absolute angle to the buoy, a line segment starting at the boat's GPS position is created in the direction of the buoy. Using multiple line segments, from different points of view, the intersections of these lines are calculated to find the location of the buoys. Since we also have lines intersecting at positions where no buoy is, intersections outside a pre-defined area of interest are discarded.</p>

<p align="justify">As there is a lot of noise due to sensor inaccuracies, as well as false intersections, we cluster the intersection into an expected number of buoys. The clustering is done using the KMeans algorithm. The centroids of the clusters are then used as the buoy locations. To reduce the uncertainty of the buoy locations, we remove a percentage of intersections that are furthest from the centroid of the cluster and recalculate the centroid which then becomes the final buoy location.</p>