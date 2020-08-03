class RLRealRange {
	constructor(min, max, space = 'equal') {
		this.min = min;
		this.max = max;
		this._space = space;
	}

	toSpace(resolution) {
		const r = [this.min];
		if (this._space === 'equal') {
			const d = (this.max - this.min) / resolution;
			for (let i = 1; i < resolution; i++) {
				r.push(this.min + i * d);
			}
		} else if (this._space === 'log') {
			const odd = resolution % 2;
			const n = Math.floor((resolution - 1) / 2);
			let max = this.max;
			let min = this.min;
			const m = [];
			for (let i = 0; i < n; i++) {
				r.push(min /= 3);
				m.push(max /= 3);
			}
			if (!odd) r.push(0);
			for (let i = 0; i < n; i++) {
				r.push(m[n - i - 1]);
			}
		}
		r.push(this.max);
		return r
	}

	toArray(resolution) {
		const s = this.toSpace(resolution);
		return s.slice(1).map((v, i) => (v + s[i]) / 2);
	}

	indexOf(value, resolution) {
		if (value <= this.min) return 0;
		if (value >= this.max) return resolution - 1;
		if (this._space === 'equal') {
			return Math.floor((value - this.min) / (this.max - this.min) * resolution)
		} else {
			const s = this.toSpace(resolution);
			for (let i = 0; i < s.length - 1; i++) {
				if (value < s[i + 1]) return i;
			}
			return s.length - 1;
		}
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
			return Math.round(value - this.min);
		}
		if (value <= this.min) return 0;
		if (value >= this.max) return resolution - 1;
		return Math.floor((value - this.min) / (this.max - this.min) * resolution)
	}
}

class RLEnvironment {
	constructor(type, setting) {
		this._svg = setting.svg;
		this._points = setting.points;
		this._type = type;
		this._epoch = 0;
		this._env = new EmptyRLEnvironment()
		switch (type) {
		case 'grid':
			this._env = new GridMazeRLEnvironment(this, setting);
			break;
		case 'maze':
			this._env = new SmoothMazeRLEnvironment(this, setting);
			break;
		case 'cartpole':
			this._env = new CartPoleRLEnvironment(this, setting);
			break;
		case 'mountaincar':
			this._env = new MountainCarRLEnvironment(this, setting);
			break;
		case 'acrobot':
			this._env = new AcrobotRLEnvironment(this, setting);
			break;
		case 'pendulum':
			this._env = new PendulumRLEnvironment(this, setting);
			break;
		}
		this.init();
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

	get state() {
		return this._env.state;
	}

	init() {
		if (this._svg.select("g.rl-render").size() === 0) {
			this._svg.insert("g", ":first-child").classed("rl-render", true);
		}
		this._r = this._svg.select("g.rl-render");
		this._r.selectAll("*").remove();

		const svgNode = this._svg.node();
		this._svg.selectAll("g:not(.rl-render)").filter(function() {
			return this.parentNode === svgNode
		}).style("visibility", "hidden");

		this._env.init(this._r)
	}

	reset(...agents) {
		this._epoch = 0;
		this._agents = agents;
		return this._env.reset(...agents);
	}

	render(best_action) {
		this._env.render(this._r, best_action);
	}

	clean() {
		this._r.remove();
		this._svg.selectAll("g").style("visibility", null);
	}

	step(action, agent) {
		this._epoch++;
		return this._env.step(action, this._epoch, agent);
	}

	test(state, action, agent) {
		return this._env.test(state, action, this._epoch + 1, agent);
	}

	sample_action(agent) {
		const a = this.actions.map(action => {
			if (Array.isArray(action)) {
				return action[Math.floor(Math.random() * action.length)];
			} else if (action instanceof RLRealRange) {
				return Math.random() * (action.max - action.min) + action.min
			}
		})
		return a;
	}
}

class EmptyRLEnvironment {
	constructor() {
		this.actions = []
		this.states = []
		this.state = []
	}

	init() {}

	reset() {
		return this.state
	}

	render() {}

