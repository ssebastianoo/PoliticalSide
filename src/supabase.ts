import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
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
	parties.sort((a, b) => a.name.localeCompare(b.name));
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
		console.log(error);
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

export const buildArguments = async (): Promise<Arguments> => {
	const { data: rawArguments, error } = await supabase.from('argument').select('*');
	let buildedArguments: Arguments = Object();

	for (const arg of rawArguments!) {
		buildedArguments[arg.id] = {
			id: arg.id,
			created_at: arg.created_at,
			title: arg.title,
			description: arg.description,
			parties: {
				agrees: [],
				disagrees: [],
				neutral: []
			}
		};

		const { data: positions, error } = await supabase
			.from('position')
			.select('*, party (*)')
			.eq('argument', arg.id);

		for (const position of positions!) {
			if (position.agrees === true) {
				buildedArguments[arg.id]['parties']['agrees'].push(position.party);
			} else if (position.agrees === false) {
				buildedArguments[arg.id]['parties']['disagrees'].push(position.party);
			} else if (position.agrees === null) {
				buildedArguments[arg.id]['parties']['neutral'].push(position.party);
			}
		}
	}

	return buildedArguments;
};

export const setPartyPosition = async (
	partyInitial: string,
	argumentId: string,
	agrees: boolean | null
): Promise<void> => {
	const { data, error } = await supabase.from('position').upsert({
		party: partyInitial,
		argument: argumentId,
		agrees: agrees
	});
	if (error) {
		throw 'Error setting position';
	}
};

export const removePartyPosition = async (
	partyInitial: string,
	argumentId: string
): Promise<void> => {
	const { data, error } = await supabase
		.from('position')
		.delete()
		.match({ party: partyInitial, argument: argumentId });
	if (error) {
		throw 'Error removing position';
	}
};

export const createArgument = async (
	id: string,
	title: string,
	description: string
): Promise<Argument> => {
	const { data, error } = await supabase.from('argument').insert({
		id,
		title,
		description
	});
	if (error) {
		if (error.code === '23505') {
			throw { message: 'Argument already exists', code: 'alreadyExists' };
		}
		throw { message: 'Error creating argument', code: error.code };
	}

	return {
		id: data[0].id,
		created_at: data[0].created_at,
		title: data[0].title,
		description: data[0].description,
		parties: {
			agrees: [],
			disagrees: [],
			neutral: []
		}
	};
};

export const updateArgument = async (
	oldID: string,
	newID: string,
	title: string,
	description: string
): Promise<void> => {
	if (oldID !== newID) {
		const { data, error } = await supabase.from('argument').insert({
			id: newID,
			title,
			description
		});

		if (error) {
			if (error.code === '23505') {
				throw { message: 'Argument already exists', code: 'alreadyExists' };
			}
			throw { message: 'Error creating argument', code: error.code };
		}

		await supabase
			.from('position')
			.update({
				argument: newID
			})
			.match({ argument: oldID });
		await supabase.from('argument').delete().match({ id: oldID });
	} else {
		await supabase.from('argument').update({ id: newID, title, description }).match({ id: oldID });
	}
};

export const deleteArgument = async (id: string): Promise<void> => {
	await supabase.from('position').delete().match({ argument: id });
	await supabase.from('argument').delete().match({ id });
};

const checkFileType = (filename: string) => {
	return ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(filename.split('.').pop()!.toLowerCase());
};

export const createParty = async (
	initial: string,
	name: string,
	orientation: string,
	logo: File | undefined
): Promise<Party> => {
	let logoUrl: string | null = null;

	if (logo) {
		if (!checkFileType(logo.name)) {
			throw { message: 'Invalid file type', code: 'invalidFileType' };
		}

		await supabase.storage.from('parties').upload(initial, logo, {
			upsert: true
		});
		const { data: logoData, error } = await supabase.storage.from('parties').getPublicUrl(initial);
		logoUrl = logoData ? logoData.publicURL : null;
	}

	const { data, error } = await supabase.from('party').insert({
		initial,
		name,
		orientation,
		logo: logoUrl
	});
	if (error) {
		await supabase.storage.from('parties').remove([initial]);
		if (error.code === '23505') {
			throw { message: 'Party already exists', code: 'alreadyExists' };
		}
		throw { message: 'Error creating party', code: error.code };
	}
	return data[0] as Party;
};

export const updateParty = async (
	oldInitial: string,
	newInitial: string,
	name: string,
	orientation: string,
	logo: File | undefined
): Promise<void> => {
	if (!logo) {
		await supabase
			.from('party')
			.update({ initial: newInitial, name, orientation })
			.match({ initial: oldInitial });
	} else {
		if (!checkFileType(logo.name)) {
			throw { message: 'Invalid file type', code: 'invalidFileType' };
		}

		if (newInitial !== oldInitial) {
			await supabase.storage.from('parties').remove([oldInitial]);
		}

		await supabase.storage.from('parties').upload(newInitial, logo, {
			upsert: true
		});
		const { data: logoData, error } = await supabase.storage.from('parties').getPublicUrl(newInitial);
		const logoUrl = logoData ? logoData.publicURL : null;
		await supabase
			.from('party')
			.update({ initial: newInitial, name, orientation, logo: logoUrl })
			.match({ initial: oldInitial });
	}
};

export const deleteParty = async (initial: string): Promise<void> => {
	await supabase.from('position').delete().match({ party: initial });
	await supabase.from('party').delete().match({ initial });
	await supabase.storage.from('parties').remove([initial]);
};
