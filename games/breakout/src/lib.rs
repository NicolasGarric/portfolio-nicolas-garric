use wasm_bindgen::prelude::*;

// ===== CONSTANTES =====
const CANVAS_WIDTH: f32 = 480.0;
const CANVAS_HEIGHT: f32 = 600.0;

const PADDLE_WIDTH: f32 = 80.0;
const PADDLE_HEIGHT: f32 = 12.0;
const PADDLE_SPEED: f32 = 6.0;
const PADDLE_Y: f32 = CANVAS_HEIGHT - 40.0;

const BALL_SIZE: f32 = 10.0;
const BALL_SPEED: f32 = 4.0;

const BRICK_COLS: usize = 8;
const BRICK_ROWS: usize = 5;
const BRICK_WIDTH: f32 = 52.0;
const BRICK_HEIGHT: f32 = 20.0;
const BRICK_PADDING: f32 = 8.0;
const BRICK_OFFSET_X: f32 = 12.0;
const BRICK_OFFSET_Y: f32 = 60.0;

// ===== DIRECTION RAQUETTE =====
#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq)]
pub enum PaddleDirection {
    Left,
    Right,
    None,
}

// ===== BRIQUE =====
#[derive(Clone, Copy)]
pub struct Brick {
    // La brique est-elle encore vivante ?
    active: bool,
    // Points rapportés par cette brique
    points: u32,
}

// ===== ÉTAT DU JEU =====
#[wasm_bindgen]
pub struct GameState {
    // Position de la balle
    ball_x: f32,
    ball_y: f32,
    // Vitesse de la balle (vx et vy peuvent être négatifs)
    ball_vx: f32,
    ball_vy: f32,

    // Position de la raquette (coin gauche)
    paddle_x: f32,
    // Direction courante de la raquette
    paddle_dir: PaddleDirection,

    // Tableau de briques à plat (BRICK_ROWS * BRICK_COLS)
    bricks: Vec<Brick>,

    // Score et vies
    score: u32,
    lives: u32,

    // États
    game_over: bool,
    won: bool,
    // La balle est-elle collée à la raquette au démarrage ?
    ball_stuck: bool,
}

#[wasm_bindgen]
impl GameState {

    pub fn new() -> GameState {
        // Crée toutes les briques
        let mut bricks = Vec::new();
        for row in 0..BRICK_ROWS {
            for _ in 0..BRICK_COLS {
                // Les briques du haut valent plus de points
                let points = ((BRICK_ROWS - row) as u32) * 10;
                bricks.push(Brick { active: true, points });
            }
        }

        GameState {
            ball_x: CANVAS_WIDTH / 2.0,
            ball_y: PADDLE_Y - BALL_SIZE - 1.0,
            // Départ en diagonale vers le haut à droite
            ball_vx: BALL_SPEED,
            ball_vy: -BALL_SPEED,

            paddle_x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2.0,
            paddle_dir: PaddleDirection::None,

            bricks,
            score: 0,
            lives: 3,
            game_over: false,
            won: false,
            ball_stuck: true,
        }
    }

    // Appelée quand le joueur appuie/relâche une touche
    pub fn set_paddle_direction(&mut self, dir: PaddleDirection) {
        self.paddle_dir = dir;
    }

    // Lance la balle (espace ou clic)
    pub fn launch_ball(&mut self) {
        self.ball_stuck = false;
    }

