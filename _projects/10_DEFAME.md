---
name: DEFAME
date: 2025-07-13
tools: [Python]
image: assets/imgs/project/defame/teaser.png
description: Dynamic Evidence-based FAct-checking with Multimodal Experts
custom_js:
---
<div class="alert alert-warning" role="alert">
🏆 This paper has been accepted at <a href="https://icml.cc/virtual/2025/poster/43719">ICML 2025</a>.
The full paper is available <a href="https://arxiv.org/abs/2412.10510">here</a> and code and data can be accessed <a href="https://github.com/multimodal-ai-lab/DEFAME/tree/icml">here</a>.
</div>
# DEFAME: Dynamic Evidence-based FAct-checking with Multimodal Experts


![Banner]({{site.baseurl}}/assets/imgs/project/defame/teaser.png)

## Abstract
<p align="justify">The proliferation of disinformation demands reliable and scalable fact-checking solutions. We present <b>D</b>ynamic <b>E</b>vidence-based <b>FA</b>ct-checking with <b>M</b>ultimodal <b>E</b>xperts (DEFAME), a modular, zero-shot MLLM pipeline for open-domain, text-image claim verification. DEFAME operates in a six-stage process, dynamically selecting the tools and search depth to extract and evaluate textual and visual evidence. Unlike prior approaches that are text-only, lack explainability, or rely solely on parametric knowledge, DEFAME performs end-to-end verification, accounting for images in claims <i>and</i> evidence while generating structured, multimodal reports. Evaluation on the popular benchmarks VERITE, AVeriTeC, and MOCHEG shows that DEFAME surpasses all previous methods, establishing itself as the new general state-of-the-art fact-checking system for uni- and multimodal fact-checking. Moreover, we introduce a new multimodal benchmark, ClaimReview2024+, featuring claims after the knowledge cutoff of GPT-4o, avoiding data leakage. Here, DEFAME drastically outperforms the GPT-4o baselines, showing temporal generalizability and the potential for real-time fact-checking</p>

<br />

---

I joined this project during the rebuttal phase of the ICML 2025 submission. My contributions were mainly focused on setting up and running final experiments.