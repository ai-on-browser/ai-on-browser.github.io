import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('optics')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const metric = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await metric.getProperty('value')).jsonValue()).resolves.toBe('euclid')
		const eps = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect(eps.getAttribute('value')).resolves.toBe('100')
		const minpts = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect(minpts.getAttribute('value')).resolves.toBe('10')
		const threshold = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect(threshold.getAttribute('value')).resolves.toBe('0.08')
	})

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('optics')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('span:last-child', { state: 'attached' })
		await expect(clusters.textContent()).resolves.toBe('')

		const fitButton = await buttons.waitForSelector('input[value=Fit]')
		await fitButton.evaluate(el => el.click())

		await expect(clusters.textContent()).resolves.toMatch(/^[0-9]+$/)
	})
})
