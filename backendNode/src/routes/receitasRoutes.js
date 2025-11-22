const express = require('express');
const { getDb, runQuery, getQuery, allQuery } = require('../database/dbSetup');
const { jsonResponse } = require('../utils/responses');
const { buscarReceitas } = require('../utils/receitasUtils');
const { tokenRequired } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /receitas
 * Busca receitas por ingredientes (não requer autenticação)
 */
router.get('/receitas', async (req, res) => {
  try {
    const ingredientesParam = (req.query.ingredientes || '').trim();

    if (!ingredientesParam) {
      return jsonResponse(res, { erro: 'Parâmetro "ingredientes" obrigatório' }, 400);
    }

    const ingredientes = ingredientesParam
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    if (ingredientes.length === 0) {
      return jsonResponse(res, { erro: 'Nenhum ingrediente válido' }, 400);
    }

    const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
    const offset = (pagina - 1) * 10;

    const db = await getDb();
    const resultados = await buscarReceitas(db, ingredientes);
    db.close();

    const total = resultados.length;
    const receitasPagina = resultados.slice(offset, offset + 10);

    return jsonResponse(res, {
      sucesso: true,
      ingredientes: ingredientes,
      pagina: pagina,
      total: total,
      mostrando: receitasPagina.length,
      tem_mais: (offset + 10) < total,
      receitas: receitasPagina
    });
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return jsonResponse(res, { erro: 'Erro ao buscar receitas' }, 500);
  }
});

/**
 * GET /receitas/surpresa
 * Sorteia uma receita aleatória do banco de dados
 */
router.get('/receitas/surpresa', async (req, res) => {
  try {
    const db = await getDb();

    // Conta total de receitas
    const totalResult = await getQuery(
      db,
      'SELECT COUNT(*) as total FROM recipes'
    );

    const total = totalResult.total || 0;

    if (total === 0) {
      db.close();
      return jsonResponse(res, { erro: 'Nenhuma receita disponível' }, 404);
    }

    // Sorteia uma receita aleatória
    const receita = await getQuery(
      db,
      `SELECT id, titulo, nota, avaliacoes, autor, 
              tempo_preparo, link, imagem, descricao, informacoes_adicionais
       FROM recipes
       ORDER BY RANDOM()
       LIMIT 1`
    );

    if (!receita) {
      db.close();
      return jsonResponse(res, { erro: 'Erro ao sortear receita' }, 500);
    }

    const recipeId = receita.id;

    // Busca os ingredientes
    const ingredientes = await allQuery(
      db,
      'SELECT item FROM ingredients WHERE recipe_id = ? ORDER BY id',
      [recipeId]
    );

    receita.ingredientes = ingredientes.map(row => row.item);

    // Busca os passos do modo de preparo
    const modoPreparo = await allQuery(
      db,
      'SELECT text FROM recipe_steps WHERE recipe_id = ? ORDER BY position',
      [recipeId]
    );

    receita.modo_preparo = modoPreparo.map(row => row.text);

    db.close();

    return jsonResponse(res, {
      sucesso: true,
      mensagem: 'Receita surpresa! 🎉',
      receita: receita
    });
  } catch (error) {
    console.error('Erro ao sortear receita:', error);
    return jsonResponse(res, { erro: 'Erro ao sortear receita' }, 500);
  }
});

/**
 * GET /receitas/favoritos
 * Lista todas as receitas favoritas do usuário com paginação
 */
router.get('/receitas/favoritos', tokenRequired, async (req, res) => {
  try {
    const userId = req.userId;
    const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
    const offset = (pagina - 1) * 10;

    const db = await getDb();

    // Conta total de favoritos
    const totalResult = await getQuery(
      db,
      'SELECT COUNT(*) as total FROM favoritos WHERE user_id = ?',
      [userId]
    );

    const total = totalResult.total || 0;

    // Busca favoritos com paginação
    const favoritos = await allQuery(
      db,
      `SELECT r.id, r.titulo, r.nota, r.avaliacoes, r.autor,
              r.tempo_preparo, r.link, r.imagem, f.data_favoritado
       FROM favoritos f
       JOIN recipes r ON r.id = f.recipe_id
       WHERE f.user_id = ?
       ORDER BY f.data_favoritado DESC
       LIMIT 10 OFFSET ?`,
      [userId, offset]
    );

    db.close();

    return jsonResponse(res, {
      sucesso: true,
      pagina: pagina,
      total: total,
      mostrando: favoritos.length,
      tem_mais: (offset + 10) < total,
      receitas: favoritos
    });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return jsonResponse(res, { erro: 'Erro ao buscar favoritos' }, 500);
  }
});

/**
 * GET /receitas/:id
 * Retorna os detalhes de uma receita
 */
