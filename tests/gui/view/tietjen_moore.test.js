import { getPage } from '../helper/browser'

describe('anomaly detection', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('hr_diagram')
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('AD')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('tietjen_moore')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const k = buttons.locator('input:nth-of-type(1)')
		await expect(k.inputValue()).resolves.toBe('5')
		const threshold = buttons.locator('input:nth-of-type(2)')
		await expect(threshold.inputValue()).resolves.toBe('0.2')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')
		const threshold = buttons.locator('input:nth-of-type(2)')
		await threshold.fill('1')

		const calcButton = buttons.locator('input[value=Calculate]')
		await calcButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const circles = svg.locator('.datas circle')
		await expect(circles.count()).resolves.toBeGreaterThan(0)
	})
})
