import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 4,
    marginBottom: 12,
    shadowColor: '#CD7F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  skeletonImageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    overflow: 'hidden',
    backgroundColor: '#F0E6D8',
  },
  skeletonImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E8D5C4',
  },
  skeletonContent: {
    padding: 14,
  },
  skeletonLineContainer: {
    position: 'relative',
    marginBottom: 10,
    overflow: 'hidden',
    borderRadius: 6,
  },
  skeletonLine: {
    backgroundColor: '#E8D5C4',
    borderRadius: 6,
  },
  skeletonTitle: {
    height: 16,
    width: '85%',
  },
  skeletonSubtitle: {
    height: 13,
    width: '65%',
  },
  skeletonText: {
    height: 13,
    width: '75%',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
  },
});

export default styles;
