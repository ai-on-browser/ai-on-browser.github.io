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
			this._env = new GridMazeRLEnvironment(this, config);
			break;
		case 'maze':
			this._env = new SmoothMazeRLEnvironment(this, config);
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

	get type() {
		return this._type;
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

class GridMazeRLEnvironment {
	constructor(env, config) {
		this._svg = env._svg;
		this._points = env._points;
		this._config = config;
		this._dim = 2
		this._size = this._config.size || [20, 10];
		this._position = Array(this._dim).fill(0);
		this._init(env._r);
		this._step = 0;
		this._max_step = 0;

		this._reward = {
			step: -1,
			wall: -2,
			goal: 20,
			max_step: -100
		}
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
		this.__map[this._size[0] - 1][this._size[1] - 1] = 0;
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
		this._position = Array(this._dim).fill(0);
		this._step = 0;
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
		r.selectAll(":not(rect)").remove();
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;
		const dx = width / this._size[0];
		const dy = height / this._size[1];
		const map = this.map;
		if (best_action) {
			const maxValue = this._max(best_action);
			const minValue = this._min(best_action);
			for (let i = 0; i < this._size[0]; i++) {
				const ba_row = this._dim === 2 ? best_action[i] : [best_action[i]];
				for (let j = 0; j < this._size[1]; j++) {
					if (map[i][j] || (i === this._size[0] - 1 && j === this._size[1] - 1)) continue;
					const ba = argmax(ba_row[j]);
					const bm = Math.max(...ba_row[j]);
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
						.text(this._action_str[ba])
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
			.attr("cy", ((this._position[1] || 0) + 0.5) * dy)
			.attr("fill", d3.rgb(128, 128, 128, 0.8))
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("r", Math.min(dx, dy) / 3)
	}

	step(action) {
		const [next_state, reward, done] = this.test(this._position, action);
		this._position = next_state;
		this._step++;
		if (this._max_step && this._max_step <= this._step) {
			return [next_state, this._reward.max_step, true];
		}
		return [next_state, reward, done];
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
		} else if (map[mov_state[0]][mov_state[1] || 0] !== 0) {
			reward = this._reward.wall;
			mov_state = [].concat(state);
		}
		const done = mov_state.every((v, i) => v === this._size[i] - 1);
		if (done) reward = this._reward.goal;
		return [mov_state, reward, done];
	}
}

class SmoothMazeRLEnvironment {
	constructor(env, config) {
		this._svg = env._svg;
		this._width = this._svg.node().getBoundingClientRect().width;
		this._height = this._svg.node().getBoundingClientRect().height;

		this._points = env._points;
		this._config = config;
		this._map_resolution = [100, 50];
		this._position = Array(2).fill(0);
		this._orient = 0;
		this._velocity = 10;
		this._init(env._r);
		this._step = 0;
		this._max_step = 0;

		this._reward = {
			step: -1,
			wall: -2,
			goal: 20,
			max_step: -100
		}
	}

	get actions() {
		return [[0, 1, 2, 3]];
	}

	get states() {
		return [
			new RLRealRange(0, this._width),
			new RLRealRange(0, this._height),
			new RLIntRange(0, 359)
		];
	}

	get map() {
		if (!this.__map) {
			this.__map = []
			for (let i = 0; i < this._map_resolution[0]; i++) {
				this.__map[i] = Array(this._map_resolution[1]);
			}
		}
		for (let i = 0; i < this._map_resolution[0]; i++) {
			this.__map[i].fill(0);
		}

		const dx = this._width / this._map_resolution[0];
		const dy = this._height / this._map_resolution[1];
		this._points.forEach(p => {
			const x = Math.floor(p.at[0] / dx);
			const y = Math.floor(p.at[1] / dy);
			this.__map[x][y] = 1 - this.__map[x][y];
		})
		this.__map[0][0] = 0;
		this.__map[this._map_resolution[0] - 1][this._map_resolution[1] - 1] = 0;
		return this.__map;
	}

	_init(r) {
		const dx = this._width / this._map_resolution[0];
		const dy = this._height / this._map_resolution[1];
		this._render_blocks = [];
		for (let i = 0; i < this._map_resolution[0]; i++) {
			this._render_blocks[i] = Array(this._map_resolution[1]);
			for (let j = 0; j < this._map_resolution[1]; j++) {
				this._render_blocks[i][j] = r.append("rect")
					.classed("grid", true)
					.attr("x", dx * i)
					.attr("y", dy * j)
					.attr("width", dx)
					.attr("height", dy)
					.attr("fill", d3.rgb(255, 255, 255))
			}
		}
	}

	reset() {
		this._position = Array(2).fill(0);
		this._orient = 0;
		this._step = 0;
		return [0, 0, 0];
	}

	render(r) {
		r.selectAll(":not(.grid)").remove();
		const dx = this._width / this._map_resolution[0];
		const dy = this._height / this._map_resolution[1];
		const map = this.map;
		for (let i = 0; i < map.length; i++) {
			for (let j = 0; j < map[i].length; j++) {
				if (map[i][j]) {
					this._render_blocks[i][j].attr("fill", d3.rgb(0, 0, 0));
				}
			}
		}
		r.append("rect")
			.attr("x", this._width - 20)
			.attr("y", this._height - 20)
			.attr("width", 20)
			.attr("height", 20)
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("fill", "yellow")
		r.append("circle")
			.attr("cx", this._position[0])
			.attr("cy", this._position[1])
			.attr("fill", d3.rgb(128, 128, 128, 0.8))
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("r", Math.min(dx, dy) / 2)
	}

	step(action) {
		const [next_state, reward, done] = this.test(this._position, action);
		this._position = [next_state[0], next_state[1]];
		this._step++;
		if (this._max_step && this._max_step <= this._step) {
			return [next_state, this._reward.max_step, true];
		}
		return [next_state, reward, done];
	}

	test(state, action) {
		let reward = this._reward.step;
		let mov_state = [].concat(state);
		const map = this.map;
		const rx = this._width / this._map_resolution[0];
		const ry = this._height / this._map_resolution[1];
		const dx = Math.cos(this._orient) * this._velocity;
		const dy = Math.sin(this._orient) * this._velocity;
		if (action[0] === 0) {
			mov_state[0] += dx;
			mov_state[1] += dy;
		} else if (action[0] === 1) {
			mov_state[0] -= dx;
			mov_state[1] -= dy;
		} else if (action[0] === 2) {
			this._orient += 2
		} else if (action[0] === 3) {
			this._orient -= 2
		}
		this._orient = (this._orient + 360) % 360;
		if (mov_state.some((s, i) => s < 0) || mov_state[0] >= this._width || mov_state[1] >= this._height) {
			reward = this._reward.wall;
			mov_state = [].concat(state);
		} else if (map[Math.floor(mov_state[0] / rx)][Math.floor(mov_state[1] / ry)] !== 0) {
			reward = this._reward.wall;
			mov_state = [].concat(state);
		}
		const done = mov_state[0] > this._width - 20 && mov_state[1] > this._height - 20;
		if (done) reward = this._reward.goal;
		return [[...mov_state, this._orient], reward, done];
	}
}

