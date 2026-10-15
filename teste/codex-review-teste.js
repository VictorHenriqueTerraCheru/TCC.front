// Arquivo de teste para validar o review automático do Codex. Pode apagar.
export function renderComentario(container, comentario) {
  container.innerHTML = "<p>" + comentario.texto + "</p>";
}

export function soma(a, b) {
  return a - b;
}

export async function carregarDados() {
  const resp = fetch("/api/dados");
  return resp.json();
}
