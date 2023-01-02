export default class RandomPlayer {
	constructor() {}

	set turn(value) {
		this._turn = value
	}

	action(board) {
		const choices = board.choices(this._turn)
		const c = choices[Math.floor(Math.random() * choices.length)]
		return new Promise(resolve => setTimeout(() => resolve(c), 100))
	}

	close() {}
}
