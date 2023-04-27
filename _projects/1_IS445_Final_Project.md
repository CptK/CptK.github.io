---
name: Data Quality for Machine Learning
tools: [Python, HTML, vega-lite, Altair]
image: assets/imgs/IS445_final_project/project_icon.jpg
description: Data Quality for Machine Learning using the example of AIS data.
custom_js:
  - vega.min
  - vega-lite.min
  - vega-embed.min
  - justcharts
---

# Data Quality for Machine Learning

## Introduction to Machine Learning
<p align="justify">Machine learning is a type of artificial intelligence (AI) that involves training computer programs to learn and improve from experience, without being explicitly programmed to do so. In other words, machine learning algorithms can automatically learn and adapt from data, making predictions, and identifying patterns and relationships in the data. This allows them to perform tasks such as image recognition, speech recognition, natural language processing, and many others. Machine learning is becoming increasingly important in many fields, including healthcare, finance, transportation, and entertainment. It has the potential to transform the way we live and work, by enabling computers to make more accurate predictions and decisions based on data.</p>

## Introduction to AIS
<p align="justify">The Automatic Identification System (AIS) uses transeivers on ships to autmatically track vessels and provide identification and positioning information to both vessels and shore stations. AIS is used for collision avoidance, search and rescue, and maritime security. AIS is also used to provide information to the public about vessel traffic.</p>

<p align="justify">There are six different message types that can be transmitted by AIS. We will focus on the A and B classes that are for navigational safety and collision avoidance. Class A messages are sent at a higher frequency and contain more information than Class B messages, making them mandatory for larger vessels. These messages include the vessel's identity, position, course, speed, and other important data. Class B messages are optional for smaller vessels and transmit at a lower frequency, with less information. However, they still provide valuable information about the vessel's position, speed, and course, allowing for improved situational awareness and navigation safety. The Maritime Mobile Service Identity (MMSI) comes up in both classes and is used to identify a vessel. Both Class A and Class B messages are received and displayed by other vessels and shore-based stations equipped with AIS receivers, allowing for real-time tracking and monitoring of vessel movements. This information can be used to avoid collisions, navigate safely through congested waterways, and improve the efficiency of maritime traffic management.</p>

![AIS Function]({{site.baseurl}}/assets/imgs/IS445_final_project/ais_function.jpg)
<p align="center"><a href="https://www.seereisenportal.de/fileadmin/user_upload/satellite-ais-.jpg" style="color:lightgray;test-align:center;font-size:8pt">img source</a></p>

## Data Quality for Machine Learning
<p align="justify">Often raw data cannot be directly used for machine learning. It needs to be cleaned and preprocessed. This is because machine learning algorithms are sensitive to missing values, outliers (an outlier is a datapoint that was e.g. generated from erreneous sensors), and other data quality issues. For example, if a dataset contains missing values, the algorithm will not be able to learn from those observations. Similarly, if a dataset contains outliers, the algorithm will be biased towards those observations. Therefore, it is important to clean and preprocess the data before using it for machine learning.</p>
![Data Quality]({{site.baseurl}}/assets/pngs/IS445_final_project/data_quality.png)
<p align="center"><a href="https://healthinstitute.illinois.edu/connect/news/berd-tips-dimensions-of-data-quality" style="color:lightgray;test-align:center;font-size:8pt">img source</a></p>

## Data used for this Article
<p align="justify">The website <a href="https://marinecadastre.gov/ais/"> MarineCadastre.gov </a> provides AIS data for the U.S. coast since 2009. Datasets contain either all collected datapoints of one day as a CSV file or all collected datapoints of one year condensed to tracks as a gpkg file. The data is provided by the <a href="https://coast.noaa.gov">Office for Coastal Management</a>. In this article, we will use the points of the day 01/01/2021.</p>

<p align="justify">Studies have shown that the quality of the raw AIS data is not sufficient and needs to be cleaned and preprocessed before it can be used for machine learning. For example, the data contains many outliers and missing values. Also, for some fields, especially the ones that need human input, are often ambiguous or misleading.</p>

## Data Cleaning and Preprocessing
<p align="justify">The first thing we can notice when plotting and connecting the points is that ordering them by time already increases the accuracy:</p>

