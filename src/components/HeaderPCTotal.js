import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { eventBus } from '../utils/eventBus';
import { formatPriceWithSymbol } from '../utils/formatPrice';

export const HeaderPCTotal = () => {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const off = eventBus.on('MYPC_TOTAL', (val) => setTotal(Number(val || 0)));
    return () => off();
  }, []);
  return (
    <View style={{ marginRight: 12, flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ color: '#ffffff', fontSize: 13, marginRight: 6 }}>Total:</Text>
      <Text style={{ color: '#34d399', fontSize: 14, fontWeight: 'bold' }}>{formatPriceWithSymbol(total)}</Text>
    </View>
  );
};