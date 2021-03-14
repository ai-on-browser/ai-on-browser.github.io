class HierarchyClustering {
	constructor(metric = 'euclid') {
		this._root = null;
		this._metric = metric;

		switch (this._metric) {
		case 'euclid':
			this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
			break
		case 'manhattan':
			this._d = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
			break
		case 'chebyshev':
			this._d = (a, b) => a.reduce((s, v, i) => Math.max(s, Math.abs(v - b[i])), -Infinity)
			break;
		}
	}

	fit(points) {
		this._root = new Tree()
		points.forEach((v, i) => {
			this._root.push({
				point: v,
				index: i,
				distances: points.map(p => this._d(v, p))
			});
		});

		const distances = []
		for (let i = 0; i < this._root.length; i++) {
			if (!distances[i]) distances[i] = [];
			for (let j = 0; j < i; j++) {
				if (!distances[i][j]) distances[i][j] = distances[j][i] = this.distance(this._root.at(i), this._root.at(j));
			}
		}
		while (this._root.length > 1) {
			let n = this._root.length;

			let min_i = 0;
			let min_j = 1;
			let min_d = distances[0][1];
			for (let i = 1; i < n; i++) {
				distances[i].forEach((d, j) => {
					if (d < min_d) {
						min_i = i;
						min_j = j;
						min_d = d;
					}
				});
			}
			let min_i_leafs = this._root.at(min_i).leafCount();
			let min_j_leafs = this._root.at(min_j).leafCount();
			distances.forEach((dr, k) => {
				if (k != min_j && k != min_i) {
					dr[min_i] = this.update(min_i_leafs, min_j_leafs, this._root.at(k).leafCount(), dr[min_i], dr[min_j], distances[min_j][min_i]);
					distances[min_i][k] = dr[min_i];
					dr.splice(min_j, 1);
				}
			});
			distances[min_i].splice(min_j, 1);
			distances.splice(min_j, 1);
			this._root.set(min_i, new Tree({
				distance: min_d,
			}, [this._root.at(min_i), this._root.at(min_j)]));
			this._root.removeAt(min_j);
		}
		this._root = this._root.at(0);
	}

	getClusters(number) {
		const scanNodes = [this._root]
		while (scanNodes.length < number) {
			let max_distance = 0;
			let max_distance_idx = -1;
			for (let i = 0; i < scanNodes.length; i++) {
				const node = scanNodes[i];
				if (!node.isLeaf() && node.value.distance > max_distance) {
					max_distance_idx = i;
					max_distance = node.value.distance
				}
			}
			if (max_distance_idx === -1) {
				break
			}
			const max_distance_node = scanNodes[max_distance_idx];
			scanNodes.splice(max_distance_idx, 1, max_distance_node.at(0), max_distance_node.at(1))
		}
		return scanNodes;
	}

	distance(c1, c2) {
		throw new Error('Not Implemented');
	}

	_mean(d) {
		const m = Array(d[0].length).fill(0);
		for (let i = 0; i < d.length; i++) {
			for (let k = 0; k < d[i].length; k++) {
				m[k] += d[i][k]
			}
		}
		return m.map(v => v / d.length);
	}

	_lanceWilliamsUpdater(ala, alb, bt, gm) {
		return (ka, kb, ab) => ala * ka + alb * kb + bt * ab + gm * Math.abs(ka - kb);
	}

	update(ca, cb, ck, ka, kb, ab) {
		throw new Error('Not Implemented');
	}
}

class CompleteLinkageHierarchyClustering extends HierarchyClustering {
	distance(c1, c2) {
		let f1 = c1.leafValues();
		let f2 = c2.leafValues();
		return Math.max.apply(null, f1.map(v1 => {
			return Math.max.apply(null, f2.map(v2 => v1.distances[v2.index]));
		}));
	}

	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(0.5, 0.5, 0, 0.5)(ka, kb, ab)
	}
}

class SingleLinkageHierarchyClustering extends HierarchyClustering {
	distance(c1, c2) {
		let f1 = c1.leafValues();
		let f2 = c2.leafValues();
		let minDistance = Math.min.apply(null, f1.map(v1 => {
			return Math.min.apply(null, f2.map(v2 => v1.distances[v2.index]));
		}));
		return minDistance;
	}

	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(0.5, 0.5, 0, -0.5)(ka, kb, ab)
	}
}

