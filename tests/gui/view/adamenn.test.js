import { getPage } from '../helper/browser'

describe('classification', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
	}, 10000)

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CF')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('adamenn')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const k0 = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await k0.getProperty('value')).jsonValue()).resolves.toBe('30')
		const k1 = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await k1.getProperty('value')).jsonValue()).resolves.toBe('3')
		const k2 = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect((await k2.getProperty('value')).jsonValue()).resolves.toBe('45')
		const l = await buttons.waitForSelector('input:nth-of-type(4)')
		await expect((await l.getProperty('value')).jsonValue()).resolves.toBe('23')
		const k = await buttons.waitForSelector('input:nth-of-type(5)')
		await expect((await k.getProperty('value')).jsonValue()).resolves.toBe('3')
		const c = await buttons.waitForSelector('input:nth-of-type(6)')
		await expect((await c.getProperty('value')).jsonValue()).resolves.toBe('0.5')
	}, 10000)

	test('learn', async () => {
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('uci')

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CF')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('adamenn')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const methodFooter = await page.waitForSelector('#method_footer', { state: 'attached' })
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toBe('')

		const calculateButton = await buttons.waitForSelector('input[value=Calculate]')
		await calculateButton.evaluate(el => el.click())

		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toMatch(/^Accuracy:[0-9.]+$/)
	}, 100000)
})
