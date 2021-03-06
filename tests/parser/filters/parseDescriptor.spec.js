import chain from '../../../src/helpers/chain';
import { englishVariants } from '../../../src/dictionaries/notes';

import parseDescriptor from '../../../src/parser/filters/parseDescriptor';
import initChord from '../../../src/parser/filters/initChord';
import parseBase from '../../../src/parser/filters/parseBase';
import intervalsToSemitones from '../../../src/dictionaries/intervalsToSemitones';
import getParsableDescriptor from '../../../src/parser/filters/getParsableDescriptor';

function parseChord(symbol) {
	const allFilters = [
		initChord.bind(null, {}),
		parseBase.bind(null, englishVariants),
		getParsableDescriptor,
	];
	return chain(allFilters, symbol);
}

describe('Intervals & semitones', () => {
	// prettier-ignore
	describe.each([
		['A', ['1', '3', '5'], { major: true, eleventh: false, alt: false }],
		['A6', ['1', '3', '5', '6'], { major: true, eleventh: false, alt: false }],
		['A69', ['1', '3', '5', '6', '9'], { major: true, eleventh: false, alt: false }],
		['AM7', ['1', '3', '5', '7'], { major: true, eleventh: false, alt: false }],
		['AM9', ['1', '3', '5', '7', '9'], { major: true, eleventh: false, alt: false }],
		['AM11', ['1', '5', '7', '9', '11'], { major: true, eleventh: true, alt: false }],
		['AM13', ['1', '3', '5', '7', '9', '13'], { major: true, eleventh: false, alt: false }],

		['A7', ['1', '3', '5', 'b7'], { major: true, eleventh: false, alt: false }],
		['A9', ['1', '3', '5', 'b7', '9'], { major: true, eleventh: false, alt: false }],
		['A11', ['1', '5', 'b7', '9', '11'], { major: true, eleventh: true, alt: false }],
		['A13', ['1', '3', '5', 'b7', '9', '13'], { major: true, eleventh: false, alt: false }],

		['Am', ['1', 'b3', '5'], { major: false, eleventh: false, alt: false }],
		['Am6', ['1', 'b3', '5', '6'], { major: false, eleventh: false, alt: false }],
		['Am69', ['1', 'b3', '5', '6', '9'], { major: false, eleventh: false, alt: false }],
		['Am7', ['1', 'b3', '5', 'b7'], { major: false, eleventh: false, alt: false }],
		['Am9', ['1', 'b3', '5', 'b7', '9'], { major: false, eleventh: false, alt: false }],
		['Am11', ['1', 'b3', '5', 'b7', '9', '11'], { major: false, eleventh: true, alt: false }],
		['Am13', ['1', 'b3', '5', 'b7', '9', '11', '13'], { major: false, eleventh: false, alt: false }],
		['Am67', ['1', 'b3', '5', 'b7', '13'], { major: false, eleventh: false, alt: false }],
		['Am6/97', ['1', 'b3', '5', 'b7', '9', '13'], { major: false, eleventh: false, alt: false }],

		['Csus', ['1', '4', '5'], { major: true, eleventh: false, alt: false }],
		['Csus(add3)', ['1', '3', '4', '5'], { major: true, eleventh: false, alt: false }],
		['AM7sus', ['1', '4', '5', '7'], { major: true, eleventh: false, alt: false }],
		['AM9sus', ['1', '4', '5', '7', '9'], { major: true, eleventh: false, alt: false }],
		['AM11sus', ['1', '4', '5', '7', '9', '11'], { major: true, eleventh: true, alt: false }],
		['AM13sus', ['1', '4', '5', '7', '9', '13'], { major: true, eleventh: false, alt: false }],
		['A7sus', ['1', '4', '5', 'b7'], { major: true, eleventh: false, alt: false }],
		['A9sus', ['1', '4', '5', 'b7', '9'], { major: true, eleventh: false, alt: false }],
		['A11sus', ['1', '4', '5', 'b7', '9', '11'], { major: true, eleventh: true, alt: false }],
		['A13sus', ['1', '4', '5', 'b7', '9', '13'], { major: true, eleventh: false, alt: false }],

		['Adim', ['1', 'b3', 'b5'], { major: false, eleventh: false, alt: false }],
		['Ah', ['1', 'b3', 'b5', 'b7'], { major: false, eleventh: false, alt: false }],
		['Adim7', ['1', 'b3', 'b5', 'bb7'], { major: false, eleventh: false, alt: false }],
		['Adim(ma7)', ['1', 'b3', 'b5', '7'], { major: false, eleventh: false, alt: false }],
		['Ao7(ma7)', ['1', 'b3', 'b5', 'bb7', '7'], { major: false, eleventh: false, alt: false }],
		['Ao7(add ma7)', ['1', 'b3', 'b5', 'bb7', '7'], { major: false, eleventh: false, alt: false }],
		['A+', ['1', '3', '#5'], { major: true, eleventh: false, alt: false }],
		['A+7', ['1', '3', '#5', 'b7'], { major: true, eleventh: false, alt: false }],

		['A(bass)', ['1'], { major: true, eleventh: false, alt: false }],
		['A5', ['1', '5'], { major: true, eleventh: false, alt: false }],

		['Aomit3omit5', ['1'], { major: true, eleventh: false, alt: false }],

		['C4', ['1', '4', '5'], { major: true, eleventh: false, alt: false }],
		['Cadd4', ['1', '3', '4', '5'], { major: true, eleventh: false, alt: false }],
	])('%s', (symbol, intervals, intents) => {
		test('is parsed: ' + intervals.join('-'), () => {
			const chord = parseChord(symbol);
			const parsed = parseDescriptor({}, chord);
			const semitones = intervals.map(
				(interval) => intervalsToSemitones[interval]
			);

			expect(parsed.normalized.intervals).toEqual(intervals);
			expect(parsed.normalized.semitones).toEqual(semitones);
			expect(parsed.normalized.intents).toEqual(intents);
		});
	});
});

