import { getPage } from '../helper/browser'

describe('density estimation', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('DE')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('polynomial_histogram')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const p = buttons.locator('input:nth-of-type(1)')
		await expect(p.inputValue()).resolves.toBe('2')
		const h = buttons.locator('input:nth-of-type(2)')
		await expect(h.inputValue()).resolves.toBe('0.1')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const fitButton = buttons.locator('input[value=Fit]')
		await fitButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const img = svg.locator('.tile-render image')
		await expect(img.count()).resolves.toBeGreaterThan(0)
	})
})
