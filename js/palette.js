const svg = d3.select("svg")
const pointDatas = svg.select("g.points")
let dummyRange = pointDatas.append("g").attr("class", "dummy-range")
	.style("pointer-events", "none").style("display", "none");

let handlePoints = null;
let initDummyPlot = null;
let moveDummyPlot = null;
let removeDummyPlot = null;
const modifyPosition = (mousePos) => {
	if (!mousePos) return mousePos
	const height = svg.node().getBoundingClientRect().height;
	mousePos[1] = height - mousePos[1]
	return mousePos
}
svg.on("click", function() {
	const mousePos = modifyPosition(d3.mouse(this));
	handlePoints(mousePos);
	removeDummyPlot && removeDummyPlot(dummyRange);
	dummyRange.selectAll("*").remove();
	(initDummyPlot || moveDummyPlot) && (initDummyPlot || moveDummyPlot)(dummyRange, mousePos);
})
.on("mouseenter", function() {
	removeDummyPlot && removeDummyPlot(dummyRange);
	dummyRange.selectAll("*").remove();
	const mousePos = modifyPosition(d3.mouse(this));
	try {
		initDummyPlot && initDummyPlot(dummyRange, mousePos);
	} catch (e) {
		console.log(e);
	}
})
.on("mousemove", function() {
	const mousePos = modifyPosition(d3.mouse(this));
	try {
		moveDummyPlot && moveDummyPlot(dummyRange, mousePos);
	} catch (e) {
		console.log(e);
	}
})
.on("mouseleave", function() {
	const mousePos = modifyPosition(d3.mouse(this));
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;
	if (mousePos[0] < 0 || width - 2 < mousePos[0] || mousePos[1] < 0 || height - 2 < mousePos[1]) {
		removeDummyPlot && removeDummyPlot(dummyRange);
		dummyRange.selectAll("*").remove();
	}
});

