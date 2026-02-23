import type { Card } from "@Game/card.ts";
import type { Player } from "@Game/player.ts";
import type { Ability, Blueprint, Event, EventValue } from "@Game/types.ts";

/**
 * Game.play return value
 */
export enum GamePlayCardReturn {
	Success = "Success",
	Invalid = "Invalid",
	Cost = "Cost",
	Traded = "Traded",
	Forged = "Forged",
	Space = "Space",
	Magnetize = "Magnetize",
	Colossal = "Colossal",
	Refund = "Refund",
	Counter = "Counter",
}

/**
 * Attack return value
 */
export enum GameAttackReturn {
	Success = "Success",
	Invalid = "Invalid",
	DivineShield = "DivineShield",
	Taunt = "Taunt",
	Stealth = "Stealth",
	Frozen = "Frozen",
	PlayerNoAttack = "PlayerNoAttack",
	CardNoAttack = "CardNoAttack",
	PlayerHasAttacked = "PlayerHasAttacked",
	CardHasAttacked = "CardHasAttacked",
	Exhausted = "Exhausted",
	CantAttackHero = "CantAttackHero",
	Immune = "Immune",
	Dormant = "Dormant",
	Titan = "Titan",
}

export enum DeckValidationError {
	Success = "Success",
	Class = "Class",
	Uncollectible = "Uncollectible",
	Runes = "Runes",
}

/**
 * ExportDeck error return value
 */
export type FunctionsExportDeckError =
	| undefined
	| {
			msg: string;
			info: undefined | { card?: CardLike; amount?: number };
			recoverable: boolean;
	  };

export enum AiCalcMoveMessage {
	End = "End",
	Attack = "Attack",
	HeroPower = "HeroPower",
	Use = "Use",
}

/**
 * CalcMove return value
 */
export type AiCalcMoveOption = Card | AiCalcMoveMessage;

/**
 * The alignment of a Card or Player.
 */
export enum Alignment {
	Friendly,
	Enemy,
}

/**
 * The possible types of targets.
 */
export enum TargetType {
	Player,
	Card,
}

export interface TargetFlags {
	alignment?: Alignment;
	targetType?: TargetType;
	allowLocations?: boolean;
	forceElusive?: boolean;
}

export interface GameAttackFlags {
	force?: boolean;
	spellDamage?: boolean;
}

export enum UseLocationError {
	Success = "Success",
	NoLocationsFound = "NoLocationsFound",
	InvalidType = "InvalidType",
	Cooldown = "Cooldown",
	Refund = "Refund",
}

export type CommandList = Record<
	string,
	(
		args: string[],
		flags?: { echo?: boolean; debug?: boolean },
	) => Promise<string | boolean>
>;

/**
 * A card-like object.
 */
// TODO: Is this needed? If not, remove it. #277
export type CardLike = Card | Blueprint;
/**
 * A target.
 */
export type Target = Card | Player;

/**
 * AI history object.
 */
export type AiHistory = {
	type: string;
	data: any;
};

/**
 * Game configuration.
 */
export type GameConfig = {
	general: {
		locale: string;
		editor: string;
		topicBranchWarning: boolean;
		maxBoardSpace: number;
		maxHandLength: number;
		disableEvents: boolean;
		disableFunFacts: boolean;
		registryUrl: string;
	};

	decks: {
		validate: boolean;
		minLength: number;
		maxLength: number;
		maxOfOneCard: number;
		maxOfOneLegendary: number;
	};

	audio: {
		disable: boolean;

		sfx: {
			enable: boolean;
			blacklist: string[];
		};
	};

	networking: {
		allow: {
			game: boolean;
			packs: boolean;
		};
	};

	debug: {
		all: boolean;
		commands: boolean;
		allowTestDeck: boolean;
		hideLicense: boolean;
		additionalInfoInReadable: boolean;
		showCommitHash: boolean;
	};

	ai: {
		player1: boolean;
		player2: boolean;
		random: boolean;

		contextAnalysis: boolean;
		attackModel: number;
		mulliganThreshold: number;
		tradeThreshold: number;
		statsBias: number;
		costBias: number;
		spellValue: number;
		keywordValue: number;
		abilityValue: number;

		protectThreshold: number;
		ignoreThreshold: number;
		riskThreshold: number;

		sentiments: {
			positive: Record<string, number>;
			negative: Record<string, number>;
		};
	};

	advanced: {
		debugCommandPrefix: string;
		spawnInDiyCards: boolean;
		diyCardSpawnChance: number;
		gameloopUseOldUserInterface: boolean;
		dcShowUncollectible: boolean;
		getReadableCardMaxDepth: number;
		getReadableCardNoRecursion: boolean;
		getReadableCardAlwaysShowFullCard: boolean;

		forgetfulRandomTargetFailAmount: number;

		uncancellableAbilities: Ability[];
		noBounceOnCancelAbilities: Ability[];
		whitelistedHistoryKeys: Event[];
		hideValueHistoryKeys: Event[];
		readableHistory: {
			[E in Event]: (
				plr: Player,
				value: EventValue<E>,
				handle: (value: unknown, hide?: boolean) => Promise<string>,
			) => Promise<string>;
		};
	};

	info: {
		versionText: string;

		stableIntroText: string;
		betaIntroText: string;
		alphaIntroText: string;
		topicIntroText: string;

		githubUrl: string;
	};

	funFacts: string[];
};
