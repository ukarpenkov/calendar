import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SettingsOverflowMenuPalette = {
  border: string;
  surface: string;
  icon: string;
  title: string;
};

type SettingsOverflowMenuProps = {
  onOpenSettings: () => void;
  palette: SettingsOverflowMenuPalette;
  settingsLabel: string;
};

export function SettingsOverflowMenu({
  onOpenSettings,
  palette,
  settingsLabel,
}: SettingsOverflowMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <View style={styles.menuAnchor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={settingsLabel}
        onPress={() => {
          setIsMenuOpen(currentValue => !currentValue);
        }}
        style={[styles.iconButton, { borderColor: palette.border }]}
      >
        <Text style={[styles.iconButtonText, { color: palette.icon }]}>⋮</Text>
      </Pressable>
      {isMenuOpen ? (
        <>
          <Pressable
            onPress={() => {
              setIsMenuOpen(false);
            }}
            style={styles.menuBackdrop}
          />
          <View
            style={[
              styles.menuSurface,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <Pressable
              accessibilityRole="menuitem"
              onPress={() => {
                setIsMenuOpen(false);
                onOpenSettings();
              }}
              style={styles.menuItem}
            >
              <Text style={[styles.menuItemText, { color: palette.title }]}>
                {settingsLabel}
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  menuAnchor: {
    position: 'relative',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  menuBackdrop: {
    position: 'absolute',
    top: -24,
    right: -16,
    bottom: -1200,
    left: -320,
    zIndex: 1,
  },
  menuSurface: {
    position: 'absolute',
    top: 44,
    right: 0,
    minWidth: 152,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 6,
    zIndex: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  menuItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
