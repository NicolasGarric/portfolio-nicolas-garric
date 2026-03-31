use wasm_bindgen::prelude::*;

// ===== CONSTANTES =====
const SUITS: usize = 4;
const RANKS: usize = 13;
const TOTAL_CARDS: usize = SUITS * RANKS;

// ===== COULEUR =====
// 0 = Pique (noir), 1 = Coeur (rouge), 2 = Carreau (rouge), 3 = Trèfle (noir)
fn is_red(suit: u8) -> bool {
    suit == 1 || suit == 2
}

// ===== CARTE =====
// Une carte = suit * 13 + rank (rank 0 = As, 12 = Roi)
// face_up = true si visible
#[derive(Clone, Copy)]
pub struct Card {
    pub suit: u8,   // 0-3
    pub rank: u8,   // 0-12 (0=As, 12=Roi)
    pub face_up: bool,
}

impl Card {
    pub fn new(suit: u8, rank: u8) -> Card {
        Card { suit, rank, face_up: false }
    }

    pub fn id(&self) -> u8 {
        self.suit * 13 + self.rank
    }
}

// ===== ÉTAT DU JEU =====
#[wasm_bindgen]
pub struct GameState {
    // 7 colonnes du tableau
    tableau: Vec<Vec<Card>>,
    // Pioche (cartes pas encore jouées)
    stock: Vec<Card>,
    // Défausse (cartes retournées de la pioche)
    waste: Vec<Card>,
    // 4 fondations (une par couleur)
    foundations: Vec<Vec<Card>>,
    // Score
    score: u32,
    // Nombre de mouvements
    moves: u32,
    // Jeu terminé ?
    won: bool,
    // Seed
    rng_seed: u32,
}

#[wasm_bindgen]
impl GameState {

    pub fn new(seed: u32) -> GameState {
        let mut state = GameState {
            tableau: vec![Vec::new(); 7],
            stock: Vec::new(),
            waste: Vec::new(),
            foundations: vec![Vec::new(); 4],
            score: 0,
            moves: 0,
            won: false,
            rng_seed: seed,
        };
        state.deal();
        state
    }

    fn next_rand(&mut self) -> u32 {
        self.rng_seed = self.rng_seed
            .wrapping_mul(1664525)
            .wrapping_add(1013904223);
        self.rng_seed
    }

    // Distribue les cartes au début
    fn deal(&mut self) {
        let mut deck: Vec<Card> = Vec::new();
        for suit in 0..4u8 {
            for rank in 0..13u8 {
                deck.push(Card::new(suit, rank));
            }
        }

        // Fisher-Yates amélioré avec plusieurs passes
        for _ in 0..3 {
            for i in (1..TOTAL_CARDS).rev() {
                let j = (self.next_rand() as usize) % (i + 1);
                deck.swap(i, j);
            }
        }

        // Vérifie qu'il n'y a pas de doublons
        let mut seen = vec![false; TOTAL_CARDS];
        for card in &deck {
            let id = (card.suit as usize) * 13 + card.rank as usize;
            seen[id] = true;
        }

        // Distribue dans le tableau
        let mut idx = 0;
        for col in 0..7 {
            for row in 0..=col {
                let mut card = deck[idx];
                if row == col {
                    card.face_up = true;
                }
                self.tableau[col].push(card);
                idx += 1;
            }
        }

        // Le reste va dans la pioche
        for i in idx..TOTAL_CARDS {
            self.stock.push(deck[i]);
        }
    }

    // ===== PIOCHE =====

    // Retourne la carte du dessus de la pioche
    pub fn draw_from_stock(&mut self) {
        if self.stock.is_empty() {
            // Recycle la défausse dans la pioche
            if !self.waste.is_empty() {
                while let Some(mut card) = self.waste.pop() {
                    card.face_up = false;
                    self.stock.push(card);
                }
            }
            return;
        }

        if let Some(mut card) = self.stock.pop() {
            card.face_up = true;
            self.waste.push(card);
            self.moves += 1;
        }
    }

    // ===== DÉPLACEMENTS =====

    // Déplace une carte de la défausse vers une colonne du tableau
    pub fn move_waste_to_tableau(&mut self, col: usize) -> bool {
        if col >= 7 { return false; }
        let card = match self.waste.last() {
            Some(&c) => c,
            None => return false,
        };

        if self.can_place_on_tableau(card, col) {
            self.waste.pop();
            self.tableau[col].push(card);
            self.moves += 1;
            self.score += 5;
            true
        } else {
            false
        }
    }

    // Déplace une carte de la défausse vers une fondation
    pub fn move_waste_to_foundation(&mut self, foundation: usize) -> bool {
        if foundation >= 4 { return false; }
        let card = match self.waste.last() {
            Some(&c) => c,
            None => return false,
        };

        if self.can_place_on_foundation(card, foundation) {
            self.waste.pop();
            self.foundations[foundation].push(card);
            self.moves += 1;
            self.score += 10;
            self.check_win();
            true
        } else {
            false
        }
    }

