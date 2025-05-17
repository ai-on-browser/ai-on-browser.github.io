import { getPage } from '../helper/browser'

describe('regression', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('RG')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('nadaraya_watson')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		expect.assertions(0)
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const autoCheckbox = buttons.locator('input:nth-of-type(1)')
		await expect(autoCheckbox.isChecked()).resolves.toBeTruthy()
		const sgm = buttons.locator('input:nth-of-type(1)')
		await expect(sgm.getAttribute('value')).resolves.toBe('0.1')
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
