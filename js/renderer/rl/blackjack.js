export default class BlackjackRenderer {
	constructor(renderer) {
		this.renderer = renderer

		this._game = new BlackjackGame(this.renderer.platform)
	}

	init(r) {
		const height = 500
		this._envrenderer = new Renderer(this.renderer.env, {
			width: 800,
			height: height,
			g: r,
		})
		this._envrenderer.init()
		this._manualButton = this._game._makeButton(10, (height * 3) / 4 + 50, 80, 40, 'Start', async () => {
			this._manualButton.setAttribute('opacity', 0)
			await this._game.start()
			this._manualButton.setAttribute('opacity', null)
		})
		this._envrenderer.svg.appendChild(this._manualButton)
	}

	render() {
		this._manualButton.style.display = this.renderer.platform._manager._modelname ? 'none' : 'block'
		this._envrenderer.render()
	}
}

class Renderer {
	constructor(env, config = {}) {
		this.env = env

		this._size = [config.width || 200, config.height || 200]

		const card_scale = [63, 89]
		this._card_size = [(this._size[1] / 3) * (card_scale[0] / card_scale[1]), this._size[1] / 3]

		this._cart_size = [50, 30]
		this._move_scale = 50
		this._pendulum_scale = 400

		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.svg.setAttribute('width', this._size[0])
		this.svg.setAttribute('height', this._size[1])
		this.svg.setAttribute('viewbox', '0 0 200 200')
		if (config.g) {
			config.g.replaceChildren(this.svg)
		}

		this._cards_render = []
	}

	init() {
		const dealerTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text')
		dealerTitle.setAttribute('x', 10)
		dealerTitle.setAttribute('y', this._size[1] / 4)
		dealerTitle.setAttribute('dominant-baseline', 'middle')
		dealerTitle.innerHTML = 'Dealer'
		this.svg.appendChild(dealerTitle)

		this._dealerSum = document.createElementNS('http://www.w3.org/2000/svg', 'text')
		this._dealerSum.setAttribute('x', 10)
		this._dealerSum.setAttribute('y', this._size[1] / 4 + 20)
		this._dealerSum.setAttribute('dominant-baseline', 'middle')
		this._dealerSum.innerHTML = ''
		this.svg.appendChild(this._dealerSum)

		const playerTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text')
		playerTitle.setAttribute('x', 10)
		playerTitle.setAttribute('y', (3 * this._size[1]) / 4)
		playerTitle.setAttribute('dominant-baseline', 'middle')
		playerTitle.innerHTML = 'Player'
		this.svg.appendChild(playerTitle)

		this._playerSum = document.createElementNS('http://www.w3.org/2000/svg', 'text')
		this._playerSum.setAttribute('x', 10)
		this._playerSum.setAttribute('y', (3 * this._size[1]) / 4 + 20)
		this._playerSum.setAttribute('dominant-baseline', 'middle')
		this._playerSum.innerHTML = ''
		this.svg.appendChild(this._playerSum)

		this._cards_render.forEach(r => r.remove())
		this._cards_render = []
	}

	render() {
		this._cards_render.forEach(r => r.remove())
		this._cards_render = []

		const width = this._size[0]
		const height = this._size[1]
		const offset = 100

		this._playerSum.innerHTML = this.env._sumhands(this.env._player_hands)[0]
		if (this.env._done) {
			this._dealerSum.innerHTML = this.env._sumhands(this.env._dealer_hands)[0]
		} else {
			this._dealerSum.innerHTML = ''
		}

		for (let i = 0; i < this.env._dealer_hands.length; i++) {
			const root = this._renderCard(
				offset + i * (this._card_size[0] + 10),
				(height / 2 - this._card_size[1]) / 2,
				this.env._dealer_hands[i],
				i === 0 || this.env._done
			)
			this.svg.appendChild(root)
			this._cards_render.push(root)
		}

		let padding = 10
		if (offset + (this.env._player_hands.length + 1) * (this._card_size[0] + padding) > width) {
			padding = -this._card_size[0] / 3
		}
		for (let i = 0; i < this.env._player_hands.length; i++) {
			const root = this._renderCard(
				offset + i * (this._card_size[0] + padding),
				((3 * height) / 2 - this._card_size[1]) / 2,
				this.env._player_hands[i]
			)
			this.svg.appendChild(root)
			this._cards_render.push(root)
		}
	}

