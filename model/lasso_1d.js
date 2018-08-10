class Lasso1dWorker extends BaseWorker {
	constructor(classes) {
		super('model/lasso_worker.js');
	}

	initialize(in_dim, out_dim, lambda = 0.1, method = "CD") {
		this._postMessage({
			"mode": "init",
			"in_dim": in_dim,
			"out_dim": out_dim,
			"lambda": lambda,
			"method": method
		});
	}

	fit(train_x, train_y, iteration, cb) {
		this._postMessage({
			"mode": "fit",
			"x": train_x,
			"y": train_y,
			"iteration": iteration
		}, cb);
	}

	predict(x, cb) {
		this._postMessage({
			"mode": "predict",
			"x": x
		}, cb);
	}
}

var dispLasso1d = function(elm) {
	const svg = d3.select("svg");
	const reg_path = svg.insert("g", ":first-child").classed("tile", true).append("path").attr("stroke", "black").attr("fill-opacity", 0);
	const step = 100;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	const line = d3.line().x(d => d[0]).y(d => d[1]);
	let model = new Lasso1dWorker();
	let isRunning = false;
	let epoch = 0;

	const fitModel = (cb) => {
		let x = points.map(p => [p.at[0] / width]);
		let t = points.map(p => [p.at[1] / height]);
		model.fit(x, t, 1, () => {
			let ps = [];
			for (let i = 0; i < width; i += step) {
				ps.push([i / width]);
			}
			ps.push([1]);
			model.predict(ps, (e) => {
				let y = e.data;

				let p = ps.map((v, i) => [v[0] * width, y[i] * height]);

				reg_path.attr("d", line(p));
				elm.select(".buttons [name=epoch]").text(epoch += 1);

				cb && cb();
			});
		});
	};

	elm.select(".buttons")
		.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["CD", "ISTA"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("span")
		.text("lambda = ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "lambda")
		.selectAll("option")
		.data([0.0001, 0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model.initialize(1, 1, +elm.select(".buttons [name=lambda]").property("value"), elm.select(".buttons [name=method]").property("value"));
			reg_path.attr("d", null);
			elm.select(".buttons [name=epoch]").text(epoch = 0);
		});
	const fitButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			fitButton.property("disabled", isRunning);
			if (isRunning) {
				(function stepLoop() {
					if (isRunning) {
						fitModel(() => setTimeout(stepLoop, 0));
					}
				})();
			}
		});
	elm.select(".buttons")
		.append("span")
		.text(" epoch: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "epoch");

	return () => {
		isRunning = false;
		model.terminate();
	}
}


var lasso_1d_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispLasso1d(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	});
}
