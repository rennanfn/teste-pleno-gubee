package br.com.gubee.interview.core.features.hero;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import br.com.gubee.interview.model.Hero;
import br.com.gubee.interview.model.PowerStats;

@Repository
public class HeroRepository {

	private final JdbcTemplate jdbc;

	@Autowired
	private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	@Autowired
	public HeroRepository(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	public void save(Hero hero) {
		String sql = "INSERT INTO hero " + "(id, name, race, power_stats_id, created_at, updated_at) "
				+ "VALUES (?, ?, ?, ?, ?, ?)";
		jdbc.update(sql, hero.getId(), hero.getName(), hero.getRace(), hero.getPower_stats_id(), hero.getCreated_at(),
				hero.getUpdated_at());
	}

	public void update(Hero hero) {
		String sql = "UPDATE hero SET " + "name = ?, race = ?, power_stats_id = ?, updated_at = ? " + "WHERE id = ?";
		jdbc.update(sql, hero.getName(), hero.getRace(), hero.getPower_stats_id(), hero.getUpdated_at(), hero.getId());
	}

	public Hero findHero(UUID id) {
		String sql = "SELECT * FROM hero WHERE id = ?";
		RowMapper<Hero> rowMapper = new BeanPropertyRowMapper<>(Hero.class);
		return jdbc.queryForObject(sql, rowMapper, id);
	}

	public List<Hero> findHeroName(String name) {
		String sql = "SELECT * FROM hero WHERE lower(name) LIKE(?)";
		RowMapper<Hero> rowMapper = new BeanPropertyRowMapper<>(Hero.class);
		return jdbc.query(sql, rowMapper, "%" + name + "%");
	}

	public List<Hero> compareHero(List<UUID> heroIds) {
		String sql = "SELECT * FROM hero WHERE id IN (:ids)";
		
		MapSqlParameterSource parameters = new MapSqlParameterSource();
		parameters.addValue("ids", heroIds);

		List<Hero> heroes = namedParameterJdbcTemplate.query(sql, parameters,
				BeanPropertyRowMapper.newInstance(Hero.class));
		
		return heroes;
	}

	public void deleteHero(UUID id) {
		String sql = "DELETE FROM hero WHERE id = ?";
		jdbc.update(sql, id);
	}
	
	public List<PowerStats> findPowerStats(List<UUID> powerStatsId) {
		String sql = "SELECT * FROM power_stats WHERE id IN (:ids)";
		
		MapSqlParameterSource parameters = new MapSqlParameterSource();
		parameters.addValue("ids", powerStatsId);

		List<PowerStats> power_stats = namedParameterJdbcTemplate.query(sql, parameters,
				BeanPropertyRowMapper.newInstance(PowerStats.class));
		
		return power_stats;
	}
}
