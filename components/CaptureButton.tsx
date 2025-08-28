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
    console.debug('[capture] button pressed', { type: e?.type, disabled });
    if (!disabled) {
      onPress();
    }
  };

  if (Platform.OS === 'web') {
    return (
      <button
        type="button"
        aria-label="Capture gym machine"
        data-testid={testID ?? 'capture-btn'}
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          handlePress(e); 
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { 
            e.preventDefault(); 
            handlePress(e); 
          }
        }}
        disabled={disabled}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: 'transparent',
          border: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
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
