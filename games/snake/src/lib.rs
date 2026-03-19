use wasm_bindgen::prelude::*;

// ===== CONSTANTES =====
const GRID_WIDTH: u32 = 20;
const GRID_HEIGHT: u32 = 20;

// ===== DIRECTION =====
#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq)]
pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

// ===== POSITION =====
#[derive(Clone, Copy, PartialEq)]
pub struct Position {
    x: u32,
    y: u32,
}

// ===== ÉTAT DU JEU =====
#[wasm_bindgen]
pub struct GameState {
    // Le serpent = une liste de positions (la tête est en premier)
    snake: Vec<Position>,
    // La direction actuelle du serpent
    direction: Direction,
    // La prochaine direction (changée par le joueur)
    next_direction: Direction,
    // La position de la pomme
    apple: Position,
    // Le score
    score: u32,
    // Est-ce que le jeu est terminé ?
    game_over: bool,
    // Compteur pseudo-aléatoire pour placer la pomme
    rng_seed: u32,
}

// Les méthodes du GameState exposées à JavaScript
#[wasm_bindgen]
impl GameState {

    // Constructeur — crée un nouveau jeu
    // "new" est appelé depuis JavaScript pour initialiser le jeu
    pub fn new() -> GameState {
        // Le serpent démarre au centre de la grille avec 3 cases
        let head = Position { x: 10, y: 10 };
        let snake = vec![
            head,
            Position { x: 9, y: 10 },
            Position { x: 8, y: 10 },
        ];

        let mut state = GameState {
            snake,
            direction: Direction::Right,
            next_direction: Direction::Right,
            apple: Position { x: 5, y: 5 },
            score: 0,
            game_over: false,
            rng_seed: 12345,
        };

        // Place la première pomme aléatoirement
        state.spawn_apple();
        state
    }

    // Change la direction — appelée quand le joueur appuie sur une touche
    pub fn change_direction(&mut self, dir: Direction) {
        // On empêche le demi-tour (ne peut pas aller à gauche si on va à droite)
        let invalid = match self.direction {
            Direction::Up => dir == Direction::Down,
            Direction::Down => dir == Direction::Up,
            Direction::Left => dir == Direction::Right,
            Direction::Right => dir == Direction::Left,
        };

        if !invalid {
            self.next_direction = dir;
        }
    }

    // Avance d'un pas — appelée à chaque tick du jeu
    pub fn tick(&mut self) {
        // Si le jeu est terminé, on ne fait rien
        if self.game_over {
            return;
        }

        // On applique la prochaine direction
        self.direction = self.next_direction;

        // Calcule la nouvelle position de la tête
        let head = self.snake[0];
        let new_head = match self.direction {
            Direction::Up => Position {
                x: head.x,
                // wrapping_sub évite le "underflow" si y = 0
                y: head.y.wrapping_sub(1),
            },
            Direction::Down => Position {
                x: head.x,
                y: head.y + 1,
            },
            Direction::Left => Position {
                x: head.x.wrapping_sub(1),
                y: head.y,
            },
            Direction::Right => Position {
                x: head.x + 1,
                y: head.y,
            },
        };

        // Vérifie collision avec les murs
        if new_head.x >= GRID_WIDTH || new_head.y >= GRID_HEIGHT {
            self.game_over = true;
            return;
        }

        // Vérifie collision avec le corps du serpent
        if self.snake.contains(&new_head) {
            self.game_over = true;
            return;
        }

        // Ajoute la nouvelle tête au début du serpent
        self.snake.insert(0, new_head);

        // Si la tête touche la pomme
        if new_head == self.apple {
            // On ne retire pas la queue = le serpent grandit
            self.score += 1;
            self.spawn_apple();
        } else {
            // Retire la queue — le serpent avance sans grandir
            self.snake.pop();
        }
    }

    // Retourne la grille sous forme de tableau plat pour JavaScript
    // 0 = vide, 1 = serpent, 2 = pomme
    pub fn get_cells(&self) -> Vec<u8> {
        // Crée un tableau de GRID_WIDTH * GRID_HEIGHT cases, toutes à 0
        let mut cells = vec![0u8; (GRID_WIDTH * GRID_HEIGHT) as usize];

        // Place la pomme
        cells[(self.apple.y * GRID_WIDTH + self.apple.x) as usize] = 2;

        // Place le serpent
        for pos in &self.snake {
            cells[(pos.y * GRID_WIDTH + pos.x) as usize] = 1;
        }

        cells
    }

    // Getters — permettent à JavaScript de lire les propriétés
    pub fn get_score(&self) -> u32 {
        self.score
    }

    pub fn is_game_over(&self) -> bool {
        self.game_over
    }

    pub fn get_width(&self) -> u32 {
        GRID_WIDTH
    }

    pub fn get_height(&self) -> u32 {
        GRID_HEIGHT
    }

    // Génère un nombre pseudo-aléatoire (sans librairie externe)
    // C'est l'algorithme "xorshift" — simple et efficace
    fn next_rand(&mut self) -> u32 {
        self.rng_seed ^= self.rng_seed << 13;
        self.rng_seed ^= self.rng_seed >> 17;
        self.rng_seed ^= self.rng_seed << 5;
        self.rng_seed
    }

    // Place la pomme à une position aléatoire libre
    fn spawn_apple(&mut self) {
        loop {
            let x = self.next_rand() % GRID_WIDTH;
            let y = self.next_rand() % GRID_HEIGHT;
            let pos = Position { x, y };

            // On s'assure que la pomme ne spawn pas sur le serpent
            if !self.snake.contains(&pos) {
                self.apple = pos;
                break;
            }
        }
    }
}
