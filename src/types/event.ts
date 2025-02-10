import type { Card } from "@Core/card.js";
import type { Player } from "@Core/player.js";
import type {
	CardAbility,
	SelectTargetAlignment,
	SelectTargetClass,
	SelectTargetFlag,
	Target,
} from "@Game/types.js";

export type UnknownEventValue = EventValue<EventKey>;

/**
 * Game events.
 */
export type EventManagerEvents = {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	[key in EventKey]?: [[[any, number]], [[any, number]]];
};

/**
 * Callback for tick hooks. Used in hookToTick.
 */
export type TickHookCallback = (
	key: EventKey,
	value: UnknownEventValue,
	eventPlayer: Player,
) => Promise<void>;

/**
 * The event listener callback return value.
 */
export type EventListenerMessage = boolean | "destroy" | "reset";
/**
 * The event listener callback function.
 */
export type EventListenerCallback = (
	value: UnknownEventValue,
	eventPlayer: Player,
) => Promise<EventListenerMessage>;

export type HistoryKey = [EventKey, UnknownEventValue, Player | undefined];

/**
 * The quest callback used in card blueprints.
 */
export type QuestCallback = (
	value: UnknownEventValue,
	done: boolean,
) => Promise<boolean>;

/**
 * The backend of a quest.
 */
export type QuestType = {
	name: string;
	progress: [number, number];
	key: EventKey;
	value: number;
	callback: QuestCallback;
	next?: number;
};

/**
 * Event keys
 */
export type EventKey =
	| "FatalDamage"
	| "EndTurn"
	| "StartTurn"
	| "HealthRestored"
	| "UnspentMana"
	| "GainOverload"
	| "GainHeroAttack"
	| "TakeDamage"
	| "PlayCard"
	| "PlayCardUnsafe"
	| "SummonCard"
	| "KillCard"
	| "DamageCard"
	| "SilenceCard"
	| "DiscardCard"
	| "CancelCard"
	| "TradeCard"
	| "ForgeCard"
	| "FreezeCard"
	| "CreateCard"
	| "RevealCard"
	| "Titan"
	| "AddCardToDeck"
	| "AddCardToHand"
	| "DrawCard"
	| "SpellDealsDamage"
	| "Attack"
	| "HeroPower"
	| "TargetSelectionStarts"
	| "TargetSelected"
	| "CardEvent"
	| "Dummy"
	| "Eval"
	| "Input"
	| "GameLoop";

/**
 * Event values
 */
export type EventValue<Key extends EventKey> =
	/**
	 * This is always null.
	 */
	Key extends "FatalDamage"
		? undefined
		: /**
			 * The current turn (before turn counter increment)
			 */
			Key extends "EndTurn"
			? number
			: /**
				 * The current turn (after turn counter increment)
				 */
				Key extends "StartTurn"
				? number
				: /**
					 * The amount of health after restore
					 */
					Key extends "HealthRestored"
					? number
					: /**
						 * The amount of mana the player has left
						 */
						Key extends "UnspentMana"
						? number
						: /**
							 * The amount of overload gained
							 */
							Key extends "GainOverload"
							? number
							: /**
								 * The amount of hero attack gained
								 */
								Key extends "GainHeroAttack"
								? number
								: /**
									 * The player that was dealt the damage, The amount of damage taken
									 */
									Key extends "TakeDamage"
									? number
									: /**
										 * The card that was played. (This gets triggered after the text of the card)
										 */
										Key extends "PlayCard"
										? Card
										: /**
											 * The card that was played. (This gets triggered before the text of the card, which means it also gets triggered before the cancelling logic. So you have to handle cards being cancelled.)
											 */
											Key extends "PlayCardUnsafe"
											? Card
											: /**
												 * The card that was summoned
												 */
												Key extends "SummonCard"
												? Card
												: /**
													 * The card that was killed
													 */
													Key extends "KillCard"
													? Card
													: /**
														 * The card that was damaged, and the amount of damage
														 */
														Key extends "DamageCard"
														? [Card, number]
														: /**
															 * The card that was silenced
															 */
															Key extends "SilenceCard"
															? Card
															: /**
																 * The card that was discarded
																 */
																Key extends "DiscardCard"
																? Card
																: /**
																	 * The card that was cancelled, and the ability that was cancelled
																	 */
																	Key extends "CancelCard"
																	? [Card, CardAbility]
																	: /**
																		 * The card that was traded
																		 */
																		Key extends "TradeCard"
																		? Card
																		: /**
																			 * The card that was forged
																			 */
																			Key extends "ForgeCard"
																			? Card
																			: /**
																				 * The card that was frozen
																				 */
																				Key extends "FreezeCard"
																				? Card
																				: /**
																					 * The card that was created
																					 */
																					Key extends "CreateCard"
																					? Card
																					: /**
																						 * The card that was revealed, the reason for the reveal
																						 */
																						Key extends "RevealCard"
																						? [Card, string]
																						: /**
																							 * The titan card, the ability that was used
																							 */
																							Key extends "Titan"
																							? [Card, Card]
																							: /**
																								 * The card that was added to the deck
																								 */
																								Key extends "AddCardToDeck"
																								? Card
																								: /**
																									 * The card that was added to the hand
																									 */
																									Key extends "AddCardToHand"
																									? Card
																									: /**
																										 * The card that was drawn
																										 */
																										Key extends "DrawCard"
																										? Card
																										: /**
																											 * The target, and the amount of damage
																											 */
																											Key extends "SpellDealsDamage"
																											? [Target, number]
																											: /**
																												 * The attacker, and the target
																												 */
																												Key extends "Attack"
																												? [Target, Target]
																												: /**
																													 * The hero power card
																													 */
																													Key extends "HeroPower"
																													? Card
																													: /**
																														 * The card, some information about the event
																														 */
																														Key extends "CardEvent"
																														? [Card, string]
																														: /**
																															 * The code to evaluate
																															 */
																															Key extends "Eval"
																															? string
																															: /**
																																 * The input
																																 */
																																Key extends "Input"
																																? string
																																: /**
																																	 * The prompt, the card that requested target selection, the alignment that the target should be, the class of the target (hero | card), and the flags (if any).
																																	 */
																																	Key extends "TargetSelectionStarts"
																																	? [
																																			string,
																																			(
																																				| Card
																																				| undefined
																																			),
																																			SelectTargetAlignment,
																																			SelectTargetClass,
																																			SelectTargetFlag[],
																																		]
																																	: /**
																																		 * The card that requested target selection, and the target
																																		 */
																																		Key extends "TargetSelected"
																																		? [
																																				(
																																					| Card
																																					| undefined
																																				),
																																				Target,
																																			]
																																		: never;
