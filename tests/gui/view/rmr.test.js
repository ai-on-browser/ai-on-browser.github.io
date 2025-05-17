import { getPage } from '../helper/browser'

describe('regression', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('RG')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('rmr')
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
		await fitButton.evaluate(el => el.click())

		await expect(methodFooter.textContent()).resolves.toMatch(/^RMSE:[0-9.]+$/)
	})
})
