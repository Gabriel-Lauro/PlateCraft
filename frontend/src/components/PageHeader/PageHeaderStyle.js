import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 38,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#FFF5EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2C',
    letterSpacing: 0.5,
    marginLeft: 12,
  },
});

export default styles;
