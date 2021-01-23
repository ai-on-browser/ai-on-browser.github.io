const LinearDiscriminantAnalysis = function(x, t, rd = 0) {
	// https://axa.biopapyrus.jp/machine-learning/preprocessing/lda.html
	const d = x.cols;
	const n = x.rows;
	let c = {};
	let cn = 0;
	for (let i = 0; i < n; i++) {
		if (c[t[i]] === undefined) c[t[i]] = cn++;
		t[i] = c[t[i]];
	}

	const mean = x.mean(0).value;
	let cmean = [];
	for (let i = 0; i < cn; cmean[i++] = Array(d).fill(0));
	let cnum = Array(cn).fill(0);
	for (let k = 0; k < n; k++) {
		cnum[t[k]]++;
		for (let j = 0; j < d; j++) {
			cmean[t[k]][j] += x.at(k, j);
		}
	}
	for (let i = 0; i < cn; i++) {
		for (let j = 0; j < d; j++) {
			cmean[i][j] /= cnum[i];
		}
	}

	let w = [];
	for (let i = 0; i < d; w[i++] = []);
	for (let i = 0; i < d; i++) {
		for (let j = 0; j <= i; j++) {
			let v = 0;
			for (let k = 0; k < n; k++) {
				v += (x.at(k, i) - cmean[t[k]][i]) * (x.at(k, j) - cmean[t[k]][j]);
			}
			w[i][j] = w[j][i] = v / n;
		}
	}
	w = new Matrix(d, d, w);

	let b = [];
	for (let i = 0; i < d; b[i++] = []);
	for (let i = 0; i < d; i++) {
		for (let j = 0; j <= i; j++) {
			let v = 0;
			for (let k = 0; k < cn; k++) {
				v += (cmean[k][i] - mean[i]) * (cmean[k][j] - mean[j]) * cnum[k];
			}
			b[i][j] = b[j][i] = v / n;
		}
	}
	b = new Matrix(d, d, b);

	let cov = w.slove(b);
	let ev = cov.eigenVectors();
	if (rd > 0 && rd < ev.cols) {
		ev = ev.resize(ev.rows, rd);
	}
	return x.dot(ev);
}

var dispLDA = function(elm, platform) {
	const setting = platform.setting
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					const tx_mat = Matrix.fromArray(tx);
					const dim = setting.dimension;
					let y = LinearDiscriminantAnalysis(tx_mat, ty, dim);
					pred_cb(y.toArray());
				}
			);
		});
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Next, click "Fit" button.'
	dispLDA(platform.setting.ml.configElement, platform);
}