    pub fn tick(&mut self) {
        if self.game_over || self.won {
            return;
        }

        // ===== DÉPLACE LA RAQUETTE =====
        match self.paddle_dir {
            PaddleDirection::Left => {
                self.paddle_x = (self.paddle_x - PADDLE_SPEED).max(0.0);
            }
            PaddleDirection::Right => {
                self.paddle_x = (self.paddle_x + PADDLE_SPEED)
                    .min(CANVAS_WIDTH - PADDLE_WIDTH);
            }
            PaddleDirection::None => {}
        }

        // Si la balle est collée à la raquette, elle suit son mouvement
        if self.ball_stuck {
            self.ball_x = self.paddle_x + PADDLE_WIDTH / 2.0;
            return;
        }

        // ===== DÉPLACE LA BALLE =====
        self.ball_x += self.ball_vx;
        self.ball_y += self.ball_vy;

        // ===== REBOND SUR LES MURS =====
        // Mur gauche
        if self.ball_x - BALL_SIZE / 2.0 <= 0.0 {
            self.ball_x = BALL_SIZE / 2.0;
            self.ball_vx = self.ball_vx.abs();
        }
        // Mur droit
        if self.ball_x + BALL_SIZE / 2.0 >= CANVAS_WIDTH {
            self.ball_x = CANVAS_WIDTH - BALL_SIZE / 2.0;
            self.ball_vx = -self.ball_vx.abs();
        }
        // Mur du haut
        if self.ball_y - BALL_SIZE / 2.0 <= 0.0 {
            self.ball_y = BALL_SIZE / 2.0;
            self.ball_vy = self.ball_vy.abs();
        }

        // ===== BALLE PERDUE (bas de l'écran) =====
        if self.ball_y > CANVAS_HEIGHT {
            self.lives -= 1;
            if self.lives == 0 {
                self.game_over = true;
            } else {
                // Reset balle sur la raquette
                self.ball_stuck = true;
                self.ball_x = self.paddle_x + PADDLE_WIDTH / 2.0;
                self.ball_y = PADDLE_Y - BALL_SIZE - 1.0;
                self.ball_vx = BALL_SPEED;
                self.ball_vy = -BALL_SPEED;
            }
            return;
        }

        // ===== COLLISION BALLE / RAQUETTE =====
        let paddle_top = PADDLE_Y;
        let paddle_left = self.paddle_x;
        let paddle_right = self.paddle_x + PADDLE_WIDTH;

        if self.ball_y + BALL_SIZE / 2.0 >= paddle_top
            && self.ball_y - BALL_SIZE / 2.0 <= paddle_top + PADDLE_HEIGHT
            && self.ball_x >= paddle_left
            && self.ball_x <= paddle_right
            && self.ball_vy > 0.0
        {
            // Calcule l'angle selon où la balle frappe la raquette
            // Centre = rebond droit, bords = rebond oblique
            let hit_pos = (self.ball_x - paddle_left) / PADDLE_WIDTH;
            let angle = (hit_pos - 0.5) * 2.0; // entre -1.0 et 1.0
            self.ball_vx = angle * BALL_SPEED * 1.5;
            self.ball_vy = -BALL_SPEED;
        }

        // ===== COLLISION BALLE / BRIQUES =====
        let mut bricks_remaining = 0;

        for row in 0..BRICK_ROWS {
            for col in 0..BRICK_COLS {
                let idx = row * BRICK_COLS + col;
                if !self.bricks[idx].active {
                    continue;
                }

                bricks_remaining += 1;

                // Position de la brique
                let bx = BRICK_OFFSET_X + col as f32 * (BRICK_WIDTH + BRICK_PADDING);
                let by = BRICK_OFFSET_Y + row as f32 * (BRICK_HEIGHT + BRICK_PADDING);

                // Test de collision (AABB = Axis-Aligned Bounding Box)
                let ball_left = self.ball_x - BALL_SIZE / 2.0;
                let ball_right = self.ball_x + BALL_SIZE / 2.0;
                let ball_top = self.ball_y - BALL_SIZE / 2.0;
                let ball_bottom = self.ball_y + BALL_SIZE / 2.0;

                if ball_right > bx
                    && ball_left < bx + BRICK_WIDTH
                    && ball_bottom > by
                    && ball_top < by + BRICK_HEIGHT
                {
                    // Détruit la brique
                    self.bricks[idx].active = false;
                    self.score += self.bricks[idx].points;
                    bricks_remaining -= 1;

                    // Détermine de quel côté la balle arrive
                    let overlap_left = ball_right - bx;
                    let overlap_right = bx + BRICK_WIDTH - ball_left;
                    let overlap_top = ball_bottom - by;
                    let overlap_bottom = by + BRICK_HEIGHT - ball_top;

                    let min_overlap = overlap_left
                        .min(overlap_right)
                        .min(overlap_top)
                        .min(overlap_bottom);

                    if min_overlap == overlap_top || min_overlap == overlap_bottom {
                        self.ball_vy = -self.ball_vy;
                    } else {
                        self.ball_vx = -self.ball_vx;
                    }

                    break;
                }
            }
        }

        // Victoire si plus aucune brique
        if bricks_remaining == 0 {
            self.won = true;
        }
    }

    // ===== GETTERS pour React =====

    pub fn get_ball_x(&self) -> f32 { self.ball_x }
    pub fn get_ball_y(&self) -> f32 { self.ball_y }
    pub fn get_ball_size(&self) -> f32 { BALL_SIZE }
    pub fn get_paddle_x(&self) -> f32 { self.paddle_x }
    pub fn get_paddle_y(&self) -> f32 { PADDLE_Y }
    pub fn get_paddle_width(&self) -> f32 { PADDLE_WIDTH }
    pub fn get_paddle_height(&self) -> f32 { PADDLE_HEIGHT }
    pub fn get_score(&self) -> u32 { self.score }
    pub fn get_lives(&self) -> u32 { self.lives }
    pub fn is_game_over(&self) -> bool { self.game_over }
    pub fn is_won(&self) -> bool { self.won }
    pub fn get_canvas_width(&self) -> f32 { CANVAS_WIDTH }
    pub fn get_canvas_height(&self) -> f32 { CANVAS_HEIGHT }
    pub fn is_ball_stuck(&self) -> bool { self.ball_stuck }

    // Retourne les briques sous forme de tableau plat
    // Chaque brique = [active (0/1), points, x, y]
    pub fn get_bricks(&self) -> Vec<f32> {
        let mut result = Vec::new();
        for row in 0..BRICK_ROWS {
            for col in 0..BRICK_COLS {
                let idx = row * BRICK_COLS + col;
                let brick = &self.bricks[idx];
                let x = BRICK_OFFSET_X + col as f32 * (BRICK_WIDTH + BRICK_PADDING);
                let y = BRICK_OFFSET_Y + row as f32 * (BRICK_HEIGHT + BRICK_PADDING);
                result.push(if brick.active { 1.0 } else { 0.0 });
                result.push(brick.points as f32);
                result.push(x);
                result.push(y);
            }
        }
        result
    }

    pub fn get_brick_width(&self) -> f32 { BRICK_WIDTH }
    pub fn get_brick_height(&self) -> f32 { BRICK_HEIGHT }
}
