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

	indexOf(value, resolution) {
		if (value <= this.min) return 0;
		if (value >= this.max) return resolution - 1;
		return Math.round((value - this.min) / (this.max - this.min) * (resolution - 1))
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

	toArray(resolution) {
		const r = [];
		if (this.length <= resolution) {
			for (let i = this.min; i <= this.max; r[i] = i++);
		} else {
			const d = (this.max - this.min) / (resolution - 1);
			for (let i = 0; i < resolution - 1; i++) {
				r[i] = this.min + Math.round(i * d);
			}
			r.push(this.max);
		}
		return r;
	}

	indexOf(value, resolution) {
		if (this.length <= resolution) {
			return value - this.min;
		}
		if (value <= this.min) return 0;
		if (value >= this.max) return resolution - 1;
		return Math.round((value - this.min) / (this.max - this.min) * (resolution - 1))
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
		case 'cartpole':
			this._env = new CartPoleRLEnvironment(this, config);
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

	reset(...agents) {
		this._epoch = 0;
		this._agents = agents;
		return this._env.reset(...agents);
	}

	render(best_action) {
		this._svg.selectAll("g:not(.rl-render)").style("visibility", "hidden");
		this._env.render(this._r, best_action);
	}

	clean() {
		this._r.remove();
		this._svg.selectAll("g").style("visibility", null);
	}

	step(action, agent) {
		this._epoch++;
		return this._env.step(action, agent);
	}

	test(state, action, agent) {
		return this._env.test(state, action, agent);
	}

	sample_action(agent) {
		const a = [];
		for (const action of this.actions) {
			a.push(action[Math.floor(Math.random() * action.length)]);
		}
		return a;
	}
}

class CartPoleRLEnvironment {
	constructor(env, config) {
		this._svg = env._svg;

		this._position = 0;
		this._angle = 0;
		this._cart_velocity = 0;
		this._pendulum_velocity = 0;

		if (false) {
			this._cart_weight = 0.711;
			this._pendulum_weight = 0.209;
			this._pendulum_length = 0.326;
		} else {
			this._cart_weight = 1.0;
			this._pendulum_weight = 0.1;
			this._pendulum_length = 0.5;
		}
		this._g = 9.8;
		this._t = 0.02;
		this._force = 10;

		this._fail_position = 2.4;
		this._fail_angle = 12 / 180 * Math.PI;

		this._cart_size = [50, 30];
		this._move_scale = 50;
		this._pendulum_scale = 400;

		this._step = 0;
		this._max_step = 200;
		this._reward = {
			goal: 1,
			step: 1,
			fail: 0,
		}
	}

	get actions() {
		return [[0, 1]];
	}

	get states() {
		return [
			new RLRealRange(-this._fail_position, this._fail_position),
			new RLRealRange(-this._fail_angle, this._fail_angle),
			new RLRealRange(-2, 2),
			new RLRealRange(-3, 3),
		];
	}

	reset() {
		this._position = Math.random() * 0.1 - 0.05;
		this._angle = Math.random() * 0.1 - 0.05;
		this._cart_velocity = Math.random() * 0.1 - 0.05;
		this._pendulum_velocity = Math.random() * 0.1 - 0.05;
		this._step = 0;

		return [this._position, this._angle, this._cart_velocity , this._pendulum_velocity];
	}

	render(r) {
		r.selectAll("*").remove();
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;

		r.append("rect")
			.attr("x", width / 2 - this._position * this._move_scale)
			.attr("y", height - this._cart_size[1])
			.attr("width", this._cart_size[0])
			.attr("height", this._cart_size[1])
			.attr("fill", "gray")
		const x = width / 2 - this._position * this._move_scale + this._cart_size[0] / 2;
		r.append("line")
			.attr("x1", x)
			.attr("y1", height - this._cart_size[1] / 2)
			.attr("x2", x - this._pendulum_length * Math.sin(this._angle) * this._pendulum_scale)
			.attr("y2", height - this._cart_size[1] / 2 - this._pendulum_length * Math.cos(this._angle) * this._pendulum_scale)
			.attr("stroke-width", 5)
			.attr("stroke", "black")
	}

	step(action, agent) {
		const [state, reward, done] = this.test([this._position, this._angle, this._cart_velocity, this._pendulum_velocity], action, agent);
		this._step++;
		this._position = state[0];
		this._angle = state[1];
		this._cart_velocity = state[2];
		this._pendulum_velocity = state[3];
		return [state, reward, done];
	}

	test(state, action, agent) {
		let [x, t, dx, dt] = state;
		const f = this._force * (action[0] === 0 ? -1 : 1)

		const M = this._cart_weight;
		const m = this._pendulum_weight;
		const l = this._pendulum_length;
		const sint = Math.sin(t);
		const cost = Math.cos(t);
		const ddt = ((M + m) * this._g * sint - cost * (f + m * l * dt ** 2 * sint)) / (l * (4 / 3 * (M + m) - m * cost ** 2))
		const ddx = (f + m * l * (dt ** 2 * sint - ddt * cost)) / (M + m)
		x += dx * this._t;
		t += dt * this._t;
		dx += ddx * this._t;
		dt += ddt * this._t;

		const fail = Math.abs(t) >= this._fail_angle || Math.abs(x) > this._fail_position;
		const done = this._step + 1 >= this._max_step || fail
		const reward = fail ? this._reward.fail : done ? this._reward.goal : this._reward.step;
		return [[x, t, dx, dt], reward, done]
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

		this._q = null;
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
			this._q = best_action();
		}
		if (this._q) {
			const q = this._q
			const maxValue = this._max(q);
			const minValue = this._min(q);
			for (let i = 0; i < this._size[0]; i++) {
				const ba_row = this._dim === 2 ? q[i] : [q[i]];
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
		this._goal_size = [50, 50];
		this._position = Array(2).fill(0);
		this._orient = 0;
		this._velocity = 10;
		this._init(env._r);
		this._step = 0;
		this._max_step = 3000;

		this._reward = {
			step: -1,
			wall: -2,
			goal: 200,
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
			.attr("x", this._width - this._goal_size[0])
			.attr("y", this._height - this._goal_size[1])
			.attr("width", this._goal_size[0])
			.attr("height", this._goal_size[1])
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
			this._orient += 10
		} else if (action[0] === 3) {
			this._orient -= 10
		}
		this._orient = (this._orient + 360) % 360;
		if (mov_state.some((s, i) => s < 0) || mov_state[0] >= this._width || mov_state[1] >= this._height) {
			reward = this._reward.wall;
			mov_state = [].concat(state);
		} else if (map[Math.floor(mov_state[0] / rx)][Math.floor(mov_state[1] / ry)] !== 0) {
			reward = this._reward.wall;
			mov_state = [].concat(state);
		}
		const done = mov_state[0] > this._width - this._goal_size[0] && mov_state[1] > this._height - this._goal_size[1];
		if (done) reward = this._reward.goal;
		return [[...mov_state, this._orient], reward, done];
	}
}

