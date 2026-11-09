---
layout: post
title: "Using LLMs to steer a sailboat"
date: 2026-11-06
tags: [LLM, Robotics, Sailing, Simulation]
color: secondary
style: outline
description: "Can an off-the-shelf multimodal LLM sail a boat around an island from a camera image, a chart and one sentence of instructions?"
---

*Can an off-the-shelf multimodal language model sail a boat around an island, just from a camera image, a chart and a sentence of instructions? I tried it in my simulator. The short answer: somewhat.*

## Why I tried this

My long-term goal is a sailboat you can talk to: "round the orange buoys twice, then pass between the yellow ones". Robotics research calls models that turn camera images and language into actions *vision-language-action models* (VLAs), and training one is a serious project. Before starting it, I wanted a cheap baseline: what happens if I simply give a large multimodal model (in this case Claude) what the boat sees and ask it where to steer?

## The setup

Everything runs in my simulator: a MuJoCo model of a small sailboat with sail and rudder physics, the same ROS 2 heading controller as in my autonomous navigation stack, and maps of real waters. The tests here use the Landgraben, a pond with a large island in the middle (scaled to twice its real size), with six coloured buoys and the wind blowing from the south.

Every two seconds of simulated time, the model gets:

- **the onboard camera image**, with a bearing scale along the top (degrees off the bow) and distance marks on the sides (where the water is 5, 10, 20 and 50 m away),
- **a chart**, north up: land, buoys, the boat and the track it has sailed, a scale bar, the no-go zone into the wind and a yellow line showing where the current course leads,
- **instruments** in text: heading, speed, wind, the range of headings that cannot be sailed, and the point of sail,
- **the task** in plain English, its own last few decisions, and a running progress note it wrote itself.

