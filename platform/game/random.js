export default class RandomPlayer {
	constructor() {
	}

	set turn(value) {
		this._turn = value
	}

	action(board, cb) {
		const choices = board.choices(this._turn)
		const c = choices[Math.floor(Math.random() * choices.length)]
		setTimeout(() => {
			cb(c)
		}, 100)
	}

	close() {}
}