router.get('/receitas/:id', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const db = await getDb();

    // Busca os dados principais da receita
    const receita = await getQuery(
      db,
      `SELECT id, titulo, nota, avaliacoes, autor, 
              tempo_preparo, link, imagem, descricao, informacoes_adicionais
       FROM recipes
       WHERE id = ?`,
      [recipeId]
    );

    if (!receita) {
      db.close();
      return jsonResponse(res, { erro: 'Receita não encontrada' }, 404);
    }

    // Busca os ingredientes
    const ingredientes = await allQuery(
      db,
      'SELECT item FROM ingredients WHERE recipe_id = ? ORDER BY id',
      [recipeId]
    );

    receita.ingredientes = ingredientes.map(row => row.item);

    // Busca os passos do modo de preparo
    const modoPreparo = await allQuery(
      db,
      'SELECT text FROM recipe_steps WHERE recipe_id = ? ORDER BY position',
      [recipeId]
    );

    receita.modo_preparo = modoPreparo.map(row => row.text);

    db.close();

    return jsonResponse(res, {
      sucesso: true,
      receita: receita
    });
  } catch (error) {
    console.error('Erro ao buscar receita:', error);
    return jsonResponse(res, { erro: 'Erro ao buscar receita' }, 500);
  }
});

/**
 * POST /receitas/:id/favoritar
 * Adiciona ou remove uma receita dos favoritos
 */
router.post('/receitas/:id/favoritar', tokenRequired, async (req, res) => {
  try {
    const userId = req.userId;
    const recipeId = parseInt(req.params.id);
    const db = await getDb();

    // Verifica se a receita existe
    const receita = await getQuery(
      db,
      'SELECT id FROM recipes WHERE id = ?',
      [recipeId]
    );

    if (!receita) {
      db.close();
      return jsonResponse(res, { erro: 'Receita não encontrada' }, 404);
    }

    // Verifica se já está favoritada
    const favorito = await getQuery(
      db,
      'SELECT id FROM favoritos WHERE user_id = ? AND recipe_id = ?',
      [userId, recipeId]
    );

    if (favorito) {
      // Remove dos favoritos
      await runQuery(
        db,
        'DELETE FROM favoritos WHERE user_id = ? AND recipe_id = ?',
        [userId, recipeId]
      );

      db.close();
      return jsonResponse(res, {
        sucesso: true,
        mensagem: 'Receita removida dos favoritos',
        favoritado: false
      });
    } else {
      // Adiciona aos favoritos
      await runQuery(
        db,
        'INSERT INTO favoritos (user_id, recipe_id) VALUES (?, ?)',
        [userId, recipeId]
      );

      db.close();
      return jsonResponse(res, {
        sucesso: true,
        mensagem: 'Receita adicionada aos favoritos',
        favoritado: true
      });
    }
  } catch (error) {
    console.error('Erro ao favoritar:', error);
    return jsonResponse(res, { erro: 'Erro ao favoritar receita' }, 500);
  }
});

/**
 * GET /receitas/favoritos
 * Lista todas as receitas favoritas do usuário com paginação
 */
router.get('/receitas/favoritos', tokenRequired, async (req, res) => {
  try {
    const userId = req.userId;
    const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
    const offset = (pagina - 1) * 10;

    const db = await getDb();

    // Conta total de favoritos
    const totalResult = await getQuery(
      db,
      'SELECT COUNT(*) as total FROM favoritos WHERE user_id = ?',
      [userId]
    );

    const total = totalResult.total || 0;

    // Busca favoritos com paginação
    const favoritos = await allQuery(
      db,
      `SELECT r.id, r.titulo, r.nota, r.avaliacoes, r.autor,
              r.tempo_preparo, r.link, r.imagem, f.data_favoritado
       FROM favoritos f
       JOIN recipes r ON r.id = f.recipe_id
       WHERE f.user_id = ?
       ORDER BY f.data_favoritado DESC
       LIMIT 10 OFFSET ?`,
      [userId, offset]
    );

    db.close();

    return jsonResponse(res, {
      sucesso: true,
      pagina: pagina,
      total: total,
      mostrando: favoritos.length,
      tem_mais: (offset + 10) < total,
      receitas: favoritos
    });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return jsonResponse(res, { erro: 'Erro ao buscar favoritos' }, 500);
  }
});

/**
 * GET /receitas/minhas
 * Lista todas as receitas enviadas pelo usuário com paginação
 */
router.get('/receitas/minhas', tokenRequired, async (req, res) => {
  try {
    const userId = req.userId;
    const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
    const offset = (pagina - 1) * 10;

    const db = await getDb();

    // Conta total de receitas
    const totalResult = await getQuery(
      db,
      'SELECT COUNT(*) as total FROM receitas_usuario WHERE user_id = ?',
      [userId]
    );

    const total = totalResult.total || 0;

    // Busca receitas com paginação
    const receitas = await allQuery(
      db,
      `SELECT id, titulo, descricao, tempo_preparo, imagem, data_criacao
       FROM receitas_usuario
       WHERE user_id = ?
       ORDER BY data_criacao DESC
       LIMIT 10 OFFSET ?`,
      [userId, offset]
    );

    db.close();

    return jsonResponse(res, {
      sucesso: true,
      pagina: pagina,
      total: total,
      mostrando: receitas.length,
      tem_mais: (offset + 10) < total,
      receitas: receitas
    });
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return jsonResponse(res, { erro: 'Erro ao buscar receitas' }, 500);
  }
});

