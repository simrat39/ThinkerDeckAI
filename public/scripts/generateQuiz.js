document.getElementById("submit").addEventListener("click", async (e) => {
  e.preventDefault();

  document.getElementById("submit").style.display = 'none'
  document.getElementById("loading").style.display = 'block'

  const category = document.getElementById("category").value;
  const title = document.getElementById("title").value;
  const num_ques = document.getElementById("num_ques").value;

  const fd = new FormData();
  fd.append("category", category);
  fd.append("title", title);
  fd.append("num_ques", num_ques);

  const ret = await fetch("/get_questions", {
    method: "POST",
    body: fd,
  });

  const retJson = await ret.text();

  document.write(retJson);

  setTimeout(() => {
    window.document.dispatchEvent(
      new Event("DOMContentLoaded", {
        bubbles: true,
        cancelable: true,
      })
    );
  }, 500);
});