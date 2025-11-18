import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateGroupScreen from '../screens/communities/CreateGroupScreen';
import JoinGroupScreen from '../screens/communities/JoinGroupScreen';

jest.mock('@expo/vector-icons', () => ({
  FontAwesome5: () => null,
}));

jest.mock('../services/community.service', () => ({
  __esModule: true,
  default: {
    findByJoinCode: jest.fn(async (code) => (code === 'ABCD1234' ? { id: 1, name: 'Grupo' } : null)),
    createCommunity: jest.fn(async (payload) => ({ id: 2, ...payload })),
    addMember: jest.fn(async () => ({ added: true })),
  },
}));

jest.mock('../services/conversation.service', () => ({
  __esModule: true,
  default: {
    getOrCreateGroupConversationFromCommunity: jest.fn(async () => ({ id: 99 })),
    addMember: jest.fn(async () => ({ added: true })),
  },
}));

jest.mock('../services/chat.service', () => ({
  __esModule: true,
  default: {
    currentUserId: jest.fn(async () => 42),
  },
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(async () => {}),
}));

//

jest.mock('../services/user.service', () => ({
  __esModule: true,
  default: {
    listBasicUsers: jest.fn(async () => []),
  },
}));

describe('CreateGroupScreen', () => {
  test('navega a GroupCreated tras crear', async () => {
    const navigation = { goBack: jest.fn(), replace: jest.fn() };
    const { getByText, getByPlaceholderText } = render(<CreateGroupScreen navigation={navigation} />);
    fireEvent.changeText(getByPlaceholderText('Ej. Ofertas Laptops'), 'Grupo Test');
    fireEvent.changeText(getByPlaceholderText('Cuenta de qué trata el grupo'), 'Descripción válida para el grupo');
    fireEvent.press(getByText('Crear'));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalled());
    expect(navigation.replace.mock.calls[0][0]).toBe('GroupCreated');
    expect(navigation.replace.mock.calls[0][1]).toEqual(expect.objectContaining({
      community: expect.objectContaining({ name: 'Grupo Test' }),
    }));
  });
});

describe('JoinGroupScreen', () => {
  test('rejects invalid code and accepts valid code', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<JoinGroupScreen navigation={{ goBack: jest.fn() }} />);
    fireEvent.changeText(getByPlaceholderText('Ej. AB12-CD34'), 'BADCODE');
    fireEvent.press(getByText('Unirse'));
    await waitFor(() => expect(queryByText('Formato inválido. Usa 4 letras + 4 números')).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText('Ej. AB12-CD34'), 'ABCD1234');
    fireEvent.press(getByText('Unirse'));
    await waitFor(() => expect(queryByText('Te has unido correctamente')).toBeTruthy());
  });
});