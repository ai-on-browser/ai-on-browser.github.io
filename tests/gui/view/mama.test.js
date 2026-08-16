import { getPage } from '../helper/browser'

describe('smoothing', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('SM')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('mama')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const fastLimit = buttons.locator('input:nth-of-type(1)')
		await expect(fastLimit.inputValue()).resolves.toBe('0.5')
		const slowLimit = buttons.locator('input:nth-of-type(2)')
		await expect(slowLimit.inputValue()).resolves.toBe('0.05')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const fitButton = buttons.locator('input[value=Calculate]')
		await fitButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const path = svg.locator('.tile-render path')
		const d = await path.getAttribute('d')
		expect(d.split('L')).toHaveLength(300)
	})
})
