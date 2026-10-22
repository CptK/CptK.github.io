---
name: "Learning To Fact-Check: Towards a general framework for multimodal fact-checking"
date: 2026-08-28
tools: [Python]
image: assets/imgs/project/learning_to_factcheck/Pipeline-High-level.svg
description: Multimodal fact-checking with verification procedures learned from professional fact-checks
custom_js:
---

# Learning to Fact-Check

<br/>
This is a shortened version of my Master's thesis. The full thesis can be found <a href="{{site.baseurl}}/assets/imgs/project/learning_to_factcheck/Learning_to_Fact_Check.pdf" download>here</a>. The code for the project can be found on <a href="https://github.com/CptK/mafc-blueprint-learning">GitHub</a> and an interactive trace and blueprint viewer can be found <a href="https://cptk.github.io/mafc-blueprint-learning/index.html">here</a>. The thesis was completed at the <a href="https://www.informatik.tu-darmstadt.de/mai/multimodal_ai/index.en.jsp">Multimodal AI Lab</a> at TU Darmstadt, supervised by Prof. Dr. Anna Rohrbach and Mark Rothermel.

## Abstract
<p align="justify">Automated fact-checkers apply one verification procedure to every claim, whether it is a written assertion, an authentic photograph placed in a false context, or a manipulated video. This thesis asks whether choosing that procedure per claim improves accuracy, and it builds a representation in which the question can be measured. Each verification procedure, called a <i>blueprint</i>, names the checks a class of claim requires, the actions that settle them, and the conditions under which it should be selected. A pool of blueprints is induced from published fact-checks, with no human annotation of the investigative process. An LLM reduces each training article to a topic-stripped fingerprint, those are clustered, and one blueprint is synthesized per cluster. At inference a router assigns each claim a single blueprint, which guides a multi-agent pipeline of a planner, a web-search agent, a media agent that checks the provenance of attached images and video, and a judge.</p>

<p align="justify">Blueprints learned from fact-checks published in 2025 were applied to the 1,000 VeriTaS claims of the first quarter of 2026, under two planner models and five judges. The induction yields a pool of distinct procedures, and claim text alone predicts which one a fact-checker followed at 83.9% on a held-out quarter. Conditioning verification on that choice did not improve accuracy. It helped the weaker planner and hurt the stronger one, and the routed pool never reached what the stronger planner achieves unguided. Taking that negative result apart locates the bottleneck, and it lies upstream of everything the strategy layer controls. Given the evidence a human fact-checker gathered, the judge cuts error by roughly 85%, so the verdict stage is close to saturated. Accuracy is lost earlier, in retrieval, which recovers under half of those findings and never attempts four in five of the sources the fact-checkers used. The method that shows this is cheap and general. Reporting evidence recall alongside the end-to-end score separates a system that reasoned badly from one that was never shown the evidence to reason over.</p>

## Motivation
##### The Problem

<p align="justify">False claims travel faster and further online than the truths they crowd out [<a href="#vosoughi2018spread">1</a>]. Fact-checking counters this effectively. In a large-scale study on X, exposure to a community note reduced the further spread of a misleading post by 61.2% on average [<a href="#chuai2026community">2</a>]. The limit is throughput. Professional fact-checkers interviewed across 19 countries describe work that is largely manual and spread across disconnected tools [<a href="#micallef_true_2022">3</a>], and establishing what a claim actually asserts is itself an interpretive act that resists compression [<a href="#graves_anatomy_2017">4</a>]. Most claims therefore never receive expert attention at all.</p>

<p align="justify">The pressure is growing. Misinformation rewritten by a language model is harder to flag for human readers and automated detectors alike [<a href="#chen2023can">5</a>]. Claims also increasingly arrive with images or video, which are judged more credible than text and travel faster [<a href="#akhtar_multimodal_2023">6</a>]. The dominant pattern is recontextualization, where an authentic photograph is paired with a caption that misstates when, where, or why it was taken [<a href="#tonglet_cove_2025">7</a>, <a href="#luo2021newsclipings">8</a>, <a href="#abdelnabi2022open">9</a>].</p>

##### One Procedure for Every Claim
<p align="justify">Research on automated fact-checking has largely proceeded by decomposition, with separate work on claim matching [<a href="#shaar2020that">10</a>], evidence retrieval [<a href="#chrysidis_credible_2024">11</a>], out-of-context image detection [<a href="#abdelnabi2022open">9</a>, <a href="#qi_sniffer_2024">12</a>], manipulation localization [<a href="#guillaro_trufor_2024">13</a>], and explanation generation [<a href="#atanasova_generating_2020">14</a>]. End-to-end systems combine these capabilities, and DEFAME [<a href="#braun_defame_2025">15</a>] represents the current state of the art for multimodal claims. None of these systems varies the procedure itself. A fabricated quotation, a photo recycled from an earlier event, and a disputed statistic all pass through the same control flow.</p>

<p align="justify">Professional practice looks different. Fact-checkers choose an investigative routine based on the kind of claim they face, and ethnographic accounts describe that choice as part of the expertise itself [<a href="#graves_anatomy_2017">4</a>, <a href="#micallef_true_2022">3</a>]. An analysis of 4,000 fact-check articles from 2025 confirms how diverse the work is. No claim type covers even a third of the workload, ranging from media authenticity (32.8%) down to identity claims (3.3%). No single investigative action settles more than 41% of cases either.</p>

##### Research Questions
<p align="justify">If the right procedure can be predicted from the claim, a system that selects among procedures should outperform one that applies the same procedure everywhere. The thesis tests this through three questions.</p>
<ol>
  <li>Can verification strategies be learned from published fact-checks?</li>
  <li>Does conditioning verification on a per-claim strategy improve accuracy?</li>
  <li>If it does not, where does the error actually come from?</li>
