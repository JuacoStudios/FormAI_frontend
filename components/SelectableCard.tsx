export function SelectableCard({ label, selected, onPress }: {
  label: string; selected: boolean; onPress: () => void;
}) {
  return (
    <button
      onClick={onPress}
      className={`w-full p-4 my-2 rounded-2xl text-left transition-all duration-200 ${
        selected 
          ? 'bg-green-500 text-black border-2 border-green-500 shadow-lg shadow-green-500/30' 
          : 'bg-white text-black border border-gray-200 shadow-sm hover:shadow-md'
      }`}
    >
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}
