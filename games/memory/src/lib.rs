use wasm_bindgen::prelude::*;

// Nombre de paires de cartes
const PAIRS: usize = 8;
const TOTAL_CARDS: usize = PAIRS * 2;

// État d'une carte
#[derive(Clone, Copy, PartialEq)]
pub enum CardState {
    Hidden,   // Face cachée
    Flipped,  // Retournée (en cours de vérification)
    Matched,  // Paire trouvée
}

#[derive(Clone, Copy)]
pub struct Card {
    // La valeur de la carte (0 à 7 — deux cartes ont la même valeur)
    value: u32,
    state: CardState,
}

#[wasm_bindgen]
pub struct GameState {
    cards: Vec<Card>,
    // Index de la première carte retournée (None si aucune)
    first_flipped: Option<usize>,
    // Nombre de tentatives
    attempts: u32,
    // Nombre de paires trouvées
    pairs_found: u32,
    // Seed pour le mélange
    rng_seed: u32,
}

#[wasm_bindgen]
impl GameState {

    pub fn new(seed: u32) -> GameState {
        let mut state = GameState {
            cards: Vec::new(),
            first_flipped: None,
            attempts: 0,
            pairs_found: 0,
            // On utilise la seed passée depuis JavaScript
            rng_seed: seed,
        };
        state.init_cards();
        state
    }

    // Initialise et mélange les cartes
    fn init_cards(&mut self) {
        // Crée deux cartes pour chaque valeur
        let mut cards: Vec<Card> = (0..PAIRS as u32)
            .flat_map(|v| {
                vec![
                    Card { value: v, state: CardState::Hidden },
                    Card { value: v, state: CardState::Hidden },
                ]
            })
            .collect();

        // Mélange avec l'algorithme Fisher-Yates
        for i in (1..TOTAL_CARDS).rev() {
            let j = (self.next_rand() as usize) % (i + 1);
            cards.swap(i, j);
        }

        self.cards = cards;
    }

    // Retourne une carte — appelée quand le joueur clique
    // Retourne : 0 = ok, 1 = paire trouvée, 2 = pas de paire, 3 = déjà matched
    pub fn flip_card(&mut self, index: usize) -> u32 {
        if index >= TOTAL_CARDS {
            return 0;
        }

        // Ignore les cartes déjà matchées ou retournées
        if self.cards[index].state != CardState::Hidden {
            return 3;
        }

        self.cards[index].state = CardState::Flipped;

        match self.first_flipped {
            // Première carte retournée — on attend la deuxième
            None => {
                self.first_flipped = Some(index);
                0
            }
            // Deuxième carte retournée — on vérifie la paire
            Some(first_idx) => {
                self.attempts += 1;
                self.first_flipped = None;

                if self.cards[first_idx].value == self.cards[index].value {
                    // Paire trouvée !
                    self.cards[first_idx].state = CardState::Matched;
                    self.cards[index].state = CardState::Matched;
                    self.pairs_found += 1;
                    1
                } else {
                    // Pas de paire — on remet les cartes face cachée
                    self.cards[first_idx].state = CardState::Hidden;
                    self.cards[index].state = CardState::Hidden;
                    2
                }
            }
        }
    }

    // Retourne toutes les cartes sous forme de tableau plat
    // Chaque carte = [value, state] (0=hidden, 1=flipped, 2=matched)
    pub fn get_cards(&self) -> Vec<u32> {
        self.cards
            .iter()
            .flat_map(|c| {
                let state = match c.state {
                    CardState::Hidden => 0,
                    CardState::Flipped => 1,
                    CardState::Matched => 2,
                };
                vec![c.value, state]
            })
            .collect()
    }

    pub fn get_attempts(&self) -> u32 { self.attempts }
    pub fn get_pairs_found(&self) -> u32 { self.pairs_found }
    pub fn is_won(&self) -> bool { self.pairs_found == PAIRS as u32 }
    pub fn get_total_pairs(&self) -> u32 { PAIRS as u32 }

    // Pseudo-random xorshift (même algo que Snake)
    fn next_rand(&mut self) -> u32 {
        self.rng_seed ^= self.rng_seed << 13;
        self.rng_seed ^= self.rng_seed >> 17;
        self.rng_seed ^= self.rng_seed << 5;
        self.rng_seed
    }
}
