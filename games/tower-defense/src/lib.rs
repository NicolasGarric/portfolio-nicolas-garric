use wasm_bindgen::prelude::*;

// ===== CONSTANTES =====
const GRID_WIDTH: usize = 20;
const GRID_HEIGHT: usize = 15;
const CELL_SIZE: f32 = 40.0;
const BASE_X: usize = 19;
const BASE_Y: usize = 7;
const SPAWN_X: usize = 0;
const SPAWN_Y: usize = 7;
const BASE_HP: u32 = 20;
const STARTING_RESOURCES: u32 = 200;

// ===== TYPES DE TOURELLES =====
#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq)]
pub enum TowerType {
    Canon,        // Dégâts élevés, portée courte, lent
    Machinegun,   // Dégâts faibles, portée moyenne, rapide
    Laser,        // Dégâts moyens, portée longue, continu
    Wall,         // Pas d'attaque, bloque les ennemis
}

// ===== TYPES D'ENNEMIS =====
#[derive(Clone, Copy, PartialEq)]
pub enum EnemyType {
    Scout,    // Rapide, peu de vie
    Soldier,  // Normal
    Tank,     // Lent, beaucoup de vie, armure
}

// ===== CASE DE LA GRILLE =====
#[derive(Clone, Copy, PartialEq)]
pub enum Cell {
    Empty,
    Tower(TowerType),
    Path,   // Case réservée au chemin des ennemis
    Base,
    Spawn,
}

// ===== TOURELLE =====
#[derive(Clone)]
pub struct Tower {
    pub x: usize,
    pub y: usize,
    pub tower_type: TowerType,
    // Temps avant le prochain tir (en ticks)
    pub cooldown: u32,
    pub max_cooldown: u32,
    pub damage: f32,
    pub range: f32,
}

impl Tower {
    pub fn new(x: usize, y: usize, tower_type: TowerType) -> Tower {
        let (max_cooldown, damage, range) = match tower_type {
            TowerType::Canon =>      (60, 40.0, 3.0),
            TowerType::Machinegun => (10, 8.0,  4.0),
            TowerType::Laser =>      (1,  3.0,  6.0),
            TowerType::Wall =>       (999, 0.0, 0.0),
        };

        Tower { x, y, tower_type, cooldown: 0, max_cooldown, damage, range }
    }

    pub fn cost(tower_type: TowerType) -> u32 {
        match tower_type {
            TowerType::Canon =>      50,
            TowerType::Machinegun => 75,
            TowerType::Laser =>      150,
            TowerType::Wall =>       20,
        }
    }
}

// ===== ENNEMI =====
#[derive(Clone)]
pub struct Enemy {
    pub id: u32,
    pub enemy_type: EnemyType,
    // Position en pixels (pour un mouvement fluide)
    pub x: f32,
    pub y: f32,
    pub hp: f32,
    pub max_hp: f32,
    pub speed: f32,
    pub armor: f32,
    pub reward: u32,
    // Index du prochain waypoint dans le chemin
    pub path_index: usize,
    pub alive: bool,
}

impl Enemy {
    pub fn new(id: u32, enemy_type: EnemyType) -> Enemy {
        let (hp, speed, armor, reward) = match enemy_type {
            EnemyType::Scout =>   (60.0,  2.0, 0.0,  10),
            EnemyType::Soldier => (150.0, 1.2, 0.2,  25),
            EnemyType::Tank =>    (400.0, 0.6, 0.5,  50),
        };

        Enemy {
            id,
            enemy_type,
            x: (SPAWN_X as f32 + 0.5) * CELL_SIZE,
            y: (SPAWN_Y as f32 + 0.5) * CELL_SIZE,
            hp,
            max_hp: hp,
            speed,
            armor,
            reward,
            path_index: 0,
            alive: true,
        }
    }
}

// ===== PROJECTILE =====
#[derive(Clone)]
pub struct Projectile {
    pub x: f32,
    pub y: f32,
    pub target_id: u32,
    pub damage: f32,
    pub speed: f32,
    pub tower_type: TowerType,
    pub active: bool,
}

