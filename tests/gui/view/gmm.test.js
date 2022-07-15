import puppeteer from 'puppeteer'

import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {puppeteer.Page} */
	let page
	beforeEach(async () => {
		page = await getPage()
	}, 10000)

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('gmm')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('span')
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('0 clusters')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('gmm')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const clusters = await buttons.waitForSelector('span')
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('0 clusters')

		const addButton = await buttons.waitForSelector('input[value=Add\\ cluster]')
		await addButton.evaluate(el => el.click())
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('1 clusters')

		const stepButton = await buttons.waitForSelector('input[value=Step]')
		await stepButton.evaluate(el => el.click())
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('1 clusters')

		const clearButton = await buttons.waitForSelector('input[value=Clear]')
		await clearButton.evaluate(el => el.click())
		await expect(clusters.evaluate(el => el.textContent)).resolves.toBe('0 clusters')
	}, 10000)
})
