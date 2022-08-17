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
	id: number;
	created_at: Date;
	title: string;
	description: string;
	// parties: [
	//     {
	//         info: Party,
	//         pro: boolean
	//     }
	// ];
	parties: {
		agrees: Party[];
		disagrees: Party[];
		neutral: Party[];
	};
};

export type Position = {
	id: number;
	created_at: Date;
	party: Party;
	argument: Argument;
	agrees: boolean | null;
};

function addToAllArguments(id: number, agrees: boolean | null, party: Party, list: Argument[]) {
	list[id]['parties'][agrees === null ? 'neutral' : agrees ? 'agrees' : 'disagrees'].push(party);
}

export const getArguments = async (): Promise<Argument[]> => {
	const { data: positions, error } = await supabase
		.from('position')
		.select('*, party (*), argument (*)');
	if (error) {
		throw 'Error getting positions';
	}

	let allArguments: Argument[] = Object();
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
