import { useEffect, useState } from "react";
import { View, StyleSheet, Image, ScrollView, StatusBar } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SPACING, RADIUS, FONT } from "../theme/theme";

export default function HomeScreen({ navigation }) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");

      if (token && userData) {
        const user = JSON.parse(userData);

        if (user.role === "Admin") {
          navigation.replace("AdminTasks");
        } else {
          navigation.replace("UserTasks");
        }
      } else {
        setChecking(false);
      }
    };

    checkLogin();
  }, []);

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/*Hero gradient band*/}
      <View style={styles.hero}>
        {/* Decorative circles */}
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />

        {/* SVG-free inline illustration using nested views */}
        <View style={styles.illustrationWrap}>
          <View style={styles.illustrationCircle}>
            <Text style={styles.illustrationIcon}>📝</Text>
          </View>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>

        <Text style={styles.heroTitle}>Task Manager</Text>
        <Text style={styles.heroSub}>
          Stay organised. Get things done.
        </Text>
      </View>

      {/* ── CTA card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Get started</Text>
        <Text style={styles.cardBody}>
          Sign in to manage your tasks or create a new account.
        </Text>

        <Button
          mode="contained"
          style={styles.primaryBtn}
          contentStyle={styles.btnContent}
          labelStyle={styles.btnLabel}
          onPress={() => navigation.navigate("Login")}
        >
          Login
        </Button>

        <Button
          mode="outlined"
          style={styles.outlinedBtn}
          contentStyle={styles.btnContent}
          labelStyle={[styles.btnLabel, { color: COLORS.primary }]}
          onPress={() => navigation.navigate("Signup")}
        >
          Create Account
        </Button>
      </View>

      {/* ── Feature chips*/}
      <View style={styles.chips}>
        {["📋 Assign Tasks", "🔍 Search & Filter", "✏️ Admin Controls"].map((t) => (
          <View key={t} style={styles.chip}>
            <Text style={styles.chipText}>{t}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, backgroundColor: COLORS.background },

  /* Hero */
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xxl + 8,
    paddingBottom: SPACING.xl + 8,
    alignItems: "center",
    borderBottomLeftRadius: RADIUS.xl + 8,
    borderBottomRightRadius: RADIUS.xl + 8,
  },
  illustrationWrap: {
    width: 120,
    height: 120,
    marginBottom: SPACING.lg,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationIcon: { fontSize: 44 },
  dot: {
    position: "absolute",
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dot1: { width: 14, height: 14, top: 8, right: 0 },
  dot2: { width: 10, height: 10, bottom: 0, left: 10 },
  dot3: { width: 8, height: 8, top: 30, left: 0 },

  heroTitle: {
    fontSize: 30,
    fontWeight: FONT.bold,
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  heroSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    paddingHorizontal: SPACING.lg,
  },

  /* CTA card */
  card: {
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    elevation: 6,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  cardBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  primaryBtn: {
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  outlinedBtn: {
    borderRadius: RADIUS.md,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: 15, fontWeight: FONT.semiBold, letterSpacing: 0.3 },

  /* Feature chips */
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  chip: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: FONT.semiBold,
  },
});