/**
 * POST /receitas
 * Cria uma nova receita do usuário
 */
router.post('/receitas', tokenRequired, async (req, res) => {
  try {
    const userId = req.userId;
    const data = req.body;

    if (!data) {
      return jsonResponse(res, { erro: 'Dados não fornecidos' }, 400);
    }

    const titulo = (data.titulo || '').trim();
    const descricao = (data.descricao || '').trim();
    const tempoPreparo = (data.tempo_preparo || '').trim();
    const ingredientes = data.ingredientes || [];
    const modoPreparo = data.modo_preparo || [];
    const imagem = (data.imagem || '').trim();

    // Validações
    if (!titulo || titulo.length < 3) {
      return jsonResponse(res, { erro: 'Título deve ter pelo menos 3 caracteres' }, 400);
    }

    if (!ingredientes || ingredientes.length < 1) {
      return jsonResponse(res, { erro: 'Adicione pelo menos 1 ingrediente' }, 400);
    }

    if (!modoPreparo || modoPreparo.length < 1) {
      return jsonResponse(res, { erro: 'Adicione pelo menos 1 passo no modo de preparo' }, 400);
    }

    const db = await getDb();

    // Converte arrays para strings
    const ingredientesStr = ingredientes.join('\n');
    const modoPreparoStr = modoPreparo.join('\n');

    const result = await runQuery(
      db,
      `INSERT INTO receitas_usuario 
       (user_id, titulo, descricao, tempo_preparo, ingredientes, modo_preparo, imagem)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, titulo, descricao, tempoPreparo, ingredientesStr, modoPreparoStr, imagem]
    );

    db.close();

    return jsonResponse(
      res,
      {
        sucesso: true,
        mensagem: 'Receita criada com sucesso',
        receita_id: result.id
      },
      201
    );
  } catch (error) {
    console.error('Erro ao criar receita:', error);
    return jsonResponse(res, { erro: 'Erro ao criar receita' }, 500);
  }
});

/**
 * GET /receitas/minhas/:id
 * Retorna os detalhes de uma receita do usuário
 */
router.get('/receitas/minhas/:id', tokenRequired, async (req, res) => {
  try {
    const userId = req.userId;
    const receitaId = parseInt(req.params.id);
    const db = await getDb();

    const receita = await getQuery(
      db,
      `SELECT id, titulo, descricao, tempo_preparo, ingredientes, 
              modo_preparo, imagem, data_criacao
       FROM receitas_usuario
       WHERE id = ? AND user_id = ?`,
      [receitaId, userId]
    );

    db.close();

    if (!receita) {
      return jsonResponse(res, { erro: 'Receita não encontrada' }, 404);
    }

    receita.ingredientes = receita.ingredientes ? receita.ingredientes.split('\n') : [];
    receita.modo_preparo = receita.modo_preparo ? receita.modo_preparo.split('\n') : [];

    return jsonResponse(res, {
      sucesso: true,
      receita: receita
    });
  } catch (error) {
    console.error('Erro ao buscar receita:', error);
    return jsonResponse(res, { erro: 'Erro ao buscar receita' }, 500);
  }
});

/**
 * GET /receitas/surpresa
 * Sorteia uma receita aleatória do banco de dados
 */
router.get('/receitas/surpresa', async (req, res) => {
  try {
    const db = await getDb();

    // Conta total de receitas
    const totalResult = await getQuery(
      db,
      'SELECT COUNT(*) as total FROM recipes'
    );

    const total = totalResult.total || 0;

    if (total === 0) {
      db.close();
      return jsonResponse(res, { erro: 'Nenhuma receita disponível' }, 404);
    }

    // Sorteia uma receita aleatória
    const receita = await getQuery(
      db,
      `SELECT id, titulo, nota, avaliacoes, autor, 
              tempo_preparo, link, imagem, descricao, informacoes_adicionais
       FROM recipes
       ORDER BY RANDOM()
       LIMIT 1`
    );

    if (!receita) {
      db.close();
      return jsonResponse(res, { erro: 'Erro ao sortear receita' }, 500);
    }

    const recipeId = receita.id;

    // Busca os ingredientes
    const ingredientes = await allQuery(
      db,
      'SELECT item FROM ingredients WHERE recipe_id = ? ORDER BY id',
      [recipeId]
    );

    receita.ingredientes = ingredientes.map(row => row.item);

    // Busca os passos do modo de preparo
    const modoPreparo = await allQuery(
      db,
      'SELECT text FROM recipe_steps WHERE recipe_id = ? ORDER BY position',
      [recipeId]
    );

    receita.modo_preparo = modoPreparo.map(row => row.text);

    db.close();

    return jsonResponse(res, {
      sucesso: true,
      mensagem: 'Receita surpresa! 🎉',
      receita: receita
    });
  } catch (error) {
    console.error('Erro ao sortear receita:', error);
    return jsonResponse(res, { erro: 'Erro ao sortear receita' }, 500);
  }
});

module.exports = router;
