export default class GridMazeRenderer {
	constructor(renderer) {
		this.renderer = renderer
		this._init_menu()
	}

	_init_menu() {
		const r = this.renderer.setting.rl.configElement
		r.replaceChildren()
		r.appendChild(document.createTextNode('Columns '))
		const columns = document.createElement('input')
		columns.type = 'number'
		columns.min = 1
		columns.max = 50
		columns.value = this.renderer.env._size[0]
		columns.onchange = () => {
			this.renderer.env._size[0] = +columns.value
			this.renderer.platform.init()
			this.renderer.setting.ml.refresh()
		}
		r.appendChild(columns)
		r.appendChild(document.createTextNode(' Rows '))
		const rows = document.createElement('input')
		rows.type = 'number'
		rows.min = 1
		rows.max = 50
		rows.value = this.renderer.env._size[1]
		rows.onchange = () => {
			this.renderer.env._size[1] = +rows.value
			this.renderer.platform.init()
			this.renderer.setting.ml.refresh()
		}
		r.appendChild(rows)

		const mazeButton = document.createElement('input')
		mazeButton.type = 'button'
		mazeButton.value = 'Maze'
		mazeButton.onclick = () => {
			this.renderer.env.resetMapAsMaze()
			this.renderer.render()
		}
		r.appendChild(mazeButton)
		const clearButton = document.createElement('input')
		clearButton.type = 'button'
		clearButton.value = 'Clear'
		clearButton.onclick = () => {
			this.renderer.env.resetMap()
			this.renderer.render()
		}
		r.appendChild(clearButton)
	}

	init(r) {
		const width = this.renderer.width
		const height = this.renderer.height
		const base = document.createElement('div')
		base.onclick = e => {
			const p = d3.pointer(e)
			const idx = this.renderer.env._size[0] / width
			const idy = this.renderer.env._size[1] / height
			const x = Math.floor(p[0] * idx)
			const y = Math.floor(p[1] * idy)
			this.renderer.env._points.push([x, y])
			e.stopPropagation()
			setTimeout(() => {
				this.renderer.render()
			}, 0)
		}
		r.appendChild(base)
		this._envrenderer = new Renderer(this.renderer.env, { width, height, g: base })
		this._envrenderer.init()
	}

	render(r, best_action) {
		this._envrenderer.render(best_action)
	}
}

const argmax = function (arr, key) {
	if (arr.length === 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.max(...arr))
}

class Renderer {
	constructor(env, config = {}) {
		this.env = env

		this._size = [config.width || 200, config.height || 200]

		this._points = []

		this._q = null

		this._show_max = false
		this._render_blocks = []

		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.svg.setAttribute('width', this._size[0])
		this.svg.setAttribute('height', this._size[1])
		this.svg.setAttribute('viewbox', '0 0 200 200')
		if (config.g) {
			config.g.replaceChildren(this.svg)
		}
	}

	get _action_str() {
		return this._dim === 1 ? ['→', '←'] : ['→', '↓', '←', '↑']
	}

	init() {
		const width = this._size[0]
		const height = this._size[1]
		const dx = width / this.env._size[0]
		const dy = height / this.env._size[1]
		this._render_blocks = []
		for (let i = 0; i < this.env._size[0]; i++) {
			this._render_blocks[i] = []
			for (let j = 0; j < this.env._size[1]; j++) {
				const g = (this._render_blocks[i][j] = document.createElementNS('http://www.w3.org/2000/svg', 'g'))
				g.classList.add('grid')
				g.setAttribute('stroke-width', 1)
				g.setAttribute('stroke', 'black')
				g.setAttribute('stroke-opacity', 0.2)
				this.svg.appendChild(g)
				if (this._show_max) {
					const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
					rect.setAttribute('x', dx * i)
					rect.setAttribute('y', dx * j)
					rect.setAttribute('width', dx)
					rect.setAttribute('height', dy)
					rect.setAttribute('fill', 'white')
					g.appendChild(rect)
					const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
					text.classList.add('value')
					text.setAttribute('x', dx * i)
					text.setAttribute('y', dy * (j + 0.8))
					text.setAttribute('font-size', 14)
					text.setAttribute('user-select', 'none')
					g.appendChild(text)
				} else {
					const c = [dx * (i + 0.5), dy * (j + 0.5)]
					const p = [
						[dx * (i + 1), dy * j],
						[dx * (i + 1), dy * (j + 1)],
						[dx * i, dy * (j + 1)],
						[dx * i, dy * j],
					]
					p[4] = p[0]
					for (let k = 0; k < 4; k++) {
						const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
						polygon.setAttribute(
							'points',
							`${p[k][0]},${p[k][1]} ${p[k + 1][0]},${p[k + 1][1]} ${c[0]},${c[1]}`
						)
						polygon.setAttribute('fill', 'white')
						g.appendChild(polygon)
						const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
						polygon.appendChild(title)
					}
				}
				const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
				text.classList.add('action')
				text.setAttribute('x', dx * (i + 0.5))
				text.setAttribute('y', dy * (j + 0.5))
				text.style.userSelect = 'none'
				text.style.transformBox = 'fill-box'
				text.style.transform = 'translate(-50%, 25%)'
				g.appendChild(text)
			}
		}
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
		circle.classList.add('agent')
		circle.setAttribute('cx', 0.5 * dx)
		circle.setAttribute('cy', 0.5 * dy)
		circle.setAttribute('fill', 'gray')
		circle.setAttribute('fill-opacity', 0.8)
		circle.setAttribute('stroke-width', 1)
		circle.setAttribute('stroke', 'black')
		circle.setAttribute('r', Math.min(dx, dy) / 3)
		this.svg.appendChild(circle)
	}

