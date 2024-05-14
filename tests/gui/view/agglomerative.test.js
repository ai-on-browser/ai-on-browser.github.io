import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('agglomerative')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const method = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await method.getProperty('value')).jsonValue()).resolves.toBe('Complete Linkage')
		const metrix = await buttons.waitForSelector('select:nth-of-type(2)')
		await expect((await metrix.getProperty('value')).jsonValue()).resolves.toBe('euclid')
		const clusters = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect(clusters.getAttribute('value')).resolves.toBe('1')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())

		const clusters = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await clusters.getProperty('value')).jsonValue()).resolves.toBe('10')
		await expect(clusters.getAttribute('min')).resolves.toBe('1')
		await expect(clusters.getAttribute('max')).resolves.toBe('300')
		const crange = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect((await clusters.getProperty('value')).jsonValue()).resolves.toBe('10')
		await expect(crange.getAttribute('min')).resolves.toBe('1')
		await expect(crange.getAttribute('max')).resolves.toBe('300')
	})
})
