import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITOS_KEY = 'receitas_favoritas';

export const favoritosService = {
  // Obter lista de receitas favoritadas
  async getFavoritos() {
    try {
      const favoritos = await AsyncStorage.getItem(FAVORITOS_KEY);
      return favoritos ? JSON.parse(favoritos) : [];
    } catch (error) {
      console.error('Erro ao obter favoritos:', error);
      return [];
    }
  },

  // Verificar se uma receita está favoritada
  async isFavoritado(receitaId) {
    try {
      const favoritos = await this.getFavoritos();
      return favoritos.includes(receitaId);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  },

  // Adicionar receita aos favoritos
  async adicionarFavorito(receitaId) {
    try {
      const favoritos = await this.getFavoritos();
      
      if (!favoritos.includes(receitaId)) {
        favoritos.push(receitaId);
        await AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return false;
    }
  },

  // Remover receita dos favoritos
  async removerFavorito(receitaId) {
    try {
      const favoritos = await this.getFavoritos();
      const novosFavoritos = favoritos.filter(id => id !== receitaId);
      await AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(novosFavoritos));
      return true;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return false;
    }
  },

  // Toggle favorito (adiciona se não existe, remove se existe)
  async toggleFavorito(receitaId) {
    try {
      const isFav = await this.isFavoritado(receitaId);
      
      if (isFav) {
        await this.removerFavorito(receitaId);
        return false;
      } else {
        await this.adicionarFavorito(receitaId);
        return true;
      }
    } catch (error) {
      console.error('Erro ao fazer toggle de favorito:', error);
      return null;
    }
  },

  // Limpar todos os favoritos
  async limparFavoritos() {
    try {
      await AsyncStorage.removeItem(FAVORITOS_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error);
      return false;
    }
  },
};
