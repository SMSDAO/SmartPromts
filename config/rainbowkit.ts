'use client'

import { darkTheme, type Theme } from '@rainbow-me/rainbowkit'
import merge from 'lodash.merge'

// Custom dark theme matching the SmartPromts cyan/blue/slate palette
export const smartPromtsTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#22d3ee',          // cyan-400
    accentColorForeground: '#020617', // slate-950
    connectButtonBackground: '#1e293b',
    connectButtonInnerBackground: '#0f172a',
    connectButtonText: '#e2e8f0',
    modalBackground: '#0f172a',
    modalBorder: '#1e293b',
    menuItemBackground: '#1e293b',
    profileAction: '#1e293b',
    profileActionHover: '#334155',
    profileForeground: '#0f172a',
    selectedOptionBorder: '#22d3ee',
  },
  radii: {
    actionButton: '8px',
    connectButton: '8px',
    menuButton: '8px',
    modal: '12px',
    modalMobile: '12px',
  },
  fonts: {
    body: 'inherit',
  },
} as Partial<Theme>)