</ol>


## Methods
##### Blueprints
<p align="justify">A blueprint is a declarative specification of how to verify one class of claim. It is data rather than code, which makes a strategy something that can be read, audited, generated, and merged without touching any agent.</p>

<p align="justify">Each blueprint has six parts. A name and description advertise it to the router, and entry conditions decide which claims it may handle at all (a reverse-image-search workflow, for example, is never eligible for a text-only claim). Selector hints rank eligible blueprints against each other, and policy constraints set the iteration budget and allowed tools. Required checks state what must be established before a verdict, independent of the route taken. Finally, a verification graph lays out action nodes that delegate work and synthesis nodes that consolidate evidence and decide where to go next.</p>

<p align="justify">The verification graph is not executed directly. It is supplied to an LLM planner as strategic guidance rather than as a rigid program. At an action node the declared actions are presented as suggestions, so the planner may add, omit, or reformulate work in response to what the claim actually requires, and can react to special cases the blueprint's author did not anticipate. This freedom is bounded at the edges. Routing is confined to the transitions the graph declares, and unconditional transitions bypass the model entirely, so the planner shapes the substance of each step while the blueprint retains control of the skeleton. A blueprint therefore separates <i>what to investigate and in what order</i> from <i>how to investigate</i>, which is left to the planner. Figure <a href='#blueprint_sample'>1</a> depicts a full blueprint for processing claims with media.</p>

<figure class="figure" id="blueprint_sample">
  <img src="{{site.baseurl}}/assets/imgs/project/learning_to_factcheck/Blueprint-Sample.svg" class="figure-img img-fluid" alt="Blueprint Sample" style="max-width: 800px;">
  <figcaption class="figure-caption text-justify">Figure 1: A learned blueprint for claims that travel with media. The top half shows the specification itself. The bottom half shows the verification graph, where action nodes (orange) delegate work and synthesis nodes (blue) consolidate evidence and route.</figcaption>
</figure>

##### Selecting a Blueprint
<p align="justify">Selection maps an incoming claim to exactly one blueprint. It runs in two stages starting with a deterministic rule filter that establishes which blueprints are <i>eligible</i>, followed by a tie-break that chooses among the survivors when more than one remains. The filter is fixed and the tie-break is served by two interchangeable mechanisms, either an LLM call over the candidates' routing surface, or a learned embedding probe. Both can also be combined, the probe deciding where it is confident and deferring to the LLM elsewhere.</p>

##### Multi-Agent Pipeline
<p align="justify">The selected blueprint guides a multi-agent pipeline. A top-level fact-check agent works through the graph one node per iteration and tracks which required checks remain open. It delegates retrieval to two workers. The web-search agent plans queries, selects promising results across all of them, and extracts evidence from the retrieved pages. The media agent runs reverse image search and geolocation on attached images and video, labeling each match as exact, partial, or unconfirmed. A judge, the only component that knows the benchmark’s label space, turns the collected evidence into a verdict. Every run is traced in full, down to each model call, query, retrieved page, and state of the check ledger. A wrong verdict can therefore be attributed to the stage that caused it. Recorded runs can also be re-entered, so a change to the late stages of a run can be tested with the earlier trajectory held fixed.</p>

<figure class="figure d-block mx-auto" id="high_level_pipeline">
  <img src="{{site.baseurl}}/assets/imgs/project/learning_to_factcheck/Pipeline-High-level.svg" class="figure-img img-fluid d-block mx-auto" alt="High Level Pipeline">
  <figcaption class="figure-caption text-justify">Figure 2: Blueprint selection, orchestration, and the worker agents. Blueprints are produced offline from the corpus shown at the bottom.</figcaption>
</figure>

##### Learning Blueprints from Fact-Checks
<p align="justify">Blueprints are not written by hand. They are induced from a corpus of published fact-check articles in four stages, building on the embed, reduce, and cluster recipe of BERTopic [<a href="#grootendorst_bertopic_2022">16</a>].</p>

<ol>
  <li><b>Fingerprinting</b>. An LLM reads each article and records how the check was carried out, including the claim type, the investigative actions, and which of them proved decisive. Topic vocabulary is stripped, so two claims about unrelated subjects that were both settled by reverse image search end up with near-identical fingerprints.</li>
  <li><b>Clustering</b>. Fingerprints are embedded, reduced with UMAP [<a href="#mcinnes_umap_2020">17</a>], and clustered with HDBSCAN [<a href="#campello_density_2013">18</a>, <a href="#mcinnes_hdbscan_2017">19</a>]. Clusters therefore group claims by verification method rather than by subject, and points that fit no coherent family are discarded.</li>
  <li><b>Synthesis</b>. For each cluster, representatives covering both its core and its spread are passed to an LLM, which writes one blueprint. If the representatives reveal several distinct strategies, the synthesizer can request a split.</li>
  <li><b>Consolidation and repair</b>. A pass over the whole pool merges blueprints that differ only by topic. Deterministic guards then fix what language models reliably get wrong, such as iteration budgets too small to reach the deepest branch or entry conditions that exclude a blueprint from its own claims.</li>
</ol>

