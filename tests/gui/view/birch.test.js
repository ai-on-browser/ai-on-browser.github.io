import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('birch')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const b = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect(b.getAttribute('value')).resolves.toBe('10')
		const t = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect(t.getAttribute('value')).resolves.toBe('0.2')
		const l = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect(l.getAttribute('value')).resolves.toBe('10000')
		const sub = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await sub.getProperty('value')).jsonValue()).resolves.toBe('none')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('span:last-child', { state: 'attached' })
		await expect(clusters.textContent()).resolves.toBe('')

		const fitButton = await buttons.waitForSelector('input[value=Fit]')
		await fitButton.evaluate(el => el.click())

		await expect(clusters.textContent()).resolves.toMatch(/^[0-9]+$/)
	})
})
