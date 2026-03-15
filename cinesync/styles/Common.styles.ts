// styles/Common.styles.ts

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242423',
    padding: 20,
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

  //EDIT ICON
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
});