// ===== NOEUD POUR A* =====
#[derive(Clone)]
struct AStarNode {
    x: usize,
    y: usize,
    g: f32, // Coût depuis le départ
    f: f32, // g + heuristique
    parent: Option<(usize, usize)>,
}

// ===== ÉTAT DU JEU =====
#[wasm_bindgen]
pub struct GameState {
    grid: Vec<Cell>,
    towers: Vec<Tower>,
    enemies: Vec<Enemy>,
    projectiles: Vec<Projectile>,
    // Chemin calculé par A* (liste de positions en pixels)
    path: Vec<(f32, f32)>,
    resources: u32,
    base_hp: u32,
    wave: u32,
    wave_in_progress: bool,
    game_over: bool,
    won: bool,
    enemy_id_counter: u32,
    // Ennemis restants à spawner dans la vague
    spawn_queue: Vec<EnemyType>,
    spawn_timer: u32,
    total_waves: u32,
}

#[wasm_bindgen]
impl GameState {

    pub fn new() -> GameState {
        let mut state = GameState {
            grid: vec![Cell::Empty; GRID_WIDTH * GRID_HEIGHT],
            towers: Vec::new(),
            enemies: Vec::new(),
            projectiles: Vec::new(),
            path: Vec::new(),
            resources: STARTING_RESOURCES,
            base_hp: BASE_HP,
            wave: 0,
            wave_in_progress: false,
            game_over: false,
            won: false,
            enemy_id_counter: 0,
            spawn_queue: Vec::new(),
            spawn_timer: 0,
            total_waves: 10,
        };

        // Place le spawn et la base
        state.set_cell(SPAWN_X, SPAWN_Y, Cell::Spawn);
        state.set_cell(BASE_X, BASE_Y, Cell::Base);

        // Calcule le chemin initial
        state.recalculate_path();

        state
    }

    // ===== PLACEMENT DES TOURELLES =====
    pub fn can_place(&self, x: usize, y: usize) -> bool {
        if x >= GRID_WIDTH || y >= GRID_HEIGHT { return false; }
        if self.get_cell(x, y) != Cell::Empty { return false; }
        // Vérifie que placer ici ne bloque pas le chemin
        true
    }

    pub fn place_tower(&mut self, x: usize, y: usize, tower_type: TowerType) -> bool {
        let cost = Tower::cost(tower_type);
        if self.resources < cost { return false; }
        if !self.can_place(x, y) { return false; }

        self.set_cell(x, y, Cell::Tower(tower_type));

        let new_path = self.find_path();
        if new_path.is_empty() {
            self.set_cell(x, y, Cell::Empty);
            return false;
        }

        self.path = new_path.clone();
        self.resources -= cost;
        self.towers.push(Tower::new(x, y, tower_type));

        // Fix E0502 — on calcule les indices AVANT de modifier self.enemies
        let new_indices: Vec<usize> = self.enemies.iter()
            .map(|e| self.find_nearest_path_index(e.x, e.y))
            .collect();

        for (enemy, idx) in self.enemies.iter_mut().zip(new_indices) {
            enemy.path_index = idx;
        }

        true
    }

    // ===== VAGUES =====
    pub fn start_wave(&mut self) {
        if self.wave_in_progress || self.game_over { return; }

        self.wave += 1;
        self.wave_in_progress = true;
        self.spawn_queue = self.generate_wave(self.wave);
        self.spawn_timer = 0;
    }

    fn generate_wave(&self, wave: u32) -> Vec<EnemyType> {
        let mut queue = Vec::new();

        let scouts = (wave * 3).min(15);
        let soldiers = if wave > 2 { (wave - 2) * 2 } else { 0 };
        let tanks = if wave > 4 { wave - 4 } else { 0 };

        for _ in 0..scouts { queue.push(EnemyType::Scout); }
        for _ in 0..soldiers { queue.push(EnemyType::Soldier); }
        for _ in 0..tanks { queue.push(EnemyType::Tank); }

        // Mélange simple avec un seed u32
        let mut seed: u32 = wave * 1664525 + 1013904223;
        let len = queue.len();
        for i in (1..len).rev() {
            seed = seed.wrapping_mul(1664525).wrapping_add(1013904223);
            let j = (seed as usize) % (i + 1);
            queue.swap(i, j);
        }

        queue
    }

