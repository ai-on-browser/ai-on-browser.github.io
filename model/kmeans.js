export class KMeansModel {
	constructor(method = null) {
		this._centroids = [];
		this._method = method || new KMeans();
	}

	get centroids() {
		return this._centroids;
	}

	get size() {
		return this._centroids.length;
	}

	get method() {
		return this._method;
	}

	set method(m) {
		this._method = m;
	}

	_distance(a, b) {
		let v = 0
		for (let i = a.length - 1; i >= 0; i--) {
			v += (a[i] - b[i]) ** 2
		}
		return Math.sqrt(v)
	}

	add(datas) {
		const cpoint = this._method.add(this._centroids, datas);
		this._centroids.push(cpoint);
		return cpoint;
	}

	clear() {
		this._centroids = [];
	}

	predict(datas) {
		if (this._centroids.length === 0) {
			return;
		}
		return datas.map(value => {
			return argmin(this._centroids, v => this._distance(value, v));
		});
	}

	fit(datas) {
		if (this._centroids.length === 0 || datas.length === 0) {
			return 0;
		}
		const oldCentroids = this._centroids;
		this._centroids = this._method.move(this, this._centroids, datas);
		const d = oldCentroids.reduce((s, c, i) => s + this._distance(c, this._centroids[i]), 0);
		return d;
	}
}

export class KMeans {
	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	add(centroids, datas) {
		while (true) {
			const p = datas[Math.floor(Math.random() * datas.length)]
			if (Math.min.apply(null, centroids.map(c => this._distance(p, c))) > 1.0e-8) {
				return p.concat();
			}
		}
	}

	_mean(d) {
		const n = d.length
		const t = d[0].length
		const m = Array(t).fill(0);
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < t; k++) {
				m[k] += d[i][k]
			}
		}
		return m.map(v => v / n);
	}

	move(model, centroids, datas) {
		let pred = model.predict(datas);
		return centroids.map((c, k) => {
			let catpoints = datas.filter((v, i) => pred[i] === k);
			return this._mean(catpoints)
		});
	}
}

export class KMeanspp extends KMeans {
	add(centroids, datas) {
		if (centroids.length == 0) {
			return datas[Math.floor(Math.random() * datas.length)]
		}
		const d = datas.map(d => Math.min.apply(null, centroids.map(c => this._distance(d, c))) ** 2);
		const s = d.reduce((acc, v) => acc + v, 0);
		let r = Math.random() * s;
		for (var i = 0; i < d.length; i++) {
			if (r < d[i]) {
				return datas[i];
			}
			r -= d[i];
		}
	}
}

class KMedoids extends KMeans {
	move(model, centroids, datas) {
		let pred = model.predict(datas);
		return centroids.map((c, k) => {
			let catpoints = datas.filter((v, i) => pred[i] === k);
			if (catpoints.length > 0) {
				let i = argmin(catpoints, cp => {
					return catpoints.map(cq => this._distance(cq, cp)).reduce((acc, d) => acc + d, 0);
				});
				return catpoints[i];
			} else {
				return c;
			}
		});
	}
}

class SemiSupervisedKMeansModel extends KMeansModel {
	// https://arxiv.org/abs/1307.0252
	constructor() {
		super(null)
	}

	_mean(d) {
		const n = d.length
		const t = d[0].length
		const m = Array(t).fill(0);
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < t; k++) {
				m[k] += d[i][k]
			}
		}
		return m.map(v => v / n);
	}

	init(datas, labels) {
		this.clear()
		const classes = [...new Set(labels.filter(v => v > 0))]
		for (let k = 0; k < classes.length; k++) {
			const labeledDatas = datas.filter((v, i) => labels[i] === k + 1)
			this._centroids.push(this._mean(labeledDatas))
		}
	}

	add() {}

	fit(datas, labels) {
		if (this._centroids.length === 0 || datas.length === 0) {
			return 0;
		}
		const oldCentroids = this._centroids;
		const pred = this.predict(datas);
		for (let i = 0; i < labels.length; i++) {
			if (labels[i] > 0 && labels[i] <= this._centroids.length) {
				pred[i] = labels[i] - 1
			}
		}
		this._centroids = this._centroids.map((c, k) => {
			const catpoints = datas.filter((v, i) => pred[i] === k);
			return this._mean(catpoints)
		})
		const d = oldCentroids.reduce((s, c, i) => s + this._distance(c, this._centroids[i]), 0);
		return d;
	}
}

