import { describe, it, expect } from "vitest";

import { getChapterData, listChapterSlugs } from "@/lib/courses-registry";
import { getValidators } from "../index";

/**
 * Rust course: every step, across the four chapters.
 *
 * Each `hint` is a complete program (checked against rustc when the content
 * was written) and must pass its validator; the `startCode` is covered by
 * `course-integrity.test.ts`. The cases below target the mistakes each
 * validator is meant to catch with a specific message.
 */

const CHAPTERS = listChapterSlugs("rust");

describe("Rust — the documented solution passes every step", () => {
  it("has four chapters", () => {
    expect(CHAPTERS).toEqual(["chapitre-1", "chapitre-2", "chapitre-3", "chapitre-4"]);
  });

  describe.each(CHAPTERS)("%s", (chapter) => {
    const data = getChapterData("rust", chapter)!;
    const validators = getValidators("rust", chapter);

    data.steps.forEach((step, i) => {
      it(`step ${i + 1}: the hint validates and awards the step's objectives`, () => {
        const result = validators[i](step.hint);
        expect(result.ok, result.msg).toBe(true);
        expect([...(result.objList ?? [])].sort()).toEqual(
          step.objectives.map((o) => o.id).sort()
        );
        expect(result.final === true).toBe(i === data.steps.length - 1);
      });
    });
  });
});

const v = (chapter: string, step: number) => getValidators("rust", chapter)[step - 1];