    // ===== TICK PRINCIPAL =====
    pub fn tick(&mut self) {
        if self.game_over || self.won { return; }

        // Spawn des ennemis
        if self.wave_in_progress && !self.spawn_queue.is_empty() {
            self.spawn_timer += 1;
            if self.spawn_timer >= 30 {
                self.spawn_timer = 0;
                let enemy_type = self.spawn_queue.remove(0);
                let id = self.enemy_id_counter;
                self.enemy_id_counter += 1;
                self.enemies.push(Enemy::new(id, enemy_type));
            }
        }

        // Déplace les ennemis
        self.move_enemies();

        // Tourelles tirent
        self.towers_shoot();

        // Déplace les projectiles
        self.move_projectiles();

        // Vérifie fin de vague
        if self.wave_in_progress
            && self.spawn_queue.is_empty()
            && self.enemies.is_empty()
        {
            self.wave_in_progress = false;
            // Bonus de ressources entre les vagues
            self.resources += 50;

            if self.wave >= self.total_waves {
                self.won = true;
            }
        }
    }

    fn move_enemies(&mut self) {
        let path = self.path.clone();

        for enemy in &mut self.enemies {
            if !enemy.alive { continue; }
            if path.is_empty() { continue; }

            if enemy.path_index >= path.len() {
                enemy.alive = false;
                if self.base_hp > 0 {
                    self.base_hp -= 1;
                }
                if self.base_hp == 0 {
                    self.game_over = true;
                }
                continue;
            }

            let target = path[enemy.path_index];
            let dx = target.0 - enemy.x;
            let dy = target.1 - enemy.y;
            let dist = (dx * dx + dy * dy).sqrt();

            if dist < enemy.speed {
                enemy.x = target.0;
                enemy.y = target.1;
                enemy.path_index += 1;
            } else {
                enemy.x += dx / dist * enemy.speed;
                enemy.y += dy / dist * enemy.speed;
            }
        }

        self.enemies.retain(|e| e.alive);
    }

    fn towers_shoot(&mut self) {
        let enemies = self.enemies.clone();

        for tower in &mut self.towers {
            if tower.tower_type == TowerType::Wall { continue; }

            if tower.cooldown > 0 {
                tower.cooldown -= 1;
                continue;
            }

            // Cherche l'ennemi le plus avancé dans la portée
            let tower_px = (tower.x as f32 + 0.5) * CELL_SIZE;
            let tower_py = (tower.y as f32 + 0.5) * CELL_SIZE;
            let range_px = tower.range * CELL_SIZE;

            let mut best_target: Option<u32> = None;
            let mut best_progress = 0;

            for enemy in &enemies {
                if !enemy.alive { continue; }
                let dx = enemy.x - tower_px;
                let dy = enemy.y - tower_py;
                let dist = (dx * dx + dy * dy).sqrt();

                if dist <= range_px && enemy.path_index > best_progress {
                    best_progress = enemy.path_index;
                    best_target = Some(enemy.id);
                }
            }

            if let Some(target_id) = best_target {
                let _target = enemies.iter().find(|e| e.id == target_id).unwrap();
                self.projectiles.push(Projectile {
                    x: tower_px,
                    y: tower_py,
                    target_id,
                    damage: tower.damage,
                    speed: 8.0,
                    tower_type: tower.tower_type,
                    active: true,
                });
                tower.cooldown = tower.max_cooldown;
            }
        }
    }

