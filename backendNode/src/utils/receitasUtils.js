/**
 * Normaliza texto removendo acentos e convertendo para minúsculas
 */
function normalizarTexto(texto) {
  if (!texto) return '';
  
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Busca receitas que contenham todos os ingredientes especificados
 */
async function buscarReceitas(db, ingredientes) {
  if (!db || !ingredientes || ingredientes.length === 0) {
    return [];
  }

  try {
    const query = `
      SELECT r.id, r.titulo, r.nota, r.avaliacoes, r.autor, 
             r.tempo_preparo, r.link, r.imagem, GROUP_CONCAT(i.item, '|||') as ings
      FROM recipes r
      LEFT JOIN ingredients i ON i.recipe_id = r.id
      GROUP BY r.id
    `;

    const rows = await new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const searchIngs = ingredientes.map(ing => normalizarTexto(ing.trim()));
    const matches = [];

    for (const row of rows) {
      const allIngs = row.ings || '';

      if (!allIngs) continue;

      const recipeIngs = allIngs.split('|||').map(ing => normalizarTexto(ing));

      // Verifica se todos os ingredientes de busca estão presentes
      const allPresent = searchIngs.every(si => 
        recipeIngs.some(ri => ri.includes(si))
      );

      if (allPresent) {
        matches.push({
          id: row.id,
          titulo: row.titulo,
          nota: row.nota,
          avaliacoes: row.avaliacoes,
          autor: row.autor,
          tempo_preparo: row.tempo_preparo,
          link: row.link,
          imagem: row.imagem
        });
      }
    }

    // Ordena por nota e avaliações
    matches.sort((a, b) => {
      let notaA = 0;
      if (a.nota && a.nota !== 'N/A') {
        try {
          notaA = parseFloat(a.nota);
        } catch (e) {}
      }

      let avalA = 0;
      if (a.avaliacoes && a.avaliacoes !== 'N/A') {
        try {
          avalA = parseInt(a.avaliacoes.replace(' votos', '').replace(' voto', '').trim());
        } catch (e) {}
      }

      let notaB = 0;
      if (b.nota && b.nota !== 'N/A') {
        try {
          notaB = parseFloat(b.nota);
        } catch (e) {}
      }

      let avalB = 0;
      if (b.avaliacoes && b.avaliacoes !== 'N/A') {
        try {
          avalB = parseInt(b.avaliacoes.replace(' votos', '').replace(' voto', '').trim());
        } catch (e) {}
      }

      if (notaB !== notaA) return notaB - notaA;
      return avalB - avalA;
    });

    return matches;
  } catch (error) {
    console.error('Search Error:', error);
    return [];
  }
}

module.exports = {
  normalizarTexto,
  buscarReceitas
};
