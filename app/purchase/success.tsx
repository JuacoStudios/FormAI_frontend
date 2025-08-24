import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, Home, RefreshCw } from "lucide-react-native";

export default function PurchaseSuccess() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00e676', '#00c853', '#1de9b6']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          <CheckCircle size={80} color="#ffffff" />
        </View>
        
        <Text style={styles.title}>✅ Payment Completed!</Text>
        <Text style={styles.subtitle}>
          Your subscription will activate shortly. If you don't see PRO yet, pull to refresh on the Account screen.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            onPress={() => router.replace("/")} 
            style={styles.primaryButton}
          >
            <Home size={20} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Go Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/profile")} 
            style={styles.secondaryButton}
          >
            <RefreshCw size={20} color="#00e676" />
            <Text style={styles.secondaryButtonText}>Check Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 16,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 48,
    lineHeight: 24,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  secondaryButtonText: {
    color: "#00e676",
    fontSize: 16,
    fontWeight: "600",
  },
});
