import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('agglomerative')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const method = buttons.locator('select:nth-of-type(1)')
		await expect(method.inputValue()).resolves.toBe('Complete Linkage')
		const metrix = buttons.locator('select:nth-of-type(2)')
		await expect(metrix.inputValue()).resolves.toBe('euclid')
		const clusters = buttons.locator('input:nth-of-type(2)')
		await expect(clusters.inputValue()).resolves.toBe('1')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')

		const clusters = buttons.locator('input:nth-of-type(2)')
		await expect(clusters.inputValue()).resolves.toBe('10')
		await expect(clusters.getAttribute('min')).resolves.toBe('1')
		await expect(clusters.getAttribute('max')).resolves.toBe('300')
		const crange = buttons.locator('input:nth-of-type(3)')
		await expect(crange.inputValue()).resolves.toBe('10')
		await expect(crange.getAttribute('min')).resolves.toBe('1')
		await expect(crange.getAttribute('max')).resolves.toBe('300')
	})
})
