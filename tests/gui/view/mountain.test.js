import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('mountain')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const resolution = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect(resolution.getAttribute('value')).resolves.toBe('100')
		const alpha = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect(alpha.getAttribute('value')).resolves.toBe('5.4')
		const beta = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect(beta.getAttribute('value')).resolves.toBe('5.4')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('span:last-child', { state: 'attached' })
		await expect(clusters.textContent()).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		await expect(clusters.textContent()).resolves.toBe('1')
	})
})
