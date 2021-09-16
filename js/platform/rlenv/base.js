export class RLEnvironmentBase {
	constructor(platform) {
		this._platform = platform
	}

	get epoch() {
		return this._platform.epoch
	}

	get platform() {
		return this._platform
	}

	get setting() {
		return this._platform.setting
	}

	get svg() {
		return this._platform.svg
	}

	set reward(value) {}

	init() {}

	close() {}

	reset(...agents) {}

	render(r) {}

	state(agent) {
		throw "Not implemented"
	}

	step(action, agent) {
		throw "Not implemented"
	}

	test(state, action, agent) {
		throw "Not implemented"
	}

	_grid() {
		return new GridWorld(this)
	}
}

class GridWorld {
	constructor(env) {
		this._env = env
		this._size = env._size
		this._r = env.platform._r.select("g.grid-world")

		this._svg_size = [env.platform.height, env.platform.width]
		this._grid_size = [this._svg_size[0] / this._size[0], this._svg_size[1] / this._size[1]]

		if (this._r.size() === 0) {
			this._r = env.platform._r.append("g")
				.classed("grid-world", true)
			this.reset()
		}
	}

	get gridSize() {
		return this._grid_size
	}

	reset() {
		this._r.selectAll("*").remove()
		this._grid = []
		for (let i = 0; i < this._size[0]; i++) {
			this._grid[i] = []
		}
	}

	at(i, j) {
		if (!this._grid[i][j]) {
			this._grid[i][j] = this._r.append("g")
				.style("transform", `scale(1, -1) translate(${j * this._grid_size[1]}px, ${-(i + 1) * this._grid_size[0]}px)`)
		}
		return this._grid[i][j]
	}

	close() {
		this._r.remove()
	}
}
