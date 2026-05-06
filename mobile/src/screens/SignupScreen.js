import { useState } from "react";
import { View, StyleSheet, ScrollView, StatusBar } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import API from "../services/api";
import { COLORS, SPACING, RADIUS, FONT } from "../theme/theme";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── existing signup logic 
  const handleSignup = async () => {
    setError("");

    // Trim values
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // required
    if (!trimmedName || !trimmedEmail || !password) {
      setError("All fields are required");
      return;
    }

    // min length
    if (trimmedName.length < 3) {
      setError("Name must be at least 3 characters");
      return;
    }

    // no gmail.com or special email-like names
    if (trimmedName.includes("@")) {
      setError("Name should not contain email format");
      return;
    }

    // only letters + spaces
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!nameRegex.test(trimmedName)) {
      setError("Name should contain only letters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!role) {
      setError("Please select a role");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/signup", {
        name: trimmedName,
        email: trimmedEmail,
        password,
        role,
      });

      setLoading(false);

      navigation.replace("Login");

    } catch (err) {
      setLoading(false);

      const msg =
        err.response?.data?.msg || err.message;

      console.log(msg);

      if (msg === "User already exists") {
        setError(
          "This email is already registered. Please log in."
        );

        setTimeout(() => {
          navigation.replace("Login");
        }, 2000);

      } else {
        setError(msg || "Signup failed. Please try again.");
      }
    }
  };

  const RoleChip = ({ label, value }) => {
    const active = role === value;
    return (
      <Button
        mode={active ? "contained" : "outlined"}
        onPress={() => setRole(value)}
        style={[styles.roleChip, active && styles.roleChipActive]}
        labelStyle={[styles.roleLabel, active && styles.roleLabelActive]}
        contentStyle={styles.roleContent}
      >
        {label}
      </Button>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Top banner*/}
      <View style={styles.banner}>
        <Text style={styles.bannerIcon}>🚀</Text>
        <Text style={styles.bannerTitle}>Create Account</Text>
        <Text style={styles.bannerSub}>Join Task Manager today</Text>
      </View>

      {/* ── Form card */}
      <View style={styles.card}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️  {error}</Text>
          </View>
        ) : null}

        <TextInput
          label="Full name"
          value={name}
          onChangeText={(t) => { setName(t); setError(""); }}
          mode="outlined"
          left={<TextInput.Icon icon="account-outline" />}
          style={styles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />

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

        {/* Role selector */}
        <Text style={styles.roleHeading}>Select your role</Text>
        <View style={styles.roleRow}>
          <RoleChip label="👤  User" value="User" />
          <RoleChip label="🛡️  Admin" value="Admin" />
        </View>

        <Button
          mode="contained"
          onPress={handleSignup}
          loading={loading}
          disabled={loading}
          style={styles.primaryBtn}
          contentStyle={styles.btnContent}
          labelStyle={styles.btnLabel}
        >
          {loading ? "Creating…" : "Create Account"}
        </Button>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate("Login")}
          style={styles.outlinedBtn}
          contentStyle={styles.btnContent}
          labelStyle={[styles.btnLabel, { color: COLORS.primary }]}
        >
          Back to Login
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

  roleHeading: {
    fontSize: 14,
    fontWeight: FONT.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  roleRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  roleChip: {
    flex: 1,
    borderRadius: RADIUS.md,
    borderColor: COLORS.border,
    borderWidth: 1.5,
  },
  roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleContent: { paddingVertical: 4 },
  roleLabel: { fontSize: 14, color: COLORS.textSecondary },
  roleLabelActive: { color: "#fff", fontWeight: FONT.semiBold },

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
  dividerText: { marginHorizontal: SPACING.sm, fontSize: 13, color: COLORS.textMuted },
});