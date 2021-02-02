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

class GBDTClassifier {
	constructor(x, y, maxdepth = 1, learningrate = 0.1) {
		this._x = x
		this._cls = [...new Set(y)]
		this._y = Matrix.zeros(y.length, this._cls.length)
		for (let i = 0; i < this._y.rows; i++) {
			this._y.set(i, this._cls.indexOf(y[i]), 1)
		}
		const tree = new DecisionTreeRegression(x, this._y.toArray())
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
		const tree = new DecisionTreeRegression(this._x, this._loss.toArray())
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
		return p.argmax(1).copyMap(v => this._cls[v])
	}
}

var dispGBDT = function(elm, platform) {
	const task = platform.task
	let model = null
	const fitModel = (cb) => {
		const lr = elm.select("[name=lr]").property("value")
		const md = elm.select("[name=maxd]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			if (!model) {
				if (task === "CF") {
					model = new GBDTClassifier(tx, ty.map(v => v[0]), md, lr)
				} else {
					model = new GBDT(tx, ty, md, lr)
				}
			}
			model.fit();
			elm.select("[name=epoch]").text(model.size);

			let pred = model.predict(px).value;
			pred_cb(pred);
			cb && cb()
		}, 4);
	};

	elm.append("span")
		.text(" max depth = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "maxd")
		.attr("value", 1)
		.attr("min", 1)
		.attr("max", 10)
	elm.append("span")
		.text(" lr = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "lr")
		.attr("value", 0.1)
		.attr("min", 0.1)
		.attr("max", 10)
		.attr("step", 0.1)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			elm.select("[name=epoch]").text(0);
			platform.init()
		})
	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", fitModel)
	let isRunning = false;
	const runButton = elm.append("input")
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
	elm.append("span")
		.text(" Epoch: ");
	elm.append("span")
		.attr("name", "epoch");
	return () => {
		isRunning = false
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.terminate = dispGBDT(platform.setting.ml.configElement, platform);
}

