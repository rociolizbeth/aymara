// Menú móvil de la barra de navegación: abre/cierra el menú en pantallas angostas.
document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!boton || !menu) return;

  boton.addEventListener("click", () => {
    const abierto = !menu.classList.contains("hidden");
    menu.classList.toggle("hidden");
    boton.setAttribute("aria-expanded", String(!abierto));
  });

  // Cierra el menú si el usuario toca un enlace (mejor sensación de app)
  menu.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => menu.classList.add("hidden"));
  });
});
