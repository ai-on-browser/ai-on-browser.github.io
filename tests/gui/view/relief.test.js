import { getPage } from '../helper/browser'

describe('feature selection', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('FS')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('relief')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const m = buttons.locator('input:nth-of-type(1)')
		await expect(m.inputValue()).resolves.toBe('20')
		const tau = buttons.locator('input:nth-of-type(2)')
		await expect(tau.inputValue()).resolves.toBe('0')
		const k = buttons.locator('input:nth-of-type(3)')
		await expect(k.inputValue()).resolves.toBe('10')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const fitButton = buttons.locator('input[value=Fit]')
		await fitButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const circles = svg.locator('.tile circle')
		await expect(circles.count()).resolves.toBe(300)
	})
})
