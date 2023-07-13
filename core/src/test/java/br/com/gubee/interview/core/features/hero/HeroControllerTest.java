package br.com.gubee.interview.core.features.hero;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.Arrays;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import br.com.gubee.interview.core.features.powerstats.PowerStatsRepository;
import br.com.gubee.interview.model.Hero;
import br.com.gubee.interview.model.HeroCompare;
import br.com.gubee.interview.model.PowerStats;

@RunWith(MockitoJUnitRunner.class)
public class HeroControllerTest {

	@InjectMocks
	private HeroController heroController;

	@Mock
	private HeroService heroService;

	@Mock
	private HeroRepository heroRepository;

	@Mock
	private PowerStatsRepository powerStatsRepository;

	private MockMvc mockMvc;

	@Before
	public void setup() {
		mockMvc = MockMvcBuilders.standaloneSetup(heroController).build();
	}

	@Test
	public void testNewHero() throws Exception {
		Hero hero = new Hero();
		hero.setName("Super Teste 5");
		hero.setRace("ALIEN");
		hero.setPower_stats_id(UUID.fromString("9012310a-ea2b-4a1f-a459-441f4952064b"));

		Hero newHero = new Hero();
		newHero.setId(UUID.randomUUID());
		newHero.setName(hero.getName());
		newHero.setRace(hero.getRace());
		newHero.setPower_stats_id(hero.getPower_stats_id());
		newHero.setCreated_at(new Date());
		newHero.setUpdated_at(new Date());

		Mockito.when(heroService.createHero(Mockito.any(Hero.class))).thenReturn(newHero);

		ResultActions result = mockMvc.perform(MockMvcRequestBuilders.post("/newHero"))
				.andExpect(MockMvcResultMatchers.status().isOk());
		result.andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.id", is(newHero.getId().toString())))
				.andExpect(jsonPath("$.name", is(newHero.getName())))
				.andExpect(jsonPath("$.race", is(newHero.getRace())))
				.andExpect(jsonPath("$.power_stats_id", is(newHero.getPower_stats_id().toString())))
				.andExpect(jsonPath("$.created_at", is(newHero.getCreated_at())))
				.andExpect(jsonPath("$.updated_at", is(newHero.getUpdated_at())));
	}

	@Test
	public void testUpdateHero() throws Exception {
		UUID heroId = UUID.randomUUID();

		Hero existingHero = new Hero();
		existingHero.setId(heroId);
		existingHero.setName("Super Teste 5");
		existingHero.setRace("ALIEN");
		existingHero.setPower_stats_id(UUID.fromString("9012310a-ea2b-4a1f-a459-441f4952064b"));

		Hero updatedHero = new Hero();
		updatedHero.setId(heroId);
		updatedHero.setName("Super Teste Human");
		updatedHero.setRace("HUMAN");
		updatedHero.setPower_stats_id(updatedHero.getPower_stats_id());
		updatedHero.setUpdated_at(new Date());

		Mockito.when(heroService.updateHero(Mockito.eq(heroId), Mockito.any(Hero.class))).thenReturn(updatedHero);

		ResultActions result = mockMvc.perform(MockMvcRequestBuilders.put("/upHero/{id}", heroId))
				.andExpect(MockMvcResultMatchers.status().isOk());
		result.andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.id", is(updatedHero.getId().toString())))
				.andExpect(jsonPath("$.name", is(updatedHero.getName())))
				.andExpect(jsonPath("$.race", is(updatedHero.getRace())))
				.andExpect(jsonPath("$.power_stats_id", is(updatedHero.getPower_stats_id().toString())))
				.andExpect(jsonPath("$.created_at", is(updatedHero.getCreated_at())))
				.andExpect(jsonPath("$.updated_at", is(updatedHero.getUpdated_at())));
	}

	@Test
	public void testFindHero() throws Exception {
		UUID heroId = (UUID.fromString("051b3d67-2642-45e7-92bb-d7e0b76b0335"));

		Hero existingHero = new Hero();
		existingHero.setId(heroId);

		Mockito.when(heroService.findHero(Mockito.eq(heroId))).thenReturn(existingHero);

		ResultActions result = mockMvc.perform(MockMvcRequestBuilders.get("/findHero/{id}", heroId))
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.id", is(existingHero.getId().toString())))
				.andExpect(jsonPath("$.name", is(existingHero.getName())))
				.andExpect(jsonPath("$.race", is(existingHero.getRace())))
				.andExpect(jsonPath("$.power_stats_id", is(existingHero.getPower_stats_id().toString())))
				.andExpect(jsonPath("$.created_at", is(existingHero.getCreated_at())))
				.andExpect(jsonPath("$.updated_at", is(existingHero.getUpdated_at())));

	}

	@Test
	public void testFindHeroByName() throws Exception {
		String heroName = "Super Teste 5";

		Hero existingHero = new Hero();
		existingHero.setName(heroName);

		List<Hero> heroes = Collections.singletonList(existingHero);
		Mockito.when(heroService.findHeroName(Mockito.eq(heroName))).thenReturn(heroes);

		ResultActions result = mockMvc.perform(MockMvcRequestBuilders.get("/findHeroName/{name}", heroName))
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.length()", is(1)))
				.andExpect(jsonPath("$[0].id", is(existingHero.getId().toString())))
				.andExpect(jsonPath("$[0].name", is(existingHero.getName())))
				.andExpect(jsonPath("$[0].race", is(existingHero.getRace())))
				.andExpect(jsonPath("$[0].power_stats_id", is(existingHero.getPower_stats_id())))
				.andExpect(jsonPath("$[0].created_at", is(existingHero.getCreated_at())))
				.andExpect(jsonPath("$[0].updated_at", is(existingHero.getUpdated_at())));

	}

	@Test
	public void testDeleteHero() throws Exception {
		UUID heroId = (UUID.fromString("051b3d67-2642-45e7-92bb-d7e0b76b0335"));

		Mockito.doNothing().when(heroService).deleteHero(Mockito.eq(heroId));

		ResultActions result = mockMvc.perform(MockMvcRequestBuilders.delete("/deleteHero/{id}", heroId))
				.andExpect(MockMvcResultMatchers.status().isOk());
	}

	@Test
	public void testCompareHeroes() {
		UUID heroId1 = (UUID.fromString("0c02fdf9-dbe2-49b0-b665-5bfd86d4ab91"));
		UUID heroId2 = (UUID.fromString("9012310a-ea2b-4a1f-a459-441f4952064b"));

		Hero hero1 = new Hero();
		hero1.setId(heroId1);

		Hero hero2 = new Hero();
		hero2.setId(heroId2);

		PowerStats powerStats1 = new PowerStats();

		PowerStats powerStats2 = new PowerStats();

		Mockito.when(heroRepository.compareHero(Mockito.anyList())).thenReturn(Arrays.asList(hero1, hero2));
		Mockito.when(powerStatsRepository.findPowerStats(Mockito.anyList()))
				.thenReturn(Arrays.asList(powerStats1, powerStats2));

		HeroCompare result = heroService.compareHeroes(heroId1, heroId2);

		assertEquals(heroId1, result.getHeroId1());
		assertEquals(heroId2, result.getHeroId2());

	}

}
