import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242423',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
    height: 50,
    position: 'relative',
  },

  headerSide: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  selectText: {
    color: '#fff',
    fontSize: 16,
  },

  groupContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },

  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },

  groupWrapper: {
    alignItems: 'center',
    marginBottom: 24,
    width: '40%',
  },

  avatarCircleLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8ECEB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  editIcon: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: '#F5CB5C',
      borderRadius: 20,
      padding: 2,
      elevation: 4,
      borderWidth: 3,
      borderColor: '#111', 
  },

  groupLabel: {
    marginTop: 8,
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#2E2E2E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },

  addGroupText: {
    marginTop: 8,
    color: '#ccc',
    fontSize: 14,
    backgroundColor: '#2E2E2E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },

  deleteButton: {
    marginBottom: 20,
    backgroundColor: '#D64545',
    paddingVertical: 12,
    marginHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
  },

  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mail: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#F6C343',
    borderRadius: 30,
    padding: 9,
    zIndex: 5, 
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)'
  },  
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userProfile: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: '#F6C343',
    borderRadius: 30,
    zIndex: 5, 
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)'
  },
});

