import { getCategoryColor, specialCategory } from '../../utils.js'

class DataPointCirclePlotter {
	constructor(svg, item) {
		this._svg = svg
		this.item = item
		if (!item) {
			this.item = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
			this._svg.append(this.item)
		}
	}

	attr(name, value) {
		if (value !== undefined) {
			this.item.setAttribute(name, value)
			return this
		} else {
			return this.item.getAttribute(name)
		}
	}

	cx(value) {
		return this.attr('cx', value)
	}

	cy(value) {
		return this.attr('cy', value)
	}

	color(value) {
		return this.attr('fill', value)
	}

	radius(value) {
		return this.attr('r', value)
	}

	title(value) {
		this.item.replaceChildren()
		if (value && value !== '') {
			const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
			this.item.append(title)
			title.replaceChildren(value)
		}
		return this
	}

	remove() {
		return this.item.remove()
	}
}

export class DataPointStarPlotter {
	constructor(svg, item, polygon) {
		this._svg = svg
		this._c = [0, 0]
		this._r = 5
		if (item) {
			this.g = item
			this.polygon = polygon
		} else {
			this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			this._svg.append(this.g)
			this.polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
			this.g.append(this.polygon)
			this.polygon.setAttribute('points', this._path())
			this.polygon.setAttribute('stroke', 'black')
		}
	}

	_path() {
		return [
			[-Math.sin((Math.PI * 2) / 5), -Math.cos((Math.PI * 2) / 5)],
			[-Math.sin(Math.PI / 5) / 2, -Math.cos(Math.PI / 5) / 2],
			[0, -1],
			[Math.sin(Math.PI / 5) / 2, -Math.cos(Math.PI / 5) / 2],
			[Math.sin((Math.PI * 2) / 5), -Math.cos((Math.PI * 2) / 5)],
			[Math.sin((Math.PI * 3) / 5) / 2, -Math.cos((Math.PI * 3) / 5) / 2],
			[Math.sin((Math.PI * 4) / 5), -Math.cos((Math.PI * 4) / 5)],
			[0, 1 / 2],
			[-Math.sin((Math.PI * 4) / 5), -Math.cos((Math.PI * 4) / 5)],
			[-Math.sin((Math.PI * 3) / 5) / 2, -Math.cos((Math.PI * 3) / 5) / 2],
		].reduce((acc, v) => acc + v[0] * this._r + ',' + v[1] * this._r + ' ', '')
	}

	cx(value) {
		this._c[0] = value || this._c[0]
		if (value !== undefined) {
			this.g.setAttribute('transform', 'translate(' + this._c[0] + ', ' + this._c[1] + ')')
			return this
		}
		return this._c[0]
	}

	cy(value) {
		this._c[1] = value || this._c[1]
		if (value !== undefined) {
			this.g.setAttribute('transform', 'translate(' + this._c[0] + ', ' + this._c[1] + ')')
			return this
		}
		return this._c[1]
	}

	color(value) {
		if (value !== undefined) {
			this.polygon.setAttribute('fill', value)
			return this
		}
		return this.polygon.getAttribute('fill')
	}

	radius(value) {
		this._r = value || this._r
		if (value !== undefined) {
			this.polygon.setAttribute('points', this._path())
			return this
		}
		return this._r
	}

	title(value) {
		this.polygon.replaceChildren()
		if (value && value !== '') {
			const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
			this.polygon.append(title)
			title.replaceChildren(value)
		}
		return this
	}

	duration(value) {
		this.g.style.transitionDuration = value + 'ms'
		this.g.style.transitionTimingFunction = 'linear'
		this.polygon.style.transitionDuration = value + 'ms'
		this.polygon.style.transitionTimingFunction = 'linear'
		return this
	}

	remove() {
		return this.g.remove()
	}
}

export class DataPoint {
	constructor(svg, position = [0, 0], category = 0) {
		this.svg = svg
		this._pos = position
		this._color = getCategoryColor(category)
		this._category = category
		this._radius = 5
		this._plotter = new DataPointCirclePlotter(this.svg)
		this._binds = []
		this.display()
	}

	display() {
		this._plotter
			.cx('' + this._pos[0])
			.cy('' + this._pos[1])
			.radius(this._radius)
			.color(this._color)
		this._binds.forEach(e => e.display())
	}

	get item() {
		return this._plotter.item
	}

