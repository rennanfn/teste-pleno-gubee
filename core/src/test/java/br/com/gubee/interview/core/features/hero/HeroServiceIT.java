package br.com.gubee.interview.core.features.hero;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.UUID;

import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import br.com.gubee.interview.model.HeroCompare;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;

@ActiveProfiles("it")
public class HeroServiceIT {

	@Before
	public void setup() {
		RestAssured.baseURI = "http://localhost:8085";
	}

	@Autowired
	private TestRestTemplate restTemplate;

	@Test
	public void testCreateHero() {
		given().contentType(ContentType.JSON).body(
				"{ \"name\": \"Super Teste 5\", \"race\": \"ALIEN\", \"power_stats_id\": \"9012310a-ea2b-4a1f-a459-441f4952064b\" }")
				.when().post("/heroes/newHero").then().statusCode(200).body("name", equalTo("Super Teste 5"))
				.body("race", equalTo("ALIEN"));
	}

	@Test
	public void testUpdateHero() {
		String heroId = "051b3d67-2642-45e7-92bb-d7e0b76b0335";

		given().contentType(ContentType.JSON).body(
				"{ \"name\": \"Super Teste 5\", \"race\": \"ALIEN\", \"power_stats_id\": \"9012310a-ea2b-4a1f-a459-441f4952064b\" }")
				.when().put("/heroes/updateHero/{id}", heroId).then().statusCode(200)
				.body("name", equalTo("Super Teste 5")).body("race", equalTo("ALIEN"));
	}

	@Test
	public void testGetHeroById() {
		String heroId = "051b3d67-2642-45e7-92bb-d7e0b76b0335";

		given().pathParam("id", heroId).when().get("/heroes/findHero/{id}").then().statusCode(200)
				.body("name", equalTo("Super Teste 5")).body("race", equalTo("ALIEN"));
	}

	@Test
	public void testGetHeroesByName() {
		String heroName = "super";

		given().pathParam("name", heroName).when().get("/heroes/findHeroName/{name}").then().statusCode(200)
				.body("size()", equalTo(1)).body("[0].name", equalTo("Super Teste 5"))
				.body("[0].race", equalTo("ALIEN"));
	}

	@Test
	public void testDeleteHero() {
		String heroId = "051b3d67-2642-45e7-92bb-d7e0b76b0335";

		given().pathParam("id", heroId).when().delete("/heroes/deleteHero/{id}").then().statusCode(200);
	}

	@Test
	public void testCompareHeroes() {
		UUID heroId1 = (UUID.fromString("0c02fdf9-dbe2-49b0-b665-5bfd86d4ab91"));
		UUID heroId2 = (UUID.fromString("9012310a-ea2b-4a1f-a459-441f4952064b"));

		HeroCompare request = new HeroCompare();
		request.setHeroId1(heroId1);
		request.setHeroId2(heroId2);

		ResponseEntity<HeroCompare> response = restTemplate.postForEntity("/heroCompare", request, HeroCompare.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());

		HeroCompare result = response.getBody();
		assertNotNull(result);

	}
}