const paletteData = [
	{
		"name": "mode",
		"type": "list",
		"data": ["add", "template", "remove", "modify", "setting"],
		"value": "add",
		"child": {
			"template": [
				{
					"name": "pattern",
					"type": "buttons",
					"data": ["clusters", "circles"],
					"click": {
						"clusters": () => {
							const width = manager.platform.width;
							const height = manager.platform.height;
							manager.datas.remove()
							const centers = [];
							const clusterSize = paletteData.mode.child.template.clustersize.default
							for (let i = paletteData.mode.child.template.clusters.default; i > 0; i--) {
								let c = null;
								let n = 1;
								while (true) {
									c = [Math.random(), Math.random()];
									if (centers.length == 0) {
										break;
									}
									let min_d = Math.min.apply(null, centers.map(ct => (ct[0] - c[0]) ** 2 + (ct[1] - c[1]) ** 2));
									if (500 / n < Math.sqrt(min_d / 2) && Math.random() < Math.sqrt(min_d / 2)) {
										break;
									}
									n += 1;
								}
								centers.push(c);
								let c0 = [c[0] * (width - 200) + 100, c[1] * (height - 200) + 100];
								manager.datas.addCluster(c0, 0, 50, clusterSize, i)
							}
						},
						"circles": () => {
							const width = manager.platform.width;
							const height = manager.platform.height;
							manager.datas.remove()
							const center = [width / 2, height / 2];
							const clusters = paletteData.mode.child.template.clusters.default;
							const arcInterval = Math.min(center[0], center[1]) / clusters;
							const clusterSize = paletteData.mode.child.template.clustersize.default;
							for (let i = 1; i <= clusters; i++) {
								const rd = (i - 0.5) * arcInterval;
								for (let n = 0; n < clusterSize; n++) {
									const theta = Math.random() * Math.PI * 2;
									const nr = normal_random(0, 10);
									const x = Math.cos(theta) * rd + center[0] + nr[0];
									const y = Math.sin(theta) * rd + center[1] + nr[1];
									manager.datas.push([x, y], i)
								}
							}
						}
					}
				},
				{
					"name": "clusters",
					"type": "slider",
					"default": 3,
					"range": [1, 10]
				},
				{
					"name": "clustersize",
					"type": "slider",
					"default": 100,
					"range": [1, 500]
				}
			],
			"add": [
				{
					"name": "category",
					"type": "category",
					"categories": [true],
					"category": 0
				},
				{
					"name": "pattern",
					"type": "list",
					"data": ["point", "random", "line", "circle", "arc", "spiral"],
					"value": "point",
					"click": {
						"point": () => {
							let dp = null;
							handlePoints = (cp) => manager.datas.push(cp, paletteData.mode.child.add.category.category);
							initDummyPlot = (r, cp) => dp = new DataPoint(r, cp, specialCategory.dummy);
							moveDummyPlot = (r, cp) => { if (dp) dp.at = cp; }
							removeDummyPlot = null;
						},
						"random": () => {
							const width = manager.platform.width;
							const height = manager.platform.height;
							handlePoints = (cp) => {
								const category = paletteData.mode.child.add.category.category;
								for (var i = paletteData.mode.child.add.number.default; i > 0; i--) {
									manager.datas.push([Math.floor(Math.random() * (width - 20)) + 10, Math.floor(Math.random() * (height - 20)) + 10], category);
								}
							};
							initDummyPlot = (r, cp) => {
								r.append("rect").attr("x", 0).attr("y", 0)
									.attr("width", width).attr("height", height)
									.attr("fill", getCategoryColor(specialCategory.dummy)).attr("opacity", 0.2);
							};
							moveDummyPlot = null;
							removeDummyPlot = null;
						},
						"line": () => {
							let dp = null;
							let startPoint = null;
							handlePoints = (cp) => {
								if (startPoint === null) {
									startPoint = cp;
									return;
								}
								const category = paletteData.mode.child.add.category.category;
								const count = paletteData.mode.child.add.number.default;
								const noise = paletteData.mode.child.add.noise.default;
								let x0 = startPoint[0];
								let y0 = startPoint[1];
								const dx = (cp[0] - x0) / (count - 1);
								const dy = (cp[1] - y0) / (count - 1);
								for (let i = 0; i < count; i++) {
									const nr = normal_random(0, noise * 10);
									const x = nr[0] + x0 + dx * i;
									const y = nr[1] + y0 + dy * i;
									manager.datas.push([x, y], category)
								}
								dp = null;
								startPoint = null;
							};
							initDummyPlot = (r, cp) => {
								if (startPoint) {
									r.append("line")
										.attr("x1", startPoint[0]).attr("y1", startPoint[1])
										.attr("x2", cp[0]).attr("y2", cp[1])
										.attr("stroke", "red");
								} else {
									dp = new DataPoint(r, cp, specialCategory.dummy);
								}
							}
							moveDummyPlot = (r, cp) => {
								if (startPoint) {
									r.select("line")
										.attr("x2", cp[0]).attr("y2", cp[1])
								} else {
									dp.at = cp
								}
							}
							removeDummyPlot = null;
						},
						"circle": () => {
							let center = null;
							handlePoints = (cp) => {
								if (center == null) {
									center = cp;
									return;
								}
								const size = Math.sqrt((center[0] - cp[0]) ** 2 + (center[1] - cp[1]) ** 2);
								const category = paletteData.mode.child.add.category.category;
								let cnt = paletteData.mode.child.add.number.default;
								const noise = paletteData.mode.child.add.noise.default;
								manager.datas.addCluster(center, size, noise * 10, cnt, category)
								center = null;
							};
							let stopper = null;
							initDummyPlot = (r, cp) => {
								if (center) {
									r.append("circle")
										.attr("cx", center[0])
										.attr("cy", center[1])
										.attr("r", 0);
								} else {
									let cont = true;
									let elm = r.append("circle")
										.attr("cx", cp[0])
										.attr("cy", cp[1]);
									(function repeat() {
										cont && elm.attr("r", 0).attr("opacity", 1)
											.transition()
											.duration(3000)
											.ease(d3.easeLinear)
											.attr("opacity", 0)
											.attr("r", 200)
											.on("end", repeat);
									})();
									stopper = () => cont = false;
								}
								r.select("circle")
									.attr("fill", "red")
									.attr("stroke", "red")
									.attr("fill-opacity", 0.2);
							};
							moveDummyPlot = (r, cp) => {
								if (center) {
									r.select("circle").attr("r", Math.sqrt((center[0] - cp[0]) ** 2 + (center[1] - cp[1]) ** 2));
								} else {
									r.select("circle").attr("cx", cp[0]).attr("cy", cp[1]);
								}
							};
							removeDummyPlot = () => stopper && stopper();
						},
						"arc": () => {
							// TODO eclipse curve
							let p1 = null, p2 = null;
							const findCenter = function(p1, p2, cp) {
								if (p1[0] == p2[0] && p1[1] == p2[1]) {
									return [(cp[0] + p1[0]) / 2, (cp[1] + p1[1]) / 2];
								}
								let e = [(p1[0] + cp[0]) / 2, (p1[1] + cp[1]) / 2];
								let f = [(p2[0] + cp[0]) / 2, (p2[1] + cp[1]) / 2];
								let ta = Math.tan(Math.atan2(cp[1] - p1[1], cp[0] - p1[0]) + Math.PI / 2);
								let tb = Math.tan(Math.atan2(p2[1] - cp[1], p2[0] - cp[0]) + Math.PI / 2);
								let cx = (e[1] - f[1] - e[0] * ta + f[0] * tb) / (tb - ta);
								let cy = (Math.abs(ta) < Math.abs(tb)) ? e[1] - (e[0] - cx) * ta : f[1] - (f[0] - cx) * tb;
								return [cx, cy];
							}
							const radiusRange = (p1, p2, cp, c) => {
								const calcRadius = (x, y) => {
									let c = x / Math.sqrt(x * x + y * y);
									let r = Math.acos(c);
									return (y >= 0) ? r : (2 * Math.PI - r);
								}
								let r1 = calcRadius(c[1] - p1[1], p1[0] - c[0]);
								let r2 = calcRadius(c[1] - p2[1], p2[0] - c[0]);
								let rc = calcRadius(c[1] - cp[1], cp[0] - c[0]);
								if ((r1 < rc && r2 < rc) || (r1 > rc && r2 > rc)) {
									return (r1 < r2) ? [r2, r1 + 2 * Math.PI] : [r1, r2 + 2 * Math.PI];
								}
								return (r1 < r2) ? [r1, r2] : [r2, r1];
							}
							handlePoints = (cp) => {
								if (p1 == null) {
									p1 = cp;
									return;
								} else if (p2 == null) {
									p2 = cp;
									return;
								}
								const c = findCenter(p1, p2, cp);
								const rd = Math.sqrt((p1[0] - c[0]) ** 2 + (p1[1] - c[1]) ** 2);
								const rr = radiusRange(p1, p2, cp, c);
								const category = paletteData.mode.child.add.category.category;
								for (let i = paletteData.mode.child.add.number.default; i > 0; i--) {
									const rad = Math.random() * (rr[1] - rr[0]) + rr[0] - Math.PI / 2;
									const p = [Math.cos(rad) * rd, Math.sin(rad) * rd];
									const nr = normal_random(0, paletteData.mode.child.add.noise.default * 5);
									const X = nr[0] + p[0] + c[0];
									const Y = nr[1] + p[1] + c[1];
									manager.datas.push([X, Y], category)
								}
								p1 = p2 = null;
							};
							let stopper = null;
							const plotArc = function(elm, p1, p2, cp) {
								let c = findCenter(p1, p2, cp);
								let rd = Math.sqrt((p1[0] - c[0]) ** 2 + (p1[1] - c[1]) ** 2);

								let rr = radiusRange(p1, p2, cp, c);
								let arc = d3.arc().innerRadius(rd)
									.outerRadius(rd)
									.startAngle(rr[1])
									.endAngle(rr[0]);
								elm.attr("d", arc).attr("transform", "translate(" + c[0] + "," + c[1] + ")");
							};
							initDummyPlot = (r, cp) => {
								stopper && stopper();
								if (p1 == null) {
									let cont = true;
									const elm = r.append("circle").attr("stroke", "red").attr("fill-opacity", 0);
									(function repeat() {
										const rad = Math.random() * 2 * Math.PI;
										cont && elm.attr("cx", 0).attr("cy", 0).attr("r", 0)
											.attr("opacity", 1)
											.transition()
											.duration(3000)
											.ease(d3.easeLinear)
											.attr("opacity", 0)
											.attr("cx", Math.cos(rad) * 200)
											.attr("cy", Math.sin(rad) * 200)
											.attr("r", 200)
											.on("end", repeat);
									})();
									stopper = () => cont = false;
								} else if (p2 == null) {
									const lin = r.append("line")
										.attr("x1", p1[0]).attr("y1", p1[1])
										.attr("x2", cp[0]).attr("y2", cp[1])
										.style("stroke-dasharray", "3, 3")
										.attr("stroke", "red");
									let cont = true;
									const arc = r.append("path").attr("stroke", "red");
									let tgl = true;
									(function repeat() {
										tgl = !tgl;
										cont && arc.attr("opacity", 1)
											.transition()
											.duration(3000)
											.ease(d3.easeLinear)
											.attr("opacity", 0)
											.tween("", function() {
												let elm = d3.select(this);
												return (t) => {
													if (!cont) return
													let size = t * 300 + 1;
													let p2 = [+lin.attr("x2"), +lin.attr("y2")];
													let bc = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
													let v = [bc[0] - p1[0], bc[1] - p1[1]];
													let d = Math.sqrt(v[0] ** 2 + v[1] ** 2);
													if (d == 0) {
														elm.attr("d", null);
														return;
													}
													v = [v[0] / d, v[1] / d];
													let p3 = (tgl) ? [v[1], -v[0]] : [-v[1], v[0]];
													plotArc(elm, p1, p2, [bc[0] + p3[0] * size, bc[1] + p3[1] * size]);
												};
											})
											.on("end", repeat);
									})();
									stopper = () => cont = false;
								} else {
									r.append("path").attr("stroke", "red");
								}
							};
							moveDummyPlot = (r, cp) => {
								if (p1 == null) {
									r.select("circle").attr("transform", "translate(" + cp[0] + "," + cp[1] + ")");
								} else if (p2 == null) {
									r.select("line").attr("x2", cp[0]).attr("y2", cp[1]);
								} else {
									plotArc(r.select("path"), p1, p2, cp);
								}
							};
							removeDummyPlot = () => stopper && stopper();
						},
						"spiral": () => {
							let center = null;
							handlePoints = (cp) => {
								if (center == null) {
									center = cp;
									return;
								}
								const category = paletteData.mode.child.add.category.category;
								const number = paletteData.mode.child.add.number.default;
								const noise = paletteData.mode.child.add.noise.default;
								const turns = paletteData.mode.child.add.pattern.child.spiral.turns.default;

								const c = (center[1] - cp[1]);
								const s = (center[0] - cp[0]);
								for (let i = 0; i < number; i++) {
									let rad = Math.sqrt(Math.random()) * turns * 2 * Math.PI
									let p = [(Math.cos(rad) + rad * Math.sin(rad)) / (2 * Math.PI), (Math.sin(rad) - rad * Math.cos(rad)) / (2 * Math.PI)];
									const nr = normal_random(0, 2 * noise);
									const X = nr[0] + p[0] * c + p[1] * s + center[0];
									const Y = nr[1] - p[0] * s + p[1] * c + center[1];
									manager.datas.push([X, Y], category)
								}
								center = null;
							};
							initDummyPlot = (r, cp) => {
								if (center == null) {
									new DataPoint(r, cp, specialCategory.dummy);
								} else {
									r.append("g").attr("transform", "translate(" + center[0] + ", " + center[1] + ")")
										.append("path")
										.attr("fill-opacity", 0)
										.attr("stroke", "red");
								}
							};
							moveDummyPlot = (r, cp) => {
								if (center == null) {
									r.select("circle").attr("cx", cp[0]).attr("cy", cp[1]);
								} else {
									const turns = paletteData.mode.child.add.pattern.child.spiral.turns.default;
									const line = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveCardinalOpen);
									let np = [];
									const c = (center[1] - cp[1]);
									const s = (center[0] - cp[0]);
									const spl = 10;
									for (let i = -1; i <= spl * turns + 1; i++) {
										let rad = i / spl * 2 * Math.PI
										let p = [(Math.cos(rad) + rad * Math.sin(rad)) / (2 * Math.PI), (Math.sin(rad) - rad * Math.cos(rad)) / (2 * Math.PI)];
										np.push([p[0] * c + p[1] * s, -p[0] * s + p[1] * c]);
									}
									r.select("path").attr("d", line(np));
								}
							};
							removeDummyPlot = null;
						}
					},
					"child": {
						"spiral": [
							{
								"name": "turns",
								"type": "slider",
								"default": 3,
								"range": [1, 10]
							}
						]
					}
				},
				{
					"name": "number",
					"type": "slider",
					"default": 100,
					"range": [1, 1000]
				},
				{
					"name": "noise",
					"type": "slider",
					"default": 5,
					"range": [0, 20]
				}
			],
			"remove": [
				{
					"name": "pattern",
					"type": "list",
					"data": ["point", "all", "circle"],
					"value": "point",
					"click": {
						"point": () => {
							handlePoints = (cp) => {
								if (manager.datas.length > 0) {
									let idx = argmin(manager.datas.points, p => p.vector.distance(new DataVector(cp)));
									manager.datas.splice(idx, 1)
								}
							};
							initDummyPlot = null;
							moveDummyPlot = (r, cp) => {
								r.selectAll("*").remove();
								if (manager.datas.length > 0) {
									let idx = argmin(manager.datas.points, p => p.vector.distance(new DataVector(cp)));
									new DataPoint(r, manager.datas.points[idx].at, specialCategory.dummy);
								}
							};
							removeDummyPlot = null;
						},
						"all": () => {
							handlePoints = (cp) => {
								manager.datas.remove()
							};
							initDummyPlot = (r, cp) => manager.datas.points.forEach(p => new DataPoint(r, p.at, specialCategory.dummy));
							moveDummyPlot = null;
							removeDummyPlot = null;
						},
						"circle": () => {
							handlePoints = (cp) => {
								const size = paletteData.mode.child.remove.pattern.child.circle.size.default;
								let cpv = new DataVector(cp);
								for (let i = manager.datas.length - 1; i >= 0; i--) {
									if (manager.datas.points[i].vector.distance(cpv) <= size) {
										manager.datas.splice(i, 1)
									}
								}
							};
							initDummyPlot = (r, cp) => {
								const size = paletteData.mode.child.remove.pattern.child.circle.size.default;
								r.append("circle")
									.attr("cx", cp[0])
									.attr("cy", cp[1])
									.attr("fill-opacity", "0")
									.attr("stroke", "red")
									.attr("r", size);
								let gin = r.append("g");
								manager.datas.points.forEach(p => {
									if (p.vector.distance(new DataVector(cp)) <= size) {
										new DataPoint(gin, p.at, specialCategory.dummy);
									}
								});
							};
							moveDummyPlot = (r, cp) => {
								const size = paletteData.mode.child.remove.pattern.child.circle.size.default;
								r.select("circle")
									.attr("cx", cp[0])
									.attr("cy", cp[1]);
								let gin = r.select("g");
								gin.selectAll("*").remove();
								manager.datas.points.forEach(p => {
									if (p.vector.distance(new DataVector(cp)) <= size) {
										new DataPoint(gin, p.at, specialCategory.dummy);
									}
								});
							};
							removeDummyPlot = null;
						}
					},
					"child": {
						"circle": [
							{
								"name": "size",
								"type": "slider",
								"default": 50,
								"range": [1, 100]
							}
						]
					}
				}
			],
			"setting": [
				{
					"name": "width",
					"type": "slider",
					"default": 960,
					"step": 10,
					"range": [100, 1000],
					"change": value => {
						d3.select("#plot-area").style("width", value + "px");
					},
					"input": value => {
						d3.select("#plot-area").style("width", value + "px");
					}
				},
				{
					"name": "height",
					"type": "slider",
					"default": 500,
					"step": 10,
					"range": [100, 1000],
					"change": value => {
						d3.select("#plot-area").style("height", value + "px");
					},
					"input": value => {
						d3.select("#plot-area").style("height", value + "px");
					}
				}
			],
			"modify": [
				{
					"name": "op",
					"type": "buttons",
					"data": ["squeeze category"],
					"click": {
						"squeeze category": () => {
							let pm = [];
							let maxCategory = 1;
							for (let i = 0; i < manager.datas.length; i++) {
								if (!pm[manager.datas.y[i]]) pm[manager.datas.y[i]] = maxCategory++;
								manager.datas.at(i).y = pm[manager.datas.y[i]]
							}
						}
					}
				}
			]
		}
	}
];