	get at() {
		return this._pos
	}
	set at(position) {
		this._pos = position
		this.display()
	}
	get color() {
		return this._color
	}
	get category() {
		return this._category
	}
	set category(category) {
		this._category = category
		this._color = getCategoryColor(category)
		this.display()
	}
	get radius() {
		return this._radius
	}
	set radius(radius) {
		this._radius = radius
		this.display()
	}
	set title(value) {
		this._plotter.title(value)
	}

	plotter(plt) {
		this._plotter.remove()
		this._plotter = new plt(this.svg)
		this.display()
	}

	remove() {
		this._plotter.remove()
		this._binds.forEach(e => e.remove())
	}

	move(to, duration = 1000) {
		this._pos = to
		this._plotter.duration(duration).cx(this._pos[0]).cy(this._pos[1])
		this._binds.forEach(e => e.move(duration))
	}

	bind(e) {
		this._binds.push(e)
	}

	removeBind(e) {
		this._binds = this._binds.filter(b => b !== e)
	}
}

export class DataCircle {
	constructor(svg, at) {
		this._svg = svg
		this.item = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
		this._svg.append(this.item)
		this.item.setAttribute('fill-opacity', 0)
		this._at = at
		this._color = null
		this._width = 4
		at.bind(this)
		this.display()
	}

	get color() {
		return this._color || this._at.color
	}
	set color(value) {
		this._color = value
		this.display()
	}

	set title(value) {
		this.item.replaceChildren()
		if (value && value.length > 0) {
			const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
			this.item.append(title)
			title.replaceChildren(value)
		}
	}

	display() {
		this.item.setAttribute('cx', this._at.at[0])
		this.item.setAttribute('cy', this._at.at[1])
		this.item.setAttribute('stroke', this.color)
		this.item.setAttribute('stroke-width', this._width)
		this.item.setAttribute('r', this._at._radius)
	}

	remove() {
		this.item.remove()
		this._at.removeBind(this)
	}
}

export class DataLine {
	constructor(svg, from, to) {
		this._svg = svg
		this.item = document.createElementNS('http://www.w3.org/2000/svg', 'line')
		this._svg.append(this.item)
		this._from = from
		this._to = to
		this._remove_listener = null
		from && from.bind(this)
		to && to.bind(this)
		this.display()
	}

	set from(value) {
		this._from && this._from.removeBind(this)
		this._from = value
		this._from.bind(this)
	}

	set to(value) {
		this._to && this._to.removeBind(this)
		this._to = value
		this._to.bind(this)
	}

	display() {
		if (!this._from || !this._to) return
		this.item.setAttribute('x1', this._from.at[0])
		this.item.setAttribute('y1', this._from.at[1])
		this.item.setAttribute('x2', this._to.at[0])
		this.item.setAttribute('y2', this._to.at[1])
		this.item.setAttribute('stroke', this._from.color)
	}

	move(duration = 1000) {
		if (!this._from || !this._to) return
		if (duration === 0) {
			this.display()
			return
		}
		const fromx1 = +this.item.getAttribute('x1')
		const fromy1 = +this.item.getAttribute('y1')
		const fromx2 = +this.item.getAttribute('x2')
		const fromy2 = +this.item.getAttribute('y2')
		const dx1 = this._from.at[0] - fromx1
		const dy1 = this._from.at[1] - fromy1
		const dx2 = this._to.at[0] - fromx2
		const dy2 = this._to.at[1] - fromy2

		let start = 0
		let prev = 0
		const step = timestamp => {
			if (!start) {
				start = timestamp
			}
			const elp = Math.min(1, (timestamp - start) / duration)
			if (Math.abs(timestamp - prev) > 15) {
				if (dx1 !== 0) this.item.setAttribute('x1', fromx1 + dx1 * elp)
				if (dy1 !== 0) this.item.setAttribute('y1', fromy1 + dy1 * elp)
				if (dx2 !== 0) this.item.setAttribute('x2', fromx2 + dx2 * elp)
				if (dy2 !== 0) this.item.setAttribute('y2', fromy2 + dy2 * elp)
				if (elp >= 1) {
					return
				}
				prev = timestamp
			}
			requestAnimationFrame(step)
		}
		requestAnimationFrame(step)
	}

	remove() {
		this.item.remove()
		this._from && this._from.removeBind(this)
		this._from = null
		this._to && this._to.removeBind(this)
		this._to = null
		this._remove_listener && this._remove_listener(this)
	}

	setRemoveListener(cb) {
		this._remove_listener = cb
	}
}