var dispKMeans = function(elm, platform) {
	const model = platform.task === 'SC' ? new SemiSupervisedKMeansModel() : new KMeansModel();

	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.init()
		if (platform.task !== 'SC') {
			model.clear()
			elm.select("[name=clusternumber]")
				.text(model.size + " clusters");
		} else {
			platform.fit((tx, ty, pred_cb) => {
				model.init(tx, ty.map(v => v[0]))
				const pred = model.predict(tx)
				pred_cb(pred.map(v => v + 1))
			})
			platform.centroids(model.centroids, model.centroids.map((c, i) => i + 1), {line: true})
		}
	})
	if (platform.task !== 'SC') {
		elm.append("select")
			.on("change", function() {
				const slct = d3.select(this);
				slct.selectAll("option")
					.filter(d => d["value"] == slct.property("value"))
					.each(d => model.method = new d["class"]());
			})
			.selectAll("option")
			.data([
				{
					"value": "k-means",
					"class": KMeans
				},
				{
					"value": "k-means++",
					"class": KMeanspp
				},
				{
					"value": "k-medoids",
					"class": KMedoids
				}
			])
			.enter()
			.append("option")
			.attr("value", d => d["value"])
			.text(d => d["value"]);
		elm.append("input")
			.attr("type", "button")
			.attr("value", "Add centroid")
			.on("click", () => {
				platform.fit((tx, ty, pred_cb) => {
					model.add(tx)
					const pred = model.predict(tx)
					pred_cb(pred.map(v => v + 1))
				})
				platform.centroids(model.centroids, model.centroids.map((c, i) => i + 1), {line: true})
				elm.select("[name=clusternumber]")
					.text(model.size + " clusters");
			});
		elm.append("span")
			.attr("name", "clusternumber")
			.style("padding", "0 10px")
			.text("0 clusters");
	}
	slbConf.step(cb => {
		if (model.size == 0) {
			cb && cb()
			return
		}
		platform.fit((tx, ty, pred_cb) => {
			model.fit(tx, ty.map(v => v[0]))
			const pred = model.predict(tx)
			pred_cb(pred.map(v => v + 1))
		})
		platform.centroids(model.centroids, model.centroids.map((c, i) => i + 1), {
			line: true,
			duration: 1000
		})
		cb && setTimeout(cb, 1000)
	})
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Skip")
		.on("click", () => {
			platform.fit((tx, ty, pred_cb) => {
				ty = ty.map(v => v[0])
				while (model.fit(tx, ty) > 1.0e-8);
				const pred = model.predict(tx)
				pred_cb(pred.map(v => v + 1))
			})
			platform.centroids(model.centroids, model.centroids.map((c, i) => i + 1), {
				line: true,
				duration: 1000
			})
		})
	slbConf.enable = platform.task !== 'SC'
	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	if (platform.task !== 'SC') {
		platform.setting.ml.usage = 'Click and add data point. Next, select "k-means" or "k-means++" or "k-medoids" and click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	} else {
		platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	}
	platform.setting.terminate = dispKMeans(platform.setting.ml.configElement, platform)
	platform.setting.ml.detail = `
$ S_i $ as a set of datas in $ i $th cluster, the objective is to find
$$
  \\argmin_S \\sum_{i=1}^k \\sum_{x \\in S_i} \\| x - \\mu_i \\|^2
$$
where $ \\mu_i $ is the mean of points in $ S_i $.
<br>
The algorithm is simple.
<ol>
<li>Initialize $ \\mu_i $.</li>
<li>Assign the datas to the cluster $ S_i $ with the nearest mean $ \\mu_i $.</li>
<li>Update $ \\mu_i $.
$$
\\mu_i = \\frac{1}{|S_i|} \\sum_{x \\in S_i} x
$$
</li>
<li>Finish if $ \\mu_i $ does not change. Otherwise, go back to step 2.</li>
</ol>
`
}

