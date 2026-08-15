import { getPage } from '../helper/browser'

describe('smoothing', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('SM')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('t3_moving_average')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const k = await buttons.locator('input:nth-of-type(1)')
		await expect(k.inputValue()).resolves.toBe('5')
		const a = await buttons.locator('input:nth-of-type(2)')
		await expect(a.inputValue()).resolves.toBe('0.7')
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