class GroupAverageHierarchyClustering extends HierarchyClustering {
	distance(c1, c2) {
		let f1 = c1.leafValues();
		let f2 = c2.leafValues();
		let totalDistance = f1.reduce((acc1, v1) => {
			return acc1 + f2.reduce((acc2, v2) => acc2 + v1.distances[v2.index], 0);
		}, 0);
		return totalDistance / (f1.length * f2.length);
	}

	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(ca / (ca + cb), cb / (ca + cb), 0, 0)(ka, kb, ab);
	}
}

class WardsHierarchyClustering extends HierarchyClustering {
	distance(c1, c2) {
		let f1 = c1.leafValues().map(f => f.point);
		let f2 = c2.leafValues().map(f => f.point);
		let fs = f1.concat(f2);
		let ave1 = this._mean(f1);
		let ave2 = this._mean(f2);
		let aves = this._mean(fs);
		let e1 = f1.reduce((acc, f) => acc + this._d(f, ave1) ** 2, 0);
		let e2 = f2.reduce((acc, f) => acc + this._d(f, ave2) ** 2, 0);
		let es = fs.reduce((acc, f) => acc + this._d(f, aves) ** 2, 0);
		return es - e1 - e2;
	}

	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater((ck + ca) / (ck + ca + cb), (ck + cb) / (ck + ca + cb), -ck / (ck + ca + cb), 0)(ka, kb, ab);
	}
}

class CentroidHierarchyClustering extends HierarchyClustering {
	distance(c1, c2) {
		let f1 = c1.leafValues().map(f => f.point);
		let f2 = c2.leafValues().map(f => f.point);
		let d = this._d(this._mean(f1), this._mean(f2));
		return d * d;
	}

	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(ca / (ca + cb), cb / (ca + cb), -ca * cb / ((ca + cb) * (ca + cb)), 0)(ka, kb, ab);
	}
}

class WeightedAverageHierarchyClustering extends HierarchyClustering {
	distance(c1, c2) {
		let calcDistRec = function calcDistRec(h1, h2) {
			if (h1.leafCount() == 1 && h2.leafCount() == 1) {
				return h1.value.distances[h2.value.index];
			} else if (h2.leafCount() == 1) {
				return (calcDistRec(h2, h1.at(0)) + calcDistRec(h2, h1.at(1))) / 2;
			} else {
				return (calcDistRec(h1, h2.at(0)) + calcDistRec(h1, h2.at(1))) / 2;
			}
		}
		return calcDistRec(c1, c2);
	}

	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(0.5, 0.5, 0, 0)(ka, kb, ab);
	}
}

class MedianHierarchyClustering extends HierarchyClustering {
	distance(c1, c2) {
		let m1 = this._mean(c1.leafValues().map(f => f.point));
		let m2 = this._mean(c2.leafValues().map(f => f.point));
		let m = m1.map((v, i) => (v + m2[i]) / 2);
		return this._d(m, m2) ** 2;
	}

	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(0.5, 0.5, -0.25, 0)(ka, kb, ab);
	}
}

