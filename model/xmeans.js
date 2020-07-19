class XMeans {
	// https://qiita.com/deaikei/items/8615362d320c76e2ce0b
	// https://www.jstage.jst.go.jp/article/jappstat1971/29/3/29_3_141/_pdf
	constructor() {
		this._centroids = [];
	}

	get centroids() {
		return this._centroids;
	}

	get size() {
		return this._centroids.length;
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0));
	}

	clear() {
		this._centroids = [];
	}

	fit(datas) {
		const clusters = this._split_cluster(datas);
		const centers = [];

		while (clusters.length > 0) {
			const c = clusters.pop();
			if (c.size <= 3) {
				centers.push(c.centroid)
				continue
			}
			const [c1, c2] = this._split_cluster(c.data);
			const beta = Math.sqrt(c1.centroid.reduce((s, v, i) => s + (v - c2.centroid[i]) ** 2, 0) / (c1.cov.det() + c2.cov.det()));
			// http://marui.hatenablog.com/entry/20110516/1305520406
			const norm_cdf = 1 / (1 + Math.exp(-1.7 * beta))
			const alpha = 0.5 / norm_cdf

			const df = c.cols * (c.cols + 3) / 2
			const bic = -2 * (c.size * Math.log(alpha) + c1.llh + c2.llh) + 2 * df * Math.log(c.size);

			if (bic < c.bic) {
				clusters.push(c1, c2)
			} else {
				centers.push(c.centroid)
			}
		}
		this._centroids = centers;
	}

	_split_cluster(datas) {
		const kmeans = new KMeansModel();
		kmeans.add(datas);
		kmeans.add(datas);
		while (kmeans.fit(datas) > 0);
		const p = kmeans.predict(datas);
		const ds = [[], []];
		datas.forEach((d, i) => ds[p[i]].push(d));
		const clusters = [];
		for (let i = 0; i < 2; i++) {
			const mat = Matrix.fromArray(ds[i]);
			const cov = mat.cov();
			const invcov = cov.inv()
			const mean = mat.mean(0);
			const cc = Math.log(1 / Math.sqrt((2 * Math.PI) ** mat.cols * cov.det()))
			let llh = cc * mat.rows;
			for (let i = 0; i < mat.rows; i++) {
				const r = mat.row(i);
				r.sub(mean);
				llh -= r.dot(invcov).dot(r.t).value[0] / 2
			}
			const df = mat.cols * (mat.cols + 3) / 2
			clusters[i] = {
				size: ds[i].length,
				cols: mat.cols,
				data: ds[i],
				cov: cov,
				centroid: kmeans.centroids[i],
				llh: llh,
				bic: -2 * llh + df * Math.log(ds[i].length)
			}
		}
		return clusters;
	}

	predict(datas) {
		if (this._centroids.length == 0) {
			return;
		}
		return datas.map(value => {
			return argmin(this._centroids, v => this._distance(value, v));
		});
	}
}

class XMeansModelPlotter {
	constructor(r, points) {
		this._r = r;
		this._points = points;
		this._centroids = [];
		this._lines = [];
		this._model = new XMeans();
		this._isLoop = false;
		r.append("g").attr("class", "cat_lines");
		r.append("g").attr("class", "centroids");
	}

	terminate() {
		this._r.selectAll(".centroids").remove();
		this._r.selectAll(".cat_lines").remove();
	}

	fit() {
		this._model.fit(this._points.map(p => p.at));
		this._centroids.forEach(c => c.remove());
		this._centroids = this._model.centroids.map((c, i) => {
			const dp = new DataPoint(this._r.select(".centroids"), c, i + 1);
			dp.plotter(DataPointStarPlotter);
			return dp;
		});
	}

	clearCentroids() {
		this._lines.forEach(l => l.remove());
		this._lines = [];
		this._centroids.forEach(c => c.remove());
		this._centroids = [];
		this._model.clear();
	}

	categorizePoints() {
		let pred = this._model.predict(this._points.map(p => p.at));
		this._lines.forEach(l => l.remove());
		this._lines = [];
		this._points.forEach((value, i) =>  {
			this._lines.push(new DataLine(this._r.select(".cat_lines"), value, this._centroids[pred[i]]));
			value.category = this._centroids[pred[i]].category;
		});
	}
}

var dispXMeans = function(elm) {
	const svg = d3.select("svg");

	const kmns = new XMeansModelPlotter(svg, points);
	let isRunning = false;

	elm.select(".buttons")
		.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			kmns.fit();
			kmns.categorizePoints();
			elm.select(".buttons [name=clusternumber]")
				.text(kmns._model.size + " clusters");
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Clear centroid")
		.on("click", () => {
			kmns.clearCentroids();
			elm.select(".buttons [name=clusternumber]")
				.text(kmns._model.size + " clusters");
		});
	return () => {
		isRunning = false;
		kmns.terminate();
	}
}


var xmeans_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, select "k-means" or "k-means++" or "k-medoids" and click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispXMeans(root);

	setting.setTerminate(() => {
		termCallback();
	});
}
