import { RLIntRange, RLEnvironmentBase } from './base.js'

const argmax = function (arr, key) {
	if (arr.length === 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.max(...arr))
}

export default class GridMazeRLEnvironment extends RLEnvironmentBase {
	constructor(platform) {
		super(platform)
		this._points = [];
		this._dim = 2
		this._size = [20, 10];
		this._position = Array(this._dim).fill(0);
		this._max_step = 0;

		this._reward = {
			step: -1,
			wall: -2,
			goal: 5,
			fail: -100
		}

		this._q = null;

		this._show_max = false
		this.__map = null
		this._render_blocks = []
		this._init_menu();
	}

	get size() {
		return this._size;
	}

	get actions() {
		return (this._dim === 1) ? [[0, 1]] : [[0, 1, 2, 3]];
	}

	get _action_move() {
		return this._dim === 1 ? [[1], [-1]] : [[1, 0], [0, 1], [-1, 0], [0, -1]];
	}

	get _action_str() {
		return this._dim === 1 ? ["→", "←"] : ["→", "↓", "←", "↑"];
	}

	get states() {
		const st = [];
		for (let i = 0; i < this._dim; i++) {
			st.push(new RLIntRange(0, this._size[i] - 1));
		}
		return st;
	}

	get map() {
		if (!this.__map) {
			this.__map = [];
			for (let i = 0; i < this._size[0]; i++) {
				this.__map[i] = Array(this._size[1]);
			}
		}
		for (let i = 0; i < this._size[0]; i++) {
			this.__map[i].fill(false);
		}

		const idx = this._size[0] / this.platform.width;
		const idy = this._size[1] / this.platform.height;
		for (const p of this._points) {
			const x = Math.floor(p[0] * idx);
			const y = Math.floor(p[1] * idy);
			this.__map[x][y] = !this.__map[x][y];
		}
		this.__map[0][0] = false;
		this.__map[this._size[0] - 1][this._size[1] - 1] = false;
		return this.__map;
	}

	set reward(value) {
		this._reward = {
			step: -1,
			wall: -2,
			goal: 5,
			fail: -100
		}
		if (value === 'achieve') {
			const _this = this
			this._reward = {
				get step() {
					return Math.sqrt(_this._position[0] ** 2 + _this._position[1] ** 2)
				},
				wall: 0,
				goal: 0,
				fail: 0
			}
		}
	}

	_init_menu() {
		const r = this.setting.rl.configElement
		r.selectAll("*").remove()
		r.append("span").text("Columns ")
		r.append("input")
			.attr("type", "number")
			.attr("name", "columns")
			.attr("min", 1)
			.attr("max", 50)
			.attr("value", this._size[0])
			.on("change", () => {
				this._size[0] = +r.select("[name=columns]").property("value")
				this.__map = null;
				this.platform.init()
				this.setting.ml.refresh()
			})
		r.append("span").text(" Rows ")
		r.append("input")
			.attr("type", "number")
			.attr("name", "rows")
			.attr("min", 1)
			.attr("max", 50)
			.attr("value", this._size[1])
			.on("change", () => {
				this._size[1] = +r.select("[name=rows]").property("value")
				this.__map = null;
				this.platform.init()
				this.setting.ml.refresh()
			})
	}

	init(r) {
		const width = this.platform.width;
		const height = this.platform.height;
		const env = this
		const base = r.append("g")
			.on("click", function () {
				env._points.push(d3.mouse(this))
				d3.event.stopPropagation()
				setTimeout(() => {
					env.platform.render()
				}, 0)
			})
		const dx = width / this._size[0];
		const dy = height / this._size[1];
		this._render_blocks = [];
		for (let i = 0; i < this._size[0]; i++) {
			this._render_blocks[i] = []
			for (let j = 0; j < this._size[1]; j++) {
				const g = this._render_blocks[i][j] = base.append("g")
					.classed("grid", true)
					.attr("stroke-width", 1)
					.attr("stroke", "black")
					.attr("stroke-opacity", 0.2)
				if (this._show_max) {
					g.append("rect")
						.attr("x", dx * i)
						.attr("y", dy * j)
						.attr("width", dx)
						.attr("height", dy)
						.attr("fill", d3.rgb(255, 255, 255))
					g.append("text")
						.classed("value", true)
						.attr("x", dx * i)
						.attr("y", dy * (j + 0.8))
						.attr("font-size", 14)
						.style("user-select", "none")
				} else {
					const c = [dx * (i + 0.5), dy * (j + 0.5)]
					const p = [[dx * (i + 1), dy * j], [dx * (i + 1), dy * (j + 1)], [dx * i, dy * (j + 1)], [dx * i, dy * j]]
					p[4] = p[0]
					for (let k = 0; k < 4; k++) {
						g.append("polygon")
							.attr("points", `${p[k][0]},${p[k][1]} ${p[k + 1][0]},${p[k + 1][1]} ${c[0]},${c[1]}`)
							.attr("fill", d3.rgb(255, 255, 255))
							.append("title")
					}
				}
				g.append("text")
					.classed("action", true)
					.attr("x", dx * (i + 0.5))
					.attr("y", dy * (j + 0.5))
					.style("user-select", "none")
					.style("transform-box", "fill-box")
					.style("transform", "translate(-50%, 25%)")
			}
		}
		r.append("circle")
			.classed("agent", true)
			.attr("cx", 0.5 * dx)
			.attr("cy", 0.5 * dy)
			.attr("fill", d3.rgb(128, 128, 128, 0.8))
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("r", Math.min(dx, dy) / 3)
	}