var dispHierarchy = function(elm, platform) {
	const svg = platform.svg;
	const line = d3.line().x(d => d[0]).y(d => d[1]);

	let clusterClass = null;
	let clusterInstance = null;
	let clusterPlot = null;
	svg.insert("g", ":first-child").attr("class", "grouping");

	const plotLink = (getLinks) => {
		let lines = [];
		const clusters = elm.select("[name=clusternumber]").property("value");
		let category = 1
		clusterInstance.getClusters(clusters).forEach(h => {
			if (h.leafCount() > 1) {
				let lin = [];
				h.scan(node => {
					if (node.leafCount() > 1) {
						if (!node.value.line) {
							node.value.line = getLinks(node.at(0), node.at(1));
						}
						lin = lin.concat(node.value.line);
					} else if (node.isLeaf()) {
						platform.datas.at(node.value.index).y = category;
					}
				});
				lin = lin.map(l => ({
					path: l,
					color: getCategoryColor(category)
				}));
				lines = lines.concat(lin);
			} else {
				platform.datas.at(h.value.index).y = category;
			}
			category += h.leafCount();
		});
		svg.selectAll(".grouping path").remove();
		svg.select(".grouping").selectAll("path")
			.data(lines)
			.enter()
			.append("path")
			.attr("d", d => line(d.path))
			.attr("stroke", d => d.color);
	};
	const plotConvex = function() {
		svg.selectAll(".grouping polygon").remove();
		const clusters = elm.select("[name=clusternumber]").property("value");
		let category = 1
		clusterInstance.getClusters(clusters).forEach(h => {
			if (h.leafCount() > 1) {
				h.scan(node => {
					if (node.value.poly) {
						node.value.poly.remove();
					} else if (node.isLeaf()) {
						platform.datas.at(node.value.index).y = category;
					}
				});
				h.value.poly = new DataConvexHull(svg.select(".grouping"), h.leafs().map(v => platform.datas.points[v.value.index]));
			} else {
				platform.datas.at(h.value.index).y = category;
			}
			category += h.leafCount()
		});
	}
	elm.append("select")
		.on("change", function() {
			var slct = d3.select(this);
			slct.selectAll("option")
				.filter(d => d.value == slct.property("value"))
				.each(d => clusterClass = d.class)
				.each(d => clusterPlot = d.plot);
		})
		.selectAll("option")
		.data([
			{
				value: "Complete Linkage",
				class: CompleteLinkageHierarchyClustering,
				plot: () => {
					plotLink((h1, h2) => {
						let f1 = h1.leafValues();
						let f2 = h2.leafValues();
						let f1BaseDistance = f1.map(v1 => {
							return [v1, f2[argmax(f2, v2 => v1.distances[v2.index])]];
						});
						let target = f1BaseDistance[argmax(f1BaseDistance, v => v[0].distances[v[1].index])];
						return [[target[0].point, target[1].point]];
					});
				}
			},
			{
				value: "Single Linkage",
				class: SingleLinkageHierarchyClustering,
				plot: () => {
					plotLink((h1, h2) => {
						let f1 = h1.leafValues();
						let f2 = h2.leafValues();
						let f1BaseDistance = f1.map(v1 => {
							return [v1, f2[argmin(f2, v2 => v1.distances[v2.index])]];
						});
						let target = f1BaseDistance[argmin(f1BaseDistance, v => v[0].distances[v[1].index])];
						return [[target[0].point, target[1].point]];
					});
				}
			},
			{
				value: "Group Average",
				class: GroupAverageHierarchyClustering,
				plot: () => plotConvex()
			},
			{
				value: "Ward's",
				class: WardsHierarchyClustering,
				plot: () => plotConvex()
			},
			{
				value: "Centroid",
				class: CentroidHierarchyClustering,
				plot: () => plotConvex()
			},
			{
				value: "Weighted Average",
				class: WeightedAverageHierarchyClustering,
				plot: () => plotConvex()
			},
			{
				value: "Median",
				class: MedianHierarchyClustering,
				plot: () => plotConvex()
			}
		])
		.enter()
		.append("option")
		.attr("value", d => d.value)
		.text(d => d.value)
		.each((d, i) => (i == 0) && (clusterClass = d.class))
		.each((d, i) => (i == 0) && (clusterPlot = d.plot));
	elm.append("select")
		.attr("name", "metric")
		.selectAll("option")
		.data([
			"euclid",
			"manhattan",
			"chebyshev"
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			if (clusterClass) {
				platform.datas.scale = 1
				const metric = elm.select("[name=metric]").property("value");
				clusterInstance = new clusterClass(metric);
				clusterInstance.fit(platform.datas.x);
				elm.selectAll("[name^=clusternumber]")
					.attr("max", platform.datas.length)
					.property("value", platform.datas.length)
					.attr("disabled", null)
				svg.selectAll("path").remove();
				svg.selectAll(".grouping *").remove();
				clusterPlot();
			}
		});

	elm.append("span")
		.text("Cluster #")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "clusternumbeript")
		.attr("min", 1)
		.attr("max", 1)
		.attr("value", 1)
		.attr("disabled", "disabled")
		.on("change", function() {
			elm.select("[name=clusternumber]").property("value", d3.select(this).property("value"))
			clusterPlot();
		})
	elm.append("input")
		.attr("type", "range")
		.attr("name", "clusternumber")
		.attr("min", 1)
		.attr("disabled", "disabled")
		.on("change", function() {
			elm.select("[name=clusternumbeript]").property("value", d3.select(this).property("value"))
			clusterPlot();
		})
		.on("input", function() {
			elm.select("[name=clusternumbeript]").property("value", d3.select(this).property("value"))
		})
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, select distance type and click "Initialize". Finally, select cluster number.'
	dispHierarchy(platform.setting.ml.configElement, platform);
	platform.setting.terminate = () => {
		d3.selectAll("svg .grouping").remove();
	};
}
