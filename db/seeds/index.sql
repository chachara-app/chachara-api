TRUNCATE TABLE languages;
TRUNCATE TABLE questions;

INSERT INTO languages (language) VALUES ("español"), ("english");

INSERT INTO questions (question, language_id) VALUES (
  "¿Qué hay para hacer en tu ciudad?",
  1
), (
  "Describe a tu familia. ¿Tienes hermanos, primos, sobrinos?",
  1
), (
  "¿Tienes una mascota? ¿Cómo es?",
  1
), (
  "¿Cuál es tu comida preferida?",
  1
), (
  "¿A dónde has ido en tus últimas vacaciones?",
  1
);

