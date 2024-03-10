// Retrieve the div containers where the buttons are placed
const textElement = document.getElementById("text");
const optionButtonsElement = document.getElementById("option-buttons");

// need a variable to pick up items throughout the game
let state = {};

function getColor(colors) {
	const randomIndex = Math.floor(Math.random() * colors.length);
	const color = `rgb(${colors[randomIndex][0]}, ${colors[randomIndex][1]}, ${colors[randomIndex][2]})`;
	colors.splice(randomIndex, 1);
	console.log(colors);
	return color;
}

// Need to be able to start the game and show the first option
function startGame() {
	// Make sure state is empty in the beginning of the game
	state = {};
	// Show the first option
	showTextNode(1);
}

// Need to retrieve each of the options. Design a function that can read each of the options
function showTextNode(textNodeIndex) {
	// Find a specific text node.
	const textNode = textNodesList.find(
		(textNode) => textNode.id === textNodeIndex
	);
	// console.log(textNode);

	// Set the text element to the text in id
	console.log(textNode.text);
	textElement.innerText = textNode.text;

	// Not all options will have four options so we need to remove all options first
	while (optionButtonsElement.firstChild) {
		optionButtonsElement.removeChild(optionButtonsElement.firstChild);
	}

	// Colors list so each button is different color
	let colors = [
		[238, 139, 218],
		[159, 238, 139],
		[139, 192, 238],
		[238, 228, 139],
		[238, 139, 150],
		[156, 118, 231]
	];
	// Iterate through each of the options that need to be shown and create a button for it
	for (i = 0; i < textNode.options.length; i++) {
		let option = textNode.options[i];

		if (showOption(option)) {
			// Create a button for each of the options presented
			const button = document.createElement("button");
			console.log(option.text);
			button.innerText = option.text;
			button.classList.add("button");
			// Add an event listener to deteremine when button is clicked
			button.addEventListener("click", () => selectOption(option));
			// Change button color for each option
			color = getColor(colors);
			button.style.backgroundColor = color;
			optionButtonsElement.appendChild(button);
		}
	}
}

function showOption(option) {
	// if required state is not met then the option should not appear.
	return option.requiredState == null || option.requiredState(state);
}

// Need a function that selects the option and progresses the story
function selectOption(option) {
	// Select option using nextText and update setState
	const nextTextNodeId = option.nextText;

	// Restart Game if nextText = -1
	if (nextTextNodeId <= 0) {
		return startGame();
	}
	state = Object.assign(state, option.setState);
	console.log(nextTextNodeId);
	// Progress to the nextText id
	showTextNode(nextTextNodeId);
	console.log(state);
}