describe("Rust chapter 1 — targeted rejections", () => {
  it("step 1: flags println called without the macro bang", () => {
    const r = v("chapitre-1", 1)('fn main() {\n    println("Forge en ligne");\n}');
    expect(r.ok).toBe(false);
    expect(r.tone).toBe("syntax");
  });

  it("step 1: an instruction left in a comment does not validate", () => {
    const r = v("chapitre-1", 1)('fn main() {\n    // println!("Forge en ligne");\n}');
    expect(r.ok).toBe(false);
  });

  it("step 2: rejects a temperature declared without mut", () => {
    const code = `fn main() {
    let alliage = "titane";
    let temperature = 800;
    temperature = 1200;
    println!("{} {}", alliage, temperature);
}`;
    const r = v("chapitre-1", 2)(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toContain("mut");
  });

  it("step 2: accepts explicit type annotations and inline placeholders", () => {
    const code = `fn main() {
    let alliage: &str = "titane";
    let mut temperature: u32 = 800;
    temperature = 1200;
    println!("{alliage} à {temperature}");
}`;
    expect(v("chapitre-1", 2)(code).ok).toBe(true);
  });

  it("step 3: rejects a function that is declared but never called", () => {
    const code = `fn calculer_poussee(masse: u32, acceleration: u32) -> u32 {
    masse * acceleration
}

fn main() {
    println!("rien");
}`;
    expect(v("chapitre-1", 3)(code).ok).toBe(false);
  });

  it("step 3: flags the semicolon that turns the return expression into a statement", () => {
    const code = `fn calculer_poussee(masse: u32, acceleration: u32) -> u32 {
    masse * acceleration;
}

fn main() {
    println!("{}", calculer_poussee(120, 3));
}`;
    const r = v("chapitre-1", 3)(code);
    expect(r.ok).toBe(false);
    expect(r.tone).toBe("syntax");
  });

  it("step 4: flags the exclusive range 1..3", () => {
    const code = `fn main() {
    let temperature = 1200;
    let etat = if temperature > 1000 { "fusion" } else { "solide" };
    println!("{}", etat);
    for coup in 1..3 {
        println!("Coup de marteau n°{}", coup);
    }
}`;
    const r = v("chapitre-1", 4)(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toContain("1..=3");
  });
});

describe("Rust chapter 2 — targeted rejections", () => {
  it("step 1: the Spectre's move is still refused", () => {
    const data = getChapterData("rust", "chapitre-2")!;
    const r = v("chapitre-2", 1)(data.steps[0].startCode);
    expect(r.ok).toBe(false);
    expect(r.tone).toBe("logic");
  });

  it("step 1: accepts a borrow instead of a clone", () => {
    const code = `fn main() {
    let plan = String::from("Coque Alpha");
    let copie = &plan;
    println!("Plan original : {}", plan);
    println!("Copie : {}", copie);
}`;
    expect(v("chapitre-2", 1)(code).ok).toBe(true);
  });

  it("step 1: deleting the println that uses plan is not a repair", () => {
    const code = `fn main() {
    let plan = String::from("Coque Alpha");
    let copie = plan.clone();
    println!("Copie : {}", copie);
}`;
    expect(v("chapitre-2", 1)(code).ok).toBe(false);
  });

  it("step 2: rejects a parameter that takes ownership", () => {
    const code = `fn mesurer(plan: String) -> usize {
    plan.len()
}

fn main() {
    let plan = String::from("Coque Alpha");
    println!("{}", mesurer(plan));
}`;
    const r = v("chapitre-2", 2)(code);
    expect(r.ok).toBe(false);
    expect(r.tone).toBe("logic");
  });

  it("step 3: rejects a read-only borrow where a mutable one is needed", () => {
    const code = `fn renforcer(coque: &String) {
    coque.push_str(" +blindage");
}

fn main() {
    let mut coque = String::from("Coque Alpha");
    renforcer(&coque);
    println!("{}", coque);
}`;
    expect(v("chapitre-2", 3)(code).ok).toBe(false);
  });

  it("step 3: rejects a call that forgets &mut", () => {
    const code = `fn renforcer(coque: &mut String) {
    coque.push_str(" +blindage");
}

fn main() {
    let mut coque = String::from("Coque Alpha");
    renforcer(&coque);
    println!("{}", coque);
}`;
    expect(v("chapitre-2", 3)(code).ok).toBe(false);
  });

  it("step 4: accepts the short slice form [..5]", () => {
    const code = `fn indicatif(nom: &str) -> &str {
    &nom[..5]
}

fn main() {
    let nom = String::from("ALPHA-7 Forge orbitale");
    println!("{}", indicatif(&nom));
}`;
    expect(v("chapitre-2", 4)(code).ok).toBe(true);
  });
});

describe("Rust chapter 3 — targeted rejections", () => {
  it("step 1: rejects a struct missing a field", () => {
    const code = `struct Vaisseau {
    nom: String,
}

fn main() {
    let aurore = Vaisseau { nom: String::from("Aurore") };
    println!("{}", aurore.nom);
}`;
    expect(v("chapitre-3", 1)(code).ok).toBe(false);
  });

  it("step 2: flags a method that consumes self", () => {
    const code = `struct Vaisseau {
    nom: String,
    coque: u32,
}

impl Vaisseau {
    fn new(nom: &str) -> Self {
        Vaisseau { nom: String::from(nom), coque: 100 }
    }

    fn est_operationnel(self) -> bool {
        self.coque > 50
    }
}

fn main() {
    let aurore = Vaisseau::new("Aurore");
    println!("{}", aurore.est_operationnel());
}`;
    const r = v("chapitre-3", 2)(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toContain("&self");
  });

  it("step 3: a wildcard arm does not replace a missing variant", () => {
    const code = `enum Etat {
    Amarre,
    EnVol,
    EnPanne,
}

fn signaler(etat: Etat) {
    match etat {
        Etat::Amarre => println!("Vaisseau à quai"),
        Etat::EnVol => println!("Vaisseau en vol"),
        _ => println!("Vaisseau en panne"),
    }
}

fn main() {
    signaler(Etat::EnVol);
}`;
    const r = v("chapitre-3", 3)(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toContain("EnPanne");
  });

  it("step 4: rejects arms that ignore the carried data", () => {
    const code = `enum Ordre {
    Decoller,
    Viser(u32),
    Transmettre(String),
}

fn executer(ordre: Ordre) {
    match ordre {
        Ordre::Decoller => println!("Décollage"),
        Ordre::Viser(_) => println!("Cap"),
        Ordre::Transmettre(_) => println!("Message"),
    }
}

fn main() {
    executer(Ordre::Viser(90));
    executer(Ordre::Transmettre(String::from("Forge prête")));
}`;
    expect(v("chapitre-3", 4)(code).ok).toBe(false);
  });
});

describe("Rust chapter 4 — targeted rejections", () => {
  it("step 1: refuses unwrap in place of handling None", () => {
    const code = `fn trouver_reserve(secteur: u32) -> Option<u32> {
    if secteur == 7 { Some(450) } else { None }
}

fn main() {
    println!("{}", trouver_reserve(7).unwrap());
}`;
    const r = v("chapitre-4", 1)(code);
    expect(r.ok).toBe(false);
    expect(r.msg).toContain("unwrap");
  });

  it("step 1: accepts if let with an else branch", () => {
    const code = `fn trouver_reserve(secteur: u32) -> Option<u32> {
    if secteur == 7 { Some(450) } else { None }
}

fn main() {
    if let Some(litres) = trouver_reserve(7) {
        println!("Réserve : {} litres", litres);
    } else {
        println!("Secteur vide");
    }
}`;
    expect(v("chapitre-4", 1)(code).ok).toBe(true);
  });

  it("step 2: rejects a match that drops the error", () => {
    const code = `fn allumer(temperature: u32) -> Result<u32, String> {
    if temperature >= 1000 { Ok(temperature) } else { Err(String::from("Forge trop froide")) }
}

fn main() {
    match allumer(800) {
        Ok(degres) => println!("{}", degres),
        _ => println!("raté"),
    }
}`;
    expect(v("chapitre-4", 2)(code).ok).toBe(false);
  });

  it("step 3: rejects a manual match where ? is expected", () => {
    const data = getChapterData("rust", "chapitre-4")!;
    const code = data.steps[2].hint.replace(
      "let degres = allumer(temperature)?;",
      "let degres = match allumer(temperature) { Ok(d) => d, Err(e) => return Err(e) };"
    );
    expect(code).not.toBe(data.steps[2].hint);
    expect(v("chapitre-4", 3)(code).ok).toBe(false);
  });

  it("step 4: accepts the turbofish forms", () => {
    const code = `fn main() {
    let modules = vec![30, 80, 55];
    let renforces = modules.iter().map(|m| m * 2).collect::<Vec<u32>>();
    let total = renforces.iter().sum::<u32>();
    println!("Coque totale : {}", total);
}`;
    expect(v("chapitre-4", 4)(code).ok).toBe(true);
  });

  it("step 4: rejects a manual loop without iterators", () => {
    const code = `fn main() {
    let modules = vec![30, 80, 55];
    let mut total = 0;
    for m in modules {
        total += m * 2;
    }
    println!("Coque totale : {}", total);
}`;
    expect(v("chapitre-4", 4)(code).ok).toBe(false);
  });
});