<figure class="figure" id="blueprint_generation">
  <img src="{{site.baseurl}}/assets/imgs/project/learning_to_factcheck/Blueprint_Generation.png" class="figure-img img-fluid" alt="Blueprint Generation">
  <figcaption class="figure-caption text-justify">Figure 3: Offline construction of the blueprint pool. Each professional fact-check is reduced by an LLM to a structured record of how the check was carried out, stripped of topic vocabulary, and embedded, which places one point per claim in strategy space. Density-based clustering groups claims resolved by the same method regardless of subject, discards points belonging to no coherent family, and recursively splits any cluster that would exceed a fixed share of the corpus. Representatives spanning each cluster's core and its spread are passed to a synthesizer that writes one blueprint per cluster, which may itself ask for a further split. A final pass merges blueprints differing only by topic and repairs the inconsistencies a language model reliably generates, among them under-declared iteration budgets and entry conditions that exclude a blueprint from its own claims. It also fits the routing probe, which is what allows a pool built from articles to be applied to claims alone. Arrow labels state which stages are model-driven and which are deterministic. Colors track each cluster through to the pool, where two merges have taken place.</figcaption>
</figure>


##### Single-Strategy Baseline
<p align="justify">The blueprint system represents procedural knowledge as a routed pool of structured verification plans. To isolate the contribution of that structure, a baseline keeps every other component fixed and replaces the pool with one free-text document, <i>Strategy.md</i>. The document is distilled from the same corpus of professional fact-check articles that supplies the blueprint learner, and it is the only fact-checking guidance the agent receives at inference time. It is built by folding the corpus into it batch by batch, with periodic consolidation passes that remove repeated guidance. At inference the agent receives the full document alongside the claim and delegates to the same web-search and media agents, and the same judge assigns the verdict. A third condition, the <i>empty strategy</i>, replaces the document with a two-sentence placeholder and so isolates what the learned content adds.</p>


## Experiments
<p align="justify">All experiments use VeriTaS [<a href="#rothermel_veritas_2026">20</a>], a benchmark that refreshes every quarter from published fact-checks. Blueprints were learned from the four 2025 quarters and evaluated on the 1,000 claims of 2026 Q1, which postdate the training data of the pipeline models. The evaluation split is strongly multimodal. 849 claims carry images or video, and the claims span 41 languages and 88 fact-checking organizations. Three conditions differ only in the guidance the planner receives. The first routes each claim to a learned blueprint. The second gives every claim the same playbook, distilled from the same articles into a single document. The third gives no guidance at all. Each condition ran with two planners, Gemini 3 Flash [<a href="#gemini_3_flash">21</a>] and Gemma 4 31B [<a href="#gemma_4">22</a>]. Every run was rescored by five judges, which add Claude Opus 4.6 [<a href="#claude_opus_4_6">23</a>] and two Qwen 3.5 models [<a href="#qwen_3_5">24</a>] to the two planner models. The primary metric is mean squared error against the benchmark’s continuous integrity score.</p>

##### Learned Blueprint Pool
<p align="justify">Of the 4,000 training claims, 291 were dropped because their articles report a verdict without describing the investigation. The remaining 3,709 formed 14 clusters covering 98.5% of them. Consolidation merged these into four blueprints plus a generic fallback, and two of the four cover 90% of all clustered claims.</p>


<figure class="figure d-block mx-auto">
  <div class="row g-3 justify-content-center">
    <!-- Linke Subfigure -->
    <div class="col-md-6 text-center">
      <img src="{{site.baseurl}}/assets/imgs/project/learning_to_factcheck/cluster_visualization.png" class="img-fluid d-block mx-auto" alt="Visualization of strategy space after clustering, reduced with UMAP">
      <span class="figure-caption d-block mt-2">(a) Visualization of strategy space after clustering, reduced with UMAP. Cluster names join the most frequent claim type with the action that most often proved decisive.</span>
    </div>
    
    <!-- Rechte Subfigure -->
    <div class="col-md-6 text-center">
      <img src="{{site.baseurl}}/assets/imgs/project/learning_to_factcheck/blueprint_visualization.png" class="img-fluid d-block mx-auto" alt="Visualization of blueprint assignments">
      <span class="figure-caption d-block mt-2">(b) The same points and the same projection, colored by the blueprint each claim was assigned after synthesis. Labels are the blueprint names.</span>
    </div>
  </div>
  
  <!-- Gemeinsame Haupt-Bildunterschrift -->
  <figcaption class="figure-caption text-justify mt-3">
    Figure 4: Claim space before and after blueprint synthesis. Color change alone shows what synthesis merged. Fourteen clusters reduce to four blueprints, two of which cover 90% of all clustered claims.
  </figcaption>
</figure>

