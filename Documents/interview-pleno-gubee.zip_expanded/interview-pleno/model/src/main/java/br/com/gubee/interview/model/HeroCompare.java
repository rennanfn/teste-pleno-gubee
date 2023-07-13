package br.com.gubee.interview.model;

import java.util.UUID;

public class HeroCompare {
	private UUID heroId1;

	private UUID heroPowerStats1;

	private UUID heroId2;

	private UUID heroPowerStats2;

	private int differenceStrength;

	private int differenceAgility;

	private int differenceDexterity;

	private int differenceIntelligence;

	public UUID getHeroId1() {
		return heroId1;
	}

	public void setHeroId1(UUID heroId1) {
		this.heroId1 = heroId1;
	}

	public UUID getHeroId2() {
		return heroId2;
	}

	public void setHeroId2(UUID heroId2) {
		this.heroId2 = heroId2;
	}

	public UUID getHeroPowerStats1() {
		return heroPowerStats1;
	}

	public void setHeroPowerStats1(UUID heroPowerStats1) {
		this.heroPowerStats1 = heroPowerStats1;
	}

	public UUID getHeroPowerStats2() {
		return heroPowerStats2;
	}

	public void setHeroPowerStats2(UUID heroPowerStats2) {
		this.heroPowerStats2 = heroPowerStats2;
	}

	public int getDifferenceStrength() {
		return differenceStrength;
	}

	public void setDifferenceStrength(int differenceStrength) {
		this.differenceStrength = differenceStrength;
	}

	public int getDifferenceAgility() {
		return differenceAgility;
	}

	public void setDifferenceAgility(int differenceAgility) {
		this.differenceAgility = differenceAgility;
	}

	public int getDifferenceDexterity() {
		return differenceDexterity;
	}

	public void setDifferenceDexterity(int differenceDexterity) {
		this.differenceDexterity = differenceDexterity;
	}

	public int getDifferenceIntelligence() {
		return differenceIntelligence;
	}

	public void setDifferenceIntelligence(int differenceIntelligence) {
		this.differenceIntelligence = differenceIntelligence;
	}

}
