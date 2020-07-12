class RLRealRange {
	constructor(min, max) {
		this.min = min;
		this.max = max;
	}

	toArray(resolution) {
		const r = [];
		const d = (this.max - this.min) / (resolution - 1);
		for (let i = 0; i < resolution - 1; i++) {
			r.push(this.min + i * d);
		}
		r.push(this.max);
		return r;
	}
}

class RLIntRange {
	constructor(min, max) {
		this.min = min;
		this.max = max;
	}

	get length() {
		return this.max - this.min + 1;
	}

	toArray() {
		const r = [];
		for (let i = this.min; i <= this.max; r[i] = i++);
		return r;
	}
}

class RLEnvironment {
	constructor(type, svg, points, config) {
		this._svg = svg;
		this._points = points;
		this._type = type;
		this._epoch = 0;
		if (this._svg.select("g.rl-render").size() === 0) {
			this._svg.insert("g", ":first-child").classed("rl-render", true);
		}
		this._r = this._svg.select("g.rl-render");
		switch (type) {
		case 'grid':
			this._env = new GridRLEnvironment(this, config);
			break;
		}
	}

	get epoch() {
		return this._epoch;
	}

	get actions() {
		return this._env.actions;
	}

	get states() {
		return this._env.states;
	}

	reset() {
		this._epoch = 0;
		return this._env.reset();
	}

	render(best_action) {
		this._svg.selectAll("g:not(.rl-render)").style("visibility", "hidden");
		this._env.render(this._r, best_action);
	}

	clean() {
		this._r.remove();
		this._svg.selectAll("g").style("visibility", null);
	}

	step(action) {
		this._epoch++;
		return this._env.step(action);
	}

	test(state, action) {
		return this._env.test(state, action);
	}
}

class GridRLEnvironment {
	constructor(env, config) {
		this._svg = env._svg;
		this._points = env._points;
		this._config = config;
		this._size = this._config.size || [20, 10];
		this._position = [0, 0];
		this._init(env._r);
	}

	get actions() {
		return [[0, 1, 2, 3]];
	}

	get states() {
		return [
			new RLIntRange(0, this._size[0] - 1),
			new RLIntRange(0, this._size[1] - 1)
		];
	}

	get map() {
		if (!this.__map) {
			this.__map = []
			for (let i = 0; i < this._size[0]; i++) {
				this.__map[i] = Array(this._size[1]);
			}
		}
		for (let i = 0; i < this._size[0]; i++) {
			this.__map[i].fill(0);
		}

		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;
		const dx = width / this._size[0];
		const dy = height / this._size[1];
		this._points.forEach(p => {
			const x = Math.floor(p.at[0] / dx);
			const y = Math.floor(p.at[1] / dy);
			this.__map[x][y] = 1 - this.__map[x][y];
		})
		this.__map[0][0] = 0;
		return this.__map;
	}

	_init(r) {
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;
		const dx = width / this._size[0];
		const dy = height / this._size[1];
		this._render_blocks = [];
		for (let i = 0; i < this._size[0]; i++) {
			this._render_blocks[i] = Array(this._size[1]);
			for (let j = 0; j < this._size[1]; j++) {
				this._render_blocks[i][j] = r.append("rect")
					.attr("x", dx * i)
					.attr("y", dy * j)
					.attr("width", dx)
					.attr("height", dy)
					.attr("stroke-width", 1)
					.attr("stroke", "black")
					.attr("fill", d3.rgb(255, 255, 255))
			}
		}
	}

	reset() {
		this._position = [0, 0];
		return [].concat(this._position);
	}

	render(r, best_action) {
		r.selectAll(":not(rect)").remove();
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;
		const dx = width / this._size[0];
		const dy = height / this._size[1];
		const map = this.map;
		if (best_action) {
			const maxValue = Math.max(0, ...best_action.map(r => Math.max(...r.map(v => Math.max(...v)))));
			const minValue = Math.min(0, ...best_action.map(r => Math.min(...r.map(v => Math.min(...v)))));
			for (let i = 0; i < this._size[0]; i++) {
				for (let j = 0; j < this._size[1]; j++) {
					if (map[i][j] || (i === this._size[0] - 1 && j === this._size[1] - 1)) continue;
					const ba = argmax(best_action[i][j]);
					const bm = Math.max(...best_action[i][j]);
					if (bm > 0) {
						const v = 255 * (1 - bm / maxValue);
						this._render_blocks[i][j].attr("fill", d3.rgb(v, 255, v));
					} else if (bm < 0) {
						const v = 255 * (1 - bm / minValue);
						this._render_blocks[i][j].attr("fill", d3.rgb(255, v, v));
					} else {
						this._render_blocks[i][j].attr("fill", d3.rgb(255, 255, 255));
					}
					r.append("text")
						.attr("x", dx * (i + 0.5))
						.attr("y", dy * (j + 0.5))
						.text(ba === 0 ? "→" :
							ba === 1 ? "↑" :
							ba === 2 ? "←" :
							"↓")
					r.append("text")
						.attr("x", dx * i)
						.attr("y", dy * (j + 0.8))
						.attr("font-size", 14)
						.text(`${bm}`.slice(0, 6))
				}
			}
		}
		for (let i = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++) {
				if (map[i][j]) {
					this._render_blocks[i][j].attr("fill", d3.rgb(0, 0, 0));
				}
			}
		}
		this._render_blocks[this._size[0] - 1][this._size[1] - 1].attr("fill", "yellow");
		r.append("circle")
			.attr("cx", (this._position[0] + 0.5) * dx)
			.attr("cy", (this._position[1] + 0.5) * dy)
			.attr("fill", "gray")
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("r", Math.min(dx, dy) / 3)
	}

	step(action) {
		const [reward, next_state] = this.test(this._position, action);
		const state = [].concat(this._position = next_state);
		const done = this._position[0] === this._size[0] - 1 && this._position[1] === this._size[1] - 1;
		return [state, reward, done];
	}

	test(state, action) {
		let reward = -1;
		state = [].concat(state);
		const map = this.map;
		switch (action[0]) {
		case 0:
			if (state[0] < this._size[0] - 1 && map[state[0] + 1][state[1]] === 0) {
				state[0]++;
			} else {
				reward = -2;
			}
			break;
		case 1:
			if (state[1] > 0 && map[state[0]][state[1] - 1] === 0) {
				state[1]--;
			} else {
				reward = -2;
			}
			break;
		case 2:
			if (state[0] > 0 && map[state[0] - 1][state[1]] === 0) {
				state[0]--;
			} else {
				reward = -2;
			}
			break;
		case 3:
			if (state[1] < this._size[1] - 1 && map[state[0]][state[1] + 1] === 0) {
				state[1]++;
			} else {
				reward = -2;
			}
			break;
		}
		const done = state[0] === this._size[0] - 1 && state[1] === this._size[1] - 1;
		if (done) reward = 20;
		return [reward, state];
	}
}

