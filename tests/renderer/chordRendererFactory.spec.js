import _cloneDeep from 'lodash/cloneDeep';

import chordParserFactory from '../../src/parser/chordParserFactory';
import chordRendererFactory from '../../src/renderer/chordRendererFactory';

describe('Module', () => {
	test('Should expose a function', () => {
		expect(chordRendererFactory).toBeInstanceOf(Function);
	});
	test('Factory should return a function', () => {
		const renderChord = chordRendererFactory();
		expect(renderChord).toBeInstanceOf(Function);
	});
});

describe('Immutability', () => {
	test('Should not modify chord representation given as an input', () => {
		const parseChord = chordParserFactory();
		const renderChord = chordRendererFactory({
			transposeValue: 5,
			useShortNamings: true,
			simplify: 'core',
		});

		const parsed = Object.freeze(parseChord('Ch(#11,b13)'));
		const parsedCopy = _cloneDeep(parsed);

		renderChord(parsed);

		expect(parsed).toEqual(parsedCopy);
	});
});

describe('No filter', () => {
	describe.each([
		['Cm7', 'Cmi7'],
		['C7sus', 'C7sus'],
	])('%s', (input, expected) => {
		test('is rendered: ' + expected, () => {
			const parseChord = chordParserFactory();
			const renderChord = chordRendererFactory();
			const chord = Object.freeze(parseChord(input));
			expect(renderChord(chord)).toBe(expected);
		});
	});
});

describe('all filters', () => {
	describe.each([['Cm11', 'Abm']])('%s', (input, expected) => {
		test('is rendered: ' + expected, () => {
			const parseChord = chordParserFactory();
			const renderChord = chordRendererFactory({
				useShortNamings: true,
				transposeValue: 8,
				harmonizeAccidentals: true,
				useFlats: true,
				simplify: 'max',
			});
			const chord = Object.freeze(parseChord(input));
			expect(renderChord(chord)).toBe(expected);
		});
	});
});

describe('useShortNamings', () => {
	describe.each([
		['C(add9)', 'C2'],
		['Cdim', 'C°'],
		['Cma7', 'CM7'],
		['Cmi', 'Cm'],
		['Cmi7(omit3)', 'Cm7(no3)'],
		['Cdim7(add ma7)', 'C°7(addM7)'],
	])('%s', (input, expected) => {
		test('is rendered: ' + expected, () => {
			const parseChord = chordParserFactory();
			const renderChord = chordRendererFactory({ useShortNamings: true });
			const chord = parseChord(input);
			expect(renderChord(chord)).toBe(expected);
		});
	});
});

describe('Transpose', () => {
	describe.each([
		// transposeValue !== 0

		['+3', 'C/E', 3, false, false, 'D#/G'],
		['+3, useFlats', 'C/E', 3, true, false, 'Eb/G'],
		['-4', 'C/E', -4, false, false, 'G#/C'],
		['-4, useFlats', 'C/E', -4, true, false, 'Ab/C'],

		// transposeValue === 0

		['sharp', 'G#', 0, false, false, 'G#'],
		['sharp, useFlats', 'G#', 0, true, false, 'G#'],
		['sharp, useFlats, harmonizeAccidentals', 'G#', 0, true, true, 'Ab'],
		['sharp, harmonizeAccidentals', 'G#', 0, false, true, 'G#'],

		['flat', 'Ab', 0, false, false, 'Ab'],
		['flat, useFlats', 'Ab', 0, true, false, 'Ab'],
		['flat, useFlats, harmonizeAccidentals', 'Ab', 0, true, true, 'Ab'],
		['flat, harmonizeAccidentals', 'Ab', 0, false, true, 'G#'],
	])(
		'%s',
		(
			title,
			input,
			transposeValue,
			useFlats,
			harmonizeAccidentals,
			transposed
		) => {
			test(input + 'is transposed: ' + transposed, () => {
				const parseChord = chordParserFactory();
				const renderChord = chordRendererFactory({
					transposeValue,
					useFlats,
					harmonizeAccidentals,
				});
				const chord = parseChord(input);
				expect(renderChord(chord)).toBe(transposed);
			});
		}
	);
});

describe('Printers', () => {
	const parseChord = chordParserFactory();
	const chordC = parseChord('C');

	describe.each([
		['text printer', 'text', 'C'],
		['raw printer', 'raw', chordC],
		['unknown printer', 'idontexist', 'C'],
	])('%s', (title, printer, expected) => {
		test(title, () => {
			const renderChord = chordRendererFactory({ printer });
			const rendered = renderChord(chordC);
			expect(rendered).toEqual(expected);
		});
	});
});

describe('invalid options values', () => {
	describe.each([
		['invalid simplify value', 'Cm7', 'Cmi7', { simplify: false }],
		[
			'invalid simplify value, suspended chord',
			'C7sus',
			'C7sus',
			{ simplify: false },
		],
	])('%s', (title, input, expected, options) => {
		test(input + ' is rendered: ' + expected, () => {
			const parseChord = chordParserFactory();
			const renderChord = chordRendererFactory(options);
			const chord = Object.freeze(parseChord(input));
			expect(renderChord(chord)).toBe(expected);
		});
	});
});

describe('invalid parsed chord', () => {
	test('should return null if given chord is null', () => {
		const renderChord = chordRendererFactory({ printer: 'raw' });
		expect(renderChord(null)).toBeNull();
	});
});

describe('apply user filters', () => {
	const myFilter1 = (chord) => {
		chord.myFilter1 = true;
		return chord;
	};
	const myFilter2 = (chord) => {
		chord.myFilter2 = { applied: true };
		return chord;
	};
	const myFilter3 = (chord) => {
		chord.myFilter3 = 'myFilter3 has been applied';
		return chord;
	};
	const myNullFilter = () => null;

	test('should apply user filters', () => {
		const customFilters = [myFilter1, myFilter2, myFilter3];
		const parseChord = chordParserFactory();
		const parsed = parseChord('Cm7');

		const renderChord = chordRendererFactory({
			customFilters,
			printer: 'raw',
		});
		const rendered = renderChord(parsed);

		expect(rendered).toHaveProperty('myFilter1');
		expect(rendered).toHaveProperty('myFilter2');
		expect(rendered).toHaveProperty('myFilter3');
		expect(rendered.myFilter1).toEqual(true);
		expect(rendered.myFilter2).toEqual({ applied: true });
		expect(rendered.myFilter3).toEqual('myFilter3 has been applied');
	});

	test('should apply user filters on the raw chord object', () => {
		const customFilters = [myFilter1, myFilter2, myFilter3];
		const parseChord = chordParserFactory();
		const parsed = parseChord('Cm7');

		const renderChordRaw = chordRendererFactory({ printer: 'raw' });
		const renderChord = chordRendererFactory({
			customFilters,
			printer: 'raw',
		});

		const renderedRaw = renderChordRaw(parsed);
		const rendered = renderChord(parsed);

		const expected = {
			...renderedRaw,
			myFilter1: true,
			myFilter2: { applied: true },
			myFilter3: 'myFilter3 has been applied',
		};
		expect(rendered).toEqual(expected);
	});

	test('render function should return null if a user filter returns null', () => {
		const customFilters = [myFilter1, myFilter2, myFilter3, myNullFilter];
		const parseChord = chordParserFactory({ customFilters });
		const parsed = parseChord('Cm7');
		const renderChord = chordRendererFactory({ customFilters });

		expect(renderChord(parsed)).toBeNull();
	});
});
