import { getPage } from '../helper/browser'

describe('dimensionality reduction', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const clusters = page.locator('#data_menu input[name=n]')
		await clusters.fill('1')
		const resetDataButton = page.locator('#data_menu input[value=Reset]')
		await resetDataButton.dispatchEvent('click')
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('DR')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('laplacian_eigenmaps')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const method = buttons.locator('select:nth-of-type(1)')
		await expect(method.inputValue()).resolves.toBe('rbf')
		await buttons.locator('input')
		const inputs = await buttons.locator('input').all()
		const s = inputs[0]
		await expect(s.inputValue()).resolves.toBe('1')
		const k = inputs[1]
		await expect(k.inputValue()).resolves.toBe('10')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const fitButton = buttons.locator('input[value=Fit]')
		await fitButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const circles = svg.locator('.datas circle')
		await expect(circles.count()).resolves.toBe(100)
	})
})
