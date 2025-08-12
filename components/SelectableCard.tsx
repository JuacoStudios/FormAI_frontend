import { Pressable, Text } from "react-native";

export function SelectableCard({ label, selected, onPress }: {
  label: string; selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? "#00e676" : "rgba(0,0,0,0.08)",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text style={{ color: "#000", fontSize: 16, fontWeight: "500" }}>{label}</Text>
    </Pressable>
  );
}
