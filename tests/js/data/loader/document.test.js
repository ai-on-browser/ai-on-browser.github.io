import DocumentLoader from '../../../../js/data/loader/document.js'

describe('DocumentLoader', () => {
	describe('load', () => {
		beforeAll(() => {
			if (typeof globalThis.FileReader === 'undefined') {
				globalThis.FileReader = class {
					async readAsArrayBuffer(blob, encoding) {
						this.result = await blob.arrayBuffer()
						this.onload()
					}
				}
			}
			globalThis.Encoding = {
				detect(codes) {
					return ''
				},
				convert(codes, option) {
					const decoder = new TextDecoder(option.encoding || 'utf-8')
					return decoder.decode(codes)
				},
			}
		})

		test('file', async () => {
			const data =
				'For a time I stood pondering on circle sizes. The large computer mainframe quietly processed all of its assembly code. inside my entire hope lay for figuring out an elusive expansion. Value : pi. Decimals expected soon. I nervously entered a format procedure. The mainframe processed the request. Error. I, again entering it, carefully retyped. This iteration gave zero error printouts in all - success. Intently I waited. Soon, roused by thoughts within me, appeared narrative mnemonics relating digits to verbiage ! The idea appeared to exist but only in abbreviated fashion - little phrases typically. Pressing on I then resolved, deciding firmly about a sum of decimals to use - likely around four hundred, presuming the computer code soon halted ! Pondering these ideas, words appealed to me. But a problem of zeros did exist. Pondering more, solution subsequently appeared. Zero suggests a punctuation element. Very novel! My thoughts were culminated. No periods, I concluded. All residual marks of punctuation = zeros. First digit expansion answer then came before me. On examining some problems unhappily arose. That imbecilic bug! The printout I possessed showed four nine as foremost decimals. Manifestly troubling. Totally every number looked wrong. Repairing the bug took much effort. A pi mnemonic with letters truly seemed good. Counting of all the letters probably should suffice. Reaching for a record would be helpful. Consequently, I continued, expecting a good final answer from computer. First number slowly displayed on the flat screen -3. Good. Trailing digits apparently were right also. Now my memory scheme must probably be implementable. The technique was chosen, elegant in scheme : by self reference a tale mnemonically helpful was ensured. An able title suddenly existed - <Circle Digits>. Taking pen I began. Words emanated uneasily. I desired more synonyms. Speedily I found my (alongside me) Thesaurus. Rogets is probably an essential in doing this, instantly I decided. I wrote and erased more. The Rogets clearly assisted immensely My story proceeded (how lovely!) faultlessly. The end, above all, would soon joyfully overtake. So, this memory helper story is incontestably complete. Soon I will locate publisher. There a narrative will I trust immediately appear, producing fame. The end.'
			const blob = new Blob([data])
			const file = new File([blob], 'test.txt')
			const text = await DocumentLoader.load(file)

			expect(text).toBe(data)
		})
	})

	describe('segment', () => {
		test('simple', () => {
			const str =
				'For a time I stood pondering on circle sizes. The large computer mainframe quietly processed all of its assembly code. inside my entire hope lay for figuring out an elusive expansion. Value : pi. Decimals expected soon. I nervously entered a format procedure. The mainframe processed the request. Error. I, again entering it, carefully retyped. This iteration gave zero error printouts in all - success. Intently I waited. Soon, roused by thoughts within me, appeared narrative mnemonics relating digits to verbiage ! The idea appeared to exist but only in abbreviated fashion - little phrases typically. Pressing on I then resolved, deciding firmly about a sum of decimals to use - likely around four hundred, presuming the computer code soon halted ! Pondering these ideas, words appealed to me. But a problem of zeros did exist. Pondering more, solution subsequently appeared. Zero suggests a punctuation element. Very novel! My thoughts were culminated. No periods, I concluded. All residual marks of punctuation = zeros. First digit expansion answer then came before me. On examining some problems unhappily arose. That imbecilic bug! The printout I possessed showed four nine as foremost decimals. Manifestly troubling. Totally every number looked wrong. Repairing the bug took much effort. A pi mnemonic with letters truly seemed good. Counting of all the letters probably should suffice. Reaching for a record would be helpful. Consequently, I continued, expecting a good final answer from computer. First number slowly displayed on the flat screen -3. Good. Trailing digits apparently were right also. Now my memory scheme must probably be implementable. The technique was chosen, elegant in scheme : by self reference a tale mnemonically helpful was ensured. An able title suddenly existed - <Circle Digits>. Taking pen I began. Words emanated uneasily. I desired more synonyms. Speedily I found my (alongside me) Thesaurus. Rogets is probably an essential in doing this, instantly I decided. I wrote and erased more. The Rogets clearly assisted immensely My story proceeded (how lovely!) faultlessly. The end, above all, would soon joyfully overtake. So, this memory helper story is incontestably complete. Soon I will locate publisher. There a narrative will I trust immediately appear, producing fame. The end.'
			const segments = DocumentLoader.segment(str)
			expect(segments).toHaveLength(354)
		})
	})

	describe('ordinal', () => {
		test('simple', () => {
			const str =
				'For a time I stood pondering on circle sizes. The large computer mainframe quietly processed all of its assembly code. inside my entire hope lay for figuring out an elusive expansion. Value : pi. Decimals expected soon. I nervously entered a format procedure. The mainframe processed the request. Error. I, again entering it, carefully retyped. This iteration gave zero error printouts in all - success. Intently I waited. Soon, roused by thoughts within me, appeared narrative mnemonics relating digits to verbiage ! The idea appeared to exist but only in abbreviated fashion - little phrases typically. Pressing on I then resolved, deciding firmly about a sum of decimals to use - likely around four hundred, presuming the computer code soon halted ! Pondering these ideas, words appealed to me. But a problem of zeros did exist. Pondering more, solution subsequently appeared. Zero suggests a punctuation element. Very novel! My thoughts were culminated. No periods, I concluded. All residual marks of punctuation = zeros. First digit expansion answer then came before me. On examining some problems unhappily arose. That imbecilic bug! The printout I possessed showed four nine as foremost decimals. Manifestly troubling. Totally every number looked wrong. Repairing the bug took much effort. A pi mnemonic with letters truly seemed good. Counting of all the letters probably should suffice. Reaching for a record would be helpful. Consequently, I continued, expecting a good final answer from computer. First number slowly displayed on the flat screen -3. Good. Trailing digits apparently were right also. Now my memory scheme must probably be implementable. The technique was chosen, elegant in scheme : by self reference a tale mnemonically helpful was ensured. An able title suddenly existed - <Circle Digits>. Taking pen I began. Words emanated uneasily. I desired more synonyms. Speedily I found my (alongside me) Thesaurus. Rogets is probably an essential in doing this, instantly I decided. I wrote and erased more. The Rogets clearly assisted immensely My story proceeded (how lovely!) faultlessly. The end, above all, would soon joyfully overtake. So, this memory helper story is incontestably complete. Soon I will locate publisher. There a narrative will I trust immediately appear, producing fame. The end.'
			const segments = DocumentLoader.segment(str)
			const [words, ord] = DocumentLoader.ordinal(segments, { ignoreCase: false })
			expect(words).toHaveLength(252)
			for (let i = 0; i < segments.length; i++) {
				expect(words[ord[i]]).toBe(segments[i])
			}
		})

		test('ignore case', () => {
			const str =
				'For a time I stood pondering on circle sizes. The large computer mainframe quietly processed all of its assembly code. inside my entire hope lay for figuring out an elusive expansion. Value : pi. Decimals expected soon. I nervously entered a format procedure. The mainframe processed the request. Error. I, again entering it, carefully retyped. This iteration gave zero error printouts in all - success. Intently I waited. Soon, roused by thoughts within me, appeared narrative mnemonics relating digits to verbiage ! The idea appeared to exist but only in abbreviated fashion - little phrases typically. Pressing on I then resolved, deciding firmly about a sum of decimals to use - likely around four hundred, presuming the computer code soon halted ! Pondering these ideas, words appealed to me. But a problem of zeros did exist. Pondering more, solution subsequently appeared. Zero suggests a punctuation element. Very novel! My thoughts were culminated. No periods, I concluded. All residual marks of punctuation = zeros. First digit expansion answer then came before me. On examining some problems unhappily arose. That imbecilic bug! The printout I possessed showed four nine as foremost decimals. Manifestly troubling. Totally every number looked wrong. Repairing the bug took much effort. A pi mnemonic with letters truly seemed good. Counting of all the letters probably should suffice. Reaching for a record would be helpful. Consequently, I continued, expecting a good final answer from computer. First number slowly displayed on the flat screen -3. Good. Trailing digits apparently were right also. Now my memory scheme must probably be implementable. The technique was chosen, elegant in scheme : by self reference a tale mnemonically helpful was ensured. An able title suddenly existed - <Circle Digits>. Taking pen I began. Words emanated uneasily. I desired more synonyms. Speedily I found my (alongside me) Thesaurus. Rogets is probably an essential in doing this, instantly I decided. I wrote and erased more. The Rogets clearly assisted immensely My story proceeded (how lovely!) faultlessly. The end, above all, would soon joyfully overtake. So, this memory helper story is incontestably complete. Soon I will locate publisher. There a narrative will I trust immediately appear, producing fame. The end.'
			const segments = DocumentLoader.segment(str)
			const [words, ord] = DocumentLoader.ordinal(segments)
			expect(words).toHaveLength(234)
			for (let i = 0; i < segments.length; i++) {
				expect(words[ord[i]]).toBe(segments[i].toLowerCase())
			}
		})
	})
})
