import { getPage } from '../helper/browser'

describe('change point detection', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('functional')
		const presetSelectBox = page.locator('#ml_selector #data_menu select[name=preset]')
		await presetSelectBox.selectOption('tanh')
		const numberTextArea = page.locator('#ml_selector #data_menu > input[type=number]').first()
		await numberTextArea.fill('20')

		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CP')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('markov_switching')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const regime = buttons.locator('input:nth-of-type(1)')
		await expect(regime.inputValue()).resolves.toBe('3')
		const trial = buttons.locator('input:nth-of-type(2)')
		await expect(trial.inputValue()).resolves.toBe('10000')
		const threshold = buttons.locator('input:nth-of-type(3)')
		await expect(threshold.inputValue()).resolves.toBe('0.1')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const calcButton = buttons.locator('input[value=Calculate]')
		await calcButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const lines = svg.locator('.tile-render line')
		await expect(lines.count()).resolves.toBeGreaterThan(0)
	})
})
