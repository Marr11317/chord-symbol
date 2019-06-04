import { allVariantsToNotes } from '../../dics/allNotes';

export default function normalizeNotes(chord) {
	chord.normalized.rootNote = allVariantsToNotes[chord.input.rootNote];

	if (chord.input.bassNote) {
		chord.normalized.bassNote = allVariantsToNotes[chord.input.bassNote];
	}

	return chord;
}