![Improvement due to sorting]({{site.baseurl}}/assets/imgs/IS445_final_project/sorting_improve.png)

<p align="justify">But as we can see in the following plot of all tracks in a small area, there are still many outliers that need to be removed because they would otherwise bias the machine learning algorithm:</p>

![All outliers]({{site.baseurl}}/assets/imgs/IS445_final_project/all_outliers.png)

<p align="justify">To remove otliers, we split each track into subtracks. A subtrack is a sequence of points that are close to each other. We then remove all subtracks that are shorter than a certain threshold. Let us take a look at the following tracks from the above plot:</p>

![2 Tracks with outliers]({{site.baseurl}}/assets/imgs/IS445_final_project/2_outliers.png)

<p align="justify">Segmentation of the tracks into subtracks and marking the beginning and end of each subtrack with a green dot gives us this:</p>

![2 Tracks with outliers segmented into subtracks, starts marked]({{site.baseurl}}/assets/imgs/IS445_final_project/2_outliers_segmented_points.png)

<p align="justify">If we now remove all subtracks that are shorter than a certain threshold, we get the following result, where each track is now a sequence of subtracks that are close to each other, so that they just need to be connected to get the final track.</p>

![2 Tracks with outliers segmented into subtracks]({{site.baseurl}}/assets/imgs/IS445_final_project/2_outliers_segmented.png)

## Data Quality Overview
<p align="justify">In the following interactive visualization, we explore the data per vessel group. In the heatmap the we get a binned representation of the number of subtracks per vessel group. The number of subtracks is an indicator for the data quality in this case, because more subtracks mean that there possibly are more outliers where the original track is split.</p>

<p align="justify">In the first bar chart, we can see the number of vessels per group so we can compare the numbers of tracks to the group size. Since they are not distributed equally, a logarithmic scale is used. The number of vessels per group is for example important when looking at the second bar chart, where we can see the total number of subtracks per vessel group. We can notice that "Tug" has only few subtracks but in comparison with the number of vessels in this group, it is more similar to other groups. The last bar chart shows the average number of subtracks per vessel group.</p>

<vegachart schema-url="{{ site.baseurl }}/assets/json/is445_final_project/ais_data_quality_dashboard.json" style="width: 100%;text-align: center"></vegachart>

<p align="justify">A short usage guide for the interactive visualization: The heatmap has a brush tool that allows to select a subset of the data. The bar charts are then updated to show the data of the selected subset. To reset the selection, double click on the heatmap. If you click on a vessel group in the legend of the bar charts, the corresponding data is highlighted in all charts. To reset the selection, click below the legend.</p>

## Sources
1. [Automatic identification system - Wikipedia](https://en.wikipedia.org/wiki/Automatic_identification_system#:~:text=AIS%20was%20developed%20in%20the,range%20identification%20and%20tracking%20network.)
2. [AIS (Automatic Identification System) overview - NATO](https://shipping.nato.int/nsc/operations/news/2021/ais-automatic-identification-system-overview)
3. [Automatic Identification System (AIS): Data Reliability and Human Error Implications, Harati-Mokhtari et al.](https://doi.org/10.1017/S0373463307004298)
4. [Ship Trajectories Pre-processing Based on AIS Data, Zhao et al.](https://doi.org/10.1017/S0373463318000188)
5. <a href="https://www.fisheries.noaa.gov/inport/item/65082">Point Data - Office for Coastal Management, 2023: Nationwide Automatic Identification System 2021</a>, <a href="https://coast.noaa.gov/htdata/CMSP/AISDataHandler/2021/AIS_2021_01_01.zip">Download</a>
6. <a href="https://examples.pyviz.org/ship_traffic/ship_traffic.html">Project with CSV file containing a mapping from vessel type to vessel group</a>

## Code
<p align="justify">The code for this article can be found in the <a href="https://github.com/CptK/CptK.github.io/blob/main/python_notebooks/is445_final_project.ipynb">GitHub repository</a>. When using the code, make sure you have the required data files ("AIS_2022_01_01.csv" and "AIS_categories.csv") in the same directory as the notebook.</p>