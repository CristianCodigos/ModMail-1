import Command from '../lib/structures/Command';
import { ISnippet } from '../lib/types/Database';

export default new Command('snippet', async (caller, cmd, _log, config) => {
	if (!cmd.args[0]) return caller.utils.discord.createMessage(cmd.channel.id, 'Select `create`, `edit`, `delete` or `list`.');
	if (!cmd.args[1] && ['show', 'list'].indexOf(cmd.args[0]) < 0) return caller.utils.discord.createMessage(cmd.channel.id, 'Provide a snippet name.');

	const snippet = config.snippets[cmd.args[1]];

	const list: string[] = [],
		snippets: string[][] = [],
		s = 10;
	let snippetsRAW: Record<string, ISnippet>;

	switch (cmd.args[0]) {
		// Create a snippet.
		case 'create': case 'add': case 'new':
			if (!cmd.args[2])
				return caller.utils.discord.createMessage(cmd.channel.id, 'Provide a valid text.');

			// Check if the snippet exists
			if (snippet)
				return caller.utils.discord.createMessage(cmd.channel.id, 'A snippet with this name already exists.');

			caller.db.createSnippet(cmd.args[1], {
				content: cmd.args.slice(2).join(' '),
				createdAt: new Date(),
				creatorID: cmd.msg.author.id
			})
				.then(() => caller.utils.discord.createMessage(cmd.channel.id, 'Snippet created.'))
				.catch((error) => {
					caller.utils.discord.createMessage(cmd.channel.id, 'There has been an error creating the snippet.');
					console.error(error);
				});
			break;

		// Edit a snippet.
		case 'edit':
			if (!snippet)
				return caller.utils.discord.createMessage(cmd.channel.id, 'A snippet with this name does not exist.');
			if (!cmd.args[2])
				return caller.utils.discord.createMessage(cmd.channel.id, 'Provide the new snippet content.');

			caller.db.editSnippet(cmd.args[1], cmd.args.slice(2).join(' '));
			caller.utils.discord.createMessage(cmd.channel.id, 'The snippet has been updated.');
			break;

		// Delete a snippet.
		case 'delete': case 'remove': case 'rmv':
			if (!snippet)
				return caller.utils.discord.createMessage(cmd.channel.id, 'A snippet with this name does not exist.');
			caller.db.deleteSnippet(cmd.args[1])
				.then(() => caller.utils.discord.createMessage(cmd.channel.id, 'Snippet deleted.'))
				.catch((error) => {
					caller.utils.discord.createMessage(cmd.channel.id, 'There has been an error deleting the snippet.');
					console.error(error);
				});
			break;

		// Show all snippets
		case 'list': case 'show':
			snippetsRAW = config.snippets;
			if (!snippetsRAW || Object.keys(snippetsRAW).length === 0)
				return caller.utils.discord.createMessage(cmd.channel.id, 'No snippets found.');

			for (const name of Object.keys(snippetsRAW))
				list.push(`${name} | ${snippetsRAW[name].content.length > 50 ? snippetsRAW[name].content.substr(0, 50) + '...' : snippetsRAW[name].content}`);

			while (list.length > 0)
				snippets.push(list.splice(0, s));
			// Send the list
			for (const s of snippets)
				caller.utils.discord.createMessage(cmd.channel.id, `\`\`\`\nNAME | CONTENT\n-----------\n${s.join('\n')}\`\`\``);
			break;
		default:
			caller.utils.discord.createMessage(cmd.channel.id, 'Select `create`, `edit`, `delete` or `list`.');
			break;
	}
},
{
	level: 'ADMIN',
	aliases: ['qr', 'quickreply']
});