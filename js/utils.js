export class BaseWorker {
	constructor(worker_file, options) {
		this._worker = new Worker(worker_file, options)
	}

	_postMessage(data) {
		const prom = new Promise(resolve => {
			const event_cb = e => {
				this._worker.removeEventListener('message', event_cb, false)
				resolve(e)
			}
			this._worker.addEventListener('message', event_cb, false)
		})
		this._worker.postMessage(data)
		return prom
	}

	terminate() {
		this._worker.terminate()
	}
}

const rgb = (r, g, b) => ({
	r,
	g,
	b,
	toString() {
		return `rgb(${r}, ${g}, ${b})`
	},
})
const categoryColors = {
	'-2': rgb(255, 0, 0),
	'-1': rgb(255, 255, 255),
	0: rgb(0, 0, 0),
}

export const specialCategory = {
	error: -2,
	errorRate: r => -1 - r,
	dummy: -2,
	density: d => -1 + d,
	never: -3,
}

export const getCategoryColor = function (i) {
	if (isNaN(i)) {
		return categoryColors['0']
	}
	if (!Number.isInteger(i)) {
		let clr_l = getCategoryColor(Math.floor(i))
		let clr_h = getCategoryColor(Math.ceil(i))
		let r = i - Math.floor(i)
		return rgb(
			Math.round(clr_l.r + (clr_h.r - clr_l.r) * r),
			Math.round(clr_l.g + (clr_h.g - clr_l.g) * r),
			Math.round(clr_l.b + (clr_h.b - clr_l.b) * r)
		)
	}
	i = i % 1000
	if (!categoryColors[i]) {
		let cnt = 0
		while (true) {
			cnt += 1
			const d = [Math.random(), Math.random(), Math.random()]
			if (d.every(v => v > 0.8)) {
				continue
			}
			let min_dis = Infinity
			for (const k of Object.keys(categoryColors)) {
				if (+k < 0 || Math.abs(+k - i) > 10) {
					continue
				}
				const dis =
					(d[0] - categoryColors[k].r / 256) ** 2 +
					(d[1] - categoryColors[k].g / 256) ** 2 +
					(d[2] - categoryColors[k].b / 256) ** 2
				if (dis < min_dis) {
					min_dis = dis
				}
			}
			if (Math.random() - cnt / 200 < Math.sqrt(min_dis / 3)) {
				categoryColors[i] = rgb(Math.floor(d[0] * 256), Math.floor(d[1] * 256), Math.floor(d[2] * 256))
				break
			}
		}
	}
	return categoryColors[i]
}

export class EventEmitter {
	constructor() {
		this._listeners = {}
	}

	on(name, listener, once = false) {
		if (!this._listeners[name]) {
			this._listeners[name] = []
		}
		this._listeners[name].push({ cb: listener, once })
	}

	once(name, listener) {
		this.on(name, listener, true)
	}

	emit(name) {
		const listeners = this._listeners[name]
		if (!listeners) {
			return
		}
		for (let i = listeners.length - 1; i >= 0; i--) {
			listeners[i].cb()
			if (listeners[i].once) {
				listeners.splice(i, 1)
			}
		}
	}

	off(name, listener) {
		const listeners = this._listeners[name]
		if (!listeners) {
			return
		}
		for (let i = listeners.length - 1; i >= 0; i--) {
			if (listeners[i] === listener) {
				listeners.splice(i, 1)
			}
		}
	}
}
