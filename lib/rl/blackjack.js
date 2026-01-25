import { RLEnvironmentBase, RLIntRange, RLStepResult } from './base.js'

const SPADE = 0
const DIAMOND = 1
const HEART = 2
const CLUB = 3

class Deck {
	constructor() {
		this.cards = []
		for (const suit of [SPADE, HEART, DIAMOND, CLUB]) {
			for (let i = 1; i <= 13; i++) {
				this.cards.push({ suit, value: i })
			}
		}
		this.shuffle()
	}

	init() {
		this.cards = []
		for (const suit of [SPADE, HEART, DIAMOND, CLUB]) {
			for (let i = 1; i <= 13; i++) {
				this.cards.push({ suit, value: i })
			}
		}
		this.shuffle()
	}

	shuffle() {
		for (let i = this.cards.length - 1; i > 0; i--) {
			const r = Math.floor(Math.random() * (i + 1))
			;[this.cards[i], this.cards[r]] = [this.cards[r], this.cards[i]]
		}
	}

	pop() {
		return this.cards.pop()
	}
}

/**
 * Blackjack environment
 */
export default class BlackjackRLEnvironment extends RLEnvironmentBase {
	constructor() {
		super()
		this._deck = new Deck()

		this._dealer_hands = []
		this._player_hands = []
		this._done = false

		this._reward = {
			bust: -1,
			win: 1,
			step: 0,
		}

		this.reset()
	}

	get actions() {
		return [[0, 1]]
	}

	get states() {
		return [new RLIntRange(2, 31), new RLIntRange(1, 10), [0, 1]]
	}

	_sumhands(hands) {
		let sumhands = hands.reduce((s, c) => s + Math.min(10, c.value), 0)
		const usableace = sumhands <= 11 && hands.some(c => c.value === 1)
		if (usableace) {
			sumhands += 10
		}
		return [sumhands, usableace]
	}

	reset() {
		super.reset()
		this._deck.init()

		this._dealer_hands = [this._deck.pop(), this._deck.pop()]
		this._player_hands = [this._deck.pop(), this._deck.pop()]
		this._done = false

		return this.state()
	}

	state() {
		const [sumhands, usableace] = this._sumhands(this._player_hands)
		return [sumhands, Math.min(10, this._dealer_hands[0].value), usableace ? 1 : 0]
	}

	step(action) {
		if (action[0] === 1) {
			this._player_hands.push(this._deck.pop())

			if (this._sumhands(this._player_hands)[0] > 21) {
				this._done = true
				return new RLStepResult(this, this.state(), this._reward.bust, true)
			}
			return new RLStepResult(this, this.state(), this._reward.step, false)
		}
		this._done = true

		while (this._sumhands(this._dealer_hands)[0] < 17) {
			this._dealer_hands.push(this._deck.pop())
		}

		const reward = this._sumhands(this._player_hands)[0] - this._sumhands(this._dealer_hands)[0]
		return new RLStepResult(this, this.state(), reward, true)
	}
}