    fn move_projectiles(&mut self) {
        let mut resources_gained = 0u32;

        for proj in &mut self.projectiles {
            if !proj.active { continue; }

            let target = self.enemies.iter_mut().find(|e| e.id == proj.target_id);

            match target {
                None => { proj.active = false; }
                Some(enemy) => {
                    if !enemy.alive {
                        proj.active = false;
                        continue;
                    }

                    let dx = enemy.x - proj.x;
                    let dy = enemy.y - proj.y;
                    let dist = (dx * dx + dy * dy).sqrt();

                    if dist < proj.speed {
                        // Impact !
                        let actual_damage = proj.damage * (1.0 - enemy.armor);
                        enemy.hp -= actual_damage;
                        proj.active = false;

                        if enemy.hp <= 0.0 {
                            enemy.alive = false;
                            resources_gained += enemy.reward;
                        }
                    } else {
                        proj.x += dx / dist * proj.speed;
                        proj.y += dy / dist * proj.speed;
                    }
                }
            }
        }

        self.resources += resources_gained;
        self.projectiles.retain(|p| p.active);
        self.enemies.retain(|e| e.alive);
    }

    // ===== PATHFINDING A* =====
    fn find_path(&self) -> Vec<(f32, f32)> {
        let start = (SPAWN_X, SPAWN_Y);
        let goal = (BASE_X, BASE_Y);

        let heuristic = |x: usize, y: usize| -> f32 {
            let dx = (x as f32 - goal.0 as f32).abs();
            let dy = (y as f32 - goal.1 as f32).abs();
            dx + dy
        };

        let mut open: Vec<AStarNode> = vec![AStarNode {
            x: start.0,
            y: start.1,
            g: 0.0,
            f: heuristic(start.0, start.1),
            parent: None,
        }];

        let mut closed = vec![false; GRID_WIDTH * GRID_HEIGHT];
        let mut came_from: Vec<Option<(usize, usize)>> = vec![None; GRID_WIDTH * GRID_HEIGHT];

        while !open.is_empty() {
            let current_idx = open
                .iter()
                .enumerate()
                .min_by(|a, b| a.1.f.partial_cmp(&b.1.f).unwrap())
                .map(|(i, _)| i)
                .unwrap();

            let current = open.remove(current_idx);

            if current.x == goal.0 && current.y == goal.1 {
                return self.reconstruct_path(&came_from, goal);
            }

            let idx = current.y * GRID_WIDTH + current.x;
            if closed[idx] { continue; }
            closed[idx] = true;
            came_from[idx] = current.parent;

            let neighbors: [(i32, i32); 4] = [
                (-1, 0), (1, 0), (0, -1), (0, 1),
            ];

            for (dx, dy) in neighbors {
                let nx = current.x as i32 + dx;
                let ny = current.y as i32 + dy;

                if nx < 0 || ny < 0 || nx >= GRID_WIDTH as i32 || ny >= GRID_HEIGHT as i32 {
                    continue;
                }

                let nx = nx as usize;
                let ny = ny as usize;
                let nidx = ny * GRID_WIDTH + nx;

                if closed[nidx] { continue; }

                // Bloqué uniquement par les tourelles et murs
                let passable = match self.get_cell(nx, ny) {
                    Cell::Empty => true,
                    Cell::Spawn => true,
                    Cell::Base => true,
                    Cell::Path => true,
                    Cell::Tower(_) => false, // Bloqué
                };

                if !passable { continue; }

                let g = current.g + 1.0;
                let f = g + heuristic(nx, ny);

                if open.iter().any(|n| n.x == nx && n.y == ny && n.g <= g) {
                    continue;
                }

                open.push(AStarNode {
                    x: nx,
                    y: ny,
                    g,
                    f,
                    parent: Some((current.x, current.y)),
                });
            }
        }

        Vec::new()
    }

    fn reconstruct_path(
        &self,
        came_from: &Vec<Option<(usize, usize)>>,
        goal: (usize, usize),
    ) -> Vec<(f32, f32)> {
        let mut path = Vec::new();
        let mut current = goal;

        loop {
            let px = (current.0 as f32 + 0.5) * CELL_SIZE;
            let py = (current.1 as f32 + 0.5) * CELL_SIZE;
            path.push((px, py));

            let idx = current.1 * GRID_WIDTH + current.0;
            match came_from[idx] {
                None => break,
                Some(parent) => current = parent,
            }
        }

        path.reverse();
        path
    }