	reset() {
		this._position = Array(this._dim).fill(0);

		return this._position;
	}

	_min(arr) {
		if (!Array.isArray(arr[0])) {
			return Math.min(...arr);
		}
		return Math.min(...arr.map(this._min.bind(this)));
	}

	_max(arr) {
		if (!Array.isArray(arr[0])) {
			return Math.max(...arr);
		}
		return Math.max(...arr.map(this._max.bind(this)));
	}

	render(r, best_action) {
		const width = this.platform.width;
		const height = this.platform.height;
		const dx = width / this._size[0];
		const dy = height / this._size[1];
		const map = this.map;
		if (best_action) {
			this._q = best_action();
		}
		if (this._q) {
			const q = this._q
			const maxValue = this._max(q);
			const minValue = this._min(q);
			const absMaxValue = Math.max(Math.abs(maxValue), Math.abs(minValue))
			for (let i = 0; i < this._size[0]; i++) {
				if (!this._q[i]) continue
				const ba_row = this._dim === 2 ? q[i] : [q[i]];
				for (let j = 0; j < this._size[1]; j++) {
					if (!ba_row[j]) continue
					if (map[i][j] || (i === this._size[0] - 1 && j === this._size[1] - 1)) continue;
					const ba = argmax(ba_row[j]);
					const getColor = (m) => {
						const v = 255 * (1 - Math.abs(m) / absMaxValue);
						if (m > 0) {
							return d3.rgb(v, 255, v);
						} else if (m < 0) {
							return d3.rgb(255, v, v);
						}
						return d3.rgb(255, 255, 255);
					}
					this._render_blocks[i][j].select("text.action")
						.text(this._action_str[ba])
					if (this._show_max) {
						const bm = Math.max(...ba_row[j]);
						this._render_blocks[i][j].selectAll("rect").attr("fill", getColor(bm));
						this._render_blocks[i][j].select("text.value")
							.text(`${bm}`.slice(0, 6))
					} else {
						this._render_blocks[i][j].selectAll("polygon")
							.each(function(e, k) {
								const poly = d3.select(this)
								poly.attr("fill", getColor(ba_row[j][k]))
								poly.select("title").text(ba_row[j][k])
							})
					}
				}
			}
		} else {
			r.selectAll("g.grid rect, g.grid polygon").attr("fill", d3.rgb(255, 255, 255))
		}
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (map[i][j]) {
					this._render_blocks[i][j].selectAll("rect, polygon").attr("fill", d3.rgb(0, 0, 0))
				}
			}
		}
		this._render_blocks[this._size[0] - 1][this._size[1] - 1].selectAll("rect, polygon").attr("fill", "yellow");
		r.select("circle.agent")
			.attr("cx", (this._position[0] + 0.5) * dx)
			.attr("cy", ((this._position[1] || 0) + 0.5) * dy)
	}

	state() {
		return this._position;
	}

	step(action) {
		const info = this.test(this.state(), action);
		this._position = info.state;
		return info;
	}

	test(state, action) {
		let reward = this._reward.step;
		let mov_state = [].concat(state);
		const map = this.map;
		const moves = this._action_move[action[0]];
		for (let i = 0; i < moves.length; i++) {
			mov_state[i] += moves[i];
		}
		if (mov_state.some((s, i) => s < 0 || this._size[i] <= s)) {
			reward = this._reward.wall;
			mov_state = [].concat(state);
		} else if (map[mov_state[0]][mov_state[1] || 0]) {
			reward = this._reward.wall;
			mov_state = [].concat(state);
		}
		const fail = this._max_step && this._max_step <= this.epoch
		const done = mov_state.every((v, i) => v === this._size[i] - 1) || fail;
		if (done) reward = this._reward.goal;
		if (fail) reward = this._reward.fail;
		return {
			state: mov_state,
			reward,
			done
		};
	}
}

