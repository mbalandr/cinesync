import React from 'react';
import {
  TouchableWithoutFeedback,
  Keyboard,
  View,
  ViewProps,
} from 'react-native';

type Props = React.PropsWithChildren<ViewProps>;

export function DismissKeyboardView({ children, style, ...viewProps }: Props) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={style} {...viewProps}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}