	_min(arr) {
		if (!Array.isArray(arr[0])) {
			return Math.min(...arr)
		}
		return Math.min(...arr.map(this._min.bind(this)))
	}

	_max(arr) {
		if (!Array.isArray(arr[0])) {
			return Math.max(...arr)
		}
		return Math.max(...arr.map(this._max.bind(this)))
	}

	render(best_action) {
		const width = this._size[0]
		const height = this._size[1]
		const dx = width / this.env._size[0]
		const dy = height / this.env._size[1]
		const map = this.env.map
		if (best_action) {
			this._q = best_action()
		}
		if (this._q) {
			const q = this._q
			const maxValue = this._max(q)
			const minValue = this._min(q)
			const absMaxValue = Math.max(Math.abs(maxValue), Math.abs(minValue))
			for (let i = 0; i < this.env._size[0]; i++) {
				if (!this._q[i]) continue
				const ba_row = this.env._dim === 2 ? q[i] : [q[i]]
				for (let j = 0; j < this.env._size[1]; j++) {
					if (!ba_row[j]) continue
					if (map[i][j] || (i === this.env._size[0] - 1 && j === this.env._size[1] - 1)) continue
					const ba = argmax(ba_row[j])
					const getColor = m => {
						const v = 255 * (1 - Math.abs(m) / absMaxValue)
						if (m > 0) {
							return `rgb(${v}, 255, ${v})`
						} else if (m < 0) {
							return `rgb(255, ${v}, ${v})`
						}
						return 'white'
					}
					this._render_blocks[i][j].querySelector('text.action').replaceChildren(this._action_str[ba])
					if (this._show_max) {
						const bm = Math.max(...ba_row[j])
						this._render_blocks[i][j].querySelector('rect').setAttribute('fill', getColor(bm))
						this._render_blocks[i][j].querySelector('text.value').replaceChildren(`${bm}`.slice(0, 6))
					} else {
						const polygons = this._render_blocks[i][j].querySelectorAll('polygon')
						for (let k = 0; k < polygons.length; k++) {
							polygons[k].setAttribute('fill', getColor(ba_row[j][k]))
							polygons[k].querySelector('title').replaceChildren(ba_row[j][k])
						}
					}
				}
			}
		} else {
			for (const polygon of this.svg.querySelectorAll('g.grid rect, g.grid polygon')) {
				polygon.setAttribute('fill', 'white')
			}
		}
		for (let i = 0; i < this.env._size[0]; i++) {
			for (let j = 0; j < this.env._size[1]; j++) {
				if (map[i][j]) {
					for (const polygon of this._render_blocks[i][j].querySelectorAll('rect, polygon')) {
						polygon.setAttribute('fill', 'black')
					}
				}
			}
		}
		for (const polygon of this._render_blocks[this.env._size[0] - 1][this.env._size[1] - 1].querySelectorAll(
			'rect, polygon'
		)) {
			polygon.setAttribute('fill', 'yellow')
		}
		const agent = this.svg.querySelector('circle.agent')
		agent.setAttribute('cx', (this.env._position[0] + 0.5) * dx)
		agent.setAttribute('cy', ((this.env._position[1] || 0) + 0.5) * dy)
	}
}
