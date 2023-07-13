package br.com.gubee.interview.model;

import java.util.Date;
import java.util.UUID;

public class Hero {	
	
	private UUID id;
	
	private String name;
	
	private String race;
	
	private UUID power_stats_id;
	
	private Date created_at;
	
	private Date updated_at;
	
	

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getRace() {
		return race;
	}

	public void setRace(String race) {
		this.race = race;
	}

	public UUID getPower_stats_id() {
		return power_stats_id;
	}

	public void setPower_stats_id(UUID power_stats_id) {
		this.power_stats_id = power_stats_id;
	}

	public Date getCreated_at() {
		return created_at;
	}

	public void setCreated_at(Date created_at) {
		this.created_at = created_at;
	}

	public Date getUpdated_at() {
		return updated_at;
	}

	public void setUpdated_at(Date updated_at) {
		this.updated_at = updated_at;
	}
	
	
	
	
	
}