// textNode will contain how the game progresses
const textNodesList = [
	// You wake up and find a key. If you pick up key then you can open filing cabinet
	{
		id: 1,
		text:
			" You wake up in a strange place with no memory how you got there. You see a key",
		options: [
			{
				// Reaching for key means you can open filing cabinet
				text: "Reach for the key",
				setState: { takeKey: true },
				nextText: 2
			},
			{
				// Cannot open filing cabinet without key
				text: "Don't Reach for Key",
				nextText: 2
			}
		]
	},
	// Opening the filing cabinet reveals important files and information about the hospital
	{
		id: 2,
		text:
			"You slowly stand and look around the room. You see a filing cabinet in the corner.",
		options: [
			{
				// Searching for filing cabinet means you can blackmail the nurse
				text: "Search the filing cabinet",
				requiredState: (currentState) => currentState.takeKey,
				setState: { takeKey: false, importantFiles: true },
				nextText: 3
			},
			// if you try and force the cabinet open then you injure your hand
			{
				text: "Try and forcefully open filing cabinet",
				setState: { takeKey: false, injuredHand: true },
				nextText: 4
			},
			// Ignore the filing cabinet means missing valuable information
			{
				text: "Ignore the filing cabinet",
				nextText: 5
			}
		]
	},

	// Finding the important files unlocks dialogue with one of the nurses
	{
		id: 3,
		text:
			"You discover some important files detailing employees within the hospital. You venture out of the room.",
		options: [
			{
				// Continue with the story
				text: "Continue out of the room",
				nextText: 5
			}
		]
	},

	{
		// You've injured your hand opening the filing cabinet. You can treat it now or later
		id: 4,
		text: "You've injured your hand trying to open the filing cabinet",
		options: [
			{
				// Need to get hand treated as you have a bad health condition
				text: "Wrap your hand in the bed sheet",
				setState: { injuredHand: true, wrappedHand: true },
				nextText: 5
			},
			{
				// Ignore injury
				text: "Continue out of the room to explore",
				setState: { injuredHand: true },
				nextText: 5
			}
		]
	},

	{
		// Enter the hallway.
		id: 5,
		text:
			"You enter a long hallway. You are unsure of what to do next but you venture out.",
		options: [
			{
				// Call out to see if anyone is there but this draws unwanted attention
				text: "Call out and check if anyone is here.",
				nextText: 6
			},
			{
				// Silently explore and avoid being detected
				text: "Silently explore the hospital",
				nextText: 7
			}
		]
	},

	{
		// If we call out then a nurse will hear you. She can answer questions or you can ask her to treat your hand.
		id: 6,
		text:
			"A nurse hears you calling out and comes to speak to you. She asks you need help.",
		options: [
			{
				// The nurse will tell you can't leave
				text: "Ask where the exit is",
				requiredState: (currentState) => !currentState.blackmailUsed,
				nextText: 8
			},
			{
				// You need to know why you are in the hospital
				text: "Ask why you are here",
				setState: { diagnosisKnown: true },
				nextText: 9
			},
			{
				// Blackmailing the nurse causes the nurse to get upset
				text: "Blackmail the nurse for her keys.",
				requiredState: (currentState) =>
					currentState.importantFiles && !currentState.blackmailUsed,
				setState: {
					importantFiles: false,
					blackmailUsed: true,
					hospitalKeys: true
				},
				nextText: 6
			},
			{
				// You need to disinfect your hand or end game
				text: "Ask her to disinfect and wrap your hand",
				requiredState: (currentState) => currentState.injuredHand,
				setState: { injuredHand: false, cleanHand: true },
				nextText: 6
			},
			{
				text: "Ignore the Nurse, Continue exploring the hospital",
				nextText: 10
			}
		]
	},
	// Silently exploring the hospitals will allow you to search the nurse's station
	{
		id: 7,
		text:
			"You continue to search the hospital. You decide to go to the nurse's station",
		options: [
			{
				// Searching the files on the computer means you will know why you are in the hospital
				text: "Search files on computer",
				setState: { diagnosisKnown: true },
				requiredState: (currentState) => !currentState.diagnosisKnown,
				nextText: 7
			},
			{
				// Looking for the keys willl allow you to find the exit.
				text: "Search drawers",
				setState: { hospitalKeys: true },
				requiredState: (currentState) =>
					!currentState.hospitalKeys && currentState.diagnosisKnown,
				nextText: 7
			},
			{
				// If you steal the sandwich you can trade it with another patient
				text: "Steal sandwich",
				setState: { sandwich: true },
				requiredState: (currentState) => !currentState.sandwich,
				nextText: 7
			},
			{
				// Medication is required to escape and live
				text: "Steal medication",
				requiredState: (currentState) =>
					currentState.hospitalKeys && !currentState.haveMedication,
				setState: { haveMedication: true },
				nextText: 10
			},
			{
				// Ignore the nurses's station
				text: "Continue exploring the hospital",
				nextText: 10
			}
		]
	},
	{
		// The nurse tells you can't leave as you need medication to live.
		id: 8,
		text:
			"The nurse tells you can't leave. You are desperate to leave as you do not trust the nurse.",
		options: [
			{
				// Blackmailing the nurse causes her to be upset with you.
				//Easy way to exit but wil not have medicaiton or keys
				text: "Blackmail the nurse into escorting you to the exit",
				requiredState: (currentState) => currentState.importantFiles,
				setState: { importantFiles: false, blackmailUsed: true },
				nextText: 21
			},
			{
				// Blackmailing the nurse for her keys will give you the hospital keys
				text: "Blackmail the nurse for her keys.",
				requiredState: (currentState) => currentState.importantFiles,
				setState: {
					importantFiles: false,
					blackmailUsed: true,
					hospitalKeys: true
				},
				nextText: 11
			},
			{
				// Run away from nurse
				text: "Run away from the Nurse",
				nextText: 10
			},
			{
				// Ask why you are in the hospital
				text: "Ask why you are in the hospital",
				setState: { diagnosisKnown: true },
				nextText: 9
			},
			{
				// Ask her to disinfect your hand so you don't die from infection
				text: "Ask her to disinfect and wrap your hand",
				requiredState: (currentState) => currentState.injuredHand,
				setState: { injuredHand: false, cleanHand: true },
				nextText: 8
			}
		]
	},
	{
		// If asked the right question you will discover you have a medical condition
		id: 9,
		text:
			"You are informed you have a rare disease and need constant medication to survive. You are also informed that you susceptible to infections.",
		options: [
			{
				// Search for the medication you need to survve
				text: "Search for medication",
				requireState: (currentState) => currentState.diagnosisKnown,
				nextText: 7
			},
			{
				// Search for the exit instead
				text: "Search for the exit",
				nextText: 10
			}
		]
	},
	{
		id: 10,
		text: "You continue through the hospital in search of the exit.",
		options: [
			{
				// Die from infection
				text: "Continue",
				requiredState: (currentState) => currentState.injuredHand,
				nextText: 18
			},
			{
				// Enter room with patient to help you exit
				text: "Enter room with patient",
				requiredState: (currentState) => !currentState.injuredHand,
				nextText: 11
			},
			{
				// Continue searching by yourself
				text: "Continue Searching for Exit",
				requiredState: (currentState) =>
					!currentState.injuredHand && !currentState.hospitalKeys,
				nextText: 19
			}
		]
	},
	{
		id: 11,
		text:
			"You enter a room with a patient. You notice a medicine cabinet on the wall",
		options: [
			{
				// You can trade a sandwich to gain a partner in crime
				text: "Trade sandwich ",
				requiredState: (currentState) =>
					currentState.sandwich && !currentState.partnerInCrime,
				setState: { partnerInCrime: true, sandwich: false },
				nextText: 11
			},
			{
				// Second opportunity to steal medication you need to live
				text: "Steal medication from medicine cabinet",
				requiredState: (currentState) =>
					currentState.hospitalKeys && !currentState.haveMedication,
				setState: { haveMedication: true },
				nextText: 11
			},
			{
				// Ask the patient where the exit is
				text: "Ask patient where the exit is",
				nextText: 12
			},
			{
				// Ask the patient to join you in sneaking out. Important if you blackmailed the nurse
				text: "Sneak out hospital with patient",
				requiredState: (currentState) =>
					currentState.partnerInCrime && !currentState.sandwich,
				nextText: 12
			}
		]
	},
	{
		id: 12,
		text: "The nurse is looking for you. She spots you! You see the exit nearby.",
		options: [
			{
				// Ending when you blackmailed the nurse
				text: "Run to the exit",
				requiredState: (currentState) =>
					currentState.blackmailUsed &&
					currentState.hospitalKeys &&
					currentState.haveMedication,
				nextText: 13
			},
			{
				// Ending where you didn't blackmail the nurse and have medication
				text: "Escape from the Hospital",
				requiredState: (currentState) =>
					currentState.hospitalKeys &&
					currentState.haveMedication &&
					!currentState.blackmailUsed,
				nextText: 14
			},
			{
				// Ending where you didn't blackmail nurse but didn't have your medication
				text: "Escape from the Hospital",
				requiredState: (currentState) =>
					currentState.hospitalKey &&
					!currentState.haveMedication &&
					!currentState.blackmailUsed,
				nextText: 15
			},
			{
				// Eding where you didn't have the hospital keys
				text: "Run towards the exit",
				requiredState: (currentState) => !currentState.hospitalKeys,
				nextText: 20
			}
		]
	},
	{
		id: 13,
		text: "You run towards the exit but the Nurse is trying to stop you.",
		options: [
			{
				// Set up for different endings
				text: "Try to Escape with Friend",
				requiredState: (currentState) => currentState.partnerInCrime,
				nextText: 16
			},
			{
				// If you blackmailed the nurse then she will catch you
				text: "The Nurse catches you",
				requiredState: (currentState) =>
					currentState.blackmailUsed && !currentState.partnerInCrime,
				nextText: 17
			}
		]
	},

	{
		// You Escaped !
		id: 14,
		text: "Congratulations, you escaped! ",
		options: [{ text: "Play Again?", nextText: -1 }]
	},
	{
		// You escaped but you died without your medication
		id: 15,
		text: " You escaped from the hospital but died without your medicaiton.",
		options: [{ text: "Play Again?", nextText: -1 }]
	},
	{
		// Your friend protected you and helped you escape the nurse.
		id: 16,
		text:
			"The nurse goes to grab you with no intention of letting you escape. Your friend remembers your kindness and intervenes preventing the nurse from grabbing you. With his help, you overpower the nurse and you both escape. Congratulations",
		options: [{ text: "Play Again?", nextText: -1 }]
	},
	{
		// The nurse is mad because you blackmailed her and she can't allow you to escape
		id: 17,
		text:
			"The nurse is furious with you for blackmailing her. She can't allow you to escape. She injects you with a lethal dose of medication. Game over",
		options: [{ text: "Play Again?", nextText: -1 }]
	},
	{
		//You died because the hand was left untreated
		id: 18,
		text: "You died from an infection due to an underlying disease.",
		options: [{ text: "Play Again?", nextText: -1 }]
	},
	{
		// You can't find the exit because you missed all the items
		id: 19,
		text: "You can't find the exit so you return to your room.",
		options: [{ text: "Play Again?", nextText: -1 }]
	},
	{
		// Try to exit the hospital without the keys.
		id: 20,
		text:
			"You try to exit the hospital but you do not have the keys to unlock the door. THe nurse catches you and sedates you. You fall into a deep slumber.",
		options: [{ text: "Play Again?", nextText: -1 }]
	},
	{
		// The nurse allows you to leave without your medication.
		id: 21,
		text:
			" The nurse escorts you out the hospital. However, you have a medical condition that requires medication every few hours. Without your medication, you collapse after a few hours.",
		options: [{ text: "Play Again?", nextText: -1 }]
	}
];

//
startGame();
