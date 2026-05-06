import { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, StatusBar } from "react-native";
import { Text, Button, ActivityIndicator, Card, Searchbar, SegmentedButtons, Chip, Divider } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";
import { COLORS, SPACING, RADIUS, FONT } from "../theme/theme";

export default function AdminTasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // we draw our own Appbar below
    });
  }, [navigation]);

  const loadToken = async () => {
    const t = await AsyncStorage.getItem("token");
    const uStr = await AsyncStorage.getItem("user");
    if (!t) { navigation.replace("Home"); return; }
    setToken(t);
    if (uStr) {
      const u = JSON.parse(uStr);
      setUserName(u.name || u.email || "Admin");
    }
  };

  useEffect(() => { loadToken(); }, []);

  const fetchTasks = async () => {
    if (!token) return;
    try {
      const res = await API.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTasks(); }, [token]));

  // deleteTask 
  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (e) { console.log(e); }
  };

  //filter logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "completed") return task.status === "completed";
    if (filter === "pending") return task.status === "pending";
    return true;
  });

  const stats = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  //  loading state 
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading tasks…</Text>
      </View>
    );
  }

  // ── task card 
  const TaskCard = ({ item }) => {
    const isPending = item.status === "pending";
    return (
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          {/* Status badge row */}
          <View style={styles.cardHeader}>
            <View style={[styles.badge, isPending ? styles.badgePending : styles.badgeCompleted]}>
              <Text style={[styles.badgeText, { color: isPending ? COLORS.pending : COLORS.completed }]}>
                {isPending ? "⏳ Pending" : "✅ Completed"}
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>

          <Divider style={styles.divider} />

          <View style={styles.assignedRow}>
            <Text style={styles.assignedIcon}>👤</Text>
            <Text style={styles.assignedText}>
              {item.assignedTo?.email || "Unassigned"}
            </Text>
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate("EditTask", { task: item })}
            style={styles.editBtn}
            labelStyle={styles.editBtnLabel}
            icon="pencil-outline"
          >
            Edit
          </Button>
          <Button
            mode="contained"
            onPress={() => deleteTask(item._id)}
            style={styles.deleteBtn}
            labelStyle={styles.deleteBtnLabel}
            buttonColor={COLORS.dangerLight}
            icon="trash-can-outline"
          >
            Delete
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Custom Appbar */}
      <View style={styles.appbar}>
        <View>
          <Text style={styles.appbarWelcome}>Welcome back 👋</Text>
          <Text style={styles.appbarName}>{userName}</Text>
        </View>
        <Button
          mode="outlined"
          onPress={async () => { await AsyncStorage.clear(); navigation.replace("Home"); }}
          style={styles.logoutBtn}
          labelStyle={styles.logoutLabel}
          icon="logout"
          textColor="#fff"
        >
          Logout
        </Button>
      </View>

      {/* ── Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: "Total", value: stats.all, color: COLORS.surface },
          { label: "Pending", value: stats.pending, color: COLORS.pending },
          { label: "Completed", value: stats.completed, color: COLORS.completed },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Body */}
      <View style={styles.body}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate("CreateTask")}
          style={styles.createBtn}
          contentStyle={styles.createBtnContent}
          labelStyle={styles.createBtnLabel}
        >
          Create New Task
        </Button>

        <Searchbar
          placeholder="Search tasks…"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={{ fontSize: 14 }}
        />

        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: "all", label: `All (${stats.all})` },
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Done" },
          ]}
          style={styles.segmented}
        />

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptyBody}>Try a different filter or create a new task.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <TaskCard item={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: SPACING.xxl }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  loadingText: { marginTop: SPACING.sm, color: COLORS.textSecondary, fontSize: 14 },

  /* Appbar */
  appbar: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xl + 4,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appbarWelcome: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: FONT.medium },
  appbarName: { fontSize: 18, color: "#fff", fontWeight: FONT.bold },
  logoutBtn: { borderColor: "rgba(255,255,255,0.5)", borderRadius: RADIUS.full },
  logoutLabel: { fontSize: 13, fontWeight: FONT.semiBold },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingBottom: SPACING.md + 4,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: FONT.bold, color: "#fff" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 },

  /* Body */
  body: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  createBtn: {
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  createBtnContent: { paddingVertical: 4 },
  createBtnLabel: { fontSize: 15, fontWeight: FONT.semiBold },

  searchbar: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    elevation: 1,
  },
  segmented: { marginBottom: SPACING.md },

  /* Task card */
  card: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  cardHeader: { flexDirection: "row", marginBottom: SPACING.sm },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  badgePending: { backgroundColor: COLORS.pendingBg },
  badgeCompleted: { backgroundColor: COLORS.completedBg },
  badgeText: { fontSize: 12, fontWeight: FONT.semiBold },

  cardTitle: { fontSize: 16, fontWeight: FONT.bold, color: COLORS.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  divider: { marginVertical: SPACING.sm },
  assignedRow: { flexDirection: "row", alignItems: "center" },
  assignedIcon: { fontSize: 12, marginRight: 4 },
  assignedText: { fontSize: 12, color: COLORS.textMuted, fontStyle: "italic" },

  cardActions: { justifyContent: "flex-end", paddingHorizontal: SPACING.sm, paddingBottom: SPACING.sm },
  editBtn: { borderRadius: RADIUS.sm, borderColor: COLORS.primary, marginRight: SPACING.xs },
  editBtnLabel: { fontSize: 13, color: COLORS.primary },
  deleteBtn: { borderRadius: RADIUS.sm },
  deleteBtnLabel: { fontSize: 13, color: COLORS.danger },

  /* Empty */
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: SPACING.xxl },
  emptyIcon: { fontSize: 52, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 18, fontWeight: FONT.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  emptyBody: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center", paddingHorizontal: SPACING.lg },
});