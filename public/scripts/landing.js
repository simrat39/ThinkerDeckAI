document.getElementById("logout")?.addEventListener("click", () => {
  fetch("/logout", { method: "POST" })
    .then(() => {
      location.href = "/";
    })
    .catch(() => {
      console.log("THIS SHOULD NOT HAPPEN");
    });
});

document.getElementById("login")?.addEventListener("click", () => {
  location.href = "/signin";
});

document.getElementById("signup")?.addEventListener("click", () => {
  location.href = "/signup";
});
