import { DataPointStarPlotter, DataPoint, DataLine } from '../../utils.js'

export default class CentroidPlotter {
	constructor(renderer) {
		this._renderer = renderer
		this._svg = renderer.svg
	}

	set(center, cls, { line = false, duration = 0 } = {}) {
		let centroidSvg = this._svg.querySelector('g.centroids')
		if (!centroidSvg) {
			centroidSvg = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			centroidSvg.classList.add('centroids')
			this._svg.appendChild(centroidSvg)
			const cline = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			cline.classList.add('c-line')
			centroidSvg.appendChild(cline)
			this._centroids_line = []
			this._centroids = null
		}
		const existCentroids = []
		if (this._centroids) {
			this._centroids.forEach(c => {
				if (Array.isArray(cls) && !cls.includes(c.category)) {
					c.remove()
				} else {
					existCentroids.push(c)
				}
			})
		}
		const p = this._renderer.points
		for (let k = 0; k < p.length; k++) {
			if (this._centroids_line[k]?._from !== p[k] || !line) {
				this._centroids_line[k]?.remove()
				this._centroids_line[k] = null
			}
		}
		this._centroids = center.map((c, i) => {
			let dp = Array.isArray(cls) ? existCentroids.find(e => e.category === cls[i]) : existCentroids[i]
			if (!dp) {
				dp = new DataPoint(centroidSvg, this._renderer.toPoint(c), Array.isArray(cls) ? cls[i] : cls)
				dp.plotter(DataPointStarPlotter)
			}
			if (line) {
				const p = this._renderer.points
				const y = this._renderer.datas.y
				for (let k = 0; k < p.length; k++) {
					if (y[k] === cls[i]) {
						if (!this._centroids_line[k]) {
							this._centroids_line[k] = new DataLine(centroidSvg.querySelector('.c-line'), p[k], dp)
						} else {
							this._centroids_line[k].to = dp
						}
					}
				}
			}
			return dp
		})
		Promise.resolve().then(() => {
			this._centroids.forEach((c, i) => {
				c.move(this._renderer.toPoint(center[i]), duration)
			})
		})
	}

	terminate() {
		this._svg.querySelector('g.centroids')?.remove()
	}
}
