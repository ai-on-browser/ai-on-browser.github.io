import { getPage } from '../helper/browser'

describe('regression', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('RG')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('cgp')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const n = buttons.locator('input:nth-of-type(1)')
		await expect(n.inputValue()).resolves.toBe('1')
		const m = buttons.locator('input:nth-of-type(2)')
		await expect(m.inputValue()).resolves.toBe('10')
		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const epoch = buttons.locator('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
		const methodFooter = page.locator('#method_footer')
		await expect(methodFooter.textContent()).resolves.toBe('')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')
		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')

		await expect(epoch.textContent()).resolves.toBe('1')
		await expect(methodFooter.textContent()).resolves.toMatch(/^RMSE:[0-9.]+$/)
	})
})
