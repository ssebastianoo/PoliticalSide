import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL!,
	import.meta.env.VITE_SUPABASE_KEY!
);

export type Party = {
	initial: string;
	name: string;
	created_at: Date;
	orientation: string;
	logo: string | null;
};

export type Argument = {
	id: string;
	created_at: Date;
	title: string;
	description: string;
	parties: {
		agrees: Party[];
		disagrees: Party[];
		neutral: Party[];
	};
};

export type Arguments = {
	[id: string]: Argument;
};

export type Position = {
	id: number;
	created_at: Date;
	party: Party;
	argument: Argument;
	agrees: boolean | null;
};

export const getParties = async (): Promise<Party[]> => {
	const { data, error } = await supabase.from('party').select('*');
	const parties = data as Party[];
	return parties;
};

function addToAllArguments(id: number, agrees: boolean | null, party: Party, list: Arguments) {
	list[id]['parties'][agrees === null ? 'neutral' : agrees ? 'agrees' : 'disagrees'].push(party);
}

export const getArguments = async (): Promise<Arguments> => {
	const { data: positions, error } = await supabase
		.from('position')
		.select('*, party (*), argument (*)');
	if (error) {
		throw 'Error getting positions';
	}

	let allArguments: Arguments = Object();
	for (const position of positions) {
		if (allArguments[position.argument.id]) {
			addToAllArguments(position.argument.id, position.agrees, position.party, allArguments);
		} else {
			allArguments[position.argument.id] = {
				id: position.argument.id,
				created_at: position.argument.created_at,
				title: position.argument.title,
				description: position.argument.description,
				parties: {
					agrees: [],
					disagrees: [],
					neutral: []
				}
			};
			addToAllArguments(position.argument.id, position.agrees, position.party, allArguments);
		}
	}

	return allArguments;
};

export const setPartyPosition = async (
	partyInitial: string,
	argumentId: string,
	agrees: boolean | null
): Promise<void> => {
	await supabase.from('position').upsert({
		party: partyInitial,
		argument: argumentId,
		agrees: agrees
	});
};

export const removePartyPosition = async (
	partyInitial: string,
	argumentId: string
): Promise<void> => {
	await supabase.from('position').delete().match({ party: partyInitial, argument: argumentId });
};