describe('invalid chords', () => {
	describe.each([
		['Modifier does not exist', 'Az'],
		['Modifier is applied multiple times, 1', 'Aminm'],
		['Modifier is applied multiple times, 2', 'C°dim'],
	])('%s', (title, symbol) => {
		test(symbol + ': should return null', () => {
			const chord = parseChord(symbol);
			const parsed = parseDescriptor({}, chord);

			expect(parsed).toBeNull();
		});
	});
});

describe('altered chords', () => {
	describe.each([
		['b5', { fifthFlat: true }, ['1', '3', 'b5', 'b7']],
		['#5', { fifthSharp: true }, ['1', '3', '#5', 'b7']],
		['b9', { ninthFlat: true }, ['1', '3', '5', 'b7', 'b9']],
		['#9', { ninthSharp: true }, ['1', '3', '5', 'b7', '#9']],
		['#11', { eleventhSharp: true }, ['1', '3', '5', 'b7', '#11']],
		['#11', { thirteenthFlat: true }, ['1', '3', '5', 'b7', 'b13']],

		[
			'all',
			{
				fifthFlat: true,
				fifthSharp: true,
				ninthFlat: true,
				ninthSharp: true,
				eleventhSharp: true,
				thirteenthFlat: true,
			},
			['1', '3', 'b5', '#5', 'b7', 'b9', '#9', '#11', 'b13'],
		],
	])('%s', (title, altIntervals, intervals) => {
		test('alt should yield intervals ' + intervals.join(' '), () => {
			const chord = parseChord('Calt');
			const parsed = parseDescriptor(altIntervals, chord);

			expect(parsed.normalized.intervals).toEqual(intervals);
			expect(parsed.normalized.intents.alt).toEqual(true);
		});
	});
});
