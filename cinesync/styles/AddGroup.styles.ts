// styles/AddGroup.styles.ts

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242423',
    padding: 12,
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  defaultImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#C9A84F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F5CB5C',
    borderRadius: 20,
    padding: 2,
    elevation: 2,
    borderWidth: 3,
    borderColor: '#242423', 
  },
  groupNameInput: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    borderColor: '#444',
    borderWidth: 0,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    paddingVertical: 6,
    marginBottom: 20,
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 12,
    gap: 0,
  },
  settingLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'left',
    paddingRight: 8,
    paddingTop: 2,
  },
  settingInputWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 0,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  
  dropdownText: {
    color: '#F5CB5C',
    fontWeight: '600',
    fontSize: 16,
  },
  
  dropdownMenu: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  menuContent: {
    backgroundColor: '#222',
  },
  menuItem: {
    color: '#FFD700',
  },
  fairnessToggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  deleteButton: {
    marginBottom: 40,
    backgroundColor: '#D64545',
    paddingVertical: 14,
    width: '100%',
    borderRadius: 14,
    alignItems: 'center',
  },

  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  infoModalContent: {
    backgroundColor: '#1E1E1E', 
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5CB5C', 
    marginBottom: 15,
  },
  infoModalText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#F5CB5C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  filterControlGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  infoIconContainer: {
    marginLeft: 8,
    padding: 2,
  },
  header: {
        width: '100%',
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative', 
    },
    backText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#F5CB5C',
    },     
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
