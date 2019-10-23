/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
//import data = require("../data.json");
import * as data from './data.json';

var accessors : string[] = [];
for(let i=0; i<data.classes.length; i++)
{
	let val : string = data.classes[i].accessor
	if(val !== undefined && val.length > 0 && val.toLowerCase() != "unknown")
	{
		accessors.push(val)
	}
}

export function activate(context: vscode.ExtensionContext) {

	let provider1 = vscode.languages.registerCompletionItemProvider('plaintext', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			let items = [];

			for(let i=0; i<accessors.length; i++)
			{
				const commitCharacterCompletion = new vscode.CompletionItem(accessors[i]);
				commitCharacterCompletion.commitCharacters = [':'];
				items.push(commitCharacterCompletion);
			}


			for(let i=0; i<data.constants.length; i++)
			{
				const isModifierProp = (data.constants[i].prefix == "MODIFIER_PROPERTY_");
				let values = data.constants[i].values;
				for(let a=0; a<values.length; a++)
				{
					let item = new vscode.CompletionItem(values[a].name);
					if(isModifierProp)
					{
						item.documentation = "";
						if(values[a].funcdesc !== undefined)
						{
							item.documentation += values[a].funcdesc + "\n---\n";
						}
						else
						{
							item.documentation += "No Description\n---\n";
						}
						item.documentation += "function: " + values[a].description + "()\n";
						item.documentation += "value: " + values[a].value;
						item.detail = values[a].description + "()";
					}
					else
					{
						item.documentation = values[a].description;
						item.detail = "value:" + values[a].value;
					}
					
					items.push(item);
				}
			}
			return items;
		}
	});

	const provider2 = vscode.languages.registerCompletionItemProvider(
		'plaintext',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				let linePrefix = document.lineAt(position).text.substr(0, position.character);

				let items : vscode.CompletionItem[] = [];
				let hasFoundAccessor = false;
				for(let a=0; a<accessors.length && !hasFoundAccessor; a++)
				{
					if (linePrefix.endsWith(accessors[a] + ":"))
					{
						hasFoundAccessor=  true;
						let hasFoundClass = false;
						for(let b=0; b<data.classes.length && !hasFoundClass; b++)
						{
							if(data.classes[b].accessor == accessors[a])
							{
								hasFoundClass = true;
								let funcs = data.classes[b].funcs;
								
								for(let func in funcs)
								{
									let item = new vscode.CompletionItem(func, vscode.CompletionItemKind.Method);
									let f = funcs[func];
									let signature = funcs[func].signature;
									if(signature !== undefined)
									{
										item.detail = signature;
									}

									let description = funcs[func].description;
									if(description !== undefined)
									{
										item.documentation = description;
									}
									else
									{
										item.documentation = "No Description"
									}

									items.push(item)
								}
							}
						}
					}
				}

				if(hasFoundAccessor)
				{
					return items;
				}

				// let hasFoundConstant = false
				// for(let i=0; i<data.constants.length && !hasFoundConstant; i++)
				// {
				// 	let prefix : string = data.constants[i].prefix;
				// 	if(prefix !== undefined && linePrefix.endsWith(prefix + ":"))
				// 	{
				// 		hasFoundConstant = true;
				// 		let prefixLen = prefix.length;
				// 		for(let a=0; a<data.constants[i].values.length; a++)
				// 		{
				// 			let item = new vscode.CompletionItem("a"+i, vscode.CompletionItemKind.Method);
				// 				items.push(item);

				// 			// let value = data.constants[i].values[a];
				// 			// if(value.name.startsWith(prefix))
				// 			// {
				// 			// 	let completion = value.name.substr(prefixLen)
				// 			// 	let item = new vscode.CompletionItem(value.name, vscode.CompletionItemKind.Method);
				// 			// 	items.push(item);
				// 			// }
				// 		}
				// 	}
				// }

				return undefined;

				/*
				if (!linePrefix.endsWith('PlayerResource:')) {
					return undefined;
				}

				let items = [
					new vscode.CompletionItem('test1', vscode.CompletionItemKind.Method)
				];

				items.push(new vscode.CompletionItem('test2', vscode.CompletionItemKind.Method))
				items.push(new vscode.CompletionItem('test5', vscode.CompletionItemKind.Method));

				if(data != undefined && data !=null)
				{
					items.push(new vscode.CompletionItem('test3', vscode.CompletionItemKind.Method));

					for(let i=0; i<data.classes.length; i++)
					{
						if(data.classes[i].accessor != undefined && data.classes[i].accessor.length > 0)
						{
							if(data.classes[i].accessor == "PlayerResource")
							{
								let funcs = data.classes[i].funcs;
								for(let func in funcs)
								{
									let sig = func;
									items.push(new vscode.CompletionItem(sig, vscode.CompletionItemKind.Method));
								}
							}
						}
					}
				}
				else
				{
					items.push(new vscode.CompletionItem('test4', vscode.CompletionItemKind.Method));
				}

				return items;
				*/
			}
		},
		':' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(provider1, provider2);
}