	step() {
		return [this.state, 0, true]
	}

	test() {
		return [this.state, 0, true]
	}
}

class MountainCarRLEnvironment {
	constructor(env, setting) {
		this._svg = env._svg;
		this._position = 0;
		this._velocity = 0;

		this._max_position = 0.6;
		this._min_position = -1.2;
		this._max_velocity = 0.07;

		this._goal_position = 0.5;
		this._goal_velocity = 0;

		this._force = 0.001;
		this._g = 0.0025;

		this._cart_size = [50, 30];
		this._scale = 300;
		this._upon = 10;

		this._max_step = 200;
		this._reward = {
			step: -1,
			goal: -1,
			fail: -1
		}
	}

	get actions() {
		return [[0, 1, 2]];
	}

	get states() {
		return [
			new RLRealRange(-1.2, 0.6),
			new RLRealRange(-0.07, 0.07),
		]
	}

	get state() {
		return [this._position, this._velocity];
	}

	init(r) {
		const line = d3.line().x(d => d[0]).y(d => d[1]);
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;

		const p = []
		const dx = (this._max_position - this._min_position) / 100;
		const offx = ((this._max_position + this._min_position) * this._scale - width) / 2
		for (let i = 0; i < 100; i++) {
			const x = this._min_position + dx * i
			p.push([x * this._scale - offx, -this._height(x) * this._scale + height]);
		}
		p.push([this._max_position * this._scale - offx, -this._height(this._max_position) * this._scale + height]);
		r.append("path").attr("stroke", "black").attr("fill-opacity", 0).attr("d", line(p));

		r.append("rect")
			.attr("width", this._cart_size[0])
			.attr("height", this._cart_size[1])
			.attr("fill", "gray")
			.style("transform-box", "fill-box")
			.style("transform-origin", "center")
	}

	reset() {
		this._position = Math.random() * 0.2 - 0.6;
		this._velocity = 0;
		return this.state;
	}

	_height(x) {
		return Math.sin(3 * x) * 0.45 + 0.55;
	}

	render(r) {
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;

		const offx = ((this._max_position + this._min_position) * this._scale - width) / 2

		const t = Math.atan(-0.45 * 3 * Math.cos(3 * this._position))
		r.select("rect")
			.attr("x", this._position * this._scale - offx - this._cart_size[0] / 2 + Math.sin(t) * this._upon)
			.attr("y", -this._height(this._position) * this._scale + height - this._cart_size[1] - Math.cos(t) * this._upon)
			.style("transform", `rotate(${t * 360 / (2 * Math.PI)}deg)`)
	}

	step(action, epoch) {
		const [s, reward, done] = this.test(this.state, action, epoch);
		this._position = s[0];
		this._velocity = s[1];
		return [s, reward, done];
	}

