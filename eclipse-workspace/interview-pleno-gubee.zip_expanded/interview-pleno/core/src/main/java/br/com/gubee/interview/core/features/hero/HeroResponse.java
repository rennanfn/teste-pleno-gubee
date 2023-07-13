package br.com.gubee.interview.core.features.hero;

import br.com.gubee.interview.model.Hero;

public class HeroResponse {	
	
		private Hero hero;
		
		private String error;
		
		private String sucess;	
		

		public Hero getHero() {
			return hero;
		}		

		public void setHero(Hero hero) {
			this.hero = hero;
		}

		public String getError() {
			return error;
		}

		public void setError(String error) {
			this.error = error;
		}		
		
		public String getSucess() {
			return sucess;
		}

		public void setSucess(String sucess) {
			this.sucess = sucess;
		}		
		
	}


