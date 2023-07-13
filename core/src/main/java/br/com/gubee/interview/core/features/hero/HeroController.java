package br.com.gubee.interview.core.features.hero;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import br.com.gubee.interview.model.Hero;
import br.com.gubee.interview.model.HeroCompare;

@RestController
@RequestMapping("/heroes")
public class HeroController {

	private HeroService heroService;

	@Autowired
	public HeroController(HeroService heroService) {
		this.heroService = heroService;
	}

	@PostMapping(value = "newHero")
	@ResponseBody
	public ResponseEntity<HeroResponse> createHero(@RequestBody Hero hero) {
		HeroResponse response = new HeroResponse();
		try {
			Hero newHero = heroService.createHero(hero);
			response.setSucess("Herói " + hero.getName() + " inserido com sucesso");
			return ResponseEntity.status(HttpStatus.OK).body(response);
		} catch (Exception e) {
			String error = "Erro ao criar herói";
			System.out.println(e.getMessage());
			response.setError(error);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		}
	}

	@PutMapping(value = "upHero/{id}")
	@ResponseBody
	public ResponseEntity<HeroResponse> updateHero(@PathVariable UUID id, @RequestBody Hero updateHero) {
		HeroResponse response = new HeroResponse();
		try {
			Hero upHero = heroService.updateHero(id, updateHero);
			response.setSucess("Herói " + updateHero.getName() + " atualizado com sucesso");
			return ResponseEntity.status(HttpStatus.OK).body(response);

		} catch (DataRetrievalFailureException e) {
			String error = "Herói não encontrado";
			response.setError(error);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

		} catch (Exception e) {
			String error = "Erro ao atualizar herói";
			System.out.println(e.getMessage());
			response.setError(error);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		}
	}

	@GetMapping("/findHero/{id}")
	public ResponseEntity<HeroResponse> findHero(@PathVariable UUID id) {
		HeroResponse response = new HeroResponse();
		try {
			Hero findHero = heroService.findHero(id);
			response.setHero(findHero);
			return ResponseEntity.status(HttpStatus.OK).body(response);

		} catch (EmptyResultDataAccessException e) {
			String error = "Herói não encontrado";
			response.setError(error);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

		} catch (Exception e) {
			String error = "Erro ao buscar herói";
			response.setError(error);
			System.out.println(e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		}
	}

	@GetMapping("/findHeroName/{name}")
	public ResponseEntity<List<Hero>> findHero(@PathVariable("name") String name) {
		try {
			List<Hero> findHero = heroService.findHeroName(name);

			if (findHero.isEmpty()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
			}
			return ResponseEntity.status(HttpStatus.OK).body(findHero);

		} catch (Exception e) {
			System.out.println(e);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}

	@DeleteMapping("/deleteHero/{id}")
	public ResponseEntity<String> deleteHero(@PathVariable UUID id) {
		try {
			heroService.deleteHero(id);
			return ResponseEntity.status(HttpStatus.OK).body("Herói deletado com sucesso!");
		} catch (DataRetrievalFailureException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Erro ao deletar herói!");
		}
	}

	@GetMapping("/heroCompare")
	public ResponseEntity<HeroCompare> compareHeroes(@RequestParam UUID heroId1, @RequestParam UUID heroId2) {
		try {
			HeroCompare comparisonResult = heroService.compareHeroes(heroId1, heroId2);
			return ResponseEntity.status(HttpStatus.OK).body(comparisonResult);
		} catch (Exception e) {
			System.out.println(e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
}