##### Main Results
<div class="row justify-content-center">
<div class="col-auto">
<table class="table table-responsive" id="table_acc">
<caption>Table 1: Full VeriTaS 2026 Q1 results across two planner models, three strategy conditions, and five judge models. Blueprints improve over the empty strategy for the Gemma 4 31B planner and degrade it for Gemini 3 Flash.</caption>
    <thead>
      <tr>
        <th scope="col">Planner Model</th>
        <th scope="col">Method</th>
        <th scope="col">Judge Model</th>
        <th scope="col">MSE (↓)</th>
        <th scope="col">MAE (↓)</th>
        <th scope="col">Acc. 7 (↑)</th>
        <th scope="col">Acc. 3 (↑)</th>
      </tr>
    </thead>
    <tbody>
      <!-- Gemini 3 Flash -->
      <tr>
        <td rowspan="15" class="align-middle">Gemini 3 Flash</td>
        <td rowspan="5" class="align-middle">Blueprints</td>
        <td>Gemini 3 Flash</td>
        <td>0.307</td>
        <td>0.370</td>
        <td>30.1%</td>
        <td>75.9%</td>
      </tr>
      <tr>
        <td>Claude Opus 4.6</td>
        <td>0.306</td>
        <td>0.379</td>
        <td>35.5%</td>
        <td>70.7%</td>
      </tr>
      <tr>
        <td>Gemma 4 31B</td>
        <td>0.421</td>
        <td>0.393</td>
        <td>49.2%</td>
        <td>70.3%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 35B</td>
        <td>0.393</td>
        <td>0.441</td>
        <td>28.0%</td>
        <td>65.7%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 397B</td>
        <td>0.362</td>
        <td>0.424</td>
        <td>31.7%</td>
        <td>64.7%</td>
      </tr>

      <tr>
        <td rowspan="5" class="align-middle">Single Strategy</td>
        <td>Gemini 3 Flash</td>
        <td>0.285</td>
        <td>0.335</td>
        <td>38.9%</td>
        <td>78.3%</td>
      </tr>
      <tr>
        <td>Claude Opus 4.6</td>
        <td>0.247</td>
        <td>0.341</td>
        <td>36.9%</td>
        <td>73.5%</td>
      </tr>
      <tr>
        <td>Gemma 4 31B</td>
        <td>0.380</td>
        <td>0.368</td>
        <td>48.9%</td>
        <td>72.8%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 35B</td>
        <td>0.366</td>
        <td>0.425</td>
        <td>29.0%</td>
        <td>66.6%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 397B</td>
        <td>0.344</td>
        <td>0.404</td>
        <td>33.7%</td>
        <td>66.2%</td>
      </tr>

      <tr>
        <td rowspan="5" class="align-middle">Empty Strategy</td>
        <td>Gemini 3 Flash</td>
        <td>0.276</td>
        <td>0.331</td>
        <td>38.6%</td>
        <td>78.2%</td>
      </tr>
      <tr>
        <td>Claude Opus 4.6</td>
        <td>0.249</td>
        <td>0.342</td>
        <td>37.1%</td>
        <td>73.8%</td>
      </tr>
      <tr>
        <td>Gemma 4 31B</td>
        <td>0.374</td>
        <td>0.365</td>
        <td>48.7%</td>
        <td>72.7%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 35B</td>
        <td>0.350</td>
        <td>0.416</td>
        <td>31.3%</td>
        <td>66.8%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 397B</td>
        <td>0.342</td>
        <td>0.409</td>
        <td>32.1%</td>
        <td>66.6%</td>
      </tr>

      <!-- Gemma 4 31B -->
      <tr>
        <td rowspan="15" class="align-middle">Gemma 4 31B</td>
        <td rowspan="5" class="align-middle">Blueprints</td>
        <td>Gemini 3 Flash</td>
        <td>0.303</td>
        <td>0.370</td>
        <td>32.1%</td>
        <td>74.6%</td>
      </tr>
      <tr>
        <td>Claude Opus 4.6</td>
        <td>0.271</td>
        <td>0.363</td>
        <td>35.1%</td>
        <td>70.4%</td>
      </tr>
      <tr>
        <td>Gemma 4 31B</td>
        <td>0.412</td>
        <td>0.403</td>
        <td>46.2%</td>
        <td>68.3%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 35B</td>
        <td>0.386</td>
        <td>0.441</td>
        <td>28.3%</td>
        <td>65.1%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 397B</td>
        <td>0.361</td>
        <td>0.423</td>
        <td>32.1%</td>
        <td>64.6%</td>
      </tr>

      <tr>
        <td rowspan="5" class="align-middle">Single Strategy</td>
        <td>Gemini 3 Flash</td>
        <td>0.347</td>
        <td>0.394</td>
        <td>33.9%</td>
        <td>71.8%</td>
      </tr>
      <tr>
        <td>Claude Opus 4.6</td>
        <td>0.298</td>
        <td>0.376</td>
        <td>36.7%</td>
        <td>69.7%</td>
      </tr>
      <tr>
        <td>Gemma 4 31B</td>
        <td>0.389</td>
        <td>0.386</td>
        <td>48.5%</td>
        <td>71.1%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 35B</td>
        <td>0.391</td>
        <td>0.442</td>
        <td>29.6%</td>
        <td>65.6%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 397B</td>
        <td>0.372</td>
        <td>0.421</td>
        <td>33.7%</td>
        <td>66.6%</td>
      </tr>

      <tr>
        <td rowspan="5" class="align-middle">Empty Strategy</td>
        <td>Gemini 3 Flash</td>
        <td>0.365</td>
        <td>0.409</td>
        <td>30.8%</td>
        <td>71.4%</td>
      </tr>
      <tr>
        <td>Claude Opus 4.6</td>
        <td>0.317</td>
        <td>0.398</td>
        <td>34.9%</td>
        <td>66.9%</td>
      </tr>
      <tr>
        <td>Gemma 4 31B</td>
        <td>0.455</td>
        <td>0.430</td>
        <td>50.2%</td>
        <td>67.4%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 35B</td>
        <td>0.450</td>
        <td>0.486</td>
        <td>25.9%</td>
        <td>61.2%</td>
      </tr>
      <tr>
        <td>Qwen 3.5 397B</td>
        <td>0.418</td>
        <td>0.463</td>
        <td>30.5%</td>
        <td>62.6%</td>
      </tr>
    </tbody>
  </table>
</div>
</div>

