import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#242423',
    },
    container2: {
        paddingLeft: 15,
        paddingRight: 15
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        height: 50,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#fff'
    },   
    backText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#F5CB5C',
    },     
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F5CB5C'
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#f0c94d',
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
        borderColor: '#242423', 
    },
    usernameInput: {
        fontSize: 28,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 20,
        color: '#fff',
        borderColor: '#444',
        borderWidth: 1,
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        width: '100%',
    },
    bioContainer: {
        marginTop: 20,
        position: 'relative',
    },
    bioInput: {
        borderColor: '#444',
        borderWidth: 1,
        borderRadius: 10,
        color: '#ffffff',
        padding: 15,
        fontSize: 16,
        height: 150,
        textAlignVertical: 'top',
        backgroundColor: '#1e1e1e',
    },
    charCount: {
        position: 'absolute',
        bottom: 8,
        right: 10,
        color: '#888',
        fontSize: 12,
    },
    infoSection: {
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    label: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        flexWrap: 'wrap',
    },
    infoText: {
        color: '#f0c94d',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#eef0e9',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 15,
        marginTop: 30,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    genreItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    genreText: {
        fontSize: 16,
    },
    modalCloseButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    closeButton: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
      },
    genreOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 10,
    },
    modalContent: {
        borderRadius: 12,
        padding: 20,
        maxHeight: '80%',
      },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        resizeMode: 'cover',
    },
    genres: {
        color: '#f0c94d',
        fontSize: 18,
        marginTop: 5,
        fontWeight: 'bold',
        flexWrap: 'wrap',
    },  
    genresContainer: {
        marginTop: 20,
    },
      
       
});

export default styles;
