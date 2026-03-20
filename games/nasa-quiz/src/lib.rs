use wasm_bindgen::prelude::*;

#[derive(Clone)]
pub struct Question {
    pub question: String,
    pub answers: Vec<String>,
    pub correct_index: usize,
}

#[wasm_bindgen]
pub struct GameState {
    questions: Vec<Question>,
    current_question: usize,
    score: u32,
    time_left: u32,
    answered: bool,
    last_correct: bool,
    game_over: bool,
}

#[wasm_bindgen]
impl GameState {

    pub fn new() -> GameState {
        GameState {
            questions: Vec::new(),
            current_question: 0,
            score: 0,
            time_left: 15,
            answered: false,
            last_correct: false,
            game_over: false,
        }
    }

    pub fn add_question(&mut self, data: &str) {
        let parts: Vec<&str> = data.split('|').collect();
        if parts.len() != 6 {
            return;
        }

        let question = parts[0].to_string();
        let answers = vec![
            parts[1].to_string(),
            parts[2].to_string(),
            parts[3].to_string(),
            parts[4].to_string(),
        ];
        let correct_index = parts[5].parse::<usize>().unwrap_or(0);

        self.questions.push(Question {
            question,
            answers,
            correct_index,
        });
    }

    pub fn tick_timer(&mut self) {
        if self.answered || self.game_over {
            return;
        }

        if self.time_left > 0 {
            self.time_left -= 1;
        } else {
            self.answered = true;
            self.last_correct = false;
        }
    }

    pub fn answer(&mut self, index: usize) -> bool {
        if self.answered || self.game_over {
            return false;
        }

        self.answered = true;
        let correct = self.questions[self.current_question].correct_index == index;

        if correct {
            self.score += 10 + self.time_left;
            self.last_correct = true;
        } else {
            self.last_correct = false;
        }

        correct
    }

    pub fn next_question(&mut self) {
        if self.current_question + 1 >= self.questions.len() {
            self.game_over = true;
            return;
        }

        self.current_question += 1;
        self.time_left = 15;
        self.answered = false;
    }

    pub fn get_score(&self) -> u32 { self.score }
    pub fn get_time_left(&self) -> u32 { self.time_left }
    pub fn is_answered(&self) -> bool { self.answered }
    pub fn is_last_correct(&self) -> bool { self.last_correct }
    pub fn is_game_over(&self) -> bool { self.game_over }
    pub fn get_current_index(&self) -> usize { self.current_question }
    pub fn get_total_questions(&self) -> usize { self.questions.len() }

    pub fn get_question(&self) -> String {
        if self.current_question >= self.questions.len() {
            return String::new();
        }
        self.questions[self.current_question].question.clone()
    }

    pub fn get_answers(&self) -> String {
        if self.current_question >= self.questions.len() {
            return String::new();
        }
        self.questions[self.current_question].answers.join("|")
    }

    pub fn get_correct_index(&self) -> usize {
        if self.current_question >= self.questions.len() {
            return 0;
        }
        self.questions[self.current_question].correct_index
    }
}
