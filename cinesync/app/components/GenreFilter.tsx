// src/components/GenreFilter.tsx
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface GenreFilterProps {
  genre: string;
  onGenreChange: (value: string) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ genre, onGenreChange }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Filter by genre..."
        value={genre}
        onChangeText={onGenreChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 0,
    backgroundColor: '#1C1C1E',
    color: '#8E8E93',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});

export default GenreFilter;