<p align="justify">Averaged over the five judges, blueprints lower MSE for Gemma 4 31B from 0.401 to 0.347 (0.359 with the single strategy) and raise it for Gemini 3 Flash from 0.318 to 0.358 (0.324 with the single strategy). The effect of blueprints reverses with planner strength. They improve the weaker planner and degrade the stronger one, and all five judges rank the conditions the same way. The single strategy document already recovers most of the gain on Gemma 4 31B, so the benefit comes mainly from the distilled guidance and little from routing it per claim. Most importantly, Gemma 4 31B with blueprints still trails Gemini 3 Flash with no guidance at all. Learned procedures appear to replace a planner’s own strategy rather than add to it, which suggests their value shrinks as planners improve. Against the published VeriTaS baseline [<a href="#rothermel_veritas_2026">20</a>], the pipeline achieves lower error and higher AUC (0.928 to 0.940 against 0.898). It also reverses the verdict direction less often than any baseline configuration (7.1 to 9.0% against 10.3 to 18.8%). It does report lower exact-label accuracy, because it hedges where the baselines commit, and the benchmark scores a hedge as “unknown” even when its direction is correct.</p>

##### What a Blueprint Does to a Run
<p align="justify">The difference between conditions comes down to one property. A blueprint’s required checks are separate cells, and a background fact closes only the cell it answers. In the example below, both arms confirm that anti-war protests took place in Madrid in March 2026. The unguided arm accepts that as proof that the attached video shows them. The blueprint does not, because its media-origin check is still open, and the extra retrieval pass this buys reaches the fact-check that dates the footage to an October 2025 march.</p>

<figure class="figure d-block mx-auto" id="qualitative_103621">
  <img src="{{site.baseurl}}/assets/imgs/project/learning_to_factcheck/Qualitative-103621.svg" class="figure-img img-fluid d-block mx-auto" alt="Qualitative Sample for Claim 103621" style="max-width: 800px;">
  <figcaption class="figure-caption text-justify">Figure 5: Claim 103621. The open media-origin check keeps the blueprint searching until it finds the decisive source.</figcaption>
</figure>

<p align="justify">The same mechanism also explains the cost. When the missing evidence cannot be found, an open check pulls the verdict toward the uncertain middle of the scale, where the ground truth almost never lies. And when the checks ask the wrong questions, they close early. In the next example, both checks are satisfied by confirming that the footage shows a real Chicago chase. Neither asks whether the agents are named correctly or whether the event is current, so the blueprint stops after one pass and misses both errors in the claim.</p>


<figure class="figure d-block mx-auto" id="qualitative_103074">
  <img src="{{site.baseurl}}/assets/imgs/project/learning_to_factcheck/Qualitative-103074.svg" class="figure-img img-fluid d-block mx-auto" alt="Qualitative Sample for Claim 103074" style="max-width: 800px;">
  <figcaption class="figure-caption text-justify">Figure 6: Claim 103074. Both active checks close on the right footage while the claim’s actual errors go unexamined.</figcaption>
</figure>

##### Where the Error Comes From
<p align="justify"><b>The Verdict Stage Is Close to Saturated</b> &nbsp;&nbsp; Since conditioning on a procedure did not help, the rest of the analysis asks what limits accuracy instead. The decisive experiment replaces retrieval with the evidence a human fact-checker gathered, extracted from the fact-check article without its verdict. With that evidence, the judge cuts error by 85 to 88% and gets the direction wrong on under 1% of claims. A 35B open model performs about as well as frontier models here. Prior benchmarks already pointed to retrieval as the main failure mode [<a href="#thorne_fever_2018">25</a>, <a href="#cao_averimagec_2025">26</a>], and this result quantifies it for the pipeline. Whatever error remains must come from what retrieval delivers.</p>

<div class="row justify-content-center">
<div class="col-auto">
<table class="table table-responsive" id="table_evidence">
  <caption>Table 2: Evidence ablations on the 743 claims every arm can score. The first block filters the pipeline's own evidence, and the second adds findings extracted from the fact-check article. The arms that keep only gold matches or add missed findings consult the ground truth, so they are upper bounds rather than deployable configurations.</caption>
    <thead>
      <tr>
        <th rowspan="2" class="align-bottom">
          Evidence given to the judge
        </th>
        <th colspan="3" class="text-center">Blueprint</th>
        <th colspan="3" class="text-center">Single-Strategy</th>
      </tr>
      <tr>
        <th>MSE (↓)</th>
        <th>Acc. 7 (↑)</th>
        <th>Acc. 3 (↑)</th>
        <th>MSE (↓)</th>
        <th>Acc. 7 (↑)</th>
        <th>Acc. 3 (↑)</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>Pipeline evidence, unfiltered</td>
        <td>0.270</td>
        <td>42.5%</td>
        <td>86.8%</td>
        <td>0.203</td>
        <td>46.3%</td>
        <td>86.9%</td>
      </tr>

      <tr>
        <td class="ps-4">filtered to gold matches</td>
        <td>0.220</td>
        <td>41.6%</td>
        <td>85.1%</td>
        <td>0.217</td>
        <td>43.3%</td>
        <td>84.7%</td>
      </tr>
      <tr>
        <td class="ps-4">filtered: drop off-topic &amp; stubs</td>
        <td>0.248</td>
        <td>40.5%</td>
        <td>84.9%</td>
        <td>0.208</td>
        <td>42.4%</td>
        <td>86.9%</td>
      </tr>
      <tr>
        <td class="ps-4">filtered at random, volume-matched</td>
        <td>0.355</td>
        <td>36.2%</td>
        <td>74.7%</td>
        <td>0.305</td>
        <td>36.2%</td>
        <td>76.7%</td>
      </tr>

      <tr>
        <td class="ps-4">+ &nbsp; gold findings already held</td>
        <td>0.207</td>
        <td>42.1%</td>
        <td>89.2%</td>
        <td>0.163</td>
        <td>47.6%</td>
        <td>90.2%</td>
      </tr>
      <tr>
        <td class="ps-4">+ &nbsp; gold findings missed</td>
        <td>0.134</td>
        <td>49.0%</td>
        <td>93.5%</td>
        <td>0.097</td>
        <td>52.8%</td>
        <td>94.4%</td>
      </tr>
      <tr>
        <td class="ps-4">+ &nbsp; all gold findings</td>
        <td>0.090</td>
        <td>50.9%</td>
        <td>94.6%</td>
        <td>0.088</td>
        <td>54.0%</td>
        <td>95.4%</td>
      </tr>

      <tr>
        <td>Ground-truth evidence only (ceiling)</td>
        <td><strong>0.052</strong></td>
        <td><strong>61.6%</strong></td>
        <td><strong>96.4%</strong></td>
        <td><strong>0.052</strong></td>
        <td><strong>61.6%</strong></td>
        <td><strong>96.4%</strong></td>
      </tr>
    </tbody>
  </table>
