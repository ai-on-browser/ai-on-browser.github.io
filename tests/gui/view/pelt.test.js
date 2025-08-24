import { getPage } from '../helper/browser'

describe('change point detection', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CP')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('pelt')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const penalty = buttons.locator('input:nth-of-type(1)')
		await expect(penalty.inputValue()).resolves.toBe('0.1')
		const cost = buttons.locator('select')
		await expect(cost.inputValue()).resolves.toBe('l2')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const calcButton = buttons.locator('input[value=Calculate]')
		await calcButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const lines = await svg.locator('.tile-render line')
		await expect(lines.count()).resolves.toBeGreaterThan(0)
	})
})
