USE generative_ai;

-- Table structure for table accounts
DROP TABLE IF EXISTS Accounts;
CREATE TABLE Accounts (
    username varchar(16) NOT NULL PRIMARY KEY,
    password varchar(256) NOT NULL
);

-- Create Languages Table
CREATE TABLE Languages (
    language_id INT AUTO_INCREMENT PRIMARY KEY,
    language_name VARCHAR(50) NOT NULL
);

-- Create Categories Table
CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    language_id INT,
    FOREIGN KEY (language_id) REFERENCES Languages(language_id)
);

-- Create Questions Table
CREATE TABLE Questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    language_id INT,
    question_text VARCHAR(300) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES Languages(language_id)
);

-- Create Options Table
CREATE TABLE Options (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    option_text VARCHAR(300) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY (question_id) REFERENCES Questions(question_id) ON DELETE CASCADE
);

-- Insertion of Language Values
INSERT INTO Languages (language_name) VALUES ('English'), ('Spanish'), ('French');

-- Insertion of Category Values
INSERT INTO Categories (language_id, category_name) VALUES
    (1, 'Famous People'),
    (2, 'Personas Famosas'),
    (3, 'Personnes Célèbres');

-- Insertion of Question Values
-- Famous People Category in English
INSERT INTO Questions (category_id, language_id, question_text) VALUES
    (1, 1, 'This legendary boxer was originally named Cassius Clay.');

-- Famous People Category in Spanish
INSERT INTO Questions (category_id, language_id, question_text) VALUES
    (2, 2, 'Este legendario boxeador originalmente se llamaba Cassius Clay.');

-- Famous People Category in French
INSERT INTO Questions (category_id, language_id, question_text) VALUES
    (3, 3, 'Ce boxeur légendaire s’appelait à l’origine Cassius Clay.');

-- Insertion of Option Values
-- Options for English Question
INSERT INTO Options (question_id, option_text, is_correct) VALUES
    (1, 'Joe Frazier', FALSE),
    (1, 'Sugar Ray Leonard', FALSE),
    (1, 'Muhammad Ali', TRUE),
    (1, 'George Foreman', FALSE);

-- Options for Spanish Question
INSERT INTO Options (question_id, option_text, is_correct) VALUES
    (2, 'Joe Frazier', FALSE),
    (2, 'Sugar Ray Leonard', FALSE),
    (2, 'Muhammad Ali', TRUE),
    (2, 'George Foreman', FALSE);

-- Options for French Question
INSERT INTO Options (question_id, option_text, is_correct) VALUES
    (3, 'Joe Frazier', FALSE),
    (3, 'Sugar Ray Leonard', FALSE),
    (3, 'Muhammad Ali', TRUE),
    (3, 'George Foreman', FALSE);
