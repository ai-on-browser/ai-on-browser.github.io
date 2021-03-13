import { MDS } from './mds.js'

const warshallFloyd = d => {
	const n = d.rows
	for (let k = 0; k < n; k++) {
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const dij = d.at(i, j)
				const dikj = d.at(i, k) + d.at(k, j)
				if (dij > dikj) {
					d.set(i, j, dikj)
				}
			}
		}
	}
}

const Isomap = function(x, rd = 1, neighbors = 0) {
	// https://en.wikipedia.org/wiki/Isomap
	const n = x.rows;
	const d = x.cols;
	const near = neighbors;
	const N = new Matrix(n, n);
	for (let i = 0; i < n; i++) {
		N._value[i * n + i] = 0
		for (let j = i + 1; j < n; j++) {
			let t = 0;
			for (let k = 0; k < d; k++) {
				t += (x.at(i, k) - x.at(j, k)) ** 2
			}
			N._value[i * n + j] = N._value[j * n + i] = Math.sqrt(t);
		}
	}

	if (near > 0) {
		for (let i = 0; i < n; i++) {
			const v = []
			for (let j = 0; j < n; j++) {
				if (i === j) continue;
				v.push([N._value[i * n + j], j])
			}
			v.sort((a, b) => a[0] - b[0]);
			for (let j = near; j < n - 1; j++) {
				N._value[i * n + v[j][1]] = Infinity;
			}
		}

		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				N._value[i * n + j] = N._value[j * n + i] = Math.min(N._value[i * n + j], N._value[j * n + i])
			}
		}
	}

	warshallFloyd(N)

	return MDS(N, rd, true)
}

var dispIsomap = function(elm, platform) {
	const fitModel = (cb) => {
		const neighbors = +elm.select("[name=neighbors]").property("value")
		platform.fit(
			(tx, ty, pred_cb) => {
				const tx_mat = Matrix.fromArray(tx);

				const dim = platform.dimension
				let y = Isomap(tx_mat, dim, neighbors);
				pred_cb(y.toArray());
			}
		);
	};

	elm.append("span")
		.text(" neighbors = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "neighbors")
		.attr("value", 10)
		.attr("min", 0)
		.attr("max", 10000)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispIsomap(platform.setting.ml.configElement, platform);
}
