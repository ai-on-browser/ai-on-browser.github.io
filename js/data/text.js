import DocumentData from './document.js'

// https://en.wikipedia.org/wiki/Artificial_intelligence
const DEFAULT_TEXT = `Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by humans or animals.
Leading AI textbooks define the field as the study of "intelligent agents": any system that perceives its environment and takes actions that maximize its chance of achieving its goals.
Some popular accounts use the term "artificial intelligence" to describe machines that mimic "cognitive" functions that humans associate with the human mind, such as "learning" and "problem solving".
AI applications include advanced web search engines, recommendation systems (used by YouTube, Amazon and Netflix), understanding human speech (such as Siri or Alexa), self-driving cars (e.g. Tesla), and competing at the highest level in strategic game systems (such as chess and Go), As machines become increasingly capable, tasks considered to require "intelligence" are often removed from the definition of AI, a phenomenon known as the AI effect.
For instance, optical character recognition is frequently excluded from things considered to be AI, having become a routine technology.
Artificial intelligence was founded as an academic discipline in 1956, and in the years since has experienced several waves of optimism, followed by disappointment and the loss of funding (known as an "AI winter"), followed by new approaches, success and renewed funding.
AI research has tried and discarded many different approaches during its lifetime, including simulating the brain, modeling human problem solving, formal logic, large databases of knowledge and imitating animal behavior.
In the first decades of the 21st century, highly mathematical statistical machine learning has dominated the field, and this technique has proved highly successful, helping to solve many challenging problems throughout industry and academia.
The various sub-fields of AI research are centered around particular goals and the use of particular tools.
The traditional goals of AI research include reasoning, knowledge representation, planning, learning, natural language processing, perception and the ability to move and manipulate objects.
General intelligence (the ability to solve an arbitrary problem) is among the field's long-term goals.
To solve these problems, AI researchers use versions of search and mathematical optimization, formal logic, artificial neural networks, and methods based on statistics, probability and economics.
AI also draws upon computer science, psychology, linguistics, philosophy, and many other fields.
The field was founded on the assumption that human intelligence "can be so precisely described that a machine can be made to simulate it".
This raises philosophical arguments about the mind and the ethics of creating artificial beings endowed with human-like intelligence.
These issues have been explored by myth, fiction and philosophy since antiquity.
Some people also consider AI to be a danger to humanity if it progresses unabated.
Others believe that AI, unlike previous technological revolutions, will create a risk of mass unemployment.`

export default class TextData extends DocumentData {
	constructor(manager) {
		super(manager)
		const elm = this.setting.data.configElement
		const textarea = document.createElement('textarea')
		textarea.cols = 70
		textarea.rows = 15
		textarea.classList.add('data-upload')
		textarea.value = DEFAULT_TEXT
		textarea.onchange = () => {
			this._x = [this.segment(textarea.value)]
			this._y = [0]
		}
		elm.appendChild(textarea)
		this._x = [this.segment(textarea.value)]
		this._y = [0]
	}

	get availTask() {
		return ['WE']
	}
}
