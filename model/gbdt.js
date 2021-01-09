import { DecisionTreeRegression } from './decision_tree.js'

class GBDT {
	// https://www.acceluniverse.com/blog/developers/2019/12/gbdt.html
	constructor(x, y, maxdepth = 1, learningrate = 0.1) {
		this._x = x
		this._y = Matrix.fromArray(y)
		const tree = new DecisionTreeRegression(x, this._y.value)
		this._trees = [tree]
		this._lr = learningrate
		this._maxd = maxdepth
		for (let i = 0; i < this._maxd; i++) {
			tree.fit()
		}
		this._loss = this._y.copySub(Matrix.fromArray(tree.predict(this._x)))
	}

	get size() {
		return this._trees.length
	}

	fit() {
		const tree = new DecisionTreeRegression(this._x, this._loss.value)
		for (let i = 0; i < this._maxd; i++) {
			tree.fit()
		}
		this._trees.push(tree)

		const p = Matrix.fromArray(tree.predict(this._x))
		p.mult(this._lr)
		this._loss.sub(p)
	}

	predict(x) {
		const ps = this._trees.map(t => Matrix.fromArray(t.predict(x)))
		const p = ps[0]
		for (let i = 1; i < ps.length; i++) {
			ps[i].mult(this._lr)
			p.add(ps[i])
		}
		return p
	}
}

var dispGBDT = function(elm, platform) {
	let model = null
	const fitModel = (cb) => {
		const lr = elm.select(".buttons [name=lr]").property("value")
		const md = elm.select(".buttons [name=maxd]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			if (!model) {
				model = new GBDT(tx, ty, md, lr)
			}
			model.fit();
			elm.select(".buttons [name=epoch]").text(model.size);

			let pred = model.predict(px).value;
			pred_cb(pred);
			cb && cb()
		}, 4);
	};

	elm.select(".buttons")
		.append("span")
		.text(" max depth = ")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "maxd")
		.attr("value", 1)
		.attr("min", 1)
		.attr("max", 10)
	elm.select(".buttons")
		.append("span")
		.text(" lr = ")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "lr")
		.attr("value", 0.1)
		.attr("min", 0.1)
		.attr("max", 10)
		.attr("step", 0.1)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			elm.select(".buttons [name=epoch]").text(0);
			platform.init()
		})
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", fitModel)
	let isRunning = false;
	const runButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			runButton.attr("value", (isRunning) ? "Stop" : "Run");
			if (isRunning) {
				(function stepLoop() {
					if (isRunning) {
						fitModel(() => setTimeout(stepLoop, 0));
					}
					stepButton.property("disabled", isRunning);
					runButton.property("disabled", false);
				})();
			} else {
				runButton.property("disabled", true);
			}
		});
	elm.select(".buttons")
		.append("span")
		.text(" Epoch: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "epoch");
}

export default function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispGBDT(root, platform);
}

