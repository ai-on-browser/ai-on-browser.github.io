import { getPage } from '../helper/browser'

describe('reinforcement learning', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('')
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('MD')
		const envSelectBox = page.locator('#ml_selector #task_menu select')
		await envSelectBox.selectOption('grid')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('dqn')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const method = buttons.locator('select:nth-of-type(1)').first()
		await expect(method.inputValue()).resolves.toBe('full')
		const greedyrateLB = buttons.locator('input:nth-of-type(3)')
		await expect(greedyrateLB.inputValue()).resolves.toBe('0.01')
		const greedyrateInit = buttons.locator('input:nth-of-type(4)')
		await expect(greedyrateInit.inputValue()).resolves.toBe('1')
		const greedyrateRate = buttons.locator('input:nth-of-type(5)')
		await expect(greedyrateRate.inputValue()).resolves.toBe('0.995')
		const learningRate = buttons.locator('input:nth-of-type(6)')
		await expect(learningRate.inputValue()).resolves.toBe('0.001')
		const size = buttons.locator('input:nth-of-type(7)')
		await expect(size.inputValue()).resolves.toBe('10')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const step = page.locator('[name=step]')
		await expect(step.textContent()).resolves.toBe(' Step: 0')

		const calcButton = buttons.locator('input[value=Step]')
		await calcButton.dispatchEvent('click')

		await expect(step.textContent()).resolves.toBe(' Step: 1')
	})
})
