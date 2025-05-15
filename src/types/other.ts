import type { Card } from "@Game/card.ts";
import type { Player } from "@Game/player.ts";
import type { Blueprint, Event } from "@Game/types.ts";

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
	Sleepy = "Sleepy",
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

export interface TargetFlags {
	alignment?: "friendly" | "enemy";
	class?: "player" | "card";
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
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	data: any;
};

/**
 * Game configuration.
 */
export type GameConfig = {
	general: {
		locale: string;
		debug: boolean;
		editor: string;
		topicBranchWarning: boolean;
		maxBoardSpace: number;
		maxHandLength: number;
		disableEvents: boolean;
		disableFunFacts: boolean;
	};

	decks: {
		validate: boolean;
		minLength: number;
		maxLength: number;
		maxOfOneCard: number;
		maxOfOneLegendary: number;
	};

	ai: {
		player1: boolean;
		player2: boolean;

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
		dcShowUncollectible: boolean;
		getReadableCardMaxDepth: number;
		getReadableCardNoRecursion: boolean;
		getReadableCardAlwaysShowFullCard: boolean;

		forgetfulRandomTargetFailAmount: number;

		whitelistedHistoryKeys: Event[];
		hideValueHistoryKeys: Event[];
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
