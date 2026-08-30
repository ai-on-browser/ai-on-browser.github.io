export default class DiscretePreprocessor {
	constructor(manager) {
		this._manager = manager
		this._size = 10

		this.init()
	}

	init() {
		if (!this._r) {
			const elm = this._manager.setting.preprocess.configElement
			this._r = document.createElement('div')
			elm.append(this._r)
		} else {
			this._r.replaceChildren()
		}
		const discreteElm = document.createElement('div')
		const discrete = document.createElement('input')
		discrete.type = 'number'
		discrete.min = 1
		discrete.max = 100
		discrete.value = this._size
		discrete.onchange = () => {
			this._size = discrete.value
			this._manager.setting.ml.refresh()
		}
		discreteElm.append('Size ', discrete)
		this._r.append(discreteElm)

		this._min = []
		this._max = []
		this._iscategorical = []
	}

	apply(x, { dofit = true }) {
		if (dofit) {
			const d = x[0].length
			this._min = Array(d).fill(Infinity)
			this._max = Array(d).fill(-Infinity)
			this._iscategorical = Array(d).fill(false)
			for (let i = 0; i < x.length; i++) {
				for (let j = 0; j < x[i].length; j++) {
					if (this._iscategorical[j]) {
						continue
					}
					if (typeof x[i][j] !== 'number') {
						this._iscategorical[j] = true
						continue
					}
					this._min[j] = Math.min(this._min[j], x[i][j])
					this._max[j] = Math.max(this._max[j], x[i][j])
				}
			}
		}
		return x.map(r =>
			r.map((v, j) =>
				this._iscategorical[j]
					? v
					: Math.floor(((v - this._min[j]) / (this._max[j] - this._min[j])) * this._size)
			)
		)
	}

	terminate() {
		this._r?.remove()
	}
}
