export default class MinmaxPlayer {
	constructor(d = 5) {
		this._d = d
	}

	set turn(value) {
		this._turn = value
	}

	_minmax(board, d, turn) {
		if (d === 0) {
			return board.score(this._turn)
		}
		const choices = board.choices(turn)
		const nt = board.nextTurn(turn)
		if (choices.length === 0) {
			return this._minmax(board, d - 1, nt)
		}
		if (turn === this._turn) {
			let m = -Infinity
			for (const c of choices) {
				const cb = board.copy()
				cb.set(c, turn)
				const score = this._minmax(cb, d - 1, nt)
				if (score > m) {
					m = score
				}
			}
			return m
		} else {
			let m = Infinity
			for (const c of choices) {
				const cb = board.copy()
				cb.set(c, turn)
				const score = this._minmax(cb, d - 1, nt)
				if (score < m) {
					m = score
				}
			}
			return m
		}
	}

	action(board, cb) {
		const choices = board.choices(this._turn)
		const nt = board.nextTurn(this._turn)
		let p = []
		let m = -Infinity
		for (const choice of choices) {
			const cb = board.copy()
			cb.set(choice, this._turn)
			const score = this._minmax(cb, this._d - 1, nt)
			if (score > m) {
				m = score
				p = [choice]
			} else if (score === m) {
				p.push(choice)
			}
		}
		const c = p[Math.floor(Math.random() * p.length)]
		setTimeout(() => {
			cb(c)
		}, 100)
	}

	close() {}
}
