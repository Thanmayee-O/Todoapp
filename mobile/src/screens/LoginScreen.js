import { useState } from "react";
import { View, StyleSheet, ScrollView, StatusBar } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import API from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SPACING, RADIUS, FONT } from "../theme/theme";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── existing login logic
  const handleLogin = async () => {
    setError("");

    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("DATA:", res.data);

      if (!res.data || !res.data.token) {
        setError("Invalid server response");
        return;
      }

      const { token, user } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));


      if (user.role === "Admin") {
        navigation.replace("AdminTasks");
      } else {
        navigation.replace("UserTasks");
      }

    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);

      const msg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        err.message;

      if (msg === "User not found") {
        setError("No account found. Please sign up first.");
      } else {
        setError(msg || "Login failed. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Top banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerIcon}>🔐</Text>
        <Text style={styles.bannerTitle}>Welcome back</Text>
        <Text style={styles.bannerSub}>Sign in to your account</Text>
      </View>

      {/* ── Form card */}
      <View style={styles.card}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <TextInput
          label="Email address"
          value={email}
          onChangeText={(t) => { setEmail(t); setError(""); }}
          mode="outlined"
          left={<TextInput.Icon icon="email-outline" />}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={(t) => { setPassword(t); setError(""); }}
          mode="outlined"
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={showPass ? "eye-off" : "eye"}
              onPress={() => setShowPass((p) => !p)}
            />
          }
          secureTextEntry={!showPass}
          style={styles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.primaryBtn}
          contentStyle={styles.btnContent}
          labelStyle={styles.btnLabel}
        >
          {loading ? "Signing in…" : "Login"}
        </Button>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate("Signup")}
          style={styles.outlinedBtn}
          contentStyle={styles.btnContent}
          labelStyle={[styles.btnLabel, { color: COLORS.primary }]}
        >
          Create Account
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: COLORS.background },

  banner: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    alignItems: "center",
    borderBottomLeftRadius: RADIUS.xl + 8,
    borderBottomRightRadius: RADIUS.xl + 8,
  },
  bannerIcon: { fontSize: 40, marginBottom: SPACING.sm },
  bannerTitle: { fontSize: 26, fontWeight: FONT.bold, color: "#fff", marginBottom: SPACING.xs },
  bannerSub: { fontSize: 14, color: "rgba(255,255,255,0.8)" },

  card: {
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    marginBottom: SPACING.lg,
  },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: RADIUS.sm,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  errorText: { color: COLORS.danger, fontSize: 13 },

  input: { marginBottom: SPACING.md, backgroundColor: COLORS.surface },
  primaryBtn: { borderRadius: RADIUS.md, backgroundColor: COLORS.primary, marginTop: SPACING.sm },
  outlinedBtn: { borderRadius: RADIUS.md, borderColor: COLORS.primary, borderWidth: 1.5 },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: 15, fontWeight: FONT.semiBold, letterSpacing: 0.3 },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    marginHorizontal: SPACING.sm,
    fontSize: 13,
    color: COLORS.textMuted,
  },
});