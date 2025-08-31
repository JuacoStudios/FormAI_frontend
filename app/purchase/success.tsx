import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, Home, RefreshCw } from "lucide-react-native";
import { getIdentity } from "../../src/lib/identity";
import { getSubscriptionStatus } from "../../src/lib/api";
import { USE_PAYMENT_LINKS } from "../../src/lib/payments";

export default function PurchaseSuccess() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Auto-check subscription status when component mounts
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        setLoading(true);
        
        // Skip subscription check when Payment Links are enabled
        if (USE_PAYMENT_LINKS) {
          console.log('[Stripe] Payment Links enabled, skipping subscription status check');
          setIsPremium(false);
          setLoading(false);
          return;
        }
        
        const identity = await getIdentity();
        if (identity.userId) {
          console.log('[Stripe] Checking subscription status for userId:', identity.userId);
          const status = await getSubscriptionStatus(identity.userId);
          console.log('[Stripe] Subscription status received:', status);
          setIsPremium(status.active || false);
        } else {
          console.log('[Stripe] No userId found, cannot check subscription status');
        }
      } catch (error) {
        console.error('[Stripe] Error checking subscription status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSubscriptionStatus();
  }, []);
  
  // Auto-navigate to main screen if premium
  useEffect(() => {
    if (isPremium && !loading) {
      console.log('[Stripe] Subscription confirmed! Navigating to main screen.');
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000); // Navigate after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isPremium, loading, router]);

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
          {isPremium 
            ? "Your subscription is now active! Redirecting to main screen..." 
            : "Your subscription will activate shortly. If you don't see PRO yet, pull to refresh on the Account screen."
          }
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            onPress={() => router.replace("/(tabs)")} 
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
            <Text style={styles.primaryButtonText}>Check Profile</Text>
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