export class DataConvexHull {
	constructor(svg, points) {
		this._svg = svg
		this.item = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
		this._svg.append(this.item)
		this._points = points
		this._color = null
		this.display()
	}

	get color() {
		return this._color || this._points[0].color
	}
	set color(value) {
		this._color = value
		this.display()
	}

	_argmin(arr, key) {
		if (arr.length === 0) {
			return -1
		}
		arr = key ? arr.map(key) : arr
		return arr.indexOf(Math.min(...arr))
	}

	_convexPoints() {
		if (this._points.length <= 3) {
			return this._points
		}
		const cp = [].concat(this._points)
		const basei = this._argmin(cp, p => p.at[1])
		const sub = (a, b) => a.map((v, i) => v - b[i])
		const base = cp.splice(basei, 1)[0]
		cp.sort((a, b) => {
			const dva = sub(a.at, base.at)
			const dvb = sub(b.at, base.at)
			return dva[0] / Math.hypot(...dva) - dvb[0] / Math.hypot(...dvb)
		})
		const outers = [base]
		for (let k = 0; k < cp.length; k++) {
			while (outers.length >= 3) {
				const n = outers.length
				const v = sub(outers[n - 1].at, outers[n - 2].at)
				const newv = sub(cp[k].at, outers[n - 2].at)
				const basev = sub(base.at, outers[n - 2].at)
				if ((v[0] * basev[1] - v[1] * basev[0]) * (v[0] * newv[1] - v[1] * newv[0]) > 0) {
					break
				}
				outers.pop()
			}
			outers.push(cp[k])
		}
		return outers
	}

	display() {
		const points = this._convexPoints().reduce((acc, p) => acc + p.at[0] + ',' + p.at[1] + ' ', '')
		this.item.setAttribute('points', points)
		this.item.setAttribute('stroke', this.color)
		this.item.setAttribute('fill', this.color)
		this.item.setAttribute('opacity', 0.5)
	}

	remove() {
		this.item.remove()
	}
}

class DataMap {
	constructor() {
		this._data = []
		this._size = [0, 0]
	}

	get rows() {
		return this._size[0]
	}

	get cols() {
		return this._size[1]
	}

	at(x, y) {
		return x < 0 || !this._data[x] || y < 0 ? undefined : this._data[x][y]
	}

	set(x, y, value) {
		if (!this._data[x]) this._data[x] = []
		this._data[x][y] = value
		this._size[0] = Math.max(this._size[0], x + 1)
		this._size[1] = Math.max(this._size[1], y + 1)
	}
}

export class DataHulls {
	constructor(svg, categories, tileSize, use_canvas = false, mousemove = null) {
		this._svg = svg
		this._categories = categories
		this._tileSize = tileSize
		if (!Array.isArray(this._tileSize)) {
			this._tileSize = [this._tileSize, this._tileSize]
		}
		this._use_canvas = use_canvas
		this._mousemove = mousemove
		this.display()
	}

