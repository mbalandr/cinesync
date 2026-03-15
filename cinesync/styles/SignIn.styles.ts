// SignIn.styles.ts

import { StyleSheet, Dimensions } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242423',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#E8EDDF',
    fontFamily: 'Georgia',
    textAlign: 'left',
    marginLeft: 6,
  },
  labelEmail: {
    color: '#E8EDDF',
    marginTop: 32,
    marginLeft: 6,
    marginBottom: 4,
    fontWeight: '600',
  },
  inputEmail: {
    borderColor: '#E8EDDF',
    borderWidth: 2,
    borderRadius: 20,
    padding: 14,
    color: '#E8EDDF',
    marginBottom: 20,
  },
  labelPassword: {
    color: '#E8EDDF',
    marginLeft: 6,
    marginBottom: 4,
    fontWeight: '600',
  },
  inputPassword: {
    borderColor: '#E8EDDF',
    borderWidth: 2,
    borderRadius: 20,
    padding: 14,
    color: '#F7EEDB',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#F5CB5C',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  signInText: {
    color: '#242423',
    fontSize: 18,
    fontWeight: '700',
  },
  registerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  greyText: {
    color: '#AAAAAA',
  },
  registerLink: {
    color: '#FFD369',
    fontWeight: '600',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E8EDDF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 20,
  },
  checkboxSelected: {
    backgroundColor: '#F5CB5C',
    borderColor: '#F5CB5C',
  },
  rememberMeText: {
    color: '#E8EDDF',
    fontSize: 16, 
    marginTop: -18,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  
  forgotPasswordText: {
    color: '#F5CB5C',
    fontSize: 16,
    marginTop: -18,
  },
  
});