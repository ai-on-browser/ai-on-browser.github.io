const MDS = function(x, rd = 1) {
	// http://yuki-koyama.hatenablog.com/entry/2015/07/13/015736
	const d = x.cols
	const n = x.rows
	const D = new Matrix(n, n)
	for (let i = 0; i < n; i++) {
		D.set(i, i, 0)
		for (let j = i + 1; j < n; j++) {
			let s = 0
			for (let k = 0; k < d; k++) {
				s += (x.at(i, k) - x.at(j, k)) ** 2
			}
			D.value[i * d + j] = D.value[j * d + i] = Math.sqrt(s)
		}
	}

	//const H = Matrix.eye(n, n)
	//H.sub(1 / n)
	//const K = H.dot(D).dot(H)
	//K.mult(-0.5)
	//console.log(K)

	let m = D.mean(0)
	D.sub(m)
	m = D.mean(1)
	D.sub(m)
	D.mult(-0.5)
	const K = D

	let eval = K.eigenValues()
	const evec = new Matrix(n, rd)
	for (let k = 0; k < rd; k++) {
		evec.set(0, k, K.eigenVectorInverseIteration(eval[k]))
	}
	//let [eval, evec] = K.eigenJacobi()
	//eval = eval.slice(0, rd)
	//evec = evec.slice(0, 0, null, rd)
	for (let i = 0; i < n; i++) {
		for (let k = 0; k < rd; k++) {
			evec.set(i, k, evec.at(i, k) * Math.sqrt(eval[k]) || 0)
		}
	}
	return evec
}

var dispMDS1to2 = function(elm) {
	const svg = d3.select("svg");
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	const fitModel = (cb) => {
		FittingMode.DR.fit(svg, points, null,
			(tx, ty, px, pred_cb) => {
				const tx_mat = new Matrix(tx.length, 1, tx);

				const dim = +elm.select(".buttons [name=dimension]").property("value")
				let y = MDS(tx_mat, dim).value;
				pred_cb(y);
			}
		);
	};

	elm.select(".buttons")
		.append("span")
		.text(" Dimension ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "dimension")
		.attr("max", 2)
		.attr("min", 1)
		.attr("value", 2)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}


var mds_1to2_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispMDS1to2(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
	});
}
