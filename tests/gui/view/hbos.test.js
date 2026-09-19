import { getPage } from '../helper/browser'

describe('anomaly detection', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('AD')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('hbos')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const k = buttons.locator('input:nth-of-type(1)')
		await expect(k.inputValue()).resolves.toBe('20')
		const method = buttons.locator('select:nth-of-type(1)')
		await expect(method.inputValue()).resolves.toBe('dynamic')
		const t = buttons.locator('input:nth-of-type(2)')
		await expect(t.inputValue()).resolves.toBe('-3')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const calcButton = buttons.locator('input[value=Calculate]')
		await calcButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const circles = svg.locator('.tile circle')
		await expect(circles.count()).resolves.toBeGreaterThan(0)
	})
})
