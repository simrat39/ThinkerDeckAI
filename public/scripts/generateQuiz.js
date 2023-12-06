document.getElementById("submit").addEventListener("click", async (e) => {
  e.preventDefault();

  const subject = document.getElementById("subject").value;
  const num_ques = document.getElementById("num_ques").value;
  const notes = document.getElementById("notes").files[0];

  const fd = new FormData();
  fd.append("subject", subject);
  fd.append("num_ques", num_ques);
  fd.append("notes", notes);

  const ret = await fetch("/get_questions", {
    method: "POST",
    body: fd,
  });

  const retJson = await ret.text();

  console.log(retJson);
  document.write(retJson);

  setTimeout(() => {
    window.document.dispatchEvent(
      new Event("DOMContentLoaded", {
        bubbles: true,
        cancelable: true,
      })
    );
  }, 1000);
});

// document.addEventListener('DOMContentLoaded', () => {
//   document.querySelectorAll('.option').forEach((option) => {
//       option.addEventListener('click', (event) => {
//           console.log('Option clicked:', event.target.textContent);
//       });
//   });
// });
