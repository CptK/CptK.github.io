---
name: VeriTaS
date: 2026-07-13
tools: [Python]
image: assets/imgs/project/veritas/teaser_figure.png
description: The First Dynamic Benchmark for Multimodal Automated Fact-Checking
custom_js:
---
<div class="alert alert-warning" role="alert">
🏆 This paper has been awarded <b>Best Resource Paper</b> at <a href="https://2026.aclweb.org/program/best_papers/">ACL 2026</a>
</div>
<div class="alert alert-info" role="alert">
Full paper is available <a href="https://arxiv.org/abs/2601.08611">here</a> and code and dataset can be accessed <a href="https://veritas.mai.informatik.tu-darmstadt.de/">here</a>.
</div>

# VeriTaS: The First Dynamic Benchmark for Multimodal Automated Fact-Checking

![Banner]({{site.baseurl}}/assets/imgs/project/veritas/teaser_figure.png)

## Abstract
<p align="justify">The growing scale of online misinformation urgently demands Automated Fact-Checking (AFC). Existing benchmarks for evaluating AFC systems, however, are largely limited in terms of task scope, modalities, domain, language diversity, realism, or coverage of misinformation types. Critically, they are <i>static</i>, thus subject to data leakage as their claims enter the pretraining corpora of LLMs. As a result, benchmark performance no longer reliably reflects the actual ability to verify claims.
We introduce <b>Verified Theses and Statements (VeriTaS)</b>, the first <i>dynamic</i> benchmark for multimodal AFC, designed to remain robust under ongoing large-scale pretraining of foundation models. VeriTaS currently comprises 25,000 real-world claims from 104 professional fact-checking organizations across 54 languages, covering textual and audiovisual content. Claims are added <i>quarterly</i> via a fully automated seven-stage pipeline that normalizes claim formulation, retrieves original media, and maps heterogeneous expert verdicts to a novel, standardized, and disentangled scoring scheme with textual justifications.
Through human evaluation, we demonstrate that the automated annotations closely match human judgments.
We commit to updating VeriTaS in the future, establishing a leakage-resistant benchmark, supporting meaningful AFC evaluation in the era of rapidly evolving foundation models.</p>