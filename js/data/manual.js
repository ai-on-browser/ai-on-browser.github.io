import { BaseData } from './base.js'
import Matrix from '../../lib/util/matrix.js'
import { specialCategory, getCategoryColor, DataPoint } from '../utils.js'

const normal_random = function (m = 0, s = 1) {
	const std = Math.sqrt(s)
	const x = Math.random()
	const y = Math.random()
	const X = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y)
	const Y = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y)
	return [X * std + m, Y * std + m]
}

const dataCreateTools = {
	point: (data, r) => {
		let dp = null
		return {
			init: () => {
				dp = new DataPoint(r, [0, 0], specialCategory.dummy)
			},
			move: (point, values) => {
				dp.at = point
			},
			click: (point, values) => {
				data.push(point, values.category)
			},
			terminate: () => {
				dp?.remove()
			},
			menu: [
				{
					title: 'category',
					type: 'category',
					min: 0,
					max: 100,
					value: 1,
					key: 'category',
				},
			],
		}
	},
	circle: (data, r) => {
		let dp = null
		return {
			init: () => {
				dp = r.append('circle').attr('r', 0).attr('fill', 'red').attr('fill-opacity', 0.2).attr('stroke', 'red')
			},
			move: (point, values) => {
				dp.attr('cx', point[0])
				dp.attr('cy', point[1])
				dp.attr('r', values.radius)
			},
			click: (point, values) => {
				for (let i = 0; i < values.count; i++) {
					const c = [Math.random() * 2 - 1, Math.random() * 2 - 1]
					while (c[0] ** 2 + c[1] ** 2 > 1) {
						c[0] = Math.random() * 2 - 1
						c[1] = Math.random() * 2 - 1
					}
					data.push([point[0] + c[0] * values.radius, point[1] + c[1] * values.radius], values.category)
				}
			},
			terminate: () => {
				dp?.remove()
			},
			menu: [
				{
					title: 'radius',
					type: 'number',
					min: 1,
					max: 200,
					value: 50,
					key: 'radius',
				},
				{
					title: 'category',
					type: 'category',
					min: 0,
					max: 100,
					value: 1,
					key: 'category',
				},
				{
					title: 'count',
					type: 'number',
					min: 1,
					max: 100,
					value: 10,
					key: 'count',
				},
			],
		}
	},
	square: (data, r) => {
		let dp = null
		return {
			init: () => {
				dp = r.append('rect').attr('fill', 'red').attr('fill-opacity', 0.2).attr('stroke', 'red')
			},
			move: (point, values) => {
				dp.attr('x', point[0] - values.size)
				dp.attr('y', point[1] - values.size)
				dp.attr('width', 2 * values.size)
				dp.attr('height', 2 * values.size)
			},
			click: (point, values) => {
				for (let i = 0; i < values.count; i++) {
					const c = [Math.random() * 2 - 1, Math.random() * 2 - 1]
					data.push([point[0] + c[0] * values.size, point[1] + c[1] * values.size], values.category)
				}
			},
			terminate: () => {
				dp?.remove()
			},
			menu: [
				{
					title: 'size',
					type: 'number',
					min: 1,
					max: 200,
					value: 50,
					key: 'size',
				},
				{
					title: 'category',
					type: 'category',
					min: 0,
					max: 100,
					value: 1,
					key: 'category',
				},
				{
					title: 'count',
					type: 'number',
					min: 1,
					max: 100,
					value: 10,
					key: 'count',
				},
			],
		}
	},
	gaussian: (data, r) => {
		let dp = null
		const var2xy = values => {
			const s = [values.varx, values.cov, values.cov, values.vary]
			const su2 = (s[0] + s[3] + Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2
			const sv2 = (s[0] + s[3] - Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2
			const c = 2.146
			let t = (360 * Math.atan((su2 - s[0]) / s[1])) / (2 * Math.PI)
			if (isNaN(t)) {
				t = 0
			}
			values.rot = t
			values.rx = c * Math.sqrt(su2)
			values.ry = c * Math.sqrt(sv2)
		}
		const xy2var = values => {
			const c = 2.146
			const su2 = (values.rx / c) ** 2
			const sv2 = (values.ry / c) ** 2
			const t = Math.tan((values.rot * 2 * Math.PI) / 360)

			const t2 = t ** 2
			const a = 1 + 1 / t2
			const b = su2 + sv2 + (2 * su2) / t2
			const p = Math.sqrt(b ** 2 - 4 * a * (su2 ** 2 / t2 + su2 * sv2))
			if (isNaN(p)) {
				values.varx = su2
				values.vary = sv2
				values.cov = 0
				return
			}

			const s0 = (b - p) / (2 * a)
			const s3 = su2 + sv2 - s0
			const s1 = (su2 - s0) / t

			values.varx = s0
			values.vary = s3
			values.cov = s1
		}
		return {
			init: () => {
				dp = r
					.append('ellipse')
					.attr('rx', 0)
					.attr('ry', 0)
					.attr('fill', 'red')
					.attr('fill-opacity', 0.2)
					.attr('stroke', 'red')
			},
			move: (point, values) => {
				const cn = point
				const s = [values.varx, values.cov, values.cov, values.vary]
				const su2 = (s[0] + s[3] + Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2
				const sv2 = (s[0] + s[3] - Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2
				const c = 2.146
				let t = (360 * Math.atan((su2 - s[0]) / s[1])) / (2 * Math.PI)
				if (isNaN(t)) {
					t = 0
				}
				dp.attr('rx', c * Math.sqrt(su2))
					.attr('ry', c * Math.sqrt(sv2))
					.attr('transform', 'translate(' + cn[0] + ',' + cn[1] + ') ' + 'rotate(' + t + ')')
			},
			click: (point, values) => {
				const s = [
					[values.varx, values.cov],
					[values.cov, values.vary],
				]
				const m = Matrix.randn(values.count, 2, point, s).toArray()
				for (let i = 0; i < m.length; i++) {
					data.push(m[i], values.category)
				}
			},
			terminate: () => {
				dp?.remove()
			},
			menu: [
				{
					title: 'var x',
					type: 'number',
					min: 1,
					max: 10000,
					value: 1600,
					key: 'varx',
					onchange: var2xy,
				},
				{
					title: 'var y',
					type: 'number',
					min: 1,
					max: 10000,
					value: 800,
					key: 'vary',
					onchange: var2xy,
				},
				{
					title: 'cov',
					type: 'number',
					min: -1000,
					max: 1000,
					value: 800,
					key: 'cov',
					onchange: var2xy,
				},
				{
					title: 'rx',
					type: 'number',
					min: 0,
					max: 1000,
					value: 98.21150163574005,
					key: 'rx',
					onchange: xy2var,
				},
				{
					title: 'ry',
					type: 'number',
					min: 0,
					max: 1000,
					value: 37.5134555386868,
					key: 'ry',
					onchange: xy2var,
				},
				{
					title: 'rot',
					type: 'number',
					min: -180,
					max: 180,
					value: 31.717474411461016,
					key: 'rot',
					onchange: xy2var,
				},
				{
					title: 'category',
					type: 'category',
					min: 0,
					max: 100,
					value: 1,
					key: 'category',
				},
				{
					title: 'count',
					type: 'number',
					min: 1,
					max: 100,
					value: 10,
					key: 'count',
				},
			],
		}
	},
	eraser: (data, r) => {
		let dp = []
		return {
			init: values => {
				dp.forEach(e => e.remove())
				dp.length = 0
				if (values.mode === 'all') {
					for (const point of data.points) {
						dp.push(
							r
								.append('circle')
								.attr('r', point.radius)
								.attr('fill', 'red')
								.attr('cx', point.at[0])
								.attr('cy', point.at[1])
						)
					}
				} else if (values.mode === 'nearest') {
					dp.push(r.append('circle').attr('r', data.points[0].radius).attr('fill', 'red'))
				} else if (values.mode === 'circle') {
					dp.push(r.append('circle').attr('r', 50).attr('fill', 'red').attr('fill-opacity', 0.2))
				}
			},
			move: (point, values) => {
				if (values.mode === 'nearest') {
					let mind = Infinity
					let p = null
					for (const ps of data.points) {
						const d = point.reduce((s, v, i) => s + (v - ps.at[i]) ** 2, 0)
						if (d < mind) {
							p = ps
							mind = d
						}
					}
					dp[0].attr('cx', p.at[0])
					dp[0].attr('cy', p.at[1])
					dp[0].attr('r', p.radius)
				} else if (values.mode === 'circle') {
					dp[0].attr('cx', point[0])
					dp[0].attr('cy', point[1])
					for (let i = 1; i < dp.length; i++) {
						dp[i].remove()
					}
					dp.length = 1
					for (const ps of data.points) {
						const d = point.reduce((s, v, i) => s + (v - ps.at[i]) ** 2, 0)
						if (Math.sqrt(d) < 50) {
							dp.push(
								r
									.append('circle')
									.attr('r', ps.radius)
									.attr('fill', 'red')
									.attr('cx', ps.at[0])
									.attr('cy', ps.at[1])
							)
						}
					}
				}
			},
			click: (point, values) => {
				if (values.mode === 'all') {
					data.remove()
					dp.forEach(e => e.remove())
					dp.length = 0
				} else if (values.mode === 'nearest') {
					let mind = Infinity
					let mind2 = Infinity
					let mini = null
					let mini2 = null
					for (let k = 0; k < data.length; k++) {
						const d = point.reduce((s, v, i) => s + (v - data.points[k].at[i]) ** 2, 0)
						if (d < mind) {
							mini2 = mini
							mini = k
							mind2 = mind
							mind = d
						} else if (d < mind2) {
							mini2 = k
							mind2 = d
						}
					}
					if (mini2) {
						dp[0].attr('cx', data.points[mini2].at[0])
						dp[0].attr('cy', data.points[mini2].at[1])
					}
					data.splice(mini, 1)
				} else if (values.mode === 'circle') {
					for (let k = data.length - 1; k >= 0; k--) {
						const d = point.reduce((s, v, i) => s + (v - data.points[k].at[i]) ** 2, 0)
						if (Math.sqrt(d) < 50) {
							data.splice(k, 1)
						}
					}
					for (let i = 1; i < dp.length; i++) {
						dp[i].remove()
					}
					dp.length = 1
				}
			},
			terminate: () => {
				dp.forEach(e => e.remove())
				dp.length = 0
			},
			menu: [
				{
					title: 'mode',
					type: 'select',
					options: [
						{
							value: 'nearest',
							text: 'nearest',
						},
						{
							value: 'circle',
							text: 'circle',
						},
						{
							value: 'all',
							text: 'all',
						},
					],
					key: 'mode',
				},
			],
		}
	},
}

const dataPresets = {
	clusters: {
		init: elm => {
			elm.appendChild(document.createTextNode(' n '))
			const num = document.createElement('input')
			num.type = 'number'
			num.name = 'n'
			num.min = 1
			num.max = 10
			num.value = 3
			elm.appendChild(num)
		},
		make: (data, elm) => {
			const n = +elm.querySelector('[name=n]').value
			const r = 0
			const noise = 2500
			const count = 100
			const w = data._manager.platform.width
			const h = data._manager.platform.height
			let category = 1
			const bc = []
			const datas = []
			for (let k = 0; k < n; k++, category++) {
				const center = [Math.random(), Math.random()]
				let cnt = 0
				while (
					bc.some(c => {
						return (
							Math.sqrt(center.reduce((s, v, i) => s + (v - c[i]) ** 2, 0)) <
							Math.random() / ((cnt++ / 5) ** 2 + 1)
						)
					})
				) {
					center[0] = Math.random()
					center[1] = Math.random()
				}
				bc.push(center.concat())
				center[0] = ((2 * w) / 3) * center[0] + w / 6
				center[1] = ((2 * h) / 3) * center[1] + h / 6
				for (let i = 0; i < count; i++) {
					let c = [0, 0]
					if (r > 0) {
						do {
							c = [Math.random() * 2 - 1, Math.random() * 2 - 1]
						} while (c[0] ** 2 + c[1] ** 2 <= 1)
					}
					c[0] = c[0] * r + center[0]
					c[1] = c[1] * r + center[1]
					if (noise > 0) {
						const nr = normal_random(0, noise)
						c[0] += nr[0]
						c[1] += nr[1]
					}
					datas.push(c, category)
				}
			}
			data.push(...datas)
		},
	},
	moons: {
		make: (data, elm) => {
			const size = 200
			const noise = 20
			const count = 100
			let category = 1
			const datas = []
			for (let k = 0; k < 2; k++, category++) {
				for (let i = 0; i < count; i++) {
					const r = Math.random() * Math.PI
					const c = [Math.cos(r) * size, Math.sin(r) * size]
					if (noise > 0) {
						const nr = normal_random(0, noise)
						c[0] += nr[0]
						c[1] += nr[1]
					}
					if (category === 2) {
						c[0] = size - c[0]
						c[1] = size - c[1] - size / 2
					}
					c[0] += data._manager.platform.width / 2 - size / 2
					c[1] += data._manager.platform.height / 2 - size / 4
					datas.push(c, category)
				}
			}
			data.push(...datas)
		},
	},
	circle: {
		init: elm => {
			elm.appendChild(document.createTextNode(' n '))
			const num = document.createElement('input')
			num.type = 'number'
			num.name = 'n'
			num.min = 1
			num.max = 10
			num.value = 3
			elm.appendChild(num)
		},
		make: (data, elm) => {
			const n = +elm.querySelector('[name=n]').value
			const noise = 50
			const count = 100
			const step = Math.min(data._manager.platform.width, data._manager.platform.height) / (2 * n)
			const datas = []
			for (let k = 0; k < n; k++) {
				for (let i = 0; i < count; i++) {
					const r = Math.random() * 2 * Math.PI
					const c = [Math.cos(r) * step * k, Math.sin(r) * step * k]
					if (noise > 0) {
						const nr = normal_random(0, noise)
						c[0] += nr[0]
						c[1] += nr[1]
					}
					c[0] += data._manager.platform.width / 2
					c[1] += data._manager.platform.height / 2
					datas.push(c, k + 1)
				}
			}
			data.push(...datas)
		},
	},
	check: {
		make: (data, elm) => {
			const count = 100
			const size = Math.min(data._manager.platform.width, data._manager.platform.height) / 3
			const c = [data._manager.platform.width / 2, data._manager.platform.height / 2]
			const datas = []
			for (let i = 0; i < count; i++) {
				datas.push([c[0] + Math.random() * size, c[1] + Math.random() * size], 1)
				datas.push([c[0] - Math.random() * size, c[1] - Math.random() * size], 1)
			}
			for (let i = 0; i < count; i++) {
				datas.push([c[0] + Math.random() * size, c[1] - Math.random() * size], 2)
				datas.push([c[0] - Math.random() * size, c[1] + Math.random() * size], 2)
			}
			data.push(...datas)
		},
	},
}

class ContextMenu {
	constructor() {
		this._r = document.createElement('div')
		this._r.classList.add('context-menu')
		document.querySelector('body').appendChild(this._r)
		this._r.onclick = e => e.stopPropagation()
		this._showMenu = e => {
			this.show([e.pageX, e.pageY])
			const close = () => {
				this.hide()
				document.body.removeEventListener('click', close)
			}
			document.body.addEventListener('click', close)
		}
		this._orgoncontextmenu = document.body.oncontextmenu
	}

	terminate() {
		this.create()
		this._r.remove()
	}

	create(items) {
		this._r.replaceChildren()
		if (!items || items.length === 0) {
			document.body.removeEventListener('contextmenu', this._showMenu)
			document.body.oncontextmenu = this._orgoncontextmenu
			return
		}
		document.body.addEventListener('contextmenu', this._showMenu)
		document.body.oncontextmenu = () => false

		const ul = document.createElement('ul')
		this._r.appendChild(ul)
		this._properties = {}
		for (let i = 0; i < items.length; i++) {
			const li = document.createElement('li')
			ul.appendChild(li)
			const title = document.createElement('span')
			title.classList.add('item-title')
			title.innerText = items[i].title
			li.appendChild(title)
			switch (items[i].type) {
				case 'category':
				case 'number': {
					const setColor = value => {
						const bgc = getCategoryColor(value)
						li.style.backgroundColor = bgc
						const wc = bgc.r * 0.299 + bgc.g * 0.587 + bgc.b * 0.114 < 128 ? 'white' : 'black'
						li.style.color = wc
					}
					const e = document.createElement('input')
					e.type = 'number'
					e.min = items[i].min
					e.max = items[i].max
					e.value = items[i].value
					e.onchange = () => {
						items[i].onchange?.(this._properties)
						if (items[i].type === 'category') {
							setColor(+e.value)
						}
					}
					li.appendChild(e)
					if (items[i].type === 'category') {
						setColor(items[i].value)
					}
					Object.defineProperty(this._properties, items[i].key, {
						get: () => +e.value,
						set: value => {
							e.value = value
						},
					})
					break
				}
				case 'select': {
					const e = document.createElement('select')
					e.onchange = () => items[i].onchange?.(this._properties)
					for (const option of items[i].options) {
						const opt = document.createElement('option')
						opt.value = option.value
						opt.innerText = option.text
						e.appendChild(opt)
					}
					li.appendChild(e)
					Object.defineProperty(this._properties, items[i].key, {
						get: () => e.value,
						set: value => {
							e.value = value
						},
					})
					break
				}
			}
		}
	}

	show(p) {
		this._r.classList.add('show')
		this._r.style.left = p[0] + 'px'
		this._r.style.top = p[1] + 'px'
	}

	hide() {
		this._r.classList.remove('show')
	}

	values() {
		return this._properties
	}
}

export default class ManualData extends BaseData {
	constructor(manager) {
		super(manager)
		this._org_padding = this._manager.platform._renderer.padding
		this._manager.platform._renderer.padding = 0

		this._dim = 2
		this._scale = 1 / 1000
		this._tool = null
		this._contextmenu = new ContextMenu()

		this._r = this.svg.append('g')
		const dr = this._r.append('g')

		const width = this._manager.platform.width
		const height = this._manager.platform.height
		const this_ = this
		this._r
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', width)
			.attr('height', height)
			.attr('opacity', 0)
			.on('mouseenter', () => {
				this._tool?.terminate()
				if (this.svg.node().lastChild !== this._r.node()) {
					this._r.remove()
					this.svg.append(() => this._r.node())
				}
				this._tool?.init(this_._contextmenu.values())
			})
			.on('mousemove', e => {
				const mouse = d3.pointer(e)
				this_._tool?.move(mouse, this_._contextmenu.values())
			})
			.on('mouseleave', () => {
				this._tool?.terminate()
			})
			.on('click', e => {
				const mouse = d3.pointer(e)
				this_._tool?.click(mouse, this_._contextmenu.values())
			})

		const elm = this.setting.data.configElement
		elm.appendChild(document.createTextNode('Dimension'))
		const dimElm = document.createElement('input')
		dimElm.type = 'number'
		dimElm.name = 'dimension'
		dimElm.min = 1
		dimElm.max = 2
		dimElm.value = this._dim
		dimElm.onchange = () => {
			this._dim = +dimElm.value
			this.setting.ml.refresh()
			this.setting.vue.$forceUpdate()
			this._manager.platform.render()
			this.setting.vue.pushHistory()
		}
		elm.appendChild(dimElm)

		const presetElm = document.createElement('div')
		elm.appendChild(presetElm)
		presetElm.appendChild(document.createTextNode('Preset'))

		const presetSlct = document.createElement('select')
		presetSlct.onchange = () => {
			const preset = presetSlct.value
			this.remove()
			presetCustomElm.replaceChildren()
			dataPresets[preset].init?.(presetCustomElm)
			dataPresets[preset].make(this, presetCustomElm)
		}
		for (const preset of Object.keys(dataPresets)) {
			const opt = document.createElement('option')
			opt.value = preset
			opt.innerText = preset
			presetSlct.appendChild(opt)
		}
		presetElm.appendChild(presetSlct)
		const presetCustomElm = document.createElement('span')
		presetElm.appendChild(presetCustomElm)
		const resetButton = document.createElement('input')
		resetButton.type = 'button'
		resetButton.value = 'Reset'
		resetButton.onclick = () => {
			const preset = presetSlct.value
			this.remove()
			dataPresets[preset].make(this, presetCustomElm)
		}
		presetElm.appendChild(resetButton)
		const clearButton = document.createElement('input')
		clearButton.type = 'button'
		clearButton.value = 'Clear'
		clearButton.onclick = () => {
			this.remove()
		}
		presetElm.appendChild(clearButton)

		const toolElm = document.createElement('div')
		elm.appendChild(toolElm)
		toolElm.appendChild(document.createTextNode('Tools'))
		const toolItems = document.createElement('div')
		toolItems.classList.add('manual-data-tools')
		toolElm.appendChild(toolItems)
		for (const tool in dataCreateTools) {
			const item = document.createElement('div')
			item.title = tool
			item.classList.add('icon', tool)
			item.onclick = () => {
				this._tool?.terminate()
				if (item.classList.contains('selected')) {
					item.classList.remove('selected')
					this._tool = null
					this._contextmenu.create()
				} else {
					toolItems.querySelectorAll('div').forEach(e => e.classList.remove('selected'))
					this._tool = dataCreateTools[tool](this, dr)
					item.classList.add('selected')
					this._contextmenu.create(this._tool.menu)
					this._tool.init(this_._contextmenu.values())
				}
			}
			toolItems.appendChild(item)
			if (!this._tool) {
				this._tool = dataCreateTools[tool](this, dr)
				item.classList.add('selected')
				this._contextmenu.create(this._tool.menu)
				this._tool.init(this_._contextmenu.values())
			}
		}

		this.addCluster([width / 4, height / 3], 0, 2500, 100, 1)
		this.addCluster([width / 2, (height * 2) / 3], 0, 2500, 100, 2)
		this.addCluster([(width * 3) / 4, height / 3], 0, 2500, 100, 3)
		dataPresets[presetSlct.value].init?.(presetCustomElm)
	}

	get availTask() {
		if (this._dim === 1) {
			return ['RG', 'IN', 'AD', 'DE', 'TF', 'SM', 'TP', 'CP']
		}
		return ['CT', 'CF', 'SC', 'RG', 'IN', 'AD', 'DR', 'FS', 'DE', 'GR', 'MD', 'GM', 'SM', 'TP', 'CP']
	}

	get domain() {
		const w = this._manager.platform.width
		const h = this._manager.platform.height
		if (this._dim === 1) {
			return [[0, w * this._scale]]
		} else {
			return [
				[0, w * this._scale],
				[0, h * this._scale],
			]
		}
	}

	get range() {
		if (this._dim === 1) {
			return [0, this._manager.platform.height * this._scale]
		}
		return super.range
	}

	get dimension() {
		return this._dim
	}

	get x() {
		if (this._dim === 1) {
			return this._x.map(v => [v[0] * this._scale])
		}
		return this._x.map(v => v.map(a => a * this._scale))
	}

	get y() {
		if (this._dim === 1) {
			return this._x.map(v => v[1] * this._scale)
		}
		return this._y
	}

	get params() {
		return {
			dimension: this._dim,
		}
	}

	set params(params) {
		if (params.dimension) {
			const elm = this.setting.data.configElement
			elm.querySelector('[name=dimension]').value = params.dimension
			this._dim = +params.dimension
			this.setting.vue.$forceUpdate()
			this._manager.platform.render()
		}
	}

	at(i) {
		return Object.defineProperties(
			{},
			{
				x: {
					get: () => (this._dim === 1 ? [this._x[i][0] * this._scale] : this._x[i].map(v => v * this._scale)),
					set: v => {
						this._x[i] = v.map(a => a / this._scale)
						this._manager.platform.render()
					},
				},
				y: {
					get: () => (this._dim === 1 ? this._x[i][1] : this._y[i]),
					set: v => {
						this._y[i] = v
						this._manager.platform.render()
					},
				},
				point: {
					get: () => this.points[i],
				},
			}
		)
	}

	splice(start, count, ...items) {
		const x = []
		const y = []
		for (let i = 0; i < items.length; i += 2) {
			x.push(items[i])
			y.push(items[i + 1])
		}
		const idx = this._manager.platform._renderer.toValue?.(x[0])[0]
		let sx, sy
		if (idx !== undefined) {
			sx = this._x.splice(start, count)
			sy = this._y.splice(start, count)
			this._x.splice(idx, 0, ...x)
			this._y.splice(idx, 0, ...y)
		} else {
			sx = this._x.splice(start, count, ...x)
			sy = this._y.splice(start, count, ...y)
		}
		this._manager.platform.render()

		return sx.map((v, i) => [v, sy[i]])
	}

	set(i, x, y) {
		this.splice(i, 1, x, y)
	}

	push(...items) {
		this.splice(this.length, 0, ...items)
	}

	pop() {
		return this.splice(this.length - 1, 1)[0]
	}

	unshift(...items) {
		this.splice(0, 0, ...items)
	}

	shift() {
		return this.splice(0, 1)[0]
	}

	slice(start, end) {
		const r = []
		for (let i = start; i < end; i++) {
			r.push(this.at(i))
		}
		return r
	}

	forEach(cb) {
		const l = this.length
		for (let i = 0; i < l; i++) {
			cb(this.at(i), i, this)
		}
	}

	map(cb) {
		const l = this.length
		const r = []
		for (let i = 0; i < l; i++) {
			r.push(cb(this.at(i), i, this))
		}
		return r
	}

	swap(i, j) {
		;[this._x[i], this._x[j]] = [this._x[j], this._x[i]]
		;[this._y[i], this._y[j]] = [this._y[j], this._y[i]]
	}

	sort(cb) {
		const l = this.length
		const v = []
		for (let i = 0; i < l; i++) {
			v[i] = this.at(i)
			for (let j = i; j > 0; j--) {
				if (cb(v[j - 1], v[j]) > 0) {
					this.swap(j - 1, j)
				}
			}
		}
	}

	remove() {
		this.splice(0, this.length)
	}

	terminate() {
		super.terminate()
		this._tool?.terminate()
		this._contextmenu.terminate()
		this._r.remove()
		this._manager.platform._renderer.padding = this._org_padding
	}

	addCluster(center, r, noise, count, category) {
		const datas = []
		for (let i = 0; i < count; i++) {
			let c = [0, 0]
			if (r > 0) {
				do {
					c = [Math.random() * 2 - 1, Math.random() * 2 - 1]
				} while (c[0] ** 2 + c[1] ** 2 <= 1)
			}
			c[0] = c[0] * r + center[0]
			c[1] = c[1] * r + center[1]
			if (noise > 0) {
				const nr = normal_random(0, noise)
				c[0] += nr[0]
				c[1] += nr[1]
			}
			datas.push(c, +category)
		}
		this.push(...datas)
	}
}