It answers with a short observation, an estimate of how far the nearest land ahead is, a course change in degrees, and whether the task is done. My autopilot then holds that course until the next decision. The simulation waits while the model thinks, so slow and fast models are compared fairly. (What happens when it doesn't wait is the topic of the [last section](#when-the-world-doesnt-wait).)

![What the model sees: the onboard camera with bearing scale and distance marks and the chart at the same moment: the yellow course line runs towards the west shore]({{site.baseurl}}/assets/imgs/blog/llm_steering_sailboat_2026/model-inputs.png)
*The model's input at one decision. Its answer: "Open water ahead, but the outer west shore is now about 20 m off along my 225° course (camera and chart agree), so it is time to tack."*

## First steps: sail to a buoy

I started small, with Claude Haiku 5.5, the smallest and cheapest model. "Sail to the orange buoy" failed at first in an instructive way: the boat's own bow, which is brown-orange and always visible at the bottom of the image, was taken for the buoy and the model held course, "buoy dead ahead", straight into the bank. And when the buoy was behind the boat, it steered towards whatever buoy it *could* see instead of looking around.

Two sentences in the prompt fixed both ("the brown shape at the bottom is your own bow"; "if the target is not in view, turn to look around"). After that Haiku searched methodically, named every buoy it passed with bearings accurate to a few degrees, and reached its targets reliably in about half a minute, for a fraction of a cent per run.

<video controls preload="metadata" width="100%" src="{{site.baseurl}}/assets/imgs/blog/llm_steering_sailboat_2026/haiku-to-green.mp4" autoplay loop muted playsinline></video>

*Claude Haiku 5.5: "Sail to the green buoy." It finds the buoy, steers around the fountain island and reaches it after 57 seconds. 29 decisions, 1.7 s each on average, cost: less than one cent. (Video at 2× speed; the inset shows the onboard camera.)*

## The real test: around the island

Then the task I actually care about, one sentence with several steps:

> Drive around the big island, start on the side with the red buoy and follow
> the shore on your right side so that you are between the shore and the island,
> pass the blue buoy, then pass the green buoy and end between the yellow buoys.

This needs everything at once: understanding the instruction, keeping track of progress over several minutes, reading the shore, and sailing upwind (which means tacking, because a sailboat cannot point closer than about 45° to the wind).

It took many attempts. The failures fell into a few groups:

**Judging distance to land.** The banks are low and green; at 5 m and at 50 m they look much the same. I logged the true distance next to the model's own estimate: in one run, land 10–20 m ahead was rated "over 50 m" in 16 of 17 decisions, and land 20–50 m ahead was rated "over 50 m" or "no land" in 40 of 47. Up close the estimates were good, but by then it is too late to turn.

**Spatial reasoning.** The model sees the world from the boat: left, right, ahead. Many instructions are about the map: north, south, behind. Translating between the two went wrong in three ways:
- *Through the island.* The island is low, so buoys on its far side are visible over the land. Models steered straight at them, as if the island were not there.
- *Which side.* In one run I asked for the green buoy to be passed on its south side. The boat sailed south-east with the buoy on its right, which puts the boat north of the buoy. The model still noted "passed on its south side".
- *When something is passed.* "Abeam" means level with the boat, 90° to the side. The model called a buoy 25° off the bow "nearly abeam" and declared the task done, while the finish gate was still 9 m ahead.

The north-up chart would have answered all three questions at a glance, but the models mostly reasoned from the camera image. My guess is that this is because the answer itself is egocentric because a turn in degrees off the bow can be read almost directly from the camera's bearing scale, while the chart first needs a mental rotation from north-up to the boat's heading. Testing that, with a chart-only pilot or a heading-up chart, is the next experiment.

**Sailing.** The models know the rules, e.g. "the wind blocks a left turn here", "I must tack",  but executing them was another matter: switching tacks every two seconds, or turning back halfway through a tack, stops a sailboat dead.

## What made the difference

Almost every improvement came from changing what the model sees and what it has
to do itself, not from cleverer wording:

| Problem | What I changed |
|---|---|
| Wrong arithmetic between relative and true wind | The instruments state the true wind, the no-go zone as a range of headings, and the point of sail |
| Asking for headings into the wind | The autopilot never steers into the no-go zone; it sails close-hauled at its edge and tells the model |
| Tacks reversed halfway | The model decides *when* to tack; the autopilot carries the tack out and asks again once the boat is moving |
| Land misjudged at medium range | Distance marks in the camera image, and a course line on the chart that shows when a course hits land |
| Losing track of a multi-step task | A progress note the model writes each time and reads at the next decision |
| Ambiguous instructions | More explicit wording: "to the north", "from east to west" |

The common thread: **compute what can be computed, and let the model decide rather than calculate.** That is also the split I plan for a trained system with a language model for the plan and proper control underneath.

## A full lap

With these changes, Claude Opus 5.5 sailed the whole course: red buoy first, north through the narrow east channel, west past the blue buoy, three tacks down the west channel, past the green buoy and through the gate between the yellow buoys without touching land.

<video controls preload="metadata" width="100%" src="{{site.baseurl}}/assets/imgs/blog/llm_steering_sailboat_2026/opus-full-lap.mp4" autoplay loop muted playsinline></video>
*Claude Opus 5.5 completes the course in 290 seconds of sailing (video at 4× speed). 123 decisions; the onboard camera is in the bottom right, the chart in the bottom left.*

![The track of the full lap]({{site.baseurl}}/assets/imgs/blog/llm_steering_sailboat_2026/opus-track.png)

Its progress notes read like a navigator's log. It even worked out a coordinate system from the chart's scale bar ("The boat is at about chart (358,150), running north up the east channel on heading 1°. Scale: about 2.3 px per metre."). Its plan at the start:

> Start, decision 1: heading toward the red buoy (about 54°) to begin the east
> side. The route is counter-clockwise: red buoy (east), then north up the east
> channel, then west across the north, then south past the blue buoy and on to
> the green buoy. Finish between the yellow buoys (centre south). Keep the outer
> shore on the right and the island on the left. Wind is from the south.

Claude Sonnet 5.5 came close in several runs with the full lap in the right order, stopping just short of the finish gate, at less than half the price.

## Models, speed and cost

| Model | Time per decision | Typical cost | In my tests |
|---|---|---|---|
| Claude Haiku 5.5 | 1.5–5 s | cents per run | reliable for single targets; misjudges land in narrow water |
| Claude Sonnet 5.5 | 2–3 s | $1.40–2.50 per lap | nearly completes the course |
| Claude Opus 5.5 | about 8 s | $2.50–3.60 per lap | completed the full course |

These costs are from before I turned on prompt caching. The rules part of the prompt is the same for every decision, so the API can now reuse it at a tenth of the price or less; that cuts the cost per decision by about 40%.

## When the world doesn't wait

Everything so far ran with the simulation paused while the model thinks. A real boat doesn't pause. So I let the simulation run on in real time: the model gets a picture, the boat keeps sailing on its last course while the model thinks, and the answer is acted on whenever it arrives, by which time the picture is already a few seconds old. At about 2 m/s, every second of thinking is two metres of water.

| Around the island, in real time | Time per decision | Boat moved before the answer took effect | Result |
|---|---|---|---|
| Claude Sonnet 5.5 | 2.9 s | 4 m | 353° of the lap, stopped 6 m short of the gate, never stuck |
| Claude Opus 5.5 | 10.5 s | 18 m | aground after 50 s |
| Claude Opus 5.5, second run | 9.4 s | 15 m | aground after about 170 s, two thirds of the way round |
| Claude Opus 5.5, low effort | 4.0 s | 6 m | aground after about 170 s, at the same spot |

**Sonnet hardly noticed.** Its lap was as good as its best paused runs, and it again declared the task done just before the gate. The delay mattered once: at a corner of the island it rated land 8 m ahead as "20–50 m", its corrections arrived 4 m late, and the boat brushed the corner before sailing on. For single targets, Haiku (with thinking turned off, about 1 s per answer) reached the green buoy in real time too.

**Opus ran aground every time.** The model that sailed the full lap when the world waited for it did not get round once. In the first run its last decision was right: "the east shore lies about 15–20 m ahead … so turn north". But the answer took 10.6 s, and the boat hit the bank about four seconds before the turn arrived. In the second run it rated the shore 27 m ahead as "over 50 m"; that answer took 14.6 s, and the corrected course arrived after the boat had already hit the shore.

**Faster alone doesn't help.** With low effort, Opus answered in 4 s, almost as fast as Sonnet, and got through the east channel cleanly. But then it twice described the north shore as "angling closer" and "angling in", still rated it "over 50 m" and held its course. By the time it started to turn away, the shore was 4 m ahead. And as the scene got difficult its answers slowed down again, to 8–10 s, exactly when it could least afford it.

The weakness is the same one as before: misjudging land at 10–50 m. With the simulation paused, the next decision came two seconds later and could fix the mistake. In real time a single misjudged view near the shore uses up the whole margin, whether the answer comes late or is careless. These are single runs per variant again, but three Opus runs, three groundings, and always the same mechanism.

**A nice side effect: it got cheaper.** With caching, and with fewer decisions because each one takes longer, Sonnet's lap cost \\$0.50 instead of \\$1.37.

## So: can an LLM sail?

Somewhat. A model like this reaches goals and plans sensibly at a coarse level. Its notes are often better than its steering. Stronger models do clearly better. But it only works with carefully designed inputs, and long tasks fail on a single lapse — one misjudged shore at the wrong moment. In real time that lapse comes faster: the slowest model, the only one that completed the course, ran aground in all three attempts once the world stopped waiting for it. My results are also based on a handful of runs per variant, so they show tendencies, not success rates.

The simulator and the LLM pilot are on GitHub: [CptK/sailboat-simulator](https://github.com/CptK/sailboat-simulator).