	_renderCard(x, y, card, face = true) {
		const root = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		border.setAttribute('x', x)
		border.setAttribute('y', y)
		border.setAttribute('width', this._card_size[0])
		border.setAttribute('height', this._card_size[1])
		border.setAttribute('fill', 'white')
		border.setAttribute('stroke', 'black')
		border.setAttribute('rx', 15)
		border.setAttribute('ry', 15)
		root.appendChild(border)

		if (!face) {
			border.setAttribute('fill', 'gray')
			return root
		}

		const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
		valueText.setAttribute('x', x + this._card_size[0] / 2)
		valueText.setAttribute('y', y + this._card_size[1] / 4)
		valueText.setAttribute('text-anchor', 'middle')
		valueText.setAttribute('dominant-baseline', 'middle')
		valueText.style.fontSize = this._card_size[1] / 2 - 20
		valueText.style.userSelect = 'none'
		if (card.value === 1) {
			valueText.innerHTML = 'A'
		} else if (card.value === 11) {
			valueText.innerHTML = 'J'
		} else if (card.value === 12) {
			valueText.innerHTML = 'Q'
		} else if (card.value === 13) {
			valueText.innerHTML = 'K'
		} else {
			valueText.innerHTML = card.value
		}
		root.appendChild(valueText)

		const suitText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
		suitText.setAttribute('x', x + this._card_size[0] / 2)
		suitText.setAttribute('y', y + (this._card_size[1] * 3) / 4)
		suitText.setAttribute('text-anchor', 'middle')
		suitText.setAttribute('dominant-baseline', 'middle')
		suitText.style.fontSize = this._card_size[1] / 2 - 20
		suitText.style.userSelect = 'none'
		switch (card.suit) {
			case 0:
				suitText.innerHTML = '&spades;'
				break
			case 1:
				suitText.innerHTML = '&diams;'
				valueText.setAttribute('fill', 'red')
				suitText.setAttribute('fill', 'red')
				break
			case 2:
				suitText.innerHTML = '&hearts;'
				valueText.setAttribute('fill', 'red')
				suitText.setAttribute('fill', 'red')
				break
			case 3:
				suitText.innerHTML = '&clubs;'
				break
		}
		root.appendChild(suitText)

		return root
	}
}

class BlackjackGame {
	constructor(platform) {
		this._platform = platform
		this._env = platform.env
		this._resultElm = null
	}

	async start() {
		this._env.reset()
		this._platform.render()
		this._resultElm?.remove()
		while (true) {
			const action = await this.waitAction()
			const { done } = this._env.step([action])
			this._platform.render()
			if (done) {
				const svg = this._platform._renderer[0]._subrender._envrenderer.svg
				this._resultElm = document.createElementNS('http://www.w3.org/2000/svg', 'g')
				svg.appendChild(this._resultElm)
				const height = svg.clientHeight

				const resultText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
				resultText.setAttribute('x', 150)
				resultText.setAttribute('y', height / 2)
				resultText.setAttribute('width', 100)
				resultText.setAttribute('height', 40)
				resultText.setAttribute('text-anchor', 'middle')
				resultText.setAttribute('dominant-baseline', 'middle')
				resultText.style.fontSize = '30'
				const playerScore = this._env._sumhands(this._env._player_hands)[0]
				const dealerScore = this._env._sumhands(this._env._dealer_hands)[0]
				if (playerScore > 21) {
					resultText.innerHTML = 'You bust!'
				} else if (playerScore === dealerScore) {
					resultText.innerHTML = 'Draw'
				} else if (dealerScore > 21 || playerScore > dealerScore) {
					resultText.innerHTML = 'You win!'
				} else {
					resultText.innerHTML = 'You lose!'
				}
				this._resultElm.appendChild(resultText)
				break
			}
			await new Promise(resolve => setTimeout(resolve, 10))
		}
	}

	async waitAction() {
		const svg = this._platform._renderer[0]._subrender._envrenderer.svg
		const root = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		svg.appendChild(root)
		const height = svg.clientHeight

		const buttonWidth = 40

		return new Promise(resolve => {
			root.appendChild(
				this._makeButton(10, (height * 3) / 4 + 50, buttonWidth, 40, 'Hit', () => {
					root.remove()
					resolve(1)
				})
			)
			root.appendChild(
				this._makeButton(10 + buttonWidth, (height * 3) / 4 + 50, buttonWidth, 40, 'Stick', () => {
					root.remove()
					resolve(0)
				})
			)
		})
	}

	_makeButton(x, y, width, height, text, cb) {
		const root = document.createElementNS('http://www.w3.org/2000/svg', 'g')

		const textElm = document.createElementNS('http://www.w3.org/2000/svg', 'text')
		textElm.setAttribute('x', x + width / 2)
		textElm.setAttribute('y', y + height / 2)
		textElm.setAttribute('width', width)
		textElm.setAttribute('height', height)
		textElm.setAttribute('text-anchor', 'middle')
		textElm.setAttribute('dominant-baseline', 'middle')
		textElm.innerHTML = text
		textElm.style.userSelect = 'none'
		root.appendChild(textElm)
		const buttonElm = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		buttonElm.setAttribute('x', x)
		buttonElm.setAttribute('y', y)
		buttonElm.setAttribute('width', width)
		buttonElm.setAttribute('height', height)
		buttonElm.setAttribute('fill-opacity', 0)
		buttonElm.setAttribute('stroke', 'black')
		buttonElm.onclick = cb
		root.appendChild(buttonElm)

		return root
	}

	terminate() {
		this._resultElm?.remove()
	}
}