</div>
</div>

<p align="justify"><b>Retrieval Recall Predicts Error</b> &nbsp;&nbsp; The pipeline recovers under half of the fact-checkers’ findings, and that recall predicts error strongly. Claims in the lowest recall quartile have about three times the error of those in the highest. The same claims judged on gold evidence show no such pattern, so the effect comes from retrieval rather than from some claims simply being harder.</p>

<p align="justify"><b>Most Relevant Sources Are Never Attempted</b> &nbsp;&nbsp; Tracing the sources fact-checkers credited sharpens this further. Only 4.4% of them were attempted and failed, typically behind paywalls at outlets like Reuters or the New York Times. Another 78.5% were never put in front of the retriever at all. Cleaning up the search queries halved the number of empty results but left recall unchanged. The binding constraint is the stage that decides which sources a claim deserves, and in current pipelines no component owns that decision.</p>

##### Component Findings
<p align="justify">Several results stand on their own, independent of the main argument.</p>
<ul>
  <li> <b>Geolocation</b>. General-purpose multimodal LLMs beat two specialized geolocation models [<a href="#haas_geolocalization_2023">27</a>, <a href="#cepeda_geoclip_2023">28</a>] by roughly 30 points of country-level accuracy, on public and never-published images alike. They can also abstain when an image carries no location cues, which closed-set classifiers cannot.</li>
  <li> <b>Manipulation detection</b>. Forensic detectors do not survive redistribution on social media. C2PA manifests are absent from every image in the corpus, and both TruFor [<a href="#guillaro_trufor_2024">47</a>] and GenD [<a href="#yermakov_deepfake_2026">29</a>] perform near or below chance. Even an oracle detector with perfect knowledge leaves the verdict unchanged, because claims usually fail on context rather than on altered pixels. This matches the finding that pixel-level deepfake detectors add little to fact-checking and often hurt it [<a href="#sharifuzzman_fact_2026">30</a>].</li>
  <li> <b>Unused budget</b>. Spending leftover iterations on a refinement step looks like a small gain, but a control arm shows that about four fifths of it is judge resampling rather than new evidence.</li>
</ul>


## Outlook
<p align="justify">The most direct next step is to give the pipeline an explicit sourcing stage that decides where to look for a given claim. The material already exists, since the article analysis records which sources settled each training case. A second change would decouple whether a check is settled from how confidently the verdict is stated, so that an open check keeps the search going without automatically pulling the verdict toward uncertainty. Finally, conditioning could operate on individual checks rather than whole procedures, assembling what each claim needs instead of selecting one fixed graph.</p>

<p align="justify">More broadly, the method behind this diagnosis is cheap to repeat. Any benchmark built from published fact-checks already names the sources each checker used, so evidence recall can be computed for any system without new annotation. Reporting it next to the end-to-end score shows whether a system failed at reasoning or simply never saw the relevant page.</p>

