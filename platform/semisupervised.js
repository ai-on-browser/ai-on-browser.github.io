import { BasePlatform } from './base.js'

export default class SemisupervisedPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager);

		const elm = this.setting.task.configElement
		elm.append("div").text("Unlabeled data category is '0' (black).")
		elm.append("span").text("Unlabeled Rate")
		elm.append("input")
			.attr("type", "number")
			.attr("min", 0)
			.attr("max", 1)
			.attr("value", 0.9)
			.attr("step", 0.1)
			.attr("name", "unlabeled-rate")
			.on("change", () => {
				if (this.datas && this._original_classes) {
					for (let i = 0; i < this._original_classes.length; i++) {
						this.datas.at(i).y = this._original_classes[i]
					}
				}
				this._original_classes = null
				this.init()
			})
	}

	fit(fit_cb, scale = 1000) {
		this.datas.scale = 1 / scale
		const tx = this.datas.x;
		const ty = this.datas.y.map(p => [p]);
	
		fit_cb(tx, ty, pred => {
			this._r_task.selectAll("*").remove()
			console.log(pred)
	
			pred.forEach((v, i) => {
				const o = new DataCircle(this._r_task, this.datas._renderer.points[i])
				o.color = getCategoryColor(v)
			})
		})
	}

	predict(cb, step = 10, scale = 1000) {
		this.datas.scale = 1 / scale
		const [tiles, plot] = this.datas._renderer.predict(step)
		if (this._task === "SC") {
			tiles.push(...this.datas.x)
		}
		cb(tiles, pred => {
			if (this._task === "SC") {
				const p = pred.slice(tiles.length - this.datas.length)
				const t = this.datas.y
				pred = pred.slice(0, tiles.length - this.datas.length)
				if (this._task === "SC") {
					let acc = 0
					for (let i = 0; i < t.length; i++) {
						if (t[i] === p[i]) {
							acc++
						}
					}
					this.setting.footer.text("Accuracy:" + (acc / t.length))
				}
			}
			plot(pred, this._r_tile)
		})
	}

	init() {
		this._r?.remove()
		this._r = this.svg.insert("g", ":first-child")
			.classed("default-render", true);
		this._r_task = this._r.append("g").classed("tasked-render", true)
		this._r_tile = this._r.append("g").classed("tile-render", true).attr("opacity", 0.5)
		this.setting.footer.text("")

		const elm = this.setting.task.configElement
		const r = +elm.select("[name=unlabeled-rate]").property("value")
		if (r > 0 && !this._original_classes) {
			this._original_classes = this.datas.y.concat()
			const class_idx = {}
			for (let i = 0; i < this.datas.length; i++) {
				if (!class_idx[this._original_classes[i]]) {
					class_idx[this._original_classes[i]] = []
				}
				class_idx[this._original_classes[i]].push(i)
			}
			for (const k of Object.keys(class_idx)) {
				let c = Math.floor(class_idx[k].length * r)
				while (c > 0) {
					const idx = Math.floor(Math.random() * class_idx[k].length)
					this.datas.at(class_idx[k][idx]).y = 0
					class_idx[k].splice(idx, 1)
					c--
				}
			}
		}

		this.render()
	}

	render() {
		this.datas?._renderer.render()
	}

	terminate() {
		if (this.datas && this._original_classes) {
			for (let i = 0; i < this._original_classes.length; i++) {
				this.datas.at(i).y = this._original_classes[i]
			}
		}

		this._r?.remove();
		this.svg.selectAll("g").style("visibility", null);
		const elm = this.setting.task.configElement
		elm.selectAll("*").remove()
		this.setting.footer.text("")
	}
}
