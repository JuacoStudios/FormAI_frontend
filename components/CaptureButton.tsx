import React from 'react';
import { Platform, Pressable, TouchableOpacity } from 'react-native';
import { Camera as CameraIcon } from 'lucide-react-native';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  style?: any;
  children?: React.ReactNode;
};

export function CaptureButton({ onPress, disabled, testID, style, children }: Props) {
  const handlePress = (e?: any) => {
    console.debug('[capture] button pressed', { 
      type: e?.type, 
      disabled, 
      platform: Platform.OS,
      timestamp: Date.now()
    });
    if (!disabled) {
      onPress();
    } else {
      console.debug('[capture] button blocked', { 
        disabled, 
        reason: 'Button is disabled'
      });
    }
  };

  if (Platform.OS === 'web') {
    // Fix: Safe style handling - no indexed access, no unsafe spreads
    const webStyles: React.CSSProperties = {
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: 'transparent',
      border: 0,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      // Safe style merging
      ...(style && typeof style === 'object' && !Array.isArray(style) ? style : {})
    };

    return (
      <button
        type="button"
        aria-label="Capture gym machine"
        data-testid={testID ?? 'capture-btn'}
        onClick={(e) => { 
          console.debug('[capture] web onClick', { type: e.type, disabled });
          e.preventDefault(); 
          e.stopPropagation(); 
          handlePress(e); 
        }}
        onMouseDown={(e) => {
          console.debug('[capture] web onMouseDown', { type: e.type, disabled });
          if (!disabled) {
            e.preventDefault();
            handlePress(e);
          }
        }}
        onTouchStart={(e) => {
          console.debug('[capture] web onTouchStart', { type: e.type, disabled });
          if (!disabled) {
            e.preventDefault();
            handlePress(e);
          }
        }}
        onKeyDown={(e) => {
          console.debug('[capture] web onKeyDown', { key: e.key, disabled });
          if (e.key === 'Enter' || e.key === ' ') { 
            e.preventDefault(); 
            handlePress(e); 
          }
        }}
        // Fix: Add pointer events for robust event handling
        onPointerDown={(e) => {
          console.debug('[capture] web onPointerDown', { type: e.type, disabled });
          if (!disabled) {
            e.preventDefault();
            handlePress(e);
          }
        }}
        disabled={disabled}
        style={webStyles}
      >
        {children || <CameraIcon color="white" size={32} />}
      </button>
    );
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={handlePress}
      disabled={disabled}
      testID={testID ?? 'capture-btn'}
      style={style}
      activeOpacity={0.7}
    >
      {children || <CameraIcon color="white" size={32} />}
    </TouchableOpacity>
  );
}
