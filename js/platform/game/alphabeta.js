export default class AlphaBetaPlayer {
	constructor(d = 5) {
		this._d = d
	}

	set turn(value) {
		this._turn = value
	}

	_alphabeta(board, d, turn, alpha, beta) {
		if (d === 0) {
			return board.score(this._turn)
		}
		const choices = board.choices(turn)
		const nt = board.nextTurn(turn)
		if (choices.length === 0) {
			return this._alphabeta(board, d - 1, nt, alpha, beta)
		}
		if (turn === this._turn) {
			for (const c of choices) {
				const cb = board.copy()
				cb.set(c, turn)
				const score = this._alphabeta(cb, d - 1, nt, alpha, beta)
				alpha = Math.max(alpha, score)
				if (alpha >= beta) {
					break
				}
			}
			return alpha
		} else {
			for (const c of choices) {
				const cb = board.copy()
				cb.set(c, turn)
				const score = this._alphabeta(cb, d - 1, nt, alpha, beta)
				beta = Math.min(beta, score)
				if (alpha >= beta) {
					break
				}
			}
			return beta
		}
	}

	action(board) {
		const choices = board.choices(this._turn)
		const nt = board.nextTurn(this._turn)
		let p = []
		let m = -Infinity
		for (const choice of choices) {
			const cb = board.copy()
			cb.set(choice, this._turn)
			const score = this._alphabeta(cb, this._d - 1, nt, -Infinity, Infinity)
			if (score > m) {
				m = score
				p = [choice]
			} else if (score === m) {
				p.push(choice)
			}
		}
		const c = p[Math.floor(Math.random() * p.length)]
		return new Promise(resolve => setTimeout(() => resolve(c), 100))
	}

	close() {}
}
