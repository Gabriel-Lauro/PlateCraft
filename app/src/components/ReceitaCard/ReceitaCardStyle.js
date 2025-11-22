import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    margin: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F0F0F0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  favoritoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  receitaNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  receitaTempo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  receitaTempoText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  receitaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receitaNotaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receitaNota: {
    fontSize: 12,
    color: '#CD7F32',
    fontWeight: '600',
    marginLeft: 4,
  },
  receitaAvaliacoes: {
    fontSize: 12,
    color: '#999999',
  },
  dataFavoritado: {
    fontSize: 11,
    color: '#999999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default styles;
