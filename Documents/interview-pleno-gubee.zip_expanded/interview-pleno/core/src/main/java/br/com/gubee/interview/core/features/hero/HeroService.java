package br.com.gubee.interview.core.features.hero;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.stereotype.Service;

import br.com.gubee.interview.core.features.powerstats.PowerStatsRepository;
import br.com.gubee.interview.model.Hero;
import br.com.gubee.interview.model.HeroCompare;
import br.com.gubee.interview.model.PowerStats;

@Service
public class HeroService {
	private HeroRepository repository;

	public HeroService(HeroRepository repository) {
		this.repository = repository;
	}

	private PowerStatsRepository powerStatsRepository;

	public Hero createHero(Hero hero) {
		UUID id = UUID.randomUUID();
		hero.setId(id);
		hero.setCreated_at(new Date());
		hero.setUpdated_at(new Date());

		repository.save(hero);
		return hero;
	}

	public Hero updateHero(UUID id, Hero upHero) {
		Hero exists = repository.findHero(id);
		if (exists == null) {
			throw new DataRetrievalFailureException("Herói não encontrado");
		}

		exists.setName(upHero.getName());
		exists.setRace(upHero.getRace());
		exists.setPower_stats_id(upHero.getPower_stats_id());
		exists.setUpdated_at(new Date());

		repository.update(exists);
		return exists;
	}

	public Hero findHero(UUID id) {
		return repository.findHero(id);
	}

	public List<Hero> findHeroName(String name) {
		return repository.findHeroName(name);
	}

	public void deleteHero(UUID id) {
		Hero exists = repository.findHero(id);
		if (exists == null) {
			throw new DataRetrievalFailureException("Herói não encontrado");
		}
		repository.deleteHero(id);
	}

	public HeroCompare compareHeroes(UUID heroId1, UUID heroId2) {
		List<UUID> heroIds = Arrays.asList(heroId1, heroId2);

		List<Hero> heroes = repository.compareHero(heroIds);

		List<UUID> powerStatsId = Arrays.asList(heroes.get(0).getPower_stats_id(), heroes.get(1).getPower_stats_id());

		List<PowerStats> powerStats = repository.findPowerStats(powerStatsId);

		HeroCompare heroCompare = new HeroCompare();
		heroCompare.setHeroId1(heroes.get(0).getId());
		heroCompare.setHeroPowerStats1(heroes.get(0).getPower_stats_id());
		heroCompare.setHeroId2(heroes.get(1).getId());
		heroCompare.setHeroPowerStats2(heroes.get(1).getPower_stats_id());

		int differenceStrength = powerStats.get(0).getStrength() - powerStats.get(1).getStrength();
		int differenceAgility = powerStats.get(0).getAgility() - powerStats.get(1).getAgility();
		int differenceDexterity = powerStats.get(0).getDexterity() - powerStats.get(1).getDexterity();
		int differenceIntelligence = powerStats.get(0).getIntelligence() - powerStats.get(1).getIntelligence();

		heroCompare.setDifferenceStrength(differenceStrength);
		heroCompare.setDifferenceAgility(differenceAgility);
		heroCompare.setDifferenceDexterity(differenceDexterity);
		heroCompare.setDifferenceIntelligence(differenceIntelligence);

		return heroCompare;
	}

}
