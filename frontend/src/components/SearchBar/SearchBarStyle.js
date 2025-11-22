import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    marginBottom: 28,
  },
  pinsContainer: {
    marginBottom: 12,
  },
  pinsContent: {
    paddingHorizontal: 0,
    gap: 8,
  },
  pin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CD7F32',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  pinText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  pinCloseButton: {
    padding: 4,
  },
  searchWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333333',
    fontWeight: '400',
    paddingHorizontal: 12,
  },
  searchButton: {
    backgroundColor: '#CD7F32',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 240,
    zIndex: 1000,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '400',
  },
});

export default styles;
