import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginTop: 24
  }
})

export function App() {
  return (
    <View style={styles.container}>
      <Text>DEVON</Text>
      <Text>Build apps without gaps!</Text>
    </View>
  )
}
