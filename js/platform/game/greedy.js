export default class GreedyPlayer {
	constructor() {}

	set turn(value) {
		this._turn = value
	}

	action(board) {
		const choices = board.choices(this._turn)
		let p = []
		let max = -Infinity
		for (const choice of choices) {
			const cb = board.copy()
			cb.set(choice, this._turn)
			const score = cb.score(this._turn)
			if (score > max) {
				max = score
				p = [choice]
			} else if (score === max) {
				p.push(choice)
			}
		}
		const c = p[Math.floor(Math.random() * p.length)]
		return new Promise(resolve => setTimeout(() => resolve(c), 100))
	}

	close() {}
}
