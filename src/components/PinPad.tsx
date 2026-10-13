import { useState, useCallback } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { Colors, Spacing } from '@/constants/theme'

const colors = Colors.dark

interface PinPadProps {
  title: string
  subtitle?: string
  onSubmit: (pin: string) => void
  error?: string
  maxLength?: number
}

export default function PinPad({ title, subtitle, onSubmit, error, maxLength = 4 }: PinPadProps) {
  const [pin, setPin] = useState('')

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length < maxLength) {
        const next = pin + digit
        setPin(next)
        if (next.length === maxLength) {
          setPin('')
          onSubmit(next)
        }
      }
    },
    [pin, maxLength, onSubmit]
  )

  const handleBackspace = useCallback(() => {
    setPin((p) => p.slice(0, -1))
  }, [])

  const handleClear = useCallback(() => {
    setPin('')
  }, [])

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '<']

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      ) : null}

      <View style={styles.dotsRow}>
        {Array.from({ length: maxLength }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i < pin.length ? colors.text : colors.backgroundElement,
                borderColor: colors.backgroundElement,
              },
            ]}
          />
        ))}
      </View>

      {error ? <Text style={[styles.error, { color: '#FF453A' }]}>{error}</Text> : null}

      <View style={styles.pad}>
        {digits.map((d) => (
          <Pressable
            key={d}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? colors.backgroundSelected : colors.backgroundElement },
            ]}
            onPress={() => {
              if (d === 'C') handleClear()
              else if (d === '<') handleBackspace()
              else handleDigit(d)
            }}
            accessibilityLabel={d === '<' ? 'Backspace' : d === 'C' ? 'Clear' : d}>
            {d === '<' ? (
              <SymbolView
                name={{ ios: 'delete.left', android: 'backspace', web: 'backspace' }}
                size={24}
                tintColor={colors.text}
              />
            ) : (
              <Text style={[styles.buttonText, { color: colors.text }]}>{d}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.four,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  error: {
    fontSize: 14,
    marginBottom: Spacing.three,
    fontWeight: '600',
  },
  pad: {
    width: 280,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
  },
})