	test(state, action, epoch) {
		let [p, v] = state;
		v += (action[0] - 1) * this._force + Math.cos(3 * this._position) * (-this._g)
		v = (Math.abs(v) > this._max_velocity) ? Math.sign(v) * this._max_velocity : v;
		p += v;
		p = (p > this._max_position) ? this._max_position :
		    (p < this._min_position) ? this._min_position :
		    p;
		if (p === this._min_position && v < 0) {
			v = 0;
		}

		const fail = epoch >= this._max_step
		const done = p >= this._goal_position && v >= this._goal_velocity || fail
		const reward = fail ? this._reward.fail : done ? this._reward.goal : this._reward.step;
		if (typeof reward === 'function') reward = reward(this)
		return [[p, v], reward, done];
	}
}

class CartPoleRLEnvironment {
	constructor(env, setting) {
		this._svg = env._svg;

		this._position = 0;
		this._angle = 0;
		this._cart_velocity = 0;
		this._pendulum_velocity = 0;

		if (true) {
			this._cart_weight = 0.711;
			this._pendulum_weight = 0.209;
			this._pendulum_length = 0.326;
		} else { // OpenAI gym setting
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

	get state() {
		return [this._position, this._angle, this._cart_velocity , this._pendulum_velocity];
	}

	init(r) {
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;

		r.append("rect")
			.classed("cart", true)
			.attr("y", height - this._cart_size[1])
			.attr("width", this._cart_size[0])
			.attr("height", this._cart_size[1])
			.attr("fill", "gray")
		const x = width / 2 - this._position * this._move_scale + this._cart_size[0] / 2;
		r.append("line")
			.classed("pendulum", true)
			.attr("y1", height - this._cart_size[1] / 2)
			.attr("stroke-width", 5)
			.attr("stroke", "black")
	}

	reset() {
		this._position = Math.random() * 0.1 - 0.05;
		this._angle = Math.random() * 0.1 - 0.05;
		this._cart_velocity = Math.random() * 0.1 - 0.05;
		this._pendulum_velocity = Math.random() * 0.1 - 0.05;

		return this.state;
	}

	render(r) {
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;

		r.select("rect.cart")
			.attr("x", width / 2 - this._position * this._move_scale)
		const x = width / 2 - this._position * this._move_scale + this._cart_size[0] / 2;
		r.select("line.pendulum")
			.attr("x1", x)
			.attr("x2", x - this._pendulum_length * Math.sin(this._angle) * this._pendulum_scale)
			.attr("y2", height - this._cart_size[1] / 2 - this._pendulum_length * Math.cos(this._angle) * this._pendulum_scale)
	}

	step(action, epoch, agent) {
		const [state, reward, done] = this.test(this.state, action, epoch, agent);
		this._position = state[0];
		this._angle = state[1];
		this._cart_velocity = state[2];
		this._pendulum_velocity = state[3];
		return [state, reward, done];
	}

	test(state, action, epoch, agent) {
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
		const done = epoch >= this._max_step || fail
		const reward = fail ? this._reward.fail : done ? this._reward.goal : this._reward.step;
		if (typeof reward === 'function') reward = reward(this)
		return [[x, t, dx, dt], reward, done]
	}
}

class AcrobotRLEnvironment {
	constructor(env, setting) {
		this._svg = env._svg;

		this._theta1 = 0;
		this._theta2 = 0;
		this._dtheta1 = 0;
		this._dtheta2 = 0;

		this._link_len1 = 1;
		this._link_len2 = 1;
		this._link_mass1 = 1;
		this._link_mass2 = 1;
		this._link_com_pos1 = 0.5
		this._link_com_pos2 = 0.5
		this._moi = 1;

		this._max_vel1 = 4 * Math.PI;
		this._max_vel2 = 9 * Math.PI;

		this._g = 9.8;
		this._dt = 0.1;

		this._scale = 100;

		this._max_step = 200;
		this._reward = {
			goal: 0,
			step: 1,
			fail: 0,
		}
	}

	get actions() {
		return [[-1, 0, 1]];
	}

	get states() {
		return [
			new RLRealRange(-Math.PI, Math.PI),
			new RLRealRange(-Math.PI, Math.PI),
			new RLRealRange(-this._max_vel1, this._max_vel1),
			new RLRealRange(-this._max_vel2, this._max_vel2),
		];
	}

	get state() {
		return [this._theta1, this._theta2, this._dtheta1, this._dtheta2];
	}

	init(r) {
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;
		const p0 = [width / 2, height / 2];
		const p1 = [p0[0] + this._scale * Math.sin(this._theta1), p0[1] + this._scale * Math.cos(this._theta1)];
		const p2 = [p1[0] + this._scale * Math.sin(this._theta2), p1[1] + this._scale * Math.cos(this._theta2)];
		r.append("circle")
			.attr("cx", p0[0])
			.attr("cy", p0[1])
			.attr("fill", d3.rgb(128, 128, 128, 0.8))
			.attr("stroke-width", 0)
			.attr("r", 10)
		r.append("line")
			.attr("name", "link1")
			.attr("x1", p0[0])
			.attr("x2", p1[0])
			.attr("y1", p0[1])
			.attr("y2", p1[1])
			.attr("stroke", "black")
			.attr("stroke-width", 5)
		r.append("line")
			.attr("name", "link2")
			.attr("x1", p1[0])
			.attr("x2", p2[0])
			.attr("y1", p1[1])
			.attr("y2", p2[1])
			.attr("stroke", "black")
			.attr("stroke-width", 5)
	}

	reset() {
		this._theta1 = Math.random() * 0.2 - 0.1;
		this._theta2 = Math.random() * 0.2 - 0.1;
		this._dtheta1 = Math.random() * 0.2 - 0.1;
		this._dtheta2 = Math.random() * 0.2 - 0.1;

		return this.state;
	}

	render(r) {
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;

		const p0 = [width / 2, height / 2];
		const p1 = [p0[0] + this._scale * Math.sin(this._theta1), p0[1] + this._scale * Math.cos(this._theta1)];
		const p2 = [p1[0] + this._scale * Math.sin(this._theta2), p1[1] + this._scale * Math.cos(this._theta2)];
		r.select("line[name=link1]")
			.attr("x2", p1[0])
			.attr("y2", p1[1])
		r.select("line[name=link2]")
			.attr("x1", p1[0])
			.attr("x2", p2[0])
			.attr("y1", p1[1])
			.attr("y2", p2[1])
	}

	step(action, epoch, agent) {
		const [state, reward, done] = this.test(this.state, action, epoch, agent);
		this._theta1 = state[0];
		this._theta2 = state[1];
		this._dtheta1 = state[2];
		this._dtheta2 = state[3];
		return [state, reward, done];
	}

	test(state, action, epoch, agent) {
		let [t1, t2, dt1, dt2] = state;
		const a = action[0];

		const m1 = this._link_mass1;
		const m2 = this._link_mass2;
		const l1 = this._link_len1;
		const lc1 = this._link_com_pos1;
		const lc2 = this._link_com_pos2;
		const i1 = this._moi;
		const i2 = this._moi;
		const g = this._g;

		const d1 = m1 * lc1 ** 2 + m2 * (l1 ** 2 + lc2 ** 2 + 2 * l1 * lc2 * Math.cos(t2)) + i1 + i2
		const d2 = m2 * (lc2 ** 2 + l1 * lc2 * Math.cos(t2)) + i2
		const phi2 = m2 * lc2 * g * Math.cos(t1 + t2 - Math.PI / 2)
		const phi1 = -m2 * l1 * lc2 * dt2 ** 2 * Math.sin(t2) - 2 * m2 * l1 * lc2 * dt2 * dt1 * Math.sin(t2) + (m1 * lc1 + m2 * l1) * g * Math.cos(t1 - Math.PI / 2) + phi2

		const ddt2 = (a + d2 / d1 * phi1 - m2 * l1 * lc2 * dt1 ** 2 * Math.sin(t2) - phi2) / (m2 * lc2 ** 2 + i2 - d2 ** 2 / d1)
		const ddt1 = -(d2 * ddt2 + phi2) / d1

		const clip = (x, min, max) => (x < min) ? min : (x > max) ? max : x;
		t1 += this._dt * dt1
		if (t1 < -Math.PI) t1 = t1 + 2 * Math.PI
		if (t1 > Math.PI) t1 = t1 - 2 * Math.PI
		t2 += this._dt * dt2
		if (t2 < -Math.PI) t2 = t2 + 2 * Math.PI
		if (t2 > Math.PI) t2 = t2 - 2 * Math.PI
		dt1 = clip(dt1 + this._dt * ddt1, -this._max_vel1, this._max_vel1)
		dt2 = clip(dt2 + this._dt * ddt2, -this._max_vel2, this._max_vel2)

		const fail = epoch >= this._max_step
		const done = -Math.cos(t1) - Math.cos(t2 + t1) > 1 || fail
		const reward = fail ? this._reward.fail : done ? this._reward.goal : this._reward.step;
		if (typeof reward === 'function') reward = reward(this)
		return [[t1, t2, dt1, dt2], reward, done]
	}
}

class PendulumRLEnvironment {
	constructor(env, setting) {
		this._svg = env._svg;

		this._theta = 0;
		this._dtheta = 0;

		this._mass = 1;
		this._length = 1;

		this._max_speed = 8;
		this._max_torque = 2;

		this._g = 9.8;
		this._dt = 0.05;

		this._scale = 100;

		this._max_step = 200;
		this._reward = {
			goal: 0,
			step: 1,
			fail: 0,
		}
	}

	get actions() {
		return [new RLRealRange(-this._max_torque, this._max_torque)];
	}

	get states() {
		return [
			new RLRealRange(-1, 1),
			new RLRealRange(-1, 1),
			new RLRealRange(-this._max_speed, this._max_speed),
		];
	}

	get state() {
		return [Math.cos(this._theta), Math.sin(this._theta), this._dtheta];
	}

	init(r) {
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;
		const p0 = [width / 2, height / 2];
		const p1 = [p0[0] + this._scale * Math.sin(this._theta), p0[1] + this._scale * Math.cos(this._theta)];
		r.append("circle")
			.attr("cx", p0[0])
			.attr("cy", p0[1])
			.attr("fill", d3.rgb(128, 128, 128, 0.8))
			.attr("stroke-width", 0)
			.attr("r", 10)
		r.append("line")
			.attr("name", "link")
			.attr("x1", p0[0])
			.attr("x2", p1[0])
			.attr("y1", p0[1])
			.attr("y2", p1[1])
			.attr("stroke", "black")
			.attr("stroke-width", 5)
	}

	reset() {
		this._theta = Math.random() * 2 * Math.PI - Math.PI;
		this._dtheta = Math.random() - 0.5;

		return this.state;
	}

	render(r) {
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;

		const p0 = [width / 2, height / 2];
		const p1 = [p0[0] + this._scale * Math.sin(this._theta), p0[1] - this._scale * Math.cos(this._theta)];
		r.select("line[name=link]")
			.attr("x2", p1[0])
			.attr("y2", p1[1])
	}

	step(action, epoch, agent) {
		let t = this._theta;
		let dt = this._dtheta;

		const clip = (x, min, max) => (x < min) ? min : (x > max) ? max : x;
		const a = clip(action[0], -this._max_torque, this._max_torque);

		const g = this._g;
		const m = this._mass;
		const l = this._length;

		const c = this._angle_normalize(t) ** 2 + 0.1 * dt ** 2 + 0.001 * a ** 2;

		dt += (-3 * g / (2 * l) * Math.sin(t + Math.PI) + 3 / (m * l ** 2) * a) * this._dt;

		this._theta += dt * this._dt;
		this._dtheta = clip(dt, -this._max_speed, this._max_speed);
		return [[Math.cos(t), Math.sin(t), dt], -c, epoch >= this._max_step]
	}

	_angle_normalize(t) {
		t += Math.PI
		const pi2 = 2 * Math.PI
		while (t < 0) t += pi2
		while (t >= pi2) t -= pi2
		return t - Math.PI
	}

	test(state, action, epoch, agent) {
		throw "Not implemented"
	}
}

class GridMazeRLEnvironment {
	constructor(env, setting) {
		this._env = env;
		this._svg = env._svg;
		this._points = env._points;
		this._setting = setting;
		this._dim = 2
		this._size = [20, 10];
		this._position = Array(this._dim).fill(0);
		this._max_step = 0;

		this._reward = {
			step: -1,
			wall: -2,
			goal: 20,
			fail: -100
		}

		this._q = null;

		this._show_max = false
		this.__map = null
		this._render_blocks = []
		this._init_menu(setting.rl.configElement, setting.ml.refresh);
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

	get state() {
		return this._position;
	}

	get map() {
		if (!this.__map) {
			this.__map = [];
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

	_init_menu(r, refresh) {
		r.selectAll("*").remove()
		r.append("span").text("Columns ")
		r.append("input")
			.attr("type", "number")
			.attr("name", "columns")
			.attr("min", 1)
			.attr("max", 50)
			.attr("value", 20)
			.on("change", () => {
				this._size[0] = +r.select("[name=columns]").property("value")
				this.__map = null;
				this._env.init()
				refresh()
			})
		r.append("span").text(" Rows ")
		r.append("input")
			.attr("type", "number")
			.attr("name", "rows")
			.attr("min", 1)
			.attr("max", 50)
			.attr("value", 10)
			.on("change", () => {
				this._size[1] = +r.select("[name=rows]").property("value")
				this.__map = null;
				this._env.init()
				refresh()
			})
	}

	init(r) {
		const width = this._svg.node().getBoundingClientRect().width;
		const height = this._svg.node().getBoundingClientRect().height;
		const dx = width / this._size[0];
		const dy = height / this._size[1];
		this._render_blocks = [];
		for (let i = 0; i < this._size[0]; i++) {
			this._render_blocks[i] = Array(this._size[1]);
			for (let j = 0; j < this._size[1]; j++) {
				const g = this._render_blocks[i][j] = r.append("g")
					.classed("grid", true)
				if (this._show_max) {
					g.append("rect")
						.attr("x", dx * i)
						.attr("y", dy * j)
						.attr("width", dx)
						.attr("height", dy)
						.attr("stroke-width", 1)
						.attr("stroke", "black")
						.attr("stroke-opacity", 0.2)
						.attr("fill", d3.rgb(255, 255, 255))
					g.append("text")
						.classed("value", true)
						.attr("x", dx * i)
						.attr("y", dy * (j + 0.8))
						.attr("font-size", 14)
						.style("user-select", "none")
				} else {
					const c = [dx * (i + 0.5), dy * (j + 0.5)]
					const p = [[dx * (i + 1), dy * j], [dx * (i + 1), dy * (j + 1)], [dx * i, dy * (j + 1)], [dx * i, dy * j], [dx * (i + 1), dy * j]]
					for (let k = 0; k < 4; k++) {
						g.append("polygon")
							.attr("points", `${p[k][0]},${p[k][1]} ${p[k + 1][0]},${p[k + 1][1]} ${c[0]},${c[1]}`)
							.attr("fill", d3.rgb(255, 255, 255))
							.attr("stroke", "black")
							.attr("stroke-opacity", 0.2)
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
		r.append("rect")
			.attr("x", 0).attr("y", 0)
			.attr("width", width)
			.attr("height", height)
			.attr("opacity", 0)
			.on("click", () => {
				setTimeout(() => {
					this._env.render()
				}, 0)
			})
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
				if (!this._q[i]) continue
				const ba_row = this._dim === 2 ? q[i] : [q[i]];
				for (let j = 0; j < this._size[1]; j++) {
					if (!ba_row[j]) continue
					if (map[i][j] || (i === this._size[0] - 1 && j === this._size[1] - 1)) continue;
					const ba = argmax(ba_row[j]);
					const getColor = (m) => {
						if (m > 0) {
							const v = 255 * (1 - m / maxValue);
							return d3.rgb(v, 255, v);
						} else if (m < 0) {
							const v = 255 * (1 - m / minValue);
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

	step(action, epoch) {
		const [next_state, reward, done] = this.test(this.state, action, epoch);
		this._position = next_state;
		return [next_state, reward, done];
	}

	test(state, action, epoch) {
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
		const fail = this._max_step && this._max_step <= epoch
		const done = mov_state.every((v, i) => v === this._size[i] - 1) || fail;
		if (done) reward = this._reward.goal;
		if (fail) reward = this._reward.fail;
		if (typeof reward === 'function') reward = reward(this)
		return [mov_state, reward, done];
	}
}

class SmoothMazeRLEnvironment {
	constructor(env, setting) {
		this._env = env;
		this._svg = env._svg;
		this._width = this._svg.node().getBoundingClientRect().width;
		this._height = this._svg.node().getBoundingClientRect().height;

		this._points = env._points;
		this._map_resolution = [100, 50];
		this._goal_size = [50, 50];
		this._position = Array(2).fill(0);
		this._orient = 0;
		this._velocity = 10;
		this._rotate = 5;
		this._max_step = 3000;

		this.__map = []
		for (let i = 0; i < this._map_resolution[0]; i++) {
			this.__map[i] = Array(this._map_resolution[1]);
		}
		this._render_blocks = [];
		for (let i = 0; i < this._map_resolution[0]; i++) {
			this._render_blocks[i] = Array(this._map_resolution[1]);
		}

		this._reward = {
			step: -1,
			wall: -2,
			goal: 200,
			fail: -100
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

	get state() {
		return [this._position[0], this._position[1], this._orient];
	}

	get map() {
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

	init(r) {
		const dx = this._width / this._map_resolution[0];
		const dy = this._height / this._map_resolution[1];
		r.append("rect")
			.attr("x", this._width - this._goal_size[0])
			.attr("y", this._height - this._goal_size[1])
			.attr("width", this._goal_size[0])
			.attr("height", this._goal_size[1])
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("fill", "yellow")
		r.append("circle")
			.classed("agent", true)
			.attr("cx", this._position[0])
			.attr("cy", this._position[1])
			.attr("fill", d3.rgb(128, 128, 128, 0.8))
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("r", Math.min(dx, dy) * 2 / 3)
		r.append("rect")
			.attr("x", 0).attr("y", 0)
			.attr("width", this._width)
			.attr("height", this._height)
			.attr("opacity", 0)
			.on("click", () => {
				setTimeout(() => {
					this._env.render()
				}, 0)
			})
	}

	reset() {
		this._position = Array(2).fill(0);
		this._position[0] = Math.random() * this._width / 4
		this._position[1] = Math.random() * this._height / 4
		this._orient = Math.random() * 360;
		return this.state;
	}

	render(r) {
		const dx = this._width / this._map_resolution[0];
		const dy = this._height / this._map_resolution[1];
		const map = this.map;
		for (let i = 0; i < map.length; i++) {
			for (let j = 0; j < map[i].length; j++) {
				if (map[i][j] && !this._render_blocks[i][j]) {
					this._render_blocks[i][j] = r.append("rect")
						.classed("grid", true)
						.attr("x", dx * i)
						.attr("y", dy * j)
						.attr("width", dx)
						.attr("height", dy)
						.attr("fill", d3.rgb(0, 0, 0))
				} else if (!map[i][j] && this._render_blocks[i][j]) {
					this._render_blocks[i][j].remove();
					this._render_blocks[i][j] = null;
				}
			}
		}
		r.select("circle.agent")
			.attr("cx", this._position[0])
			.attr("cy", this._position[1])
	}

	step(action, epoch) {
		const [next_state, reward, done] = this.test(this.state, action, epoch);
		this._position = [next_state[0], next_state[1]];
		this._orient = next_state[2]
		return [next_state, reward, done];
	}

	test(state, action, epoch) {
		let reward = this._reward.step;
		let [x, y, o] = state;
		const map = this.map;
		const rx = this._width / this._map_resolution[0];
		const ry = this._height / this._map_resolution[1];
		const dx = Math.cos(this._orient) * this._velocity;
		const dy = Math.sin(this._orient) * this._velocity;
		if (action[0] === 0) {
			x += dx;
			y += dy;
		} else if (action[0] === 1) {
			x -= dx;
			y -= dy;
		} else if (action[0] === 2) {
			o += this._rotate;
		} else if (action[0] === 3) {
			o -= this._rotate;
		}
		o = (o + 360) % 360;
		if (x < 0 || y < 0 || x >= this._width || y >= this._height) {
			reward = this._reward.wall;
			[x, y, o] = state;
		} else if (map[Math.floor(x / rx)][Math.floor(y / ry)] !== 0) {
			reward = this._reward.wall;
			[x, y, o] = state;
		}
		const fail = this._max_step && this._max_step <= epoch
		const done = x > this._width - this._goal_size[0] && y > this._height - this._goal_size[1] || fail;
		if (done) reward = this._reward.goal;
		if (fail) reward = this._reward.fail;
		if (typeof reward === 'function') reward = reward(this)
		return [[x, y, o], reward, done];
	}
}

