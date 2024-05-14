import { getPage } from '../helper/browser'

describe('word embedding', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('text')
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('WE')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('word_to_vec')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const method = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await method.getProperty('value')).jsonValue()).resolves.toBe('CBOW')
		const n = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect(n.getAttribute('value')).resolves.toBe('1')
		const iteration = await buttons.waitForSelector('select:nth-of-type(2)')
		await expect((await iteration.getProperty('value')).jsonValue()).resolves.toBe('1')
		const rate = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect(rate.getAttribute('value')).resolves.toBe('0.001')
		const batch = await buttons.waitForSelector('input:nth-of-type(4)')
		await expect(batch.getAttribute('value')).resolves.toBe('10')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.textContent()).resolves.toBe('0')
		const methodFooter = await page.waitForSelector('#method_footer', { state: 'attached' })
		await expect(methodFooter.textContent()).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())
		await buttons.waitForSelector('input[value=Step]:enabled')

		await expect(epoch.textContent()).resolves.toBe('1')
		await expect(methodFooter.textContent()).resolves.toMatch(/^loss/)
	})
})
