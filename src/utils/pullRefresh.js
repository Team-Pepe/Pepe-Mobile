import React, { useState, useCallback } from 'react';
import { RefreshControl } from 'react-native';

export const usePullRefresh = (loader, options = {}) => {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loader();
    } finally {
      setRefreshing(false);
    }
  }, [loader]);
  const control = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={options.tintColor || '#ffffff'}
      colors={options.colors || ['#007AFF']}
    />
  );
  return { refreshing, onRefresh, refreshControl: control };
};