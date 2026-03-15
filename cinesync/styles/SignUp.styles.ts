// styles/SignUp.styles.ts

import { StyleSheet } from 'react-native';

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
    marginTop: 4,
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
    color: '#E8EDDF',
    marginBottom: 30,
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
  loginButton: {
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
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.9,
  },
  circleTopLeft: {
    backgroundColor: '#DD775C',
    width: 280,
    height: 280,
    top: -80,
    left: -80,
  },
  circleTopRight: {
    backgroundColor: '#8BBCA6',
    width: 130,
    height: 130,
    top: -20,
    right: -40,
  },
  circleMidSmall: {
    backgroundColor: '#F7D491',
    width: 70,
    height: 70,
    top: 100,
    right: 40,
  },
  circleBottomLeft: {
    backgroundColor: '#8BBCA6',
    width: 100,
    height: 100,
    bottom: 160,
    left: -30,
  },
  circleBottomRight: {
    backgroundColor: '#F7D491',
    width: 300,
    height: 300,
    bottom: -60,
    right: -100,
  },
  circleTiny: {
    backgroundColor: '#DD775C',
    width: 40,
    height: 40,
    bottom: 120,
    left: 20,
  },
});