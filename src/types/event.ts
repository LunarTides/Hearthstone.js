import type { Card } from "@Core/card.js";
import type { Player } from "@Core/player.js";
import type {
	Ability,
	Target,
	TargetAlignment,
	TargetClass,
	TargetFlag,
} from "@Game/types.js";

export type UnknownEventValue = EventValue<Event>;

/**
 * Game events.
 */
export type EventManagerEvents = {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	[key in Event]?: [[[any, number]], [[any, number]]];
};

/**
 * Callback for tick hooks. Used in hookToTick.
 */
export type TickHookCallback = (
	key: Event,
	value: UnknownEventValue,
	eventPlayer: Player,
) => Promise<void>;

/**
 * The event listener callback return value.
 */
export enum EventListenerMessage {
	Ignore = "Ignore",
	Success = "Success",
	Reset = "Reset",
	Destroy = "Destroy",
}
/**
 * The event listener callback function.
 */
export type EventListenerCallback = (
	value: UnknownEventValue,
	eventPlayer: Player,
) => Promise<EventListenerMessage>;

export type HistoryKey = [Event, UnknownEventValue, Player | undefined];

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
	key: Event;
	value: number;
	callback: QuestCallback;
	next?: number;
};

/**
 * Event keys
 */
export enum Event {
	FatalDamage = "FatalDamage",
	EndTurn = "EndTurn",
	StartTurn = "StartTurn",
	HealthRestored = "HealthRestored",
	UnspentMana = "UnspentMana",
	GainOverload = "GainOverload",
	GainHeroAttack = "GainHeroAttack",
	TakeDamage = "TakeDamage",
	PlayCard = "PlayCard",
	PlayCardUnsafe = "PlayCardUnsafe",
	SummonCard = "SummonCard",
	KillCard = "KillCard",
	DamageCard = "DamageCard",
	SilenceCard = "SilenceCard",
	DiscardCard = "DiscardCard",
	CancelCard = "CancelCard",
	TradeCard = "TradeCard",
	ForgeCard = "ForgeCard",
	FreezeCard = "FreezeCard",
	CreateCard = "CreateCard",
	RevealCard = "RevealCard",
	Titan = "Titan",
	AddCardToDeck = "AddCardToDeck",
	AddCardToHand = "AddCardToHand",
	DrawCard = "DrawCard",
	SpellDealsDamage = "SpellDealsDamage",
	Attack = "Attack",
	HeroPower = "HeroPower",
	TargetSelectionStarts = "TargetSelectionStarts",
	TargetSelected = "TargetSelected",
	CardEvent = "CardEvent",
	Dummy = "Dummy",
	Eval = "Eval",
	Input = "Input",
	GameLoop = "GameLoop",
}

/**
 * Event values
 */
export type EventValue<Key extends Event> =
	/**
	 * This is always null.
	 */
	Key extends Event.FatalDamage
		? undefined
		: /**
			 * The current turn (before turn counter increment)
			 */
			Key extends Event.EndTurn
			? number
			: /**
				 * The current turn (after turn counter increment)
				 */
				Key extends Event.StartTurn
				? number
				: /**
					 * The amount of health after restore
					 */
					Key extends Event.HealthRestored
					? number
					: /**
						 * The amount of mana the player has left
						 */
						Key extends Event.UnspentMana
						? number
						: /**
							 * The amount of overload gained
							 */
							Key extends Event.GainOverload
							? number
							: /**
								 * The amount of hero attack gained
								 */
								Key extends Event.GainHeroAttack
								? number
								: /**
									 * The player that was dealt the damage, The amount of damage taken
									 */
									Key extends Event.TakeDamage
									? number
									: /**
										 * The card that was played. (This gets triggered after the text of the card)
										 */
										Key extends Event.PlayCard
										? Card
										: /**
											 * The card that was played. (This gets triggered before the text of the card, which means it also gets triggered before the cancelling logic. So you have to handle cards being cancelled.)
											 */
											Key extends Event.PlayCardUnsafe
											? Card
											: /**
												 * The card that was summoned
												 */
												Key extends Event.SummonCard
												? Card
												: /**
													 * The card that was killed
													 */
													Key extends Event.KillCard
													? Card
													: /**
														 * The card that was damaged, and the amount of damage
														 */
														Key extends Event.DamageCard
														? [Card, number]
														: /**
															 * The card that was silenced
															 */
															Key extends Event.SilenceCard
															? Card
															: /**
																 * The card that was discarded
																 */
																Key extends Event.DiscardCard
																? Card
																: /**
																	 * The card that was cancelled, and the ability that was cancelled
																	 */
																	Key extends Event.CancelCard
																	? [Card, Ability]
																	: /**
																		 * The card that was traded
																		 */
																		Key extends Event.TradeCard
																		? Card
																		: /**
																			 * The card that was forged
																			 */
																			Key extends Event.ForgeCard
																			? Card
																			: /**
																				 * The card that was frozen
																				 */
																				Key extends Event.FreezeCard
																				? Card
																				: /**
																					 * The card that was created
																					 */
																					Key extends Event.CreateCard
																					? Card
																					: /**
																						 * The card that was revealed, the reason for the reveal
																						 */
																						Key extends Event.RevealCard
																						? [Card, string]
																						: /**
																							 * The titan card, the ability that was used
																							 */
																							Key extends Event.Titan
																							? [Card, Card]
																							: /**
																								 * The card that was added to the deck
																								 */
																								Key extends Event.AddCardToDeck
																								? Card
																								: /**
																									 * The card that was added to the hand
																									 */
																									Key extends Event.AddCardToHand
																									? Card
																									: /**
																										 * The card that was drawn
																										 */
																										Key extends Event.DrawCard
																										? Card
																										: /**
																											 * The target, and the amount of damage
																											 */
																											Key extends Event.SpellDealsDamage
																											? [Target, number]
																											: /**
																												 * The attacker, and the target
																												 */
																												Key extends Event.Attack
																												? [Target, Target]
																												: /**
																													 * The hero power card
																													 */
																													Key extends Event.HeroPower
																													? Card
																													: /**
																														 * The card, some information about the event
																														 */
																														Key extends Event.CardEvent
																														? [Card, string]
																														: /**
																															 * The code to evaluate
																															 */
																															Key extends Event.Eval
																															? string
																															: /**
																																 * The input
																																 */
																																Key extends Event.Input
																																? string
																																: /**
																																	 * The prompt, the card that requested target selection, the alignment that the target should be, the class of the target (hero | card), and the flags (if any).
																																	 */
																																	Key extends Event.TargetSelectionStarts
																																	? [
																																			string,
																																			(
																																				| Card
																																				| undefined
																																			),
																																			TargetAlignment,
																																			TargetClass,
																																			TargetFlag[],
																																		]
																																	: /**
																																		 * The card that requested target selection, and the target
																																		 */
																																		Key extends Event.TargetSelected
																																		? [
																																				(
																																					| Card
																																					| undefined
																																				),
																																				Target,
																																			]
																																		: never;
