import { getPage } from '../helper/browser'

describe('classification', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CF')
		const preprocessSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(8) select')
		await preprocessSelectBox.selectOption('discrete')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('oner')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		expect.assertions(0)
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const fitButton = buttons.locator('input[value=Fit]')
		await fitButton.waitFor()
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const methodFooter = page.locator('#method_footer')
		await expect(methodFooter.textContent()).resolves.toBe('')

		const fitButton = buttons.locator('input[value=Fit]')
		await fitButton.dispatchEvent('click')

		await expect(methodFooter.textContent()).resolves.toMatch(/^Accuracy:[0-9.]+$/)
	})
})
