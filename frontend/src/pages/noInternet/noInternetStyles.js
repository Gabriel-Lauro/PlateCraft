import { StyleSheet } from 'react-native';

const noInternetStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#CD7F32',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#CD7F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default noInternetStyles;
