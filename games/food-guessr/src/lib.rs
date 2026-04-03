use wasm_bindgen::prelude::*;

const TOTAL_ROUNDS: usize = 10;
const MAX_ATTEMPTS: u32 = 5;
const POINTS: [u32; 5] = [1000, 800, 600, 400, 200];

#[wasm_bindgen]
pub struct GameState {
    current_round: usize,
    attempts: u32,
    total_score: u32,
    round_score: u32,
    round_over: bool,
    game_over: bool,
    current_answer: String,
}

#[wasm_bindgen]
impl GameState {
    pub fn new() -> GameState {
        GameState {
            current_round: 0,
            attempts: 0,
            total_score: 0,
            round_score: 0,
            round_over: false,
            game_over: false,
            current_answer: String::new(),
        }
    }

    pub fn skip_round(&mut self) {
        if self.round_over || self.game_over {
            return;
        }
        self.round_over = true;
        self.round_score = 0;
    }

    pub fn set_current_answer(&mut self, answer: String) {
        self.current_answer = normalize_string(&answer);
    }

    pub fn submit_answer(&mut self, correct: u32) -> u32 {
        if self.round_over || self.game_over {
            return 0;
        }

        self.attempts += 1;

        if correct == 1 {
            let score_idx = ((self.attempts - 1) as usize).min(POINTS.len() - 1);
            self.round_score = POINTS[score_idx];
            self.total_score += self.round_score;
            self.round_over = true;
        }

        self.round_score
    }

    pub fn next_round(&mut self) {
        if !self.round_over {
            return;
        }

        self.current_round += 1;
        self.attempts = 0;
        self.round_score = 0;
        self.round_over = false;
        self.current_answer = String::new();

        if self.current_round >= TOTAL_ROUNDS {
            self.game_over = true;
        }
    }

    pub fn get_total_score(&self) -> u32 {
        self.total_score
    }

    pub fn get_round_score(&self) -> u32 {
        self.round_score
    }

    pub fn get_current_round(&self) -> usize {
        self.current_round
    }

    pub fn get_attempts(&self) -> u32 {
        self.attempts
    }

    pub fn is_round_over(&self) -> bool {
        self.round_over
    }

    pub fn is_game_over(&self) -> bool {
        self.game_over
    }

    pub fn get_total_rounds(&self) -> usize {
        TOTAL_ROUNDS
    }

    pub fn get_max_attempts(&self) -> u32 {
        MAX_ATTEMPTS
    }

    pub fn get_potential_score(&self) -> u32 {
        if self.attempts >= MAX_ATTEMPTS {
            return 0;
        }

        POINTS[self.attempts as usize]
    }

    pub fn get_current_answer(&self) -> String {
        self.current_answer.clone()
    }
}

fn normalize_string(value: &str) -> String {
    value.trim().to_lowercase()
}
