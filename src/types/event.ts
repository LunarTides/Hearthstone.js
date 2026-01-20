import type { Card } from "@Game/card.ts";
import type { Player } from "@Game/player.ts";
import type {
	Ability,
	GameAttackFlags,
	Location,
	Target,
	TargetFlags,
} from "@Game/types.ts";

/**
 * Game events.
 */
export type EventManagerEvents = {
	[key in Event]?: [
		[[EventValue<key> | null, number]],
		[[EventValue<key> | null, number]],
	];
};

/**
 * Callback for tick hooks. Used in hookToTick.
 */
export type TickHookCallback<E extends Event> = (
	key: E,
	value: EventValue<E>,
	eventPlayer: Player,
) => Promise<void>;

/**
 * The event listener callback return value.
 */
export enum EventListenerMessage {
	Skip = "Skip",
	Success = "Success",
	Reset = "Reset",
	Destroy = "Destroy",
}
/**
 * The event listener callback function.
 */
export type EventListenerCallback<E extends Event> = (
	value: EventValue<E>,
	eventPlayer: Player,
) => Promise<EventListenerMessage>;

export type HistoryKey<E extends Event> = [
	E,
	EventValue<E>,
	Player | undefined,
];

export enum QuestType {
	Quest = "Quest",
	Sidequest = "Sidequest",
	Secret = "Secret",
}

/**
 * The quest callback used in card blueprints.
 */
export type QuestCallback<E extends Event> = (
	value: EventValue<E>,
	done: boolean,
) => Promise<EventListenerMessage>;

/**
 * The backend of a quest.
 */
export type QuestObject<E extends Event> = {
	type: QuestType;
	card: Card;
	progress: [number, number];
	key: E;
	value: number;
	callback: QuestCallback<E>;
	next?: string;
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
	DestroyCard = "DestroyCard",
	DamageCard = "DamageCard",
	SilenceCard = "SilenceCard",
	DiscardCard = "DiscardCard",
	CancelCard = "CancelCard",
	TradeCard = "TradeCard",
	ForgeCard = "ForgeCard",
	FreezeCard = "FreezeCard",
	CreateCard = "CreateCard",
	RevealCard = "RevealCard",
	BurnCard = "BurnCard",
	Titan = "Titan",
	AddCardToDeck = "AddCardToDeck",
	AddCardToHand = "AddCardToHand",
	DrawCard = "DrawCard",
	ChangeLocation = "ChangeLocation",
	ChangeHero = "ChangeHero",
	SpellDealsDamage = "SpellDealsDamage",
	Attack = "Attack",
	HeroPower = "HeroPower",
	TargetSelectionStarts = "TargetSelectionStarts",
	TargetSelected = "TargetSelected",
	CardEvent = "CardEvent",
	Dummy = "Dummy",
	Eval = "Eval",
	Input = "Input",
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
					// TODO: Change the value to be the amount of health restored, not the resulting health.
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
													 * The card that was destroyed
													 */
													Key extends Event.DestroyCard
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
																						: Key extends Event.BurnCard
																							? Card
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
																												 * The card, the new location
																												 */
																												Key extends Event.ChangeLocation
																												? [Card, Location]
																												: /**
																													 * The old hero, the new hero
																													 */
																													Key extends Event.ChangeHero
																													? [Card, Card]
																													: /**
																														 * The target, and the amount of damage
																														 */
																														Key extends Event.SpellDealsDamage
																														? [Target, number]
																														: /**
																															 * The attacker, and the target
																															 */
																															Key extends Event.Attack
																															? [
																																	Target,
																																	Target,
																																	GameAttackFlags,
																																]
																															: /**
																																 * The hero power card
																																 */
																																Key extends Event.HeroPower
																																? Card
																																: /**
																																	 * The card, some information about the event
																																	 */
																																	Key extends Event.CardEvent
																																	? [
																																			Card,
																																			string,
																																		]
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
																																				 * The prompt, the card that requested target selection, and the flags.
																																				 */
																																				Key extends Event.TargetSelectionStarts
																																				? [
																																						string,
																																						(
																																							| Card
																																							| undefined
																																						),
																																						TargetFlags,
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
																																					: Key extends Event.Dummy
																																						? undefined
																																						: never;