## References
1. <span id="vosoughi2018spread">Soroush Vosoughi, Deb Roy, and Sinan Aral. “The spread of true and false news online”. In: Science 359.6380 (Mar. 9, 2018), pp. 1146–1151. doi: 10.1126/science.aap9559. url: <a href="https://www.science.org/doi/10.1126/science.aap9559">https://www.science.org/doi/10.1126/science.aap9559</a>.</span>
2. <span id="chuai2026community">Yuwei Chuai et al. “Community-based fact-checking reduces the spread of misleading posts on X (formerly Twitter)”. In: Nature Communications 17.1 (May 5, 2026), p. 4070. issn: 2041-1723. doi: 10.1038/s41467-026-72597-0. url: <a href="https://www.nature.com/articles/s41467-026-72597-0">https://www.nature.com/articles/s41467-026-72597-0</a>.</span>
3. <span id="micallef_true_2022">Nicholas Micallef et al. “True or False: Studying the Work Practices of Professional Fact-Checkers”. In: Proceedings of the ACM on Human-Computer Interaction 6 (CSCW1 Apr. 7, 2022), 127:1–127:44. doi: 10.1145/3512974. url: <a href="https://dl.acm.org/doi/10.1145/3512974">https://dl.acm.org/doi/10.1145/3512974</a>.</span>
4. <span id="graves_anatomy_2017">Lucas Graves. “Anatomy of a Fact Check: Objective Practice and the Contested Epistemology of Fact Checking”. In: Communication, Culture and Critique 10.3 (Sept. 1, 2017), pp. 518–537. issn: 1753-9129. doi: 10.1111/cccr.12163. url: <a href="https://doi.org/10.1111/cccr.12163">https://doi.org/10.1111/cccr.12163</a>.</span>
5. <span id="chen2023can">Canyu Chen and Kai Shu. “Can LLM-Generated Misinformation Be Detected?” In: The Twelfth International Conference on Learning Representations. Oct. 13, 2023. url: <a href="https://openreview.net/forum?id=ccxD4mtkTU">https://openreview.net/forum?id=ccxD4mtkTU</a>.</span>
6. <span id="akhtar_multimodal_2023">Mubashara Akhtar et al. “Multimodal Automated Fact-Checking: A Survey”. In: Findings of the Association for Computational Linguistics: EMNLP 2023. Findings 2023. Ed. by Houda Bouamor, Juan Pino, and Kalika Bali. Singapore: Association for Computational Linguistics, Dec. 2023, pp. 5430–5448. doi: 10.18653/v1/2023.findings-emnlp.361. url: <a href="https://aclanthology.org/2023.findings-emnlp.361/">https://aclanthology.org/2023.findings-emnlp.361/</a>.</span>
7. <span id="tonglet_cove_2025">Jonathan Tonglet, Gabriel Thiem, and Iryna Gurevych. “COVE: COntext and VEracity prediction for out-of-context images”. In: Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers). NAACL-HLT 2025. Ed. by Luis Chiruzzo, Alan Ritter, and Lu Wang. Albuquerque, New Mexico: Association for Computational Linguistics, Apr. 2025, pp. 2029–2049. isbn: 979-8-89176-189-6. doi: 10.18653/v1/2025.naacl-long.102. url: <a href="https://aclanthology.org/2025.naacl-long.102/">https://aclanthology.org/2025.naacl-long.102/</a>.</span>
8. <span id="luo2021newsclipings">Grace Luo, Trevor Darrell, and Anna Rohrbach. “NewsCLIPpings: Automatic Generation of Out-of-Context Multimodal Media”. In: Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing. EMNLP 2021. Ed. by Marie-Francine Moens et al. Online and Punta Cana, Dominican Republic: Association for Computational Linguistics, Nov. 2021, pp. 6801–6817. doi: 10.18653/v1/2021.emnlp-main.545. url: <a href="https://aclanthology.org/2021.emnlp-main.545/">https://aclanthology.org/2021.emnlp-main.545/</a>.</span>
9. <span id="abdelnabi2022open">Sahar Abdelnabi, Rakibul Hasan, and Mario Fritz. “Open-Domain, Content-based, Multi-modal Fact-checking of Out-of-Context Images via Online Resources”. In: 2022 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR). 2022 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR). ISSN: 2575-7075. June 2022, pp. 14920–14929. doi: 10.1109/CVPR52688.2022.01452. url: <a href="https://ieeexplore.ieee.org/document/9878739">https://ieeexplore.ieee.org/document/9878739</a>.</span>
10. <span id="shaar2020that">Shaden Shaar et al. “That is a Known Lie: Detecting Previously Fact-Checked Claims”. In: Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics. ACL 2020. Ed. by Dan Jurafsky et al. Online: Association for Computational Linguistics, July 2020, pp. 3607–3618. doi: 10.18653/v1/2020.acl-main.332. url: <a href="https://aclanthology.org/2020.acl-main.332/">https://aclanthology.org/2020.acl-main.332/</a>.</span>
11. <span id="chrysidis_credible_2024">Zacharias Chrysidis et al. “Credible, Unreliable or Leaked?: Evidence verification for enhanced automated fact-checking”. In: Proceedings of the 3rd ACM International Workshop on Multimedia AI against Disinformation. MAD ’24. New York, NY, USA: Association for Computing Machinery, June 10, 2024, pp. 73–81. isbn: 979-8-4007-0552-6. doi: 10.1145/3643491.3660278. url: <a href="https://dl.acm.org/doi/10.1145/3643491.3660278">https://dl.acm.org/doi/10.1145/3643491.3660278</a>.</span>
12. <span id="qi_sniffer_2024">Peng Qi et al. “Sniffer: Multimodal Large Language Model for Explainable Out-of-Context Misinformation Detection”. In: 2024 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR). 2024 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR). ISSN: 2575-7075. June 2024, pp. 13052–13062. doi: 10.1109/CVPR52733.2024.01240. url: <a href="https://ieeexplore.ieee.org/document/10656149">https://ieeexplore.ieee.org/document/10656149</a>.</span>
13. <span id="guillaro_trufor_2024">Fabrizio Guillaro et al. “TruFor: Leveraging All-Round Clues for Trustworthy Image Forgery Detection and Localization”. In: Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR). June 2023, pp. 20606–20615</span>
14. <span id="atanasova_generating_2020">Pepa Atanasova et al. “Generating Fact Checking Explanations”. In: Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics. ACL 2020. Ed. by Dan Jurafsky et al. Online: Association for Computational Linguistics, July 2020, pp. 7352–7364. doi: 10.18653/v1/2020.acl-main.656. url: <a href="https://aclanthology.org/2020.acl-main.656/">https://aclanthology.org/2020.acl-main.656/</a>.</span>
15. <span id="braun_defame_2025">Tobias Braun et al. “DEFAME: Dynamic Evidence-based FAct-checking with Multimodal Experts”. In: Proceedings of the 42nd International Conference on Machine Learning. International Conference on Machine Learning. PMLR, Oct. 6, 2025, pp. 5383–5417. url: <a href="https://proceedings.mlr.press/v267/braun25b.html">https://proceedings.mlr.press/v267/braun25b.html</a>.</span>
16. <span id="grootendorst_bertopic_2022">Maarten Grootendorst. BERTopic: Neural topic modeling with a class-based TF-IDF procedure. Mar. 11, 2022. doi: 10.48550/arXiv.2203.05794. arXiv: 2203.05794[cs.CL]. url: <a href="http://arxiv.org/abs/2203.05794">http://arxiv.org/abs/2203.05794</a>.</span>
17. <span id="mcinnes_umap_2020">Leland McInnes, John Healy, and James Melville. UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction. Sept. 18, 2020. doi: 10.48550/arXiv.1802.03426. arXiv: 1802.03426[stat.ML]. url: <a href="http://arxiv.org/abs/1802.03426">http://arxiv.org/abs/1802.03426</a>.</span>
18. <span id="campello_density_2013">Ricardo J. G. B. Campello, Davoud Moulavi, and Joerg Sander. “Density-Based Clustering Based on Hierarchical Density Estimates”. In: Advances in Knowledge Discovery and Data Mining. Ed. by Jian Pei et al. Berlin, Heidelberg: Springer, 2013, pp. 160–172. isbn: 978-3-642-37456-2. doi: 10.1007/978-3-642-37456-2_14</span>
19. <span id="mcinnes_hdbscan_2017">Leland McInnes, John Healy, and Steve Astels. “hdbscan: Hierarchical density based clustering”. In: Journal of Open Source Software 2.11 (Mar. 21, 2017), p. 205. issn: 2475-9066. doi: 10.21105/joss.00205. url: <a href="https://joss.theoj.org/papers/10.21105/joss.00205">https://joss.theoj.org/papers/10.21105/joss.00205</a>.</span>
20. <span id="rothermel_veritas_2026">Mark Rothermel et al. "VeriTaS: The First Dynamic Benchmark for Multimodal Automated Fact-Checking". In: Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers). 2026.
doi: 10.18653/v1/2026.acl-long.1948. url: <a href="https://aclanthology.org/2026.acl-long.1948/">https://aclanthology.org/2026.acl-long.1948/</a>.</span>
21. <span id="gemini_3_flash">Google. Gemini 3 Flash. 2026. url: <a href="https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-flash">https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-flash</a>.</span>
22. <span id="gemma_4">Gemma Team et al. Gemma 4 Technical Report. July 24, 2026. doi: 10.48550/arXiv.2607.02770. arXiv: 2607.02770 [cs.CL]. url: <a href="http://arxiv.org/abs/2607.02770">http://arxiv.org/abs/2607.02770</a>.</span>
23. <span id="claude_opus_4_6">Anthropic. Claude Opus 4.6. 2026. url: <a href="https://www.anthropic.com/news/claude-opus-4-6">https://www.anthropic.com/news/claude-opus-4-6</a>.</span>
24. <span id="qwen_3_5">Qwen Team. Qwen3.5: Towards Native Multimodal Agents. Feb. 2026. url: <a href="https://qwen.ai/blog?id=qwen3.5">https://qwen.ai/blog?id=qwen3.5</a>.</span>
25. <span id="thorne_fever_2018">James Thorne et al. “FEVER: a Large-scale Dataset for Fact Extraction and VERification”. In: Proceedings of the 2018 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long Papers). NAACL-HLT 2018. Ed. by Marilyn Walker, Heng Ji, and Amanda Stent. New Orleans, Louisiana: Association for Computational Linguistics, June 2018, pp. 809–819. doi: 10.18653/v1/N18-1074. url: <a href="https://aclanthology.org/N18-1074/">https://aclanthology.org/N18-1074/</a>.</span>
26. <span id="cao_averimagec_2025">Rui Cao et al. AVerImaTeC: A Dataset for Automatic Verification of Image-Text Claims with Evidence from the Web. Oct. 7, 2025. doi: 10.48550/arXiv.2505.17978. arXiv:2505.17978[cs]. url: <a href="http://arxiv.org/abs/2505.17978">http://arxiv.org/abs/2505.17978</a>.</span>
27. <span id="haas_geolocalization_2023">Lukas Haas, Silas Alberti, and Michal Skreta. Learning Generalized Zero-Shot Learners for Open-Domain Image Geolocalization. 2023. arXiv: 2302.00275 [cs.CV].</span>
28. <span id="cepeda_geoclip_2023">Vicente Vivanco Cepeda, Gaurav Kumar Nayak, and Mubarak Shah. “GeoCLIP: Clip-inspired alignment between locations and images for effective worldwide geo-localization”. In: Proceedings of the 37th International Conference on Neural Information Processing Systems. NIPS ’23. Red Hook, NY, USA: Curran Associates Inc., Dec. 10, 2023, pp. 8690–8701.</span>
29. <span id="yermakov_deepfake_2026">Andrii Yermakov et al. “Deepfake Detection that Generalizes Across Benchmarks”. In: Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision. 2026, pp. 773–783. url:
<a href="https://openaccess.thecvf.com/content/WACV2026/html/Yermakov_Deepfake_Detection_that_Generalizes_Across_Benchmarks_WACV_2026_paper.html">https://openaccess.thecvf.com/content/WACV2026/html/Yermakov_Deepfake_Detection_that_Generalizes_Across_Benchmarks_WACV_2026_paper.html</a>.</span>
30. <span id="sharifuzzman_fact_2026">A. S. M. Sharifuzzaman Sagar et al. “Fact or Fake? Assessing the Role of Deepfake Detectors in Multimodal Misinformation Detection”. In: IEEE Access 14 (2026), pp. 86992–87011. issn: 2169-3536. doi: 10.1109/ACCESS.2026.3686437. url: <a href="https://ieeexplore.ieee.org/document/11493433">https://ieeexplore.ieee.org/document/11493433</a>.</span>