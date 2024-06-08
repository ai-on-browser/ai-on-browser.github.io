export class SGDOptimizer {
	constructor(lr) {
		this._learningrate = lr
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() {
				return this_._learningrate
			},
			delta(key, value) {
				if (typeof value === 'number') {
					return value * this.lr
				}
				const v = value.copy()
				v.map(v => v * this.lr)
				return v
			},
		}
	}
}