    // Déplace une ou plusieurs cartes entre colonnes
    // from_col = colonne source, card_idx = index de la première carte à déplacer
    pub fn move_tableau_to_tableau(&mut self, from_col: usize, card_idx: usize, to_col: usize) -> bool {
        if from_col >= 7 || to_col >= 7 || from_col == to_col { return false; }
        if card_idx >= self.tableau[from_col].len() { return false; }

        let card = self.tableau[from_col][card_idx];
        if !card.face_up { return false; }

        if self.can_place_on_tableau(card, to_col) {
            let cards_to_move: Vec<Card> = self.tableau[from_col][card_idx..].to_vec();
            self.tableau[from_col].truncate(card_idx);

            // Retourne la nouvelle carte du dessus si elle existe
            if let Some(top) = self.tableau[from_col].last_mut() {
                if !top.face_up {
                    top.face_up = true;
                    self.score += 5;
                }
            }

            for card in cards_to_move {
                self.tableau[to_col].push(card);
            }

            self.moves += 1;
            true
        } else {
            false
        }
    }

    // Déplace une carte du tableau vers une fondation
    pub fn move_tableau_to_foundation(&mut self, col: usize, foundation: usize) -> bool {
        if col >= 7 || foundation >= 4 { return false; }

        let card = match self.tableau[col].last() {
            Some(&c) if c.face_up => c,
            _ => return false,
        };

        if self.can_place_on_foundation(card, foundation) {
            self.tableau[col].pop();

            // Retourne la nouvelle carte du dessus
            if let Some(top) = self.tableau[col].last_mut() {
                if !top.face_up {
                    top.face_up = true;
                    self.score += 5;
                }
            }

            self.foundations[foundation].push(card);
            self.moves += 1;
            self.score += 10;
            self.check_win();
            true
        } else {
            false
        }
    }

    // ===== RÈGLES =====

    fn can_place_on_tableau(&self, card: Card, col: usize) -> bool {
        match self.tableau[col].last() {
            None => {
                // Colonne vide — seul un Roi peut y aller
                card.rank == 12
            }
            Some(&top) => {
                // La carte doit être de couleur opposée et de rang inférieur de 1
                top.face_up
                    && is_red(card.suit) != is_red(top.suit)
                    && card.rank + 1 == top.rank
            }
        }
    }

    fn can_place_on_foundation(&self, card: Card, foundation: usize) -> bool {
        match self.foundations[foundation].last() {
            None => {
                // Fondation vide — seul un As peut y aller
                card.rank == 0
            }
            Some(&top) => {
                // Même couleur, rang suivant
                top.suit == card.suit && card.rank == top.rank + 1
            }
        }
    }

    // Trouve automatiquement la fondation où une carte peut aller
    pub fn auto_move_to_foundation(&mut self, col: usize) -> bool {
        for f in 0..4 {
            if self.move_tableau_to_foundation(col, f) {
                return true;
            }
        }
        false
    }

    pub fn auto_move_waste_to_foundation(&mut self) -> bool {
        for f in 0..4 {
            if self.move_waste_to_foundation(f) {
                return true;
            }
        }
        false
    }

    fn check_win(&mut self) {
        let total: usize = self.foundations.iter().map(|f| f.len()).sum();
        if total == TOTAL_CARDS {
            self.won = true;
            // Le score = nombre de mouvements (moins = meilleur)
            self.score = self.moves;
        }
    }

    // ===== GETTERS =====
    pub fn get_score(&self) -> u32 { self.score }
    pub fn get_moves(&self) -> u32 { self.moves }
    pub fn is_won(&self) -> bool { self.won }
    pub fn get_stock_count(&self) -> usize { self.stock.len() }

    // Retourne la carte du dessus de la défausse
    // [suit, rank] ou [] si vide
    pub fn get_waste_top(&self) -> Vec<u8> {
        match self.waste.last() {
            Some(c) => vec![c.suit, c.rank],
            None => vec![],
        }
    }

    // Retourne les fondations : [suit, rank] du dessus de chaque fondation
    // -1 si vide
    pub fn get_foundations(&self) -> Vec<i8> {
        self.foundations.iter().map(|f| {
            match f.last() {
                Some(c) => c.rank as i8,
                None => -1,
            }
        }).collect()
    }

    // Retourne les suits des fondations
    pub fn get_foundation_suits(&self) -> Vec<i8> {
        self.foundations.iter().map(|f| {
            match f.first() {
                Some(c) => c.suit as i8,
                None => -1,
            }
        }).collect()
    }

    // Retourne le tableau complet
    // Pour chaque colonne : [suit, rank, face_up(0/1), ...]
    pub fn get_tableau(&self) -> Vec<u8> {
        let mut result = Vec::new();
        for col in &self.tableau {
            // Nombre de cartes dans cette colonne
            result.push(col.len() as u8);
            for card in col {
                result.push(card.suit);
                result.push(card.rank);
                result.push(if card.face_up { 1 } else { 0 });
            }
        }
        result
    }

    // Vérifie si un mouvement tableau->tableau est valide
    pub fn can_move_tableau_to_tableau(&self, from_col: usize, card_idx: usize, to_col: usize) -> bool {
        if from_col >= 7 || to_col >= 7 || from_col == to_col { return false; }
        if card_idx >= self.tableau[from_col].len() { return false; }
        let card = self.tableau[from_col][card_idx];
        if !card.face_up { return false; }
        self.can_place_on_tableau(card, to_col)
    }
}
