---
name: First Project as an Example
tools: [Python, HTML, vega-lite, Altair]
image: assets/pngs/bubble_chart.png
description: This is a "showcase" project that uses vega-lite for interactive viz!
custom_js:
  - vega.min
  - vega-lite.min
  - vega-embed.min
  - justcharts
---

https://altair-viz.github.io/altair-viz-v4/user_guide/encoding.html

https://altair-viz.github.io/altair-viz-v4/user_guide/encoding.html#encoding-data-types


# First Project as an Example

```
<vegachart schema-url="{{ site.baseurl }}/assets/json/vega_editor_example.json" style="width: 100%"></vegachart>
```

<vegachart schema-url="{{ site.baseurl }}/assets/json/vega_editor_example.json" style="width: 100%"></vegachart>

### Quick Detour with images
Include local images from the `assets` folder like this:

```![<alt>](/assets/pngs/<name>.<format>)```

![bubble_chart]({{site.baseurl}}/assets/pngs/bubble_chart.png)


### Chart generated using Altait and Jekyll


<vegachart schema-url="{{ site.baseurl }}/assets/json/is445_inclass_12/chart1.json" style="width: 100%"></vegachart>

<vegachart schema-url="{{ site.baseurl }}/assets/json/is445_inclass_12/dashboard_of_mobility.json" style="width: 100%"></vegachart>

<vegachart schema-url="{{ site.baseurl }}/assets/json/is445_inclass_12/population_scatter.json" style="width: 100%"></vegachart>

<vegachart schema-url="{{ site.baseurl }}/assets/json/is445_inclass_12/altair_mobility_dashboard.json" style="width: 100%"></vegachart>

<!-- these are written in a combo of html and liquid --> 

<div class="left">
{% include elements/button.html link="https://github.com/vega/vega/blob/main/docs/data/cars.json" text="The Data" %}
</div>

<div class="right">
{% include elements/button.html link="https://github.com/jnaiman/online_cv_public/blob/main/python_notebooks/test_generate_plots.ipynb" text="The Analysis" %}
</div>