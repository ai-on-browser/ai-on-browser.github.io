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
		await modelSelectBox.selectOption('mcd')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const srate = buttons.locator('input:nth-of-type(1)')
		await expect(srate.inputValue()).resolves.toBe('0.9')
		const t = buttons.locator('input:nth-of-type(2)')
		await expect(t.inputValue()).resolves.toBe('2')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')
		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const circles = svg.locator('.tile circle')
		await expect(circles.count()).resolves.toBeGreaterThan(0)
	})
})
