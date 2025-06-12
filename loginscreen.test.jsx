import { render } from '@testing-library/react-native';

import LoginScreen, { CustomText } from './loginscreen';

describe('<LoginScreen />', () => {
  test('Text renders correctly on HomeScreen', () => {
    const { getByText } = render(<LoginScreen />);

    getByText('ADMIN');
  });
});

describe('<LoginScreen />', () => {
  test('Text renders correctly on HomeScreen', () => {
    const { getByText } = render(<LoginScreen />);

    getByText('NOME');
  });
});