	display() {
		if (this._use_canvas) {
			const root_svg = document.querySelector('#plot-area svg')
			const canvas = document.createElement('canvas')
			canvas.width = root_svg.getBoundingClientRect().width
			canvas.height = root_svg.getBoundingClientRect().height
			const ctx = canvas.getContext('2d')
			for (let i = 0; i < this._categories.length; i++) {
				for (let j = 0; j < this._categories[i].length; j++) {
					ctx.fillStyle = getCategoryColor(this._categories[i][j])
					ctx.fillRect(
						Math.round(j * this._tileSize[0]),
						Math.round(i * this._tileSize[1]),
						Math.ceil(this._tileSize[0]),
						Math.ceil(this._tileSize[1])
					)
				}
			}
			const img = document.createElementNS('http://www.w3.org/2000/svg', 'image')
			this._svg.append(img)
			img.setAttribute('x', 0)
			img.setAttribute('y', 0)
			img.setAttribute('width', canvas.width)
			img.setAttribute('height', canvas.height)
			img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', canvas.toDataURL())
			img.onmousemove = e => {
				const mousePos = d3.pointer(e)
				this._mousemove &&
					this._mousemove(
						this._categories[Math.round(mousePos[1] / this._tileSize)][
							Math.round(mousePos[0] / this._tileSize)
						]
					)
			}
			return
		}
		const categories = new DataMap()
		for (let i = 0; i < this._categories.length; i++) {
			for (let j = 0; j < this._categories[i].length; j++) {
				if (this._categories[i][j] === null) {
					categories.set(i, j, null)
				} else {
					categories.set(i, j, Math.round(this._categories[i][j]))
				}
			}
		}
		const invalid = []
		for (let i = 0; i < categories.rows; i++) {
			for (let j = 0; j < categories.cols; j++) {
				if (categories.at(i, j) <= specialCategory.never) {
					continue
				}
				const targetCategory = categories.at(i, j)
				const targets = new DataMap()
				const hulls = new DataMap()
				const checkTargets = [[i, j]]
				let ignore = false
				while (checkTargets.length > 0) {
					const [y, x] = checkTargets.pop()
					if (categories.at(y, x) === targetCategory) {
						targets.set(y, x, 1)
						categories.set(y, x, specialCategory.never)
						checkTargets.push([y - 1, x])
						checkTargets.push([y + 1, x])
						checkTargets.push([y, x - 1])
						checkTargets.push([y, x + 1])
						hulls.set(
							y,
							x,
							(targets.at(y - 1, x) !== 1 && categories.at(y - 1, x) !== targetCategory) ||
								(targets.at(y + 1, x) !== 1 && categories.at(y + 1, x) !== targetCategory) ||
								(targets.at(y, x - 1) !== 1 && categories.at(y, x - 1) !== targetCategory) ||
								(targets.at(y, x + 1) !== 1 && categories.at(y, x + 1) !== targetCategory)
						)
					} else if (categories.at(y, x) === undefined && targetCategory === null) {
						ignore = true
					}
				}
				if (ignore) continue
				const hullPoints = [[i, j]]
				let y = i,
					x = j + 1
				const max_count = categories.rows * categories.cols
				let count = 0
				let ori = 'r'
				while (y != i || x != j) {
					const lt = targets.at(y - 1, x - 1)
					const rt = targets.at(y - 1, x)
					const lb = targets.at(y, x - 1)
					const rb = targets.at(y, x)
					if (rt && lt && lb && rb) {
						invalid.push([y, x])
						break
					} else if (rt && lt && lb) {
						hullPoints.push([y, x])
						ori = 'b'
					} else if (lt && lb && rb) {
						hullPoints.push([y, x])
						ori = 'r'
					} else if (lb && rb && rt) {
						hullPoints.push([y, x])
						ori = 't'
					} else if (rb && rt && lt) {
						hullPoints.push([y, x])
						ori = 'l'
					} else if (rt && lt) {
						ori = 'l'
					} else if (lt && lb) {
						ori = 'b'
					} else if (lb && rb) {
						ori = 'r'
					} else if (rb && rt) {
						ori = 't'
					} else if (rt && lb) {
						hullPoints.push([y, x])
						if (ori === 'l') {
							ori = 't'
						} else if (ori === 'r') {
							ori = 'b'
						} else {
							invalid.push([y, x])
						}
					} else if (lt && rb) {
						hullPoints.push([y, x])
						if (ori === 't') {
							ori = 'r'
						} else if (ori === 'b') {
							ori = 'l'
						} else {
							invalid.push([y, x])
						}
					} else if (rt) {
						hullPoints.push([y, x])
						ori = 't'
					} else if (lt) {
						hullPoints.push([y, x])
						ori = 'l'
					} else if (lb) {
						hullPoints.push([y, x])
						ori = 'b'
					} else if (rb) {
						hullPoints.push([y, x])
						ori = 'r'
					} else {
						invalid.push([y, x])
						break
					}
					if (ori === 'r') {
						x += 1
					} else if (ori === 'l') {
						x -= 1
					} else if (ori === 'b') {
						y += 1
					} else if (ori === 't') {
						y -= 1
					}
					count += 1
					if (count >= max_count) {
						invalid.push([y, x])
						break
					}
				}
				const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
				this._svg.append(polygon)
				polygon.setAttribute(
					'points',
					hullPoints.reduce(
						(acc, p) => acc + p[1] * this._tileSize[0] + ',' + p[0] * this._tileSize[1] + ' ',
						''
					)
				)
				polygon.setAttribute('fill', targetCategory === null ? 'white' : getCategoryColor(targetCategory))
			}
		}

		if (invalid.length > 0) {
			let s = ''
			if (invalid.length > 100) {
				s = '['
				s += invalid.slice(0, 50).map(JSON.stringify).join(',')
				s += ',...,'
				s += invalid.slice(-50).map(JSON.stringify).join(',')
				s += ']'
			} else {
				s = JSON.stringify(invalid)
			}
			console.log('invalid loop condition at ' + s)
		}
	}
}
