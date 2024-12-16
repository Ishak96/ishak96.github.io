---
layout: page
title: MicroMouse
description: Electronic Mouse Maze Solver
img: assets/img/micromouse.png
---

## Micromouse Maze-Solving Physics Simulator

Our physics-based simulator for Micromouse maze solving leverages Box2D and Processing to accurately model key components of the vehicle, including wheels, rotary encoders, IR sensors, accelerometers, and gyroscopes. The vehicle's motion and behavior are controlled using PID controllers, ensuring precise and responsive performance.  

The simulator supports loading various algorithms to compute the shortest path and make decisions. In our implementation, we use either the Flood Fill algorithm or Q-learning to optimize the maze-solving process.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.liquid path="assets/video/micromouse.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=true %}
    </div>
</div>
<div class="caption">
    Example of a MicroMouse solving a maze: on the left, the brain mapping of the visited maze; on the right, the sensor values and wheel directions.
</div>

**For more details and access to the codebase, visit our GitHub repository: [MicroMouse](https://github.com/Ishak96/MicroMouse).**