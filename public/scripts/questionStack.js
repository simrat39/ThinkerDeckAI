let abort_controller = new AbortController();
let signal = abort_controller.signal;

const questions = JSON.parse(server_questions);
const already_answered = new Map();

let score = 0;
let current_question = 0;
let last_ques = questions.length - 1;

function cleanup_options_listener() {
  abort_controller.abort();

  abort_controller = new AbortController();
  signal = abort_controller.signal;
}

function cleanup_options_classes() {
  for (let i = 0; i < 4; i++) {
    const option_elem = document.getElementById(`o${i}`);
    option_elem.classList.remove("correct");
    option_elem.classList.remove("incorrect");
  }
}

function disable_options() {
  for (let i = 0; i < 4; i++) {
    const option_elem = document.getElementById(`o${i}`);
    option_elem.disabled = true;
  }
}

function enable_options() {
  for (let i = 0; i < 4; i++) {
    const option_elem = document.getElementById(`o${i}`);
    option_elem.disabled = false;
  }
}

function set_score() {
  document.getElementById("score").innerText = `Score: ${score} / ${last_ques + 1}`;
}

function set_question(idx) {
  let was_answered = already_answered.has(idx);

  cleanup_options_classes();

  enable_options();

  const q = questions[idx];

  const img_elem = document.getElementById("img");
  img_elem.src = q.image;

  const title_elem = document.getElementById("title");
  title_elem.innerText = q.question;

  for (let i = 0; i < 4; i++) {
    const option_elem = document.getElementById(`o${i}`);
    option_elem.innerText = q.choices[i];

    if (was_answered) continue;
    option_elem.addEventListener(
      "click",
      (e) => {
        e.preventDefault();

        if (q.choices[i] == q.answer) {
          option_elem.classList.add("correct");
          already_answered.set(idx, [true, i]);
          score++;
        } else {
          option_elem.classList.add("incorrect");
          already_answered.set(idx, [false, i]);
        }

        disable_options();
        set_score();

        // Check if it's the last question and redirect to results page
      if (idx === last_ques) {
        window.location.href = `/quiz-results?score=${score}&total=${last_ques + 1}`;      
      }
      },
      { signal: signal }
    );
  }

  if (was_answered) {
    disable_options();
    let [was_correct, chosen_option] = already_answered.get(idx);
    let cName = was_correct ? "correct" : "incorrect";
    document.getElementById(`o${chosen_option}`).classList.add(cName);

    return;
  }
}

function on_prev(e) {
  if (current_question == 0) {
    document.getElementById("prev").disabled = true;
    document.getElementById("next").disabled = false;
    return;
  }

  document.getElementById("next").disabled = false;
  current_question -= 1;

  cleanup_options_listener();
  set_question(current_question);
}

function on_next(e) {
  if (current_question == last_ques) {
    document.getElementById("next").disabled = true;
    document.getElementById("prev").disabled = false;
    return;
  }

  document.getElementById("prev").disabled = false;
  current_question += 1;

  cleanup_options_listener();
  set_question(current_question);
}

function main() {
  set_score();
  set_question(0);

  document.getElementById("prev").addEventListener("click", on_prev);
  document.getElementById("next").addEventListener("click", on_next);
}

main();
