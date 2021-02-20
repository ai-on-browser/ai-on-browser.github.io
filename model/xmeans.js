import { KMeansModel, KMeansModelPlotterBase } from './kmeans.js'

class XMeans {
	// https://qiita.com/deaikei/items/8615362d320c76e2ce0b
	// https://www.jstage.jst.go.jp/article/jappstat1971/29/3/29_3_141/_pdf
	constructor() {
		this._centroids = [];
		this._init_k = 2;
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

	fit(datas, iterations = -1) {
		let clusters = null;
		if (this._centroids.length === 0) {
			clusters = this._split_cluster(datas, this._init_k);
			iterations--
		} else {
			clusters = this._create_clusters(this, datas);
		}
		const centers = [];

		while (clusters.length > 0 && (iterations < 0 || iterations-- > 0)) {
			const new_clusters = [];
			while (clusters.length > 0) {
				const c = clusters.shift();
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
					new_clusters.push(c1, c2)
				} else {
					centers.push(c.centroid)
				}
			}
			clusters = new_clusters;
		}
		if (clusters.length > 0) {
			centers.push(...clusters.map(c => c.centroid))
		}
		this._centroids = centers;
	}

	_split_cluster(datas, k = 2) {
		const kmeans = new KMeansModel();
		for (let i = 0; i < k; i++) {
			kmeans.add(datas);
		}
		while (kmeans.fit(datas) > 0);
		return this._create_clusters(kmeans, datas);
	}

	_create_clusters(model, datas) {
		const k = model.size;
		const p = model.predict(datas);
		const ds = [];
		for (let i = 0; i < k; ds[i++] = []);
		datas.forEach((d, i) => ds[p[i]].push(d));
		const clusters = [];
		for (let i = 0; i < k; i++) {
			const mat = Matrix.fromArray(ds[i]);
			const cov = mat.cov();
			const invcov = cov.inv()
			const mean = mat.mean(0);
			const cc = Math.log(1 / Math.sqrt((2 * Math.PI) ** mat.cols * cov.det()))
			let llh = cc * mat.rows;
			for (let j = 0; j < mat.rows; j++) {
				const r = mat.row(j);
				r.sub(mean);
				llh -= r.dot(invcov).dot(r.t).value[0] / 2
			}
			const df = mat.cols * (mat.cols + 3) / 2
			clusters[i] = {
				size: ds[i].length,
				cols: mat.cols,
				data: ds[i],
				cov: cov,
				centroid: model.centroids[i],
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

class XMeansModelPlotter extends KMeansModelPlotterBase {
	constructor(r, datas) {
		super(r, datas)
		datas.scale = 1 / 500
		this._model = new XMeans();
	}
}

var dispXMeans = function(elm, platform) {
	const svg = platform.svg;

	const kmns = new XMeansModelPlotter(svg, platform.datas);
	let isRunning = false;

	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			kmns.fit();
			kmns.categorizePoints();
			elm.select("[name=clusternumber]")
				.text(kmns._model.size + " clusters");
		});
	elm.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Clear centroid")
		.on("click", () => {
			kmns.clearCentroids();
			elm.select("[name=clusternumber]")
				.text(kmns._model.size + " clusters");
		});
	return () => {
		isRunning = false;
		kmns.terminate();
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.terminate = dispXMeans(platform.setting.ml.configElement, platform);
}
