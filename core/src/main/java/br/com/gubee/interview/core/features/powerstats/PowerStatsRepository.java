package br.com.gubee.interview.core.features.powerstats;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import br.com.gubee.interview.model.Hero;
import br.com.gubee.interview.model.PowerStats;

public class PowerStatsRepository {

	private final JdbcTemplate jdbc;
	
	@Autowired
	private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	@Autowired
	public PowerStatsRepository(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

//	public PowerStats findPowerStats(UUID powerStatsId) {
//		String sql = "SELECT * FROM power_stats WHERE id = ?";
//		RowMapper<PowerStats> rowMapper = new BeanPropertyRowMapper<>(PowerStats.class);
//		return jdbc.queryForObject(sql, rowMapper, powerStatsId);
//	}
		
	public List<PowerStats> findPowerStats(List<UUID> powerStatsId) {
		String sql = "SELECT * FROM power_stats WHERE id IN (:ids)";
		
		MapSqlParameterSource parameters = new MapSqlParameterSource();
		parameters.addValue("ids", powerStatsId);

		List<PowerStats> power_stats = namedParameterJdbcTemplate.query(sql, parameters,
				BeanPropertyRowMapper.newInstance(PowerStats.class));
		
		return power_stats;
	}
}
