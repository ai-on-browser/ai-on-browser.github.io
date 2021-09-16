import SmoothMazeRLEnvironment from '../../../lib/rl/maze.js'

export default class SmoothMazeRenderer extends SmoothMazeRLEnvironment {
	constructor(platform) {
		super(platform.width, platform.height)
		this.platform = platform
		this._width = this.platform.width
		this._height = this.platform.height

		this._render_blocks = []
		for (let i = 0; i < this._map_resolution[0]; i++) {
			this._render_blocks[i] = Array(this._map_resolution[1])
		}
	}

	init(r) {
		const dx = this._width / this._map_resolution[0]
		const dy = this._height / this._map_resolution[1]
		r.append('rect')
			.attr('x', this._width - this._goal_size[0])
			.attr('y', this._height - this._goal_size[1])
			.attr('width', this._goal_size[0])
			.attr('height', this._goal_size[1])
			.attr('stroke-width', 1)
			.attr('stroke', 'black')
			.attr('fill', 'yellow')
		r.append('circle')
			.classed('agent', true)
			.attr('cx', this._position[0])
			.attr('cy', this._position[1])
			.attr('fill', d3.rgb(128, 128, 128, 0.8))
			.attr('stroke-width', 1)
			.attr('stroke', 'black')
			.attr('r', (Math.min(dx, dy) * 2) / 3)
		this._blocks = r.append('g')
		const env = this
		r.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', this._width)
			.attr('height', this._height)
			.attr('opacity', 0)
			.on('click', function () {
				const p = d3.mouse(this)
				const dx = env._width / env._map_resolution[0]
				const dy = env._height / env._map_resolution[1]
				const x = Math.floor(p[0] / dx)
				const y = Math.floor(p[1] / dy)
				env._points.push([x, y])
				d3.event.stopPropagation()
				setTimeout(() => {
					env.platform.render()
				}, 0)
			})
	}

	render(r) {
		const dx = this._width / this._map_resolution[0]
		const dy = this._height / this._map_resolution[1]
		const map = this.map
		for (let i = 0; i < map.length; i++) {
			for (let j = 0; j < map[i].length; j++) {
				if (map[i][j] && !this._render_blocks[i][j]) {
					this._render_blocks[i][j] = this._blocks
						.append('rect')
						.classed('grid', true)
						.attr('x', dx * i)
						.attr('y', dy * j)
						.attr('width', dx)
						.attr('height', dy)
						.attr('fill', d3.rgb(0, 0, 0))
				} else if (!map[i][j] && this._render_blocks[i][j]) {
					this._render_blocks[i][j].remove()
					this._render_blocks[i][j] = null
				}
			}
		}
		r.select('circle.agent').attr('cx', this._position[0]).attr('cy', this._position[1])
	}
}