    fn recalculate_path(&mut self) {
        self.path = self.find_path();
    }

    fn find_nearest_path_index(&self, x: f32, y: f32) -> usize {
        if self.path.is_empty() { return 0; }

        let mut best_idx = 0;
        let mut best_dist = f32::MAX;

        for (i, &(px, py)) in self.path.iter().enumerate() {
            let dx = x - px;
            let dy = y - py;
            let dist = dx * dx + dy * dy;
            if dist < best_dist {
                best_dist = dist;
                best_idx = i;
            }
        }

        best_idx
    }

    // ===== HELPERS =====
    fn get_cell(&self, x: usize, y: usize) -> Cell {
        self.grid[y * GRID_WIDTH + x]
    }

    fn set_cell(&mut self, x: usize, y: usize, cell: Cell) {
        self.grid[y * GRID_WIDTH + x] = cell;
    }

    // ===== GETTERS pour React =====
    pub fn get_resources(&self) -> u32 { self.resources }
    pub fn get_base_hp(&self) -> u32 { self.base_hp }
    pub fn get_wave(&self) -> u32 { self.wave }
    pub fn get_total_waves(&self) -> u32 { self.total_waves }
    pub fn is_wave_in_progress(&self) -> bool { self.wave_in_progress }
    pub fn is_game_over(&self) -> bool { self.game_over }
    pub fn is_won(&self) -> bool { self.won }
    pub fn get_grid_width(&self) -> usize { GRID_WIDTH }
    pub fn get_grid_height(&self) -> usize { GRID_HEIGHT }
    pub fn get_cell_size(&self) -> f32 { CELL_SIZE }

    pub fn get_tower_cost(&self, tower_type: TowerType) -> u32 {
        Tower::cost(tower_type)
    }

    // Retourne la grille sous forme de tableau plat
    // 0=vide, 1=canon, 2=mitrailleuse, 3=laser, 4=mur, 5=base, 6=spawn
    pub fn get_grid(&self) -> Vec<u8> {
        self.grid.iter().map(|c| match c {
            Cell::Empty => 0,
            Cell::Tower(TowerType::Canon) => 1,
            Cell::Tower(TowerType::Machinegun) => 2,
            Cell::Tower(TowerType::Laser) => 3,
            Cell::Tower(TowerType::Wall) => 4,
            Cell::Base => 5,
            Cell::Spawn => 6,
            Cell::Path => 7,
        }).collect()
    }

    // Retourne les ennemis : [x, y, hp_ratio, type, id] par ennemi
    pub fn get_enemies(&self) -> Vec<f32> {
        let mut result = Vec::new();
        for e in &self.enemies {
            result.push(e.x);
            result.push(e.y);
            result.push(e.hp / e.max_hp);
            result.push(match e.enemy_type {
                EnemyType::Scout => 0.0,
                EnemyType::Soldier => 1.0,
                EnemyType::Tank => 2.0,
            });
            result.push(e.id as f32);
        }
        result
    }

    // Retourne les projectiles : [x, y, type] par projectile
    pub fn get_projectiles(&self) -> Vec<f32> {
        let mut result = Vec::new();
        for p in &self.projectiles {
            result.push(p.x);
            result.push(p.y);
            result.push(match p.tower_type {
                TowerType::Canon => 0.0,
                TowerType::Machinegun => 1.0,
                TowerType::Laser => 2.0,
                TowerType::Wall => 3.0,
            });
        }
        result
    }

    // Retourne le chemin : [x, y] par point
    pub fn get_path(&self) -> Vec<f32> {
        let mut result = Vec::new();
        for &(x, y) in &self.path {
            result.push(x);
            result.push(y);
        }
        result
    }
}
