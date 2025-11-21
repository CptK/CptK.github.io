---
layout: page
title: About
permalink: /about/
weight: 3
---

# **About Me**

Hi, I'm {{ site.author.name }}, a Master's student and researcher at TU Darmstadt working on AI systems that tackle real-world challenges, from combating misinformation to autonomous maritime navigation.

<div class="row">
{% include about/skills.html title="Programming Skills" source=site.data.programming-skills %}
<div class="col">
{% include about/skills.html title="Language Skills" source=site.data.language-skills %}
{% include about/skills.html title="Other Skills" source=site.data.other-skills %}
</div>
</div>

<div class="row">
{% include about/awards.html %}
</div>

<div class="row">
{% include about/timeline.html %}
</div>
