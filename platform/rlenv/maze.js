import { RLRealRange, RLIntRange, RLEnvironmentBase } from './base.js'

export default class SmoothMazeRLEnvironment extends RLEnvironmentBase {
	constructor(platform) {
		super(platform)
		this._width = this.platform.width;
		this._height = this.platform.height;

		this._points = this.platform.datas.x;
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
			const x = Math.floor(p[0] / dx);
			const y = Math.floor(p[1] / dy);
			this.__map[x][y] = 1 - this.__map[x][y];
		})
		this.__map[0][0] = 0;
		this.__map[this._map_resolution[0] - 1][this._map_resolution[1] - 1] = 0;
		return this.__map;
	}

	set reward(value) {
		this._reward = {
			step: -1,
			wall: -2,
			goal: 200,
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
					this.platform.render()
				}, 0)
			})
	}

	reset() {
		this._position = Array(2).fill(0);
		this._position[0] = Math.random() * this._width / 4
		this._position[1] = Math.random() * this._height / 4
		this._orient = Math.random() * 360;

		this.resetReward()
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

	step(action) {
		const [next_state, reward, done] = this.test(this.state, action);
		this._position = [next_state[0], next_state[1]];
		this._orient = next_state[2]
		this.addReward(reward, done)
		return [next_state, reward, done];
	}

	test(state, action) {
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
		const fail = this._max_step && this._max_step <= this.epoch
		const done = x > this._width - this._goal_size[0] && y > this._height - this._goal_size[1] || fail;
		if (done) reward = this._reward.goal;
		if (fail) reward = this._reward.fail;
		return [[x, y, o], reward, done];
	}
}

