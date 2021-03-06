import { RLRealRange, RLEnvironmentBase } from './base.js'

export default class PendulumRLEnvironment extends RLEnvironmentBase {
	constructor(platform) {
		super(platform)
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

	init(r) {
		const width = this.platform.width;
		const height = this.platform.height;
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

		return this.state();
	}

	render(r) {
		const width = this.platform.width;
		const height = this.platform.height;

		const p0 = [width / 2, height / 2];
		const p1 = [p0[0] + this._scale * Math.sin(this._theta), p0[1] + this._scale * Math.cos(this._theta)];
		r.select("line[name=link]")
			.attr("x2", p1[0])
			.attr("y2", p1[1])
	}

	state() {
		return [Math.cos(this._theta), Math.sin(this._theta), this._dtheta];
	}

	step(action, agent) {
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
		return {
			state: [Math.cos(t), Math.sin(t), dt],
			reward: -c,
			done: this.epoch >= this._max_step
		}
	}

	_angle_normalize(t) {
		t += Math.PI
		const pi2 = 2 * Math.PI
		while (t < 0) t += pi2
		while (t >= pi2) t -= pi2
		return t - Math.PI
	}
}

