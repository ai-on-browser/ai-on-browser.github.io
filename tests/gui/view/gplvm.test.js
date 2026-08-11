import { getPage } from '../helper/browser'

describe('dimensionality reduction', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('DR')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('gplvm')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const kernel = buttons.locator('select:nth-of-type(1)')
		await expect(kernel.inputValue()).resolves.toBe('gaussian')

		const inputs = buttons.locator('input')
		const sigma = inputs.nth(0)
		await expect(sigma.inputValue()).resolves.toBe('1')
		const alpha = inputs.nth(1)
		await expect(alpha.inputValue()).resolves.toBe('0.05')
		const ez = inputs.nth(2)
		await expect(ez.inputValue()).resolves.toBe('1')
		const ea = inputs.nth(3)
		await expect(ea.inputValue()).resolves.toBe('0.005')
		const ep = inputs.nth(4)
		await expect(ep.inputValue()).resolves.toBe('0.02')
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
		await expect(circles.count()).resolves.toBe(300)
	})
})