const setDataProperty = (val) => {
	if (Array.isArray(val)) {
		for (const v of val) {
			if (v.name) {
				val[v.name] = v
			}
			setDataProperty(v)
		}
	} else if (typeof val === 'object') {
		Object.keys(val).forEach(k => {
			setDataProperty(val[k])
		})
	}
}
setDataProperty(paletteData)

Vue.component('paletterow', {
	data: function() {
		return {};
	},
	props: ['pname', 'pdata'],
	template: `
	<div :name="pname">
		<ul>
			<li v-for="pd, i in pdata" class="palette-row" :name="pname + '_' + pd.name">
				<input :id="pd.name" name="menu_input" type="checkbox" class="hide" :key="pname + '_' + pd.name">
				<label :for="pd.name">{{pd.name}}</label>
				<div class="drawer" v-on:mouseenter="remDummyPoint">
					<template v-if="pd.type === 'list'">
						<ul>
							<li v-for="ld, lidx in pd.data" class="item">
								<input type="radio" :name="pname + '_' + pd.name" :value="ld" :id="pname + '_' + pd.name + '_' + ld" class="hide" v-model="pd.value" v-on:click="execClick(pd, ld)"><label :for="pname + '_' + pd.name + '_' + ld">{{ld}}</label>
							</li>
						</ul>
					</template>
					<template v-if="pd.type === 'buttons'">
						<ul>
							<li v-for="ld, lidx in pd.data" class="item">
								<input type="button" :name="pname + '_' + pd.name" :id="pname + '_' + pd.name + '_' + ld" class="hide" v-on:click="execClick(pd, ld)"><label :for="pname + '_' + pd.name + '_' + ld">{{ld}}</label>
							</li>
						</ul>
					</template>
					<template v-else-if="pd.type === 'category'">
						<div style="margin-right: 10px;" v-on:click="delCategory(pd.categories)">-</div>
						<ul>
							<li v-for="cat, cidx in pd.categories" :key="cidx" class="item" :style="{border: (cat ? 'red 2px solid' : null)}">
								<input type="radio" :id="pname + 'category-' + cidx" :name="pname + 'category'" :value="cidx" class="hide" v-on:click="selectCategory(pd, cidx)" :checked="cat"><label :for="pname + 'category-' + cidx" :style="getCategoryStyle(cidx)">{{ cidx }}</label>
							</li>
						</ul>
						<div v-on:click="pd.categories.push(false)">+</div>
					</template>
					<template v-else-if="pd.type === 'slider'">
						<span style="width: 50px">{{pd.default}}</span>
						<input type="range" :max="pd.range[1]" :min="pd.range[0]" :step="pd.step" v-model="pd.default" v-on:change="pd.change && pd.change($event.target.value)" v-on:input="pd.input && pd.input($event.target.value)">
					</template>
				</div>
			</li>
		</ul>
		<template v-for="pd in pdata">
			<template v-if="pd.type === 'list'">
				<template v-if="pd.child[pd.value]">
					<paletterow :pname="pname + '_' + pd.name + '_' + pd.value" :pdata="pd.child[pd.value]"></paletterow>
				</template>
			</template>
		</template>
	</div>
	`,
	created: function() {
		for (const cld of this.pdata.filter(v => v.type === 'list')) {
			this.execClick(cld, cld.value)
		}
	},
	methods: {
		execClick(listData, value) {
			listData.click && listData.click[value] && listData.click[value]()
			if (listData.child && listData.child[value]) {
				for (const cld of listData.child[value].filter(v => v.type === 'list')) {
					this.execClick(cld, cld.value)
				}
			}
		},
		getCategoryStyle(n) {
			const color = getCategoryColor(n)
			return {
				'background-color': color.toString(),
				color: (color.r * 0.3 + color.g * 0.6 + color.b * 0.1) > 127 ? 'black' : 'white'
			}
		},
		selectCategory: function(cb, n) {
			cb.categories.fill(false)
			cb.categories[n] = true
			cb.category = n
			this.$forceUpdate()
		},
		delCategory(categories) {
			if (categories.length > 1) {
				const pitm = categories.pop()
				if (pitm) {
					categories[categories.length - 1] = true
				}
			}
		},
		remDummyPoint() {
			let dummyRange = d3.select("g.dummy-range");
			removeDummyPlot && removeDummyPlot(dummyRange);
			dummyRange.selectAll("*").remove();
		}
	}
});

let app = new Vue({
	el: "#menu",
	data: {
		palette: paletteData
	}
});

let manager

export default (m) => {
	manager = m
}
