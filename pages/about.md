---
layout: page
title: About
permalink: /about/
weight: 3
---

# **About Me**

Hi, I am **{{ site.author.name }}**.

<div class="row">
{% include about/skills.html title="Programming Skills" source=site.data.programming-skills %}
<div class="col">
{% include about/skills.html title="Language Skills" source=site.data.language-skills %}
{% include about/skills.html title="Other Skills" source=site.data.other-skills %}
</div>
</div>

<div class="row">
{% include about/timeline.html %}
</div>
