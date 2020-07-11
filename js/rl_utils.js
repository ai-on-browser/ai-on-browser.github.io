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
	constructor(type, svg, config) {
		this._svg = svg;
		this._type = type;
		this._epoch = 0;
		switch (type) {
		case 'grid':
			this._env = new GridRLEnvironment(config);
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
		if (this._svg.select("g.rl-render").size() === 0) {
			this._svg.insert("g").classed("rl-render", true);
		}
		const r = this._svg.select("g.rl-render");
		r.selectAll("*").remove();
		this._env.render(this._svg, r, best_action);
	}

	clean() {
		this._svg.select("g.rl-render").remove();
	}

	step(action) {
		this._epoch++;
		return this._env.step(action);
	}
}

class GridRLEnvironment {
	constructor(config) {
		this._config = config;
		this._size = this._config.size || [20, 10];
		this._position = [0, 0];
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

	reset() {
		this._position = [0, 0];
		return [].concat(this._position);
	}

	render(svg, r, best_action) {
		const width = svg.node().getBoundingClientRect().width;
		const height = svg.node().getBoundingClientRect().height;
		const dx = width / this._size[0];
		const dy = height / this._size[1];
		if (best_action) {
			const maxValue = Math.max(0, ...best_action.map(r => Math.max(...r.map(v => Math.max(...v)))));
			const minValue = Math.min(0, ...best_action.map(r => Math.min(...r.map(v => Math.min(...v)))));
			for (let i = 0; i < this._size[0]; i++) {
				for (let j = 0; j < this._size[1]; j++) {
					const ba = argmax(best_action[i][j]);
					const bm = Math.max(...best_action[i][j]);
					if (bm > 0) {
						const v = 255 * (1 - bm / maxValue);
						r.append("rect")
							.attr("x", dx * i)
							.attr("y", dy * j)
							.attr("width", dx)
							.attr("height", dy)
							.attr("fill", d3.rgb(v, 255, v))
					} else if (bm < 0) {
						const v = 255 * (1 - bm / minValue);
						r.append("rect")
							.attr("x", dx * i)
							.attr("y", dy * j)
							.attr("width", dx)
							.attr("height", dy)
							.attr("fill", d3.rgb(255, v, v))
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
		r.append("rect")
			.attr("x", dx * (this._size[0] - 1))
			.attr("y", dy * (this._size[1] - 1))
			.attr("width", dx)
			.attr("height", dy)
			.attr("fill", "yellow")
		for (let i = 1; i < this._size[0]; i++) {
			r.append("line")
				.attr("x1", dx * i).attr("x2", dx * i)
				.attr("y1", 0).attr("y2", height)
				.attr("stroke", "black");
		}
		for (let i = 1; i < this._size[1]; i++) {
			r.append("line")
				.attr("x1", 0).attr("x2", width)
				.attr("y1", dy * i).attr("y2", dy * i)
				.attr("stroke", "black");
		}
		r.append("circle")
			.attr("cx", (this._position[0] + 0.5) * dx)
			.attr("cy", (this._position[1] + 0.5) * dy)
			.attr("fill", "gray")
			.attr("r", Math.min(dx, dy) / 3)
	}

	step(action) {
		let reward = -1;
		switch (action[0]) {
		case 0:
			if (this._position[0] < this._size[0] - 1) {
				this._position[0]++;
			} else {
				reward = -2;
			}
			break;
		case 1:
			if (this._position[1] > 0) {
				this._position[1]--;
			} else {
				reward = -2;
			}
			break;
		case 2:
			if (this._position[0] > 0) {
				this._position[0]--;
			} else {
				reward = -2;
			}
			break;
		case 3:
			if (this._position[1] < this._size[1] - 1) {
				this._position[1]++;
			} else {
				reward = -2;
			}
			break;
		}
		const state = [].concat(this._position);
		const done = this._position[0] === this._size[0] - 1 && this._position[1] === this._size[1] - 1;
		if (done) reward = 20;
		return [state, reward, done];
	}
}

